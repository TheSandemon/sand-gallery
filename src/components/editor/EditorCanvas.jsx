import React from 'react';
import DynamicRenderer from '../cms/DynamicRenderer';

const EditorCanvas = ({
    sections = [],
    selectedId,
    onSelect,
    onAddAtIndex
}) => {
    const styles = {
        canvas: {
            flex: 1,
            overflow: 'auto',
            background: '#1a1a1a',
            position: 'relative',
        },
        canvasInner: {
            maxWidth: '1200px',
            margin: '0 auto',
            minHeight: '100%',
            background: 'var(--bg-dark)',
            boxShadow: '0 0 40px rgba(0,0,0,0.5)',
            position: 'relative',
        },
        emptyState: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            color: '#666',
            gap: '16px',
        },
        addButton: {
            padding: '12px 24px',
            background: 'var(--neon-green)',
            color: 'black',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
        },
    };

    return (
        <div style={styles.canvas}>
            <div style={styles.canvasInner}>
                {sections.length === 0 ? (
                    <div style={styles.emptyState}>
                        <span style={{ fontSize: '3rem' }}>📄</span>
                        <p>This page is empty</p>
                        <button
                            style={styles.addButton}
                            onClick={() => onAddAtIndex && onAddAtIndex(0)}
                        >
                            + Add First Section
                        </button>
                    </div>
                ) : (
                    <DynamicRenderer
                        sections={sections}
                        isEditing={true}
                        selectedId={selectedId}
                        onSelect={onSelect}
                    />
                )}
            </div>
        </div>
    );
};

export default EditorCanvas;
