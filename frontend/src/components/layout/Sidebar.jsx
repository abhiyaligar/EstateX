import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UserCircle, Settings, Home, PlusCircle, Wallet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  const links = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard, exact: true },
    { name: 'My Portfolio', path: '/dashboard/portfolio', icon: Home }, // Renamed/Adjusted
    { name: 'Wallet', path: '/dashboard/wallet', icon: Wallet },
    { name: 'My Profile', path: '/dashboard/profile', icon: UserCircle },
    // Only show add property for builders or admins
    ...(user?.role === 'builder' || user?.role === 'admin' 
      ? [{ name: 'Add Property', path: '/dashboard/add-property', icon: PlusCircle }] 
      : []),
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 flex-shrink-0 hidden md:flex flex-col border-r border-secondary-200 bg-white/50 dark:border-secondary-800 dark:bg-slate-950/50">
      <div className="flex-1 overflow-y-auto pt-5 pb-4">
        <div className="flex flex-col px-4 mb-8">
           <h2 className="text-xs font-semibold uppercase tracking-wider text-secondary-500 dark:text-secondary-400">
               Dashboard Menu
           </h2>
        </div>
        <nav className="mt-5 flex-1 space-y-1 px-2">
          {links.map((link) => {
             const Icon = link.icon;
             return (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.exact}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                      : 'text-secondary-700 hover:bg-secondary-50 hover:text-secondary-900 dark:text-secondary-300 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                        isActive
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-secondary-400 group-hover:text-secondary-500 dark:group-hover:text-secondary-300'
                      }`}
                      aria-hidden="true"
                    />
                    {link.name}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
      
      {/* Return to Main Site Button */}
      <div className="p-4 border-t border-secondary-200 dark:border-secondary-800">
        <NavLink
            to="/"
            className="group flex w-full items-center px-2 py-2 text-sm font-medium rounded-xl text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900 dark:text-secondary-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
          >
            <Home className="mr-3 h-5 w-5 text-secondary-400 group-hover:text-secondary-500 dark:group-hover:text-secondary-300" />
            Back to site
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
