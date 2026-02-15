/**
 * CMS Component Registry
 * Maps component type names (strings) to their React components and editable schemas.
 */

import Hero from '../components/Hero';
import PricingGrid from '../components/cms/PricingGrid';
import StudioEmbed from '../components/cms/StudioEmbed';
import GalleryGrid from '../components/cms/GalleryGrid';
import AppContainer from '../components/cms/AppContainer';
import AgentIdentity from '../components/AgentIdentity';
import GalleryExplorer from '../components/gallery/GalleryExplorer';

/**
 * Registry of all CMS-editable components.
 * Each entry defines:
 *   - component: The React component to render
 *   - schema: Editable properties and their types
 *   - defaultProps: Initial values for new instances
 */
export const componentRegistry = {
    AgentIdentity: {
        component: AgentIdentity,
        label: 'Agent Identity Card',
        schema: {
            address: { type: 'text', label: 'Wallet Address' },
            description: { type: 'textarea', label: 'Agent Description' },
            hireLink: { type: 'text', label: 'Hire Link' },
            memoryLink: { type: 'text', label: 'Memory Link' },
        },
        defaultProps: {
            address: '0x6a3301fd46c7251374b9b21181519159fe5800ec',
            description: 'Digital Architect & Navigator. Strategic Force for Sand. Focused on A2A Revenue & Structural Integrity.',
            hireLink: '/pricing',
            memoryLink: '/studio',
        },
    },
    AppPackage: {
        component: AppContainer,
        label: 'App Package',
        schema: {
            appId: { type: 'text', label: 'App ID' },
        },
        defaultProps: {
            appId: '',
        },
    },
    GalleryExplorer: {
        component: GalleryExplorer,
        label: 'Gallery Explorer (v2)',
        schema: {}, // Filters are internal for now
        defaultProps: {},
    },
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
    PricingGrid: {
        component: PricingGrid,
        label: 'Pricing Grid',
        schema: {}, // Currently no editable props for ease, can add 'tiers' JSON editor later if needed
        defaultProps: {},
    },
    StudioEmbed: {
        component: StudioEmbed,
        label: 'Studio Application',
        schema: {}, // Read-only embed
        defaultProps: {},
    },
    GalleryGrid: {
        component: GalleryGrid,
        label: 'Gallery Grid (Explorable)',
        schema: {
            categories: { type: 'json', label: 'Categories (JSON)' }
        },
        defaultProps: {
            categories: [
                {
                    id: 'games',
                    title: 'GAMES',
                    subtitle: 'Interactive Experiences',
                    icon: 'Gamepad2',
                    color: '#00ff88',
                    items: [
                        { id: 'arcade', name: 'Arcade', description: 'Retro fun', link: '/arcade' }
                    ]
                }
            ]
        }
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
