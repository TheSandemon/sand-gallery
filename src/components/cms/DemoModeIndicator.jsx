/**
 * DemoModeIndicator Component
 * 
 * Visual indicator for demo/mock content.
 * Shows subtle badge in development, hidden in production.
 * 
 * Usage:
 * <DemoModeIndicator>
 *   <YourComponent />
 * </DemoModeIndicator>
 * 
 * Or wrap gallery items:
 * <DemoModeIndicator isActive={isUsingMockData}>
 *   <GalleryGrid items={items} />
 * </DemoModeIndicator>
 */

import React from 'react';

const DemoModeIndicator = ({ 
    children, 
    isActive = false, 
    position = 'bottom-right',
    showBadge = true,
}) => {
    // Hide badge in production
    const isDev = process.env.NODE_ENV === 'development';
    
    if (!isActive || !isDev) {
        return <>{children}</>;
    }

    const positionClasses = {
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
    };

    return (
        <div className="relative">
            {children}
            
            {showBadge && (
                <div 
                    className={`absolute ${positionClasses[position]} z-50`}
                    title="Displaying demo content"
                >
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30 backdrop-blur-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-primary)] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent-primary)]"></span>
                        </span>
                        Demo
                    </span>
                </div>
            )}
        </div>
    );
};

export default DemoModeIndicator;
