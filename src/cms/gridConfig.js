/**
 * Shared configuration for the CMS Grid System.
 * Used by both the Editor (GridEditorCanvas) and the Live Renderer (DynamicRenderer).
 */

export const GRID_CONFIG = {
    // Grid Setup
    cols: 12,
    rowHeight: 25, // Finer granularity for "snappier" resizing (previously 50)
    margin: [16, 16],

    // Responsive Breakpoints (matching Bootstrap/Tailwind standard-ish)
    breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },

    // Columns per breakpoint
    colsBreakpoints: { lg: 12, md: 12, sm: 6, xs: 4, xxs: 2 }
};
