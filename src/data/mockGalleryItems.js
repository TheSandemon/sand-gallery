/**
 * Mock Gallery Items
 * Used when Firestore CMS has no data
 * 
 * ⚠️ USING MOCK DATA — Connect Firestore for production
 */

export const MOCK_GALLERY_ITEMS = [
    {
        id: '1',
        title: 'Neon Drift',
        category: 'Games',
        description: 'A cyberpunk racing game with synthwave aesthetics',
        thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=400&fit=crop',
        link: '#'
    },
    {
        id: '2',
        title: 'Code Canvas',
        category: 'Apps',
        description: 'Visual programming environment for creative coding',
        thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop',
        link: '#'
    },
    {
        id: '3',
        title: 'Digital Dreams',
        category: 'Art',
        description: 'Generative art collection exploring neural networks',
        thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=400&fit=crop',
        link: '#'
    },
    {
        id: '4',
        title: 'Pixel Quest',
        category: 'Games',
        description: 'Retro-style platformer with modern mechanics',
        thumbnail: 'https://images.unsplash.com/photo-1556438064-2d7646166914?w=600&h=400&fit=crop',
        link: '#'
    },
    {
        id: '5',
        title: 'Sound Studio',
        category: 'Apps',
        description: 'Browser-based digital audio workstation',
        thumbnail: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&h=400&fit=crop',
        link: '#'
    },
    {
        id: '6',
        title: 'Abstract Flow',
        category: 'Art',
        description: 'Interactive fluid dynamics visualization',
        thumbnail: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=600&h=400&fit=crop',
        link: '#'
    }
];

// Flag for development mode
export const USE_MOCK_DATA = true;

if (USE_MOCK_DATA) {
    console.warn('⚠️ USING MOCK DATA — Connect Firestore for production');
}
