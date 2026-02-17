import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import UserButton from './UserButton';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import useSiteSettings from '../hooks/useSiteSettings';
import {
    ConnectWallet,
    Wallet,
    WalletDropdown,
    WalletDropdownBasename,
    WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
    Address,
    Avatar,
    Name,
    Identity,
    EthBalance,
} from '@coinbase/onchainkit/identity';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { user } = useAuth();
    const { settings } = useSiteSettings();
    const { theme, toggleTheme } = useTheme();

    const themes = [
        { id: 'zinc-default', label: 'ZINC', icon: '💎' },
        { id: 'cyber-neon', label: 'NEON', icon: '⚡' },
        { id: 'brutalist-paper', label: 'PAPER', icon: '📜' },
    ];

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

    // Build nav links from settings, filtering hidden pages unless showHiddenPages is true
    const navLinks = [
        ...(settings.navLinks || []).filter(link => !link.hidden || settings.showHiddenPages),
        ...(user?.role === 'owner' ? [{ path: '/admin', label: 'ADMIN' }] : []),
    ];

    return (
        <>
            <nav className={`fixed top-0 left-0 w-full z-[1000] transition-all duration-300 px-4 md:px-8 py-4 md:py-6 flex justify-between items-center pointer-events-none
                ${scrolled ? 'bg-[var(--bg-main)]/80 backdrop-blur-md border-b border-[var(--accent-primary)]/20 pointer-events-auto' : 'bg-transparent border-b border-transparent'}
            `}>
                {/* Logo */}
                <Link to="/" className="text-xl md:text-2xl font-bold tracking-tight text-[var(--text-primary)] z-[1001] relative pointer-events-auto">
                    SAND<span className="text-[var(--accent-primary)]">.GALLERY</span>
                </Link>

                {/* Desktop Menu */}
                <ul className="hidden md:flex items-center gap-8 pointer-events-auto">
                    {navLinks.map(link => (
                        <li key={link.path}>
                            <Link
                                to={link.path}
                                className={`text-sm font-semibold tracking-wide transition-colors duration-300
                                    ${isActive(link.path) ? 'text-[var(--accent-secondary)]' : 'text-[var(--text-dim)] hover:text-[var(--text-primary)]'}
                                `}
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                    <li className="flex items-center gap-4">
                        <div className="flex bg-[var(--text-primary)]/5 p-1 rounded-lg border border-[var(--text-primary)]/10 shadow-[var(--border-glow)]">
                            {themes.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => toggleTheme(t.id)}
                                    title={t.label}
                                    aria-label={`Switch to ${t.label} theme`}
                                    className={`p-2 rounded-md transition-all duration-200 text-sm ${theme === t.id ? 'bg-[var(--text-primary)]/10 text-[var(--text-primary)]' : 'text-[var(--text-dim)] hover:text-[var(--text-primary)]'}`}
                                >
                                    {t.icon}
                                </button>
                            ))}
                        </div>
                        <Wallet>
                            <ConnectWallet className="bg-[var(--accent-primary)] hover:opacity-80 text-black font-bold py-2 px-4 rounded transition-all duration-300">
                                <Avatar className="h-6 w-6" />
                                <Name />
                            </ConnectWallet>
                            <WalletDropdown className="bg-[var(--bg-main)] border border-[var(--accent-primary)]/20">
                                <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                                    <Avatar />
                                    <Name />
                                    <Address className="text-[var(--text-dim)]" />
                                    <EthBalance className="text-[var(--accent-secondary)]" />
                                </Identity>
                                <WalletDropdownBasename className="hover:bg-[var(--accent-primary)]/10" />
                                <WalletDropdownDisconnect className="hover:bg-red-500/10 text-red-500" />
                            </WalletDropdown>
                        </Wallet>
                        <UserButton />
                    </li>
                </ul>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-[var(--text-primary)] z-[1001] relative p-2 pointer-events-auto"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    <div className={`w-6 h-0.5 bg-[var(--text-primary)] mb-1.5 transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                    <div className={`w-6 h-0.5 bg-[var(--text-primary)] mb-1.5 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                    <div className={`w-6 h-0.5 bg-[var(--text-primary)] transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </button>
            </nav>

            {/* Mobile Menu Overlay */}
            <div className={`fixed inset-0 z-[1002] bg-[var(--bg-main)]/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8 transition-all duration-300 md:hidden
                ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
            `}>
                {navLinks.map(link => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={`text-2xl font-bold tracking-widest transition-colors duration-300
                            ${isActive(link.path) ? 'text-[var(--accent-secondary)]' : 'text-[var(--text-dim)] hover:text-[var(--text-primary)]'}
                        `}
                    >
                        {link.label}
                    </Link>
                ))}
                <div className="mt-8 flex flex-col items-center gap-6 scale-125">
                    <div className="flex bg-[var(--text-primary)]/5 p-1 rounded-lg border border-[var(--text-primary)]/10 mb-4">
                        {themes.map(t => (
                            <button
                                key={t.id}
                                onClick={() => toggleTheme(t.id)}
                                aria-label={`Switch to ${t.label} theme`}
                                className={`px-4 py-2 rounded-md transition-all duration-200 font-bold ${theme === t.id ? 'bg-[var(--text-primary)]/10 text-[var(--text-primary)]' : 'text-[var(--text-dim)]'}`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                    <Wallet>
                        <ConnectWallet className="bg-[var(--accent-primary)] text-black font-bold py-3 px-6 rounded-lg">
                            <Avatar />
                            <Name />
                        </ConnectWallet>
                        <WalletDropdown className="bg-[var(--bg-main)] border border-[var(--accent-primary)]/20">
                            <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                                <Avatar />
                                <Name />
                                <Address className="text-[var(--text-dim)]" />
                                <EthBalance className="text-[var(--accent-secondary)]" />
                            </Identity>
                            <WalletDropdownBasename />
                            <WalletDropdownDisconnect />
                        </WalletDropdown>
                    </Wallet>
                    <UserButton />
                </div>
            </div>
        </>
    );
};

export default Navbar;
