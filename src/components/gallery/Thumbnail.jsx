import React, { useState, useRef } from 'react';
import { Gamepad2, AppWindow, Wrench, Film, Music, Image as ImageIcon, Link } from 'lucide-react';

/**
 * Robust Thumbnail component to handle various media sources and fallbacks.
 */
const Thumbnail = ({ item, className }) => {
    const [hasError, setHasError] = useState(false);
    const [youtubeFallback, setYoutubeFallback] = useState(false);
    const imgRef = useRef(null);

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

    // 3. YouTube hqdefault fallback
    if (src && youtubeFallback) {
        src = src.replace('maxresdefault.jpg', 'hqdefault.jpg');
    }

    // 4. Handle Rendering
    if (src && !hasError) {
        return (
            <img
                ref={imgRef}
                src={src}
                alt={item.title || 'Thumbnail'}
                className={className}
                loading="lazy"
                onError={() => {
                    if (!youtubeFallback && src.includes('maxresdefault.jpg')) {
                        setYoutubeFallback(true);
                    } else {
                        setHasError(true);
                    }
                }}
            />
        );
    }

    // 5. Default Placeholder — Lucide icons instead of emoji
    const getIcon = () => {
        const iconProps = { size: 32, className: 'text-gray-600' };
        switch (item.type) {
            case 'game': return <Gamepad2 {...iconProps} />;
            case 'app': return <AppWindow {...iconProps} />;
            case 'tool': return <Wrench {...iconProps} />;
            case 'video': return <Film {...iconProps} />;
            case 'audio': return <Music {...iconProps} />;
            case 'image': return <ImageIcon {...iconProps} />;
            default: return <Link {...iconProps} />;
        }
    };

    return (
        <div className="w-full h-full flex items-center justify-center bg-white/5">
            {getIcon()}
        </div>
    );
};

export default Thumbnail;
