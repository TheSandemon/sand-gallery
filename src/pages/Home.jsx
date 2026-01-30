import React from 'react';
import Hero from '../components/Hero';

const Home = () => {
    return (
        <main>
            <Hero />
            {/* Placeholder for future sections */}
            <section style={{ height: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--text-secondary)' }}>More content coming soon...</p>
            </section>
        </main>
    );
};

export default Home;
