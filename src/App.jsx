import React, { useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CircuitEffect from './components/CircuitEffect';
import PageLoader from './components/PageLoader';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Studio from './pages/Studio';
import Pricing from './pages/Pricing';
import CRM from './pages/CRM';
import Editor from './pages/admin/Editor';
import Gallery from './pages/Gallery';
import Anthem from './pages/Anthem';
import MushroomRunner from './pages/MushroomRunner';
import { AuthProvider } from './context/AuthContext';
import { Web3Provider } from './context/Web3Provider';
import { ThemeProvider } from './context/ThemeContext';
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

function App() {
  const location = useLocation();
  
  // Only render CircuitEffect on public pages
  const showCircuitEffect = useMemo(() => {
    return PUBLIC_PAGES.includes(location.pathname);
  }, [location.pathname]);

  return (
    <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
      <ThemeProvider>
        <Web3Provider>
          <AuthProvider>
            <Router>
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
                    <Route path="/game" element={<MushroomRunner />} />
                  </Routes>
                </main>
              </AppLayout>
            </Router>
          </AuthProvider >
        </Web3Provider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
