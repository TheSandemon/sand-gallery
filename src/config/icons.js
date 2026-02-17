/**
 * Icons Configuration
 * Centralized icon mapping for CMS components
 */
import { 
    Gamepad2, 
    AppWindow, 
    Film, 
    Sparkles 
} from 'lucide-react';

/**
 * Icon mapping for gallery categories
 * Used by GalleryGrid and other CMS components
 */
export const ICON_MAP = {
    Gamepad2,
    AppWindow,
    Film,
    Sparkles,
};

/**
 * Get icon component by name
 * @param {string} iconName - The icon name from ICON_MAP
 * @returns {React.ComponentType} Icon component
 */
export const getIcon = (iconName) => {
    return ICON_MAP[iconName] || Sparkles;
};

/**
 * Available icon options for CMS
 */
export const ICON_OPTIONS = [
    { name: 'Gamepad2', label: 'Gamepad', component: Gamepad2 },
    { name: 'AppWindow', label: 'Window', component: AppWindow },
    { name: 'Film', label: 'Film', component: Film },
    { name: 'Sparkles', label: 'Sparkles', component: Sparkles },
];

export default ICON_MAP;
