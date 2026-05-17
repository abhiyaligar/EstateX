import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { LandingNav } from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

// MainLayout = Landing page routes ONLY.
// No sidebar ever. Navbar handles its own state (pill vs top bar).
// Sidebar only appears inside DashboardLayout (protected /dashboard/* routes).
const MainLayout = () => {
  const location = useLocation();

  React.useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.slice(1));
      if (element) {
        // slight timeout ensures DOM is ready if navigating to new page
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  // Show footer only on true public pages, not on app pages within MainLayout
  const publicPages = ['/', '/trading', '/solutions', '/who-we-serve', '/company'];
  const showFooter = publicPages.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans selection:bg-accent-orange/10">
      <LandingNav />
      {/* pt-24 to clear the fixed pill nav height */}
      <main className="flex-1 w-full pt-24">
        <Outlet />
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
