import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Wallet, TrendingUp, ArrowUpRight, Clock, AlertCircle, 
  CheckCircle2, Shield, Briefcase, ChevronRight, Bell, MapPin, 
  Percent, Users, Loader2, ArrowLeft, ChevronLeft, X, ArrowDownRight,
  Zap, Activity, LogOut, Search, Settings, LayoutGrid, ArrowLeftRight,
  ShieldCheck, Lock as LucideLock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import dashboardService from '../services/dashboardService';
import { Loader } from '../components/ui/Loader';

const Sparkline = ({ data, color = "#FF5F05", height = 24 }) => (
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
       <div className="h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <div className="h-16 w-16 bg-accent-orange/10 rounded-full flex items-center justify-center animate-pulse border border-accent-orange/20">
              <Zap size={32} className="text-accent-orange" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-foreground/40 animate-pulse">Syncing Terminal Node...</p>
          </div>
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent-orange/10 pb-20 relative overflow-x-hidden transition-colors duration-500">
      
      {/* Quick Audit Sidebar Overlay */}
      <AnimatePresence>
        {showFullAudit && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFullAudit(false)} className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-md" />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-screen w-full max-w-[600px] z-[90] bg-background border-l border-border shadow-[0_0_50px_rgba(0,0,0,1)] p-8 md:p-12 overflow-y-auto blueprint-grid-dashed-small"
            >
               <div className="flex justify-between items-center mb-16">
                  <div className="space-y-1">
                     <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent-orange">Exhaustive Audit</p>
                     <h2 className="text-2xl md:text-3xl font-heading font-black tracking-tighter uppercase">Ledger <span className="text-foreground/20">Flow</span></h2>
                  </div>
                  <button onClick={() => setShowFullAudit(false)} className="p-3 text-foreground/40 hover:text-foreground transition-colors"><X size={24} /></button>
               </div>
               <div className="space-y-6">
                  {paginatedEvents.map((event, i) => (
                    <div key={i} className="group flex flex-col gap-2 p-6 border border-border bg-foreground/[0.01] hover:bg-foreground/[0.02] transition-all rounded-3xl">
                       <div className="flex justify-between items-start">
                          <span className="text-[9px] font-black uppercase tracking-widest text-accent-orange">{event.type}</span>
                          <span className="text-[9px] font-bold text-foreground/20">{event.date}</span>
                       </div>
                       <div className="flex justify-between items-end">
                          <h4 className="text-sm font-bold max-w-[200px] leading-snug uppercase tracking-tight">{event.title}</h4>
                          <span className={`text-base font-black tracking-tighter ${event.isPositive ? 'text-accent-orange' : 'text-foreground'}`}>{event.amount}</span>
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
        <div className="bg-accent-orange/10 border-b border-accent-orange/20 py-3 px-6 flex items-center justify-center gap-3 text-center">
           <AlertCircle size={14} className="text-accent-orange shrink-0" />
           <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-accent-orange leading-relaxed">
             KYC Status: {user?.kyc_status ? user.kyc_status.toUpperCase().replace('_', ' ') : 'PENDING'}. Sovereign Permissions restricted.
           </p>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto px-6 md:px-12 pt-8 md:pt-16">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 md:gap-12 mb-12 md:mb-16">
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center gap-3">
               <Activity size={14} className="text-accent-orange animate-pulse" />
               <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-foreground/30">Active Terminal Session</p>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-heading font-black tracking-[-0.05em] uppercase leading-[0.9]">
              Sovereign <br /> <span className="text-white/10">Dashboard</span>
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-8 md:gap-16">
             <div className="space-y-1 md:space-y-2">
                <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-foreground/30 sm:text-right">Total Portfolio Value</p>
                <p className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-heading font-black tracking-tighter uppercase">
                  ₹{(dashboardData?.portfolio?.reduce((acc, p) => acc + (p.current_valuation || 0), 0) || 0).toLocaleString()}
                </p>
             </div>
             <div className="space-y-1 md:space-y-2 border-t border-border pt-4 sm:border-0 sm:pt-0">
                <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-foreground/30 sm:text-right">Current Liquidity</p>
                <p className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-heading font-black tracking-tighter text-accent-orange uppercase">
                  ₹{(dashboardData?.wallet?.balance || 0).toLocaleString()}
                </p>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20 border-t border-border pt-10 md:pt-12">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-12 md:space-y-16">
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                 <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30">Portfolio Performance</h3>
                 <div className="flex gap-4 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-foreground/20">
                    <button className="hover:text-foreground transition-colors">1M</button>
                    <button className="text-foreground border-b border-accent-orange pb-1">1Y</button>
                    <button className="hover:text-foreground transition-colors">ALL</button>
                 </div>
              </div>
              <div className="relative h-[250px] md:h-[450px] w-full min-w-0 group bg-foreground/[0.01] border border-border p-6 rounded-[40px] blueprint-grid-dashed-small overflow-hidden">
                <div className="absolute top-10 right-10 z-20 bg-accent-orange text-white px-3 py-1.5 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl">
                   {dashboardData?.portfolio?.length > 0 ? '+14.2% YTD' : '0.0% Delta'}
                </div>
                <ResponsiveContainer width="99%" height="99%" minWidth={1} minHeight={1}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF5F05" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#FF5F05" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 95, 5, 0.05)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.1)', fontSize: 9, fontWeight: 900}} dy={20}/>
                    <YAxis hide />
                    <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,95,5,0.2)', borderRadius: '12px' }} itemStyle={{ color: '#FF5F05', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }} />
                    <Area type="monotone" dataKey="value" stroke="#FF5F05" strokeWidth={2} fill="url(#orangeGradient)" animationDuration={2000}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Portfolio Section */}
            <div className="space-y-8 md:space-y-10 pt-4 md:pt-10">
               <div className="flex justify-between items-center">
                  <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30">Sovereign Bricks Portfolio</h3>
                  <Link to="/explore" className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-accent-orange hover:opacity-70 transition-opacity">Browse Marketplace</Link>
               </div>
               {dashboardData?.portfolio?.length > 0 ? (
                 <div className="space-y-4">
                    {dashboardData.portfolio.map((item, i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={i} 
                        className="group flex flex-col md:flex-row md:items-center justify-between p-5 md:p-6 bg-foreground/[0.01] border border-border hover:border-accent-orange/30 transition-all cursor-pointer gap-6 md:gap-4 rounded-[28px]"
                      >
                         <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
                            <div className="w-14 h-14 md:w-16 md:h-16 shrink-0 bg-background border border-border rounded-2xl overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                               <img src={item.image_url} alt={item.project?.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                            </div>
                            
                            <div className="min-w-0 flex-1 lg:flex lg:items-center lg:gap-12">
                               <div className="min-w-0 md:w-[200px] lg:w-[240px]">
                                  <h4 className="text-base md:text-lg font-heading font-black text-foreground group-hover:text-accent-orange transition-colors truncate uppercase tracking-tight">{item.project?.title || 'Sovereign Asset'}</h4>
                                  <p className="text-[9px] text-foreground/30 truncate uppercase tracking-widest font-black mt-0.5 flex items-center gap-2">
                                     <MapPin size={9} className="text-accent-orange" /> {item.display_location}
                                  </p>
                                </div>

                               <div className="flex items-center justify-between md:justify-end gap-6 md:gap-10 flex-1 mt-3 md:mt-0">
                                  <div className="md:text-right min-w-[100px] lg:min-w-[140px]">
                                     <p className="text-lg lg:text-xl font-heading font-black tracking-tighter">₹{(item.current_valuation || 0).toLocaleString()}</p>
                                  </div>
                                  <div className="flex items-center gap-1 text-[9px] font-black text-emerald-500">
                                     <ArrowUpRight size={10} />
                                     <span>+1.24%</span>
                                  </div>
                                  <div className="hidden xl:block flex-1 max-w-[120px] opacity-20 group-hover:opacity-100 transition-opacity">
                                     <Sparkline data={item.mock_sparkline} />
                                  </div>
                               </div>
                            </div>
                         </div>
                         
                         <div className="shrink-0 w-full md:w-auto">
                            <Link to={`/properties/${item.project?.id}`} className="block">
                               <button className="w-full md:w-auto px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-accent-orange hover:text-white transition-all shadow-lg shadow-black/20">
                                  Audit Node
                                </button>
                            </Link>
                         </div>
                      </motion.div>
                    ))}
                 </div>
               ) : (
                 <div className="py-24 rounded-[40px] border border-dashed border-border bg-foreground/[0.01] flex flex-col items-center justify-center gap-6 text-center px-10">
                    <div className="h-20 w-20 bg-foreground/5 rounded-full flex items-center justify-center">
                       <Briefcase size={32} className="text-foreground/20" />
                    </div>
                    <div className="space-y-2">
                       <p className="text-[11px] font-black uppercase tracking-[0.5em] text-foreground/40">No Portfolio Assets Identified</p>
                       <p className="text-sm text-foreground/20 font-medium max-w-[300px]">Initialize your portfolio in the institutional marketplace.</p>
                    </div>
                 </div>
               )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-12 md:space-y-16 lg:border-l lg:border-border lg:pl-12 xl:pl-20">
            <div className="space-y-12 md:space-y-16">
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <Clock size={14} className="text-accent-orange" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-foreground/30">Ledger Flow</h3>
                 </div>
                 <button onClick={() => setShowFullAudit(true)} className="text-[9px] font-black uppercase tracking-widest text-foreground/20 hover:text-accent-orange transition-colors flex items-center gap-2">Audit <ChevronRight size={12} /></button>
              </div>
              <div className="space-y-10">
                 {allLedgerEvents.slice(0, 6).map((event, i) => (
                   <div key={i} className="group relative flex flex-col gap-3 pb-8 border-b border-border last:border-0 hover:pl-2 transition-all">
                      <div className="flex justify-between items-start">
                         <span className="text-[9px] font-black uppercase tracking-[0.2em] text-accent-orange">{event.type}</span>
                         <span className="text-[9px] font-black uppercase tracking-widest text-foreground/20">{event.date}</span>
                      </div>
                      <div className="flex justify-between items-end gap-4">
                         <h5 className="text-sm font-bold text-foreground/80 max-w-[200px] leading-snug uppercase tracking-tight">{event.title}</h5>
                         <span className={`text-sm font-black tracking-tighter ${event.isPositive ? 'text-emerald-500' : 'text-foreground'}`}>{event.amount}</span>
                      </div>
                   </div>
                 ))}
              </div>
            </div>

            <div className="bg-foreground/[0.02] border border-border p-10 rounded-[40px] space-y-10 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                 <ShieldCheck size={120} className="text-accent-orange" />
               </div>
               <div className="flex items-center gap-3 relative z-10">
                 <ShieldCheck size={16} className="text-accent-orange" />
                 <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-foreground/60">Node Health</h4>
               </div>
               
               <div className="space-y-8 relative z-10">
                 {isKYCPending && (
                   <div className="p-6 bg-accent-orange/5 border border-accent-orange/10 rounded-2xl space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-accent-orange flex items-center gap-2">
                        <AlertCircle size={12} /> Identity Required
                      </p>
                      <p className="text-[12px] text-foreground/40 leading-relaxed font-medium">Sovereign trading node restricted. Finalize identity mapping to unlock secondary liquidity.</p>
                   </div>
                 )}
                 <div className="p-6 bg-foreground/[0.03] border border-border rounded-2xl space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30 flex items-center gap-2">
                      <LucideLock size={12} /> Encryption Node
                    </p>
                    <p className="text-[12px] text-foreground/20 leading-relaxed font-medium">Session secured via AES-256 and multi-party computation. All events are immutable.</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
