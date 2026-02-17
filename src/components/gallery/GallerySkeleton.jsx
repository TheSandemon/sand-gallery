import React from 'react';

/**
 * GallerySkeleton - Loading placeholder for Gallery grid
 * Priority 3 Fix: Adds skeleton loading to reduce perceived slowness
 */
const GallerySkeleton = ({ columnCount = 3 }) => {
    return (
        <div className="flex gap-6 w-full">
            {Array.from({ length: columnCount }, (_, colIndex) => (
                <div key={colIndex} className="flex flex-col gap-6 flex-1 min-w-0">
                    {Array.from({ length: 4 }, (_, itemIndex) => (
                        <div 
                            key={itemIndex} 
                            className="w-full rounded-xl overflow-hidden"
                        >
                            {/* Thumbnail skeleton */}
                            <div className="skeleton aspect-[4/3] w-full" />
                            
                            {/* Content skeleton */}
                            <div className="p-4 space-y-2">
                                <div className="skeleton h-3 w-16 rounded" />
                                <div className="skeleton h-5 w-3/4 rounded" />
                                <div className="skeleton h-4 w-full rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default GallerySkeleton;
