import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import DynamicRenderer from '../../components/cms/DynamicRenderer';
import { componentRegistry, getAvailableComponents } from '../../cms/registry';
import { defaultHomePageData } from '../../cms/initialData';

const Editor = () => {
    const { user } = useAuth();
    const [pageData, setPageData] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activePanel, setActivePanel] = useState('inspector'); // 'inspector' | 'add'

    // Fetch current page data on mount
    useEffect(() => {
        const fetchPageData = async () => {
            try {
                const docRef = doc(db, 'pages', 'home');
                const snapshot = await getDoc(docRef);
                if (snapshot.exists()) {
                    setPageData(snapshot.data());
                } else {
                    // Initialize with default data
                    setPageData(defaultHomePageData);
                }
            } catch (err) {
                console.error('Editor: Error loading page data', err);
                setPageData(defaultHomePageData);
            }
            setLoading(false);
        };
        fetchPageData();
    }, []);

    // Get selected section
    const selectedSection = pageData?.sections?.find(s => s.id === selectedId);

    // Update a property of the selected section
    const updateSectionProp = (propName, value) => {
        if (!selectedId || !pageData) return;
        setPageData(prev => ({
            ...prev,
            sections: prev.sections.map(s =>
                s.id === selectedId
                    ? { ...s, props: { ...s.props, [propName]: value } }
                    : s
            )
        }));
    };

    // Update a style of the selected section
    const updateSectionStyle = (styleName, value) => {
        if (!selectedId || !pageData) return;
        setPageData(prev => ({
            ...prev,
            sections: prev.sections.map(s =>
                s.id === selectedId
                    ? { ...s, styles: { ...s.styles, [styleName]: value } }
                    : s
            )
        }));
    };

    // Add a new section
    const addSection = (componentType) => {
        const registryEntry = componentRegistry[componentType];
        if (!registryEntry) return;

        const newSection = {
            id: `section-${Date.now()}`,
            type: componentType,
            props: { ...registryEntry.defaultProps },
            styles: {},
        };

        setPageData(prev => ({
            ...prev,
            sections: [...(prev.sections || []), newSection],
        }));
        setSelectedId(newSection.id);
        setActivePanel('inspector');
    };

    // Delete selected section
    const deleteSection = () => {
        if (!selectedId || !pageData) return;
        if (!window.confirm('Delete this section?')) return;
        setPageData(prev => ({
            ...prev,
            sections: prev.sections.filter(s => s.id !== selectedId),
        }));
        setSelectedId(null);
    };

    // Move section up/down
    const moveSection = (direction) => {
        if (!selectedId || !pageData) return;
        const index = pageData.sections.findIndex(s => s.id === selectedId);
        if (index === -1) return;
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= pageData.sections.length) return;

        const newSections = [...pageData.sections];
        [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
        setPageData(prev => ({ ...prev, sections: newSections }));
    };

    // Save to Firestore
    const handleSave = async () => {
        if (!pageData) return;
        setSaving(true);
        try {
            await setDoc(doc(db, 'pages', 'home'), pageData);
            alert('Page saved successfully!');
        } catch (err) {
            console.error('Editor: Error saving page', err);
            alert('Failed to save page.');
        }
        setSaving(false);
    };

    // Access control
    if (!user || user.role !== 'owner') {
        return (
            <div style={{ paddingTop: '120px', textAlign: 'center', color: 'red' }}>
                <h1>ACCESS DENIED</h1>
                <p>You do not have permission to access the Website Editor.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ paddingTop: '120px', textAlign: 'center' }}>
                <p>Loading Editor...</p>
            </div>
        );
    }

    const styles = {
        container: {
            display: 'flex',
            height: 'calc(100vh - 60px)',
            paddingTop: '60px',
            background: '#0a0a0a',
        },
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
            fontSize: '0.9rem',
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
        },
        toolbar: {
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '10px',
            background: 'rgba(0,0,0,0.9)',
            padding: '10px 20px',
            borderRadius: '30px',
            border: '1px solid #333',
            zIndex: 100,
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
        inputGroup: {
            marginBottom: '15px',
        },
        label: {
            display: 'block',
            fontSize: '0.8rem',
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
            fontSize: '0.95rem',
        },
        textarea: {
            width: '100%',
            padding: '10px',
            background: '#222',
            border: '1px solid #444',
            borderRadius: '6px',
            color: 'white',
            fontSize: '0.95rem',
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
    };

    return (
        <div style={styles.container}>
            {/* Sidebar */}
            <div style={styles.sidebar}>
                <div style={styles.sidebarHeader}>
                    <Link to="/admin" style={{ color: '#888', textDecoration: 'none', fontSize: '0.9rem' }}>
                        ← Back to Admin
                    </Link>
                    <span style={{ color: 'var(--neon-gold)', fontWeight: 'bold' }}>EDITOR</span>
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
                </div>

                <div style={styles.panelContent}>
                    {activePanel === 'inspector' && (
                        <>
                            {selectedSection ? (
                                <>
                                    <h3 style={{ margin: '0 0 15px', color: 'var(--neon-green)' }}>
                                        {componentRegistry[selectedSection.type]?.label || selectedSection.type}
                                    </h3>

                                    {/* Render inputs based on schema */}
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
                                        </div>
                                    ))}

                                    {/* Section actions */}
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

                    {activePanel === 'add' && (
                        <>
                            <h3 style={{ margin: '0 0 15px', color: 'var(--neon-green)' }}>Add Component</h3>
                            {getAvailableComponents().map(comp => (
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
                        </>
                    )}
                </div>
            </div>

            {/* Canvas */}
            <div style={styles.canvas}>
                <div style={styles.canvasInner}>
                    <DynamicRenderer
                        sections={pageData?.sections || []}
                        isEditing={true}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                    />
                </div>
            </div>

            {/* Floating Toolbar */}
            <div style={styles.toolbar}>
                <button
                    style={{ ...styles.btn, ...styles.btnPrimary }}
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? 'Saving...' : '💾 Save Page'}
                </button>
                <Link to="/" target="_blank" style={{ ...styles.btn, ...styles.btnSecondary, textDecoration: 'none' }}>
                    👁 Preview Live
                </Link>
            </div>
        </div>
    );
};

export default Editor;
