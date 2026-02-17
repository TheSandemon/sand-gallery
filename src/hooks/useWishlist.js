import { useState, useEffect, useCallback } from 'react';

/**
 * Wishlist Hook - Manages user's favorite items
 * Uses localStorage for persistence, Firebase-ready for production
 * 
 * @param {string} storageKey - Key for localStorage (default: 'sand-gallery-wishlist')
 * @returns {Object} wishlist state and methods
 */
const useWishlist = (storageKey = 'sand-gallery-wishlist') => {
    const [wishlist, setWishlist] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load wishlist from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                setWishlist(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Failed to load wishlist:', error);
        } finally {
            setIsLoading(false);
        }
    }, [storageKey]);

    // Save to localStorage whenever wishlist changes
    useEffect(() => {
        if (!isLoading) {
            try {
                localStorage.setItem(storageKey, JSON.stringify(wishlist));
            } catch (error) {
                console.error('Failed to save wishlist:', error);
            }
        }
    }, [wishlist, storageKey, isLoading]);

    // Add item to wishlist
    const addToWishlist = useCallback((item) => {
        setWishlist(prev => {
            if (prev.some(i => i.id === item.id)) {
                return prev; // Already in wishlist
            }
            return [...prev, {
                id: item.id,
                title: item.title,
                thumbnail: item.thumbnail,
                category: item.category,
                addedAt: new Date().toISOString()
            }];
        });
    }, []);

    // Remove item from wishlist
    const removeFromWishlist = useCallback((itemId) => {
        setWishlist(prev => prev.filter(item => item.id !== itemId));
    }, []);

    // Toggle wishlist status
    const toggleWishlist = useCallback((item) => {
        if (isInWishlist(item.id)) {
            removeFromWishlist(item.id);
        } else {
            addToWishlist(item);
        }
    }, [addToWishlist, removeFromWishlist]);

    // Check if item is in wishlist
    const isInWishlist = useCallback((itemId) => {
        return wishlist.some(item => item.id === itemId);
    }, [wishlist]);

    // Clear all items
    const clearWishlist = useCallback(() => {
        setWishlist([]);
    }, []);

    return {
        wishlist,
        isLoading,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        count: wishlist.length
    };
};

export default useWishlist;
