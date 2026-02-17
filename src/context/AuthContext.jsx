import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    increment,
    serverTimestamp,
    collection,
    getDocs
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [firebaseReady, setFirebaseReady] = useState(false);

    useEffect(() => {
        // Check if Firebase is configured
        if (!isFirebaseConfigured()) {
            console.warn("Firebase not configured - running in demo mode");
            setLoading(false);
            return;
        }

        setFirebaseReady(true);

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                setUser(null);
                setLoading(false);
                return;
            }

            // 1. Set user IMMEDIATELY with Auth data to hide loading screen faster
            setUser({
                uid: currentUser.uid,
                email: currentUser.email,
                displayName: currentUser.displayName,
                photoURL: currentUser.photoURL,
                role: 'user', // Default temporary role
                credits: 0
            });
            setLoading(false);

            // 2. Background Sync: Fetch the rest of the CRM data from Firestore
            try {
                const userRef = doc(db, 'users', currentUser.uid);
                const userSnap = await getDoc(userRef);

                let userData = userSnap.data() || {};

                if (!userSnap.exists()) {
                    userData = {
                        uid: currentUser.uid,
                        email: currentUser.email,
                        displayName: currentUser.displayName,
                        photoURL: currentUser.photoURL,
                        role: 'user',
                        credits: 10,
                        createdAt: serverTimestamp(),
                    };
                    await setDoc(userRef, userData);
                }

                // 3. Update state in background once Firestore data arrives
                setUser(prev => ({
                    ...prev,
                    ...userData
                }));
            } catch (error) {
                console.error("Background CRM Sync Error:", error);
            }
        });

        return unsubscribe;
    }, []);

    const signInWithGoogle = async () => {
        if (!isFirebaseConfigured()) {
            alert("Firebase not configured. Please set up environment variables.");
            return;
        }
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error creating user", error);
            alert("Sign-In Error: " + error.message);
        }
    };

    const logout = () => signOut(auth);

    const deductCredits = async (amount) => {
        if (!user) return false;
        if (!isFirebaseConfigured()) {
            console.warn("Firebase not configured - demo mode");
            return true; // Allow in demo mode
        }
        if ((user.credits || 0) < amount) {
            alert("Insufficient credits!");
            return false;
        }

        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                credits: increment(-amount)
            });

            // Optimistic update for immediate UI feedback
            setUser(prev => ({
                ...prev,
                credits: (prev.credits || 0) - amount
            }));
            return true;
        } catch (error) {
            console.error("Error deducting credits:", error);
            return false;
        }
    };

    const grantCredits = async (targetUid, amount) => {
        if (!isFirebaseConfigured()) {
            console.warn("Firebase not configured - demo mode");
            return true;
        }
        try {
            const userRef = doc(db, 'users', targetUid);
            await updateDoc(userRef, {
                credits: increment(amount)
            });
            return true;
        } catch (error) {
            console.error("Error granting credits:", error);
            alert("Failed to grant credits: " + error.message);
            return false;
        }
    };

    const getAllUsers = async () => {
        if (!isFirebaseConfigured()) {
            console.warn("Firebase not configured - demo mode");
            return [];
        }
        try {
            const usersRef = collection(db, 'users');
            const snapshot = await getDocs(usersRef);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching users:", error);
            return [];
        }
    };

    const value = {
        user,
        signInWithGoogle,
        logout,
        deductCredits,
        grantCredits,
        getAllUsers,
        loading,
        firebaseReady
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div style={{
                    height: '100vh',
                    width: '100vw',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#0a0a0a',
                    color: 'var(--neon-green)',
                    fontFamily: 'var(--font-main)'
                }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', letterSpacing: '0.1em' }}>
                        INITIALIZING <span style={{ color: 'var(--neon-gold)' }}>SAND.GALLERY</span>
                    </div>
                    <div style={{ width: '200px', height: '2px', background: 'rgba(0, 143, 78, 0.2)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{
                            position: 'absolute',
                            width: '50%',
                            height: '100%',
                            background: 'var(--neon-green)',
                            animation: 'loading-bar 1.5s infinite ease-in-out'
                        }} />
                    </div>
                    <style>{`
                        @keyframes loading-bar {
                            0% { left: -50%; }
                            100% { left: 100%; }
                        }
                    `}</style>
                </div>
            ) : children}
        </AuthContext.Provider>
    );
};
