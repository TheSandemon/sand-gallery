import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CircuitEffect from './components/CircuitEffect';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminMedia from './pages/AdminMedia';
import Studio from './pages/Studio';
import Pricing from './pages/Pricing';
import CRM from './pages/CRM';
import Gallery from './pages/Gallery';
import Anthem from './pages/Anthem';
import ItemDetail from './pages/ItemDetail';
import { AuthProvider } from './context/AuthContext';
import { Web3Provider } from './context/Web3Provider';
import './App.css';

function App() {
  return (
    <Web3Provider>
      <AuthProvider>
        <Router>
          <CircuitEffect />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/anthem" element={<Anthem />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/media" element={<AdminMedia />} />
            <Route path="/studio" element={<Studio />} />
            <Route path="/crm" element={<CRM />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/item/:category/:id" element={<ItemDetail />} />
          </Routes>
          <Footer />
        </Router>
      </AuthProvider >
    </Web3Provider>
  );
}

export default App;
