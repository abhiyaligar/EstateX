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
    { name: 'Trade', path: '/trade' },
    { name: 'About', path: '/about' },
  ];

  return (
    <nav className={`fixed top-0 z-40 w-full border-b border-white/5 transition-all duration-500 overflow-hidden ${isOpen ? 'bg-black' : 'bg-transparent backdrop-blur-md'}`}>
      <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-12">
        
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-3 group" onClick={closeMenu}>
            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius)] bg-white">
              <Building2 className="h-5 w-5 text-black" />
            </div>
            <span className="text-xl font-bold tracking-tighter uppercase text-white font-heading">
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
              className={`text-[10px] uppercase tracking-[0.2em] font-semibold transition-all duration-300 hover:text-white ${
                location.pathname === link.path
                  ? 'text-white'
                  : 'text-zinc-500'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex md:items-center md:space-x-6">
          {isAuthenticated ? (
            <div className="flex items-center gap-6">
              <Link to="/dashboard">
                <Button variant="ghost" className="hidden lg:flex" leftIcon={<User size={16} />}>
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
                <Button size="sm" className="px-8 shadow-xl shadow-white/5">Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center md:hidden">
          <button
            onClick={toggleMenu}
            className="inline-flex items-center justify-center rounded-[var(--radius)] p-2 text-zinc-400 hover:bg-white/5 hover:text-white focus:outline-none"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-2xl border-b border-white/5">
          <div className="space-y-1 px-4 pb-6 pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={closeMenu}
                className={`block rounded-[var(--radius)] px-4 py-3 text-sm font-semibold uppercase tracking-widest ${
                  location.pathname === link.path
                    ? 'bg-white/10 text-white'
                    : 'text-zinc-500 hover:bg-white/5 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="border-t border-white/5 pb-8 pt-6 px-4">
            {isAuthenticated ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                   <div className="h-12 w-12 rounded-[var(--radius)] bg-white/5 flex items-center justify-center text-white font-bold border border-white/10">
                      {user?.name?.[0] || 'U'}
                   </div>
                   <div>
                      <div className="text-base font-semibold text-white">{user?.name || 'User'}</div>
                      <div className="text-xs font-medium text-zinc-500 tracking-wide">{user?.email}</div>
                   </div>
                </div>
                <Link to="/dashboard" onClick={closeMenu}>
                  <Button className="w-full justify-start py-6" variant="outline" leftIcon={<User size={18} />}>
                    Dashboard
                  </Button>
                </Link>
                <Button
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  variant="ghost"
                  className="w-full justify-start text-red-400 hover:bg-red-500/10"
                >
                  Log out
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Link to="/login" onClick={closeMenu} className="block w-full">
                  <Button variant="outline" className="w-full py-6">
                    Log in
                  </Button>
                </Link>
                <Link to="/register" onClick={closeMenu} className="block w-full">
                  <Button className="w-full py-6">
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
