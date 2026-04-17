import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] text-white font-sans">
      <Navbar />
      <main className="flex-grow pt-16">
        {/* pt-16 accounts for fixed navbar height */}
        <div className="mx-auto w-full max-w-7xl">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
