// Constants for Sand Gallery
// Extracted from hardcoded values across components

/**
 * SCROLL_THRESHOLD - Pixel distance before navbar becomes "scrolled" state
 * At 20px scroll, navbar transforms from transparent to backdrop-blur
 * @type {number}
 */
export const SCROLL_THRESHOLD = 20;

// Gallery Categories - centralized from hardcoded values
export const CATEGORIES = ['All', 'Video', 'Image', 'Audio', '3D', 'Cyberpunk', 'Nature', 'Abstract', 'Character'];

// Animation
export const ANIMATION_DELAYS = {
    fast: 0.1,
    medium: 0.2,
    slow: 0.3,
};

export const FADE_DURATION = 0.3;

// Grid Breakpoints (matching Tailwind defaults)
export const GRID_BREAKPOINTS = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
};

// Z-Index Scale
export const Z_INDEX = {
    base: 0,
    dropdown: 100,
    sticky: 200,
    modal: 300,
    popover: 400,
    tooltip: 500,
    nav: 1000,
    mobileMenu: 1002,
};

// Theme Colors
export const THEME_COLORS = {
    neonGreen: '#008f4e',
    neonGold: '#c79b37',
    accentPrimary: '#008f4e',
    accentSecondary: '#c79b37',
};
