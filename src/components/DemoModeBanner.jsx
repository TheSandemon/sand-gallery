import React, { useState, useEffect } from 'react';

/**
 * DemoModeBanner - Shows persistent warning when viewing demo content
 * B01 Fix: Prevents users from thinking demo content is real production data
 * 
 * Detects demo mode by checking localStorage flag set by Gallery component
 */
const DemoModeBanner = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check for demo mode flag (set by Gallery when using mock data)
        const checkDemoMode = () => {
            const demoMode = localStorage.getItem('gallery_demo_mode');
            setIsVisible(demoMode === 'true');
        };

        // Check on mount and listen for storage changes
        checkDemoMode();
        window.addEventListener('storage', checkDemoMode);
        
        // Also poll for changes (for same-tab updates)
        const interval = setInterval(checkDemoMode, 2000);
        
        return () => {
            window.removeEventListener('storage', checkDemoMode);
            clearInterval(interval);
        };
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[999] px-4 py-2 
            bg-amber-500/90 backdrop-blur-sm text-black text-xs font-semibold rounded-full 
            shadow-lg flex items-center gap-2 animate-fade-in">
            <span className="w-2 h-2 bg-black rounded-full animate-pulse" />
            <span>Viewing demo content</span>
        </div>
    );
};

export default DemoModeBanner;
