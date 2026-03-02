import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { componentRegistry, getAvailableComponents } from '../../cms/registry';
import { pageRegistry } from '../../cms/pageRegistry';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { seedMediaLibrary, previewMigration } from '../../cms/seedMediaLibrary';
import useSiteSettings from '../../hooks/useSiteSettings';
import { X, Loader2, AlertTriangle, Check, ChevronDown, ChevronUp, Settings, Plus, Search, RotateCcw, Undo, Redo } from 'lucide-react';

const EditorSidebar = ({
    activePageId,
    setActivePageId,
    selectedSection,
    updateSectionProp,
    addSection,
    deleteSection,
    moveSection,
    hasUnsavedChanges,
    onSave,
    saving,
}) => {
    const [activePanel, setActivePanel] = useState('inspector'); // 'inspector' | 'add' | 'settings'
    const { settings, updateSettings } = useSiteSettings();
    const [localNavLinks, setLocalNavLinks] = useState([]);
    const [showHidden, setShowHidden] = useState(false);

    // Migration modal state
    const [showMigrationModal, setShowMigrationModal] = useState(false);
    const [migrationPreview, setMigrationPreview] = useState(null);
    const [migrationLoading, setMigrationLoading] = useState(false);
    const [migrationProgress, setMigrationProgress] = useState(0);
    const [migrationError, setMigrationError] = useState(null);

    // Search state for components
    const [componentSearch, setComponentSearch] = useState('');

    // Load preview when modal opens
    useEffect(() => {
        if (showMigrationModal) {
            previewMigration().then(setMigrationPreview).catch(err => setMigrationPreview({ error: err.message }));
        } else {
            setMigrationPreview(null);
            setMigrationProgress(0);
            setMigrationError(null);
        }
    }, [showMigrationModal]);

    // Handle migration with options
    const handleMigration = async (options) => {
        setMigrationLoading(true);
        setMigrationProgress(0);
        setMigrationError(null);

        // Simple progress simulation
        const progressInterval = setInterval(() => {
            setMigrationProgress(prev => Math.min(prev + 10, 90));
        }, 200);

        const result = await seedMediaLibrary(options);

        clearInterval(progressInterval);
        setMigrationProgress(100);
        setMigrationLoading(false);

        if (result.success) {
            setTimeout(() => setShowMigrationModal(false), 1000);
        } else {
            setMigrationError(result.error);
        }
    };


    // Sync local state with settings
    useEffect(() => {
        if (settings.navLinks) {
            setLocalNavLinks(settings.navLinks);
        }
        setShowHidden(settings.showHiddenPages || false);
    }, [settings]);

    const handleSaveSettings = async () => {
        try {
            await updateSettings({
                navLinks: localNavLinks,
                showHiddenPages: showHidden,
            });
            alert('Settings saved!');
        } catch (err) {
            alert('Failed to save settings');
        }
    };

    const handleAddNavLink = () => {
        setLocalNavLinks(prev => [...prev, { label: 'NEW LINK', path: '/new', hidden: false }]);
    };

    const handleRemoveNavLink = (index) => {
        setLocalNavLinks(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpdateNavLink = (index, field, value) => {
        setLocalNavLinks(prev => prev.map((link, i) =>
            i === index ? { ...link, [field]: value } : link
        ));
    };

    const styles = {
        sidebar: {
            width: '320px',
            minWidth: '320px',
            background: '#111',
            borderRight: '1px solid #333',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
        },
        sidebarHeader: {
            padding: '15px',
            borderBottom: '1px solid #333',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        pageSelector: {
            padding: '12px 15px',
            borderBottom: '1px solid #333',
            background: '#0d0d0d',
        },
        tabs: {
            display: 'flex',
            borderBottom: '1px solid #333',
        },
        tab: {
            flex: 1,
            padding: '12px',
            textAlign: 'center',
            cursor: 'pointer',
            background: 'transparent',
            border: 'none',
            color: '#888',
            fontSize: '0.85rem',
            fontWeight: '600',
            transition: 'all 0.2s',
        },
        tabActive: {
            color: 'var(--neon-green)',
            borderBottom: '2px solid var(--neon-green)',
        },
        panelContent: {
            flex: 1,
            overflow: 'auto',
            padding: '15px',
        },
        inputGroup: {
            marginBottom: '15px',
        },
        label: {
            display: 'block',
            fontSize: '0.75rem',
            color: '#888',
            marginBottom: '5px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
        },
        input: {
            width: '100%',
            padding: '10px',
            background: '#222',
            border: '1px solid #444',
            borderRadius: '6px',
            color: 'white',
            fontSize: '0.9rem',
        },
        textarea: {
            width: '100%',
            padding: '10px',
            background: '#222',
            border: '1px solid #444',
            borderRadius: '6px',
            color: 'white',
            fontSize: '0.9rem',
            minHeight: '100px',
            resize: 'vertical',
        },
        componentCard: {
            background: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '10px',
            cursor: 'pointer',
            transition: 'all 0.2s',
        },
        btn: {
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s',
        },
        btnPrimary: {
            background: 'var(--neon-green)',
            color: 'black',
        },
        btnSecondary: {
            background: '#333',
            color: 'white',
        },
        btnDanger: {
            background: 'rgba(255,0,0,0.2)',
            color: '#ff6b6b',
            border: '1px solid #ff6b6b',
        },
        navLinkRow: {
            display: 'flex',
            gap: '8px',
            marginBottom: '10px',
            alignItems: 'center',
        },
        navInput: {
            flex: 1,
            padding: '8px',
            background: '#222',
            border: '1px solid #444',
            borderRadius: '4px',
            color: 'white',
            fontSize: '0.85rem',
        },
        checkboxLabel: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#aaa',
            fontSize: '0.85rem',
            cursor: 'pointer',
        },
    };

    return (
        <div style={styles.sidebar}>
            <div style={styles.sidebarHeader}>
                <Link to="/admin" style={{ color: '#888', textDecoration: 'none', fontSize: '0.9rem' }}>
                    ← Back
                </Link>
                <span style={{ color: 'var(--neon-gold)', fontWeight: 'bold' }}>EDITOR V2</span>
            </div>

            {/* Page Navigator */}
            <div style={styles.pageSelector}>
                <label style={{ display: 'block', fontSize: '0.7rem', color: '#666', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Editing Page</label>
                <select
                    value={activePageId}
                    onChange={(e) => setActivePageId(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'linear-gradient(135deg, #1a1a1a 0%, #222 100%)',
                        border: '1px solid #444',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                    }}
                >
                    {pageRegistry.map(page => (
                        <option key={page.id} value={page.id}>
                            {page.icon} {page.label}
                        </option>
                    ))}
                </select>
            </div>

            <div style={styles.tabs}>
                <button
                    style={{ ...styles.tab, ...(activePanel === 'inspector' ? styles.tabActive : {}) }}
                    onClick={() => setActivePanel('inspector')}
                >
                    Inspector
                </button>
                <button
                    style={{ ...styles.tab, ...(activePanel === 'add' ? styles.tabActive : {}) }}
                    onClick={() => setActivePanel('add')}
                >
                    + Add
                </button>
                <button
                    style={{ ...styles.tab, ...(activePanel === 'settings' ? styles.tabActive : {}) }}
                    onClick={() => setActivePanel('settings')}
                >
                    ⚙️ Site
                </button>
            </div>

            <div style={styles.panelContent}>
                {/* Inspector Panel */}
                {activePanel === 'inspector' && (
                    <>
                        {selectedSection ? (
                            <>
                                <h3 style={{ margin: '0 0 15px', color: 'var(--neon-green)' }}>
                                    {componentRegistry[selectedSection.type]?.label || selectedSection.type}
                                </h3>

                                {Object.entries(componentRegistry[selectedSection.type]?.schema || {}).map(([key, config]) => (
                                    <div key={key} style={styles.inputGroup}>
                                        <label style={styles.label}>{config.label}</label>
                                        {config.type === 'text' && (
                                            <input
                                                type="text"
                                                style={styles.input}
                                                value={selectedSection.props[key] || ''}
                                                onChange={(e) => updateSectionProp(key, e.target.value)}
                                            />
                                        )}
                                        {config.type === 'textarea' && (
                                            <textarea
                                                style={styles.textarea}
                                                value={selectedSection.props[key] || ''}
                                                onChange={(e) => updateSectionProp(key, e.target.value)}
                                            />
                                        )}
                                        {config.type === 'richtext' && (
                                            <textarea
                                                style={styles.textarea}
                                                value={selectedSection.props[key] || ''}
                                                onChange={(e) => updateSectionProp(key, e.target.value)}
                                                placeholder="HTML content..."
                                            />
                                        )}
                                        {config.type === 'number' && (
                                            <input
                                                type="number"
                                                style={styles.input}
                                                value={selectedSection.props[key] || 0}
                                                min={config.min}
                                                max={config.max}
                                                onChange={(e) => updateSectionProp(key, parseInt(e.target.value, 10))}
                                            />
                                        )}
                                        {config.type === 'select' && (
                                            <select
                                                style={styles.input}
                                                value={selectedSection.props[key] || ''}
                                                onChange={(e) => updateSectionProp(key, e.target.value)}
                                            >
                                                {config.options?.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        )}
                                        {config.type === 'json' && (
                                            <div style={{ position: 'relative' }}>
                                                <textarea
                                                    style={{ ...styles.textarea, fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'pre' }}
                                                    value={
                                                        typeof selectedSection.props[key] === 'string'
                                                            ? selectedSection.props[key]
                                                            : JSON.stringify(selectedSection.props[key], null, 2)
                                                    }
                                                    onChange={(e) => {
                                                        // Temporarily store as string to allow typing
                                                        updateSectionProp(key, e.target.value);
                                                    }}
                                                    onBlur={(e) => {
                                                        try {
                                                            const parsed = JSON.parse(e.target.value);
                                                            updateSectionProp(key, parsed);
                                                        } catch (err) {
                                                            alert('Invalid JSON: ' + err.message);
                                                        }
                                                    }}
                                                />
                                                <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '4px' }}>
                                                    Edit as JSON. Validated on blur.
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
                                    <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={() => moveSection('up')}>↑ Up</button>
                                    <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={() => moveSection('down')}>↓ Down</button>
                                    <button style={{ ...styles.btn, ...styles.btnDanger }} onClick={deleteSection}>Delete</button>
                                </div>
                            </>
                        ) : (
                            <p style={{ color: '#666', textAlign: 'center', marginTop: '40px' }}>
                                Click a section on the canvas to edit it.
                            </p>
                        )}
                    </>
                )}

                {/* Add Component Panel */}
                {activePanel === 'add' && (
                    <>
                        <h3 style={{ margin: '0 0 15px', color: 'var(--neon-green)' }}>Add Component</h3>

                        {/* Search Components */}
                        <div style={{ position: 'relative', marginBottom: '15px' }}>
                            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                            <input
                                type="text"
                                placeholder="Search components..."
                                value={componentSearch}
                                onChange={(e) => setComponentSearch(e.target.value)}
                                style={{
                                    ...styles.input,
                                    paddingLeft: '32px',
                                    fontSize: '0.85rem'
                                }}
                            />
                        </div>

                        {/* Standard Components */}
                        {getAvailableComponents()
                            .filter(c => c.type !== 'AppPackage')
                            .filter(comp => !componentSearch || comp.label.toLowerCase().includes(componentSearch.toLowerCase()) || comp.type.toLowerCase().includes(componentSearch.toLowerCase()))
                            .map(comp => (
                                <div
                                    key={comp.type}
                                    style={styles.componentCard}
                                    onClick={() => addSection(comp.type)}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--neon-green)'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#333'}
                                >
                                    <div style={{ fontWeight: '600', color: 'white' }}>{comp.label}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                                        {comp.description || comp.type}
                                    </div>
                                </div>
                            ))}

                        {getAvailableComponents().filter(c => c.type !== 'AppPackage').filter(comp => !componentSearch || comp.label.toLowerCase().includes(componentSearch.toLowerCase())).length === 0 && (
                            <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>No components found</p>
                        )}

                        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #333' }}>
                            <h4 style={{ color: '#888', marginBottom: '10px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Admin Tools</h4>

                            {/* Migration Button */}
                            <button
                                onClick={() => setShowMigrationModal(true)}
                                style={{
                                    ...styles.btn,
                                    background: 'linear-gradient(135deg, #1a1a1a 0%, #252525 100%)',
                                    border: '1px solid #444',
                                    color: '#e5c07b',
                                    width: '100%',
                                    fontSize: '0.85rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <RotateCcw size={14} />
                                Migrate to Gallery 2.0
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Migration Modal */}
            {showMigrationModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: '12px',
                        padding: '24px',
                        maxWidth: '480px',
                        width: '90%'
                    }}>
                        {/* Modal Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, color: '#e5c07b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <RotateCcw size={18} />
                                Gallery 2.0 Migration
                            </h3>
                            {!migrationLoading && (
                                <button onClick={() => setShowMigrationModal(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
                                    <X size={20} />
                                </button>
                            )}
                        </div>

                        {migrationLoading ? (
                            /* Loading State */
                            <div style={{ textAlign: 'center', padding: '30px 0' }}>
                                <Loader2 size={40} style={{ color: 'var(--neon-green)', animation: 'spin 1s linear infinite' }} />
                                <p style={{ color: '#888', marginTop: '15px' }}>{migrationProgress < 90 ? 'Migrating data...' : 'Finalizing...'}</p>
                                <div style={{ background: '#333', borderRadius: '4px', height: '8px', marginTop: '15px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${migrationProgress}%`,
                                        height: '100%',
                                        background: 'var(--neon-green)',
                                        transition: 'width 0.3s ease'
                                    }} />
                                </div>
                            </div>
                        ) : migrationError ? (
                            /* Error State */
                            <div style={{ textAlign: 'center', padding: '30px 0' }}>
                                <AlertTriangle size={40} style={{ color: '#ff6b6b' }} />
                                <p style={{ color: '#ff6b6b', marginTop: '15px' }}>{migrationError}</p>
                                <button
                                    onClick={() => setMigrationError(null)}
                                    style={{ ...styles.btn, ...styles.btnSecondary, marginTop: '15px' }}
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Preview Info */}
                                {migrationPreview?.error ? (
                                    <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid #ff6b6b', borderRadius: '8px', padding: '15px', marginBottom: '20px' }}>
                                        <p style={{ color: '#ff6b6b', margin: 0 }}>Error loading preview: {migrationPreview.error}</p>
                                    </div>
                                ) : (
                                    <div style={{ background: '#222', borderRadius: '8px', padding: '15px', marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ color: '#888' }}>Existing Gallery Items</span>
                                            <span style={{ color: 'white', fontWeight: '600' }}>{migrationPreview?.itemCount || 0}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#888' }}>Backup Created</span>
                                            <span style={{ color: 'var(--neon-green)' }}>Auto</span>
                                        </div>
                                    </div>
                                )}

                                {/* Warning */}
                                <div style={{ background: 'rgba(229,192,123,0.1)', border: '1px solid #e5c07b', borderRadius: '8px', padding: '12px', marginBottom: '20px', fontSize: '0.85rem', color: '#e5c07b' }}>
                                    This will convert your GalleryGrid to the new GalleryExplorer format and create a backup before making changes.
                                </div>

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={() => setShowMigrationModal(false)}
                                        style={{ ...styles.btn, ...styles.btnSecondary, flex: 1 }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleMigration({ addSamples: true, updateLayout: true })}
                                        style={{
                                            ...styles.btn,
                                            background: 'var(--neon-gold)',
                                            color: 'black',
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <Check size={16} />
                                        Migrate
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
export default EditorSidebar;
