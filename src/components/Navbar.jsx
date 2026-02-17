import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import UserButton from './UserButton';
import { useAuth } from '../context/AuthContext';
import { ThemeToggleDesktop, ThemeToggleMobile } from './ThemeToggle';
import { WalletUIDesktop, WalletUIMobile } from './WalletUI';
import useSiteSettings from '../hooks/useSiteSettings';
import { SCROLL_THRESHOLD } from '../config/constants';

/**
 * Navbar - Main navigation component
 * Desktop: horizontal menu with theme toggle and wallet
 * Mobile: hamburger menu with slide-in overlay
 */
const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { user } = useAuth();
    const { settings } = useSiteSettings();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > SCROLL_THRESHOLD);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        ...(settings.navLinks || []).filter(link => !link.hidden || settings.showHiddenPages),
        ...(user?.role === 'owner' ? [{ path: '/admin', label: 'ADMIN' }] : []),
    ];

    // Animated nav link with underline
    const NavLink = ({ link }) => (
        <Link
            to={link.path}
            className="relative text-sm font-semibold tracking-wide text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors duration-300 group py-1"
        >
            {link.label}
            <span className={`absolute bottom-0 left-0 h-0.5 bg-[var(--accent-primary)] transition-all duration-300 origin-left ${
                isActive(link.path) ? 'w-full' : 'w-0 group-hover:w-full'
            }`} />
        </Link>
    );

    return (
        <>
            <nav className={`fixed top-0 left-0 w-full z-[1000] transition-all duration-500 px-4 md:px-8 py-4 md:py-6 flex justify-between items-center pointer-events-none
                ${scrolled 
                    ? 'bg-[var(--bg-main)]/90 backdrop-blur-xl border-b border-[var(--accent-primary)]/10 shadow-lg shadow-black/20 pointer-events-auto' 
                    : 'bg-transparent border-b border-transparent'
                }
            `}>
                {/* Logo - Larger with accent */}
                <Link to="/" className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)] z-[1001] relative pointer-events-auto font-[family-name:var(--font-display)]">
                    SAND<span className="text-[var(--accent-primary)]">.GALLERY</span>
                </Link>

                {/* Desktop Menu */}
                <ul className="hidden md:flex items-center gap-8 pointer-events-auto">
                    {navLinks.map(link => (
                        <li key={link.path}>
                            <NavLink link={link} />
                        </li>
                    ))}
                    <li className="flex items-center gap-4">
                        <ThemeToggleDesktop />
                        <WalletUIDesktop />
                        <UserButton />
                    </li>
                </ul>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-[var(--text-primary)] z-[1001] relative p-2 pointer-events-auto"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle mobile menu"
                    aria-expanded={mobileMenuOpen}
                >
                    <div className={`w-6 h-0.5 bg-[var(--text-primary)] mb-1.5 transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                    <div className={`w-6 h-0.5 bg-[var(--text-primary)] mb-1.5 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                    <div className={`w-6 h-0.5 bg-[var(--text-primary)] transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </button>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[1002] bg-[var(--bg-main)]/95 backdrop-blur-[30px] flex flex-col items-center justify-center gap-8 md:hidden"
                    >
                        {navLinks.map((link, index) => (
                            <motion.div
                                key={link.path}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.3 }}
                            >
                                <Link
                                    to={link.path}
                                    className={`text-3xl font-bold tracking-widest transition-colors duration-300
                                        ${isActive(link.path) ? 'text-[var(--accent-secondary)]' : 'text-[var(--text-dim)] hover:text-[var(--text-primary)]'}
                                    `}
                                >
                                    {link.label}
                                </Link>
                            </motion.div>
                        ))}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: navLinks.length * 0.1, duration: 0.3 }}
                            className="mt-8 flex flex-col items-center gap-6 scale-125"
                        >
                            <ThemeToggleMobile />
                            <WalletUIMobile />
                            <UserButton />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
