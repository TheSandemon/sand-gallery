import React from 'react';
import { motion } from 'framer-motion';
import { useWishlistContext } from '../../context/WishlistContext';

/**
 * WishlistButton - Heart button to add/remove items from wishlist
 * Displays filled heart when in wishlist, outline when not
 * 
 * @param {Object} props
 * @param {Object} props.item - The gallery item to toggle
 * @param {string} props.size - Size: 'sm' | 'md' | 'lg' (default: 'md')
 * @param {boolean} props.showLabel - Whether to show text label (default: false)
 * @param {string} props.className - Additional CSS classes
 */
const WishlistButton = ({ item, size = 'md', showLabel = false, className = '' }) => {
    const { isInWishlist, toggleWishlist } = useWishlistContext();
    
    const inWishlist = isInWishlist(item.id);

    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12'
    };

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    const handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(item);
    };

    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClick}
            className={`
                flex items-center justify-center rounded-full transition-all duration-200
                ${sizeClasses[size]}
                ${inWishlist 
                    ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' 
                    : 'bg-black/40 text-white/70 hover:bg-black/60 hover:text-white'
                }
                ${className}
            `}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
            {/* Heart Icon */}
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill={inWishlist ? 'currentColor' : 'none'}
                stroke="currentColor" 
                strokeWidth="2"
                className={iconSizes[size]}
            >
                <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" 
                />
            </svg>

            {/* Optional Label */}
            {showLabel && (
                <span className="ml-2 text-sm font-medium">
                    {inWishlist ? 'Saved' : 'Save'}
                </span>
            )}
        </motion.button>
    );
};

export default WishlistButton;
