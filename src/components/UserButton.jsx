import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserButton = () => {
    const { user, signInWithGoogle, logout } = useAuth();
    const navigate = useNavigate();
    const [popupOpen, setPopupOpen] = React.useState(false);
    const popupRef = React.useRef(null);

    // Close popup on outside click
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setPopupOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const styles = {
        button: {
            padding: '0.6rem 1.2rem',
            fontSize: '0.9rem',
            fontWeight: '600',
            color: 'var(--bg-dark)',
            backgroundColor: 'var(--neon-gold)',
            borderRadius: '50px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            border: 'none',
            whiteSpace: 'nowrap'
        },
        userContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            position: 'relative' // For popup positioning
        },
        avatar: {
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: '2px solid var(--neon-green)',
            cursor: 'pointer',
            objectFit: 'cover'
        },
        badge: {
            fontSize: '0.75rem',
            padding: '0.2rem 0.6rem',
            backgroundColor: 'rgba(0, 143, 78, 0.2)',
            color: 'var(--neon-green)',
            border: '1px solid var(--neon-green)',
            borderRadius: '12px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
        },
        // Popup Styles
        popup: {
            position: 'absolute',
            top: '50px',
            right: '0',
            width: '280px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color, #333)',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            backdropFilter: 'blur(10px)',
            opacity: popupOpen ? 1 : 0,
            pointerEvents: popupOpen ? 'auto' : 'none',
            transform: popupOpen ? 'translateY(0)' : 'translateY(-10px)',
            transition: 'all 0.2s ease-out'
        },
        popupHeader: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '0.5rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
        },
        popupName: {
            fontWeight: 'bold',
            color: '#fff',
            fontSize: '1rem',
            margin: 0
        },
        popupEmail: {
            color: '#888',
            fontSize: '0.8rem',
            margin: 0
        },
        popupLink: {
            color: 'var(--text-secondary, #ccc)',
            textDecoration: 'none',
            fontSize: '0.95rem',
            padding: '0.5rem',
            borderRadius: '8px',
            transition: 'background 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer'
        },
        logoutBtn: {
            marginTop: '0.5rem',
            padding: '0.5rem',
            backgroundColor: 'rgba(255, 50, 50, 0.1)',
            color: '#ff4444',
            border: '1px solid rgba(255, 50, 50, 0.3)',
            borderRadius: '8px',
            cursor: 'pointer',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            transition: 'all 0.2s'
        }
    };

    if (!user) {
        return (
            <button
                style={styles.button}
                onClick={(e) => {
                    e.stopPropagation();
                    signInWithGoogle();
                }}
                onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#dcb04d';
                    e.target.style.boxShadow = '0 0 15px rgba(199, 155, 55, 0.4)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'var(--neon-gold)';
                    e.target.style.boxShadow = 'none';
                }}
            >
                Sign In
            </button>
        );
    }

    return (
        <div style={styles.userContainer} ref={popupRef}>
            <span
                style={{ ...styles.badge, cursor: 'pointer' }}
                onClick={() => navigate('/pricing')}
                title="Buy Credits"
            >
                {user.credits || 0} CR
            </span>
            <img
                src={user.photoURL}
                alt={user.displayName}
                style={styles.avatar}
                onClick={() => setPopupOpen(!popupOpen)}
                title="Profile Menu"
            />

            {/* Popup Menu */}
            <div style={styles.popup}>
                <div style={styles.popupHeader}>
                    <img src={user.photoURL} alt="User" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                    <div style={{ overflow: 'hidden' }}>
                        <h4 style={styles.popupName}>{user.displayName}</h4>
                        <p style={styles.popupEmail}>{user.email}</p>
                    </div>
                </div>

                <div
                    style={styles.popupLink}
                    onClick={() => { setPopupOpen(false); navigate('/profile'); }}
                    onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.target.style.background = 'transparent'}
                >
                    User Profile / Settings
                </div>

                <div
                    style={styles.popupLink}
                    onClick={() => { setPopupOpen(false); navigate('/studio'); }}
                    onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.target.style.background = 'transparent'}
                >
                    Design Studio
                </div>

                <button
                    style={styles.logoutBtn}
                    onClick={() => {
                        setPopupOpen(false);
                        logout();
                        navigate('/');
                    }}
                    onMouseEnter={e => e.target.style.backgroundColor = 'rgba(255, 50, 50, 0.2)'}
                    onMouseLeave={e => e.target.style.backgroundColor = 'rgba(255, 50, 50, 0.1)'}
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default UserButton;
