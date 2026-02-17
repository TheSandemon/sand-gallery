import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMotionValue, useTransform, motion as motionDom } from 'framer-motion';
import usePageContent from '../hooks/usePageContent';
import DynamicRenderer from '../components/cms/DynamicRenderer';
import PageLoader from '../components/PageLoader';
import MasonryGrid from '../components/gallery/MasonryGrid';
import GallerySkeleton from '../components/gallery/GallerySkeleton';
import DemoModeIndicator from '../components/cms/DemoModeIndicator';
import Lightbox from '../components/gallery/Lightbox';
import { MOCK_GALLERY_ITEMS } from '../data/mockGalleryItems';
import { CATEGORIES } from '../config/constants';
import useViewCount from '../hooks/useViewCount';

// Card component with 3D tilt effect
// B02 Fix: Use CSS media query for hover detection instead of JS
const GalleryCard = ({ item, onClick, showViews = false }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    
    // CSS-based hover detection - no JS needed
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

    const handleClick = () => {
        if (onClick) {
            onClick(item);
        }
    };

    // Get view count from localStorage cache
    const getViewCount = () => {
        try {
            const cached = localStorage.getItem('gallery_view_counts');
            if (cached) {
                const views = JSON.parse(cached);
                return views[item.id] || 0;
            }
        } catch {}
        return 0;
    };

    const viewCount = getViewCount();

    return (
        <motionDom.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="group relative rounded-xl overflow-hidden bg-[var(--bg-elevated)] cursor-pointer"
            data-tilt-enabled="true"
        >
            {/* Touch devices: disable tilt via CSS */}
            <style>{`
                @media (hover: none) {
                    [data-tilt-enabled="true"] {
                        transform-style: flat !important;
                    }
                    [data-tilt-enabled="true"] > * {
                        transform: none !important;
                    }
                }
            `}</style>
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
                <h3 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                    {item.title}
                </h3>
                {item.description && (
                    <p className="text-sm text-gray-300 line-clamp-2">
                        {item.description}
                    </p>
                )}
                {/* Click indicator */}
                <p className="text-xs text-gray-400 mt-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Click to view details
                </p>
            </div>
            
            {/* Category badge */}
            <div className="absolute top-3 left-3">
                <span className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-xs text-white font-medium border border-white/10">
                    {item.category}
                </span>
            </div>
            
            {/* View count badge */}
            {showViews && viewCount > 0 && (
                <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 bg-black/50 backdrop-blur-md rounded-full text-xs text-white font-medium border border-white/10 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {viewCount}
                    </span>
                </div>
            )}
        </motionDom.div>
    );
};

