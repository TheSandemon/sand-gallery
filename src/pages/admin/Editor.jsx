import React, { useState, useEffect, useCallback, useRef } from 'react';
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

const AUTO_SAVE_DELAY = 30000; // 30 seconds
const MAX_HISTORY = 50;

const Editor = () => {
    const { user } = useAuth();
    const isMobile = useIsMobile();
    const [activePageId, setActivePageId] = useState('home');
    const [pageData, setPageData] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    // Undo/Redo history
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Refs for cleanup
    const autoSaveTimeoutRef = useRef(null);
    const originalPageDataRef = useRef(null);

    // Save to history when pageData changes
    const saveToHistory = useCallback((newPageData) => {
        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1);
            newHistory.push(JSON.stringify(newPageData));
            if (newHistory.length > MAX_HISTORY) {
                newHistory.shift();
                return newHistory;
            }
            return newHistory;
        });
        setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
        setHasUnsavedChanges(true);
    }, [historyIndex]);

    // Undo action
    const undo = useCallback(() => {
        if (historyIndex > 0) {
            const prevData = JSON.parse(history[historyIndex - 1]);
            setPageData(prevData);
            setHistoryIndex(prev => prev - 1);
            setHasUnsavedChanges(true);
        }
    }, [historyIndex, history]);

    // Redo action
    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const nextData = JSON.parse(history[historyIndex + 1]);
            setPageData(nextData);
            setHistoryIndex(prev => prev + 1);
            setHasUnsavedChanges(true);
        }
    }, [historyIndex, history]);

    // Auto-save function
    const autoSave = useCallback(async () => {
        if (!pageData || !hasUnsavedChanges || saving) return;
        setSaving(true);
        try {
            await setDoc(doc(db, 'pages', activePageId), pageData);
            setHasUnsavedChanges(false);
            setLastSaved(new Date());
        } catch (err) {
            console.error('Auto-save failed:', err);
        }
        setSaving(false);
    }, [pageData, hasUnsavedChanges, saving, activePageId]);

    // Set up auto-save timer
    useEffect(() => {
        if (hasUnsavedChanges && pageData) {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
            autoSaveTimeoutRef.current = setTimeout(autoSave, AUTO_SAVE_DELAY);
        }
        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, [hasUnsavedChanges, autoSave, pageData]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ctrl+S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
            // Ctrl+Z to undo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
            }
            // Ctrl+Y or Ctrl+Shift+Z to redo
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                redo();
            }
            // Delete to remove selected section
            if (e.key === 'Delete' && selectedId) {
                e.preventDefault();
                deleteSection(selectedId);
            }
            // Escape to deselect
            if (e.key === 'Escape') {
                setSelectedId(null);
            }
            // Arrow keys for reordering
            if (e.key === 'ArrowUp' && selectedId) {
                e.preventDefault();
                moveSection('up');
            }
            if (e.key === 'ArrowDown' && selectedId) {
                e.preventDefault();
                moveSection('down');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo, selectedId]);

    // Fetch page data when activePageId changes
    useEffect(() => {
        const fetchPageData = async () => {
            setLoading(true);
            setSelectedId(null);
            setHistory([]);
            setHistoryIndex(-1);
            setHasUnsavedChanges(false);
            try {
                const docRef = doc(db, 'pages', activePageId);
                const snapshot = await getDoc(docRef);
                let data;
                if (snapshot.exists()) {
                    data = snapshot.data();
                    setPageData(data);
                    originalPageDataRef.current = JSON.stringify(data);
                } else {
                    data = getDefaultPageData(activePageId);
                    setPageData(data);
                    originalPageDataRef.current = JSON.stringify(data);
                }
                // Initialize history with current state
                setHistory([JSON.stringify(data)]);
                setHistoryIndex(0);
            } catch (err) {
                console.error('Editor: Error loading page data', err);
                const data = getDefaultPageData(activePageId);
                setPageData(data);
                setHistory([JSON.stringify(data)]);
                setHistoryIndex(0);
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
        const newData = {
            ...pageData,
            sections: pageData.sections.map(s =>
                s.id === selectedId
                    ? { ...s, props: { ...s.props, [propName]: value } }
                    : s
            )
        };
        setPageData(newData);
        saveToHistory(newData);
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

        const newData = {
            ...pageData,
            sections: [...(pageData.sections || []), newSection],
        };
        setPageData(newData);
        saveToHistory(newData);
        setSelectedId(newSection.id);
    };

    // Delete section by ID
    const deleteSection = (sectionId = selectedId) => {
        if (!sectionId || !pageData) return;
        if (!window.confirm('Delete this section?')) return;
        const newData = {
            ...pageData,
            sections: pageData.sections.filter(s => s.id !== sectionId),
        };
        setPageData(newData);
        saveToHistory(newData);
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
        const newData = { ...pageData, sections: newSections };
        setPageData(newData);
        saveToHistory(newData);
    };

    // Handle layout changes from GridEditorCanvas
    const handleLayoutChange = (layoutMap) => {
        const newData = {
            ...pageData,
            sections: pageData.sections.map(s => ({
                ...s,
                layout: layoutMap[s.id] || s.layout,
            })),
        };
        setPageData(newData);
        saveToHistory(newData);
    };

    // Save to Firestore
    const handleSave = async () => {
        if (!pageData) return;
        setSaving(true);
        try {
            await setDoc(doc(db, 'pages', activePageId), pageData);
            setHasUnsavedChanges(false);
            setLastSaved(new Date());
            // Update original data reference
            originalPageDataRef.current = JSON.stringify(pageData);
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
                hasUnsavedChanges={hasUnsavedChanges}
                onSave={handleSave}
                saving={saving}
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
                hasUnsavedChanges={hasUnsavedChanges}
                lastSaved={lastSaved}
            />
        </div>
    );
};

export default Editor;
