import { useState, useEffect } from 'react';

export const useDeviceState = () => {
    const [deviceState, setDeviceState] = useState({
        isDesktop: true,
        isMobile: false,
        isPortrait: false,
        isLandscape: false,
        orientation: 'landscape'
    });

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const isMobile = width < 768; // Standard mobile breakpoint
            const isPortrait = height > width;

            setDeviceState({
                isDesktop: !isMobile,
                isMobile,
                isPortrait,
                isLandscape: !isPortrait,
                orientation: isPortrait ? 'portrait' : 'landscape'
            });
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
        };
    }, []);

    return deviceState;
};
