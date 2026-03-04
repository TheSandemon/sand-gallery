import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Headphones, Image, Box } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import FeatureRoll from '../components/FeatureRoll';

const Home = () => {
    const [featuredWork, setFeaturedWork] = useState([]);
    const [mediaCounts, setMediaCounts] = useState({
        images: 0,
        videos: 0,
        audio: 0,
        '3d': 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const mediaSnapshot = await getDocs(collection(db, 'media'));
                const allMedia = [];

                mediaSnapshot.forEach((doc) => {
                    allMedia.push({ id: doc.id, ...doc.data() });
                });

                const counts = {
                    images: allMedia.filter(m => m.type === 'image').length,
                    videos: allMedia.filter(m => m.type === 'video').length,
                    audio: allMedia.filter(m => m.type === 'audio').length,
                    '3d': allMedia.filter(m => m.type === '3d' || m.type === 'game' || m.type === 'app' || m.type === 'tool').length,
                };
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

    const mediaTypes = [
        { icon: Image, label: 'Images', count: mediaCounts.images, key: 'images' },
        { icon: Play, label: 'Videos', count: mediaCounts.videos, key: 'videos' },
        { icon: Headphones, label: 'Audio', count: mediaCounts.audio, key: 'audio' },
        { icon: Box, label: '3D/Games', count: mediaCounts['3d'], key: '3d' },
    ];

    return (
        <div className="min-h-screen font-pixel">
            {/* Feature Roll Background */}
            <FeatureRoll />

            {/* Hero Section - Upper screen, video visible below */}
            <section className="relative min-h-[60vh] flex flex-col items-center justify-start pt-20 px-4">
                {/* Name with dramatic shadow */}
                <h1 className="text-7xl md:text-9xl font-bold text-white text-shadow-lg animate-float tracking-wider">
                    KYLE
                </h1>
                <h1 className="text-7xl md:text-9xl font-bold text-neon-green text-shadow-lg animate-float tracking-wider" style={{ animationDelay: '0.5s' }}>
                    TOUCHET
                </h1>

                {/* Minimal tagline */}
                <p className="text-2xl text-gray-300 mt-6 text-shadow-md">
                    @Sandemon
                </p>

                {/* Quote - smaller, subtle */}
                <p className="text-xl text-neon-gold italic mt-4 text-shadow-sm retro-glow max-w-xl text-center">
                    "The biggest limitation of AI is our own imagination"
                </p>
                <p className="text-lg text-gray-500 text-shadow-sm">
                    — Demis Hassabis
                </p>

                {/* CTA Buttons */}
                <div className="flex gap-6 mt-8">
                    <Link
                        to="/gallery"
                        className="inline-flex items-center gap-2 bg-neon-green text-black font-bold px-8 py-3 rounded border-2 border-black hover:bg-neon-green/80 transition-all text-shadow-sm"
                    >
                        EXPLORE
                        <ArrowRight size={18} />
                    </Link>
                    <Link
                        to="/contact"
                        className="inline-flex items-center gap-2 bg-transparent text-white font-bold px-8 py-3 rounded border-2 border-white/30 hover:border-neon-green hover:text-neon-green transition-all text-shadow-sm"
                    >
                        CONTACT
                    </Link>
                </div>
            </section>

            {/* Floating Stats Bar - positioned to show video */}
            <section className="relative py-4 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-center items-center gap-8 md:gap-16">
                        {mediaTypes.map((item, idx) => (
                            <div key={item.label} className="flex flex-col items-center group cursor-pointer">
                                <item.icon className="w-6 h-6 text-neon-green retro-glow mb-1" />
                                <p className="text-3xl font-bold text-white text-shadow-md">{loading ? '...' : item.count}</p>
                                <p className="text-xs text-gray-400 uppercase tracking-wider">{item.label}</p>
                            </div>
                        ))}
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
                                    <div className="aspect-video rounded-lg overflow-hidden border-2 border-white/20 group-hover:border-neon-green transition-colors">
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
                                        ) : item.thumbnail ? (
                                            <img
                                                src={item.thumbnail}
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
                            <div className="aspect-video rounded-lg border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-2 group hover:border-neon-green transition-colors">
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
                        className="inline-flex items-center gap-3 bg-neon-green text-black font-bold px-10 py-4 rounded-lg border-2 border-black hover:bg-neon-green/80 transition-all text-shadow-sm animate-breathe"
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
