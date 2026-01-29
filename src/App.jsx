import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CircuitEffect from './components/CircuitEffect';
import './App.css';

function App() {
  return (
    <>
      <CircuitEffect />
      <Navbar />
      <main>
        <Hero />
        {/* Placeholder for future sections */}
        <section style={{ height: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>More content coming soon...</p>
        </section>
      </main>
    </>
  );
}

export default App;
