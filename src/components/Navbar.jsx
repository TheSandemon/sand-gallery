import React, { useState, useEffect } from 'react';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const styles = {
        nav: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            zIndex: 1000,
            padding: '1.5rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'all 0.3s ease',
            boxSizing: 'border-box',
            backdropFilter: scrolled ? 'blur(10px)' : 'none',
            backgroundColor: scrolled ? 'rgba(10, 10, 10, 0.8)' : 'transparent',
            borderBottom: scrolled ? '1px solid rgba(0, 143, 78, 0.2)' : '1px solid transparent',
        },
        logo: {
            fontSize: '1.5rem',
            fontWeight: '700',
            color: 'var(--text-primary)',
            letterSpacing: '-0.05em',
        },
        logoHighlight: {
            color: 'var(--neon-green)',
        },
        menu: {
            display: 'flex',
            gap: '2rem',
            listStyle: 'none',
            margin: 0,
            padding: 0,
        },
        link: {
            position: 'relative',
            fontSize: '0.9rem',
            fontWeight: '500',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
        },
        activeLink: {
            color: 'var(--neon-gold)',
        },
    };

    return (
        <nav style={styles.nav}>
            <div style={styles.logo}>
                SAND<span style={styles.logoHighlight}>.GALLERY</span>
            </div>
            <ul style={styles.menu}>
                <li style={styles.link}>WORK</li>
                <li style={styles.link}>ABOUT</li>
                <li style={styles.link}>LAB</li>
                <li style={{ ...styles.link, ...styles.activeLink }}>CONTACT</li>
            </ul>
        </nav>
    );
};

export default Navbar;
