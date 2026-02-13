import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { componentRegistry, getAvailableComponents } from '../../cms/registry';
import { pageRegistry } from '../../cms/pageRegistry';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { seedApps } from '../../cms/seedApps';
import useSiteSettings from '../../hooks/useSiteSettings';

const EditorSidebar = ({
    activePageId,
    setActivePageId,
    selectedSection,
    updateSectionProp,
    addSection,
    deleteSection,
    moveSection,
}) => {
    const [activePanel, setActivePanel] = useState('inspector'); // 'inspector' | 'add' | 'settings'
    const { settings, updateSettings } = useSiteSettings();
    const [localNavLinks, setLocalNavLinks] = useState([]);
    const [showHidden, setShowHidden] = useState(false);
    const [availableApps, setAvailableApps] = useState([]);

    // Fetch available apps
    useEffect(() => {
        const fetchApps = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'app_packages'));
                const apps = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setAvailableApps(apps);
            } catch (err) {
                console.error("Error fetching apps:", err);
                // Fallback for dev if DB is empty
                setAvailableApps([
                    {
                        id: 'mushroom-runner',
                        name: 'Mushroom Runner',
                        description: 'A side-scrolling platformer game.',
                        icon: '🍄',
                        version: '1.0.0'
                    }
                ]);
            }
        };
        fetchApps();
    }, []);

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

                        {/* Standard Components */}
                        {getAvailableComponents().filter(c => c.type !== 'AppPackage').map(comp => (
                            <div
                                key={comp.type}
                                style={styles.componentCard}
                                onClick={() => addSection(comp.type)}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--neon-green)'}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#333'}
                            >
                                <div style={{ fontWeight: '600', color: 'white' }}>{comp.label}</div>
                                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                                    Type: {comp.type}
                                </div>
                            </div>
                        ))}

                        {/* App Store Section */}
                        <h3 style={{ margin: '20px 0 15px', color: 'var(--neon-gold)' }}>App Store 📦</h3>
                        {availableApps.length === 0 && (
                            <p style={{ color: '#666', fontSize: '0.9rem' }}>No apps available.</p>
                        )}
                        {availableApps.map(app => (
                            <div
                                key={app.id}
                                style={{
                                    ...styles.componentCard,
                                    background: 'linear-gradient(135deg, #1a1a1a 0%, #111 100%)',
                                    border: '1px solid #333'
                                }}
                                onClick={() => {
                                    // Manually add section with pre-filled props for this app
                                    const newSection = {
                                        id: `section-${Date.now()}`,
                                        type: 'AppPackage',
                                        props: { appId: app.id },
                                        styles: {},
                                        layout: { x: 0, y: Infinity, w: 12, h: 6 }, // Taller default for apps
                                    };
                                    // We need to pass this up or duplicate add logic. 
                                    // Since addSection only takes type, we'll modify addSection in the next step or handles it here if we had access to setPageData. 
                                    // Actually, looking at props, we only have addSection(type).
                                    // Let's modify addSection prop in Editor.jsx to accept optional initialProps!
                                    // For now, I'll assume I can pass a second arg or I will patch Editor.jsx as well.
                                    // Wait, addSection in Editor.jsx (lines 74-91) only takes componentType.
                                    // I should update Editor.jsx first to be safe, OR I can rely on a hack if I can't.
                                    // Let's rely on the fact that I will update Editor.jsx in the next step.
                                    addSection('AppPackage', { appId: app.id });
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--neon-gold)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#333';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '1.5rem' }}>{app.icon || '📦'}</span>
                                    <div>
                                        <div style={{ fontWeight: 'bold', color: 'white' }}>{app.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#888' }}>v{app.version}</div>
                                    </div>
                                </div>
                                {app.description && (
                                    <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '8px', lineHeight: '1.3' }}>
                                        {app.description}
                                    </div>
                                )}
                            </div>
                        ))}
                    </>
                )}

                {/* Settings Panel */}
                {activePanel === 'settings' && (
                    <>
                        <h3 style={{ margin: '0 0 15px', color: 'var(--neon-gold)' }}>🌐 Global Settings</h3>

                        {/* Visibility Toggle */}
                        <div style={styles.inputGroup}>
                            <label style={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={showHidden}
                                    onChange={(e) => setShowHidden(e.target.checked)}
                                />
                                Show Hidden Pages (Studio, Pricing)
                            </label>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid #333', margin: '20px 0' }} />

                        {/* Navigation Links Editor */}
                        <h4 style={{ color: '#aaa', marginBottom: '10px' }}>🔗 Navigation Links</h4>
                        {localNavLinks.map((link, index) => (
                            <div key={index} style={styles.navLinkRow}>
                                <input
                                    type="text"
                                    style={{ ...styles.navInput, maxWidth: '80px' }}
                                    value={link.label}
                                    onChange={(e) => handleUpdateNavLink(index, 'label', e.target.value)}
                                    placeholder="Label"
                                />
                                <input
                                    type="text"
                                    style={styles.navInput}
                                    value={link.path}
                                    onChange={(e) => handleUpdateNavLink(index, 'path', e.target.value)}
                                    placeholder="/path"
                                />
                                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#888', fontSize: '0.75rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={link.hidden || false}
                                        onChange={(e) => handleUpdateNavLink(index, 'hidden', e.target.checked)}
                                    />
                                    Hide
                                </label>
                                <button
                                    onClick={() => handleRemoveNavLink(index)}
                                    style={{ background: 'transparent', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: '1.2rem' }}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={handleAddNavLink}
                            style={{ ...styles.btn, ...styles.btnSecondary, width: '100%', marginTop: '10px' }}
                        >
                            + Add Custom Link
                        </button>

                        {/* Quick Add from Page Registry */}
                        {(() => {
                            const existingPaths = localNavLinks.map(l => l.path);
                            const missingPages = pageRegistry.filter(page => !existingPaths.includes(page.route));
                            if (missingPages.length === 0) return null;
                            return (
                                <div style={{ marginTop: '15px' }}>
                                    <label style={{ ...styles.label, color: '#888', marginBottom: '8px', display: 'block' }}>Quick Add Pages</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {missingPages.map(page => (
                                            <button
                                                key={page.id}
                                                onClick={() => setLocalNavLinks(prev => [...prev, { label: page.label.toUpperCase(), path: page.route, hidden: false }])}
                                                style={{
                                                    ...styles.btn,
                                                    background: '#222',
                                                    border: '1px solid #444',
                                                    color: '#aaa',
                                                    fontSize: '0.75rem',
                                                    padding: '6px 10px',
                                                }}
                                            >
                                                {page.icon} {page.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}

                        <hr style={{ border: 'none', borderTop: '1px solid #333', margin: '20px 0' }} />

                        <button
                            onClick={handleSaveSettings}
                            style={{ ...styles.btn, ...styles.btnPrimary, width: '100%' }}
                        >
                            💾 Save Site Settings
                        </button>

                        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #333' }}>
                            <h4 style={{ color: '#aaa', marginBottom: '10px' }}>🛠️ Admin Tools</h4>
                            <button
                                onClick={async () => {
                                    if (window.confirm('Reset/Seed App Store data?')) {
                                        const result = await seedApps();
                                        if (result && result.success) alert('App Store seeded!');
                                        else alert('Seeding failed check console');
                                    }
                                }}
                                style={{
                                    ...styles.btn,
                                    background: '#222',
                                    border: '1px solid #444',
                                    color: '#888',
                                    width: '100%',
                                    fontSize: '0.8rem'
                                }}
                            >
                                Re-seed App Store Data
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default EditorSidebar;
