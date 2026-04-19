/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#f97316',
        'primary-dark': '#ea6c0a',
        surface: '#020617',
        'surface-card': '#0f172a',
        'surface-raised': '#1e293b',
        'surface-highest': '#334155',
        'on-surface': '#f8fafc',
        'on-muted': '#94a3b8',
        'on-faint': '#475569',
        error: '#ef4444',
        success: '#10b981',
      },
      fontFamily: {
        headline: ['"Space Grotesk"', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
        label: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}