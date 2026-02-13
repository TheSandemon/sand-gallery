import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { componentRegistry } from '../../cms/registry';
import { getDefaultPageData } from '../../cms/initialData';
import { getPageById } from '../../cms/pageRegistry';

import EditorSidebar from '../../components/editor/EditorSidebar';
import GridEditorCanvas from '../../components/editor/GridEditorCanvas';
import EditorToolbar from '../../components/editor/EditorToolbar';
import { Monitor } from 'lucide-react';

// Mobile detection hook
const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 1024);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);
    return isMobile;
};

const Editor = () => {
    const { user } = useAuth();
    const isMobile = useIsMobile();
    const [activePageId, setActivePageId] = useState('home');
    const [pageData, setPageData] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Fetch page data when activePageId changes
    useEffect(() => {
        const fetchPageData = async () => {
            setLoading(true);
            setSelectedId(null);
            try {
                const docRef = doc(db, 'pages', activePageId);
                const snapshot = await getDoc(docRef);
                if (snapshot.exists()) {
                    setPageData(snapshot.data());
                } else {
                    setPageData(getDefaultPageData(activePageId));
                }
            } catch (err) {
                console.error('Editor: Error loading page data', err);
                setPageData(getDefaultPageData(activePageId));
            }
            setLoading(false);
        };
        fetchPageData();
    }, [activePageId]);

    const currentPage = getPageById(activePageId);
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

    // Add a new section
    const addSection = (componentType, initialProps = {}) => {
        const registryEntry = componentRegistry[componentType];
        if (!registryEntry) return;

        const newSection = {
            id: `section-${Date.now()}`,
            type: componentType,
            props: { ...registryEntry.defaultProps, ...initialProps },
            styles: {},
            layout: {
                x: 0,
                y: Infinity,
                w: 12,
                h: componentType === 'AppPackage' ? 6 : 2
            },
        };

        setPageData(prev => ({
            ...prev,
            sections: [...(prev.sections || []), newSection],
        }));
        setSelectedId(newSection.id);
    };

    // Delete section by ID
    const deleteSection = (sectionId = selectedId) => {
        if (!sectionId || !pageData) return;
        if (!window.confirm('Delete this section?')) return;
        setPageData(prev => ({
            ...prev,
            sections: prev.sections.filter(s => s.id !== sectionId),
        }));
        if (selectedId === sectionId) setSelectedId(null);
    };

    // Move section up/down (legacy, still supported via sidebar)
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

    // Handle layout changes from GridEditorCanvas
    const handleLayoutChange = (layoutMap) => {
        setPageData(prev => ({
            ...prev,
            sections: prev.sections.map(s => ({
                ...s,
                layout: layoutMap[s.id] || s.layout,
            })),
        }));
    };

    // Save to Firestore
    const handleSave = async () => {
        if (!pageData) return;
        setSaving(true);
        try {
            await setDoc(doc(db, 'pages', activePageId), pageData);
            alert(`${currentPage?.label || activePageId} saved successfully!`);
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

    // Mobile blocker
    if (isMobile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white p-8 text-center">
                <Monitor size={64} className="text-neon-green mb-6" />
                <h1 className="text-3xl font-bold mb-4">Desktop Only Feature</h1>
                <p className="text-gray-400 max-w-md">
                    The Website Editor requires a larger screen for the best experience.
                    Please access this page from a desktop or laptop computer.
                </p>
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

    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            background: '#0a0a0a',
        }}>
            <EditorSidebar
                activePageId={activePageId}
                setActivePageId={setActivePageId}
                selectedSection={selectedSection}
                updateSectionProp={updateSectionProp}
                addSection={addSection}
                deleteSection={() => deleteSection(selectedId)}
                moveSection={moveSection}
            />

            <GridEditorCanvas
                sections={pageData?.sections || []}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onLayoutChange={handleLayoutChange}
                onDeleteSection={deleteSection}
            />

            <EditorToolbar
                onSave={handleSave}
                saving={saving}
                previewRoute={currentPage?.route}
                previewLabel={currentPage?.label}
            />
        </div>
    );
};

export default Editor;
