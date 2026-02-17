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
 * Desktop theme toggle - compact inline buttons
 */
const ThemeToggleDesktop = () => {
    const { theme, toggleTheme, resetToDefault } = useTheme();

    return (
        <div className="flex items-center gap-1">
            <div className="flex items-center bg-[var(--text-primary)]/5 p-0.5 rounded-lg border border-[var(--text-primary)]/10">
                {THEMES.map((t) => {
                    const Icon = t.icon;
                    const isActive = theme === t.id;
                    
                    return (
                        <button
                            key={t.id}
                            onClick={() => toggleTheme(t.id)}
                            title={t.label}
                            aria-label={`Switch to ${t.label} theme`}
                            className={`p-1.5 rounded transition-all duration-200 text-xs flex items-center justify-center
                                ${isActive 
                                    ? 'bg-[var(--text-primary)]/15 text-[var(--text-primary)]' 
                                    : 'text-[var(--text-dim)] hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5'
                                }`}
                            style={isActive ? { color: t.color } : {}}
                        >
                            <Icon size={12} />
                        </button>
                    );
                })}
            </div>
            {/* Reset to default button - smaller icon only */}
            <button
                onClick={resetToDefault}
                title="Reset to default theme"
                aria-label="Reset to default theme"
                className="p-1.5 text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors rounded hover:bg-[var(--text-primary)]/5"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            </button>
        </div>
    );
};

/**
 * Mobile theme toggle - compact horizontal scroll
 */
const ThemeToggleMobile = () => {
    const { theme, toggleTheme, resetToDefault } = useTheme();

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1 bg-[var(--text-primary)]/5 p-1 rounded-lg border border-[var(--text-primary)]/10 overflow-x-auto max-w-full">
                {THEMES.map((t) => {
                    const Icon = t.icon;
                    const isActive = theme === t.id;
                    
                    return (
                        <button
                            key={t.id}
                            onClick={() => toggleTheme(t.id)}
                            aria-label={`Switch to ${t.label} theme`}
                            className={`p-2 rounded transition-all duration-200 flex items-center justify-center shrink-0
                                ${isActive 
                                    ? 'bg-[var(--text-primary)]/15 text-[var(--text-primary)]' 
                                    : 'text-[var(--text-dim)] hover:text-[var(--text-primary)]'
                                }`}
                            style={isActive ? { color: t.color } : {}}
                            title={t.label}
                        >
                            <Icon size={14} />
                        </button>
                    );
                })}
            </div>
            {/* Reset to default button */}
            <button
                onClick={resetToDefault}
                className="text-xs text-[var(--text-dim)] hover:text-[var(--text-primary)] underline"
            >
                Reset
            </button>
        </div>
    );
};

export { ThemeToggleDesktop, ThemeToggleMobile, THEMES };
export default ThemeToggleDesktop;
