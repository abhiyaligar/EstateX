import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';

const MainLayout = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-accent-orange/10 overflow-hidden">
      {/* Sidebar - Only visible for authenticated users */}
      {isAuthenticated && <Sidebar />}
      
      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden relative">
        <Navbar />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto w-full scrollbar-hide">
          <div className="mx-auto w-full min-h-full">
            <Outlet />
          </div>
          {!isAuthenticated && <Footer />}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
