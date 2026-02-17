import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X, Grid3X3, Layers, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ICON_MAP } from '../../config/icons';
import '../gallery/Gallery.css';

// Animation variants - static constant (not memoized, no dependencies needed)
const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.08,
            duration: 0.3,
            ease: 'easeOut'
        }
    }),
    hover: {
        y: -5,
        transition: { duration: 0.2 }
    }
};

// Optimization: Simple CSS Grid Background
const GridBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="absolute inset-0 bg-radial-gradient" />
    </div>
);

// HexNode with GPU-accelerated glow + keyboard navigation
const HexNode = ({ category, isActive, onClick, index }) => {
    const Icon = ICON_MAP[category.icon] || ICON_MAP.Sparkles;

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
        }
    }, [onClick]);

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            whileHover="hover"
            custom={index}
            variants={cardVariants}
            onClick={onClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="button"
            aria-label={`View ${category.title} category`}
            className="relative cursor-pointer group gallery-card focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-offset-2 focus:ring-offset-black"
            style={{ '--glow-color': category.color }}
        >
            {/* GPU-accelerated glow layer */}
            <div
                className="gallery-glow"
                style={{ '--glow-color': category.color }}
            />

            {/* Main card */}
            <div
                className={`relative overflow-hidden rounded-2xl p-6 md:p-8 border transition-colors duration-200
                    ${isActive
                        ? 'bg-white/10 border-white/30'
                        : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                    }`}
            >
                {/* Icon container */}
                <div
                    className="w-16 h-16 md:w-20 md:h-20 rounded-xl flex items-center justify-center mb-4 md:mb-6 relative overflow-hidden transition-transform duration-200 group-hover:scale-105"
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

// Expanded category panel with optimized glow
const CategoryPanel = ({ category, onClose }) => {
    const navigate = useNavigate();
    const Icon = ICON_MAP[category.icon] || ICON_MAP.Sparkles;

    if (!category) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-title"
        >
            {/* Backdrop - NO blur for performance */}
            <div className="absolute inset-0 bg-black/95" />

            {/* Panel with GPU-accelerated glow */}
            <div
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.key === 'Escape' && onClose()}
                tabIndex={-1}
                className="relative w-full max-w-4xl max-h-[80vh] overflow-y-auto rounded-3xl bg-[#0a0a0a] border border-white/10 p-6 md:p-10 custom-scrollbar animate-slide-up gallery-panel"
                style={{ '--glow-color': category.color }}
            >
                {/* Glow layer rendered as pseudo-element via CSS */}
                <div className="gallery-panel-glow" style={{ '--glow-color': category.color }} />

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors"
                    aria-label="Close category panel"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="relative z-10 flex items-center gap-4 mb-8">
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
                        <h2 id="category-title" className="text-3xl font-bold" style={{ color: category.color }}>
                            {category.title}
                        </h2>
                        <p className="text-gray-500">{category.subtitle}</p>
                    </div>
                </div>

                {/* Sub-categories grid */}
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {category.items?.map((item, index) => (
                        <div
                            key={item.id || index}
                            onClick={() => {
                                if (item.link) {
                                    if (item.link.startsWith('http')) window.open(item.link, '_blank');
                                    else navigate(item.link);
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    if (item.link) {
                                        if (item.link.startsWith('http')) window.open(item.link, '_blank');
                                        else navigate(item.link);
                                    }
                                }
                            }}
                            tabIndex={0}
                            role="button"
                            className="group relative p-5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 hover:bg-white/[0.04] cursor-pointer transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-white/20"
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

                {/* Professional Empty State */}
                {(!category.items || category.items.length === 0) && (
                    <div className="relative z-10 flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-24 h-24 mb-6 rounded-full bg-white/5 flex items-center justify-center">
                            <Icon size={40} style={{ color: category.color }} className="opacity-50" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                            No items yet
                        </h3>
                        <p className="text-gray-500 max-w-md mb-6">
                            This category is waiting for content. Add items via the Admin Editor to get started.
                        </p>
                        <button
                            onClick={() => navigate('/admin/editor')}
                            className="px-6 py-3 rounded-lg bg-[var(--accent-primary)] text-black font-semibold hover:opacity-90 transition-opacity"
                        >
                            Add Content
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Empty state for when no categories exist
const EmptyGalleryState = () => (
    <div className="relative min-h-[60vh] flex flex-col items-center justify-center py-20">
        <GridBackground />
        <div className="relative z-10 text-center px-4">
            <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                <Grid3X3 size={48} className="text-gray-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Welcome to the Gallery
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto mb-8">
                Your gallery is waiting for content. Create categories and add media to showcase your work.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                    onClick={() => window.location.href = '/admin/editor'}
                    className="px-8 py-4 rounded-lg bg-[var(--accent-primary)] text-black font-bold hover:opacity-90 transition-opacity"
                >
                    Start Creating
                </button>
                <button
                    onClick={() => window.location.href = '/admin'}
                    className="px-8 py-4 rounded-lg bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors"
                >
                    Go to Dashboard
                </button>
            </div>
        </div>
    </div>
);

const GalleryGrid = ({ categories = [], cmsStyles = {}, isEditor = false }) => {
    const [activeCategory, setActiveCategory] = useState(null);
    const [viewMode, setViewMode] = useState('grid');

    // Default categories if none provided
    const displayCategories = useMemo(() => {
        if (categories.length > 0) return categories;
        return [
            {
                id: 'games',
                title: 'GAMES',
                subtitle: 'Interactive Experiences',
                icon: 'Gamepad2',
                color: '#00ff88',
                items: []
            }
        ];
    }, [categories]);

    // Check if showing default/empty state
    const isEmptyState = categories.length === 0;

    // In editor mode, show a compact preview
    if (isEditor) {
        return (
            <div
                className="w-full h-full flex flex-col items-center justify-center"
                style={{
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
                    ...cmsStyles
                }}
            >
                <div className="text-3xl mb-2">🎮</div>
                <div className="text-sm font-bold text-white">Gallery Grid</div>
                <div className="text-xs text-gray-500 mt-1">{displayCategories.length} categories</div>
                <div className="flex gap-2 mt-3">
                    {displayCategories.slice(0, 4).map((cat, i) => (
                        <div
                            key={i}
                            className="w-8 h-8 rounded flex items-center justify-center text-xs"
                            style={{ background: cat.color + '20', color: cat.color }}
                        >
                            {cat.title?.[0] || '?'}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Show empty state if no categories
    if (isEmptyState) {
        return <EmptyGalleryState />;
    }

    return (
        <div className="relative min-h-[60vh] py-12 px-4" style={cmsStyles}>
            <GridBackground />

            {/* View mode toggle */}
            <div className="relative z-10 flex justify-end max-w-6xl mx-auto mb-6">
                <div className="flex gap-2 bg-black/40 p-1 rounded-lg border border-white/10">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                        aria-label="Grid view"
                    >
                        <Grid3X3 size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                        aria-label="List view"
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
        </div>
    );
};

export default GalleryGrid;
