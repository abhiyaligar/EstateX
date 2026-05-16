import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Building2, Menu, X, User, Bell, Mail, Inbox, ChevronDown, 
  ShieldCheck, PlusCircle, Briefcase, LayoutGrid, ArrowLeftRight, 
  TrendingUp, Wallet, AlertCircle, Clock, CheckCircle2, Search, 
  Zap, ArrowRight, Sun, Moon 
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
  const [showInbox, setShowInbox] = useState(false);
  const [navData, setNavData] = useState({ nav: 0, loading: true });
  const { isAuthenticated, logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

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
          const stats = await dashboardService.getStats();
          setNavData({ nav: stats.notifications_count || 0, loading: false });
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
        {/* ... (Logo and Desktop Menu) ... */}
        <div className="flex items-center gap-4 lg:gap-8 pl-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 bg-accent-orange rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,95,5,0.4)] transition-transform hover:scale-105">
              <Zap size={20} className="text-white fill-white" />
            </div>
            <span className="text-lg md:text-xl font-heading font-black tracking-tighter text-white uppercase">EstateX</span>
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
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-2xl p-2 shadow-2xl overflow-hidden"
                    >
                      {item.dropdown.map(subItem => (
                        <button key={subItem} className="w-full text-left text-[10px] font-bold text-zinc-400 hover:text-white hover:bg-white/5 px-4 py-2.5 rounded-lg transition-all uppercase tracking-widest">
                          {subItem}
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

  // ... (rest of authenticated navbar logic)
  return (
    <nav className={`fixed top-0 z-50 w-full border-b transition-colors ${theme === 'dark' ? 'bg-[#050505] border-white/5' : 'bg-white border-black/5'}`}>
       <div className="mx-auto flex h-16 md:h-20 max-w-[1600px] items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-10">
             <Link to="/dashboard" className="flex items-center gap-3">
                <div className="h-8 w-8 bg-accent-orange rounded-full flex items-center justify-center">
                  <Zap size={16} className="text-white fill-white" />
                </div>
                <span className={`text-sm font-black tracking-widest uppercase ${theme === 'dark' ? 'text-white' : 'text-black'}`}>EstateX</span>
             </Link>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={toggleTheme}
              className={`p-2 transition-colors ${theme === 'dark' ? 'text-zinc-500 hover:text-white' : 'text-zinc-400 hover:text-black'}`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={logout} className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-zinc-500 hover:text-white' : 'text-zinc-400 hover:text-black'}`}>Logout</button>
          </div>
       </div>
    </nav>
  );
};

export default Navbar;
