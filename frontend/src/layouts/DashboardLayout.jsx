import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Loading Dashboard...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-sans">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for Desktop */}
         <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto w-full">
           <div className="mx-auto w-full">
              <Outlet />
           </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
