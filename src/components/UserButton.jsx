import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, Settings, Sparkles } from 'lucide-react';

const UserButton = () => {
    const { user, signInWithGoogle, logout } = useAuth();
    const navigate = useNavigate();
    const [popupOpen, setPopupOpen] = useState(false);
    const popupRef = useRef(null);

    // Close popup on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setPopupOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close on escape
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') setPopupOpen(false);
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, []);

    if (!user) {
        return (
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    signInWithGoogle();
                }}
                className="px-5 py-2.5 text-sm font-semibold text-[#0a0a0a] bg-neon-gold rounded-full cursor-pointer transition-all duration-300 hover:bg-[#dcb04d] hover:shadow-[0_0_15px_rgba(199,155,55,0.4)] flex items-center gap-2 border-none whitespace-nowrap"
            >
                Sign In
            </button>
        );
    }

    return (
        <div className="flex items-center gap-4 relative" ref={popupRef}>
            {/* Credits badge */}
            <button
                onClick={() => navigate('/pricing')}
                className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-neon-green/20 text-neon-green border border-neon-green rounded-xl cursor-pointer hover:bg-neon-green/30 transition-colors"
                title="Buy Credits"
            >
                {user.credits || 0} CR
            </button>

            {/* Avatar */}
            <button
                onClick={() => setPopupOpen(!popupOpen)}
                className="cursor-pointer"
                title="Profile Menu"
                aria-label="Open profile menu"
                aria-expanded={popupOpen}
            >
                <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-9 h-9 rounded-full border-2 border-neon-green object-cover"
                />
            </button>

            {/* Popup Menu */}
            <div
                className={`absolute top-12 right-0 w-72 bg-[#0a0a0a] border border-[#333] rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-50 flex flex-col gap-4 backdrop-blur-xl transition-all duration-200 ${
                    popupOpen ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none -translate-y-2'
                }`}
                role="menu"
            >
                {/* Header */}
                <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                    <img
                        src={user.photoURL}
                        alt="User"
                        className="w-10 h-10 rounded-full"
                    />
                    <div className="overflow-hidden">
                        <h4 className="font-bold text-white truncate">{user.displayName}</h4>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                </div>

                {/* Menu items */}
                <button
                    onClick={() => { setPopupOpen(false); navigate('/profile'); }}
                    className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-white/5 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer w-full text-left"
                    role="menuitem"
                >
                    <User size={16} />
                    User Profile / Settings
                </button>

                <button
                    onClick={() => { setPopupOpen(false); navigate('/studio'); }}
                    className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-white/5 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer w-full text-left"
                    role="menuitem"
                >
                    <Sparkles size={16} />
                    Design Studio
                </button>

                <button
                    onClick={() => { setPopupOpen(false); navigate('/admin'); }}
                    className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-white/5 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer w-full text-left"
                    role="menuitem"
                >
                    <Settings size={16} />
                    Admin Dashboard
                </button>

                {/* Sign Out */}
                <button
                    onClick={() => {
                        setPopupOpen(false);
                        logout();
                        navigate('/');
                    }}
                    className="flex items-center justify-center gap-2 mt-2 py-2.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg text-sm font-bold hover:bg-red-500/20 transition-colors cursor-pointer"
                    role="menuitem"
                >
                    <LogOut size={14} />
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default UserButton;
