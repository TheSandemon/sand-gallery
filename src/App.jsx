import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CircuitEffect from './components/CircuitEffect';
import Home from './pages/Home';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Studio from './pages/Studio';
import Pricing from './pages/Pricing';
import CRM from './pages/CRM';
import Editor from './pages/admin/Editor';
import Gallery from './pages/Gallery';
import { AuthProvider } from './context/AuthContext';
import './App.css';

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

function App() {
  return (
    <AuthProvider>
      <Router>
        <CircuitEffect />
        <AppLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/editor" element={<Editor />} />
            <Route path="/studio" element={<Studio />} />
            <Route path="/crm" element={<CRM />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/game" element={<MushroomRunner />} />
          </Routes>
        </AppLayout>
      </Router>
    </AuthProvider >
  );
}

export default App;

