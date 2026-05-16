import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, 
  Building2, 
  ArrowLeftRight, 
  TrendingUp, 
  Wallet, 
  ShieldCheck, 
  HelpCircle, 
  LogOut,
  Bell,
  Settings,
  PlusCircle,
  Briefcase,
  Search,
  Zap,
  Activity,
  Terminal
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const baseLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutGrid, exact: true, protected: true },
    { name: 'IPO Center', path: '/ipo', icon: Zap },
    { name: 'Explore', path: '/explore', icon: Search },
    { name: 'Trade', path: '/trade', icon: ArrowLeftRight, protected: true },
    { name: 'Portfolio', path: '/dashboard/portfolio', icon: TrendingUp, protected: true },
    { name: 'Wallet', path: '/dashboard/wallet', icon: Wallet, protected: true },
  ];

  const roleLinks = [];
  if (user?.role === 'builder') {
    roleLinks.push(
      { name: 'My Projects', path: '/dashboard/my-projects', icon: Briefcase, protected: true },
      { name: 'Add Asset', path: '/dashboard/add-property', icon: PlusCircle, protected: true }
    );
  }
  
  if (user?.role === 'admin') {
    roleLinks.push(
      { name: 'Admin Node', path: '/admin', icon: ShieldCheck, protected: true }
    );
  }

  const allLinks = [...baseLinks, ...roleLinks].filter(link => !link.protected || isAuthenticated);

  const bottomLinks = [
    { name: 'Settings', path: '/dashboard/profile', icon: Settings, protected: true },
    { name: 'Help', path: '/help', icon: HelpCircle },
  ].filter(link => !link.protected || isAuthenticated);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="w-16 md:w-24 flex-shrink-0 hidden md:flex flex-col border-r border-border bg-background z-50 transition-all duration-500 blueprint-grid-dashed-small relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full bg-accent-orange/[0.02] pointer-events-none" />

      {/* Branding Section */}
      <div className="h-20 md:h-24 flex items-center justify-center border-b border-border relative group">
        <div className="w-10 h-10 bg-accent-orange flex items-center justify-center rounded-full transition-transform group-hover:scale-110 shadow-[0_0_20px_rgba(255,95,5,0.4)]">
          <Zap className="text-white fill-white" size={20} />
        </div>
        <div className="absolute -bottom-[1px] left-0 w-full h-[1px] bg-accent-orange/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 py-10 flex flex-col items-center gap-4 md:gap-8 overflow-y-auto scrollbar-hide relative z-10">
        {allLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path || (link.exact === false && location.pathname.startsWith(link.path));
          
          return (
            <NavLink
              key={link.name}
              to={link.path}
              end={link.exact}
              className={({ isActive }) =>
                `relative group p-3 md:p-4 transition-all duration-300 rounded-2xl flex items-center justify-center ${
                  isActive 
                  ? 'bg-accent-orange/10 text-accent-orange shadow-[0_0_20px_rgba(255,95,5,0.1)]' 
                  : 'text-foreground/20 hover:text-foreground hover:bg-foreground/[0.03]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} className="transition-transform group-hover:scale-110" />
                  
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-active-indicator"
                      className="absolute -right-3 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent-orange rounded-full shadow-[0_0_15px_rgba(255,95,5,0.8)]" 
                    />
                  )}

                  {/* High-Fidelity Tooltip */}
                  <div className="absolute left-full ml-6 px-4 py-2 bg-foreground text-background text-[9px] font-black uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 pointer-events-none transition-all duration-300 whitespace-nowrap z-[100] rounded-lg shadow-2xl">
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-foreground rotate-45" />
                    {link.name}
                  </div>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Status & Actions */}
      <div className="py-8 flex flex-col items-center gap-6 border-t border-border bg-foreground/[0.01]">
        {/* Terminal Status Indicator */}
        <div className="flex flex-col items-center gap-1 opacity-40 group hover:opacity-100 transition-opacity">
           <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[7px] font-black uppercase tracking-tighter">SECURED</span>
        </div>

        <div className="flex flex-col gap-4">
          {bottomLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.path}
                className="text-foreground/20 hover:text-foreground transition-all p-3 hover:bg-foreground/[0.03] rounded-xl"
              >
                <Icon size={18} strokeWidth={1.5} />
              </NavLink>
            );
          })}
          
          <button 
            onClick={handleLogout}
            className="text-foreground/20 hover:text-red-500 transition-all p-3 hover:bg-red-500/5 rounded-xl group"
            title="Terminate Session"
          >
            <LogOut size={18} strokeWidth={1.5} className="group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
