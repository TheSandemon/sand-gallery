/**
 * Initial CMS Data - Default Home Page Blueprint
 * This is the fallback structure if Firestore has no data.
 * It mirrors the current hardcoded Home page layout.
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

export default defaultHomePageData;
