/**
 * Page Registry - List of all editable pages in the CMS
 * Each entry defines:
 *   - id: Firestore document ID
 *   - label: Human-readable name for the UI
 *   - route: Frontend route for preview
 *   - icon: Optional emoji/icon
 */

export const pageRegistry = [
    {
        id: 'home',
        label: 'Home',
        route: '/',
        icon: '🏠',
    },
    {
        id: 'pricing',
        label: 'Pricing',
        route: '/pricing',
        icon: '💰',
    },
    {
        id: 'studio',
        label: 'Studio',
        route: '/studio',
        icon: '🎨',
    },
];

/**
 * Get page info by ID
 */
export const getPageById = (pageId) => {
    return pageRegistry.find(p => p.id === pageId) || null;
};

export default pageRegistry;
