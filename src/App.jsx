import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import CircuitEffect from './components/CircuitEffect';
import Home from './pages/Home';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Studio from './pages/Studio';
import Pricing from './pages/Pricing';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <CircuitEffect />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/pricing" element={<Pricing />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
