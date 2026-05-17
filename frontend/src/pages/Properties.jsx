import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Search, Filter, MapPin, Zap, ArrowRight, Loader2, Clock, ShieldCheck, TrendingUp, Info } from 'lucide-react';
import propertyService from '../services/propertyService';
import { Loader } from '../components/ui/Loader';
import { Link } from 'react-router-dom';

const IPOCenter = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');

  const fetchIPOs = async () => {
    try {
      setLoading(true);
      const data = await propertyService.getProperties('active');
      const approvedIPOs = data.filter(p => p.ipo_status === 'active' || p.ipo_status === 'upcoming');
      setProperties(approvedIPOs);
    } catch (error) {
      console.error("Failed to fetch IPO listings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIPOs();
  }, []);

  const categories = ['ALL', 'RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL'];

  if (loading) {
     return (
       <div className="h-screen bg-background flex items-center justify-center">
          <Loader size={48} text="Synchronizing Asset Node..." />
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-10 pb-20 px-6 md:px-12 font-sans selection:bg-accent-gold/20 selection:text-foreground">
      <header className="mb-16 space-y-8 border-b border-border pb-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 md:gap-12">
           <div className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-3">
                 <Zap size={14} className="text-accent-orange animate-pulse" />
                 <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-foreground/30">Primary Market</p>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-heading font-black tracking-[-0.05em] uppercase leading-[0.9]">
                IPO <br className="hidden md:block" /> <span className="text-foreground/10">Center</span>
              </h1>
              <p className="text-sm md:text-lg text-foreground/40 max-w-2xl leading-relaxed mt-4">
                Direct access to institutional-grade primary offerings. Verified real estate assets undergoing initial capital deployment.
              </p>
           </div>
           
           <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-6 py-3 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] transition-all rounded-none font-heading border ${activeFilter === cat ? 'bg-foreground/[0.05] text-foreground border-foreground' : 'bg-transparent text-foreground/40 border-border hover:border-accent-orange/50 hover:text-foreground'}`}
                >
                  {cat}
                </button>
              ))}
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {properties.length > 0 ? (
          properties.map((property, i) => (
            <motion.div 
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group flex flex-col bg-background border border-border hover:border-foreground transition-all duration-400 cursor-pointer rounded-none"
              onClick={() => window.location.href = `/properties/${property.id}`}
            >
               <div className="relative aspect-[16/10] overflow-hidden border-b border-border">
                  <img 
                    src={property.images?.[0] || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80'} 
                    alt={property.title} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                  <div className="absolute top-4 right-4 bg-background px-3 py-1.5 text-[12px] font-bold uppercase tracking-[0.1em] border border-border flex items-center gap-2 font-heading shadow-[4px_4px_0px_var(--color-border)]">
                     <span className={`w-2 h-2 rounded-none ${property.ipo_status === 'active' ? 'bg-accent-orange' : 'bg-accent-orange'}`} />
                     {property.ipo_status === 'active' ? 'Live IPO' : 'Upcoming'}
                  </div>
               </div>
               
               <div className="p-6 flex-1 flex flex-col justify-between space-y-8">
                  <div className="space-y-4">
                     <div>
                        <h3 className="text-xl font-bold tracking-tight mb-2 group-hover:text-accent-orange transition-colors font-heading uppercase">{property.title}</h3>
                        <p className="text-[12px] text-foreground/60 font-medium flex items-center gap-2">
                          <MapPin size={12} /> {property.location?.city}, {property.location?.state}
                        </p>
                     </div>
                     
                     <div className="space-y-3 pt-4">
                        <div className="flex justify-between items-end">
                           <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-foreground font-heading">Deployment</p>
                           <p className="text-[14px] font-bold text-accent-gold font-heading">{Math.round((property.financial?.funding_raised / property.financial?.total_budget) * 100)}%</p>
                        </div>
                        <div className="h-2 bg-foreground/[0.05] border border-border overflow-hidden rounded-none">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${(property.financial?.funding_raised / property.financial?.total_budget) * 100}%` }}
                             className="h-full bg-accent-orange border-r border-border"
                           />
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-0 pt-6 border-t border-border">
                     <div className="border-r border-border pr-6">
                        <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-foreground/60 mb-2 font-heading">Target</p>
                        <p className="text-lg font-bold font-heading">₹{(property.financial?.total_budget / 10000000).toFixed(1)}Cr</p>
                     </div>
                     <div className="pl-6">
                        <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-foreground/60 mb-2 font-heading">Entry</p>
                        <p className="text-lg font-bold text-accent-gold font-heading">₹{property.financial?.ipo_price}</p>
                     </div>
                  </div>

                  <div className="pt-6">
                     <button className={`w-full py-4 text-[12px] font-bold uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-3 group/btn rounded-none font-heading border ${property.ipo_status === 'active' ? 'bg-accent-orange text-foreground border-accent-orange border-b-[3px] border-b-accent-orange/70 hover:bg-accent-orange/80 hover:border-b-accent-orange/50' : 'bg-foreground/[0.05] text-foreground border-foreground border-b-[3px] hover:bg-foreground/[0.1]'}`}>
                        {property.ipo_status === 'active' ? 'Invest in Node' : 'View Details'} <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                     </button>
                  </div>
               </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-32 border border-border bg-background flex flex-col items-center justify-center gap-6 text-center px-6 rounded-none">
             <div className="w-16 h-16 bg-foreground/[0.02] border border-border flex items-center justify-center rounded-none shadow-[4px_4px_0px_var(--color-border)]">
                <Info size={24} className="text-foreground" />
             </div>
             <div className="space-y-2">
                <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-foreground font-heading">No Active IPO Listings</p>
                <p className="text-sm text-foreground/60 max-w-sm">There are currently no primary market offerings undergoing capital deployment.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IPOCenter;
