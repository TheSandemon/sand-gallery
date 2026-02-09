import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { getDefaultPageData } from '../cms/initialData';

/**
 * usePageContent - Custom hook to fetch real-time CMS page data from Firestore.
 * Falls back to default data if Firestore document doesn't exist.
 * 
 * @param {string} pageId - The page ID (e.g., 'home', 'pricing', 'studio')
 * @returns {Object} { data, loading, error }
 */
const usePageContent = (pageId) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!pageId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const docRef = doc(db, 'pages', pageId);

        const unsubscribe = onSnapshot(docRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    setData(snapshot.data());
                } else {
                    // Use default data if page doesn't exist in Firestore
                    console.log(`CMS: Page "${pageId}" not found in Firestore, using default data.`);
                    setData(getDefaultPageData(pageId));
                }
                setLoading(false);
            },
            (err) => {
                console.error('CMS: Error fetching page data:', err);
                setError(err);
                setLoading(false);
                // Still fall back to defaults on error
                setData(getDefaultPageData(pageId));
            }
        );

        return () => unsubscribe();
    }, [pageId]);

    return { data, loading, error };
};

export default usePageContent;
