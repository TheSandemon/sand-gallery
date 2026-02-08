import React, { useState, useMemo, useCallback } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { componentRegistry } from '../../cms/registry';
import { GripVertical, Maximize2, Trash2 } from 'lucide-react';

// Constants for the grid
const GRID_COLS = 12;
const ROW_HEIGHT = 50;
const MARGIN = [16, 16];

/**
 * GridEditorCanvas - A Squarespace-like drag-and-drop editor canvas.
 * Uses react-grid-layout for positioning and resizing.
 */
const GridEditorCanvas = ({
    sections = [],
    selectedId,
    onSelect,
    onLayoutChange,
    onDeleteSection,
    containerWidth = 1200,
}) => {
    const [showGrid, setShowGrid] = useState(true);

    // Convert sections to layout format for react-grid-layout
    const layout = useMemo(() => {
        return sections.map((section, index) => ({
            i: section.id,
            x: section.layout?.x ?? 0,
            y: section.layout?.y ?? index * 2,
            w: section.layout?.w ?? GRID_COLS,
            h: section.layout?.h ?? 2,
            minW: 2,
            minH: 1,
        }));
    }, [sections]);

    // Handle layout changes (drag/resize)
    const handleLayoutChange = useCallback((newLayout) => {
        if (onLayoutChange) {
            const layoutMap = {};
            newLayout.forEach(item => {
                layoutMap[item.i] = { x: item.x, y: item.y, w: item.w, h: item.h };
            });
            onLayoutChange(layoutMap);
        }
    }, [onLayoutChange]);

    // Render a section component
    const renderSection = (section) => {
        const config = componentRegistry[section.type];
        if (!config || !config.component) {
            return (
                <div className="flex items-center justify-center h-full bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    Unknown: {section.type}
                </div>
            );
        }

        // Special cases
        if (section.type === 'Spacer') {
            return (
                <div
                    className="w-full h-full flex items-center justify-center border border-dashed border-white/10 rounded-lg text-gray-600 text-sm"
                    style={{ minHeight: `${section.props.height || 100}px` }}
                >
                    ↕ Spacer ({section.props.height || 100}px)
                </div>
            );
        }

        if (section.type === 'RichText') {
            return (
                <div
                    className="w-full h-full overflow-hidden p-4 text-white"
                    style={{ textAlign: section.props.align || 'left' }}
                    dangerouslySetInnerHTML={{ __html: section.props.content || '<p>Rich Text</p>' }}
                />
            );
        }

        const Component = config.component;
        return <Component {...section.props} />;
    };

    return (
        <div className="relative flex-1 overflow-auto bg-[#1a1a1a]">
            {/* Toolbar */}
            <div className="sticky top-0 z-20 bg-[#111] border-b border-white/10 px-4 py-2 flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showGrid}
                        onChange={(e) => setShowGrid(e.target.checked)}
                        className="accent-neon-green"
                    />
                    Show Grid
                </label>
                <div className="flex-1" />
                <div className="text-xs text-gray-600">
                    {GRID_COLS} columns • {sections.length} sections
                </div>
            </div>

            {/* Canvas */}
            <div
                className="relative mx-auto"
                style={{
                    maxWidth: `${containerWidth}px`,
                    minHeight: 'calc(100vh - 200px)',
                    background: showGrid ? 'repeating-linear-gradient(90deg, transparent, transparent calc(100% / 12 - 1px), rgba(255,255,255,0.03) calc(100% / 12 - 1px), rgba(255,255,255,0.03) calc(100% / 12))' : 'transparent',
                }}
            >
                {sections.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 gap-4">
                        <span className="text-4xl">📦</span>
                        <p>Drop components here to start building.</p>
                        <p className="text-xs">Use the "+ Add" panel on the left.</p>
                    </div>
                ) : (
                    <GridLayout
                        className="layout"
                        layout={layout}
                        cols={GRID_COLS}
                        rowHeight={ROW_HEIGHT}
                        width={containerWidth}
                        margin={MARGIN}
                        onLayoutChange={handleLayoutChange}
                        isDraggable={true}
                        isResizable={true}
                        draggableHandle=".drag-handle"
                        useCSSTransforms={true}
                        compactType="vertical"
                    >
                        {sections.map((section) => (
                            <div
                                key={section.id}
                                className={`group relative rounded-xl overflow-hidden transition-all duration-150
                                    ${selectedId === section.id
                                        ? 'ring-2 ring-neon-green shadow-lg shadow-neon-green/20'
                                        : 'ring-1 ring-white/10 hover:ring-white/30'
                                    }`}
                                style={{ background: '#0a0a0a' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelect && onSelect(section.id);
                                }}
                            >
                                {/* Drag Handle */}
                                <div className="drag-handle absolute top-2 left-2 z-10 p-1.5 rounded bg-black/60 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
                                    <GripVertical size={14} className="text-gray-400" />
                                </div>

                                {/* Resize indicator */}
                                <div className="absolute bottom-2 right-2 z-10 p-1 rounded bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Maximize2 size={12} className="text-gray-400" />
                                </div>

                                {/* Delete button */}
                                <button
                                    className="absolute top-2 right-2 z-10 p-1.5 rounded bg-red-900/60 hover:bg-red-700 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteSection && onDeleteSection(section.id);
                                    }}
                                >
                                    <Trash2 size={12} className="text-red-300" />
                                </button>

                                {/* Type badge */}
                                <div className="absolute top-2 left-10 z-10 px-2 py-0.5 rounded-full bg-black/60 text-[10px] font-medium text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {section.type}
                                </div>

                                {/* Section Content */}
                                <div className="w-full h-full pointer-events-none">
                                    {renderSection(section)}
                                </div>
                            </div>
                        ))}
                    </GridLayout>
                )}
            </div>

            {/* Custom Styles for react-grid-layout */}
            <style>{`
                .react-grid-layout {
                    position: relative;
                }
                .react-grid-item {
                    transition: all 200ms ease;
                    transition-property: left, top, width, height;
                }
                .react-grid-item.cssTransforms {
                    transition-property: transform, width, height;
                }
                .react-grid-item.resizing {
                    z-index: 100;
                    opacity: 0.9;
                }
                .react-grid-item.react-draggable-dragging {
                    z-index: 100;
                    opacity: 0.9;
                    box-shadow: 0 10px 40px rgba(0, 143, 78, 0.3);
                }
                .react-grid-item > .react-resizable-handle {
                    position: absolute;
                    width: 20px;
                    height: 20px;
                }
                .react-grid-item > .react-resizable-handle::after {
                    content: "";
                    position: absolute;
                    right: 4px;
                    bottom: 4px;
                    width: 8px;
                    height: 8px;
                    border-right: 2px solid rgba(255, 255, 255, 0.2);
                    border-bottom: 2px solid rgba(255, 255, 255, 0.2);
                }
                .react-grid-item:hover > .react-resizable-handle::after {
                    border-color: var(--neon-green);
                }
                .react-resizable-handle-se {
                    bottom: 0;
                    right: 0;
                    cursor: se-resize;
                }
                .react-resizable-handle-e {
                    right: 0;
                    top: 50%;
                    margin-top: -10px;
                    cursor: e-resize;
                }
                .react-resizable-handle-s {
                    bottom: 0;
                    left: 50%;
                    margin-left: -10px;
                    cursor: s-resize;
                }
                .react-grid-placeholder {
                    background: var(--neon-green) !important;
                    opacity: 0.15 !important;
                    border-radius: 12px !important;
                }
            `}</style>
        </div>
    );
};

export default GridEditorCanvas;
