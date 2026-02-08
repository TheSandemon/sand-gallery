import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, AppWindow, Film, Sparkles, ChevronRight, X, Grid3X3, Layers } from 'lucide-react';

// Category data structure - expand with real items later
const CATEGORIES = [
    {
        id: 'games',
        title: 'GAMES',
        subtitle: 'Interactive Experiences',
        icon: Gamepad2,
        color: '#00ff88',
        glowColor: 'rgba(0, 255, 136, 0.3)',
        items: [
            { id: 'arcade', name: 'Arcade', count: 12 },
            { id: 'puzzle', name: 'Puzzle', count: 8 },
            { id: 'strategy', name: 'Strategy', count: 5 },
            { id: 'adventure', name: 'Adventure', count: 7 },
        ]
    },
    {
        id: 'apps',
        title: 'APPS',
        subtitle: 'Tools & Utilities',
        icon: AppWindow,
        color: '#00d4ff',
        glowColor: 'rgba(0, 212, 255, 0.3)',
        items: [
            { id: 'productivity', name: 'Productivity', count: 6 },
            { id: 'creative', name: 'Creative', count: 9 },
            { id: 'dev-tools', name: 'Dev Tools', count: 4 },
            { id: 'utilities', name: 'Utilities', count: 11 },
        ]
    },
    {
        id: 'videos',
        title: 'VIDEOS',
        subtitle: 'Visual Media',
        icon: Film,
        color: '#ff6b35',
        glowColor: 'rgba(255, 107, 53, 0.3)',
        items: [
            { id: 'shorts', name: 'Shorts', count: 24 },
            { id: 'tutorials', name: 'Tutorials', count: 15 },
            { id: 'showcases', name: 'Showcases', count: 8 },
            { id: 'experiments', name: 'Experiments', count: 6 },
        ]
    },
    {
        id: 'experiences',
        title: 'EXPERIENCES',
        subtitle: 'Immersive Worlds',
        icon: Sparkles,
        color: '#c79b37',
        glowColor: 'rgba(199, 155, 55, 0.3)',
        items: [
            { id: 'vr', name: 'VR/AR', count: 3 },
            { id: '3d-worlds', name: '3D Worlds', count: 5 },
            { id: 'interactive-art', name: 'Interactive Art', count: 7 },
            { id: 'simulations', name: 'Simulations', count: 4 },
        ]
    }
];

