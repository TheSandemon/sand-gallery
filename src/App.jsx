import React, { useMemo, lazy, Suspense } from 'react';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CircuitEffect from './components/CircuitEffect';
import PageLoader from './components/PageLoader';
import ErrorBoundary from './components/ErrorBoundary';
import RouteErrorBoundary from './components/RouteErrorBoundary';
import AppProviders from './components/AppProviders';
import DemoModeBanner from './components/DemoModeBanner';
import NotFound from './pages/NotFound';
import Studio from './pages/Studio';
import './index.css';

// Lazy load pages for code splitting (reduces initial bundle size)
const Home = lazy(() => import('./pages/Home'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Pricing = lazy(() => import('./pages/Pricing'));
const CRM = lazy(() => import('./pages/CRM'));
const Editor = lazy(() => import('./pages/admin/Editor'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Anthem = lazy(() => import('./pages/Anthem'));

// Page loading fallback
const PageSuspense = ({ children }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

// Pages that should show CircuitEffect (public landing pages)
const PUBLIC_PAGES = ['/', '/work', '/gallery', '/pricing', '/anthem', '/profile'];

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
            <Route path="/" element={<PageSuspense><RouteErrorBoundary><Home /></RouteErrorBoundary></PageSuspense>} />
            <Route path="/work" element={<PageSuspense><RouteErrorBoundary><Studio /></RouteErrorBoundary></PageSuspense>} />
            <Route path="/game" element={<PageSuspense><RouteErrorBoundary><Studio /></RouteErrorBoundary></PageSuspense>} />
            <Route path="/gallery" element={<PageSuspense><RouteErrorBoundary><Gallery /></RouteErrorBoundary></PageSuspense>} />
            <Route path="/anthem" element={<PageSuspense><RouteErrorBoundary><Anthem /></RouteErrorBoundary></PageSuspense>} />
            <Route path="/profile" element={<PageSuspense><RouteErrorBoundary><Profile /></RouteErrorBoundary></PageSuspense>} />
            <Route path="/admin" element={<PageSuspense><RouteErrorBoundary><AdminDashboard /></RouteErrorBoundary></PageSuspense>} />
            <Route path="/admin/editor" element={<PageSuspense><RouteErrorBoundary><Editor /></RouteErrorBoundary></PageSuspense>} />
            <Route path="/studio" element={<PageSuspense><RouteErrorBoundary><Studio /></RouteErrorBoundary></PageSuspense>} />
            <Route path="/crm" element={<PageSuspense><RouteErrorBoundary><CRM /></RouteErrorBoundary></PageSuspense>} />
            <Route path="/pricing" element={<PageSuspense><RouteErrorBoundary><Pricing /></RouteErrorBoundary></PageSuspense>} />
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
