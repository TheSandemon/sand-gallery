import { doc, getDoc, collection, addDoc, updateDoc, writeBatch, setDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// Migration state for UI feedback
let migrationState = {
    isRunning: false,
    progress: 0,
    status: '',
    error: null
};

export const getMigrationState = () => ({ ...migrationState });

export const resetMigrationState = () => {
    migrationState = { isRunning: false, progress: 0, status: '', error: null };
};

// Backup current gallery data before migration
const backupGalleryData = async () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupRef = doc(db, 'backups', `gallery-${timestamp}`);
    const galleryDocRef = doc(db, 'pages', 'gallery');
    const snapshot = await getDoc(galleryDocRef);

    if (snapshot.exists()) {
        await setDoc(backupRef, {
            ...snapshot.data(),
            backupDate: new Date().toISOString(),
            backupType: 'pre-migration'
        });
        console.log("Gallery data backed up to:", backupRef.path);
        return { path: backupRef.path, timestamp };
    }
    return null;
};

// Get current gallery data for preview (dry run)
export const previewMigration = async () => {
    try {
        const galleryDocRef = doc(db, 'pages', 'gallery');
        const gallerySnap = await getDoc(galleryDocRef);

        if (!gallerySnap.exists()) {
            return { exists: false, itemCount: 0 };
        }

        const data = gallerySnap.data();
        const gridSection = data.sections?.find(s => s.type === 'GalleryGrid');

        let itemCount = 0;
        if (gridSection?.props?.categories) {
            gridSection.props.categories.forEach(cat => {
                if (cat.items) itemCount += cat.items.length;
            });
        }

        return { exists: true, itemCount, data: data.sections };
    } catch (error) {
        return { error: error.message };
    }
};

export const seedMediaLibrary = async ({ addSamples = true, updateLayout = true } = {}) => {
    if (migrationState.isRunning) {
        return { success: false, error: 'Migration already in progress' };
    }

    try {
        migrationState = { isRunning: true, progress: 0, status: 'Starting migration...', error: null };

        // 1. Create backup first
        migrationState.status = 'Creating backup...';
        const backup = await backupGalleryData();
        migrationState.progress = 10;

        // 2. Fetch existing Gallery Page Data
        migrationState.status = 'Reading gallery data...';
        const galleryDocRef = doc(db, 'pages', 'gallery');
        const gallerySnap = await getDoc(galleryDocRef);

        let newItems = [];

        if (gallerySnap.exists()) {
            const data = gallerySnap.data();
            const gridSection = data.sections?.find(s => s.type === 'GalleryGrid');

            if (gridSection && gridSection.props?.categories) {
                console.log("Found GalleryGrid categories:", gridSection.props.categories.length);

                gridSection.props.categories.forEach(cat => {
                    if (cat.items) {
                        cat.items.forEach(item => {
                            newItems.push({
                                title: item.name || 'Untitled',
                                description: item.description || '',
                                url: item.src || item.url || '',
                                type: cat.id === 'games' ? 'game' : (item.type || 'image'),
                                tags: [cat.title, 'Legacy'].filter(Boolean),
                                createdAt: new Date().toISOString(),
                                aspectRatio: item.aspectRatio || 1.5,
                            });
                        });
                    }
                });
            }
        }

        migrationState.progress = 30;

        // 3. Optionally add sample data if migration yield is low
        if (addSamples && newItems.length < 5) {
            migrationState.status = 'Adding sample data...';
            console.log("Adding sample data...");
            newItems.push(
                {
                    title: "Neon Cityscape",
                    type: "image",
                    url: "https://images.unsplash.com/photo-1515630278258-407f66498911?w=800",
                    tags: ["Cyberpunk", "City", "Night", "Sample"],
                    aspectRatio: 1.5
                },
                {
                    title: "Abstract Flow",
                    type: "video",
                    url: "https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-particle-background-2775-large.mp4",
                    tags: ["Abstract", "Loop", "3D", "Sample"],
                    aspectRatio: 1.77
                },
                {
                    title: "Forest Rain",
                    type: "audio",
                    url: "https://assets.mixkit.co/sfx/preview/mixkit-forest-rain-1234.mp3",
                    tags: ["Nature", "Ambient", "Relax", "Sample"],
                    aspectRatio: 1
                }
            );
        }

        migrationState.progress = 50;

        // 4. Write Media Items to Firestore
        migrationState.status = 'Writing media items...';
        console.log("Writing items to Firestore...");
        const validItems = newItems.filter(item => item.url);

        if (validItems.length > 0) {
            const mediaBatch = writeBatch(db);
            validItems.forEach(item => {
                const newRef = doc(collection(db, 'media'));
                mediaBatch.set(newRef, {
                    ...item,
                    createdAt: new Date().toISOString()
                });
            });
            await mediaBatch.commit();
        }

        migrationState.progress = 75;

        // 5. Update Gallery Page Layout to use new Explorer (only if requested)
        if (updateLayout) {
            migrationState.status = 'Updating gallery layout...';
            console.log("Updating Gallery Page Layout...");
            await updateDoc(galleryDocRef, {
                sections: [
                    {
                        id: 'gallery-explorer-main',
                        type: 'GalleryExplorer',
                        props: {},
                        layout: { x: 0, y: 0, w: 12, h: 20 }
                    }
                ]
            });
        }

        migrationState.progress = 100;
        migrationState.status = 'Complete!';

        console.log(`Successfully migrated ${validItems.length} items. Backup: ${backup?.path || 'none'}`);
        return {
            success: true,
            count: validItems.length,
            backup: backup,
            hasSamples: !addSamples && newItems.length < 5
        };

    } catch (error) {
        console.error("Migration failed:", error);
        migrationState = { isRunning: false, progress: 0, status: '', error: error.message };
        return { success: false, error: error.message };
    }
};
