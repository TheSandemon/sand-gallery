import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ThemeToggleMobile } from './ThemeToggle';
import { WalletUIMobile } from './WalletUI';
import UserButton from './UserButton';

/**
 * MobileMenu - Extracted from Navbar.jsx
 * Full-screen overlay navigation for mobile devices
 * Features smooth fade transition and animated nav items
 */
const MobileMenu = ({ isOpen, navLinks, user }) => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    if (!isOpen) return null;

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 z-[1002] bg-[var(--bg-main)]/95 backdrop-blur-[20px] flex flex-col items-center justify-center gap-8 md:hidden"
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
    );
};

export default MobileMenu;
