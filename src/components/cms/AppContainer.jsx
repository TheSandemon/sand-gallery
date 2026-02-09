import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Loader2, AlertTriangle } from 'lucide-react';

// Map of internal component keys to actual components
import MushroomRunnerGame from '../game/MushroomRunnerGame';

const INTERNAL_COMPONENTS = {
    'MushroomRunnerGame': MushroomRunnerGame,
};

const AppContainer = ({ appId, isEditor = false, width, height }) => {
    const [appData, setAppData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchApp = async () => {
            if (!appId) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                // Try to get from Firestore first
                const docRef = doc(db, 'app_packages', appId);
                const snapshot = await getDoc(docRef);

                if (snapshot.exists()) {
                    setAppData(snapshot.data());
                } else {
                    // Fallback for hardcoded/dev apps if not in DB yet
                    if (appId === 'mushroom-runner') {
                        setAppData({
                            name: 'Mushroom Runner',
                            componentKey: 'MushroomRunnerGame',
                            version: '1.0.0'
                        });
                    } else {
                        setError(`App "${appId}" not found.`);
                    }
                }
            } catch (err) {
                console.error('Error loading app:', err);
                setError('Failed to load app data.');
            } finally {
                setLoading(false);
            }
        };

        fetchApp();
    }, [appId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full bg-black/50 text-neon-green">
                <Loader2 className="animate-spin mb-2" size={24} />
                <span className="text-xs">Loading App...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full bg-red-900/20 text-red-400 p-4 text-center">
                <AlertTriangle className="mb-2" size={24} />
                <span className="text-sm font-bold">Error</span>
                <span className="text-xs">{error}</span>
            </div>
        );
    }

    if (!appData) {
        return (
            <div className="flex items-center justify-center w-full h-full bg-gray-900 text-gray-500">
                No App Selected
            </div>
        );
    }

    const Component = INTERNAL_COMPONENTS[appData.componentKey];

    if (!Component) {
        return (
            <div className="flex items-center justify-center w-full h-full bg-red-900/20 text-red-400 text-xs">
                Unknown component: {appData.componentKey}
            </div>
        );
    }

    return (
        <div className="w-full h-full relative overflow-hidden bg-black flex flex-col">
            <div className="flex-1 relative w-full h-full">
                <Component
                    width={width}
                    height={height}
                    isEditor={isEditor}
                />
            </div>

            {/* Overlay for Editor to prevent interaction interfering with drag */}
            {isEditor && (
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] text-neon-green border border-neon-green/30 pointer-events-none z-10">
                    APP: {appData.name} v{appData.version}
                </div>
            )}
        </div>
    );
};

export default AppContainer;
