/**
 * Initial CMS Data - Default Page Blueprints
 * These are the fallback structures if Firestore has no data.
 * They mirror the current hardcoded page layouts.
 */

// Placeholder images from picsum.photos
const placeholderImages = {
  games: [
    { id: 'g1', name: 'Neon Drift', description: 'Cyberpunk racing game with synthwave aesthetics', image: 'https://picsum.photos/seed/neondrift/600/400', link: '/studio' },
    { id: 'g2', name: 'Pixel Quest', description: 'Retro-style adventure through pixelated worlds', image: 'https://picsum.photos/seed/pixelquest/600/400', link: '/studio' },
    { id: 'g3', name: 'Void Runner', description: 'Endless runner in deep space', image: 'https://picsum.photos/seed/voidrunner/600/400', link: '/studio' },
    { id: 'g4', name: 'Neural Chess', description: 'AI-powered chess against machine minds', image: 'https://picsum.photos/seed/neuralchess/600/400', link: '/studio' },
  ],
  apps: [
    { id: 'a1', name: 'AI Image Studio', description: 'Generate stunning visuals with AI', image: 'https://picsum.photos/seed/aiimage/600/400', link: '/studio' },
    { id: 'a2', name: 'Code Assistant', description: 'Your AI pair programmer', image: 'https://picsum.photos/seed/codeassist/600/400', link: '/studio' },
    { id: 'a3', name: 'Voice Synth', description: 'Create custom AI voices', image: 'https://picsum.photos/seed/voicesynth/600/400', link: '/studio' },
    { id: 'a4', name: 'Data Visualizer', description: 'Transform data into beautiful charts', image: 'https://picsum.photos/seed/dataviz/600/400', link: '/studio' },
  ],
  videos: [
    { id: 'v1', name: 'AI Generated Short Film', description: 'A story told entirely by AI', image: 'https://picsum.photos/seed/aishort/600/400', link: '/studio' },
    { id: 'v2', name: 'Motion Graphics Pack', description: 'Stunning motion templates', image: 'https://picsum.photos/seed/motionpack/600/400', link: '/studio' },
    { id: 'v3', name: 'Tutorial Series', description: 'Learn AI tools step by step', image: 'https://picsum.photos/seed/tutorials/600/400', link: '/studio' },
    { id: 'v4', name: 'Brand Stories', description: 'Commercial AI-generated content', image: 'https://picsum.photos/seed/brandstories/600/400', link: '/studio' },
  ],
  experiences: [
    { id: 'e1', name: 'Virtual Gallery', description: 'Immersive 3D art exhibition', image: 'https://picsum.photos/seed/virtgallery/600/400', link: '/studio' },
    { id: 'e2', name: 'AI Concert', description: 'Live music generated in real-time', image: 'https://picsum.photos/seed/aiconcert/600/400', link: '/studio' },
    { id: 'e3', name: 'Meditation Space', description: 'AI-powered relaxation experiences', image: 'https://picsum.photos/seed/meditation/600/400', link: '/studio' },
    { id: 'e4', name: 'Interactive Stories', description: 'Choose your own adventure with AI', image: 'https://picsum.photos/seed/interstories/600/400', link: '/studio' },
  ],
};

export const defaultHomePageData = {
    id: 'home',
    meta: {
        title: 'Sand Gallery | Creative Technologist × AI',
        description: 'Bridging the gap between human imagination and machine intelligence.',
    },
    sections: [
        {
            id: 'hero-main',
            type: 'Hero',
            props: {
                titleLine1: 'CREATIVE',
                titleLine2: 'TECHNOLOGIST',
                titleLine3: '× AI',
                subtitle: 'Bridging the gap between human imagination and machine intelligence. Building digital experiences that feel alive.',
                ctaText: 'Explore Work',
                ctaLink: '/studio',
            },
            styles: {},
        },
        {
            id: 'spacer-1',
            type: 'Spacer',
            props: {
                height: 200,
            },
            styles: {},
        },
        {
            id: 'coming-soon',
            type: 'RichText',
            props: {
                content: 'More content coming soon...',
                align: 'center',
            },
            styles: {
                color: 'var(--text-secondary)',
            },
        },
    ],
};

export const defaultPricingPageData = {
    id: 'pricing',
    meta: {
        title: 'Pricing | Sand Gallery',
        description: 'Choose your plan for AI generation.',
    },
    sections: [
        {
            id: 'pricing-header',
            type: 'RichText',
            props: {
                content: '<h1 style="font-size: 3rem; margin-bottom: 0.5rem;">POWER <span style="color: var(--accent-primary)">UP</span></h1><p style="color: var(--text-secondary); font-size: 1.2rem;">Secure instant credits to fuel your creation engine.</p>',
                align: 'center',
            },
            styles: {
                paddingTop: '120px',
            },
        },
        {
            id: 'pricing-grid-main',
            type: 'PricingGrid',
            props: {},
            styles: {},
        },
    ],
};

export const defaultStudioPageData = {
    id: 'studio',
    meta: {
        title: 'Studio | Sand Gallery',
        description: 'AI Generation Studio.',
    },
    sections: [
        {
            id: 'studio-app-embed',
            type: 'StudioEmbed',
            props: {},
            styles: {},
        },
    ],
};

/**
 * Get default page data by ID
 */
export const getDefaultPageData = (pageId) => {
    switch (pageId) {
        case 'home':
            return defaultHomePageData;
        case 'pricing':
            return defaultPricingPageData;
        case 'studio':
            return defaultStudioPageData;
        case 'profile':
            return {
                id: 'profile',
                meta: {
                    title: 'Profile | Sand Gallery',
                    description: 'User profile and creations.',
                },
                sections: [],
            };
        case 'gallery':
            return {
                id: 'gallery',
                meta: {
                    title: 'Gallery | Sand Gallery',
                    description: 'Explore the collection.',
                },
                sections: [
                    {
                        id: 'gallery-hero',
                        type: 'RichText',
                        props: {
                            content: '<div style="margin-bottom: 2rem;"><h1 style="font-size: 3.5rem; margin-bottom: 0;">THE <span style="color: var(--accent-primary)">GALLERY</span></h1><p style="color: var(--text-secondary); letter-spacing: 2px;">EXPLORE THE COLLECTION</p></div>',
                            align: 'center',
                        },
                        styles: { paddingTop: '100px' }
                    },
                    {
                        id: 'gallery-grid-main',
                        type: 'GalleryGrid',
                        props: {
                            categories: [
                                {
                                    id: 'games',
                                    title: 'GAMES',
                                    subtitle: 'Interactive Experiences',
                                    icon: 'Gamepad2',
                                    color: '#00ff88',
                                    items: placeholderImages.games
                                },
                                {
                                    id: 'apps',
                                    title: 'APPS',
                                    subtitle: 'Tools & Utilities',
                                    icon: 'AppWindow',
                                    color: '#00d4ff',
                                    items: placeholderImages.apps
                                },
                                {
                                    id: 'videos',
                                    title: 'VIDEOS',
                                    subtitle: 'Visual Media',
                                    icon: 'Film',
                                    color: '#ff6b35',
                                    items: placeholderImages.videos
                                },
                                {
                                    id: 'experiences',
                                    title: 'EXPERIENCES',
                                    subtitle: 'Immersive Worlds',
                                    icon: 'Sparkles',
                                    color: '#c79b37',
                                    items: placeholderImages.experiences
                                }
                            ]
                        },
                        styles: {}
                    }
                ],
            };
        default:
            return { id: pageId, meta: {}, sections: [] };
    }
};

export default defaultHomePageData;
