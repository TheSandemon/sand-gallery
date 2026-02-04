import React from 'react';
import { componentRegistry } from '../../cms/registry';

/**
 * DynamicRenderer - Renders page sections from CMS data.
 * Takes an array of section objects and renders the appropriate component for each.
 * 
 * @param {Object} props
 * @param {Array} props.sections - Array of section objects from Firestore/CMS
 * @param {boolean} props.isEditing - If true, enables click-to-select behavior
 * @param {string} props.selectedId - Currently selected section ID (for editor)
 * @param {Function} props.onSelect - Callback when a section is clicked in edit mode
 */
const DynamicRenderer = ({ sections = [], isEditing = false, selectedId = null, onSelect = () => { } }) => {

    const renderSection = (section) => {
        const { id, type, props: componentProps, styles = {} } = section;
        const registryEntry = componentRegistry[type];

        if (!registryEntry) {
            console.warn(`CMS: Unknown component type "${type}"`);
            return (
                <div key={id} style={{ padding: '20px', background: 'rgba(255,0,0,0.2)', color: 'red', textAlign: 'center' }}>
                    Unknown Component: {type}
                </div>
            );
        }

        // Handle special inline components
        if (type === 'Spacer') {
            return (
                <div
                    key={id}
                    style={{
                        height: `${componentProps.height || 100}px`,
                        ...styles,
                        ...(isEditing ? { border: selectedId === id ? '2px solid var(--neon-green)' : '1px dashed #444', cursor: 'pointer' } : {})
                    }}
                    onClick={isEditing ? (e) => { e.stopPropagation(); onSelect(id); } : undefined}
                >
                    {isEditing && <span style={{ display: 'block', textAlign: 'center', color: '#666', fontSize: '0.8rem' }}>Spacer ({componentProps.height}px)</span>}
                </div>
            );
        }

        if (type === 'RichText') {
            return (
                <div
                    key={id}
                    style={{
                        textAlign: componentProps.align || 'center',
                        padding: '40px 20px',
                        ...styles,
                        ...(isEditing ? { border: selectedId === id ? '2px solid var(--neon-green)' : '1px dashed #444', cursor: 'pointer' } : {})
                    }}
                    onClick={isEditing ? (e) => { e.stopPropagation(); onSelect(id); } : undefined}
                    dangerouslySetInnerHTML={{ __html: componentProps.content }}
                />
            );
        }

        // Standard component rendering
        const Component = registryEntry.component;

        // Wrapper for editing mode selection highlight
        const wrapperStyle = isEditing ? {
            position: 'relative',
            cursor: 'pointer',
            outline: selectedId === id ? '3px solid var(--neon-green)' : '1px dashed transparent',
            outlineOffset: '4px',
            transition: 'outline 0.2s ease',
        } : {};

        return (
            <div
                key={id}
                style={wrapperStyle}
                onClick={isEditing ? (e) => { e.stopPropagation(); onSelect(id); } : undefined}
            >
                <Component {...componentProps} cmsStyles={styles} />
            </div>
        );
    };

    return (
        <div className="cms-dynamic-content">
            {sections.map(renderSection)}
        </div>
    );
};

export default DynamicRenderer;
