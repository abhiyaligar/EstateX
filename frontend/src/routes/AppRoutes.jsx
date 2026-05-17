import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';

// Layouts
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// UI Components
import PageLoader from '../components/ui/PageLoader';

// Lazy Loaded Pages
const Home = lazy(() => import('../pages/Home'));
const Trading = lazy(() => import('../pages/Trading'));
const Solutions = lazy(() => import('../pages/Solutions'));
const WhoWeServe = lazy(() => import('../pages/WhoWeServe'));
const Company = lazy(() => import('../pages/Company'));
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

// ─── Protected Route ────────────────────────────────────────────────────────
const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-background text-foreground/30 text-[10px] font-black uppercase tracking-widest">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// ─── Smart Layout Selector ───────────────────────────────────────────────────
// For pages like /ipo, /explore, /help, /properties/:id that exist in BOTH
// public and authenticated contexts — use DashboardLayout when logged in,
// MainLayout when not.
const SmartLayout = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-background" />;
  }

  if (isAuthenticated) {
    return <DashboardLayout />;
  }

  return <MainLayout />;
};

const AppRoutes = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>

              {/* ─── PUBLIC LANDING PAGES — MainLayout (pill nav, no sidebar) ─── */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/trading" element={<Trading />} />
                <Route path="/solutions" element={<Solutions />} />
                <Route path="/who-we-serve" element={<WhoWeServe />} />
                <Route path="/company" element={<Company />} />
                <Route path="/unauthorized" element={<div className="p-20 text-center text-foreground">Unauthorized Access</div>} />
              </Route>

              {/* ─── STANDALONE AUTH PAGES (their own layouts) ─── */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth/callback" element={<AuthCallback />} />

              {/* ─── TRADING ROOM — Full screen, its own layout (no shared nav/sidebar) ─── */}
              <Route path="/trade" element={
                <ProtectedRoute>
                  <TradingRoom />
                </ProtectedRoute>
              } />

              {/* ─── ADMIN PORTAL — Full screen ─── */}
              <Route path="/admin" element={
                <ProtectedRoute roles={['admin']}>
                  <AdminPortal />
                </ProtectedRoute>
              } />

              {/* ─── APP PAGES — DashboardLayout (top nav + sidebar) ─── */}
              {/* These are pages that require login AND show the sidebar */}
              <Route path="/ipo" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Properties />} />
              </Route>

              <Route path="/explore" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<MarketExplore />} />
              </Route>

              <Route path="/help" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Help />} />
              </Route>

              <Route path="/properties" element={<Navigate to="/ipo" replace />} />

              <Route path="/properties/:id" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<PropertyDetails />} />
              </Route>

              {/* ─── DASHBOARD — DashboardLayout ─── */}
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
                <Route path="add-property" element={
                  <ProtectedRoute roles={['builder', 'admin']}>
                    <AddProperty />
                  </ProtectedRoute>
                } />
                <Route path="builder-wallet" element={
                  <ProtectedRoute roles={['builder']}>
                    <BuilderWallet />
                  </ProtectedRoute>
                } />
                <Route path="verification" element={
                  <ProtectedRoute roles={['builder']}>
                    <BuilderVerification />
                  </ProtectedRoute>
                } />
                <Route path="my-projects" element={
                  <ProtectedRoute roles={['builder']}>
                    <MyProjects />
                  </ProtectedRoute>
                } />
              </Route>

              {/* ─── FALLBACK ─── */}
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default AppRoutes;
