import React from 'react';
import { Link } from 'react-router-dom';
import { Save, Eye, LogOut, Loader2, Circle } from 'lucide-react';

const EditorToolbar = ({
    onSave,
    saving,
    previewRoute,
    previewLabel,
    hasUnsavedChanges,
    lastSaved,
    onExit
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
        statusIndicator: {
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            color: '#888',
            padding: '0 12px',
            borderRight: '1px solid #333',
            marginRight: '4px',
        },
        unsavedDot: {
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#e5c07b',
        },
        savedDot: {
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'var(--neon-green)',
        },
    };

    const handleExit = () => {
        if (hasUnsavedChanges) {
            if (!window.confirm('You have unsaved changes. Are you sure you want to exit?')) {
                return;
            }
        }
        onExit?.();
        window.location.href = '/admin';
    };

    return (
        <div style={styles.toolbar}>
            {/* Status Indicator */}
            <div style={styles.statusIndicator}>
                {saving ? (
                    <>
                        <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                        <span>Saving...</span>
                    </>
                ) : hasUnsavedChanges ? (
                    <>
                        <div style={styles.unsavedDot} />
                        <span>Unsaved</span>
                    </>
                ) : lastSaved ? (
                    <>
                        <div style={styles.savedDot} />
                        <span>Saved</span>
                    </>
                ) : null}
            </div>

            <button
                onClick={handleExit}
                style={{ ...styles.btn, ...styles.btnSecondary }}
            >
                <LogOut size={16} />
                Exit
            </button>
            <button
                style={{
                    ...styles.btn,
                    ...styles.btnPrimary,
                    opacity: saving ? 0.7 : 1,
                    cursor: saving ? 'wait' : 'pointer'
                }}
                onClick={onSave}
                disabled={saving}
            >
                {saving ? (
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                    <Save size={16} />
                )}
                {saving ? 'Saving...' : 'Save'}
            </button>
            <Link
                to={previewRoute || '/'}
                target="_blank"
                style={{ ...styles.btn, ...styles.btnSecondary }}
            >
                <Eye size={16} />
                Preview
            </Link>
        </div>
    );
};

export default EditorToolbar;
