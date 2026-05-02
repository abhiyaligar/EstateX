import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Wallet, TrendingUp, ArrowUpRight, Clock, AlertCircle, CheckCircle2, Shield, Briefcase, ChevronRight, Bell, MapPin, Percent, Users, Loader2, ArrowLeft, ChevronLeft, X, ArrowDownRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import dashboardService from '../services/dashboardService';
import { Loader } from '../components/ui/Loader';

const Sparkline = ({ data, color = "#D4AF37", height = 24 }) => (
  <div className={`w-full`} style={{ height: `${height}px` }}>
    <ResponsiveContainer width="99%" height="99%" minWidth={1} minHeight={1}>
      <AreaChart data={data}>
        <Area 
          type="monotone" 
          dataKey="pv" 
          stroke={color} 
          strokeWidth={1.5} 
          fill="transparent"
          dot={false} 
          isAnimationActive={false}
        />
        <YAxis hide domain={['auto', 'auto']} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showFullAudit, setShowFullAudit] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [dashboardData, setDashboardData] = useState({
    wallet: { balance: 0, recent_transactions: [] },
    portfolio: [],
    builder_wallet: null,
    builder_profile: null
  });

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getDashboardData(user?.role === 'builder');
      
      const mappedPortfolio = (data.portfolio || []).map(item => {
        const project = item.project;
        const marketValue = project?.financial?.market_value || project?.financial?.ipo_price || 1000;
        
        return {
          ...item,
          current_valuation: item.quantity * marketValue,
          display_location: project?.location 
            ? `${project.location.city || ''}, ${project.location.state || ''}`
            : 'Digital Ledger',
          image_url: project?.images && project.images.length > 0 
            ? project.images[0] 
            : 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80',
          mock_sparkline: Array.from({ length: 12 }, (_, i) => ({ name: i, pv: Math.floor(Math.random() * 100) + 50 }))
        };
      });

      setDashboardData({
        ...data,
        portfolio: mappedPortfolio
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [user]);

  const totalPortfolioValue = dashboardData?.portfolio?.reduce((acc, p) => acc + (p.current_valuation || 0), 0) || 0;

  // Dynamic Temporal Mapping for Trailing 6 Months
  const getTrailingMonths = () => {
    const months = [];
    const date = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
      months.push(d.toLocaleString('default', { month: 'short' }));
    }
    return months;
  };

  const trailingMonths = getTrailingMonths();
  const chartData = [
    { name: trailingMonths[0], value: 40000 },
    { name: trailingMonths[1], value: 48000 },
    { name: trailingMonths[2], value: 35000 },
    { name: trailingMonths[3], value: 52000 },
    { name: trailingMonths[4], value: 49000 },
    { name: trailingMonths[5], value: totalPortfolioValue || 58000 },
  ];

  const allLedgerEvents = (dashboardData?.wallet?.recent_transactions || []).map(tx => ({
    type: (tx.transaction_type || 'TRANSACTION').toUpperCase().replace('_', ' '),
    title: tx.description || `Transfer Ref: ${tx.id?.substring(0, 8)}`,
    amount: tx.transaction_type === 'deposit' ? `+₹${(tx.amount || 0).toLocaleString()}` : `-₹${(tx.amount || 0).toLocaleString()}`,
    date: tx.created_at ? new Date(tx.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent',
    isPositive: tx.transaction_type === 'deposit'
  }));

  const itemsPerPage = 10;
  const paginatedEvents = allLedgerEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const isKYCPending = user?.kyc_status !== 'approved';

  if (loading) {
     return (
       <div className="h-screen bg-[#0a0a0a] flex items-center justify-center">
          <Loader size={48} text="Synchronizing Sovereign Ledger..." />
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#D4AF37]/30 pb-20 relative overflow-x-hidden">
      
      {/* Quick Audit Sidebar Overlay */}
      <AnimatePresence>
        {showFullAudit && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFullAudit(false)} className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-md" />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-screen w-full max-w-[600px] z-[90] bg-[#050505] border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,1)] p-8 md:p-12 overflow-y-auto"
            >
               <div className="flex justify-between items-center mb-16">
                  <div className="space-y-1">
                     <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">Exhaustive Audit</p>
                     <h2 className="text-2xl md:text-3xl font-bold tracking-tighter uppercase">Ledger <span className="text-white/20">Flow</span></h2>
                  </div>
                  <button onClick={() => setShowFullAudit(false)} className="p-3 text-zinc-600 hover:text-white transition-colors"><X size={24} /></button>
               </div>
               <div className="space-y-6">
                  {paginatedEvents.map((event, i) => (
                    <div key={i} className="group flex flex-col gap-2 p-6 border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-all">
                       <div className="flex justify-between items-start">
                          <span className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37]">{event.type}</span>
                          <span className="text-[9px] font-bold text-zinc-700">{event.date}</span>
                       </div>
                       <div className="flex justify-between items-end">
                          <h4 className="text-sm font-bold max-w-[200px] leading-snug">{event.title}</h4>
                          <span className={`text-base font-black tracking-tighter ${event.isPositive ? 'text-[#D4AF37]' : 'text-white'}`}>{event.amount}</span>
                       </div>
                    </div>
                  ))}
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Dynamic Header Alert */}
      {isKYCPending && (
        <div className="bg-[#D4AF37]/10 border-b border-[#D4AF37]/20 py-3 px-6 flex items-center justify-center gap-3 text-center">
           <AlertCircle size={14} className="text-[#D4AF37] shrink-0" />
           <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37] leading-relaxed">
             KYC Status: {user?.kyc_status ? user.kyc_status.toUpperCase().replace('_', ' ') : 'PENDING'}. Sovereign Permissions restricted.
           </p>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto px-6 md:px-12 pt-8 md:pt-16">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 md:gap-12 mb-12 md:mb-16">
          <div className="space-y-3 md:space-y-4">
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Terminal</p>
            <h1 className="text-3xl md:text-6xl font-bold tracking-tighter uppercase leading-none">
              Sovereign <span className="text-[#D4AF37]">Session</span>
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-8 md:gap-20">
             <div className="space-y-1 md:space-y-2">
                <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 sm:text-right">Total Portfolio Value</p>
                <p className="text-2xl md:text-5xl font-bold tracking-tighter">
                  ₹{(dashboardData?.portfolio?.reduce((acc, p) => acc + (p.current_valuation || 0), 0) || 0).toLocaleString()}
                </p>
             </div>
             <div className="space-y-1 md:space-y-2 border-t border-white/5 pt-4 sm:border-0 sm:pt-0">
                <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 sm:text-right">Current Liquidity</p>
                <p className="text-2xl md:text-5xl font-bold tracking-tighter text-[#D4AF37]">
                  ₹{(dashboardData?.wallet?.balance || 0).toLocaleString()}
                </p>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20 border-t border-white/5 pt-10 md:pt-12">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-12 md:space-y-16">
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                 <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Portfolio Performance</h3>
                 <div className="flex gap-4 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-zinc-700">
                    <button className="hover:text-white transition-colors">1M</button>
                    <button className="text-white border-b border-[#D4AF37] pb-1">1Y</button>
                    <button className="hover:text-white transition-colors">ALL</button>
                 </div>
              </div>
              <div className="relative h-[250px] md:h-[400px] w-full min-w-0 group">
                <div className="absolute top-4 right-4 md:right-10 z-20 bg-[#D4AF37] text-black px-2 md:px-3 py-1 md:py-1.5 text-[8px] md:text-[9px] font-black uppercase tracking-widest shadow-2xl">
                   {dashboardData?.portfolio?.length > 0 ? '+14.2% YTD' : '0.0% Delta'}
                </div>
                <ResponsiveContainer width="99%" height="99%" minWidth={1} minHeight={1}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.02)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#333', fontSize: 9, fontWeight: 800}} dy={20}/>
                    <YAxis hide />
                    <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '0px' }} itemStyle={{ color: '#D4AF37', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase' }} />
                    <Area type="monotone" dataKey="value" stroke="#D4AF37" strokeWidth={1.5} fill="url(#goldGradient)" animationDuration={2000}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Portfolio Section - High Fidelity Row Implementation */}
            <div className="space-y-8 md:space-y-10 pt-4 md:pt-10">
               <div className="flex justify-between items-center">
                  <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Sovereign Bricks Portfolio</h3>
                  <Link to="/explore" className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-[#D4AF37] hover:underline underline-offset-4">Browse Marketplace</Link>
               </div>
               {dashboardData?.portfolio?.length > 0 ? (
                 <div className="space-y-3">
                    {dashboardData.portfolio.map((item, i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={i} 
                        className="group flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 bg-white/[0.01] border border-white/5 hover:border-[#D4AF37]/30 transition-all cursor-pointer gap-6 md:gap-0"
                      >
                         <div className="flex items-center gap-4 md:gap-8 flex-1 min-w-0">
                            {/* Small Square Asset Node */}
                            <div className="w-12 h-12 md:w-16 md:h-16 shrink-0 bg-[#0c0c0c] border border-white/10 overflow-hidden">
                               <img src={item.image_url} alt={item.project?.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                            </div>
                            
                            <div className="min-w-0 flex-1 lg:flex lg:items-center lg:gap-20">
                               <div className="min-w-0 md:min-w-[200px] lg:min-w-[250px]">
                                  <h4 className="text-sm md:text-base font-bold text-white group-hover:text-[#D4AF37] transition-colors truncate uppercase tracking-tight">{item.project?.title || 'Sovereign Asset'}</h4>
                                  <p className="text-[9px] text-zinc-600 truncate uppercase tracking-widest font-black mt-0.5 flex items-center gap-2">
                                     <MapPin size={9} className="text-zinc-800" /> {item.display_location}
                                  </p>
                               </div>

                               <div className="flex items-center justify-between md:justify-start gap-10 md:gap-20 flex-1 mt-2 md:mt-0">
                                  <div className="md:text-right min-w-[80px] md:min-w-[100px]">
                                     <p className="text-base md:text-xl font-bold font-mono tracking-tighter">₹{(item.current_valuation || 0).toLocaleString()}</p>
                                  </div>
                                  <div className="flex items-center gap-1 text-[9px] md:text-[10px] font-black text-green-500">
                                     <ArrowUpRight size={10} className="md:size-3" />
                                     <span>+1.24%</span>
                                  </div>
                                  <div className="hidden lg:block flex-1 max-w-[150px] opacity-30 group-hover:opacity-100 transition-opacity">
                                     <Sparkline data={item.mock_sparkline} />
                                  </div>
                               </div>
                            </div>
                         </div>
                         
                         <div className="shrink-0 w-full md:w-auto">
                            <Link to={`/properties/${item.project?.id}`} className="block">
                               <button className="w-full md:w-auto px-6 py-3 md:py-2 bg-white text-black text-[9px] font-black uppercase tracking-[0.2em] hover:bg-[#D4AF37] transition-all">
                                  Audit Node
                               </button>
                            </Link>
                         </div>
                      </motion.div>
                    ))}
                 </div>
               ) : (
                 <div className="py-20 border border-white/5 bg-white/[0.01] flex flex-col items-center justify-center gap-4 text-center px-6">
                    <Briefcase size={28} className="text-zinc-800" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">No Portfolio Assets Identified</p>
                 </div>
               )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-12 md:space-y-16 lg:border-l lg:border-white/5 lg:pl-12 xl:pl-20">
            <div className="space-y-10">
              <div className="flex justify-between items-center">
                 <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Ledger Events</h3>
                 <button onClick={() => setShowFullAudit(true)} className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-zinc-700 hover:text-white transition-colors flex items-center gap-2">Audit <ChevronRight size={10} /></button>
              </div>
              <div className="space-y-8 md:space-y-10">
                 {allLedgerEvents.slice(0, 5).map((event, i) => (
                   <div key={i} className="group relative flex flex-col gap-1 md:gap-2 pb-6 md:pb-8 border-b border-white/5 last:border-0">
                      <div className="flex justify-between items-start mb-1">
                         <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">{event.type}</span>
                         <span className="text-[8px] md:text-[9px] font-bold text-zinc-700">{event.date}</span>
                      </div>
                      <div className="flex justify-between items-end">
                         <h5 className="text-xs md:text-sm font-bold text-white/90 max-w-[180px] md:max-w-[200px] leading-snug">{event.title}</h5>
                         <span className={`text-xs md:text-sm font-black tracking-tighter ${event.isPositive ? 'text-[#D4AF37]' : 'text-white'}`}>{event.amount}</span>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
            <div className="bg-white/[0.01] md:bg-white/[0.02] border border-white/5 p-6 md:p-8 space-y-6">
               <div className="flex items-center gap-3 mb-2"><Bell size={14} className="text-[#D4AF37]" /><h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em]">System Audit</h4></div>
               {isKYCPending && <div className="p-4 bg-[#D4AF37]/5 border border-[#D4AF37]/10 rounded-none space-y-2"><p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-[#D4AF37]">Identity Pending</p><p className="text-[10px] md:text-[11px] text-zinc-500 leading-relaxed font-medium">Sovereign trading permissions are currently restricted awaiting manual audit.</p></div>}
               <div className="p-4 bg-white/5 border border-white/10 rounded-none space-y-2 opacity-50"><p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-zinc-400">Node Sync</p><p className="text-[10px] md:text-[11px] text-zinc-600 leading-relaxed font-medium">Connected to high-performance private ledger node.</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