// Bug B01 Fix: Add null check for usePageContent
const Gallery = () => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [galleryItems, setGalleryItems] = useState([]);
    const [isUsingMockData, setIsUsingMockData] = useState(false);
    const [lightboxItem, setLightboxItem] = useState(null);
    
    const { data, loading, error } = usePageContent('gallery', { realtime: false });

    // B01 Fix: Safe null check for document.title
    useEffect(() => {
        if (data?.meta?.title && typeof document !== 'undefined') {
            document.title = data.meta.title;
        }
    }, [data]);

    // Extract items from CMS or fall back to mock
    useEffect(() => {
        // Guard: No data yet
        if (!data) {
            // B01 Fix: Fail loudly in production instead of silently using mock
            if (process.env.NODE_ENV === 'production') {
                console.error('[Gallery] CRITICAL: No CMS data available in production. Showing empty state.');
                setGalleryItems([]);
                setIsUsingMockData(false);
                return;
            }
            // Dev mode: allow mock data with warning
            setGalleryItems(MOCK_GALLERY_ITEMS);
            setIsUsingMockData(true);
            return;
        }

        // Try galleryItems first
        if (data.galleryItems && data.galleryItems.length > 0) {
            setGalleryItems(data.galleryItems);
            setIsUsingMockData(false);
            return;
        }

        // Try extracting from sections
        if (data.sections && data.sections.length > 0) {
            const extractedItems = data.sections
                .filter(section => section.type === 'gallery-item' || section.type === 'project')
                .map((item, index) => ({
                    id: item.id || `cms-${index}`,
                    title: item.title || item.name || 'Untitled',
                    category: item.category || 'Art',
                    description: item.description || '',
                    thumbnail: item.thumbnail || item.image || item.coverImage || '',
                    link: item.link || item.url || '#',
                    tags: item.tags || [],
                    date: item.date || item.createdAt || null,
                }));
            
            if (extractedItems.length > 0) {
                setGalleryItems(extractedItems);
                setIsUsingMockData(false);
                return;
            }
        }

        // Fallback to mock data
        setGalleryItems(MOCK_GALLERY_ITEMS);
        setIsUsingMockData(true);
        
        // B01 Fix: Set flag so DemoModeBanner can display warning
        localStorage.setItem('gallery_demo_mode', 'true');
    }, [data]);

    // Clear demo mode flag when leaving gallery
    useEffect(() => {
        return () => {
            localStorage.removeItem('gallery_demo_mode');
        };
    }, []);

    // Filter items by category AND search query
    const filteredItems = useMemo(() => {
        let items = galleryItems;
        
        // Filter by category
        if (activeCategory !== 'All') {
            items = items.filter(item => item.category === activeCategory);
        }
        
        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            items = items.filter(item => {
                // Search in title, description, category, and tags
                const titleMatch = item.title?.toLowerCase().includes(query);
                const descMatch = item.description?.toLowerCase().includes(query);
                const categoryMatch = item.category?.toLowerCase().includes(query);
                const tagsMatch = item.tags?.some(tag => tag.toLowerCase().includes(query));
                
                return titleMatch || descMatch || categoryMatch || tagsMatch;
            });
        }
        
        return items;
    }, [galleryItems, activeCategory, searchQuery]);

    // Lightbox handlers
    const handleCardClick = (item) => {
        setLightboxItem(item);
    };

    const closeLightbox = () => {
        setLightboxItem(null);
    };

    // Get all unique tags from gallery items for suggestions
    const allTags = useMemo(() => {
        const tagSet = new Set();
        galleryItems.forEach(item => {
            if (item.tags && Array.isArray(item.tags)) {
                item.tags.forEach(tag => tagSet.add(tag));
            }
        });
        return Array.from(tagSet).sort();
    }, [galleryItems]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--bg-main)] pt-[100px] pb-20 px-4 md:px-8">
                <div className="max-w-7xl mx-auto mb-12">
                    <div className="skeleton h-12 w-48 mb-4 rounded" />
                    <div className="skeleton h-6 w-64 rounded" />
                </div>
                <div className="max-w-7xl mx-auto">
                    <GallerySkeleton />
                </div>
            </div>
        );
    }

    const hasCMSContent = data?.sections && data.sections.length > 0 && !isUsingMockData;

    return (
        <div className="min-h-screen bg-[var(--bg-main)] pt-[100px] pb-20 px-4 md:px-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                    Gallery
                </h1>
                <p className="text-[var(--text-dim)] text-lg">
                    Explore my creative work across games, apps, and art.
                </p>
                {isUsingMockData && process.env.NODE_ENV === 'development' && (
                    <p className="text-xs text-[var(--accent-primary)] mt-2">
                        Showing demo content — connect CMS to see real projects.
                    </p>
                )}
            </div>

            {/* Search Bar */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--text-dim)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search by title, description, or tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-[var(--bg-elevated)] border border-[var(--text-primary)]/10 rounded-xl text-[var(--text-primary)] placeholder-[var(--text-dim)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-[var(--text-dim)] hover:text-[var(--text-primary)]"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
                
                {/* Tag suggestions */}
                {allTags.length > 0 && !searchQuery && (
                    <div className="mt-3 flex flex-wrap gap-2 items-center">
                        <span className="text-xs text-[var(--text-dim)]">Popular tags:</span>
                        {allTags.slice(0, 8).map((tag, index) => (
                            <button
                                key={index}
                                onClick={() => setSearchQuery(tag)}
                                className="text-xs px-2 py-1 bg-[var(--bg-main)] text-[var(--text-dim)] hover:text-[var(--accent-primary)] rounded-full border border-[var(--text-primary)]/10 hover:border-[var(--accent-primary)]/30 transition-colors"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                )}
                
                {/* Search results count */}
                {searchQuery && (
                    <p className="mt-2 text-sm text-[var(--text-dim)]">
                        Found {filteredItems.length} {filteredItems.length === 1 ? 'result' : 'results'} for "{searchQuery}"
                    </p>
                )}
            </div>

            {/* Category Filter - Glassmorphism Pills */}
            <div className="max-w-7xl mx-auto mb-10" role="group" aria-label="Filter gallery by category">
                <div 
                    className="flex flex-wrap gap-3"
                    role="radiogroup" 
                    aria-label="Category filter"
                >
                    {CATEGORIES.map(category => (
                        <button
                            key={category}
                            role="radio"
                            aria-checked={activeCategory === category}
                            aria-label={`Filter by ${category}`}
                            onClick={() => setActiveCategory(category)}
                            onKeyDown={(e) => {
                                // Keyboard navigation: Left/Right arrows to move between options
                                const currentIndex = CATEGORIES.indexOf(category);
                                if (e.key === 'ArrowRight') {
                                    const nextIndex = (currentIndex + 1) % CATEGORIES.length;
                                    setActiveCategory(CATEGORIES[nextIndex]);
                                } else if (e.key === 'ArrowLeft') {
                                    const prevIndex = (currentIndex - 1 + CATEGORIES.length) % CATEGORIES.length;
                                    setActiveCategory(CATEGORIES[prevIndex]);
                                }
                            }}
                            className={`px-6 py-3 rounded-full font-medium transition-all duration-300 border focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg-main)] ${
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
                    <DemoModeIndicator isActive={isUsingMockData}>
                        <MasonryGrid 
                            items={filteredItems}
                            renderItem={(item) => (
                                <GalleryCard 
                                    item={item} 
                                    onClick={handleCardClick}
                                    showViews={true}
                                />
                            )}
                        />
                    </DemoModeIndicator>
                )}
            </div>

            {filteredItems.length === 0 && (
                <div className="text-center py-20">
                    {searchQuery ? (
                        <>
                            <p className="text-[var(--text-dim)] text-lg mb-4">
                                No projects found matching "{searchQuery}".
                            </p>
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="text-[var(--accent-primary)] hover:underline"
                            >
                                Clear search
                            </button>
                        </>
                    ) : (
                        <p className="text-[var(--text-dim)] text-lg">
                            No projects found in this category.
                        </p>
                    )}
                </div>
            )}

            {/* Lightbox Modal */}
            <Lightbox 
                item={lightboxItem}
                isOpen={!!lightboxItem}
                onClose={closeLightbox}
                enableViewTracking={true}
            />
        </div>
    );
};

export default Gallery;
