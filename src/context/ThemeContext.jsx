import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// Available themes - glass-horizon is now DEFAULT
export const THEMES = [
  { id: 'glass-horizon', label: 'HORIZON', icon: '🔵', description: 'Modern glass SaaS aesthetic (DEFAULT)' },
  { id: 'zinc-default', label: 'ZINC', icon: '💎', description: 'Default dark theme' },
  { id: 'cyber-neon', label: 'NEON', icon: '⚡', description: 'Cyberpunk neon aesthetic' },
  { id: 'brutalist-paper', label: 'PAPER', icon: '📜', description: 'Light brutalist style' },
  { id: 'midnight-terminal', label: 'TERMINAL', icon: '🟢', description: 'Phosphor green CRT terminal' },
  { id: 'aurora-noir', label: 'AURORA', icon: '✨', accent: '#8b5cf6', description: 'Ethereal purple dream' },
  { id: 'tokyo-streets', label: 'TOKYO', icon: '⚡', accent: '#ff2d55', description: 'Cyberpunk red alert' },
];

// Dynamic theme loader - loads CSS on demand via Vite's dynamic import
const loadThemeCSS = async (themeId) => {
  if (themeId === 'glass-horizon') return; // Default is always loaded
  
  const themeImportMap = {
    'zinc-default': () => import('../themes/zinc-default.css?inline'),
    'cyber-neon': () => import('../themes/cyber-neon.css?inline'),
    'brutalist-paper': () => import('../themes/brutalist-paper.css?inline'),
    'midnight-terminal': () => import('../themes/midnight-terminal.css?inline'),
    'aurora-noir': () => import('../themes/aurora-noir.css?inline'),
    'tokyo-streets': () => import('../themes/tokyo-streets.css?inline'),
  };
  
  const loadTheme = themeImportMap[themeId];
  if (!loadTheme) return;
  
  // Check if already loaded (stored in sessionStorage)
  const loadedThemes = sessionStorage.getItem('loaded-themes') || '';
  if (loadedThemes.includes(themeId)) return;
  
  try {
    await loadTheme();
    // Mark as loaded
    sessionStorage.setItem('loaded-themes', loadedThemes + ',' + themeId);
    console.log('[Theme] Loaded CSS for:', themeId);
  } catch (err) {
    console.error('[Theme] Failed to load theme CSS:', err);
  }
};

// Get system preference for theme
const getSystemThemePreference = () => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'brutalist-paper' : 'glass-horizon';
  }
  return 'glass-horizon';
};

// Get saved theme or use system preference
const getInitialTheme = () => {
  const saved = localStorage.getItem('antigravity-theme');
  console.log('[Theme] Loading theme from localStorage:', saved || 'none (using system preference)');
  if (saved && THEMES.find(t => t.id === saved)) {
    return saved;
  }
  return getSystemThemePreference();
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('antigravity-theme', theme);
    console.log('[Theme] Applied theme:', theme);
    
    // Dynamically load theme CSS
    loadThemeCSS(theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
      const handleChange = (e) => {
        // Only auto-switch if user hasn't manually selected a theme
        const saved = localStorage.getItem('antigravity-theme');
        if (!saved) {
          const newTheme = e.matches ? 'brutalist-paper' : 'glass-horizon';
          document.documentElement.setAttribute('data-theme', newTheme);
        }
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  const toggleTheme = (newTheme) => {
    console.log('[Theme] Toggle requested:', newTheme);
    if (THEMES.find(t => t.id === newTheme)) {
      setTheme(newTheme);
    } else {
      console.warn('[Theme] Unknown theme:', newTheme);
    }
  };

  // Helper to reset to default
  const resetToDefault = () => {
    setTheme(getSystemThemePreference());
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, themes: THEMES, resetToDefault }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
