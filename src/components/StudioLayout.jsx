import React from 'react';
import { useStudio } from '../context/StudioContext';
import { useAuth } from '../context/AuthContext';

const StudioLayout = ({ children, topBar, bottomDeck, settingsDrawer, isDrawerOpen }) => {
    return (
        <div className="relative w-screen h-screen bg-[#050505] overflow-hidden flex flex-col pt-[70px]"> {/* Offset for Global Nav */}

            {/* 1. Main Infinite Canvas (Background) */}
            <div className="flex-1 relative z-0 overflow-hidden">
                {children}
            </div>

            {/* 2. Top Filter Deck (Floating) */}
            <div className="absolute top-[90px] left-1/2 transform -translate-x-1/2 z-20 w-fit">
                {topBar}
            </div>

            {/* 3. Bottom Command Deck (Floating) */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 w-full max-w-4xl px-4 pointer-events-none">
                {/* Pointer events none allows clicking through to canvas, but deck children must re-enable pointer-events */}
                {bottomDeck}
            </div>

            {/* 4. Settings Drawer (Collapsible Right Panel) */}
            <div className={`absolute top-0 right-0 h-full w-[350px] bg-[#0c0c0c]/95 backdrop-blur-md border-l border-white/10 z-40 transform transition-transform duration-300 ease-spring ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {settingsDrawer}
            </div>

            {/* 5. Overlay when drawer is open (Optional, for mobile mainly) */}
            {isDrawerOpen && (
                <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none" />
            )}
        </div>
    );
};

export default StudioLayout;
