import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Headphones, Image, Box } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import FeatureRoll from '../components/FeatureRoll';

// Category IDs for counting
const CATEGORY_IDS = {
    images: 'images',
    videos: 'videos',
    audio: 'audio',
    '3d': '3d',
};

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
                // Fetch all media from Firestore
                const mediaSnapshot = await getDocs(collection(db, 'media'));
                const allMedia = [];

                mediaSnapshot.forEach((doc) => {
                    allMedia.push({ id: doc.id, ...doc.data() });
                });

                // Get counts by type
                const counts = {
                    images: allMedia.filter(m => m.type === 'image').length,
                    videos: allMedia.filter(m => m.type === 'video').length,
                    audio: allMedia.filter(m => m.type === 'audio').length,
                    '3d': allMedia.filter(m => m.type === '3d' || m.type === 'game' || m.type === 'app' || m.type === 'tool').length,
                };
                setMediaCounts(counts);

                // Get featured items - random selection from uploaded media
                const shuffled = [...allMedia].sort(() => 0.5 - Math.random());
                const featured = shuffled.slice(0, 3).map(item => ({
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

            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center px-4">
                <div className="max-w-5xl mx-auto text-center">
                    <p className="text-neon-green text-lg font-medium tracking-widest mb-6 uppercase text-shadow-md">
                        Creative Technologist
                    </p>
                    <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight text-shadow-lg">
                        KYLE TOUCHET
                    </h1>
                    <p className="text-2xl text-gray-300 max-w-2xl mx-auto mb-4 text-shadow-md">
                        @Sandemon
                    </p>
                    <p className="text-xl text-gray-400 max-w-xl mx-auto mb-4 text-shadow-sm">
                        Creative Technologist / AI Filmmaker / Post-Labor Futurist
                    </p>
                    <p className="text-2xl text-neon-gold italic max-w-2xl mx-auto mb-2 text-shadow-md retro-glow">
                        "The biggest limitation of AI is our own imagination"
                    </p>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto text-shadow-sm">
                        — Demis Hassabis
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                        <Link
                            to="/gallery"
                            className="inline-flex items-center gap-2 bg-neon-green text-black font-bold px-8 py-4 rounded-lg hover:bg-neon-green/90 transition-colors text-shadow-sm border-2 border-black"
                        >
                            EXPLORE GALLERY
                            <ArrowRight size={20} />
                        </Link>
                        <Link
                            to="/contact"
                            className="inline-flex items-center gap-2 bg-transparent text-white font-bold px-8 py-4 rounded-lg border-2 border-white/40 hover:border-neon-green hover:text-neon-green transition-colors text-shadow-sm"
                        >
                            GET IN TOUCH
                        </Link>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center pt-2">
                        <div className="w-1 h-2 bg-gray-400 rounded-full" />
                    </div>
                </div>
            </section>

            {/* Media Types Preview */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {mediaTypes.map(item => (
                            <div key={item.label} className="rounded-lg p-6 text-center hover:bg-white/[0.03] transition-colors border border-white/10 text-shadow-sm">
                                <item.icon className="w-10 h-10 mx-auto mb-3 text-neon-green retro-glow" />
                                <p className="text-4xl font-bold text-white mb-1">{loading ? '...' : item.count}</p>
                                <p className="text-gray-400 text-lg">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Work */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-5xl font-bold text-white mb-2 text-shadow-lg">FEATURED WORK</h2>
                            <p className="text-gray-400 text-xl text-shadow-sm">A selection of recent projects</p>
                        </div>
                        <Link
                            to="/gallery"
                            className="hidden md:flex items-center gap-2 text-neon-green hover:underline text-lg text-shadow-sm"
                        >
                            View All <ArrowRight size={18} />
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {loading ? (
                            <div className="col-span-3 text-center text-gray-500 py-12 text-xl text-shadow-sm">Loading featured work...</div>
                        ) : featuredWork.length === 0 ? (
                            <div className="col-span-3 text-center text-gray-500 py-12 text-xl text-shadow-sm">
                                <p>No media uploaded yet.</p>
                                <Link to="/gallery" className="text-neon-green hover:underline mt-2 inline-block text-shadow-sm">Visit Gallery</Link>
                            </div>
                        ) : (
                            featuredWork.map(item => (
                                <Link
                                    key={item.id}
                                    to="/gallery"
                                    className="group relative aspect-[4/3] rounded-lg overflow-hidden border-2 border-white/20 hover:border-neon-green transition-colors"
                                >
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
                                            <span className="text-5xl">{item.type === 'audio' ? '🎵' : item.type === 'video' ? '🎬' : item.type === 'game' ? '🎮' : '🖼️'}</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="absolute bottom-0 left-0 right-0 p-6">
                                            <p className="text-neon-green text-sm uppercase mb-1">{item.type}</p>
                                            <h3 className="text-white text-xl font-bold text-shadow-md">{item.title}</h3>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>

                    <div className="mt-8 text-center md:hidden">
                        <Link
                            to="/gallery"
                            className="inline-flex items-center gap-2 text-neon-green hover:underline text-lg text-shadow-sm"
                        >
                            View All Work <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-5xl font-bold text-white mb-6 text-shadow-lg">READY TO COLLABORATE?</h2>
                    <p className="text-gray-300 text-xl mb-8 text-shadow-md">
                        I'm always interested in new projects and creative opportunities.
                        Let's create something extraordinary together.
                    </p>
                    <Link
                        to="/contact"
                        className="inline-flex items-center gap-2 bg-neon-green text-black font-bold px-8 py-4 rounded-lg hover:bg-neon-green/90 transition-colors text-shadow-sm border-2 border-black"
                    >
                        LET'S TALK
                        <ArrowRight size={20} />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
