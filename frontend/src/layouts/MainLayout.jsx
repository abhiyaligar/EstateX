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
    const scrollToHashElement = () => {
      const { hash } = window.location;
      if (hash) {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          const y = element.getBoundingClientRect().top + window.scrollY - 120;
          window.scrollTo({ top: y, behavior: 'smooth' });
          return true;
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return true;
      }
      return false;
    };

    // If it's a hash link, try to scroll immediately
    let found = scrollToHashElement();
    
    // If element not found (because of lazy loading), poll for it
    if (!found && window.location.hash) {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (scrollToHashElement() || attempts >= 50) { // Try for 5 seconds
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [location]);

  // Show footer only on true public pages, not on app pages within MainLayout
  const publicPages = ['/', '/trading', '/solutions', '/who-we-serve', '/company'];
  const showFooter = publicPages.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans selection:bg-accent-orange/10 overflow-x-hidden">
      <LandingNav />
      {/* pt-24 to clear the fixed pill nav height */}
      <main className="flex-1 w-full pt-24 overflow-x-hidden">
        <Outlet />
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
