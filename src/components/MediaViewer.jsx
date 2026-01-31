import React from 'react';
import { X, Download, Play, Pause, Film, Music, Sparkles, Clock } from 'lucide-react';

const MediaViewer = ({ item, onClose }) => {
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

    return (
        <div className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-10" onClick={onClose}>
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
                        {item.url && (
                            <a
                                href={item.url}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <Download size={18} />
                            </a>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Media Content */}
                <div className="flex-1 flex items-center justify-center p-4 bg-black/50 overflow-hidden">
                    {item.type === 'image' && item.url && (
                        <img src={item.url} alt="Generated" className="max-w-full max-h-[60vh] object-contain rounded-lg" />
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
                    <p className="text-gray-300 text-sm line-clamp-2 mb-2">{item.prompt || 'No prompt recorded'}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                        {item.createdAt && (
                            <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {formatDate(item.createdAt)}
                            </span>
                        )}
                        {item.cost && <span>{item.cost}¢</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MediaViewer;
