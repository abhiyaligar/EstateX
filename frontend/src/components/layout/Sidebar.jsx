import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const baseLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutGrid, exact: true, protected: true },
    { name: 'IPO Center', path: '/ipo', icon: Zap },
    { name: 'Explore', path: '/explore', icon: Search },
    { name: 'Trade', path: '/trade', icon: ArrowLeftRight, protected: true },
    { name: 'Portfolio', path: '/dashboard/portfolio', icon: TrendingUp, protected: true },
    { name: 'Wallet', path: '/dashboard/wallet', icon: Wallet, protected: true },
  ];

  // Role-based links
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

  // Filter links based on authentication
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
    <aside className="w-16 md:w-20 flex-shrink-0 hidden md:flex flex-col border-r border-black/5 dark:border-white/5 bg-background z-50">
      {/* Branding */}
      <div className="h-16 md:h-20 flex items-center justify-center border-b border-black/5 dark:border-white/5">
        <span className="text-[10px] font-black text-[#D4AF37] tracking-tighter">EX</span>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 py-8 flex flex-col items-center gap-6 overflow-y-auto scrollbar-hide">
        {allLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              end={link.exact}
              title={link.name}
              className={({ isActive }) =>
                `relative group p-3 transition-all duration-500 rounded-none ${
                  isActive ? 'text-[#D4AF37]' : 'text-zinc-700 hover:text-foreground'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-active"
                      className="absolute right-0 top-0 w-[2px] h-full bg-surface shadow-[0_0_10px_rgba(212,175,55,0.5)]" 
                    />
                  )}
                  {/* Tooltip */}
                  <div className="absolute left-full ml-4 px-2 py-1 bg-background border border-black/10 dark:border-white/10 text-[8px] font-black uppercase tracking-widest text-foreground opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100]">
                    {link.name}
                  </div>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="py-8 flex flex-col items-center gap-6 border-t border-black/5 dark:border-white/5">
        {bottomLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              title={link.name}
              className="text-zinc-700 hover:text-foreground transition-colors p-3"
            >
              <Icon size={18} strokeWidth={1.5} />
            </NavLink>
          );
        })}
        <button 
          onClick={handleLogout}
          className="text-zinc-700 hover:text-red-500 transition-colors p-3"
          title="Logout"
        >
          <LogOut size={18} strokeWidth={1.5} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
