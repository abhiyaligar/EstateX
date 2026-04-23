import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Layouts
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Pages - Lazy Loaded
const Home = lazy(() => import('../pages/Home'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Properties = lazy(() => import('../pages/Properties'));
const PropertyDetails = lazy(() => import('../pages/PropertyDetails'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const AddProperty = lazy(() => import('../pages/AddProperty'));
const Profile = lazy(() => import('../pages/Profile'));
const Wallet = lazy(() => import('../pages/Wallet'));
const KYC = lazy(() => import('../pages/KYC'));
const Portfolio = lazy(() => import('../pages/Portfolio'));
const SecondaryMarket = lazy(() => import('../pages/SecondaryMarket'));
const TradingRoom = lazy(() => import('../pages/TradingRoom'));
const AdminPortal = lazy(() => import('../pages/AdminPortal'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const BuilderWallet = lazy(() => import('../pages/BuilderWallet'));
const BuilderVerification = lazy(() => import('../pages/BuilderVerification'));
const MyProjects = lazy(() => import('../pages/MyProjects'));

// Loading Placeholder
const LoadingScreen = () => (
    <div className="h-screen w-full bg-[#0a0a0a] flex flex-col items-center justify-center gap-6">
        <div className="w-12 h-12 border-2 border-white/5 border-t-white animate-spin rounded-full" />
        <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-bold">Synchronizing EstateX...</p>
    </div>
);

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
        <Suspense fallback={<LoadingScreen />}>
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
              <Route path="exchange" element={<SecondaryMarket />} />
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
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default AppRoutes;
