import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useViewCount from '../../hooks/useViewCount';

/**
 * Lightbox - Modal detail view for gallery items
 * Displays full image, description, tags, and external links
 * 
 * @param {Object} props
 * @param {Object} props.item - The gallery item to display
 * @param {boolean} props.isOpen - Whether the lightbox is visible
 * @param {Function} props.onClose - Callback to close the lightbox
 * @param {boolean} props.enableViewTracking - Whether to track view counts (default: false)
 */
const Lightbox = ({ item, isOpen, onClose, enableViewTracking = false }) => {
    // Handle escape key to close
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') {
            onClose();
        }
    }, [onClose]);

    // View count tracking
    const { views, isLoading: viewsLoading, incrementViews } = useViewCount(item?.id);

    // Track view when lightbox opens (only once per open)
    useEffect(() => {
        if (isOpen && item && enableViewTracking && item.id) {
            // Increment view count on first open
            const hasViewedKey = `viewed_${item.id}`;
            const hasViewed = sessionStorage.getItem(hasViewedKey);
            
            if (!hasViewed) {
                incrementViews();
                sessionStorage.setItem(hasViewedKey, 'true');
            }
        }
    }, [isOpen, item, enableViewTracking, incrementViews]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, handleKeyDown]);

    // Don't render if not open or no item
    if (!isOpen || !item) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleShare = async (platform) => {
        const url = item.link || window.location.href;
        const text = `Check out "${item.title}" - ${item.description || ''}`;
        
        switch (platform) {
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                break;
            case 'copy':
                try {
                    await navigator.clipboard.writeText(url);
                    alert('Link copied to clipboard!');
                } catch (err) {
                    console.error('Failed to copy:', err);
                }
                break;
            case 'warpcast':
                window.open(`https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds=${encodeURIComponent(url)}`, '_blank');
                break;
            default:
                break;
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                onClick={handleBackdropClick}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
                
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                    aria-label="Close lightbox"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Content */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="relative max-w-5xl w-full max-h-[90vh] overflow-hidden rounded-2xl bg-[var(--bg-elevated)] shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
                        {/* Image section */}
                        <div className="lg:w-3/5 bg-black flex items-center justify-center relative">
                            {item.thumbnail ? (
                                <img 
                                    src={item.thumbnail} 
                                    alt={item.title}
                                    className="w-full h-full max-h-[50vh] lg:max-h-[90vh] object-contain"
                                />
                            ) : (
                                <div className="aspect-[4/3] flex items-center justify-center">
                                    <span className="text-6xl opacity-30">🎨</span>
                                </div>
                            )}
                            
                            {/* Category badge on image */}
                            <div className="absolute top-4 left-4">
                                <span className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-full text-sm font-medium">
                                    {item.category}
                                </span>
                            </div>
                        </div>

                        {/* Details section */}
                        <div className="lg:w-2/5 p-8 overflow-y-auto max-h-[40vh] lg:max-h-[90vh]">
                            {/* Title */}
                            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                                {item.title}
                            </h2>

                            {/* Description */}
                            {item.description && (
                                <p className="text-[var(--text-dim)] mb-6 leading-relaxed">
                                    {item.description}
                                </p>
                            )}

                            {/* Tags */}
                            {item.tags && item.tags.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3 uppercase tracking-wider">
                                        Tags
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {item.tags.map((tag, index) => (
                                            <span 
                                                key={index}
                                                className="px-3 py-1 bg-[var(--bg-main)] text-[var(--text-dim)] rounded-full text-sm border border-[var(--text-primary)]/10"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Metadata */}
                            <div className="mb-6 space-y-2">
                                {item.date && (
                                    <div className="flex items-center text-sm text-[var(--text-dim)]">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {item.date}
                                    </div>
                                )}
                                {(enableViewTracking && item.id) && (
                                    <div className="flex items-center text-sm text-[var(--text-dim)]">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        {viewsLoading ? '...' : views.toLocaleString()} views
                                    </div>
                                )}
                            </div>

                            {/* Action buttons */}
                            <div className="space-y-3">
                                {item.link && item.link !== '#' && (
                                    <a 
                                        href={item.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full py-3 px-6 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/90 text-white text-center font-medium rounded-lg transition-colors"
                                    >
                                        View Project
                                        <svg xmlns="http://www.w3.org/2000/svg" className="inline-block ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                )}

                                {/* Share buttons */}
                                <div>
                                    <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3 uppercase tracking-wider">
                                        Share
                                    </h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleShare('twitter')}
                                            className="flex-1 py-2 px-4 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-[#1DA1F2] rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                            </svg>
                                            Twitter
                                        </button>
                                        <button
                                            onClick={() => handleShare('warpcast')}
                                            className="flex-1 py-2 px-4 bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 text-[#8B5CF6] rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                                            </svg>
                                            Warpcast
                                        </button>
                                        <button
                                            onClick={() => handleShare('copy')}
                                            className="flex-1 py-2 px-4 bg-[var(--bg-main)] hover:bg-[var(--text-primary)]/10 text-[var(--text-dim)] rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                            </svg>
                                            Copy
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default Lightbox;
