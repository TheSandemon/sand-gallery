import React from 'react';
import { useAuth } from '../context/AuthContext';
import VideoAnalysis from '../components/VideoAnalysis';

const Profile = () => {
    const { user, logout, loading } = useAuth();

    // Handle loading state
    if (loading) {
        return (
            <div style={{
                paddingTop: '150px',
                textAlign: 'center',
                minHeight: '100vh',
                background: 'var(--bg-main)'
            }}>
                <div style={{ 
                    color: 'var(--text-dim)', 
                    fontSize: '1.2rem',
                    animation: 'pulse 2s infinite'
                }}>
                    Loading profile...
                </div>
                <style>{`
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.5; }
                    }
                `}</style>
            </div>
        );
    }

    if (!user) return (
        <div style={{ 
            paddingTop: '150px', 
            textAlign: 'center',
            minHeight: '100vh',
            background: 'var(--bg-main)'
        }}>
            <div style={{ 
                color: 'var(--text-dim)', 
                fontSize: '1.2rem',
                marginBottom: '2rem'
            }}>
                Please log in to view your profile.
            </div>
            <button
                onClick={() => window.location.href = '/'}
                style={{
                    padding: '0.75rem 2rem',
                    background: 'var(--accent-primary)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                }}
            >
                Go Home
            </button>
        </div>
    );

    return (
        <div style={{
            paddingTop: '120px',
            maxWidth: '800px',
            margin: '0 auto',
            paddingLeft: '20px',
            paddingRight: '20px'
        }}>
            <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '2rem',
                borderRadius: '20px',
                border: '1px solid rgba(0, 143, 78, 0.3)',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    <img
                        src={user.photoURL}
                        alt={user.displayName}
                        style={{ width: '100px', height: '100px', borderRadius: '50%', border: '3px solid var(--neon-green)' }}
                    />
                    <div style={{ flex: 1 }}>
                        <h1 style={{ margin: 0, fontSize: '2rem' }}>{user.displayName}</h1>
                        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{user.email}</p>
                        <span style={{
                            display: 'inline-block',
                            marginTop: '0.5rem',
                            padding: '0.2rem 0.8rem',
                            backgroundColor: 'rgba(199, 155, 55, 0.2)',
                            color: 'var(--neon-gold)',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold'
                        }}>{user.role || 'USER'}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button
                        onClick={() => {
                            logout();
                        }}
                        style={{
                            padding: '0.5rem 1.5rem',
                            background: 'rgba(255, 50, 50, 0.1)',
                            border: '1px solid rgba(255, 50, 50, 0.3)',
                            color: '#ff4444',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.target.style.background = 'rgba(255, 50, 50, 0.2)'}
                        onMouseLeave={e => e.target.style.background = 'rgba(255, 50, 50, 0.1)'}
                    >
                        LOG OUT
                    </button>
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginTop: '2rem'
            }}>
                <div style={{
                    padding: '1.5rem',
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '15px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>BALANCE</h3>
                    <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: '900', color: 'var(--neon-gold)' }}>
                        {user.credits || 0} <span style={{ fontSize: '1rem' }}>CREDITS</span>
                    </p>
                </div>
            </div>

            <div style={{ marginTop: '3rem', marginBottom: '3rem' }}>
                <VideoAnalysis userId={user.uid} />
            </div>

            <CreationsGallery userId={user.uid} />
        </div>

    );

};

const CreationsGallery = ({ userId }) => {
    const [creations, setCreations] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        const fetchCreations = async () => {
            try {
                // Check if firebase is configured
                const { isFirebaseConfigured } = await import('../firebase');
                if (!isFirebaseConfigured()) {
                    console.log('[Profile] Firebase not configured, using demo mode');
                    setCreations([]);
                    setLoading(false);
                    return;
                }

                // Import dynamically to avoid errors during build if firebase isn't fully set up logic logic
                const { collection, query, where, getDocs, orderBy } = await import('firebase/firestore');
                const { db } = await import('../firebase');

                // Construct query
                // Note: orderBy might require an index. If it fails, we default to client-side sort
                const q = query(
                    collection(db, 'creations'),
                    where('userId', '==', userId)
                    // orderBy('createdAt', 'desc') // Commented out to avoid index requirements for now
                );

                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Client side sort
                data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

                setCreations(data);
            } catch (err) {
                console.error("[Profile] Error fetching creations:", err);
                setError(err.message || 'Failed to load creations');
                setCreations([]);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchCreations();
        }
    }, [userId]);

    if (loading) return <div style={{ color: '#888' }}>Loading gallery...</div>;
    if (error) return (
        <div style={{ 
            color: '#ff6b6b', 
            padding: '1rem', 
            background: 'rgba(255,107,107,0.1)', 
            borderRadius: '8px',
            marginTop: '1rem'
        }}>
            {error}
        </div>
    );
    if (creations.length === 0) return (
        <div style={{ color: '#888', marginTop: '1rem' }}>
            No creations yet. Visit the Studio to create something!
        </div>
    );

    return (
        <div style={{ marginTop: '2rem' }}>
            <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '0.5rem', color: 'var(--neon-green)' }}>MY CREATIONS</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                {creations.map(item => (
                    <div key={item.id} style={{
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        padding: '1rem'
                    }}>
                        <div style={{ fontSize: '0.8rem', color: '#ccc', marginBottom: '0.5rem', height: '40px', overflow: 'hidden' }}>
                            "{item.prompt}"
                        </div>
                        {item.audioUrl && (
                            <audio controls src={item.audioUrl} style={{ width: '100%', height: '30px' }} />
                        )}
                        <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.5rem' }}>
                            {new Date(item.createdAt?.seconds * 1000).toLocaleDateString()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Profile;
