import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import UserButton from './UserButton';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const { user } = useAuth();

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
            textDecoration: 'none',
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
            alignItems: 'center',
        },
        link: {
            position: 'relative',
            fontSize: '0.9rem',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'color 0.3s ease',
        },
        activeLink: {
            color: 'var(--neon-gold)',
        },
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav style={styles.nav}>
            <Link to="/" style={styles.logo}>
                SAND<span style={styles.logoHighlight}>.GALLERY</span>
            </Link>
            <ul style={styles.menu}>
                <li>
                    <Link
                        to="/"
                        style={{ ...styles.link, ...(isActive('/') ? styles.activeLink : {}) }}
                    >
                        WORK
                    </Link>
                </li>
                <li>
                    <Link
                        to="/studio"
                        style={{ ...styles.link, ...(isActive('/studio') ? styles.activeLink : {}) }}
                    >
                        STUDIO
                    </Link>
                </li>
                <li>
                    <Link
                        to="/pricing"
                        style={{ ...styles.link, ...(isActive('/pricing') ? styles.activeLink : {}) }}
                    >
                        PRICING
                    </Link>
                </li>
                {user?.role === 'owner' && (
                    <li>
                        <Link
                            to="/admin"
                            style={{ ...styles.link, ...(isActive('/admin') ? styles.activeLink : {}) }}
                        >
                            ADMIN
                        </Link>
                    </li>
                )}
                <li>
                    <Link
                        to="/profile"
                        style={{ ...styles.link, ...(isActive('/profile') ? styles.activeLink : {}) }}
                    >
                        PROFILE
                    </Link>
                </li>
                <li><UserButton /></li>
            </ul>
        </nav>
    );
};

export default Navbar;
