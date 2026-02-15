import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import UserButton from './UserButton';
import { useAuth } from '../context/AuthContext';
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
                ${scrolled ? 'bg-[#0a0a0a]/80 backdrop-blur-md border-b border-neon-green/20 pointer-events-auto' : 'bg-transparent border-b border-transparent'}
            `}>
                {/* Logo */}
                <Link to="/" className="text-xl md:text-2xl font-bold tracking-tight text-white z-[1001] relative pointer-events-auto">
                    SAND<span className="text-neon-green">.GALLERY</span>
                </Link>

                {/* Desktop Menu */}
                <ul className="hidden md:flex items-center gap-8 pointer-events-auto">
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
                    <li className="flex items-center gap-4">
                        <Wallet>
                            <ConnectWallet className="bg-neon-green hover:bg-neon-green/80 text-black font-bold py-2 px-4 rounded transition-all duration-300">
                                <Avatar className="h-6 w-6" />
                                <Name />
                            </ConnectWallet>
                            <WalletDropdown className="bg-[#0a0a0a] border border-neon-green/20">
                                <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                                    <Avatar />
                                    <Name />
                                    <Address className="text-gray-400" />
                                    <EthBalance className="text-neon-gold" />
                                </Identity>
                                <WalletDropdownBasename className="hover:bg-neon-green/10" />
                                <WalletDropdownDisconnect className="hover:bg-red-500/10 text-red-500" />
                            </WalletDropdown>
                        </Wallet>
                        <UserButton />
                    </li>
                </ul>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-white z-[1001] relative p-2 pointer-events-auto"
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
                <div className="mt-8 flex flex-col items-center gap-6 scale-125">
                    <Wallet>
                        <ConnectWallet className="bg-neon-green text-black font-bold py-3 px-6 rounded-lg">
                            <Avatar />
                            <Name />
                        </ConnectWallet>
                        <WalletDropdown className="bg-[#0a0a0a] border border-neon-green/20">
                            <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                                <Avatar />
                                <Name />
                                <Address className="text-gray-400" />
                                <EthBalance className="text-neon-gold" />
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
