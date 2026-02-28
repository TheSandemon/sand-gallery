import { useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { getDefaultPageData } from '../cms/initialData';

/**
 * usePageContent - Custom hook to fetch CMS page data from Firestore.
 * 
 * @param {string} pageId - The page ID (e.g., 'home', 'pricing', 'studio')
 * @param {Object} options - Options object
 * @param {boolean} options.realtime - If true, use onSnapshot for real-time updates (default: true for editor mode)
 * @returns {Object} { data, loading, error }
 */
const usePageContent = (pageId, options = {}) => {
    const { realtime = true } = options;
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

        // Use getDoc for static pages (better performance - single fetch)
        // Use onSnapshot only when real-time updates are needed (editor mode)
        if (!realtime) {
            const fetchData = async () => {
                try {
                    const snapshot = await getDoc(docRef);
                    if (snapshot.exists()) {
                        setData(snapshot.data());
                    } else {
                        console.log(`CMS: Page "${pageId}" not found in Firestore, using default data.`);
                        setData(getDefaultPageData(pageId));
                    }
                    setLoading(false);
                } catch (err) {
                    console.error('CMS: Error fetching page data:', err);
                    setError(err);
                    setData(getDefaultPageData(pageId));
                    setLoading(false);
                }
            };
            fetchData();
            return;
        }

        // Real-time listener for editor mode
        const unsubscribe = onSnapshot(docRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    setData(snapshot.data());
                } else {
                    console.log(`CMS: Page "${pageId}" not found in Firestore, using default data.`);
                    setData(getDefaultPageData(pageId));
                }
                setLoading(false);
            },
            (err) => {
                console.error('CMS: Error fetching page data:', err);
                setError(err);
                setData(getDefaultPageData(pageId));
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [pageId, realtime]);

    return { data, loading, error };
};

export default usePageContent;
