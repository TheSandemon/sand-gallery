/**
 * Initial CMS Data - Default Page Blueprints
 * These are the fallback structures if Firestore has no data.
 * They mirror the current hardcoded page layouts.
 */

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
                content: '<h1 style="font-size: 3rem; margin-bottom: 0.5rem;">POWER <span style="color: var(--neon-gold)">UP</span></h1><p style="color: var(--text-secondary); font-size: 1.2rem;">Secure instant credits to fuel your creation engine.</p>',
                align: 'center',
            },
            styles: {
                paddingTop: '120px',
            },
        },
        {
            id: 'pricing-grid-main',
            type: 'PricingGrid',
            props: {}, // Uses internal default tiers
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
        default:
            return { id: pageId, meta: {}, sections: [] };
    }
};

export default defaultHomePageData;
