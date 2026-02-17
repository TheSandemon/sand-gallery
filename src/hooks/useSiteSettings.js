import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';

/**
 * Default site settings used when no Firestore data exists.
 */
const DEFAULT_SETTINGS = {
    siteTitle: 'SAND.GALLERY',
    footerText: '© 2026 SAND.GALLERY',
    showHiddenPages: false,
    navLinks: [
        { label: 'WORK', path: '/' },
        { label: 'STUDIO', path: '/studio', hidden: true },
        { label: 'PRICING', path: '/pricing', hidden: true },
        { label: 'PROFILE', path: '/profile' },
    ],
};

/**
 * Hook to subscribe to and update global site settings from Firestore.
 * @returns {{ settings: object, loading: boolean, updateSettings: function }}
 */
const useSiteSettings = () => {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // If Firebase is not configured, use default settings immediately
        if (!isFirebaseConfigured() || !db) {
            console.log('[useSiteSettings] Firebase not configured, using defaults');
            setSettings(DEFAULT_SETTINGS);
            setLoading(false);
            return;
        }

        try {
            const docRef = doc(db, 'config', 'site_settings');
            const unsubscribe = onSnapshot(docRef, (snapshot) => {
                if (snapshot.exists()) {
                    setSettings({ ...DEFAULT_SETTINGS, ...snapshot.data() });
                } else {
                    setSettings(DEFAULT_SETTINGS);
                }
                setLoading(false);
            }, (error) => {
                console.error('useSiteSettings: Firestore error', error);
                setSettings(DEFAULT_SETTINGS);
                setLoading(false);
            });

            return () => unsubscribe();
        } catch (error) {
            console.error('useSiteSettings: Setup error', error);
            setSettings(DEFAULT_SETTINGS);
            setLoading(false);
        }
    }, []);

    /**
     * Update site settings in Firestore.
     * @param {object} newSettings - Partial settings object to merge.
     */
    const updateSettings = useCallback(async (newSettings) => {
        try {
            const docRef = doc(db, 'config', 'site_settings');
            await setDoc(docRef, newSettings, { merge: true });
        } catch (error) {
            console.error('useSiteSettings: Error updating settings', error);
            throw error;
        }
    }, []);

    return { settings, loading, updateSettings };
};

export default useSiteSettings;
