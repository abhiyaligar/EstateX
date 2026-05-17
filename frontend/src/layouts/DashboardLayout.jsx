import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { AppNav } from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { useAuth } from '../context/AuthContext';

// DashboardLayout = All authenticated app pages (/dashboard/*, /ipo, /explore, /help, etc.)
// Always renders: App TopBar (Navbar) + Sidebar + Page Content
const DashboardLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 bg-accent-orange/10 rounded-full flex items-center justify-center animate-pulse border border-accent-orange/20">
            <svg className="w-5 h-5 text-accent-orange" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" />
            </svg>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/30 animate-pulse">Initializing Terminal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      {/* Top Nav Bar — full width, always at top */}
      <AppNav />

      {/* Body: Sidebar + Content side by side */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — desktop only, fixed width */}
        <Sidebar />

        {/* Main scrollable content area */}
        <main className="flex-1 overflow-y-auto w-full min-w-0 scrollbar-hide">
          <div className="mx-auto w-full min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
