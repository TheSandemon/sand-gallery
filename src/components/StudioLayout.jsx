import React from 'react';
import { useStudio } from '../context/StudioContext';
import { useAuth } from '../context/AuthContext';
import { useDeviceState } from '../hooks/useDeviceState';

const StudioLayout = ({ children, topBar, bottomDeck, settingsDrawer, isDrawerOpen }) => {
    const { isMobile, isPortrait } = useDeviceState();

    return (
        <div className="relative w-screen h-screen bg-[#050505] overflow-hidden flex flex-col pt-[70px]"> {/* Offset for Global Nav */}

            {/* 1. Main Infinite Canvas (Background) */}
            <div className="flex-1 relative z-0 overflow-hidden flex flex-col items-center">
                {/* Constrain width for better reading on ultra-wide, but allow full on mobile */}
                <div className="w-full h-full max-w-[2000px] relative">
                    {children}
                </div>
            </div>

            {/* 2. Top Filter Deck (Floating) */}
            <div className={`absolute left-1/2 transform -translate-x-1/2 z-20 w-fit transition-all duration-300
                ${isMobile ? 'top-[80px] scale-90' : 'top-[90px]'}
            `}>
                {topBar}
            </div>

            {/* 3. Bottom Command Deck (Floating) */}
            <div className={`absolute left-1/2 transform -translate-x-1/2 z-30 w-full transition-all duration-300 pointer-events-none
                ${isMobile
                    ? 'bottom-4 px-2 max-w-full'
                    : 'bottom-8 px-4 max-w-4xl'
                }
            `}>
                {/* Pointer events none allows clicking through to canvas, but deck children must re-enable pointer-events */}
                {bottomDeck}
            </div>

            {/* 4. Settings Drawer (Collapsible Right Panel) */}
            <div className={`absolute top-0 right-0 h-full bg-[#0c0c0c]/95 backdrop-blur-md border-l border-white/10 z-40 transform transition-transform duration-300 ease-spring 
                ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}
                ${isMobile ? 'w-full' : 'w-[350px]'}
            `}>
                {settingsDrawer}
            </div>

            {/* 5. Overlay when drawer is open (Mobile primarily) */}
            {isDrawerOpen && (
                <div className="absolute inset-0 bg-black/50 z-10 pointer-events-none backdrop-blur-sm" />
            )}
        </div>
    );
};

export default StudioLayout;
