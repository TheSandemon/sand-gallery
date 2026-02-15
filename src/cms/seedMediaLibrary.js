import { doc, getDoc, collection, addDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

export const seedMediaLibrary = async () => {
    try {
        console.log("Starting Media Library Migration...");
        const batch = writeBatch(db);
        const mediaRef = collection(db, 'media');

        // 1. Fetch existing Gallery Page Data
        const galleryDocRef = doc(db, 'pages', 'gallery');
        const gallerySnap = await getDoc(galleryDocRef);

        let newItems = [];

        if (gallerySnap.exists()) {
            const data = gallerySnap.data();
            const gridSection = data.sections?.find(s => s.type === 'GalleryGrid');

            if (gridSection && gridSection.props.categories) {
                console.log("Found GalleryGrid categories:", gridSection.props.categories.length);

                gridSection.props.categories.forEach(cat => {
                    if (cat.items) {
                        cat.items.forEach(item => {
                            newItems.push({
                                title: item.name || 'Untitled',
                                description: item.description || '',
                                url: item.src || '', // Assuming 'src' or similar
                                type: cat.id === 'games' ? 'game' : (item.type || 'image'),
                                tags: [cat.title, 'Legacy'],
                                createdAt: new Date().toISOString(),
                                aspectRatio: 1.5, // Default
                            });
                        });
                    }
                });
            }
        }

        // 2. Add some fresh Sample Data if migration yield is low
        if (newItems.length < 5) {
            console.log("Adding sample data...");
            newItems.push(
                {
                    title: "Neon Cityscape",
                    type: "image",
                    url: "https://images.unsplash.com/photo-1515630278258-407f66498911",
                    tags: ["Cyberpunk", "City", "Night"],
                    aspectRatio: 1.5
                },
                {
                    title: "Abstract Flow",
                    type: "video",
                    url: "https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-particle-background-2775-large.mp4",
                    tags: ["Abstract", "Loop", "3D"],
                    aspectRatio: 1.77
                },
                {
                    title: "Forest Rain",
                    type: "audio",
                    url: "https://assets.mixkit.co/sfx/preview/mixkit-forest-rain-1234.mp3",
                    tags: ["Nature", "Ambient", "Relax"],
                    aspectRatio: 1
                }
            );
        }

        // 3. Write Media Items to Firestore
        console.log("Writing items to Firestore...");
        const validItems = newItems.filter(item => item.url); // Ensure valid

        // Use batch if < 500
        const mediaBatch = writeBatch(db);
        validItems.forEach(item => {
            const newRef = doc(collection(db, 'media'));
            mediaBatch.set(newRef, {
                ...item,
                createdAt: new Date().toISOString()
            });
        });
        await mediaBatch.commit();

        // 4. Update Gallery Page Layout to use new Explorer
        console.log("Updating Gallery Page Layout...");
        await updateDoc(galleryDocRef, {
            sections: [
                {
                    id: 'gallery-explorer-main',
                    type: 'GalleryExplorer', // This must match registry key
                    props: {},
                    layout: { x: 0, y: 0, w: 12, h: 20 }
                }
            ]
        });

        console.log(`Successfully migrated ${validItems.length} items and updated page layout.`);
        return { success: true, count: validItems.length };

    } catch (error) {
        console.error("Migration failed:", error);
        return { success: false, error };
    }
};
