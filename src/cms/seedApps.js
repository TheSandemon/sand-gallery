import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const seedApps = async () => {
    const apps = [
        {
            id: 'mushroom-runner',
            name: 'Mushroom Runner',
            description: 'A retro-style side-scrolling platformer where you collect green mushrooms and dodge red ones.',
            icon: '🍄',
            componentKey: 'MushroomRunnerGame',
            version: '1.0.0',
            category: 'Games',
            author: 'Sand Gallery',
        }
    ];

    try {
        for (const app of apps) {
            await setDoc(doc(db, 'app_packages', app.id), app);
            console.log(`Seeded app: ${app.name}`);
        }
        return { success: true, count: apps.length };
    } catch (error) {
        console.error('Error seeding apps:', error);
        return { success: false, error };
    }
};
