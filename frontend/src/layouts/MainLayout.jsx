import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';

const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] text-white font-sans selection:bg-[#D4AF37]/30">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Universal Sidebar Node */}
        <Sidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto w-full scrollbar-hide">
          <div className="mx-auto w-full">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
