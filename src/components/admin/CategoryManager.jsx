import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

const CategoryManager = ({ categories = [], mediaItems = [] }) => {
    const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || '');
    const [categoryItems, setCategoryItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Load category items from Firestore
    useEffect(() => {
        if (!selectedCategory) return;

        setLoading(true);
        const unsubscribe = onSnapshot(
            doc(db, 'gallery_categories', selectedCategory),
            (doc) => {
                if (doc.exists()) {
                    setCategoryItems(doc.data().items || []);
                } else {
                    setCategoryItems([]);
                }
                setLoading(false);
            },
            (error) => {
                console.error('Error loading category:', error);
                setCategoryItems([]);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [selectedCategory]);

    // Get available media items that can be added
    const availableMedia = mediaItems.filter(
        item => !categoryItems.find(catItem => catItem.id === item.id)
    );

    // Add item to category
    const addToCategory = async (mediaItem) => {
        if (!selectedCategory) return;

        const newItem = {
            id: mediaItem.id,
            name: mediaItem.name,
            description: mediaItem.description || '',
            link: mediaItem.url || '',           // For navigation
            url: mediaItem.url || '',            // For inline playback
            type: mediaItem.type || 'link',     // 'image'|'video'|'audio'|'game'|'embed'|'link'
            thumbnail: mediaItem.thumbnail || '',
        };

        const updatedItems = [...categoryItems, newItem];
        setCategoryItems(updatedItems);

        // Save to Firestore
        setSaving(true);
        try {
            await setDoc(
                doc(db, 'gallery_categories', selectedCategory),
                { items: updatedItems },
                { merge: true }
            );
        } catch (error) {
            console.error('Error saving:', error);
            alert('Failed to save');
        } finally {
            setSaving(false);
        }
    };

    // Remove item from category
    const removeFromCategory = async (itemId) => {
        if (!selectedCategory) return;

        const updatedItems = categoryItems.filter(item => item.id !== itemId);
        setCategoryItems(updatedItems);

        // Save to Firestore
        setSaving(true);
        try {
            await setDoc(
                doc(db, 'gallery_categories', selectedCategory),
                { items: updatedItems },
                { merge: true }
            );
        } catch (error) {
            console.error('Error saving:', error);
            alert('Failed to save');
        } finally {
            setSaving(false);
        }
    };

    // Get current category info
    const currentCategory = categories.find(c => c.id === selectedCategory);

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem', minHeight: '500px' }}>
                {/* Category List */}
                <div style={{ background: '#111', borderRadius: '12px', padding: '1rem', border: '1px solid #222' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: '#888', fontSize: '0.85rem', textTransform: 'uppercase' }}>Categories</h4>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                background: selectedCategory === cat.id ? `${cat.color}20` : 'transparent',
                                border: selectedCategory === cat.id ? `1px solid ${cat.color}` : '1px solid transparent',
                                borderRadius: '8px',
                                color: selectedCategory === cat.id ? cat.color : '#888',
                                cursor: 'pointer',
                                textAlign: 'left',
                                marginBottom: '0.5rem',
                                fontWeight: selectedCategory === cat.id ? 'bold' : 'normal',
                                transition: 'all 0.2s'
                            }}
                        >
                            {cat.title}
                        </button>
                    ))}
                </div>

                {/* Category Items */}
                <div>
                    {/* Current Items */}
                    <div style={{ background: '#111', borderRadius: '12px', padding: '1.5rem', border: '1px solid #222', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0, color: currentCategory?.color || 'white' }}>
                                {currentCategory?.title || 'Select a category'}
                            </h3>
                            {saving && <span style={{ color: '#666', fontSize: '0.9rem' }}>Saving...</span>}
                        </div>

                        {loading ? (
                            <p>Loading...</p>
                        ) : categoryItems.length === 0 ? (
                            <p style={{ color: '#666' }}>No items in this category yet.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {categoryItems.map((item, idx) => (
                                    <div key={item.id || idx} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '0.75rem',
                                        background: '#0a0a0a',
                                        borderRadius: '8px',
                                        border: '1px solid #222'
                                    }}>
                                        <div>
                                            <div style={{ color: 'white', fontWeight: 'bold' }}>{item.name}</div>
                                            {item.description && <div style={{ color: '#666', fontSize: '0.85rem' }}>{item.description}</div>}
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {item.link && (
                                                <button
                                                    onClick={() => window.open(item.link, '_blank')}
                                                    style={{
                                                        padding: '0.4rem 0.75rem',
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
                                            )}
                                            <button
                                                onClick={() => removeFromCategory(item.id)}
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
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Add Items */}
                    <div style={{ background: '#111', borderRadius: '12px', padding: '1.5rem', border: '1px solid #222' }}>
                        <h4 style={{ margin: '0 0 1rem 0', color: '#888', fontSize: '0.85rem', textTransform: 'uppercase' }}>Add Media to Category</h4>
                        {availableMedia.length === 0 ? (
                            <p style={{ color: '#666' }}>No media available. Upload some media first!</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                                {availableMedia.map(item => (
                                    <div key={item.id} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '0.75rem',
                                        background: '#0a0a0a',
                                        borderRadius: '8px',
                                        border: '1px solid #222'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '6px',
                                                background: '#000',
                                                overflow: 'hidden',
                                                flexShrink: 0
                                            }}>
                                                {item.thumbnail ? (
                                                    <img src={item.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                                        {item.type === 'audio' ? '🎵' : item.type === 'video' ? '🎬' : item.type === 'image' ? '🖼️' : '🔗'}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ color: 'white', fontWeight: 'bold' }}>{item.name}</div>
                                                <div style={{ color: '#666', fontSize: '0.75rem', textTransform: 'capitalize' }}>{item.type}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => addToCategory(item)}
                                            style={{
                                                padding: '0.4rem 1rem',
                                                background: 'var(--neon-green)',
                                                color: 'black',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            Add
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryManager;
