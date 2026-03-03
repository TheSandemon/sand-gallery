import React, { useState } from 'react';

const SAMPLE_WORK = [
    {
        id: 1,
        title: 'Neon Dreams',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1515630278258-407f66498911?w=800',
        category: 'image',
        year: '2025'
    },
    {
        id: 2,
        title: 'Abstract Flow',
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-particle-background-2775-large.mp4',
        category: 'video',
        year: '2025'
    },
    {
        id: 3,
        title: 'Forest Rain',
        type: 'audio',
        url: 'https://assets.mixkit.co/sfx/preview/mixkit-forest-rain-1234.mp3',
        category: 'audio',
        year: '2024'
    },
    {
        id: 4,
        title: 'Cyberpunk City',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800',
        category: 'image',
        year: '2024'
    },
    {
        id: 5,
        title: 'Space Journey',
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4',
        category: 'video',
        year: '2024'
    },
    {
        id: 6,
        title: 'Ocean Waves',
        type: 'audio',
        url: 'https://assets.mixkit.co/sfx/preview/mixkit-sea-waves-loop-1196.mp3',
        category: 'audio',
        year: '2024'
    },
];

const CATEGORIES = ['all', 'image', 'video', 'audio', '3d'];

const Work = () => {
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedItem, setSelectedItem] = useState(null);

    const filteredWork = activeFilter === 'all'
        ? SAMPLE_WORK
        : SAMPLE_WORK.filter(item => item.category === activeFilter);

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-20 px-4 md:px-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-16">
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
                    SAND
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl">
                    A curated collection of creative projects spanning images, videos, audio, and interactive experiences.
                </p>
            </div>

            {/* Filter */}
            <div className="max-w-7xl mx-auto mb-12">
                <div className="flex flex-wrap gap-3">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveFilter(cat)}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                                activeFilter === cat
                                    ? 'bg-neon-green text-black'
                                    : 'bg-[#1a1a1a] text-gray-400 hover:text-white hover:bg-[#252525]'
                            }`}
                        >
                            {cat.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredWork.map(item => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedItem(item)}
                            className="group relative aspect-[4/3] bg-[#111] rounded-lg overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
                        >
                            {item.type === 'image' ? (
                                <img
                                    src={item.url}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : item.type === 'video' ? (
                                <video
                                    src={item.url}
                                    className="w-full h-full object-cover"
                                    muted
                                    loop
                                    onMouseEnter={e => e.target.play()}
                                    onMouseLeave={e => { e.target.pause(); e.target.currentTime = 0; }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a]">
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#252525] flex items-center justify-center">
                                            <span className="text-2xl">
                                                {item.type === 'audio' ? '🎵' : '🎮'}
                                            </span>
                                        </div>
                                        <span className="text-gray-500 text-sm">{item.type.toUpperCase()}</span>
                                    </div>
                                </div>
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute bottom-0 left-0 right-0 p-6">
                                    <p className="text-neon-green text-xs font-medium mb-1">{item.category.toUpperCase()}</p>
                                    <h3 className="text-white text-xl font-bold">{item.title}</h3>
                                    <p className="text-gray-400 text-sm">{item.year}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredWork.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg">No projects in this category yet.</p>
                    </div>
                )}
            </div>

            {/* Lightbox Modal */}
            {selectedItem && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
                    onClick={() => setSelectedItem(null)}
                >
                    <button
                        className="absolute top-6 right-6 text-gray-400 hover:text-white text-4xl"
                        onClick={() => setSelectedItem(null)}
                    >
                        &times;
                    </button>

                    <div className="max-w-4xl w-full" onClick={e => e.stopPropagation()}>
                        {selectedItem.type === 'image' ? (
                            <img
                                src={selectedItem.url}
                                alt={selectedItem.title}
                                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                            />
                        ) : selectedItem.type === 'video' ? (
                            <video
                                src={selectedItem.url}
                                controls
                                autoPlay
                                className="w-full max-h-[80vh] object-contain rounded-lg"
                            />
                        ) : (
                            <div className="bg-[#1a1a1a] rounded-lg p-12 text-center">
                                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#252525] flex items-center justify-center">
                                    <span className="text-4xl">
                                        {selectedItem.type === 'audio' ? '🎵' : '🎮'}
                                    </span>
                                </div>
                                <h3 className="text-white text-2xl font-bold mb-2">{selectedItem.title}</h3>
                                <p className="text-gray-400">{selectedItem.year}</p>
                            </div>
                        )}

                        <div className="mt-6 text-center">
                            <h3 className="text-white text-2xl font-bold">{selectedItem.title}</h3>
                            <p className="text-gray-400">{selectedItem.category} · {selectedItem.year}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Work;
