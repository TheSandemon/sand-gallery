import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import UserButton from './UserButton';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { user } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { path: '/', label: 'WORK' },
        { path: '/studio', label: 'STUDIO' },
        { path: '/crm', label: 'CRM' },
        { path: '/pricing', label: 'PRICING' },
        ...(user?.role === 'owner' ? [{ path: '/admin', label: 'ADMIN' }] : []),
        { path: '/profile', label: 'PROFILE' },
    ];

    return (
        <>
            <nav className={`fixed top-0 left-0 w-full z-[1000] transition-all duration-300 px-4 md:px-8 py-4 md:py-6 flex justify-between items-center
                ${scrolled ? 'bg-[#0a0a0a]/80 backdrop-blur-md border-b border-neon-green/20' : 'bg-transparent border-b border-transparent'}
            `}>
                {/* Logo */}
                <Link to="/" className="text-xl md:text-2xl font-bold tracking-tight text-white z-[1001] relative">
                    SAND<span className="text-neon-green">.GALLERY</span>
                </Link>

                {/* Desktop Menu */}
                <ul className="hidden md:flex items-center gap-8">
                    {navLinks.map(link => (
                        <li key={link.path}>
                            <Link
                                to={link.path}
                                className={`text-sm font-semibold tracking-wide transition-colors duration-300
                                    ${isActive(link.path) ? 'text-neon-gold' : 'text-gray-400 hover:text-white'}
                                `}
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                    <li><UserButton /></li>
                </ul>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-white z-[1001] relative p-2"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    <div className={`w-6 h-0.5 bg-white mb-1.5 transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                    <div className={`w-6 h-0.5 bg-white mb-1.5 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                    <div className={`w-6 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </button>
            </nav>

            {/* Mobile Menu Overlay */}
            <div className={`fixed inset-0 z-[999] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8 transition-all duration-300 md:hidden
                ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
            `}>
                {navLinks.map(link => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={`text-2xl font-bold tracking-widest transition-colors duration-300
                            ${isActive(link.path) ? 'text-neon-gold' : 'text-gray-500 hover:text-white'}
                        `}
                    >
                        {link.label}
                    </Link>
                ))}
                <div className="mt-8 scale-125">
                    <UserButton />
                </div>
            </div>
        </>
    );
};

export default Navbar;
