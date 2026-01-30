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
    serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            try {
                if (currentUser) {
                    // CRM Sync: Check if user exists in Firestore
                    const userRef = doc(db, 'users', currentUser.uid);
                    const userSnap = await getDoc(userRef);

                    let userData = userSnap.data() || {};

                    if (!userSnap.exists()) {
                        // Create new user in CRM
                        userData = {
                            uid: currentUser.uid,
                            email: currentUser.email,
                            displayName: currentUser.displayName,
                            photoURL: currentUser.photoURL,
                            role: 'user', // Default role
                            credits: 10,   // Starting credits
                            createdAt: serverTimestamp(),
                        };
                        await setDoc(userRef, userData);
                    }

                    // Combine Auth object with Firestore data (role)
                    const finalUser = {
                        uid: currentUser.uid,
                        email: currentUser.email,
                        displayName: currentUser.displayName,
                        photoURL: currentUser.photoURL,
                        ...userData
                    };
                    console.log("Setting user:", finalUser);
                    alert("User logged in: " + finalUser.displayName);
                    setUser(finalUser);
                } else {
                    console.log("No user, setting null");
                    setUser(null);
                }
            } catch (error) {
                console.error("CRM Sync Error:", error);
                // Fallback: Set user with just Auth data if Firestore fails
                if (currentUser) {
                    setUser({
                        uid: currentUser.uid,
                        email: currentUser.email,
                        displayName: currentUser.displayName,
                        photoURL: currentUser.photoURL,
                        role: 'user'
                    });
                }
            } finally {
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    const value = {
        user,
        signInWithGoogle,
        logout,
        loading
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
