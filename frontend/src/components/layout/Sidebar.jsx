import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserCircle, 
  Settings, 
  Home, 
  PlusCircle, 
  Wallet, 
  ArrowLeftRight, 
  ShieldCheck, 
  Building2,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { user } = useAuth();

  const links = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard, exact: true },
    { name: 'Properties', path: '/properties', icon: Building2 },
    { name: 'Trade', path: '/trade', icon: ArrowLeftRight },
    { name: 'Market Explore', path: '/market-explore', icon: LayoutGrid },
    { name: 'My Portfolio', path: '/dashboard/portfolio', icon: Home },
    { name: user?.role === 'builder' ? 'Investor Wallet' : 'Wallet', path: '/dashboard/wallet', icon: Wallet },
    ...(user?.role === 'builder' 
      ? [{ name: 'Builder Wallet', path: '/dashboard/builder-wallet', icon: ShieldCheck }] 
      : []),
    { name: 'My Profile', path: '/dashboard/profile', icon: UserCircle },
    ...(user?.role === 'builder' || user?.role === 'admin' 
      ? [
          { name: 'My Projects', path: '/dashboard/my-projects', icon: Building2 },
          { name: 'Add Property', path: '/dashboard/add-property', icon: PlusCircle }
        ] 
      : []),
    { name: 'About', path: '/about', icon: Info },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
    ...(user?.role === 'admin' 
      ? [{ name: 'Admin Portal', path: '/admin', icon: ShieldCheck }] 
      : []),
  ];

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} flex-shrink-0 hidden md:flex flex-col border-r border-white/5 bg-black transition-all duration-300 relative`}>
      {/* Collapse Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white text-black rounded-full flex items-center justify-center border border-white/10 hover:scale-110 transition-transform z-50 shadow-xl"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className="flex-1 overflow-y-auto pt-8 pb-4">
        {!isCollapsed && (
          <div className="flex flex-col px-6 mb-8 animate-in fade-in slide-in-from-left duration-500">
             <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">
                 Dashboard Menu
             </h2>
          </div>
        )}

        <nav className={`mt-5 flex-1 space-y-2 ${isCollapsed ? 'px-3' : 'px-4'}`}>
          {links.map((link) => {
             const Icon = link.icon;
             return (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.exact}
                className={({ isActive }) =>
                  `group flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} py-3.5 text-[11px] font-bold uppercase tracking-widest rounded-none transition-all duration-300 ${
                    isActive
                      ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`
                }
                title={isCollapsed ? link.name : ''}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`h-4 w-4 flex-shrink-0 transition-colors ${
                        isActive
                          ? 'text-black'
                          : 'text-white/20 group-hover:text-white'
                      } ${!isCollapsed ? 'mr-4' : ''}`}
                    />
                    {!isCollapsed && (
                      <span className="truncate">{link.name}</span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
      
      <div className={`p-4 border-t border-white/5 ${isCollapsed ? 'flex justify-center' : ''}`}>
        <NavLink
            to="/"
            className={`group flex w-full items-center ${isCollapsed ? 'justify-center' : 'px-4'} py-3 text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-white transition-colors`}
            title={isCollapsed ? 'Home' : ''}
          >
            <Home className={`h-4 w-4 text-white/10 group-hover:text-white transition-colors ${!isCollapsed ? 'mr-4' : ''}`} />
            {!isCollapsed && <span>Home</span>}
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
