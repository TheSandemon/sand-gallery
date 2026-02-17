import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeSwitcher = ({ isMobile = false }) => {
  const { theme, toggleTheme, themes, resetToDefault } = useTheme();

  // Extended themes with new theme packs
  const allThemes = [
    ...themes,
    { id: 'midnight-terminal', label: 'TERMINAL', icon: '🟢' },
    { id: 'glass-horizon', label: 'HORIZON', icon: '🔵' },
  ];

  if (isMobile) {
    return (
      <div className="flex flex-col items-center gap-6 scale-125">
        <div className="flex bg-[var(--text-primary)]/5 p-1 rounded-lg border border-[var(--text-primary)]/10 mb-4">
          {allThemes.map(t => (
            <button
              key={t.id}
              onClick={() => toggleTheme(t.id)}
              aria-label={`Switch to ${t.label} theme`}
              className={`px-3 py-2 rounded-md transition-all duration-200 font-bold text-xs ${theme === t.id ? 'bg-[var(--text-primary)]/10 text-[var(--text-primary)]' : 'text-[var(--text-dim)]'}`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        {/* Reset to default button */}
        <button
          onClick={resetToDefault}
          className="px-4 py-2 text-xs text-[var(--text-dim)] hover:text-[var(--text-primary)] underline"
        >
          Reset to Default
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex bg-[var(--text-primary)]/5 p-1 rounded-lg border border-[var(--text-primary)]/10 shadow-[var(--border-glow)]">
        {allThemes.map(t => (
          <button
            key={t.id}
            onClick={() => toggleTheme(t.id)}
            title={t.label}
            aria-label={`Switch to ${t.label} theme`}
            className={`p-2 rounded-md transition-all duration-200 text-sm ${theme === t.id ? 'bg-[var(--text-primary)]/10 text-[var(--text-primary)]' : 'text-[var(--text-dim)] hover:text-[var(--text-primary)]'}`}
          >
            {t.icon}
          </button>
        ))}
      </div>
      {/* Reset to default button */}
      <button
        onClick={resetToDefault}
        title="Reset to default theme"
        aria-label="Reset to default theme"
        className="p-2 text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  );
};

export default ThemeSwitcher;
