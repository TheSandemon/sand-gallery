/**
 * MediaViewer - Enhanced lightbox viewer with social sharing
 * Supports images, videos, audio with metadata display and sharing
 */
import React, { useState, useEffect } from 'react';
import { X, Download, Play, Pause, Film, Music, Sparkles, Clock, Eye, Link2, Twitter, Send, Check } from 'lucide-react';
import useViewCount from '../hooks/useViewCount';

const MediaViewer = ({ item, onClose }) => {
    const [copied, setCopied] = useState(false);
    const { views, isLoading: viewsLoading, incrementViews } = useViewCount(item?.id);

    // Increment view count on mount
    useEffect(() => {
        if (item?.id) {
            incrementViews();
        }
    }, [item?.id]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

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
        <div 
            className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-10" 
            onClick={onClose}
        >
            <div
                className="relative max-w-4xl max-h-[90vh] w-full bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        {getTypeIcon()}
                        <span className="text-sm font-bold uppercase text-white tracking-wider">{item.type} Preview</span>
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
                <div className="flex-1 flex items-center justify-center p-4 bg-black/50 overflow-hidden">
                    {item.type === 'image' && item.url && (
                        <img 
                            src={item.url} 
                            alt={item.title} 
                            className="max-w-full max-h-[60vh] object-contain rounded-lg cursor-zoom-in"
                            onClick={(e) => {
                                if (e.target.requestFullscreen) {
                                    e.target.requestFullscreen();
                                }
                            }}
                        />
                    )}
                    {item.type === 'video' && item.url && (
                        <video
                            src={item.url}
                            controls
                            autoPlay
                            className="max-w-full max-h-[60vh] rounded-lg"
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
                    {!item.url && (
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
            </div>
        </div>
    );
};

export default MediaViewer;
