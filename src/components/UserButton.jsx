import React from 'react';
import { useAuth } from '../context/AuthContext';

const UserButton = () => {
    const { user, signInWithGoogle, logout } = useAuth();

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
            border: 'none'
        },
        userContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
        },
        avatar: {
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: '2px solid var(--neon-green)',
            cursor: 'pointer',
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
        }
    };

    if (!user) {
        return (
            <button
                style={styles.button}
                onClick={signInWithGoogle}
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
        <div style={styles.userContainer}>
            <span style={styles.badge}>{user.role || 'GUEST'}</span>
            <img
                src={user.photoURL}
                alt={user.displayName}
                style={styles.avatar}
                onClick={logout}
                title="Click to Logout"
            />
        </div>
    );
};

export default UserButton;
