import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Headphones, Image, Box, Gamepad2, AppWindow, Wrench, Folder } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import FeatureRoll from '../components/FeatureRoll';

// Helper to get thumbnail for embed videos
const getThumbnail = (item) => {
    // If it has a thumbnail, use it
    if (item.thumbnail) return item.thumbnail;

    // For embed or video types with YouTube URLs, extract video ID and generate thumbnail
    if ((item.type === 'embed' || item.type === 'video') && item.url) {
        // Try various YouTube URL patterns
        const youtubePatterns = [
            /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
            /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
            /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
            /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
        ];
        for (const pattern of youtubePatterns) {
            const match = item.url.match(pattern);
            if (match) {
                return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
            }
        }
    }

    // For games/apps/tools with GitHub repo, use GitHub's Open Graph image
    if ((item.type === 'game' || item.type === 'app' || item.type === 'tool') && item.githubRepo) {
        const repoMatch = item.githubRepo.match(/github\.com[/:]([^\/]+)\/([^\/]+)/);
        if (repoMatch) {
            const [, owner, repo] = repoMatch;
            const cleanRepo = repo.replace(/\.git$/, '');
            // Use GitHub's Open Graph image endpoint
            return `https://opengraph.githubassets.com/default/${owner}/${cleanRepo}`;
        }
    }

    return null;
};

// All gallery categories
const ALL_CATEGORIES = [
    { id: 'images', label: 'IMAGES', icon: Image },
    { id: 'videos', label: 'VIDEOS', icon: Play },
    { id: 'audio', label: 'AUDIO', icon: Headphones },
    { id: '3d', label: '3D', icon: Box },
    { id: 'games', label: 'GAMES', icon: Gamepad2 },
    { id: 'apps', label: 'APPS', icon: AppWindow },
    { id: 'tools', label: 'TOOLS', icon: Wrench },
    { id: 'other', label: 'OTHER', icon: Folder },
];

