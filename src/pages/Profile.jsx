import React from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user } = useAuth();

    if (!user) return <div style={{ paddingTop: '100px', textAlign: 'center' }}>Please log in to view profile.</div>;

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
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
                    <img
                        src={user.photoURL}
                        alt={user.displayName}
                        style={{ width: '100px', height: '100px', borderRadius: '50%', border: '3px solid var(--neon-green)' }}
                    />
                    <div>
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

            <CreationsGallery userId={user.uid} />
        </div>

    );

};

const CreationsGallery = ({ userId }) => {
    const [creations, setCreations] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchCreations = async () => {
            try {
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
            } catch (error) {
                console.error("Error fetching creations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCreations();
    }, [userId]);

    if (loading) return <div style={{ color: '#888' }}>Loading gallery...</div>;
    if (creations.length === 0) return <div style={{ color: '#888' }}>No creations yet. Visit the Studio!</div>;

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
