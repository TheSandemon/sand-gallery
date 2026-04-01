import React from 'react';
import { Image as ImageIcon, Play, Music, Box } from 'lucide-react';

/**
 * Robust Thumbnail component to handle various media sources and fallbacks.
 */
const Thumbnail = ({ item, className }) => {
    // 1. Determine Source
    let src = item.thumbnail || item.url;

    // 2. GitHub OG Fallback
    if (!src && ['game', 'app', 'tool'].includes(item.type) && item.githubRepo) {
        const repoMatch = item.githubRepo.match(/github\.com[/:]([^\/]+)\/([^\/]+)/);
        if (repoMatch) {
            const [, owner, repo] = repoMatch;
            src = `https://opengraph.githubassets.com/default/${owner}/${repo.replace(/\.git$/, '')}`;
        }
    }

    // 3. Handle Rendering
    if (src) {
        return (
            <img
                src={src}
                alt={item.title || 'Thumbnail'}
                className={className}
                loading="lazy"
                onError={(e) => {
                    // Try YouTube fallback: maxres -> hq
                    if (e.target.src.includes('maxresdefault.jpg')) {
                        e.target.src = e.target.src.replace('maxresdefault.jpg', 'hqdefault.jpg');
                    } else {
                        // If all else fails, hide and show parent placeholder
                        e.target.style.display = 'none';
                        e.target.parentElement.classList.add('has-fallback');
                    }
                }}
            />
        );
    }

    // 4. Default Placeholder
    const getEmoji = () => {
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
        <div className="w-full h-full flex items-center justify-center bg-white/5 text-4xl">
            {getEmoji()}
        </div>
    );
};

export default Thumbnail;
