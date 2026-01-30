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
                    setUser({
                        uid: currentUser.uid,
                        email: currentUser.email,
                        displayName: currentUser.displayName,
                        photoURL: currentUser.photoURL,
                        ...userData
                    });
                } else {
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
            {!loading && children}
        </AuthContext.Provider>
    );
};
