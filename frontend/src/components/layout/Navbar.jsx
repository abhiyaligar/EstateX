import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu, X, ChevronDown, Search,
  Zap, ArrowRight, Sun, Moon, LogOut, Bell,
  LayoutGrid, ArrowLeftRight, TrendingUp, Wallet,
  ShieldCheck, PlusCircle, Briefcase,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeSwitch from '../ui/ThemeSwitch';

// ─── PILL NAV (Landing pages) ────────────────────────────────────────────────
// Used in MainLayout: /, /trading, /solutions, /who-we-serve, /company
export const LandingNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const { isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const menuItems = [
    { name: 'Trading', path: '/trading', dropdown: ['Institutional', 'Derivatives', 'Liquidity'] },
    { name: 'Solutions', path: '/solutions', dropdown: ['API', 'Yield', 'Custody'] },
    { name: 'Who We Serve', path: '/who-we-serve', dropdown: ['Family Offices', 'Asset Managers', 'Builders'] },
    { name: 'Company', path: '/company', dropdown: ['About Us', 'Careers', 'Contact'] },
  ];

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl scrypt-nav rounded-full px-2 py-2 flex items-center justify-between transition-all">
      {/* Left: Logo + Nav Links */}
      <div className="flex items-center gap-4 lg:gap-8 pl-4">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Zap size={20} className="text-accent-orange fill-accent-orange" />
          <span className="text-lg md:text-xl font-heading font-black tracking-tighter text-white uppercase">EstateX</span>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          <Link to="/" className={`text-[11px] font-bold px-6 py-2.5 rounded-full transition-all ${location.pathname === '/' ? 'scrypt-pill-active' : 'text-white/70 hover:text-white'}`}>Home</Link>

          {menuItems.map((item) => (
            <div
              key={item.name}
              className="relative"
              onMouseEnter={() => setActiveDropdown(item.name)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link to={item.path}>
                <button className={`text-[11px] font-bold px-4 py-2.5 rounded-full transition-all flex items-center gap-1 ${location.pathname === item.path ? 'scrypt-pill-active' : 'text-white/70 hover:text-white'}`}>
                  {item.name} <ChevronDown size={12} className={`transition-transform duration-300 ${activeDropdown === item.name ? 'rotate-180' : ''}`} />
                </button>
              </Link>

              <AnimatePresence>
                {activeDropdown === item.name && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 mt-4 w-56 bg-background/90 backdrop-blur-3xl border border-border rounded-[24px] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-50"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-orange/5 to-transparent pointer-events-none" />
                    {item.dropdown.map(subItem => {
                      const targetId = subItem.toLowerCase().replace(/\s+/g, '-');
                      return (
                        <Link 
                          key={subItem} 
                          to={`${item.path}#${targetId}`}
                          onClick={(e) => {
                            setActiveDropdown(null);
                            // If we are already on the target page, manually scroll to prevent React Router from ignoring the click
                            if (location.pathname === item.path) {
                              const element = document.getElementById(targetId);
                              if (element) {
                                const y = element.getBoundingClientRect().top + window.scrollY - 120;
                                window.scrollTo({ top: y, behavior: 'smooth' });
                              }
                            }
                          }}
                          className="relative w-full text-left text-[10px] font-black text-foreground/50 hover:text-foreground hover:bg-foreground/5 px-5 py-3.5 rounded-xl transition-all uppercase tracking-[0.2em] group/item flex items-center justify-between"
                        >
                          {subItem}
                          <ArrowRight size={10} className="opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all text-accent-orange" />
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Theme + Auth actions */}
      <div className="flex items-center gap-1 md:gap-3 pr-2">
        <ThemeSwitch isPublic={true} />

        {isAuthenticated ? (
          <div className="hidden sm:flex items-center gap-2">
            <Link to="/dashboard">
              <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-full text-[11px] font-bold transition-all flex items-center gap-2">
                Dashboard <ArrowRight size={13} className="opacity-70" />
              </button>
            </Link>
            <Link to="/trade">
              <button className="bg-accent-orange hover:bg-accent-orange/80 text-white px-6 py-2.5 rounded-full text-[11px] font-bold transition-all flex items-center gap-2">
                Trade <ArrowRight size={13} className="opacity-70" />
              </button>
            </Link>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-full text-white/50 hover:text-white transition-colors"
              title="Logout"
            >
              <LogOut size={17} />
            </button>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-1">
            <Link to="/login">
              <button className="text-[11px] font-bold text-white/70 hover:text-white px-4 py-3 transition-all">Login</button>
            </Link>
            <Link to="/register">
              <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-full text-[11px] font-bold transition-all flex items-center gap-2">
                Join <ArrowRight size={14} className="opacity-50" />
              </button>
            </Link>
          </div>
        )}

        <div className="sm:hidden flex items-center gap-1">
          {isAuthenticated
            ? <Link to="/dashboard" className="text-[10px] font-bold text-accent-orange px-2">App</Link>
            : <Link to="/login" className="text-[10px] font-bold text-white/70 px-2">Login</Link>
          }
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 text-white/70 hover:text-white rounded-full transition-colors">
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 mt-4 bg-background rounded-3xl p-6 border border-border lg:hidden shadow-2xl"
          >
            <div className="flex flex-col gap-2">
              <motion.div whileTap={{ scale: 0.95, backgroundColor: "rgba(234, 179, 8, 0.1)" }} className="rounded-lg">
                <Link to="/" onClick={() => setIsOpen(false)} className="block text-sm font-bold text-foreground/70 px-4 py-3 border-b border-border">Home</Link>
              </motion.div>
              {menuItems.map(item => (
                <motion.div key={item.name} whileTap={{ scale: 0.95, backgroundColor: "rgba(234, 179, 8, 0.1)" }} className="rounded-lg">
                  <Link to={item.path} onClick={() => setIsOpen(false)} className="block text-sm font-bold text-foreground/70 px-4 py-3 border-b border-border">{item.name}</Link>
                </motion.div>
              ))}
              {isAuthenticated ? (
                <>
                  <motion.div whileTap={{ scale: 0.95, backgroundColor: "rgba(234, 179, 8, 0.1)" }} className="rounded-lg">
                    <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block text-sm font-bold text-foreground/70 px-4 py-3">Dashboard</Link>
                  </motion.div>
                  <motion.div whileTap={{ scale: 0.95, backgroundColor: "rgba(234, 179, 8, 0.1)" }} className="rounded-lg">
                    <Link to="/trade" onClick={() => setIsOpen(false)} className="block text-sm font-bold text-accent-orange px-4 py-3">Trade Now</Link>
                  </motion.div>
                  <motion.div whileTap={{ scale: 0.95, backgroundColor: "rgba(239, 68, 68, 0.1)" }} className="rounded-lg">
                    <button onClick={handleLogout} className="block w-full text-sm font-bold text-foreground/40 px-4 py-3 text-left">Logout</button>
                  </motion.div>
                </>
              ) : (
                <motion.div whileTap={{ scale: 0.95, backgroundColor: "rgba(234, 179, 8, 0.1)" }} className="rounded-lg">
                  <Link to="/register" onClick={() => setIsOpen(false)} className="block text-sm font-bold text-accent-orange px-4 py-3">Open Account</Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// ─── APP TOP BAR (Dashboard & authenticated app pages) ───────────────────────
// Used in DashboardLayout: /dashboard/*, /ipo, /explore, /help, /properties/:id
export const AppNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="relative z-40 w-full border-b border-border bg-background transition-all duration-300 overflow-visible shrink-0">
      {/* Subtle orange accent line at top */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-orange/40 to-transparent" />

      <div className="flex h-16 md:h-20 items-center justify-between px-4 md:px-8 relative z-10">

        {/* Left: Logo (→ landing page) + Search bar beside it */}
        <div className="flex items-center gap-4 md:gap-5">
          {/* Mobile hamburger */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-foreground/40 hover:text-foreground">
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo — always links back to landing page */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="h-9 w-9 bg-accent-orange rounded-full flex items-center justify-center shadow-[0_0_16px_rgba(176, 38, 255,0.35)] transition-transform group-hover:scale-110">
              <Zap size={18} className="text-white fill-white" />
            </div>
          </Link>

          {/* Search bar — right beside the logo */}
          <div className="hidden xl:flex items-center gap-3 py-2.5 px-5 bg-foreground/[0.04] rounded-full border border-border group focus-within:border-accent-orange/50 focus-within:bg-accent-orange/[0.02] transition-all">
            <Search size={13} className="text-foreground/20 group-focus-within:text-accent-orange transition-colors shrink-0" />
            <input
              type="text"
              placeholder="SEARCH TERMINAL..."
              className="bg-transparent border-none outline-none text-[9px] font-black uppercase tracking-[0.3em] w-48 placeholder:text-foreground/20 text-foreground"
            />
          </div>
        </div>

        {/* Right: Status + Theme + User + Logout */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* NODE ONLINE */}
          <div className="hidden sm:flex items-center gap-2.5 px-4 py-2 border border-border rounded-full bg-foreground/[0.02] hover:border-accent-orange/30 transition-colors">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-foreground/40">NODE: ONLINE</span>
          </div>

          {/* Theme + Bell */}
          <div className="flex items-center gap-1 bg-foreground/[0.03] p-1 rounded-full border border-border">
            <ThemeSwitch />
            <button className="p-2 text-foreground/30 hover:text-accent-orange hover:bg-foreground/5 rounded-full transition-all">
              <Bell size={17} />
            </button>
          </div>

          {/* User profile pill */}
          <Link to="/dashboard/profile" className="flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 bg-foreground/[0.04] hover:bg-accent-orange/[0.06] border border-border rounded-full transition-all group">
            <div className="h-8 w-8 bg-accent-orange text-white rounded-full flex items-center justify-center font-black text-xs shadow-[0_0_16px_rgba(176, 38, 255,0.3)]">
              {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="hidden lg:flex flex-col items-start leading-none gap-0.5">
              <span className="text-[10px] font-black uppercase tracking-tight text-foreground">{user?.first_name || 'User'}</span>
              <span className="text-[8px] font-bold text-accent-orange uppercase tracking-[0.2em]">Profile</span>
            </div>
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2.5 border border-border rounded-full text-foreground/25 hover:text-red-500 hover:bg-red-500/5 hover:border-red-500/30 transition-all bg-foreground/[0.02]"
            title="Logout"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="flex flex-col">
              {(() => {
                const baseLinks = [
                  { name: 'Dashboard', path: '/dashboard', icon: LayoutGrid },
                  { name: 'IPO Center', path: '/ipo', icon: Zap },
                  { name: 'Explore', path: '/explore', icon: Search },
                  { name: 'Trade', path: '/trade', icon: ArrowLeftRight },
                  { name: 'Portfolio', path: '/dashboard/portfolio', icon: TrendingUp },
                  { name: 'Wallet', path: '/dashboard/wallet', icon: Wallet },
                ];
                const roleLinks = [];
                if (user?.role === 'builder') {
                  roleLinks.push(
                    { name: 'My Projects', path: '/dashboard/my-projects', icon: Briefcase },
                    { name: 'Add Asset', path: '/dashboard/add-property', icon: PlusCircle }
                  );
                } else if (user?.role === 'admin') {
                  roleLinks.push(
                    { name: 'Admin Node', path: '/admin', icon: ShieldCheck }
                  );
                }
                const allLinks = [...baseLinks, ...roleLinks];

                return allLinks.map((link) => {
                  const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
                  return (
                    <motion.div
                      key={link.name}
                      whileTap={{ scale: 0.95 }}
                      className="w-full relative mb-1"
                    >
                      <Link
                        to={link.path}
                        onClick={(e) => {
                          // Prevent immediate navigation/close to allow the touch animation to play
                          e.preventDefault();
                          setTimeout(() => {
                            setIsOpen(false);
                            window.location.href = link.path; // Navigate after animation
                          }, 150);
                        }}
                        className={`group relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ease-out ${
                          isActive 
                            ? 'bg-accent-orange/10 text-accent-orange shadow-[0_0_20px_rgba(234,179,8,0.05)]' 
                            : 'text-foreground/50 bg-transparent hover:bg-accent-orange/5 hover:text-accent-orange hover:scale-[1.03] hover:-translate-y-0.5 hover:shadow-[0_15px_35px_rgba(234,179,8,0.15)] border border-transparent hover:border-accent-orange/20 hover:z-10'
                        }`}
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        <div className={`${isActive ? 'text-accent-orange' : 'text-foreground/40 group-hover:text-accent-orange'} transition-colors duration-300`}>
                          <link.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} className="transition-transform duration-300 group-hover:scale-110" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">{link.name}</span>
                        
                        {isActive && (
                          <motion.div 
                            layoutId="mobile-active-indicator"
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-accent-orange rounded-full shadow-[0_0_10px_rgba(234,179,8,0.8)]" 
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                });
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// ─── Default export: used by layouts ─────────────────────────────────────────
// MainLayout imports LandingNav, DashboardLayout imports AppNav directly.
// This default export is kept for backward compatibility.
const Navbar = LandingNav;
export default Navbar;
