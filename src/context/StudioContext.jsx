import React, { createContext, useContext, useState, useEffect } from 'react';

const StudioContext = createContext();

export const useStudio = () => useContext(StudioContext);

export const StudioProvider = ({ children }) => {
    const [currentMode, setCurrentMode] = useState('audio'); // 'audio', 'video', 'image', 'text'
    const [params, setParams] = useState({
        audio: { prompt: '', duration: 5, stability: 0.5, voiceId: 'default' },
        video: { prompt: '', seed: '', motion: 5 },
        image: { prompt: '', aspectRatio: '1:1', style: 'realistic' }
    });

    // Cost Calculator
    const getCost = () => {
        switch (currentMode) {
            case 'audio': return 2; // Fixed cost for audio
            case 'video': return 10; // Expensive
            case 'image': return 1; // Cheap
            default: return 0;
        }
    };

    const updateParams = (mode, updates) => {
        setParams(prev => ({
            ...prev,
            [mode]: { ...prev[mode], ...updates }
        }));
    };

    const value = {
        currentMode,
        setCurrentMode,
        params,
        updateParams,
        getCost
    };

    return (
        <StudioContext.Provider value={value}>
            {children}
        </StudioContext.Provider>
    );
};
