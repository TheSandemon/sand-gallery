import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Music, Box, Image as ImageIcon, Heart, Share2, Maximize2 } from 'lucide-react';

const MediaCard = ({ item, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);

    // Determine icon based on type
    const TypeIcon = {
        video: Play,
        audio: Music,
        model: Box,
        image: ImageIcon
    }[item.type] || ImageIcon;

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
                    {/* Aspect Ratio Maintainer if needed, or just img */}
                    {(() => {
                        // Try to get thumbnail from various sources
                        let thumbnail = item.thumbnail || item.url;

                        // For games/apps/tools with GitHub repo but no thumbnail, try GitHub OG image
                        if (!thumbnail && (item.type === 'game' || item.type === 'app' || item.type === 'tool') && item.githubRepo) {
                            const repoMatch = item.githubRepo.match(/github\.com[/:]([^\/]+)\/([^\/]+)/);
                            if (repoMatch) {
                                const [, owner, repo] = repoMatch;
                                thumbnail = `https://opengraph.githubassets.com/default/${owner}/${repo.replace(/\.git$/, '')}`;
                            }
                        }

                        if (thumbnail) {
                            return (
                                <img
                                    src={thumbnail}
                                    alt={item.title}
                                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                    onError={(e) => {
                                        // Try fallback thumbnail for YouTube
                                        const src = e.target.src;
                                        if (src.includes('maxresdefault.jpg')) {
                                            e.target.src = src.replace('maxresdefault.jpg', 'hqdefault.jpg');
                                        } else {
                                            e.target.style.display = 'none';
                                        }
                                    }}
                                />
                            );
                        }

                        // Show type-based icon placeholder
                        const getIcon = () => {
                            switch (item.type) {
                                case 'game': return '🎮';
                                case 'app': return '📱';
                                case 'tool': return '🔧';
                                case 'video': return '🎬';
                                case 'audio': return '🎵';
                                case 'image': return '🖼️';
                                default: return '🔗';
                            }
                        };

                        return (
                            <div className="w-full h-40 flex items-center justify-center bg-white/5 text-4xl">
                                {getIcon()}
                            </div>
                        );
                    })()}

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
                            <button className="text-gray-400 hover:text-red-500 transition-colors">
                                <Heart size={16} />
                            </button>
                            <button className="text-gray-400 hover:text-white transition-colors">
                                <Share2 size={16} />
                            </button>
                        </div>
                        <button className="text-gray-400 hover:text-white transition-colors">
                            <Maximize2 size={16} />
                        </button>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default MediaCard;
