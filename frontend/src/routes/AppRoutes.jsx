import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Layouts
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// UI Components
import PageLoader from '../components/ui/PageLoader';

// Lazy Loaded Pages
const Home = lazy(() => import('../pages/Home'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const AuthCallback = lazy(() => import('../pages/AuthCallback'));
const Properties = lazy(() => import('../pages/Properties'));
const PropertyDetails = lazy(() => import('../pages/PropertyDetails'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const AddProperty = lazy(() => import('../pages/AddProperty'));
const Profile = lazy(() => import('../pages/Profile'));
const Wallet = lazy(() => import('../pages/Wallet'));
const KYC = lazy(() => import('../pages/KYC'));
const Portfolio = lazy(() => import('../pages/Portfolio'));
const TradingRoom = lazy(() => import('../pages/TradingRoom'));
const AdminPortal = lazy(() => import('../pages/AdminPortal'));
const MarketExplore = lazy(() => import('../pages/MarketExplore'));
const Help = lazy(() => import('../pages/Help'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const BuilderWallet = lazy(() => import('../pages/BuilderWallet'));
const BuilderVerification = lazy(() => import('../pages/BuilderVerification'));
const MyProjects = lazy(() => import('../pages/MyProjects'));

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
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes with Main Layout */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/ipo" element={<Properties />} />
              <Route path="/explore" element={<MarketExplore />} />
              <Route path="/properties" element={<Navigate to="/ipo" replace />} />
              <Route path="/properties/:id" element={<PropertyDetails />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/help" element={<Help />} />
              <Route path="/unauthorized" element={<div className="p-20 text-center">Unauthorized Access</div>} />
            </Route>

            {/* Standalone Auth Routes (They have their own headers) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Full Screen Protected Routes (No shared layout) */}
            <Route path="/trade" element={
              <ProtectedRoute>
                <TradingRoom />
              </ProtectedRoute>
            } />

            <Route path="/market-explore" element={
              <ProtectedRoute>
                <MarketExplore />
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
            </Route>

            {/* Admin Portal (Full Screen) */}
            <Route path="/admin" element={
              <ProtectedRoute roles={['admin']}>
                <AdminPortal />
              </ProtectedRoute>
            } />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default AppRoutes;
