import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { db } from '../firebase';

const useMediaLibrary = (initialFilter = 'all') => {
    const [mediaItems, setMediaItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        // Base query: order by createdAt descending
        let q = query(collection(db, 'media'), orderBy('createdAt', 'desc'), limit(100));

        // If filtering by type (e.g., 'video', 'image'), add where clause
        // Note: Requires composite index in Firestore if combined with orderBy
        if (initialFilter !== 'all') {
            q = query(
                collection(db, 'media'),
                where('type', '==', initialFilter),
                orderBy('createdAt', 'desc'),
                limit(100)
            );
        }

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const items = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setMediaItems(items);
                setLoading(false);
            },
            (err) => {
                console.error("Error fetching media library:", err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [initialFilter]);

    return { mediaItems, loading, error };
};

export default useMediaLibrary;
