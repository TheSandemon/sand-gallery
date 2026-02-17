/**
 * MediaViewer - Wrapper component that uses the enhanced Lightbox
 * Supports images, videos, audio with metadata display and sharing
 */
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Play, Pause, Film, Music, Sparkles, Clock, Eye, Link2, Twitter, Send, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import useViewCount from '../hooks/useViewCount';
import useMediaLibrary from '../hooks/useMediaLibrary';
import Lightbox from './gallery/Lightbox';

const MediaViewer = ({ item, onClose, items = [] }) => {
    const [copied, setCopied] = useState(false);
    const { views, isLoading: viewsLoading, incrementViews } = useViewCount(item?.id);

    // Get all items for navigation if not provided
    const { mediaItems } = useMediaLibrary();
    const allItems = items.length > 0 ? items : mediaItems;

    // Find current index for navigation
    const currentIndex = useMemo(() => {
        return allItems.findIndex(i => i.id === item?.id);
    }, [allItems, item?.id]);

    const handleNavigate = (direction) => {
        if (currentIndex === -1) return;
        
        if (direction === 'next') {
            const nextIndex = (currentIndex + 1) % allItems.length;
            // Dispatch custom event to update item
            window.dispatchEvent(new CustomEvent('galleryNavigate', { detail: allItems[nextIndex] }));
        } else {
            const prevIndex = (currentIndex - 1 + allItems.length) % allItems.length;
            window.dispatchEvent(new CustomEvent('galleryNavigate', { detail: allItems[prevIndex] }));
        }
    };

    // Handle keyboard navigation
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') handleNavigate('next');
            if (e.key === 'ArrowLeft') handleNavigate('prev');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, currentIndex, allItems]);

    // Increment view count on mount
    React.useEffect(() => {
        if (item?.id) {
            incrementViews();
        }
    }, [item?.id]);

    if (!item) return null;

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getTypeIcon = () => {
        switch (item.type) {
            case 'video': return <Film size={16} className="text-red-400" />;
            case 'audio': return <Music size={16} className="text-blue-400" />;
            case 'image': return <Sparkles size={16} className="text-amber-400" />;
            default: return <Sparkles size={16} className="text-gray-400" />;
        }
    };

    // Share handlers
    const getShareUrl = () => {
        return `${window.location.origin}?item=${item.id}`;
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(getShareUrl());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.warn('Failed to copy link');
        }
    };

    const handleTwitterShare = () => {
        const text = encodeURIComponent(`Check out "${item.title}" on Sand Gallery`);
        const url = encodeURIComponent(getShareUrl());
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    };

    const handleTelegramShare = () => {
        const text = encodeURIComponent(`Check out "${item.title}" on Sand Gallery: ${getShareUrl()}`);
        window.open(`https://t.me/share/url?url=${getShareUrl()}&text=${item.title}`, '_blank');
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[2000] bg-black/95 flex items-center justify-center p-4 md:p-10"
                onClick={onClose}
            >
                <div
                    className="relative max-w-5xl max-h-[90vh] w-full bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden flex flex-col"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            {getTypeIcon()}
                            <span className="text-sm font-bold uppercase text-white tracking-wider">{item.type} Preview</span>
                            {currentIndex >= 0 && (
                                <span className="text-xs text-gray-500">
                                    {currentIndex + 1} / {allItems.length}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Social Share Buttons */}
                            <button
                                onClick={handleTwitterShare}
                                className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-[#1DA1F2] hover:bg-white/10 transition-colors"
                                title="Share on Twitter/X"
                            >
                                <Twitter size={18} />
                            </button>
                            <button
                                onClick={handleTelegramShare}
                                className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-[#0088cc] hover:bg-white/10 transition-colors"
                                title="Share on Telegram"
                            >
                                <Send size={18} />
                            </button>
                            <button
                                onClick={handleCopyLink}
                                className={`p-2 rounded-lg bg-white/5 transition-colors ${
                                    copied ? 'text-green-400 hover:text-green-300' : 'text-gray-400 hover:text-white hover:bg-white/10'
                                }`}
                                title={copied ? 'Copied!' : 'Copy Link'}
                            >
                                {copied ? <Check size={18} /> : <Link2 size={18} />}
                            </button>
                            {item.url && (
                                <a
                                    href={item.url}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                    title="Download"
                                >
                                    <Download size={18} />
                                </a>
                            )}
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                title="Close (Esc)"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Media Content */}
                    <div className="flex-1 flex items-center justify-center p-4 bg-black/50 overflow-hidden min-h-[400px]">
                        {item.type === 'image' && item.thumbnail && (
                            <motion.img 
                                src={item.thumbnail} 
                                alt={item.title} 
                                className="max-w-full max-h-[65vh] object-contain rounded-lg cursor-zoom-in"
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.2 }}
                                whileHover={{ scale: 1.02 }}
                            />
                        )}
                        {item.type === 'video' && item.url && (
                            <video
                                src={item.url}
                                controls
                                autoPlay
                                className="max-w-full max-h-[65vh] rounded-lg"
                            />
                        )}
                        {item.type === 'audio' && item.url && (
                            <div className="w-full flex flex-col items-center gap-6">
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                                    <Music size={48} className="text-blue-400" />
                                </div>
                                <audio src={item.url} controls autoPlay className="w-full max-w-md" />
                            </div>
                        )}
                        {!item.thumbnail && !item.url && (
                            <div className="text-gray-500 text-center">
                                <p>Media unavailable</p>
                            </div>
                        )}
                    </div>

                    {/* Footer / Metadata */}
                    <div className="p-4 border-t border-white/10 bg-[#0a0a0a]">
                        {/* Title */}
                        <h2 className="text-white font-bold text-lg mb-2">{item.title}</h2>
                        
                        {/* Description/Prompt */}
                        <p className="text-gray-300 text-sm line-clamp-2 mb-3">{item.prompt || item.description || 'No description'}</p>
                        
                        {/* Tags */}
                        {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {item.tags.map(tag => (
                                    <span 
                                        key={tag} 
                                        className="text-[10px] uppercase tracking-wider bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] px-2 py-0.5 rounded-full border border-[var(--accent-primary)]/30"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                        
                        {/* Metadata Row */}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                            {item.createdAt && (
                                <span className="flex items-center gap-1">
                                    <Clock size={12} />
                                    {formatDate(item.createdAt)}
                                </span>
                            )}
                            {item.cost && <span>{item.cost}¢</span>}
                            {!viewsLoading && (
                                <span className="flex items-center gap-1">
                                    <Eye size={12} />
                                    {views} views
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Navigation Arrows */}
                    {allItems.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleNavigate('prev'); }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleNavigate('next'); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default MediaViewer;
