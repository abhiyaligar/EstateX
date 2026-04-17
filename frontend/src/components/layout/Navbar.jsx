import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building2, Menu, X, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Properties', path: '/properties' },
    { name: 'About', path: '/about' },
    ...(isAuthenticated ? [{ name: 'Exchange', path: '/dashboard/exchange' }] : []),
  ];

  const dashboardLinks = [
    { name: 'Overview', path: '/dashboard' },
    { name: 'Exchange', path: '/dashboard/exchange' },
    { name: 'My Portfolio', path: '/dashboard/portfolio' },
    { name: 'Wallet', path: '/dashboard/wallet' },
    { name: 'KYC Verification', path: '/dashboard/kyc' },
    { name: 'My Profile', path: '/dashboard/profile' },
    // Role-specific links
    ...(user?.role === 'builder' || user?.role === 'admin' 
      ? [{ name: 'Add Property', path: '/dashboard/add-property' }] 
      : []),
    ...(user?.role === 'admin' 
      ? [{ name: 'Admin Portal', path: '/dashboard/admin' }] 
      : []),
  ];

  return (
    <nav className={`fixed top-0 z-40 w-full border-b border-white/5 transition-all duration-500 ${isOpen ? 'bg-black' : 'bg-transparent backdrop-blur-sm'}`}>
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-12">
        
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-3 group" onClick={closeMenu}>
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-accent-red">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-[0.2em] uppercase text-white">
              EstateX
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-12">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-[11px] uppercase tracking-[0.15em] font-medium transition-all duration-300 hover:text-white ${
                location.pathname === link.path
                  ? 'text-white'
                  : 'text-white/50'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex md:items-center md:space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" className="hidden lg:flex" leftIcon={<User size={18} />}>
                  Dashboard
                </Button>
              </Link>
              <Button onClick={logout} variant="outline" size="sm">
                Log Out
              </Button>
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Log In</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center md:hidden">
          <button
            onClick={toggleMenu}
            className="inline-flex items-center justify-center rounded-md p-2 text-secondary-500 hover:bg-secondary-100 hover:text-secondary-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 dark:hover:bg-secondary-800 dark:hover:text-white"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass border-b border-secondary-200 shadow-xl dark:border-secondary-800">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {(isAuthenticated ? dashboardLinks : navLinks).map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={closeMenu}
                className={`block rounded-md px-3 py-2 text-base font-medium ${
                  location.pathname === link.path
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-400'
                    : 'text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900 dark:text-secondary-300 dark:hover:bg-secondary-800 dark:hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="border-t border-secondary-200 pb-4 pt-4 dark:border-secondary-800">
            {isAuthenticated ? (
              <div className="space-y-3 px-4">
                <div className="flex items-center gap-3 mb-4">
                   <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold dark:bg-primary-900 dark:text-primary-300">
                      {user?.name?.[0] || 'U'}
                   </div>
                   <div>
                      <div className="text-base font-medium text-secondary-800 dark:text-white">{user?.name || 'User'}</div>
                      <div className="text-sm font-medium text-secondary-500 dark:text-secondary-400">{user?.email}</div>
                   </div>
                </div>
                <Link to="/dashboard" onClick={closeMenu}>
                  <Button className="w-full justify-start mb-2" variant="outline" leftIcon={<User size={18} />}>
                    Dashboard
                  </Button>
                </Link>
                <Button
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                >
                  Log out
                </Button>
              </div>
            ) : (
              <div className="space-y-3 px-4">
                <Link to="/login" onClick={closeMenu} className="block w-full">
                  <Button variant="outline" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link to="/register" onClick={closeMenu} className="block w-full">
                  <Button className="w-full">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
