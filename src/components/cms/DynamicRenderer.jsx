import React, { useState, useEffect, useRef, useMemo } from 'react';
import { componentRegistry } from '../../cms/registry';
import { Responsive as ResponsiveGridLayout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { GRID_CONFIG } from '../../cms/gridConfig';

// Use constants from config
const { cols: GRID_COLS, rowHeight: ROW_HEIGHT, margin: MARGIN, breakpoints: BREAKPOINTS, colsBreakpoints: COLS_BREAKPOINTS } = GRID_CONFIG;

// Helper: WidthWrapper for responsive grid
const WidthWrapper = ({ children, className, style }) => {
    const [width, setWidth] = useState(1200);
    const ref = useRef(null);

    useEffect(() => {
        if (!ref.current) return;
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setWidth(entry.contentRect.width);
            }
        });
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className={className} style={style}>
            {width > 0 && React.cloneElement(children, { width })}
        </div>
    );
};

/**
 * DynamicRenderer - Renders page sections from CMS data.
 * NOW USES REACT-GRID-LAYOUT for true WYSIWYG fidelity.
 */
const DynamicRenderer = ({ sections = [], isEditing = false, selectedId = null, onSelect = () => { } }) => {

    // Generate layout from sections. Default to stacked if no layout present.
    const layout = useMemo(() => {
        return sections.map((section, index) => ({
            i: section.id,
            x: section.layout?.x ?? 0,
            y: section.layout?.y ?? index * 2,
            w: section.layout?.w ?? GRID_COLS,
            h: section.layout?.h ?? 4,
            minW: 2,
            minH: 1,
            static: true // Live view is static (not draggable/resizable) unless isEditing
        }));
    }, [sections]);

    const renderSection = (section) => {
        const { id, type, props: componentProps, styles = {} } = section;
        const registryEntry = componentRegistry[type];

        if (!registryEntry) {
            return (
                <div key={id} className="h-full w-full flex items-center justify-center bg-red-900/20 text-red-400 text-xs border border-red-500/20">
                    Unknown: {type}
                </div>
            );
        }

        // Handle Spacer inline
        if (type === 'Spacer') {
            return (
                <div
                    key={id}
                    className="h-full w-full flex items-center justify-center"
                    style={{ ...styles }}
                    onClick={isEditing ? (e) => { e.stopPropagation(); onSelect(id); } : undefined}
                >
                    {isEditing && <span className="text-[10px] text-gray-600">↕ Spacer</span>}
                </div>
            );
        }

        // Handle RichText inline
        if (type === 'RichText') {
            return (
                <div
                    key={id}
                    className="h-full w-full overflow-hidden"
                    style={{
                        textAlign: componentProps.align || 'center',
                        ...styles,
                        ...(isEditing ? { border: selectedId === id ? '2px solid var(--neon-green)' : '1px dashed #444', cursor: 'pointer' } : {})
                    }}
                    onClick={isEditing ? (e) => { e.stopPropagation(); onSelect(id); } : undefined}
                >
                    <div dangerouslySetInnerHTML={{ __html: componentProps.content }} />
                </div>
            );
        }

        // Standard Component
        const Component = registryEntry.component;

        // Wrapper style for editor selection
        const wrapperStyle = isEditing ? {
            border: selectedId === id ? '2px solid var(--neon-green)' : '1px dashed transparent',
            zIndex: selectedId === id ? 10 : 1,
        } : {};

        return (
            <div
                key={id}
                className="h-full w-full overflow-hidden relative"
                style={wrapperStyle}
                onClick={isEditing ? (e) => { e.stopPropagation(); onSelect(id); } : undefined}
            >
                {/* 
                    Pass `isEditor={true}` to force components to adapt to grid cell size.
                    Even on live site, we want 'grid mode' behavior (height: 100%).
                 */}
                <Component {...componentProps} cmsStyles={styles} isEditor={true} />
            </div>
        );
    };

    return (
        <WidthWrapper className="relative w-full min-h-screen">
            <ResponsiveGridLayout
                className="layout"
                layouts={{ lg: layout }}
                breakpoints={BREAKPOINTS}
                cols={COLS_BREAKPOINTS}
                rowHeight={ROW_HEIGHT}
                margin={MARGIN}
                isDraggable={false} // Always false in renderer (Editor uses Canvas)
                isResizable={false}
                useCSSTransforms={true}
            >
                {sections.map(renderSection)}
            </ResponsiveGridLayout>
        </WidthWrapper>
    );
};

export default DynamicRenderer;
