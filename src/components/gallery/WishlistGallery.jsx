import React from 'react';
import { motion } from 'framer-motion';
import { useWishlistContext } from '../../context/WishlistContext';
import MediaCard from './MediaCard';
import EmptyState from '../EmptyState';

/**
 * WishlistGallery - Displays all saved/favorited items
 * Uses the same grid layout as the main gallery
 */
const WishlistGallery = ({ onItemClick }) => {
    const { wishlist, isLoading, removeFromWishlist, clearWishlist } = useWishlistContext();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent-primary)]"></div>
            </div>
        );
    }

    if (wishlist.length === 0) {
        return (
            <EmptyState
                icon="❤️"
                title="No Saved Items"
                description="Items you save will appear here. Click the heart icon on any item to save it to your collection."
                actionLabel={null}
                onAction={null}
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
                        My Collection
                    </h2>
                    <p className="text-[var(--text-dim)] mt-1">
                        {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
                    </p>
                </div>
                
                {wishlist.length > 0 && (
                    <button
                        onClick={clearWishlist}
                        className="text-sm text-[var(--text-dim)] hover:text-red-500 transition-colors"
                    >
                        Clear all
                    </button>
                )}
            </div>

            {/* Grid */}
            <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {wishlist.map((item, index) => (
                    <MediaCard
                        key={item.id}
                        item={item}
                        index={index}
                        onClick={() => onItemClick && onItemClick(item)}
                        showWishlistButton={true}
                    />
                ))}
            </motion.div>
        </div>
    );
};

export default WishlistGallery;
