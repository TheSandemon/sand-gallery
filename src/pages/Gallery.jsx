import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, AppWindow, Film, Sparkles, ChevronRight, X, Grid3X3, Layers, Wrench, Box, Image, Headphones, Folder, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import MediaViewer from '../components/MediaViewer';
import Thumbnail from '../components/gallery/Thumbnail';

// Hardcoded 8 categories - no Firestore dependency
// Use Admin Media Manager to add items to categories
const GALLERY_CATEGORIES = [
    {
        id: 'games',
        title: 'GAMES',
        subtitle: 'Interactive Experiences',
        icon: 'Gamepad2',
        color: '#00ff88',
        items: []
    },
    {
        id: 'apps',
        title: 'APPS',
        subtitle: 'Applications',
        icon: 'AppWindow',
        color: '#00d4ff',
        items: []
    },
    {
        id: 'tools',
        title: 'TOOLS',
        subtitle: 'Utilities & Software',
        icon: 'Wrench',
        color: '#ff6b35',
        items: []
    },
    {
        id: 'videos',
        title: 'VIDEOS',
        subtitle: 'Visual Media',
        icon: 'Film',
        color: '#ff00ff',
        items: []
    },
    {
        id: 'feature_roll',
        title: 'FEATURE ROLL',
        subtitle: 'Landing Page Backgrounds',
        icon: 'Film',
        color: '#ff3366',
        items: []
    },
    {
        id: '3d',
        title: '3D',
        subtitle: '3D Models & VR',
        icon: 'Box',
        color: '#c79b37',
        items: []
    },
    {
        id: 'images',
        title: 'IMAGES',
        subtitle: 'Art & Photography',
        icon: 'Image',
        color: '#00ffff',
        items: []
    },
    {
        id: 'audio',
        title: 'AUDIO',
        subtitle: 'Music & Sound',
        icon: 'Headphones',
        color: '#ff4444',
        items: []
    },
    {
        id: 'other',
        title: 'OTHER',
        subtitle: 'Miscellaneous',
        icon: 'Folder',
        color: '#888888',
        items: []
    }
];

// Icon mapping
const ICON_MAP = {
    Gamepad2,
    AppWindow,
    Film,
    Sparkles,
    Wrench,
    Box,
    Image,
    Headphones,
    Folder,
};

// Grid background
const GridBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="absolute inset-0 bg-radial-gradient" />
    </div>
);

// Category card
const CategoryCard = ({ category, isActive, onClick, index }) => {
    const Icon = ICON_MAP[category.icon] || Sparkles;
    const delay = index * 0.08;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.3 }}
            onClick={onClick}
            className="relative cursor-pointer group gallery-card"
            style={{ '--glow-color': category.color }}
        >
            <div className="gallery-glow" style={{ '--glow-color': category.color }} />
            <div
                className={`relative overflow-hidden rounded-2xl p-6 md:p-8 border transition-colors duration-200
                    ${isActive ? 'bg-white/10 border-white/30' : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'}`}
            >
                <div
                    className="w-16 h-16 md:w-20 md:h-20 rounded-xl flex items-center justify-center mb-4 md:mb-6"
                    style={{
                        background: `linear-gradient(135deg, ${category.color}20, ${category.color}05)`,
                        border: `1px solid ${category.color}40`
                    }}
                >
                    <Icon size={32} style={{ color: category.color }} className="relative z-10" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold tracking-wider mb-1" style={{ color: category.color }}>
                    {category.title}
                </h3>
                <p className="text-sm text-gray-500 tracking-wide">
                    {category.subtitle}
                </p>
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-gray-400">
                    {category.items?.length || 0} items
                </div>
            </div>
        </motion.div>
    );
};

