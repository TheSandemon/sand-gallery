import React, { useState } from 'react';
import Thumbnail from './Thumbnail';
import { motion } from 'framer-motion';
import { Play, Music, Box, Image as ImageIcon, Heart, Share2, Maximize2, Check } from 'lucide-react';

const MediaCard = ({ item, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [showCopied, setShowCopied] = useState(false);

    // Check if item was previously liked on mount
    useState(() => {
        try {
            const liked = JSON.parse(localStorage.getItem('liked_items') || '[]');
            setIsLiked(liked.includes(item.id));
        } catch {}
    });

    // Determine icon based on type
    const TypeIcon = {
        video: Play,
        audio: Music,
        model: Box,
        image: ImageIcon
    }[item.type] || ImageIcon;

    const handleLike = (e) => {
        e.stopPropagation();
        try {
            const liked = JSON.parse(localStorage.getItem('liked_items') || '[]');
            let newLiked;
            if (isLiked) {
                newLiked = liked.filter(id => id !== item.id);
            } else {
                newLiked = [...liked, item.id];
            }
            localStorage.setItem('liked_items', JSON.stringify(newLiked));
            setIsLiked(!isLiked);
        } catch {}
    };

    const handleShare = async (e) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(window.location.href + (window.location.pathname !== '/' ? window.location.pathname : '') + `?item=${item.id}`);
            setShowCopied(true);
            setTimeout(() => setShowCopied(false), 2000);
        } catch {
            // Fallback: do nothing silently
        }
    };

    const handleMaximize = (e) => {
        e.stopPropagation();
        onClick(item);
    };

    return (
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
            <div className="relative overflow-hidden rounded-xl bg-[#1a1a1a] border border-white/10 group-hover:border-var(--neon-green)/50 transition-colors duration-300">

                {/* Media Content */}
                <div className="relative w-full overflow-hidden">
                    <Thumbnail
                        item={item}
                        className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Overlay Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4`} />

                    {/* Type Badge */}
                    <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md border border-white/10 p-1.5 rounded-lg text-white/80">
                        <TypeIcon size={14} />
                    </div>
                </div>

                {/* Info Overlay (Visible on Hover) */}
                <motion.div
                    className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"
                >
                    <h3 className="text-white font-bold text-lg truncate drop-shadow-md">{item.title}</h3>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-2">
                        {item.tags?.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[10px] uppercase tracking-wider bg-var(--neon-green)/20 text-var(--neon-green) px-2 py-0.5 rounded-full border border-var(--neon-green)/30">
                                #{tag}
                            </span>
                        ))}
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                        <div className="flex gap-3">
                            <button
                                onClick={handleLike}
                                className={`transition-colors ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                                aria-label="Like"
                            >
                                <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
                            </button>
                            <button
                                onClick={handleShare}
                                className="relative text-gray-400 hover:text-white transition-colors"
                                aria-label="Share"
                            >
                                <Share2 size={16} />
                                {showCopied && (
                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-black/80 text-white px-2 py-1 rounded whitespace-nowrap">
                                        <Check size={10} className="inline mr-1" />Copied!
                                    </span>
                                )}
                            </button>
                        </div>
                        <button
                            onClick={handleMaximize}
                            className="text-gray-400 hover:text-white transition-colors"
                            aria-label="View full"
                        >
                            <Maximize2 size={16} />
                        </button>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default MediaCard;
