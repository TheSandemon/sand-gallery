import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

// Firebase configuration - requires environment variables to be set
// Copy .env.example to .env and fill in your values
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sand-gallery-lab.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate required config
const isConfigured = firebaseConfig.apiKey && firebaseConfig.projectId;

let app = null;
let auth = null;
let db = null;
let functions = null;
let storage = null;

if (isConfigured && getApps().length === 0) {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        functions = getFunctions(app);
        storage = getStorage(app);
        console.log("✅ Firebase initialized successfully");
    } catch (error) {
        console.error("❌ Firebase initialization failed:", error);
    }
} else if (!isConfigured) {
    console.warn("⚠️ Firebase not configured - missing environment variables");
    console.warn("Please copy .env.example to .env and fill in your Firebase credentials");
} else {
    console.log("✅ Firebase already initialized");
}

// Export null-safe - components should check for null before using
export { app, auth, db, functions, storage };
export const isFirebaseConfigured = () => isConfigured;
