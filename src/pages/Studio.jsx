import React from 'react';

const Studio = () => {
    return (
        <div style={{ paddingTop: '120px', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '3rem', margin: 0 }}>
                    AI <span style={{ color: 'var(--neon-gold)' }}>STUDIO</span>
                </h1>
                <div style={{
                    padding: '0.5rem 1.5rem',
                    background: 'rgba(199, 155, 55, 0.1)',
                    border: '1px solid var(--neon-gold)',
                    borderRadius: '50px',
                    color: 'var(--neon-gold)',
                    fontWeight: 'bold'
                }}>
                    PREVIEW MODE
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem'
            }}>
                {['Image Gen', 'Audio Synthesis', 'Prompt Lab'].map((tool) => (
                    <div key={tool} style={{
                        height: '250px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '20px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--neon-gold)';
                            e.currentTarget.style.background = 'rgba(199, 155, 55, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                        }}
                    >
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{tool}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Expand Suite Feature</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Studio;
