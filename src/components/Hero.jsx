import React from 'react';

const Hero = () => {
    const styles = {
        section: {
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            padding: '0 2rem',
            position: 'relative',
            zIndex: 1,
        },
        title: {
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            fontWeight: '900',
            lineHeight: '1.1',
            marginBottom: '1.5rem',
            color: 'var(--text-primary)',
            textShadow: '0 0 20px rgba(0, 143, 78, 0.3)',
        },
        highlight: {
            color: 'transparent',
            WebkitTextStroke: '2px var(--neon-green)',
        },
        subtitle: {
            fontSize: 'clamp(1rem, 2vw, 1.5rem)',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            margin: '0 auto 3rem',
            lineHeight: '1.6',
        },
        cta: {
            padding: '1rem 3rem',
            fontSize: '1rem',
            fontWeight: '700',
            color: 'var(--bg-dark)',
            backgroundColor: 'var(--neon-green)',
            borderRadius: '50px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            transition: 'all 0.3s ease',
            boxShadow: '0 0 20px rgba(0, 143, 78, 0.4)',
        },
    };

    return (
        <section style={styles.section}>
            <h1 style={styles.title}>
                CREATIVE<br />
                <span style={styles.highlight}>TECHNOLOGIST</span><br />
                <span style={{ color: 'var(--neon-gold)' }}>× AI</span>
            </h1>
            <p style={styles.subtitle}>
                Bridging the gap between human imagination and machine intelligence.
                Building digital experiences that feel alive.
            </p>
            <button
                style={styles.cta}
                onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'var(--text-primary)';
                    e.target.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.5)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'var(--neon-green)';
                    e.target.style.boxShadow = '0 0 20px rgba(0, 143, 78, 0.4)';
                }}
            >
                Explore Work
            </button>
        </section>
    );
};

export default Hero;
