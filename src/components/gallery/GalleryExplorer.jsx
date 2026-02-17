import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Shuffle, RefreshCw, Heart } from 'lucide-react';
import MasonryGrid from './MasonryGrid';
import MediaCard from './MediaCard';
import WishlistGallery from './WishlistGallery';
import useMediaLibrary from '../../hooks/useMediaLibrary';
import MediaViewer from '../MediaViewer';
import { CATEGORIES } from '../../config/constants';
import { useWishlistContext } from '../../context/WishlistContext';

// TAGS alias for backward compatibility - centralized in constants.js
const TAGS = CATEGORIES;

const GalleryExplorer = () => {
    const { mediaItems, loading, error } = useMediaLibrary();
    const { count: wishlistCount } = useWishlistContext();
    const [selectedTag, setSelectedTag] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewData, setViewData] = useState(null); // Item to view in lightbox
    const [isShuffling, setIsShuffling] = useState(false);
    const [showWishlist, setShowWishlist] = useState(false);

    // Filter and Sort Logic
    const filteredItems = useMemo(() => {
        let items = [...mediaItems];

        // 1. Filter by Tag/Type
        if (selectedTag !== 'All') {
            const lowerTag = selectedTag.toLowerCase();
            items = items.filter(item =>
                item.type === lowerTag ||
                item.tags?.some(tag => tag.toLowerCase() === lowerTag)
            );
        }

        // 2. Filter by Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            items = items.filter(item =>
                item.title?.toLowerCase().includes(q) ||
                item.description?.toLowerCase().includes(q) ||
                item.tags?.some(tag => tag.toLowerCase().includes(q))
            );
        }

        // 3. Shuffle Effect
        if (isShuffling) {
            return items.sort(() => Math.random() - 0.5);
        }

        return items;
    }, [mediaItems, selectedTag, searchQuery, isShuffling]);

    const handleShuffle = () => {
        setIsShuffling(true);
        setTimeout(() => setIsShuffling(false), 500); // Visual delay
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <RefreshCw className="animate-spin text-var(--neon-green) mb-4" size={32} />
            <p className="text-gray-500">Loading neural archives...</p>
        </div>
    );

    if (error) return (
        <div className="text-center text-red-500 py-20">
            <p>Error loading gallery data.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8">
            {/* Header & Controls */}
            <div className="max-w-[1600px] mx-auto mb-8 md:mb-12 sticky top-[80px] z-40 bg-[#0a0a0a]/90 backdrop-blur-md py-4 border-b border-white/5">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">

                    {/* Search Bar */}
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-var(--neon-green) transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search archives..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#111] border border-[#333] rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-var(--neon-green) transition-colors"
                        />
                    </div>

                    {/* Tag Filters */}
                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                        {TAGS.map(tag => (
                            <button
                                key={tag}
                                onClick={() => { setSelectedTag(tag); setShowWishlist(false); }}
                                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border ${selectedTag === tag && !showWishlist
                                        ? 'bg-var(--neon-green) text-black border-var(--neon-green)'
                                        : 'bg-[#111] text-gray-400 border-[#333] hover:border-gray-500 hover:text-white'
                                    }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        {/* Wishlist Toggle */}
                        <button
                            onClick={() => setShowWishlist(!showWishlist)}
                            className={`p-2 rounded-full transition-all relative ${showWishlist 
                                ? 'bg-red-500/20 text-red-500 border border-red-500/50' 
                                : 'bg-[#111] border border-[#333] text-gray-400 hover:text-red-500 hover:border-red-500/50'
                            }`}
                            title="My Collection"
                        >
                            <Heart size={20} fill={showWishlist ? "currentColor" : "none"} />
                            {wishlistCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    {wishlistCount}
                                </span>
                            )}
                        </button>

                        {/* Shuffle Button */}
                        <button
                            onClick={handleShuffle}
                            className="p-2 rounded-full bg-[#111] border border-[#333] text-gray-400 hover:text-var(--neon-green hover:border-var(--neon-green transition-all"
                            title="Randomize Layout"
                        >
                            <Shuffle size={20} className={isShuffling ? "animate-spin" : ""} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-[1600px] mx-auto min-h-[60vh]">
                <AnimatePresence mode="wait">
                    {showWishlist ? (
                        <motion.div
                            key="wishlist"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <WishlistGallery onItemClick={setViewData} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="gallery"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <MasonryGrid
                                items={filteredItems}
                                renderItem={(item) => (
                                    <MediaCard
                                        key={item.id}
                                        item={item}
                                        onClick={setViewData}
                                        showWishlistButton={true}
                                    />
                                )}
                            />

                            {filteredItems.length === 0 && (
                                <div className="text-center py-20 text-gray-600">
                                    <p className="text-lg">No signals found matching your filters.</p>
                                    <button
                                        onClick={() => { setSelectedTag('All'); setSearchQuery(''); }}
                                        className="mt-4 text-var(--neon-green) hover:underline"
                                    >
                                        Reset filters
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Lightbox Viewer */}
            <AnimatePresence>
                {viewData && (
                    <MediaViewer
                        item={viewData}
                        onClose={() => setViewData(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default GalleryExplorer;
