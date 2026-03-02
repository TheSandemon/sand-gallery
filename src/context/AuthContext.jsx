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
    getDocs,
    onSnapshot
} from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Default credits for new users
const STARTER_CREDITS = 100;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const signInWithGoogle = async () => {
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
        if (!profile) return false;
        if ((profile.credits || 0) < amount) {
            alert("Insufficient credits!");
            return false;
        }

        try {
            const userRef = doc(db, 'users', profile.uid);
            await updateDoc(userRef, {
                credits: increment(-amount)
            });
            return true;
        } catch (error) {
            console.error("Error deducting credits:", error);
            return false;
        }
    };

    const grantCredits = async (targetUid, amount) => {
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

    const addCredits = async (amount) => {
        if (!profile) return;
        const newCredits = (profile.credits || 0) + amount;
        await updateDoc(doc(db, 'users', profile.uid), { credits: newCredits });
    };

    const useCredits = async (amount) => {
        if (!profile) return false;
        if ((profile.credits || 0) < amount) return false;
        const newCredits = profile.credits - amount;
        await updateDoc(doc(db, 'users', profile.uid), { credits: newCredits });
        return true;
    };

    const getAllUsers = async () => {
        try {
            const usersRef = collection(db, 'users');
            const snapshot = await getDocs(usersRef);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching users:", error);
            return [];
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                // Fetch user profile from Firestore
                const profileRef = doc(db, 'users', firebaseUser.uid);

                const unsubscribeProfile = onSnapshot(profileRef, (snap) => {
                    if (snap.exists()) {
                        setProfile({ id: snap.id, ...snap.data() });
                    } else {
                        // Create new profile if doesn't exist
                        const newProfile = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
                            photoURL: firebaseUser.photoURL,
                            credits: STARTER_CREDITS,
                            role: 'user',
                            createdAt: new Date().toISOString(),
                            lastSeen: new Date().toISOString(),
                        };
                        setDoc(profileRef, newProfile).then(() => {
                            setProfile(newProfile);
                        });
                    }
                });

                // Update last seen
                updateDoc(profileRef, { lastSeen: new Date().toISOString() }).catch(() => {});

                return () => unsubscribeProfile();
            } else {
                setUser(null);
                setProfile(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const value = {
        user,
        profile,
        signInWithGoogle,
        logout,
        deductCredits,
        grantCredits,
        addCredits,
        useCredits,
        getAllUsers,
        loading,
        isAdmin: profile?.role === 'admin' || profile?.role === 'owner',
        isOwner: profile?.role === 'owner',
        isEditor: profile?.role === 'editor' || profile?.role === 'admin' || profile?.role === 'owner',
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
