import React, { useMemo } from 'react';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CircuitEffect from './components/CircuitEffect';
import PageLoader from './components/PageLoader';
import ErrorBoundary from './components/ErrorBoundary';
import AppProviders from './components/AppProviders';
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
      <AppLayout>
        <main id="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/anthem" element={<Anthem />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/editor" element={<Editor />} />
            <Route path="/studio" element={<Studio />} />
            <Route path="/crm" element={<CRM />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="*" element={<NotFound />} />
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
