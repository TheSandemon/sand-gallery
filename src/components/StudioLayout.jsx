import React from 'react';
import { useStudio } from '../context/StudioContext';
import { useAuth } from '../context/AuthContext';
import { useDeviceState } from '../hooks/useDeviceState';

const StudioLayout = ({ children, topBar, bottomDeck, settingsDrawer, isDrawerOpen, onCloseDrawer }) => {
    const { isMobile, isPortrait } = useDeviceState();

    return (
        <div className="relative w-full h-[100dvh] bg-[#050505] overflow-hidden">

            {/* 1. Main Infinite Canvas (Background) */}
            <div className="absolute inset-0 z-0 flex justify-center overflow-hidden pt-[70px]">
                <div className="w-full h-full max-w-[2000px] relative">
                    {children}
                </div>
            </div>

            {/* 2. UI Overlay (Foreground) - Flex Column for Perfect Centering */}
            <div className="absolute inset-0 z-20 flex flex-col justify-between pointer-events-none pt-[90px] pb-8">

                {/* Top: Filter Deck */}
                <div className={`w-full flex justify-center transition-all duration-300 pointer-events-auto
                    ${isMobile ? 'scale-90 origin-top' : ''}
                `}>
                    <div className="w-fit">
                        {topBar}
                    </div>
                </div>

                {/* Bottom: Command Deck */}
                <div className={`w-full flex justify-center transition-all duration-300 pointer-events-auto
                    ${isMobile ? 'px-2 pb-2' : 'px-4'}
                `}>
                    <div className={`w-full ${isMobile ? '' : 'max-w-4xl'}`}>
                        {bottomDeck}
                    </div>
                </div>
            </div>

            {/* 3. Settings Drawer (Collapsible Right Panel) */}
            <div className={`absolute top-0 right-0 h-full bg-[#0c0c0c]/95 backdrop-blur-md border-l border-white/10 z-40 transform transition-transform duration-300 ease-spring 
                ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}
                ${isMobile ? 'w-full' : 'w-[350px]'}
            `}>
                {settingsDrawer}
            </div>

            {/* 4. Drawer Overlay - CLICKS TO CLOSE */}
            {isDrawerOpen && (
                <div
                    className="absolute inset-0 bg-black/50 z-30 backdrop-blur-sm cursor-pointer"
                    onClick={onCloseDrawer}
                />
            )}
        </div>
    );
};

export default StudioLayout;
