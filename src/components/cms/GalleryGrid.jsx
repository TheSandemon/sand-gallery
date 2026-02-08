import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, AppWindow, Film, Sparkles, ChevronRight, X, Grid3X3, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Icon mapping for CMS string values
const ICON_MAP = {
    Gamepad2,
    AppWindow,
    Film,
    Sparkles,
};

// Optimization: Simple CSS Grid Background instead of heavy DOM elements
const GridBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="absolute inset-0 bg-radial-gradient" />
    </div>
);

// HexNode with reduced motion attributes
const HexNode = ({ category, isActive, onClick, index }) => {
    const Icon = ICON_MAP[category.icon] || Sparkles;
    const delay = index * 0.1;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            onClick={onClick}
            className="relative cursor-pointer group"
        >
            {/* Main card - Reduced blur for performance */}
            <div
                className={`relative overflow-hidden rounded-2xl p-6 md:p-8 border transition-all duration-300
                    ${isActive
                        ? 'bg-white/10 border-white/30'
                        : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                    }`}
                style={{
                    boxShadow: isActive ? `0 0 30px ${category.color}40` : 'none'
                }}
            >
                {/* Icon container */}
                <div
                    className="w-16 h-16 md:w-20 md:h-20 rounded-xl flex items-center justify-center mb-4 md:mb-6 relative overflow-hidden transition-transform duration-300 group-hover:scale-105"
                    style={{
                        background: `linear-gradient(135deg, ${category.color}20, ${category.color}05)`,
                        border: `1px solid ${category.color}40`
                    }}
                >
                    <Icon
                        size={32}
                        style={{ color: category.color }}
                        className="relative z-10"
                    />
                </div>

                {/* Text */}
                <h3
                    className="text-2xl md:text-3xl font-bold tracking-wider mb-1"
                    style={{ color: category.color }}
                >
                    {category.title}
                </h3>
                <p className="text-sm text-gray-500 tracking-wide">
                    {category.subtitle}
                </p>

                {/* Item count badge */}
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-gray-400">
                    {category.items?.length || 0} items
                </div>
            </div>
        </motion.div>
    );
};

// Expanded category panel
const CategoryPanel = ({ category, onClose }) => {
    const navigate = useNavigate();
    const Icon = ICON_MAP[category.icon] || Sparkles;

    if (!category) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 animate-fade-in"
            onClick={onClose}
        >
            {/* Backdrop - darker and reduced blur */}
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

            {/* Panel */}
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-4xl max-h-[80vh] overflow-y-auto rounded-3xl bg-[#0a0a0a] border border-white/10 p-6 md:p-10 custom-scrollbar animate-slide-up"
                style={{
                    boxShadow: `0 0 50px ${category.color}20`
                }}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center"
                        style={{
                            background: `linear-gradient(135deg, ${category.color}30, ${category.color}10)`,
                            border: `1px solid ${category.color}50`
                        }}
                    >
                        <Icon size={28} style={{ color: category.color }} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold" style={{ color: category.color }}>
                            {category.title}
                        </h2>
                        <p className="text-gray-500">{category.subtitle}</p>
                    </div>
                </div>

                {/* Sub-categories grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {category.items?.map((item, index) => (
                        <div
                            key={item.id || index}
                            onClick={() => {
                                if (item.link) {
                                    if (item.link.startsWith('http')) window.open(item.link, '_blank');
                                    else navigate(item.link);
                                }
                            }}
                            className="group relative p-5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 hover:bg-white/[0.04] cursor-pointer transition-all"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-lg font-semibold text-white group-hover:text-neon-green transition-colors">
                                        {item.name}
                                    </h4>
                                    <p className="text-sm text-gray-500">{item.description || 'View Details'}</p>
                                </div>
                                <ChevronRight
                                    size={20}
                                    className="text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-transform"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const GalleryGrid = ({ categories = [], cmsStyles = {} }) => {
    const [activeCategory, setActiveCategory] = useState(null);
    const [viewMode, setViewMode] = useState('grid');

    // Default categories if none provided
    const displayCategories = categories.length > 0 ? categories : [
        {
            id: 'games',
            title: 'GAMES',
            subtitle: 'Interactive Experiences',
            icon: 'Gamepad2',
            color: '#00ff88',
            items: []
        }
    ];

    return (
        <div className="relative min-h-[60vh] py-12 px-4" style={cmsStyles}>
            <GridBackground />

            {/* View mode toggle */}
            <div className="relative z-10 flex justify-end max-w-6xl mx-auto mb-6">
                <div className="flex gap-2 bg-black/40 backdrop-blur-sm p-1 rounded-lg border border-white/10">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                    >
                        <Grid3X3 size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                    >
                        <Layers size={18} />
                    </button>
                </div>
            </div>

            {/* Category Grid */}
            <div className="relative max-w-6xl mx-auto z-10">
                <div className={`grid gap-4 md:gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                    {displayCategories.map((category, index) => (
                        <HexNode
                            key={category.id || index}
                            category={category}
                            index={index}
                            isActive={activeCategory?.id === category.id}
                            onClick={() => setActiveCategory(category)}
                        />
                    ))}
                </div>
            </div>

            {/* Expanded Category Panel */}
            <AnimatePresence>
                {activeCategory && (
                    <CategoryPanel
                        category={activeCategory}
                        onClose={() => setActiveCategory(null)}
                    />
                )}
            </AnimatePresence>

            <style>{`
                .bg-grid-pattern {
                    background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
                    background-size: 40px 40px;
                }
                .bg-radial-gradient {
                    background: radial-gradient(circle at center, transparent 0%, #0a0a0a 100%);
                }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
                @keyframes slide-up {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up {
                    animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
};

export default GalleryGrid;
