import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Headphones, Image, Box } from 'lucide-react';

const FEATURED_WORK = [
    {
        id: 1,
        title: 'Neon Dreams',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1515630278258-407f66498911?w=800',
    },
    {
        id: 2,
        title: 'Abstract Flow',
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-particle-background-2775-large.mp4',
    },
    {
        id: 3,
        title: 'Forest Rain',
        type: 'audio',
        url: 'https://assets.mixkit.co/sfx/preview/mixkit-forest-rain-1234.mp3',
    },
];

const Home = () => {
    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center px-4">
                <div className="max-w-5xl mx-auto text-center">
                    <p className="text-neon-green text-sm font-medium tracking-widest mb-6 uppercase">
                        Creative Portfolio
                    </p>
                    <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight">
                        CRAFTING
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-neon-gold">
                            DIGITAL
                        </span>
                        <br />
                        EXPERIENCES
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                        A multidisciplinary creative exploring the boundaries of visual arts,
                        audio design, and interactive media.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/work"
                            className="inline-flex items-center gap-2 bg-neon-green text-black font-bold px-8 py-4 rounded-lg hover:bg-neon-green/90 transition-colors"
                        >
                            VIEW WORK
                            <ArrowRight size={20} />
                        </Link>
                        <Link
                            to="/contact"
                            className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white font-bold px-8 py-4 rounded-lg border border-[#333] hover:border-neon-green transition-colors"
                        >
                            GET IN TOUCH
                        </Link>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center pt-2">
                        <div className="w-1 h-2 bg-gray-600 rounded-full" />
                    </div>
                </div>
            </section>

            {/* Media Types Preview */}
            <section className="py-20 px-4 bg-[#0f0f0f]">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { icon: Image, label: 'Images', count: '24+' },
                            { icon: Play, label: 'Videos', count: '12+' },
                            { icon: Headphones, label: 'Audio', count: '18+' },
                            { icon: Box, label: '3D', count: '8+' },
                        ].map(item => (
                            <div key={item.label} className="bg-[#1a1a1a] rounded-lg p-6 text-center hover:bg-[#252525] transition-colors">
                                <item.icon className="w-8 h-8 mx-auto mb-3 text-neon-green" />
                                <p className="text-3xl font-bold text-white mb-1">{item.count}</p>
                                <p className="text-gray-400 text-sm">{item.label}</p>
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
                            <h2 className="text-4xl font-bold text-white mb-2">FEATURED WORK</h2>
                            <p className="text-gray-400">A selection of recent projects</p>
                        </div>
                        <Link
                            to="/work"
                            className="hidden md:flex items-center gap-2 text-neon-green hover:underline"
                        >
                            View All <ArrowRight size={18} />
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {FEATURED_WORK.map(item => (
                            <Link
                                key={item.id}
                                to="/work"
                                className="group relative aspect-[4/3] bg-[#111] rounded-lg overflow-hidden"
                            >
                                {item.type === 'image' ? (
                                    <img
                                        src={item.url}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <video
                                        src={item.url}
                                        muted
                                        loop
                                        onMouseEnter={e => e.target.play()}
                                        onMouseLeave={e => { e.target.pause(); e.target.currentTime = 0; }}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="absolute bottom-0 left-0 right-0 p-6">
                                        <p className="text-neon-green text-xs uppercase mb-1">{item.type}</p>
                                        <h3 className="text-white text-xl font-bold">{item.title}</h3>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="mt-8 text-center md:hidden">
                        <Link
                            to="/work"
                            className="inline-flex items-center gap-2 text-neon-green hover:underline"
                        >
                            View All Work <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 bg-gradient-to-b from-[#0a0a0a] to-[#111]">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">READY TO COLLABORATE?</h2>
                    <p className="text-gray-400 text-lg mb-8">
                        I'm always interested in new projects and creative opportunities.
                        Let's create something extraordinary together.
                    </p>
                    <Link
                        to="/contact"
                        className="inline-flex items-center gap-2 bg-neon-green text-black font-bold px-8 py-4 rounded-lg hover:bg-neon-green/90 transition-colors"
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