// Expanded category panel
const CategoryPanel = ({ category, onClose, onItemClick }) => {
    const navigate = useNavigate();
    const Icon = ICON_MAP[category.icon] || Sparkles;

    if (!category) return null;

    const handleItemClick = (item) => {
        // For image/video/audio, show inline viewer
        if (item.type === 'image' || item.type === 'video' || item.type === 'audio' || item.type === 'game' || item.type === 'app' || item.type === 'tool') {
            onItemClick(item);
        } else {
            // For games/apps/tools, navigate or show options
            if (item.link) {
                if (item.link.startsWith('http')) {
                    window.open(item.link, '_blank');
                } else {
                    // Internal link - navigate to detail page
                    navigate(`/item/${category.id}/${item.id}`);
                }
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 animate-fade-in" onClick={onClose}>
            <div className="absolute inset-0 bg-black/95" />
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-4xl max-h-[80vh] overflow-y-auto rounded-3xl bg-[#0a0a0a] border border-white/10 p-6 md:p-10 custom-scrollbar animate-slide-up gallery-panel"
                style={{ '--glow-color': category.color }}
            >
                <div className="gallery-panel-glow" style={{ '--glow-color': category.color }} />
                <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white">
                    <X size={20} />
                </button>
                <div className="relative z-10 flex items-center gap-4 mb-8">
                    <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${category.color}30, ${category.color}10)`, border: `1px solid ${category.color}50` }}
                    >
                        <Icon size={28} style={{ color: category.color }} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold" style={{ color: category.color }}>{category.title}</h2>
                        <p className="text-gray-500">{category.subtitle}</p>
                    </div>
                </div>
                <div className="relative z-10 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
                    {category.items?.map((item, idx) => (
                        <div
                            key={item.id || idx}
                            onClick={() => handleItemClick(item)}
                            className="group relative p-3 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 hover:bg-white/[0.04] cursor-pointer flex items-center gap-4"
                        >
                            {/* Thumbnail */}
                            <div className="w-16 h-16 rounded-lg bg-black overflow-hidden flex-shrink-0">
                                <Thumbnail item={item} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-lg font-semibold text-white group-hover:text-neon-green truncate">{item.name}</h4>
                                <p className="text-sm text-gray-500 truncate">{item.description || 'View Details'}</p>
                            </div>
                            <div className="flex-shrink-0">
                                {item.type === 'image' || item.type === 'video' || item.type === 'audio' || item.type === 'game' || item.type === 'app' || item.type === 'tool' ? (
                                    <span className="text-xs text-gray-500 capitalize">{item.type}</span>
                                ) : (
                                    <ExternalLink className="text-gray-600 group-hover:text-white transition-colors" size={20} />
                                )}
                            </div>
                        </div>
                    ))}
                    </div>
                </div>
                {(!category.items || category.items.length === 0) && (
                    <div className="relative z-10 text-center py-12 text-gray-500">
                        <p>No items in this category yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};


const Gallery = () => {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [categories, setCategories] = useState(GALLERY_CATEGORIES);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);

    // Fetch category items from Firestore
    useEffect(() => {
        const fetchCategoryItems = async () => {
            const updatedCategories = await Promise.all(
                GALLERY_CATEGORIES.map(async (cat) => {
                    try {
                        const docRef = doc(db, 'gallery_categories', cat.id);
                        const docSnap = await getDoc(docRef);
                        if (docSnap.exists() && docSnap.data().items) {
                            return { ...cat, items: docSnap.data().items };
                        }
                        return { ...cat, items: [] };
                    } catch (error) {
                        console.error(`Error fetching category ${cat.id}:`, error);
                        return { ...cat, items: [] };
                    }
                })
            );
            setCategories(updatedCategories);
            setLoading(false);
        };

        fetchCategoryItems();
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-20">
            {/* Header */}
            <div className="relative z-10 max-w-6xl mx-auto px-4 pt-12 pb-8">
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
                    THE <span className="text-neon-green">GALLERY</span>
                </h1>
                <p className="text-xl text-gray-400">Explore the collection</p>
            </div>

            <div className="relative min-h-[60vh] py-12 px-4">
                <GridBackground />

                {/* View mode toggle */}
                <div className="relative z-10 flex justify-end max-w-6xl mx-auto mb-6">
                    <div className="flex gap-2 bg-black/40 p-1 rounded-lg border border-white/10">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                        >
                            <Grid3X3 size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                        >
                            <Layers size={18} />
                        </button>
                    </div>
                </div>

                {/* Category Grid */}
                <div className="relative max-w-6xl mx-auto z-10">
                    {loading ? (
                        <div className="text-center text-gray-500 py-20">Loading gallery...</div>
                    ) : (
                    <div className={`grid gap-4 md:gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                        {categories.map((category, index) => (
                            <CategoryCard
                                key={category.id}
                                category={category}
                                index={index}
                                isActive={activeCategory?.id === category.id}
                                onClick={() => setActiveCategory(category)}
                            />
                        ))}
                    </div>
                    )}
                </div>

                {/* Expanded Category Panel */}
                <AnimatePresence>
                    {activeCategory && (
                        <CategoryPanel
                            category={activeCategory}
                            onClose={() => setActiveCategory(null)}
                            onItemClick={setSelectedItem}
                        />
                    )}
                </AnimatePresence>

                {/* Media Viewer Modal */}
                <AnimatePresence>
                    {selectedItem && (
                        <MediaViewer
                            item={{
                                ...selectedItem,
                                type: selectedItem.type,
                                url: selectedItem.url || selectedItem.githubRepo,
                                githubRepo: selectedItem.githubRepo,
                                prompt: selectedItem.description
                            }}
                            onClose={() => setSelectedItem(null)}
                            navigate={navigate}
                        />
                    )}
                </AnimatePresence>

                {/* Styles */}
                <style>{`
                    .bg-grid-pattern {
                        background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
                        background-size: 40px 40px;
                    }
                    .bg-radial-gradient { background: radial-gradient(circle at center, transparent 0%, #0a0a0a 100%); }
                    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                    .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
                    @keyframes slide-up { from { transform: translateY(20px) translateZ(0); opacity: 0; } to { transform: translateY(0) translateZ(0); opacity: 1; } }
                    .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                    .gallery-card { position: relative; }
                    .gallery-glow {
                        position: absolute; inset: -20px;
                        background: radial-gradient(circle at center, var(--glow-color, #00ff88) 0%, transparent 70%);
                        opacity: 0; pointer-events: none; z-index: -1;
                        will-change: opacity; transform: translateZ(0); transition: opacity 0.3s ease;
                    }
                    .gallery-card:hover .gallery-glow { opacity: 0.15; }
                    .gallery-panel { position: relative; overflow: visible; }
                    .gallery-panel-glow {
                        position: absolute; inset: -40px;
                        background: radial-gradient(ellipse at center, var(--glow-color, #00ff88) 0%, transparent 60%);
                        opacity: 0.1; pointer-events: none; z-index: 0;
                        will-change: opacity; transform: translateZ(0); filter: blur(40px);
                    }
                `}</style>
            </div>
        </div>
    );
};

export default Gallery;