// Animated grid background
const GridBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Perspective grid */}
        <div className="absolute inset-0" style={{
            backgroundImage: `
                linear-gradient(rgba(0, 143, 78, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 143, 78, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            transform: 'perspective(500px) rotateX(60deg)',
            transformOrigin: 'center top',
            height: '200%',
            top: '50%'
        }} />
        {/* Radial glow */}
        <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at center top, rgba(0, 143, 78, 0.08) 0%, transparent 60%)'
        }} />
    </div>
);

// Hexagonal node component for the exploration interface
const HexNode = ({ category, isActive, onClick, index }) => {
    const Icon = category.icon;
    const delay = index * 0.1;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            onClick={onClick}
            className="relative cursor-pointer group"
        >
            {/* Outer glow ring */}
            <motion.div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                    background: `radial-gradient(circle at center, ${category.glowColor}, transparent 70%)`,
                    filter: 'blur(20px)',
                    transform: 'scale(1.5)'
                }}
            />

            {/* Main card */}
            <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className={`relative overflow-hidden rounded-2xl p-6 md:p-8 border transition-all duration-500
                    ${isActive
                        ? 'bg-white/10 border-white/30'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                style={{
                    backdropFilter: 'blur(20px)',
                    boxShadow: isActive ? `0 0 40px ${category.glowColor}` : 'none'
                }}
            >
                {/* Circuit pattern overlay */}
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0v20M30 40v20M0 30h20M40 30h20' stroke='white' stroke-width='1' fill='none'/%3E%3Ccircle cx='30' cy='30' r='4' fill='white'/%3E%3C/svg%3E")`,
                    backgroundSize: '60px 60px'
                }} />

                {/* Icon container */}
                <div
                    className="w-16 h-16 md:w-20 md:h-20 rounded-xl flex items-center justify-center mb-4 md:mb-6 relative overflow-hidden"
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
                    {/* Pulse effect */}
                    <motion.div
                        className="absolute inset-0"
                        style={{ background: category.color }}
                        animate={{ opacity: [0.1, 0.2, 0.1] }}
                        transition={{ duration: 2, repeat: Infinity }}
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
                    {category.items.reduce((sum, item) => sum + item.count, 0)} items
                </div>

                {/* Explore indicator */}
                <motion.div
                    className="absolute bottom-4 right-4 flex items-center gap-1 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    EXPLORE <ChevronRight size={14} />
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

// Expanded category panel
const CategoryPanel = ({ category, onClose }) => {
    if (!category) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-lg" />

            {/* Panel */}
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-4xl max-h-[80vh] overflow-y-auto rounded-3xl bg-[#0a0a0a]/95 border border-white/10 p-6 md:p-10 custom-scrollbar"
                style={{
                    boxShadow: `0 0 100px ${category.glowColor}`
                }}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
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
                        <category.icon size={28} style={{ color: category.color }} />
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
                    {category.items.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group relative p-5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 hover:bg-white/[0.04] cursor-pointer transition-all"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-lg font-semibold text-white group-hover:text-neon-green transition-colors">
                                        {item.name}
                                    </h4>
                                    <p className="text-sm text-gray-500">{item.count} items</p>
                                </div>
                                <ChevronRight
                                    size={20}
                                    className="text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all"
                                />
                            </div>

                            {/* Hover indicator line */}
                            <motion.div
                                className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r"
                                style={{
                                    background: `linear-gradient(90deg, ${category.color}, transparent)`
                                }}
                                initial={{ width: 0 }}
                                whileHover={{ width: '100%' }}
                                transition={{ duration: 0.3 }}
                            />
                        </motion.div>
                    ))}
                </div>

                {/* Coming soon message */}
                <div className="mt-8 p-4 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-center">
                    <p className="text-gray-500 text-sm">
                        More {category.title.toLowerCase()} coming soon. Check back for updates!
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};

const Gallery = () => {
    const [activeCategory, setActiveCategory] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-[100px] md:pt-[120px] pb-20 px-4 md:px-8 relative overflow-hidden">
            <GridBackground />

            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative max-w-6xl mx-auto text-center mb-12 md:mb-16"
            >
                {/* Glowing title effect */}
                <div className="relative inline-block">
                    <motion.div
                        className="absolute inset-0 blur-3xl opacity-30"
                        style={{ background: 'linear-gradient(90deg, var(--neon-green), var(--neon-gold))' }}
                        animate={{ opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    />
                    <h1 className="relative text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                        THE <span className="text-neon-green">GALLERY</span>
                    </h1>
                </div>

                <p className="mt-4 text-gray-500 text-lg md:text-xl max-w-2xl mx-auto">
                    Explore the collection. Discover games, apps, videos, and immersive experiences.
                </p>

                {/* View mode toggle */}
                <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'grid'
                            ? 'bg-white/10 text-white'
                            : 'text-gray-500 hover:text-white'
                            }`}
                    >
                        <Grid3X3 size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'list'
                            ? 'bg-white/10 text-white'
                            : 'text-gray-500 hover:text-white'
                            }`}
                    >
                        <Layers size={20} />
                    </button>
                </div>
            </motion.div>

            {/* Category Grid */}
            <div className="relative max-w-6xl mx-auto">
                <div className={`grid gap-4 md:gap-6 ${viewMode === 'grid'
                    ? 'grid-cols-1 md:grid-cols-2'
                    : 'grid-cols-1'
                    }`}>
                    {CATEGORIES.map((category, index) => (
                        <HexNode
                            key={category.id}
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

            {/* Floating particles effect */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 rounded-full bg-neon-green/30"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`
                        }}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0.2, 0.5, 0.2]
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default Gallery;
