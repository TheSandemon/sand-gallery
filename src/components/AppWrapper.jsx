import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

/**
 * AppWrapper Context - Provides app data and save functions to wrapped apps
 */
const AppWrapperContext = createContext(null);

export const useAppWrapper = () => {
    const context = useContext(AppWrapperContext);
    if (!context) {
        console.warn('useAppWrapper must be used within an AppWrapper component');
        return {
            appData: null,
            saveData: async () => false,
            isLoading: false,
            error: null,
            isAuthenticated: false
        };
    }
    return context;
};

/**
 * AppWrapper Component
 * Wraps any app/game component and provides:
 * - Firebase integration for user data persistence
 * - Score tracking
 * - Play session logging
 * - Stats overlay UI
 * 
 * @param {string} appId - Unique identifier for this app
 * @param {string} title - Display title for the app
 * @param {boolean} showOverlay - Whether to show the stats overlay (default: true)
 * @param {React.ReactNode} children - The app component to wrap
 */
const AppWrapper = ({ appId, title, showOverlay = true, children }) => {
    const { user } = useAuth();
    const [appData, setAppData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastSaved, setLastSaved] = useState(null);

    // Firestore path: users/{userId}/apps/{appId}
    const getAppDocRef = useCallback(() => {
        if (!user?.uid || !appId) return null;
        return doc(db, 'users', user.uid, 'apps', appId);
    }, [user?.uid, appId]);

    // Load existing app data on mount
    useEffect(() => {
        const loadAppData = async () => {
            const docRef = getAppDocRef();
            if (!docRef) {
                setIsLoading(false);
                return;
            }

            try {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setAppData(docSnap.data());
                } else {
                    // Initialize with default data
                    const initialData = {
                        appId,
                        title,
                        highScore: 0,
                        totalPlays: 0,
                        totalPlayTime: 0,
                        customData: {},
                        createdAt: serverTimestamp(),
                        lastPlayedAt: null
                    };
                    await setDoc(docRef, initialData);
                    setAppData(initialData);
                }
            } catch (err) {
                console.error('AppWrapper: Error loading app data:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        loadAppData();
    }, [getAppDocRef, appId, title]);

    // Save data function - exposed to child apps
    const saveData = useCallback(async (newData) => {
        const docRef = getAppDocRef();
        if (!docRef) {
            console.warn('AppWrapper: Cannot save - user not authenticated');
            return false;
        }

        try {
            const updatePayload = {
                ...newData,
                lastPlayedAt: serverTimestamp()
            };

            // If score is provided and higher than current high score, update it
            if (typeof newData.score === 'number') {
                const currentHighScore = appData?.highScore || 0;
                if (newData.score > currentHighScore) {
                    updatePayload.highScore = newData.score;
                }
            }

            // Merge custom data if provided
            if (newData.customData) {
                updatePayload.customData = {
                    ...(appData?.customData || {}),
                    ...newData.customData
                };
            }

            await updateDoc(docRef, updatePayload);

            // Update local state
            setAppData(prev => ({
                ...prev,
                ...updatePayload
            }));
            setLastSaved(new Date());

            return true;
        } catch (err) {
            console.error('AppWrapper: Error saving app data:', err);
            setError(err.message);
            return false;
        }
    }, [getAppDocRef, appData]);

    // Record a play session
    const recordPlay = useCallback(async (duration = 0) => {
        const docRef = getAppDocRef();
        if (!docRef) return false;

        try {
            await updateDoc(docRef, {
                totalPlays: (appData?.totalPlays || 0) + 1,
                totalPlayTime: (appData?.totalPlayTime || 0) + duration,
                lastPlayedAt: serverTimestamp()
            });

            setAppData(prev => ({
                ...prev,
                totalPlays: (prev?.totalPlays || 0) + 1,
                totalPlayTime: (prev?.totalPlayTime || 0) + duration
            }));

            return true;
        } catch (err) {
            console.error('AppWrapper: Error recording play:', err);
            return false;
        }
    }, [getAppDocRef, appData]);

    // Context value
    const contextValue = {
        appData,
        saveData,
        recordPlay,
        isLoading,
        error,
        isAuthenticated: !!user,
        userId: user?.uid
    };

    // Format play time
    const formatPlayTime = (seconds) => {
        if (!seconds) return '0m';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    return (
        <AppWrapperContext.Provider value={contextValue}>
            <div className="relative w-full h-full">
                {/* Stats Overlay */}
                {showOverlay && user && appData && (
                    <div className="absolute top-2 right-2 z-50 flex flex-col gap-1 pointer-events-none">
                        {/* High Score Badge */}
                        {appData.highScore > 0 && (
                            <div className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-neon-gold/30 text-xs font-medium flex items-center gap-2">
                                <span className="text-neon-gold">★</span>
                                <span className="text-white">High Score:</span>
                                <span className="text-neon-gold font-bold">{appData.highScore.toLocaleString()}</span>
                            </div>
                        )}

                        {/* Play Stats */}
                        <div className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-xs text-gray-400 flex items-center gap-3">
                            <span>🎮 {appData.totalPlays || 0} plays</span>
                            <span>⏱️ {formatPlayTime(appData.totalPlayTime)}</span>
                        </div>

                        {/* Save indicator */}
                        {lastSaved && (
                            <div className="px-2 py-1 text-[10px] text-neon-green/60">
                                ✓ Saved
                            </div>
                        )}
                    </div>
                )}

                {/* Guest mode indicator */}
                {showOverlay && !user && (
                    <div className="absolute top-2 right-2 z-50 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-xs text-gray-500">
                        Sign in to save progress
                    </div>
                )}

                {/* Loading state */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-40">
                        <div className="w-8 h-8 border-2 border-neon-green/30 border-t-neon-green rounded-full animate-spin" />
                    </div>
                )}

                {/* The wrapped app */}
                {children}
            </div>
        </AppWrapperContext.Provider>
    );
};

export default AppWrapper;
