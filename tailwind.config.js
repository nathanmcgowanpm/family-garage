/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        bg: {
          base: 'var(--color-bg-base)',
          surface: 'var(--color-bg-surface)',
          elevated: 'var(--color-bg-elevated)',
          inset: 'var(--color-bg-inset)',
        },
        // Accent (cyan)
        accent: {
          DEFAULT: 'var(--color-accent)',
          bright: 'var(--color-accent-bright)',
          dim: 'var(--color-accent-dim)',
          bg: 'var(--color-accent-bg)',
        },
        // Text
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
          accent: 'var(--color-text-accent)',
          inverse: 'var(--color-text-inverse)',
        },
        // Status
        status: {
          success: 'var(--color-status-success)',
          warning: 'var(--color-status-warning)',
          danger: 'var(--color-status-danger)',
          info: 'var(--color-status-info)',
        },
        // Borders
        border: {
          subtle: 'var(--color-border-subtle)',
          DEFAULT: 'var(--color-border-default)',
          strong: 'var(--color-border-strong)',
          accent: 'var(--color-border-accent)',
          'accent-strong': 'var(--color-border-accent-strong)',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'SF Mono', 'Menlo', 'monospace'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body: ['Manrope', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': 'var(--text-xs)',
        'sm': 'var(--text-sm)',
        'base': 'var(--text-base)',
        'lg': 'var(--text-lg)',
        'xl': 'var(--text-xl)',
        '2xl': 'var(--text-2xl)',
        '3xl': 'var(--text-3xl)',
        'odometer': 'var(--text-odometer)',
      },
      boxShadow: {
        'glow': 'var(--glow-accent)',
        'glow-sm': 'var(--glow-accent-sm)',
        'glow-strong': 'var(--glow-accent-strong)',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
      },
      maxWidth: {
        'mobile': 'var(--container-mobile-max)',
      },
      transitionTimingFunction: {
        'out-custom': 'var(--ease-out)',
      },
    },
  },
  plugins: [],
}
