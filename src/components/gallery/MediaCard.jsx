/**
 * MediaCard - Gallery media item card
 * Supports images, videos, audio, and 3D models
 */
import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Music, Box, Image as ImageIcon, Heart, Share2, Maximize2, Loader2, Eye } from 'lucide-react';
import useViewCount from '../../hooks/useViewCount';
import WishlistButton from './WishlistButton';

/**
 * Skeleton loader for media card
 * Displays shimmer effect while content loads
 */
const MediaCardSkeleton = () => (
    <div className="relative group mb-6 break-inside-avoid animate-pulse">
        <div className="relative overflow-hidden rounded-xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10">
            {/* Image skeleton */}
            <div className="w-full aspect-video bg-gradient-to-br from-white/5 to-white/10" />
            
            {/* Overlay skeleton */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="h-5 w-3/4 bg-white/10 rounded mb-3" />
                <div className="flex gap-2">
                    <div className="h-5 w-12 bg-white/10 rounded-full" />
                    <div className="h-5 w-12 bg-white/10 rounded-full" />
                </div>
            </div>
        </div>
    </div>
);

/**
 * Shimmer animation style
 * Used for loading states
 */
const shimmerKeyframes = `
    @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
    }
    .animate-shimmer {
        background: linear-gradient(90deg, 
            rgba(255,255,255,0.03) 25%, 
            rgba(255,255,255,0.08) 50%, 
            rgba(255,255,255,0.03) 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
    }
`;

/**
 * Get icon based on media type
 */
const getTypeIcon = (type) => {
    const icons = {
        video: Play,
        audio: Music,
        model: Box,
        image: ImageIcon
    };
    return icons[type] || ImageIcon;
};

/**
 * MediaCard Component
 * 
 * @param {Object} item - Media item data
 * @param {Function} onClick - Click handler
 * @param {boolean} isLoading - Show skeleton loader
 * @param {boolean} showWishlistButton - Show wishlist heart button (default: false)
 * @param {number} index - Index for animation stagger
 */
const MediaCard = ({ item, onClick, isLoading = false, showWishlistButton = false, index = 0 }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const { views, isLoading: viewsLoading, incrementViews } = useViewCount(item?.id);

    const TypeIcon = useMemo(() => getTypeIcon(item.type), [item.type]);

    // Increment view count on click
    useEffect(() => {
        if (item?.id) {
            incrementViews();
        }
    }, [item?.id]);

    // Show skeleton while loading
    if (isLoading) {
        return <MediaCardSkeleton />;
    }

    return (
        <>
            <style>{shimmerKeyframes}</style>
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -5 }}
                className="relative group mb-6 break-inside-avoid"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => onClick(item)}
            >
                {/* Card Container */}
                <div className="relative overflow-hidden rounded-xl bg-[var(--bg-card)] border border-[var(--text-primary)]/10 group-hover:border-[var(--accent-primary)]/50 transition-colors duration-300">

                    {/* Media Content */}
                    <div className="relative w-full overflow-hidden">
                        {/* Loading placeholder with shimmer */}
                        {!imageLoaded && !imageError && (
                            <div className="absolute inset-0 animate-shimmer" />
                        )}
                        
                        {/* Error state */}
                        {imageError && (
                            <div className="w-full aspect-video bg-white/5 flex items-center justify-center">
                                <ImageIcon size={32} className="text-gray-600" />
                            </div>
                        )}
                        
                        {/* Image */}
                        <img
                            src={item.thumbnail || item.url}
                            alt={item.title}
                            className={`w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105
                                ${imageLoaded ? 'opacity-100' : 'opacity-0'}
                            `}
                            loading="lazy"
                            onLoad={() => setImageLoaded(true)}
                            onError={() => setImageError(true)}
                        />

                        {/* Overlay Gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4`} />

                        {/* Type Badge */}
                        <div className="absolute top-3 right-3 bg-[var(--bg-dark)]/50 backdrop-blur-md border border-[var(--text-primary)]/10 p-1.5 rounded-lg text-[var(--text-primary)]/80">
                            <TypeIcon size={14} />
                        </div>

                        {/* View Count Badge */}
                        {!viewsLoading && views > 0 && (
                            <div className="absolute top-3 left-3 bg-[var(--bg-dark)]/50 backdrop-blur-md border border-[var(--text-primary)]/10 px-2 py-1 rounded-lg flex items-center gap-1.5 text-xs text-[var(--text-primary)]/80">
                                <Eye size={12} />
                                <span>{views}</span>
                            </div>
                        )}
                    </div>

                    {/* Info Overlay (Visible on Hover) */}
                    <motion.div
                        className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"
                    >
                        <h3 className="text-[var(--text-primary)] font-bold text-lg truncate drop-shadow-md">{item.title}</h3>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            {item.tags?.slice(0, 3).map(tag => (
                                <span key={tag} className="text-[10px] uppercase tracking-wider bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] px-2 py-0.5 rounded-full border border-[var(--accent-primary)]/30">
                                    #{tag}
                                </span>
                            ))}
                        </div>

                        {/* Action Bar */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--text-primary)]/10">
                            <div className="flex gap-3">
                                {showWishlistButton ? (
                                    <WishlistButton item={item} size="sm" />
                                ) : (
                                    <>
                                        <button className="text-[var(--text-dim)] hover:text-red-500 transition-colors" aria-label="Like">
                                            <Heart size={16} />
                                        </button>
                                    </>
                                )}
                                <button className="text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors" aria-label="Share">
                                    <Share2 size={16} />
                                </button>
                            </div>
                            <button className="text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors" aria-label="Expand">
                                <Maximize2 size={16} />
                            </button>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </>
    );
};

export default MediaCard;
