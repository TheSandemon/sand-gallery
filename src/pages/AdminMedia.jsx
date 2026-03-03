import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, orderBy, limit, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import MediaUploader from '../components/admin/MediaUploader';
import CategoryManager from '../components/admin/CategoryManager';

// Gallery categories configuration
const GALLERY_CATEGORIES = [
    { id: 'games', title: 'GAMES', color: '#00ff88' },
    { id: 'apps', title: 'APPS', color: '#00d4ff' },
    { id: 'tools', title: 'TOOLS', color: '#ff6b35' },
    { id: 'videos', title: 'VIDEOS', color: '#ff00ff' },
    { id: '3d', title: '3D', color: '#c79b37' },
    { id: 'images', title: 'IMAGES', color: '#00ffff' },
    { id: 'audio', title: 'AUDIO', color: '#ff4444' },
    { id: 'other', title: 'OTHER', color: '#888888' },
];

const AdminMedia = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('upload');
    const [mediaItems, setMediaItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('all');

    // Check admin access
    if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
        return (
            <div style={{ paddingTop: '120px', textAlign: 'center', color: 'red' }}>
                <h1>ACCESS DENIED</h1>
                <p>You do not have permission to view this page.</p>
            </div>
        );
    }

    // Load media items
    useEffect(() => {
        let q = query(collection(db, 'media'), orderBy('createdAt', 'desc'), limit(100));

        if (filterType !== 'all') {
            q = query(collection(db, 'media'), orderBy('createdAt', 'desc'), limit(100));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMediaItems(items);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [filterType]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await deleteDoc(doc(db, 'media', id));
            } catch (error) {
                console.error('Error deleting:', error);
                alert('Failed to delete item');
            }
        }
    };

    const filteredMedia = filterType === 'all'
        ? mediaItems
        : mediaItems.filter(item => item.type === filterType);

    return (
        <div style={{ paddingTop: '120px', maxWidth: '1200px', margin: '0 auto', padding: '0 20px', paddingBottom: '100px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ fontSize: '3rem', margin: 0 }}>
                    MEDIA <span style={{ color: 'var(--neon-green)' }}>MANAGER</span>
                </h1>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                {[
                    { id: 'upload', label: 'Upload' },
                    { id: 'library', label: 'Library' },
                    { id: 'categories', label: 'Categories' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: activeTab === tab.id ? 'var(--neon-green)' : 'transparent',
                            color: activeTab === tab.id ? 'black' : 'white',
                            border: activeTab === tab.id ? 'none' : '1px solid #444',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'all 0.2s'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Upload Tab */}
            {activeTab === 'upload' && (
                <MediaUploader categories={GALLERY_CATEGORIES} />
            )}

            {/* Library Tab */}
            {activeTab === 'library' && (
                <div>
                    {/* Filters */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        {['all', 'image', 'video', 'audio', 'embed', 'link'].map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: filterType === type ? 'var(--neon-green)' : '#222',
                                    color: filterType === type ? 'black' : '#888',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    textTransform: 'capitalize',
                                    fontSize: '0.85rem'
                                }}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    {/* Media Grid */}
                    {loading ? (
                        <p>Loading...</p>
                    ) : filteredMedia.length === 0 ? (
                        <p style={{ color: '#666' }}>No media items found. Upload some content!</p>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                            {filteredMedia.map(item => (
                                <div key={item.id} style={{
                                    background: '#111',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    border: '1px solid #222'
                                }}>
                                    {/* Thumbnail */}
                                    <div style={{ height: '120px', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {item.type === 'image' || item.type === 'video' ? (
                                            <img src={item.thumbnail || item.url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : item.type === 'audio' ? (
                                            <div style={{ fontSize: '2rem' }}>🎵</div>
                                        ) : item.type === 'embed' ? (
                                            <div style={{ fontSize: '2rem' }}>🎬</div>
                                        ) : (
                                            <div style={{ fontSize: '2rem' }}>🔗</div>
                                        )}
                                    </div>
                                    {/* Info */}
                                    <div style={{ padding: '0.75rem' }}>
                                        <div style={{ fontWeight: 'bold', color: 'white', fontSize: '0.9rem', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {item.name}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.5rem', textTransform: 'capitalize' }}>
                                            {item.type}
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => window.open(item.url, '_blank')}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.4rem',
                                                    background: '#222',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.8rem'
                                                }}
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                style={{
                                                    padding: '0.4rem 0.75rem',
                                                    background: 'rgba(255,50,50,0.2)',
                                                    color: '#ff4444',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.8rem'
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
                <CategoryManager
                    categories={GALLERY_CATEGORIES}
                    mediaItems={mediaItems}
                />
            )}
        </div>
    );
};

export default AdminMedia;
