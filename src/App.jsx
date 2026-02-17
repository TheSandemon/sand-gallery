import React, { useMemo } from 'react';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CircuitEffect from './components/CircuitEffect';
import PageLoader from './components/PageLoader';
import ErrorBoundary from './components/ErrorBoundary';
import RouteErrorBoundary from './components/RouteErrorBoundary';
import AppProviders from './components/AppProviders';
import DemoModeBanner from './components/DemoModeBanner';
import Home from './pages/Home';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Studio from './pages/Studio';
import Pricing from './pages/Pricing';
import CRM from './pages/CRM';
import Editor from './pages/admin/Editor';
import Gallery from './pages/Gallery';
import Anthem from './pages/Anthem';
import NotFound from './pages/NotFound';
import './index.css';

// Pages that should show CircuitEffect (public landing pages)
const PUBLIC_PAGES = ['/', '/gallery', '/pricing', '/anthem', '/profile'];

// Layout wrapper to conditionally show Navbar/Footer
const AppLayout = ({ children }) => {
  const location = useLocation();
  const isEditorPage = location.pathname === '/admin/editor';

  return (
    <>
      {!isEditorPage && <Navbar />}
      {children}
      {!isEditorPage && <Footer />}
    </>
  );
};

// Skip link component for accessibility
const SkipLink = () => (
  <Link
    to="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-[var(--accent-primary)] focus:text-black focus:font-bold focus:rounded"
  >
    Skip to main content
  </Link>
);

function AppContent() {
  const location = useLocation();
  
  // Only render CircuitEffect on public pages
  const showCircuitEffect = useMemo(() => {
    return PUBLIC_PAGES.includes(location.pathname);
  }, [location.pathname]);

  return (
    <>
      <SkipLink />
      {showCircuitEffect && <CircuitEffect />}
      <DemoModeBanner />
      <AppLayout>
        <main id="main-content">
          <Routes>
            <Route path="/" element={<RouteErrorBoundary><Home /></RouteErrorBoundary>} />
            <Route path="/gallery" element={<RouteErrorBoundary><Gallery /></RouteErrorBoundary>} />
            <Route path="/anthem" element={<RouteErrorBoundary><Anthem /></RouteErrorBoundary>} />
            <Route path="/profile" element={<RouteErrorBoundary><Profile /></RouteErrorBoundary>} />
            <Route path="/admin" element={<RouteErrorBoundary><AdminDashboard /></RouteErrorBoundary>} />
            <Route path="/admin/editor" element={<RouteErrorBoundary><Editor /></RouteErrorBoundary>} />
            <Route path="/studio" element={<RouteErrorBoundary><Studio /></RouteErrorBoundary>} />
            <Route path="/crm" element={<RouteErrorBoundary><CRM /></RouteErrorBoundary>} />
            <Route path="/pricing" element={<RouteErrorBoundary><Pricing /></RouteErrorBoundary>} />
            <Route path="*" element={<RouteErrorBoundary><NotFound /></RouteErrorBoundary>} />
          </Routes>
        </main>
      </AppLayout>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
      <AppProviders>
        <AppContent />
      </AppProviders>
    </ErrorBoundary>
  );
}

export default App;
