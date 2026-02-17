import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Sparkles, Zap, Terminal, Cloud, Moon, Palette } from 'lucide-react';

/**
 * Theme definitions with Lucide icons
 * Matches THEMES from ThemeContext.jsx
 */
const THEMES = [
    { id: 'glass-horizon', label: 'HORIZON', icon: Cloud, color: '#3b82f6' },
    { id: 'zinc-default', label: 'ZINC', icon: Sparkles, color: '#888888' },
    { id: 'cyber-neon', label: 'NEON', icon: Zap, color: '#00ff88' },
    { id: 'brutalist-paper', label: 'PAPER', icon: Sun, color: '#f5f5dc' },
    { id: 'midnight-terminal', label: 'TERMINAL', icon: Terminal, color: '#00ff41' },
    { id: 'aurora-noir', label: 'AURORA', icon: Moon, color: '#8b5cf6' },
    { id: 'tokyo-streets', label: 'TOKYO', icon: Palette, color: '#ff2d55' },
];

/**
 * Desktop theme toggle - inline buttons
 */
const ThemeToggleDesktop = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="flex bg-[var(--text-primary)]/5 p-1 rounded-lg border border-[var(--text-primary)]/10 shadow-[var(--border-glow)]">
            {THEMES.map((t) => {
                const Icon = t.icon;
                const isActive = theme === t.id;
                
                return (
                    <button
                        key={t.id}
                        onClick={() => toggleTheme(t.id)}
                        title={t.label}
                        aria-label={`Switch to ${t.label} theme`}
                        className={`p-2 rounded-md transition-all duration-200 text-sm flex items-center justify-center
                            ${isActive 
                                ? 'bg-[var(--text-primary)]/10 text-[var(--text-primary)]' 
                                : 'text-[var(--text-dim)] hover:text-[var(--text-primary)]'
                            }`}
                        style={isActive ? { color: t.color } : {}}
                    >
                        <Icon size={16} />
                    </button>
                );
            })}
        </div>
    );
};

/**
 * Mobile theme toggle - larger touch targets
 */
const ThemeToggleMobile = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="flex flex-wrap bg-[var(--text-primary)]/5 p-2 rounded-lg border border-[var(--text-primary)]/10 justify-center gap-1">
            {THEMES.map((t) => {
                const Icon = t.icon;
                const isActive = theme === t.id;
                
                return (
                    <button
                        key={t.id}
                        onClick={() => toggleTheme(t.id)}
                        aria-label={`Switch to ${t.label} theme`}
                        className={`px-3 py-2 rounded-md transition-all duration-200 font-bold flex items-center gap-2 text-xs
                            ${isActive 
                                ? 'bg-[var(--text-primary)]/10 text-[var(--text-primary)]' 
                                : 'text-[var(--text-dim)]'
                            }`}
                        style={isActive ? { color: t.color } : {}}
                    >
                        <Icon size={12} />
                        {t.label}
                    </button>
                );
            })}
        </div>
    );
};

export { ThemeToggleDesktop, ThemeToggleMobile, THEMES };
export default ThemeToggleDesktop;
