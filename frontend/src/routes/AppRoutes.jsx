import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Layouts
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Properties from '../pages/Properties';
import PropertyDetails from '../pages/PropertyDetails';
import Dashboard from '../pages/Dashboard';
import AddProperty from '../pages/AddProperty';
import Profile from '../pages/Profile';
import Wallet from '../pages/Wallet';
import KYC from '../pages/KYC';
import Portfolio from '../pages/Portfolio';
import TradingRoom from '../pages/TradingRoom';
import AdminPortal from '../pages/AdminPortal';

import ForgotPassword from '../pages/ForgotPassword';
import BuilderWallet from '../pages/BuilderWallet';
import BuilderVerification from '../pages/BuilderVerification';
import MyProjects from '../pages/MyProjects';

// Protected Route Component
const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes with Main Layout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/properties/:id" element={<PropertyDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/unauthorized" element={<div className="p-20 text-center">Unauthorized Access</div>} />
          </Route>

          {/* Full Screen Protected Routes (No shared layout) */}
          <Route path="/trade" element={
            <ProtectedRoute>
              <TradingRoom />
            </ProtectedRoute>
          } />

          {/* Protected Routes with Dashboard Layout */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="kyc" element={<KYC />} />
            <Route 
              path="add-property" 
              element={
                <ProtectedRoute roles={['builder', 'admin']}>
                  <AddProperty />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="builder-wallet" 
              element={
                <ProtectedRoute roles={['builder']}>
                  <BuilderWallet />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="verification" 
              element={
                <ProtectedRoute roles={['builder']}>
                  <BuilderVerification />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="my-projects" 
              element={
                <ProtectedRoute roles={['builder']}>
                  <MyProjects />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="admin" 
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminPortal />
                </ProtectedRoute>
              } 
            />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default AppRoutes;
