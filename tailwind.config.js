/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'bg-main': 'var(--bg-main)',
                'bg-card': 'var(--bg-card)',
                'accent-primary': 'var(--accent-primary)',
                'accent-secondary': 'var(--accent-secondary)',
                'text-primary': 'var(--text-primary)',
                'text-dim': 'var(--text-dim)',
            },
            fontFamily: {
                display: 'var(--font-display)',
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'glow': 'var(--border-glow)',
            },
        },
    },
    plugins: [],
}
