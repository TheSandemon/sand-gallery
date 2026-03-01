import { createContext, useContext, useState, useEffect } from 'react'
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

const AuthContext = createContext({})

export function useAuth() {
  return useContext(AuthContext)
}

// Default credits for new users
const STARTER_CREDITS = 100

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        // Fetch user profile from Firestore
        const profileRef = doc(db, 'users', firebaseUser.uid)
        
        const unsubscribeProfile = onSnapshot(profileRef, (snap) => {
          if (snap.exists()) {
            setProfile({ id: snap.id, ...snap.data() })
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
            }
            setDoc(profileRef, newProfile).then(() => {
              setProfile(newProfile)
            })
          }
        })

        // Update last seen
        updateDoc(profileRef, { lastSeen: new Date().toISOString() }).catch(() => {})

        return () => unsubscribeProfile()
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const addCredits = async (amount) => {
    if (!profile) return
    const newCredits = (profile.credits || 0) + amount
    await updateDoc(doc(db, 'users', profile.uid), { credits: newCredits })
  }

  const useCredits = async (amount) => {
    if (!profile) return false
    if ((profile.credits || 0) < amount) return false
    const newCredits = profile.credits - amount
    await updateDoc(doc(db, 'users', profile.uid), { credits: newCredits })
    return true
  }

  const value = {
    user,
    profile,
    loading,
    signInWithGoogle,
    logout,
    addCredits,
    useCredits,
    isAdmin: profile?.role === 'admin' || profile?.role === 'owner',
    isOwner: profile?.role === 'owner',
    isEditor: profile?.role === 'editor' || profile?.role === 'admin' || profile?.role === 'owner',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
