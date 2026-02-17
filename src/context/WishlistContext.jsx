import React, { createContext, useContext } from 'react';
import useWishlist from '../hooks/useWishlist';

const WishlistContext = createContext(null);

/**
 * WishlistProvider - Wraps the app with wishlist state
 * Use this at app level to make wishlist available everywhere
 */
export const WishlistProvider = ({ children }) => {
    const wishlistState = useWishlist('sand-gallery-wishlist');

    return (
        <WishlistContext.Provider value={wishlistState}>
            {children}
        </WishlistContext.Provider>
    );
};

/**
 * Hook to access wishlist state from anywhere in the app
 */
export const useWishlistContext = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlistContext must be used within a WishlistProvider');
    }
    return context;
};

export default WishlistContext;
