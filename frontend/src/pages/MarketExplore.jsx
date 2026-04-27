import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, TrendingUp, MapPin, ArrowLeft, MoreHorizontal, ChevronRight,
  LayoutGrid, List as ListIcon, ChevronLeft, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { Button } from '../components/ui/Button';
import { propertyService } from '../services/propertyService';

const Sparkline = ({ data, color = "#10b981", height = 32 }) => (
  <div className={`w-full`} style={{ height: `${height}px` }}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line 
          type="monotone" 
          dataKey="pv" 
          stroke={color} 
          strokeWidth={1.5} 
          dot={false} 
          isAnimationActive={false}
        />
        <YAxis hide domain={['auto', 'auto']} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const MarketExplore = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All assets');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock data for sparklines
  const generateMockSparkline = () => Array.from({ length: 10 }, (_, i) => ({
    name: i,
    pv: Math.floor(Math.random() * 100) + 50
  }));

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await propertyService.getProperties();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const tabs = ['All assets', 'Residential', 'Commercial', 'Land', 'High Yield'];

  // Filtering Logic
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      // Tab Filtering
      const matchesTab = activeTab === 'All assets' || 
                        project.property_type?.toLowerCase() === activeTab.toLowerCase() ||
                        (activeTab === 'High Yield' && project.macro_analytics?.avg_rental_yield > 8);

      // Search Filtering
      const query = searchQuery.toLowerCase();
      const matchesSearch = project.title?.toLowerCase().includes(query) ||
                           project.location?.city?.toLowerCase().includes(query) ||
                           project.location?.state?.toLowerCase().includes(query);

      return matchesTab && matchesSearch;
    });
  }, [projects, activeTab, searchQuery]);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const topMovers = [
    { name: 'DXB-SKY', sub: 'Skyline Residences', price: '₹1.42', change: '+12.5%', data: generateMockSparkline(), color: '#10b981' },
    { name: 'NYC-VIL', sub: 'Ocean Front Villa', price: '₹2.15', change: '-3.24%', data: generateMockSparkline(), color: '#ef4444' },
    { name: 'LDN-OAK', sub: 'Oak Gardens', price: '₹0.89', change: '+5.7%', data: generateMockSparkline(), color: '#10b981' },
    { name: 'SIN-TOW', sub: 'Singapore Tower', price: '₹3.50', change: '+9.1%', data: generateMockSparkline(), color: '#10b981' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-400 font-sans selection:bg-white/10 pt-2 pb-20 px-4 md:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex items-center justify-between h-14">
            {!isSearching ? (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 md:gap-4"
              >
                <button 
                  onClick={() => navigate(-1)}
                  className="p-1.5 md:p-2 hover:bg-white/5 rounded-full transition-colors group shrink-0"
                >
                  <ArrowLeft size={18} className="text-zinc-500 group-hover:text-white" />
                </button>
                <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Market</h1>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: '100%' }}
                className="flex items-center gap-3 flex-1"
              >
                 <Search size={18} className="text-zinc-500 shrink-0" />
                 <input 
                   autoFocus
                   type="text"
                   placeholder="Search properties..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="bg-transparent border-none text-white text-base w-full focus:outline-none placeholder:text-zinc-700 font-medium"
                 />
                 <button 
                   onClick={() => { setIsSearching(false); setSearchQuery(''); }}
                   className="p-2 text-zinc-500 hover:text-white"
                 >
                   <X size={18} />
                 </button>
              </motion.div>
            )}

            {!isSearching && (
              <div className="flex items-center gap-1">
                 <button 
                   onClick={() => setIsSearching(true)}
                   className="p-2 text-zinc-500 hover:text-white transition-colors shrink-0"
                 >
                    <Search size={20} />
                 </button>
                 <div className="hidden sm:flex items-center bg-[#141414] border border-white/5 rounded-lg p-1 shrink-0">
                    <button className="p-1.5 bg-white/10 text-white rounded-md shadow-sm">
                      <LayoutGrid size={14} />
                    </button>
                    <button className="p-1.5 text-zinc-600 hover:text-zinc-400">
                      <ListIcon size={14} />
                    </button>
                 </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-[11px] font-medium transition-all whitespace-nowrap border ${
                  activeTab === tab 
                  ? 'bg-white text-black border-white' 
                  : 'text-zinc-500 hover:text-zinc-300 border-white/5 bg-transparent'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results Summary */}
        {searchQuery && (
          <div className="mb-4 px-1">
             <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">
               Found {filteredProjects.length} matching assets
             </p>
          </div>
        )}

        {/* Top Movers Section - Hidden when searching or filtering */}
        {!searchQuery && activeTab === 'All assets' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 overflow-hidden"
          >
            <h2 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3 px-1">Top Movers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {topMovers.map((mover, i) => (
                <div 
                  key={i}
                  className="bg-[#141414]/30 border border-white/5 p-4 rounded-xl hover:bg-[#141414]/50 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white font-bold text-xs border border-white/5 shrink-0">
                        {mover.name[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white leading-none truncate uppercase">{mover.name}</div>
                        <div className="text-[9px] text-zinc-600 truncate mt-1 uppercase tracking-tighter">{mover.sub}</div>
                      </div>
                    </div>
                    <div className={`text-[10px] font-bold ${mover.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                      {mover.change}
                    </div>
                  </div>
                  <Sparkline data={mover.data} color={mover.color} height={20} />
                  <div className="mt-2 text-sm font-bold text-white font-mono tracking-tighter">{mover.price}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Asset List Header - Hidden on mobile */}
        <div className="hidden md:grid grid-cols-12 px-6 py-2 text-[9px] uppercase tracking-[0.2em] font-bold text-zinc-700 mb-1 border-b border-white/5">
          <div className="col-span-5">Asset protocol</div>
          <div className="col-span-2 text-right">Price index</div>
          <div className="col-span-2 text-right">Yield</div>
          <div className="col-span-3 text-right">Aggregate value</div>
        </div>

        {/* Asset List - Transparent Row Style */}
        <div className="space-y-0">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-0"
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 border-b border-white/5 animate-pulse" />
                ))}
              </motion.div>
            ) : currentProjects.length > 0 ? (
              <motion.div 
                key={currentPage + activeTab + searchQuery}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="divide-y divide-white/5"
              >
                {currentProjects.map((asset, i) => (
                  <div 
                    key={asset.id}
                    onClick={() => navigate(`/trade?assetId=${asset.id}`)}
                    className="flex md:grid md:grid-cols-12 items-center px-4 md:px-6 py-4 bg-transparent hover:bg-white/[0.02] transition-all cursor-pointer group gap-4 md:gap-0"
                  >
                    {/* Asset Identity */}
                    <div className="md:col-span-5 flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 md:w-9 md:h-9 rounded-lg overflow-hidden border border-white/5 shrink-0 bg-[#0c0c0c]">
                        <img src={asset.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=100'} alt={asset.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white truncate uppercase tracking-tight">{asset.title}</div>
                        <div className="text-[10px] text-zinc-600 truncate uppercase tracking-tighter">{asset.location?.city || 'Prime Cluster'}</div>
                      </div>
                    </div>
                    
                    {/* Desktop Sparkline (Middle) */}
                    <div className="hidden md:block col-span-2 px-6 opacity-30 group-hover:opacity-100 transition-opacity">
                       <Sparkline data={generateMockSparkline()} height={16} />
                    </div>

                    {/* Price & Change (Right) */}
                    <div className="md:col-span-2 text-right">
                      <div className="text-sm font-bold text-white font-mono tracking-tighter">
                        ₹{(asset.financial?.market_value || asset.financial?.ipo_price || 0).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-green-500 font-bold">+1.24%</div>
                    </div>

                    {/* Yield (Desktop only) */}
                    <div className="hidden md:block col-span-1 text-right text-xs font-bold text-zinc-500">
                      {asset.macro_analytics?.avg_rental_yield || '7.5'}%
                    </div>

                    {/* Market Cap (Desktop only) */}
                    <div className="hidden md:block col-span-2 text-right text-xs font-mono font-medium text-zinc-700 tracking-tighter">
                      ₹{(asset.financial?.total_bricks * (asset.financial?.market_value || asset.financial?.ipo_price) || 0).toLocaleString()}
                    </div>

                    {/* Mobile Chevron */}
                    <div className="md:hidden">
                       <ChevronRight size={14} className="text-zinc-900" />
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-20">
                <p className="text-zinc-800 text-[10px] uppercase font-bold tracking-[0.3em]">Neural link empty // No data found</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Pagination Controls */}
        {!loading && filteredProjects.length > itemsPerPage && (
          <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-800">
              {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredProjects.length)} / {filteredProjects.length}
            </p>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-white/5 text-zinc-700 hover:text-white disabled:opacity-10 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-white/5 text-zinc-700 hover:text-white disabled:opacity-10 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MarketExplore;
