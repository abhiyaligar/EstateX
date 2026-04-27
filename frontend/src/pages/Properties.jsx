import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Search, Filter, MapPin, Zap, ArrowRight, Loader2, Clock, ShieldCheck, TrendingUp, Info } from 'lucide-react';
import propertyService from '../services/propertyService';
import { Loader } from '../components/ui/Loader';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const IPOCenter = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');

  const fetchIPOs = async () => {
    try {
      setLoading(true);
      // Fetch all projects and filter for 'approved' IPO status
      const data = await propertyService.getProperties('active');
      const approvedIPOs = data.filter(p => p.ipo_status === 'approved' || p.ipo_status === 'upcoming');
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
       <div className="h-screen bg-[#0a0a0a] flex items-center justify-center">
          <Loader size={48} text="Synchronizing Asset Node..." />
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-10 pb-20 px-6 md:px-12">
      <header className="mb-20 space-y-8 border-b border-white/5 pb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
           <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <Zap size={14} className="text-[#D4AF37]" />
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Primary Market</p>
              </div>
              <h1 className="text-4xl md:text-7xl font-bold tracking-tighter uppercase leading-none">
                IPO <span className="text-[#D4AF37]">Center</span>
              </h1>
              <p className="text-sm md:text-lg text-zinc-500 max-w-2xl leading-relaxed">
                Direct access to institutional-grade primary offerings. Verified real estate assets undergoing initial capital deployment.
              </p>
           </div>
           
           <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pb-2">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`text-[9px] font-black uppercase tracking-[0.3em] transition-all pb-2 border-b-2 ${activeFilter === cat ? 'text-[#D4AF37] border-[#D4AF37]' : 'text-zinc-700 border-transparent hover:text-zinc-400'}`}
                >
                  {cat}
                </button>
              ))}
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {properties.length > 0 ? (
          properties.map((property, i) => (
            <motion.div 
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group flex flex-col bg-white/[0.01] border border-white/5 hover:border-[#D4AF37]/30 transition-all duration-500"
            >
               <div className="relative aspect-[16/10] overflow-hidden">
                  <img 
                    src={property.images?.[0] || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80'} 
                    alt={property.title} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                  />
                  <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1.5 text-[8px] font-black uppercase tracking-widest border border-white/10 flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                     {property.ipo_status}
                  </div>
               </div>
               
               <div className="p-8 flex-1 flex flex-col justify-between space-y-8">
                  <div className="space-y-4">
                     <div>
                        <h3 className="text-xl font-bold tracking-tight mb-2 group-hover:text-[#D4AF37] transition-colors">{property.title}</h3>
                        <p className="text-[10px] text-zinc-500 font-medium flex items-center gap-2">
                          <MapPin size={10} /> {property.location?.city}, {property.location?.state}
                        </p>
                     </div>
                     
                     <div className="space-y-3">
                        <div className="flex justify-between items-end">
                           <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Deployment Progress</p>
                           <p className="text-[10px] font-bold text-[#D4AF37]">{Math.round((property.financial?.funding_raised / property.financial?.total_budget) * 100)}%</p>
                        </div>
                        <div className="h-1 bg-white/5 overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${(property.financial?.funding_raised / property.financial?.total_budget) * 100}%` }}
                             className="h-full bg-[#D4AF37]"
                           />
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/5">
                     <div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-1">Target Capital</p>
                        <p className="text-sm font-bold">₹{(property.financial?.total_budget / 10000000).toFixed(1)}Cr</p>
                     </div>
                     <div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-1">Entry Value</p>
                        <p className="text-sm font-bold text-[#D4AF37]">₹{property.financial?.ipo_price}/Brick</p>
                     </div>
                  </div>

                  <Link to={`/properties/${property.id}`} className="block">
                     <button className="w-full bg-white text-black py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#D4AF37] transition-all flex items-center justify-center gap-3 group/btn">
                        Invest in Node <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                     </button>
                  </Link>
               </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-40 border border-white/5 bg-white/[0.01] flex flex-col items-center justify-center gap-6 text-center px-6">
             <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <Info size={24} className="text-zinc-700" />
             </div>
             <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">No Active IPO Listings Identified</p>
                <p className="text-xs text-zinc-500 max-w-sm">There are currently no primary market offerings undergoing capital deployment.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IPOCenter;
