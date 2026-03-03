import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ArrowLeft, ExternalLink, Gamepad2, AppWindow, Wrench, Box, Film, Image, Headphones } from 'lucide-react';

const GALLERY_CATEGORIES = {
    games: { title: 'GAMES', color: '#00ff88', icon: 'Gamepad2' },
    apps: { title: 'APPS', color: '#00d4ff', icon: 'AppWindow' },
    tools: { title: 'TOOLS', color: '#ff6b35', icon: 'Wrench' },
    videos: { title: 'VIDEOS', color: '#ff00ff', icon: 'Film' },
    images: { title: 'IMAGES', color: '#00ffff', icon: 'Image' },
    audio: { title: 'AUDIO', color: '#ff4444', icon: 'Headphones' },
    '3d': { title: '3D', color: '#c79b37', icon: 'Box' },
    other: { title: 'OTHER', color: '#888888', icon: 'Box' },
};

const ICON_MAP = {
    Gamepad2,
    AppWindow,
    Wrench,
    Box,
    Film,
    Image,
    Headphones,
};

const ItemDetail = () => {
    const { category, id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const categoryInfo = GALLERY_CATEGORIES[category] || { title: category.toUpperCase(), color: '#888888', icon: 'Box' };
    const Icon = ICON_MAP[categoryInfo.icon] || Box;

    useEffect(() => {
        const fetchItem = async () => {
            if (!category || !id) {
                setError('Missing category or item ID');
                setLoading(false);
                return;
            }

            try {
                const docRef = doc(db, 'gallery_categories', category);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists() && docSnap.data().items) {
                    const foundItem = docSnap.data().items.find(i => i.id === id);
                    if (foundItem) {
                        setItem(foundItem);
                    } else {
                        setError('Item not found');
                    }
                } else {
                    setError('Category not found');
                }
            } catch (err) {
                console.error('Error fetching item:', err);
                setError('Failed to load item');
            } finally {
                setLoading(false);
            }
        };

        fetchItem();
    }, [category, id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] pt-32 flex items-center justify-center">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] pt-32 flex flex-col items-center justify-center">
                <div className="text-red-400 mb-4">{error || 'Item not found'}</div>
                <button
                    onClick={() => navigate('/gallery')}
                    className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
                >
                    Back to Gallery
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-20">
            <div className="max-w-4xl mx-auto px-4">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/gallery')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Gallery
                </button>

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center"
                        style={{
                            background: `linear-gradient(135deg, ${categoryInfo.color}30, ${categoryInfo.color}10)`,
                            border: `1px solid ${categoryInfo.color}50`
                        }}
                    >
                        <Icon size={32} style={{ color: categoryInfo.color }} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-white">{item.name}</h1>
                        <p className="text-gray-400">{categoryInfo.title}</p>
                    </div>
                </div>

                {/* Description */}
                {item.description && (
                    <div className="mb-8 p-4 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-gray-300">{item.description}</p>
                    </div>
                )}

                {/* Media Content */}
                <div className="mb-8 rounded-2xl overflow-hidden bg-black border border-white/10">
                    {item.type === 'image' && item.url && (
                        <img src={item.url} alt={item.name} className="w-full max-h-[60vh] object-contain" />
                    )}
                    {item.type === 'video' && item.url && (
                        <video src={item.url} controls autoPlay className="w-full max-h-[60vh]" />
                    )}
                    {item.type === 'audio' && item.url && (
                        <div className="p-8 flex flex-col items-center">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mb-6">
                                <Headphones size={48} className="text-blue-400" />
                            </div>
                            <audio src={item.url} controls autoPlay className="w-full max-w-md" />
                        </div>
                    )}
                    {item.type === 'embed' && item.url && (
                        <div className="aspect-video">
                            <iframe
                                src={item.url}
                                title={item.name}
                                className="w-full h-full"
                                frameBorder="0"
                                allowFullScreen
                            />
                        </div>
                    )}
                    {!item.type || item.type === 'link' ? (
                        <div className="p-12 text-center">
                            {item.url ? (
                                <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-neon-green text-black font-bold rounded-lg hover:opacity-80 transition-opacity"
                                >
                                    <ExternalLink size={20} />
                                    Open {item.name}
                                </a>
                            ) : (
                                <p className="text-gray-500">No preview available</p>
                            )}
                        </div>
                    ) : null}
                </div>

                {/* External Link Button */}
                {item.link && item.link !== item.url && (
                    <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                    >
                        <ExternalLink size={20} />
                        Visit Website
                    </a>
                )}
            </div>
        </div>
    );
};

export default ItemDetail;
