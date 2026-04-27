import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Building2, Menu, X, User, Bell, Mail, Inbox, ChevronDown, ShieldCheck, PlusCircle, Briefcase, LayoutGrid, ArrowLeftRight, TrendingUp, Wallet, AlertCircle, Clock, CheckCircle2, Search, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import dashboardService from '../../services/dashboardService';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showInbox, setShowInbox] = useState(false);
  const [navData, setNavData] = useState({ nav: 0, loading: true });
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchNav = async () => {
        try {
          const data = await dashboardService.getDashboardData(user?.role === 'builder');
          const portfolioVal = data.portfolio?.reduce((acc, p) => acc + (p.current_valuation || 0), 0) || 0;
          const walletVal = data.wallet?.balance || 0;
          setNavData({ nav: portfolioVal + walletVal, loading: false });
        } catch (e) {
          setNavData({ nav: 0, loading: false });
        }
      };
      fetchNav();
    }
  }, [isAuthenticated, user]);

  const formatNAV = (val) => {
    if (val === 0) return '$0';
    if (val >= 10000000) return `$${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `$${(val / 100000).toFixed(1)}L`;
    return `$${val.toLocaleString()}`;
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutGrid },
    { name: 'IPO Center', path: '/ipo', icon: Zap },
    { name: 'Explore', path: '/explore', icon: Search },
    { name: 'Trade', path: '/trade', icon: ArrowLeftRight },
    { name: 'Portfolio', path: '/dashboard/portfolio', icon: TrendingUp },
    { name: 'Wallet', path: '/dashboard/wallet', icon: Wallet },
  ];

  if (user?.role === 'builder') {
    menuItems.push(
      { name: 'My Projects', path: '/dashboard/my-projects', icon: Briefcase },
      { name: 'Add Asset', path: '/dashboard/add-property', icon: PlusCircle }
    );
  }
  if (user?.role === 'admin') {
    menuItems.push({ name: 'Admin Node', path: '/admin', icon: ShieldCheck });
  }

  const notifications = [
    { title: 'KYC Status Update', description: `Your identity audit is currently ${user?.kyc_status || 'pending'}.`, type: 'alert', time: 'Recently' },
    { title: 'Ledger Sync', description: 'Wallet node synchronized with global secondary market.', type: 'info', time: '2h ago' },
  ];

  const messages = [
    { from: 'EstateX Support', subject: 'Institutional Onboarding', preview: 'Welcome to the Sovereign terminal. Your account is...', time: '1d ago' },
  ];

  const QuickDrawer = ({ isOpen, onClose, title, subtitle, children }) => (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" />
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-screen w-full max-w-[450px] z-[110] bg-[#050505] border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,1)] p-8 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-12">
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">{subtitle}</p>
                <h3 className="text-xl md:text-2xl font-bold tracking-tighter uppercase">{title}</h3>
              </div>
              <button onClick={onClose} className="p-2 text-zinc-600 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  if (!isAuthenticated) {
    return (
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 md:h-20 max-w-7xl items-center justify-between px-6 lg:px-12">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-sm md:text-base font-black tracking-[0.4em] uppercase text-[#D4AF37]">EstateX</span>
          </Link>
          <div className="hidden md:flex items-center gap-12">
            <Link to="/ipo" className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-500 hover:text-white transition-all">Properties</Link>
            <Link to="/explore" className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-500 hover:text-white transition-all">Investors</Link>
            <button onClick={() => document.getElementById('methodology')?.scrollIntoView({ behavior: 'smooth' })} className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-500 hover:text-white transition-all">About</button>
          </div>
          <div className="flex items-center gap-8">
            <Link to="/login" className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 hover:text-white transition-colors">Log In</Link>
            <Link to="/register">
              <button className="border border-white/20 text-white px-8 py-3 text-[9px] font-black uppercase tracking-[0.3em] hover:bg-white/5 transition-all">Get Started</button>
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-[60] w-full border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-xl h-16 md:h-20">
      <div className="h-full flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-6 md:gap-12">
          <Link to="/dashboard" className="flex items-center gap-2"><span className="text-sm md:text-base font-black tracking-[0.4em] uppercase text-[#D4AF37]">EstateX</span></Link>
          <div className="hidden lg:flex items-center gap-3">
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700">|</span>
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Sovereign Node</span>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-12">
          <div className="hidden sm:flex flex-col items-end gap-1 border-r border-white/5 pr-8 mr-2">
             <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">NAV: <span className="text-[#D4AF37]">{navData.loading ? '...' : formatNAV(navData.nav)}</span></p>
             <div className="w-16 h-0.5 bg-white/5 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: navData.nav > 0 ? '60%' : '0%' }} className="h-full bg-[#D4AF37]" />
             </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <button onClick={() => setShowNotifications(true)} className="text-zinc-500 hover:text-white transition-colors relative">
               <Bell size={18} strokeWidth={1.5} />
               <span className="absolute top-0 right-0 w-1 h-1 bg-[#D4AF37] rounded-full" />
            </button>
            <button onClick={() => setShowInbox(true)} className="text-zinc-500 hover:text-white transition-colors">
               <Inbox size={18} strokeWidth={1.5} />
            </button>
            <Link to="/dashboard/profile" className="flex items-center gap-3 group cursor-pointer border-l border-white/10 pl-6 ml-2">
               <div className="w-8 h-8 bg-white/[0.03] border border-white/10 rounded-none flex items-center justify-center group-hover:border-[#D4AF37]/50 transition-all">
                  <User size={15} className="text-zinc-600 group-hover:text-white" />
               </div>
            </Link>
            <button onClick={toggleMenu} className="lg:hidden text-zinc-500 ml-2"><Menu size={20} /></button>
          </div>
        </div>
      </div>

      <QuickDrawer isOpen={showNotifications} onClose={() => setShowNotifications(false)} title="System Alerts" subtitle="Audit Sequence">
         <div className="space-y-6">
            {notifications.map((n, i) => (
              <div key={i} className="p-5 border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-all space-y-3">
                 <div className="flex justify-between items-start">
                    <span className="text-[8px] font-black uppercase tracking-widest text-[#D4AF37]">{n.time}</span>
                    {n.type === 'alert' ? <AlertCircle size={14} className="text-[#D4AF37]" /> : <CheckCircle2 size={14} className="text-zinc-600" />}
                 </div>
                 <h4 className="text-sm font-bold">{n.title}</h4>
                 <p className="text-[11px] text-zinc-500 leading-relaxed">{n.description}</p>
              </div>
            ))}
         </div>
      </QuickDrawer>

      <QuickDrawer isOpen={showInbox} onClose={() => setShowInbox(false)} title="Communication" subtitle="Sovereign Node">
         <div className="space-y-6">
            {messages.map((m, i) => (
              <div key={i} className="p-5 border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-all cursor-pointer">
                 <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37]">{m.from}</span>
                    <span className="text-[9px] font-bold text-zinc-700">{m.time}</span>
                 </div>
                 <h4 className="text-sm font-bold mb-1">{m.subject}</h4>
                 <p className="text-[11px] text-zinc-500 line-clamp-1">{m.preview}</p>
              </div>
            ))}
            <div className="pt-10 text-center">
               <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-800">Secure Node Messaging Active</p>
            </div>
         </div>
      </QuickDrawer>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed inset-0 z-[999] bg-black flex flex-col p-8 lg:hidden overflow-y-auto h-screen w-screen">
             <div className="flex justify-between items-center mb-16 pt-2">
                <span className="text-xs font-black tracking-[0.4em] uppercase text-[#D4AF37]">EstateX</span>
                <button onClick={toggleMenu} className="p-2 text-zinc-400 hover:text-white transition-colors"><X size={24} strokeWidth={3} /></button>
             </div>
             <div className="flex-1 flex flex-col justify-center space-y-8">
                {menuItems.map((item, i) => (
                  <Link key={item.name} to={item.path} onClick={toggleMenu} className="group flex items-center justify-between">
                    <div className="flex items-center gap-6">
                       <item.icon size={20} className="text-zinc-800 group-hover:text-[#D4AF37] transition-colors" />
                       <span className="text-2xl font-black uppercase tracking-widest text-zinc-800 group-hover:text-white transition-all duration-500">{item.name}</span>
                    </div>
                    <ChevronDown className="-rotate-90 text-zinc-900 group-hover:text-[#D4AF37] transition-colors" size={18} />
                  </Link>
                ))}
             </div>
             <button onClick={async () => { await logout(); navigate('/login'); toggleMenu(); }} className="text-xl font-black uppercase tracking-[0.3em] text-red-900/50 hover:text-red-600 transition-colors pt-12 border-t border-white/5 mb-10">Logout Session</button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
