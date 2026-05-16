import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Building2, Menu, X, User, Bell, Mail, Inbox, ChevronDown,
  ShieldCheck, PlusCircle, Briefcase, LayoutGrid, ArrowLeftRight,
  TrendingUp, Wallet, AlertCircle, Clock, CheckCircle2, Search,
  Zap, ArrowRight, Sun, Moon, LogOut, Settings, Activity, Command,
  Cpu, Wifi
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import dashboardService from '../../services/dashboardService';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [navData, setNavData] = useState({ nav: 0, loading: true });
  const { isAuthenticated, logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Trading', path: '/trading', dropdown: ['Institutional', 'Derivatives', 'Liquidity'] },
    { name: 'Solutions', path: '/solutions', dropdown: ['API', 'Yield', 'Custody'] },
    { name: 'Who We Serve', path: '/who-we-serve', dropdown: ['Family Offices', 'Asset Managers', 'Builders'] },
    { name: 'Company', path: '/company', dropdown: ['About Us', 'Careers', 'Contact'] }
  ];

  useEffect(() => {
    const fetchNavData = async () => {
      if (isAuthenticated) {
        try {
          const data = await dashboardService.getDashboardData();
          // Assuming notifications count might be in wallet or derived from transactions
          const notificationCount = data.wallet?.recent_transactions?.length || 0;
          setNavData({ nav: notificationCount, loading: false });
        } catch (error) {
          console.error("Nav data fetch failed", error);
          setNavData({ nav: 0, loading: false });
        }
      }
    };
    fetchNavData();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl scrypt-nav rounded-full px-2 py-2 flex items-center justify-between transition-all">
        <div className="flex items-center gap-4 lg:gap-8 pl-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 bg-accent-orange rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,95,5,0.4)] transition-transform hover:scale-105">
              <Zap size={20} className="text-white fill-white" />
            </div>
            <span className="hidden sm:block text-lg md:text-xl font-heading font-black tracking-tighter text-white uppercase">EstateX</span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            <Link to="/" className={`text-[11px] font-bold px-6 py-2.5 rounded-full transition-all ${location.pathname === '/' ? 'scrypt-pill-active' : 'text-zinc-300 hover:text-white'}`}>Home</Link>

            {menuItems.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link to={item.path}>
                  <button className={`text-[11px] font-bold px-4 py-2.5 rounded-full transition-all flex items-center gap-1 ${location.pathname === item.path ? 'scrypt-pill-active' : 'text-zinc-300 hover:text-white'}`}>
                    {item.name} <ChevronDown size={12} className={`transition-transform duration-300 ${activeDropdown === item.name ? 'rotate-180' : ''}`} />
                  </button>
                </Link>

                <AnimatePresence>
                  {activeDropdown === item.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full left-0 mt-4 w-56 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[24px] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-50"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-accent-orange/5 to-transparent pointer-events-none" />
                      {item.dropdown.map(subItem => (
                        <button key={subItem} className="relative w-full text-left text-[10px] font-black text-zinc-400 hover:text-white hover:bg-white/5 px-5 py-3.5 rounded-xl transition-all uppercase tracking-[0.2em] group/item flex items-center justify-between">
                          {subItem}
                          <ArrowRight size={10} className="opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all text-accent-orange" />
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2 pr-2">
          <button
            onClick={toggleTheme}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="hidden sm:flex items-center gap-1">
            <Link to="/login">
              <button className="text-[11px] font-bold text-zinc-300 hover:text-white px-4 py-3 transition-all">
                Login
              </button>
            </Link>
            <Link to="/register">
              <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-full text-[11px] font-bold transition-all flex items-center gap-2">
                Join <ArrowRight size={14} className="opacity-50" />
              </button>
            </Link>
          </div>

          <div className="sm:hidden flex items-center gap-1">
            <Link to="/login" className="text-[10px] font-bold text-zinc-300 px-2">Login</Link>
          </div>

          <button onClick={toggleMenu} className="lg:hidden p-2 text-white hover:bg-white/5 rounded-full transition-colors">
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 right-0 mt-4 bg-[#1a1a1a] rounded-3xl p-6 border border-white/10 lg:hidden shadow-2xl overflow-hidden"
            >
              <div className="flex flex-col gap-2">
                <Link to="/" onClick={() => setIsOpen(false)} className="text-sm font-bold text-zinc-300 hover:text-white py-3 border-b border-white/5">Home</Link>
                {menuItems.map(item => (
                  <Link key={item.name} to={item.path} onClick={() => setIsOpen(false)} className="text-sm font-bold text-zinc-300 hover:text-white py-3 border-b border-white/5">{item.name}</Link>
                ))}
                <Link to="/register" onClick={() => setIsOpen(false)} className="text-sm font-bold text-accent-orange py-3">Open Account</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    );
  }

  // Authenticated High-Fidelity TopBar Redesign
  return (
    <nav className="relative z-40 w-full border-b border-border bg-background/90 backdrop-blur-2xl transition-all duration-500 blueprint-grid-dashed-small overflow-visible shrink-0">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-orange/50 to-transparent opacity-50" />

      <div className="flex h-16 md:h-20 items-center justify-between px-4 md:px-12 relative z-10">

        <div className="flex items-center gap-4 md:gap-10">
          <button onClick={toggleMenu} className="md:hidden p-2 text-foreground/40 hover:text-foreground">
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="hidden xl:flex items-center gap-4 py-2.5 px-6 bg-foreground/[0.03] rounded-full border border-border group focus-within:border-accent-orange/50 focus-within:bg-accent-orange/[0.02] transition-all">
            <Search size={14} className="text-foreground/20 group-focus-within:text-accent-orange transition-colors" />
            <input
              type="text"
              placeholder="SEARCH TERMINAL..."
              className="bg-transparent border-none outline-none text-[9px] font-black uppercase tracking-[0.3em] w-56 placeholder:text-foreground/10 text-foreground"
            />
          </div>

          <div className="flex items-center gap-3">
            <Zap size={20} className="text-accent-orange fill-accent-orange" />
            <span className="hidden sm:block text-base font-black uppercase tracking-tighter">EstateX</span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-6">
          <div className="hidden sm:flex items-center gap-3 px-5 py-2.5 border border-border rounded-full bg-foreground/[0.02] group hover:border-accent-orange/30 transition-colors">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/40 group-hover:text-foreground transition-colors">NODE: ONLINE</span>
          </div>

          <div className="flex items-center gap-1 md:gap-3 bg-foreground/[0.03] p-1 rounded-full border border-border">
            <button onClick={toggleTheme} className="p-2 md:p-2.5 text-foreground/20 hover:text-foreground hover:bg-background rounded-full transition-all">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="p-2 md:p-2.5 text-foreground/20 hover:text-accent-orange hover:bg-background rounded-full transition-all">
              <Bell size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <Link to="/dashboard/profile" className="flex items-center gap-3 pl-1.5 pr-1.5 md:pr-5 py-1.5 bg-foreground/5 hover:bg-accent-orange/[0.05] border border-border rounded-full transition-all group">
              <div className="h-8 w-8 md:h-9 md:w-9 bg-accent-orange text-white rounded-full flex items-center justify-center font-black text-xs shadow-[0_0_20px_rgba(255,95,5,0.3)]">
                {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="hidden lg:flex flex-col items-start leading-none gap-1">
                <span className="text-[10px] font-black uppercase tracking-tight text-foreground">{user?.first_name || 'User'}</span>
                <span className="text-[8px] font-bold text-accent-orange uppercase tracking-[0.2em]">Profile</span>
              </div>
            </Link>

            <button onClick={handleLogout} className="p-2.5 md:p-3.5 border border-border rounded-full text-foreground/20 hover:text-red-500 hover:bg-red-500/5 transition-all group flex items-center justify-center bg-foreground/[0.02]">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="p-6 space-y-4">
              {[
                { name: 'Dashboard', path: '/dashboard', icon: LayoutGrid },
                { name: 'IPO Center', path: '/ipo', icon: Zap },
                { name: 'Explore', path: '/explore', icon: Search },
                { name: 'Trade', path: '/trade', icon: ArrowLeftRight },
                { name: 'Portfolio', path: '/dashboard/portfolio', icon: TrendingUp },
                { name: 'Wallet', path: '/dashboard/wallet', icon: Wallet },
              ].map((link) => (
                <Link key={link.name} to={link.path} onClick={() => setIsOpen(false)} className="flex items-center gap-4 p-4 bg-foreground/[0.03] border border-border rounded-2xl text-[11px] font-black uppercase tracking-widest text-foreground/40 hover:text-accent-orange transition-all">
                  <link.icon size={18} /> {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
