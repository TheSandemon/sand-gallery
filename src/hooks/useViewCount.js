/**
 * useViewCount - Firestore hook for tracking item view counts
 * 
 * Automatically increments view count when item is opened and syncs
 * with Firestore in real-time. Falls back gracefully when Firebase
 * is unavailable.
 */
import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

const VIEW_COUNT_CACHE_KEY = 'gallery_view_counts';

/**
 * Get cached view counts from localStorage (for demo/offline mode)
 */
const getCachedViews = () => {
    try {
        const cached = localStorage.getItem(VIEW_COUNT_CACHE_KEY);
        return cached ? JSON.parse(cached) : {};
    } catch {
        return {};
    }
};

/**
 * Cache view count in localStorage
 */
const cacheViews = (views) => {
    try {
        localStorage.setItem(VIEW_COUNT_CACHE_KEY, JSON.stringify(views));
    } catch {
        // Silently fail if localStorage unavailable
    }
};

export const useViewCount = (itemId) => {
    const [views, setViews] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isFirebaseAvailable, setIsFirebaseAvailable] = useState(false);

    // Check if Firebase is properly configured
    useEffect(() => {
        const checkFirebase = async () => {
            try {
                // Check if Firestore is initialized by trying to access it
                if (db) {
                    setIsFirebaseAvailable(true);
                }
            } catch (error) {
                console.warn('[useViewCount] Firebase not available, using localStorage fallback');
                setIsFirebaseAvailable(false);
            }
        };
        checkFirebase();
    }, []);

    // Load initial view count
    useEffect(() => {
        if (!itemId) return;

        const loadViews = async () => {
            setIsLoading(true);
            
            if (isFirebaseAvailable) {
                try {
                    const viewDocRef = doc(db, 'item_views', itemId);
                    const viewDoc = await getDoc(viewDocRef);
                    
                    if (viewDoc.exists()) {
                        const count = viewDoc.data().count || 0;
                        setViews(count);
                        // Sync to localStorage as backup
                        const cached = getCachedViews();
                        cached[itemId] = count;
                        cacheViews(cached);
                    } else {
                        // Initialize with 0 views if document doesn't exist
                        await setDoc(viewDocRef, { count: 0, itemId, lastUpdated: new Date().toISOString() });
                        setViews(0);
                    }
                } catch (error) {
                    console.warn('[useViewCount] Error loading from Firestore:', error.message);
                    // Fall back to cached/localStorage
                    const cached = getCachedViews();
                    setViews(cached[itemId] || 0);
                }
            } else {
                // Use localStorage fallback
                const cached = getCachedViews();
                setViews(cached[itemId] || 0);
            }
            
            setIsLoading(false);
        };

        loadViews();
    }, [itemId, isFirebaseAvailable]);

    // Increment view count
    const incrementViews = useCallback(async () => {
        if (!itemId) return;

        if (isFirebaseAvailable) {
            try {
                const viewDocRef = doc(db, 'item_views', itemId);
                await updateDoc(viewDocRef, {
                    count: increment(1),
                    lastUpdated: new Date().toISOString()
                });
                
                // Update local state
                setViews(prev => prev + 1);
                
                // Update localStorage cache
                const cached = getCachedViews();
                cached[itemId] = (cached[itemId] || 0) + 1;
                cacheViews(cached);
            } catch (error) {
                console.warn('[useViewCount] Error incrementing in Firestore:', error.message);
                // Fall back to localStorage
                const cached = getCachedViews();
                const newCount = (cached[itemId] || 0) + 1;
                cached[itemId] = newCount;
                cacheViews(cached);
                setViews(newCount);
            }
        } else {
            // Use localStorage fallback
            const cached = getCachedViews();
            const newCount = (cached[itemId] || 0) + 1;
            cached[itemId] = newCount;
            cacheViews(cached);
            setViews(newCount);
        }
    }, [itemId, isFirebaseAvailable]);

    return {
        views,
        isLoading,
        isFirebaseAvailable,
        incrementViews,
    };
};

export default useViewCount;
