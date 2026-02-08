import React from 'react';
import { Link } from 'react-router-dom';

const EditorToolbar = ({
    onSave,
    saving,
    previewRoute,
    previewLabel
}) => {
    const styles = {
        toolbar: {
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '10px',
            background: 'rgba(0,0,0,0.95)',
            padding: '12px 24px',
            borderRadius: '30px',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            zIndex: 100,
        },
        btn: {
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.9rem',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        },
        btnPrimary: {
            background: 'var(--neon-green)',
            color: 'black',
        },
        btnSecondary: {
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            textDecoration: 'none',
        },
    };

    return (
        <div style={styles.toolbar}>
            <Link
                to="/admin"
                style={{ ...styles.btn, ...styles.btnSecondary }}
            >
                ← Exit Editor
            </Link>
            <button
                style={{ ...styles.btn, ...styles.btnPrimary }}
                onClick={onSave}
                disabled={saving}
            >
                {saving ? '⏳ Saving...' : '💾 Save Page'}
            </button>
            <Link
                to={previewRoute || '/'}
                target="_blank"
                style={{ ...styles.btn, ...styles.btnSecondary }}
            >
                👁 Preview {previewLabel || 'Page'}
            </Link>
        </div>
    );
};

export default EditorToolbar;
