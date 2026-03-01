import { createContext, useContext, useState, useEffect } from 'react'
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'

const SiteContext = createContext({})

export function useSite() {
  return useContext(SiteContext)
}

// Default site configuration
const DEFAULT_SITE = {
  title: 'Sand Gallery',
  description: 'A powerful visual platform',
  logo: null,
  theme: 'dark',
  pages: [
    {
      id: 'home',
      path: '/',
      name: 'Home',
      components: [
        {
          id: 'hero-1',
          type: 'HeroSection',
          props: {
            title: 'Welcome to Sand Gallery',
            subtitle: 'A powerful visual platform',
            cta: 'Explore Gallery',
          },
        },
      ],
    },
  ],
}

export function SiteProvider({ children }) {
  const [site, setSite] = useState(DEFAULT_SITE)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load site config from Firestore
    const siteRef = doc(db, 'site', 'config')
    const unsubscribe = onSnapshot(siteRef, (snap) => {
      if (snap.exists()) {
        setSite(snap.data())
      }
      setLoading(false)
    }, (error) => {
      console.error('Error loading site:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const updateSite = async (updates) => {
    try {
      await setDoc(doc(db, 'site', 'config'), updates, { merge: true })
    } catch (error) {
      console.error('Error updating site:', error)
    }
  }

  const getPage = (path) => {
    return site.pages?.find(p => p.path === path) || null
  }

  const value = {
    site,
    loading,
    updateSite,
    getPage,
  }

  return (
    <SiteContext.Provider value={value}>
      {children}
    </SiteContext.Provider>
  )
}