const Home = () => {
    const [featuredWork, setFeaturedWork] = useState([]);
    const [mediaCounts, setMediaCounts] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const mediaSnapshot = await getDocs(collection(db, 'media'));
                const allMedia = [];

                mediaSnapshot.forEach((doc) => {
                    allMedia.push({ id: doc.id, ...doc.data() });
                });

                // Count by each category
                const counts = {};
                ALL_CATEGORIES.forEach(cat => {
                    if (cat.id === 'other') {
                        // Other = types not in the main list
                        const mainTypes = ['image', 'video', 'audio', '3d', 'game', 'app', 'tool'];
                        counts[cat.id] = allMedia.filter(m => !mainTypes.includes(m.type)).length;
                    } else {
                        counts[cat.id] = allMedia.filter(m => {
                            if (cat.id === 'videos') return m.type === 'video';
                            if (cat.id === 'games') return m.type === 'game';
                            if (cat.id === 'apps') return m.type === 'app';
                            if (cat.id === 'tools') return m.type === 'tool';
                            return m.type === cat.id;
                        }).length;
                    }
                });
                setMediaCounts(counts);

                const shuffled = [...allMedia].sort(() => 0.5 - Math.random());
                const featured = shuffled.slice(0, 5).map(item => ({
                    id: item.id,
                    title: item.name,
                    type: item.type || 'image',
                    url: item.url || item.thumbnail,
                    thumbnail: item.thumbnail,
                }));
                setFeaturedWork(featured);
            } catch (error) {
                console.error('Error fetching home data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="min-h-screen font-pixel">
            {/* Feature Roll Background */}
            <FeatureRoll />

            {/* Hero Section - Upper screen, video visible below */}
            <section className="relative min-h-[60vh] flex flex-col items-center justify-start pt-16 px-4">
                {/* Logo */}
                <img
                    src="/Sandemon Logo.png"
                    alt="Sandemon"
                    className="w-48 md:w-64 lg:w-80 h-auto animate-float"
                />

                {/* Name below logo - with floating animation */}
                <h1 className="text-5xl md:text-7xl font-bold text-white text-shadow-lg tracking-wider mt-4 animate-float">
                    KYLE TOUCHET
                </h1>

                {/* Minimal tagline */}
                <p className="text-2xl text-gray-300 mt-4 text-shadow-lg">
                    @Sandemon
                </p>

                {/* Quote - on one line with subtle glow and dark text */}
                <p className="text-xl text-[#b87820] italic mt-4 text-shadow-md max-w-xl text-center" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.9), 0 0 8px rgba(240,176,48,0.3)' }}>
                    "The biggest limitation of AI is our own imagination" — Demis Hassabis
                </p>

                {/* CTA Buttons - improved styling with shadows */}
                <div className="flex gap-6 mt-8">
                    <Link
                        to="/gallery"
                        className="inline-flex items-center gap-2 bg-neon-green text-black font-bold px-8 py-3 rounded hover:bg-neon-green/80 transition-all"
                        style={{ boxShadow: '3px 3px 0px rgba(0,0,0,0.5)' }}
                    >
                        EXPLORE
                        <ArrowRight size={18} />
                    </Link>
                    <Link
                        to="/contact"
                        className="inline-flex items-center gap-2 bg-transparent text-neon-green font-bold px-8 py-3 rounded border-2 border-neon-green hover:bg-neon-green/20 transition-all"
                        style={{ boxShadow: '3px 3px 0px rgba(0,0,0,0.5)' }}
                    >
                        CONTACT
                    </Link>
                </div>
            </section>

            {/* Floating Stats Bar - all gallery categories */}
            <section className="relative py-4 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-center items-center gap-4 md:gap-8 overflow-x-auto hide-scrollbar py-2">
                        {ALL_CATEGORIES.map((cat) => {
                            const Icon = cat.icon;
                            return (
                                <div key={cat.id} className="flex flex-col items-center group cursor-pointer flex-shrink-0">
                                    <Icon className="w-5 h-5 text-neon-green mb-1" style={{ filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.8))' }} />
                                    <p className="text-2xl font-bold text-white text-shadow-md">{loading ? '...' : mediaCounts[cat.id] || 0}</p>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider text-shadow-sm">{cat.label}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Featured Work - Horizontal Carousel with gaps for video */}
            <section className="relative py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Section title */}
                    <h2 className="text-3xl font-bold text-white text-shadow-md mb-6 text-center md:text-left">
                        FEATURED WORK
                    </h2>

                    {/* Horizontal scroll container */}
                    <div className="flex gap-6 overflow-x-auto hide-scrollbar scroll-snap-x pb-4">
                        {loading ? (
                            <div className="flex-shrink-0 w-80 h-48 flex items-center justify-center border border-white/10 rounded">
                                <span className="text-gray-500 text-shadow-sm">Loading...</span>
                            </div>
                        ) : featuredWork.length === 0 ? (
                            <div className="flex-shrink-0 w-80 h-48 flex items-center justify-center border border-white/10 rounded">
                                <Link to="/gallery" className="text-neon-green text-shadow-sm hover:underline">
                                    Visit Gallery
                                </Link>
                            </div>
                        ) : (
                            featuredWork.map((item) => (
                                <Link
                                    key={item.id}
                                    to="/gallery"
                                    className="flex-shrink-0 w-72 md:w-80 group relative"
                                >
                                    {/* Card with video peek effect */}
                                    <div className="aspect-video rounded-lg overflow-hidden border-2 border-white/20 group-hover:border-neon-green transition-colors" style={{ boxShadow: '4px 4px 8px rgba(0,0,0,0.5)' }}>
                                        {item.type === 'image' ? (
                                            <img
                                                src={item.url}
                                                alt={item.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        ) : item.type === 'video' ? (
                                            <video
                                                src={item.url}
                                                muted
                                                loop
                                                onMouseEnter={e => e.target.play()}
                                                onMouseLeave={e => { e.target.pause(); e.target.currentTime = 0; }}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        ) : getThumbnail(item) ? (
                                            <img
                                                src={getThumbnail(item)}
                                                alt={item.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-white/[0.02]">
                                                <span className="text-4xl">
                                                    {item.type === 'audio' ? '🎵' : item.type === 'video' ? '🎬' : item.type === 'game' ? '🎮' : '🖼️'}
                                                </span>
                                            </div>
                                        )}
                                        {/* Overlay on hover */}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white text-shadow-md">VIEW</span>
                                        </div>
                                    </div>
                                    {/* Title below */}
                                    <p className="mt-2 text-white text-shadow-sm text-center truncate">{item.title}</p>
                                </Link>
                            ))
                        )}

                        {/* View All Card */}
                        <Link
                            to="/gallery"
                            className="flex-shrink-0 w-72 md:w-80 flex items-center justify-center"
                        >
                            <div className="aspect-video rounded-lg border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-2 group hover:border-neon-green transition-colors" style={{ boxShadow: '4px 4px 8px rgba(0,0,0,0.5)' }}>
                                <ArrowRight className="text-gray-400 group-hover:text-neon-green transition-colors" size={24} />
                                <span className="text-gray-400 group-hover:text-neon-green text-shadow-sm">VIEW ALL</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Floating CTA at bottom */}
            <section className="relative py-12 px-4">
                <div className="flex justify-center">
                    <Link
                        to="/contact"
                        className="inline-flex items-center gap-3 bg-neon-green text-black font-bold px-10 py-4 rounded-lg hover:bg-neon-green/80 transition-all animate-breathe"
                        style={{ boxShadow: '4px 4px 0px rgba(0,0,0,0.5)' }}
                    >
                        LET'S COLLABORATE
                        <ArrowRight size={20} />
                    </Link>
                </div>
            </section>

            {/* Scroll indicator */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                <div className="w-6 h-10 border-2 border-gray-500 rounded-full flex justify-center pt-2">
                    <div className="w-1 h-2 bg-gray-500 rounded-full" />
                </div>
            </div>
        </div>
    );
};

export default Home;
