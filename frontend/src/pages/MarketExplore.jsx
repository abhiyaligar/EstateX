import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, TrendingUp, MapPin, ArrowLeft, MoreHorizontal, ChevronRight,
  LayoutGrid, List as ListIcon, ChevronLeft, X, Loader2, Zap, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, YAxis, AreaChart, Area } from 'recharts';
import { Button } from '../components/ui/Button';
import propertyService from '../services/propertyService';
import { Loader } from '../components/ui/Loader';

const Sparkline = ({ data, color = "#D4AF37", height = 32 }) => (
  <div className={`w-full`} style={{ height: `${height}px` }}>
    <ResponsiveContainer width="99%" height="99%" minWidth={1} minHeight={1}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.2}/>
            <stop offset="95%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Area 
          type="monotone" 
          dataKey="pv" 
          stroke={color} 
          strokeWidth={1.5} 
          fill={`url(#grad-${color})`}
          dot={false} 
          isAnimationActive={false}
        />
        <YAxis hide domain={['auto', 'auto']} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

const MarketExplore = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL ASSETS');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const generateMockSparkline = () => Array.from({ length: 15 }, (_, i) => ({
    name: i,
    pv: Math.floor(Math.random() * 100) + 50
  }));

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await propertyService.getProperties('active');
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const tabs = ['ALL ASSETS', 'RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'HIGH YIELD'];

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesTab = activeTab === 'ALL ASSETS' || 
                        project.property_type?.toUpperCase() === activeTab ||
                        (activeTab === 'HIGH YIELD' && (project.macro_analytics?.avg_rental_yield || 0) > 8);

      const query = searchQuery.toLowerCase();
      const matchesSearch = project.title?.toLowerCase().includes(query) ||
                           project.location?.city?.toLowerCase().includes(query) ||
                           project.location?.state?.toLowerCase().includes(query);

      return matchesTab && matchesSearch;
    });
  }, [projects, activeTab, searchQuery]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  if (loading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
         <Loader size={48} text="Synchronizing Market Nodes..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-surface/30 pb-20 px-6 md:px-12 pt-10">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Institutional Header Section */}
        <header className="mb-16 space-y-10 border-b border-black/5 dark:border-white/5 pb-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <TrendingUp size={14} className="text-[#D4AF37]" />
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Secondary Market</p>
                </div>
                <h1 className="text-4xl md:text-7xl font-bold tracking-tighter uppercase leading-none">
                  Global <span className="text-[#D4AF37]">Explore</span>
                </h1>
                <p className="text-sm md:text-lg text-zinc-600 dark:text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
                  Real-time auditing of verified real estate assets across global nodes. Transparent ledger tracking for secondary market liquidity.
                </p>
             </div>

             <div className="flex flex-col sm:flex-row items-center gap-8">
                {/* Search Node */}
                <div className="relative group w-full sm:w-[300px]">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-[#D4AF37] transition-colors" size={16} />
                   <input 
                     type="text"
                     placeholder="SEARCH NODES..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full bg-black/[0.04] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 py-3.5 pl-12 pr-4 text-[10px] font-black tracking-widest uppercase focus:outline-none focus:border-[#D4AF37]/50 transition-all placeholder:text-zinc-800 dark:text-zinc-200"
                   />
                </div>
             </div>
          </div>

          <div className="flex gap-8 overflow-x-auto no-scrollbar pb-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-[9px] font-black uppercase tracking-[0.3em] transition-all pb-2 border-b-2 whitespace-nowrap ${
                  activeTab === tab 
                  ? 'text-[#D4AF37] border-[#D4AF37]' 
                  : 'text-zinc-700 border-transparent hover:text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </header>

        {/* Asset List Header */}
        <div className="hidden lg:grid grid-cols-12 px-6 py-4 text-[9px] uppercase tracking-[0.3em] font-black text-zinc-700 mb-4 border-y border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.01]">
          <div className="col-span-5">Sovereign Asset Node</div>
          <div className="col-span-2 text-right">Market Value</div>
          <div className="col-span-1 text-right">Delta</div>
          <div className="col-span-2 px-10">Performance</div>
          <div className="col-span-2 text-right">Audit</div>
        </div>

        {/* Asset List */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {currentProjects.length > 0 ? (
              <motion.div 
                key={currentPage + activeTab + searchQuery}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {currentProjects.map((asset, i) => (
                  <motion.div 
                    key={asset.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => navigate(`/trade?assetId=${asset.id}`)}
                    className="flex flex-col lg:grid lg:grid-cols-12 items-center px-6 py-6 bg-black/[0.02] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 hover:border-[#D4AF37]/30 transition-all cursor-pointer group gap-6 lg:gap-0"
                  >
                    {/* Asset Identity */}
                    <div className="lg:col-span-5 flex items-center gap-6 w-full min-w-0">
                      <div className="w-14 h-14 rounded-none overflow-hidden border border-black/10 dark:border-white/10 shrink-0 bg-surface">
                        <img 
                          src={asset.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=100'} 
                          alt={asset.title} 
                          className="w-full h-full object-cover transition-all duration-700" 
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-lg font-bold text-foreground group-hover:text-[#D4AF37] transition-colors truncate uppercase tracking-tight">{asset.title}</h4>
                        <div className="text-[10px] text-zinc-600 truncate uppercase tracking-widest font-black mt-1 flex items-center gap-2">
                           <MapPin size={10} className="text-zinc-800 dark:text-zinc-200" />
                           {asset.location?.city || 'Prime Cluster'}, {asset.location?.state}
                        </div>
                      </div>
                    </div>
                    
                    {/* Price Node */}
                    <div className="lg:col-span-2 w-full lg:text-right border-t lg:border-0 border-black/5 dark:border-white/5 pt-4 lg:pt-0">
                       <p className="lg:hidden text-[8px] font-black text-zinc-700 uppercase tracking-widest mb-1">Market Value</p>
                       <p className="text-xl font-bold text-foreground font-mono tracking-tighter">
                         ₹{(asset.financial?.market_value || asset.financial?.ipo_price || 0).toLocaleString()}
                       </p>
                    </div>

                    {/* Delta Node */}
                    <div className="lg:col-span-1 w-full lg:text-right">
                       <p className="lg:hidden text-[8px] font-black text-zinc-700 uppercase tracking-widest mb-1">24H Delta</p>
                       <div className="flex items-center lg:justify-end gap-1 text-[10px] font-black text-green-500">
                          <ArrowUpRight size={12} />
                          <span>+1.24%</span>
                       </div>
                    </div>

                    {/* Sparkline Node */}
                    <div className="lg:col-span-2 w-full px-4 lg:px-10 opacity-30 group-hover:opacity-100 transition-opacity">
                       <Sparkline data={generateMockSparkline()} height={24} />
                    </div>

                    {/* Action Node */}
                    <div className="lg:col-span-2 w-full lg:text-right border-t lg:border-0 border-black/5 dark:border-white/5 pt-4 lg:pt-0">
                       <button className="w-full lg:w-auto px-6 py-2 bg-white text-black text-[9px] font-black uppercase tracking-[0.2em] hover:bg-surface transition-all">
                          Audit Node
                       </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-40 border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.01]">
                <p className="text-zinc-800 dark:text-zinc-200 text-[10px] uppercase font-black tracking-[0.4em]">Sovereign Node empty // No relational data</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Pagination Controls */}
        {!loading && filteredProjects.length > itemsPerPage && (
          <div className="mt-12 flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-10">
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-700">
              SEQUENCE {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredProjects.length)} OF {filteredProjects.length}
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center border border-black/5 dark:border-white/5 text-zinc-700 hover:text-foreground disabled:opacity-10 transition-all hover:border-black/20 dark:border-white/20"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="w-10 h-10 flex items-center justify-center border border-black/5 dark:border-white/5 text-zinc-700 hover:text-foreground disabled:opacity-10 transition-all hover:border-black/20 dark:border-white/20"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MarketExplore;
