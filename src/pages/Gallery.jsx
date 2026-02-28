import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMotionValue, useTransform, motion as motionDom } from 'framer-motion';
import usePageContent from '../hooks/usePageContent';
import DynamicRenderer from '../components/cms/DynamicRenderer';
import PageLoader from '../components/PageLoader';
import MasonryGrid from '../components/gallery/MasonryGrid';
import { MOCK_GALLERY_ITEMS, USE_MOCK_DATA } from '../data/mockGalleryItems';

const CATEGORIES = ['All', 'Games', 'Apps', 'Art'];

// Card component with 3D tilt effect
const GalleryCard = ({ item }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    
    const rotateX = useTransform(y, [-100, 100], [10, -10]);
    const rotateY = useTransform(x, [-100, 100], [-10, 10]);
    
    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set(e.clientX - centerX);
        y.set(e.clientY - centerY);
    };
    
    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motionDom.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="group relative rounded-xl overflow-hidden bg-[var(--bg-elevated)] cursor-pointer"
        >
            {/* Thumbnail */}
            {item.thumbnail ? (
                <img 
                    src={item.thumbnail} 
                    alt={item.title}
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                />
            ) : (
                <div className="aspect-[4/3] bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-secondary)]/20 flex items-center justify-center">
                    <span className="text-4xl opacity-30">🎨</span>
                </div>
            )}
            
            {/* Glass overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0">
                <span className="text-xs font-medium text-[var(--accent-primary)] uppercase tracking-wider mb-1">
                    {item.category}
                </span>
                <h3 className="text-xl font-bold text-white mb-1 font-[family-name:var(--font-display)]">
                    {item.title}
                </h3>
                {item.description && (
                    <p className="text-sm text-gray-300 line-clamp-2">
                        {item.description}
                    </p>
                )}
            </div>
            
            {/* Category badge */}
            <div className="absolute top-3 left-3">
                <span className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-xs text-white font-medium border border-white/10">
                    {item.category}
                </span>
            </div>
        </motionDom.div>
    );
};

const Gallery = () => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [galleryItems, setGalleryItems] = useState([]);
    const [isUsingMockData, setIsUsingMockData] = useState(false);
    
    const { data, loading, error } = usePageContent('gallery', { realtime: false });

    useEffect(() => {
        if (data?.meta?.title) {
            document.title = data.meta.title;
        }
    }, [data]);

    useEffect(() => {
        if (data?.galleryItems && data.galleryItems.length > 0) {
            setGalleryItems(data.galleryItems);
            setIsUsingMockData(false);
        } else if (data?.sections && data.sections.length > 0) {
            const extractedItems = data.sections
                .filter(section => section.type === 'gallery-item' || section.type === 'project')
                .map((item, index) => ({
                    id: item.id || `cms-${index}`,
                    title: item.title || item.name || 'Untitled',
                    category: item.category || 'Art',
                    description: item.description || '',
                    thumbnail: item.thumbnail || item.image || item.coverImage || '',
                    link: item.link || item.url || '#'
                }));
            
            if (extractedItems.length > 0) {
                setGalleryItems(extractedItems);
                setIsUsingMockData(false);
            } else {
                setGalleryItems(MOCK_GALLERY_ITEMS);
                setIsUsingMockData(true);
            }
        } else {
            setGalleryItems(MOCK_GALLERY_ITEMS);
            setIsUsingMockData(true);
        }
    }, [data]);

    const filteredItems = useMemo(() => {
        if (activeCategory === 'All') return galleryItems;
        return galleryItems.filter(item => item.category === activeCategory);
    }, [galleryItems, activeCategory]);

    if (loading) {
        return <PageLoader variant="grid" />;
    }

    const hasCMSContent = data?.sections && data.sections.length > 0 && !isUsingMockData;

    return (
        <div className="min-h-screen bg-[var(--bg-main)] pt-[100px] pb-20 px-4 md:px-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4 font-[family-name:var(--font-display)]">
                    Gallery
                </h1>
                <p className="text-[var(--text-dim)] text-lg">
                    Explore my creative work across games, apps, and art.
                </p>
                {isUsingMockData && USE_MOCK_DATA && (
                    <p className="text-xs text-[var(--accent-primary)] mt-2">
                        Showing demo content — connect CMS to see real projects.
                    </p>
                )}
            </div>

            {/* Category Filter - Glassmorphism Pills */}
            <div className="max-w-7xl mx-auto mb-10">
                <div className="flex flex-wrap gap-3">
                    {CATEGORIES.map(category => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px-6 py-3 rounded-full font-medium transition-all duration-300 border ${
                                activeCategory === category
                                    ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-lg shadow-[var(--accent-primary)]/30'
                                    : 'bg-[var(--bg-elevated)]/50 text-[var(--text-dim)] border-[var(--text-primary)]/10 hover:border-[var(--accent-primary)]/50 hover:text-[var(--text-primary)] backdrop-blur-sm'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Gallery */}
            <div className="max-w-7xl mx-auto">
                {hasCMSContent ? (
                    <DynamicRenderer sections={data.sections} />
                ) : (
                    <MasonryGrid 
                        items={filteredItems}
                        renderItem={(item) => <GalleryCard item={item} />}
                    />
                )}
            </div>

            {filteredItems.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-[var(--text-dim)] text-lg">
                        No projects found in this category.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Gallery;
