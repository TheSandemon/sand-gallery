import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeSwitcher = ({ isMobile = false }) => {
  const { theme, toggleTheme, themes } = useTheme();

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
      </div>
    );
  }

  return (
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
  );
};

export default ThemeSwitcher;
