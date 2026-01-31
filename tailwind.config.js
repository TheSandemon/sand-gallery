/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'neon-green': '#008f4e',
                'neon-gold': '#c79b37',
                'bg-dark': '#0a0a0a',
                'text-primary': '#ffffff',
                'text-secondary': '#a1a1aa',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
