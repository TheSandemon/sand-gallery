import React, { createContext, useContext, useState, useEffect } from 'react';

const StudioContext = createContext();

export const useStudio = () => useContext(StudioContext);

export const StudioProvider = ({ children }) => {
    const [currentMode, setCurrentMode] = useState('image'); // Default to image
    const [params, setParams] = useState({
        image: { prompt: '', aspectRatio: '1:1', style: 'realistic' },
        video: { prompt: '', seed: '', motion: 5 },
        voice: { prompt: '', duration: 5, stability: 0.5 },
        music: { prompt: '', duration: 30, instrumental: false },
        sound_effects: { prompt: '', duration: 10 }
    });
    const [selectedModel, setSelectedModel] = useState(null);
    const [serviceStatus, setServiceStatus] = useState({ replicate: true, openrouter: true }); // Assume available until checked

    // Fetch Service Status on Mount
    useEffect(() => {
        const checkServices = async () => {
            try {
                // Determine if we can import firebase/functions dynamically
                // This prevents crashes if not fully initialized yet
                const { httpsCallable } = await import('firebase/functions');
                const { functions } = await import('../firebase');
                const getStatus = httpsCallable(functions, 'getServiceStatus');
                const result = await getStatus();
                setServiceStatus(result.data);
                console.log("Service Status:", result.data);
            } catch (e) {
                console.warn("Could not fetch service status (api keys might be missing local dev)", e);
            }
        };
        checkServices();
    }, []);

    // Helper to calculate cost based on selected model or default fallback
    const getCost = () => {
        if (selectedModel) return selectedModel.cost;

        switch (currentMode) {
            case 'video': return 10;
            case 'music': return 5;
            case 'voice': return 2;
            case 'sound_effects': return 2;
            case 'image': return 1;
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
        getCost,
        selectedModel,
        setSelectedModel,
        serviceStatus
    };

    return (
        <StudioContext.Provider value={value}>
            {children}
        </StudioContext.Provider>
    );
};
