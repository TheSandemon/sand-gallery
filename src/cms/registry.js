/**
 * CMS Component Registry
 * Maps component type names (strings) to their React components and editable schemas.
 */

import Hero from '../components/Hero';
// Future components will be added here

/**
 * Registry of all CMS-editable components.
 * Each entry defines:
 *   - component: The React component to render
 *   - schema: Editable properties and their types
 *   - defaultProps: Initial values for new instances
 */
export const componentRegistry = {
    Hero: {
        component: Hero,
        label: 'Hero Banner',
        schema: {
            titleLine1: { type: 'text', label: 'Title Line 1' },
            titleLine2: { type: 'text', label: 'Title Line 2' },
            titleLine3: { type: 'text', label: 'Title Line 3' },
            subtitle: { type: 'textarea', label: 'Subtitle' },
            ctaText: { type: 'text', label: 'Button Text' },
            ctaLink: { type: 'text', label: 'Button Link' },
        },
        defaultProps: {
            titleLine1: 'CREATIVE',
            titleLine2: 'TECHNOLOGIST',
            titleLine3: '× AI',
            subtitle: 'Bridging the gap between human imagination and machine intelligence.',
            ctaText: 'Explore Work',
            ctaLink: '/studio',
        },
    },
    Spacer: {
        component: 'spacer', // Special case: handled inline
        label: 'Spacer',
        schema: {
            height: { type: 'number', label: 'Height (px)', min: 20, max: 500 },
        },
        defaultProps: {
            height: 100,
        },
    },
    RichText: {
        component: 'richtext', // Special case: handled inline
        label: 'Text Block',
        schema: {
            content: { type: 'richtext', label: 'Content' },
            align: { type: 'select', label: 'Alignment', options: ['left', 'center', 'right'] },
        },
        defaultProps: {
            content: 'Enter your text here...',
            align: 'center',
        },
    },
};

/**
 * Get a list of all available component types for the component picker.
 */
export const getAvailableComponents = () => {
    return Object.entries(componentRegistry).map(([key, value]) => ({
        type: key,
        label: value.label,
        schema: value.schema,
        defaultProps: value.defaultProps,
    }));
};

export default componentRegistry;
