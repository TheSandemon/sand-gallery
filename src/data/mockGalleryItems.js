/**
 * Mock Gallery Items
 * 
 * ⚠️ DEVELOPMENT ONLY - These items are used when Firestore CMS has no data.
 * In production (NODE_ENV === 'production'), this data is hidden.
 * 
 * To connect real data:
 * 1. Set up Firebase Firestore
 * 2. Add gallery items to the 'gallery' collection
 * 3. The CMS will automatically use real data when available
 */

import DemoModeIndicator from '../components/cms/DemoModeIndicator';

export const MOCK_GALLERY_ITEMS = [
    {
        id: 'demo-1',
        title: 'Neon Drift',
        category: 'Games',
        description: 'A cyberpunk racing game with synthwave aesthetics',
        thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=400&fit=crop',
        link: '#',
        tags: ['racing', 'cyberpunk', 'synthwave'],
    },
    {
        id: 'demo-2',
        title: 'Code Canvas',
        category: 'Apps',
        description: 'Visual programming environment for creative coding',
        thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop',
        link: '#',
        tags: ['programming', 'creative', 'visual'],
    },
    {
        id: 'demo-3',
        title: 'Digital Dreams',
        category: 'Art',
        description: 'Generative art collection exploring neural networks',
        thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=400&fit=crop',
        link: '#',
        tags: ['generative', 'ai', 'neural'],
    },
    {
        id: 'demo-4',
        title: 'Pixel Quest',
        category: 'Games',
        description: 'Retro-style platformer with modern mechanics',
        thumbnail: 'https://images.unsplash.com/photo-1556438064-2d7646166914?w=600&h=400&fit=crop',
        link: '#',
        tags: ['retro', 'platformer', 'pixel'],
    },
    {
        id: 'demo-5',
        title: 'Sound Studio',
        category: 'Apps',
        description: 'Browser-based digital audio workstation',
        thumbnail: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&h=400&fit=crop',
        link: '#',
        tags: ['audio', 'music', 'daw'],
    },
    {
        id: 'demo-6',
        title: 'Abstract Flow',
        category: 'Art',
        description: 'Interactive fluid dynamics visualization',
        thumbnail: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=600&h=400&fit=crop',
        link: '#',
        tags: ['interactive', 'fluid', 'visualization'],
    },
];

/**
 * Get gallery items with demo wrapping
 * Use this to automatically show DemoModeIndicator in development
 * 
 * @param {boolean} isUsingMockData - Whether using mock data
 * @returns {React.ReactNode} - Wrapped gallery items or raw items
 */
export const getGalleryItems = (items, isUsingMockData) => {
    if (isUsingMockData && process.env.NODE_ENV === 'development') {
        return {
            items: MOCK_GALLERY_ITEMS,
            isDemo: true,
        };
    }
    return {
        items: items || MOCK_GALLERY_ITEMS,
        isDemo: isUsingMockData,
    };
};

// Console warning only in development
if (process.env.NODE_ENV === 'development') {
    console.info('ℹ️ Sand-Gallery: Using mock gallery items. Connect Firestore CMS for production data.');
}

export default MOCK_GALLERY_ITEMS;
