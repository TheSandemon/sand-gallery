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
            if (currentUser) {
                // CRM Sync: Check if user exists in Firestore
                const userRef = doc(db, 'users', currentUser.uid);
                const userSnap = await getDoc(userRef);

                let userData = userSnap.data();

                if (!userSnap.exists()) {
                    // Create new user in CRM
                    userData = {
                        uid: currentUser.uid,
                        email: currentUser.email,
                        displayName: currentUser.displayName,
                        photoURL: currentUser.photoURL,
                        role: 'user', // Default role
                        createdAt: serverTimestamp(),
                    };
                    await setDoc(userRef, userData);
                } else {
                    // Merge Firestore role/data with Auth data
                    userData = {
                        ...userData,
                        // Ensure we have latest auth profile data if needed, or prefer Firestore?
                        // Usually keeping auth data fresh is good, but let's stick to the request:
                        // "Fetch their latest data ... and merge it"
                    }
                }

                // Combine Auth object with Firestore data (role)
                setUser({
                    ...currentUser,
                    ...userData
                });
            } else {
                setUser(null);
            }
            setLoading(false);
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
