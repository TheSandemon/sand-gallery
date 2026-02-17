import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * MasonryGrid - Responsive masonry layout with infinite scroll support
 * 
 * @param {Object} props
 * @param {Array} props.items - All items to display
 * @param {Function} props.renderItem - Function to render each item
 * @param {number} props.initialCount - Initial items to show (default: all)
 * @param {number} props.loadMoreCount - Items to load per batch (default: 6)
 * @param {Function} props.onLoadMore - Callback when more items should load
 * @param {boolean} props.hasMore - Whether more items exist to load
 */
const MasonryGrid = ({ 
    items = [], 
    renderItem,
    initialCount = null,
    loadMoreCount = 6,
    onLoadMore,
    hasMore = false
}) => {
    const [columnCount, setColumnCount] = useState(3);
    const [displayCount, setDisplayCount] = useState(items.length);
    const loaderRef = useRef(null);

    // Set initial display count
    useEffect(() => {
        if (initialCount !== null) {
            setDisplayCount(initialCount);
        } else {
            setDisplayCount(items.length);
        }
    }, [items.length, initialCount]);

    // Responsive column count
    useEffect(() => {
        const updateColumns = () => {
            const width = window.innerWidth;
            if (width < 640) setColumnCount(1);      // Mobile
            else if (width < 1024) setColumnCount(2); // Tablet
            else if (width < 1536) setColumnCount(3); // Desktop
            else setColumnCount(4);                   // Wide
        };

        updateColumns();
        window.addEventListener('resize', updateColumns);
        return () => window.removeEventListener('resize', updateColumns);
    }, []);

    // Infinite scroll observer
    const handleObserver = useCallback((entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && onLoadMore) {
            setDisplayCount(prev => prev + loadMoreCount);
            onLoadMore();
        }
    }, [hasMore, onLoadMore, loadMoreCount]);

    useEffect(() => {
        const option = {
            root: null,
            rootMargin: '100px',
            threshold: 0
        };
        const observer = new IntersectionObserver(handleObserver, option);
        if (loaderRef.current) observer.observe(loaderRef.current);
        
        return () => {
            if (loaderRef.current) observer.unobserve(loaderRef.current);
        }
    }, [handleObserver]);

    // Get visible items based on display count
    const visibleItems = items.slice(0, displayCount);

    // Distribute items into columns row-by-row (left-to-right visual flow)
    const columns = Array.from({ length: columnCount }, () => []);

    visibleItems.forEach((item, index) => {
        columns[index % columnCount].push(item);
    });

    return (
        <>
            <div className="flex gap-6 w-full">
                {columns.map((colItems, colIndex) => (
                    <div key={colIndex} className="flex flex-col gap-6 flex-1 min-w-0">
                        {colItems.map((item, itemIndex) => (
                            <div key={item.id || `${colIndex}-${itemIndex}`} className="w-full">
                                {renderItem(item)}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            
            {/* Infinite scroll loader */}
            {hasMore && (
                <div ref={loaderRef} className="flex justify-center py-8">
                    <div className="flex items-center gap-2 text-[var(--text-dim)]">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-sm">Loading more...</span>
                    </div>
                </div>
            )}
        </>
    );
};

export default MasonryGrid;
