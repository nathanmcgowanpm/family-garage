/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ─── v2 Arctic Signal tokens ─────────────────────────────
        // Flat names that match the CSS variables in
        // src/design-system/tokens.css. Use these for any new work.
        ink:             'var(--color-ink)',
        surface:         'var(--color-surface)',
        'surface-2':     'var(--color-surface-2)',
        'surface-3':     'var(--color-surface-3)',
        line:            'var(--color-line)',
        'line-2':        'var(--color-line-2)',
        'line-3':        'var(--color-line-3)',
        primary:         'var(--color-primary)',
        'primary-dim':   'var(--color-primary-dim)',
        'primary-line':  'var(--color-primary-line)',
        go:              'var(--color-go)',
        signal:          'var(--color-signal)',
        danger:          'var(--color-danger)',

        // ─── Legacy tokens (kept for existing screens) ────────────
        // Backgrounds
        bg: {
          base: 'var(--color-bg-base)',
          surface: 'var(--color-bg-surface)',
          elevated: 'var(--color-bg-elevated)',
          inset: 'var(--color-bg-inset)',
        },
        // Accent (legacy cyan — #00d4ff). New work uses `primary`.
        accent: {
          DEFAULT: 'var(--color-accent)',
          bright: 'var(--color-accent-bright)',
          dim: 'var(--color-accent-dim)',
          bg: 'var(--color-accent-bg)',
        },
        // Text. DEFAULT + dim/mute are the v2 tokens; primary/secondary/
        // tertiary/accent/inverse are the legacy nested tokens. Both
        // resolve simultaneously — `text-text` is v2, `text-text-primary`
        // is legacy.
        text: {
          DEFAULT:   'var(--color-text)',
          dim:       'var(--color-text-dim)',
          mute:      'var(--color-text-mute)',
          primary:   'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary:  'var(--color-text-tertiary)',
          accent:    'var(--color-text-accent)',
          inverse:   'var(--color-text-inverse)',
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
        // All three reference CSS variables — values defined in
        // src/design-system/tokens.css (v2) override src/styles/tokens.css.
        display: ['var(--font-display)'],
        mono:    ['var(--font-mono)'],
        body:    ['var(--font-body)'],
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
        // v2 Arctic Signal
        'primary-button':  'var(--shadow-primary-button)',
        'primary-glow':    'var(--shadow-primary-glow)',
        'go-glow':         'var(--shadow-go-glow)',
        'fab':             'var(--shadow-fab)',
        'bounding-box':    'var(--shadow-bounding-box)',
        // Legacy
        'glow':         'var(--glow-accent)',
        'glow-sm':      'var(--glow-accent-sm)',
        'glow-strong':  'var(--glow-accent-strong)',
      },
      backgroundImage: {
        'gradient-primary-button': 'var(--gradient-primary-button)',
        'gradient-tab-bar':        'var(--gradient-tab-bar)',
      },
      borderRadius: {
        // v2 tokens. `sm/md/lg/xl` are redefined to the v2 pixel scale;
        // legacy code that used these by name now picks up the new values.
        // The legacy file used 6/10/16/24 — close enough that visual drift
        // is minor, and the v2 scale is the canonical one going forward.
        'sm':   'var(--radius-sm)',     /* 8px  */
        'md':   'var(--radius-md)',     /* 12px */
        'lg':   'var(--radius-lg)',     /* 14px */
        'xl':   'var(--radius-xl)',     /* 18px */
        '2xl':  'var(--radius-2xl)',    /* 20px */
        'pill': 'var(--radius-pill)',   /* 36px */
      },
      spacing: {
        '1': 'var(--space-1)',  /* 4px  */
        '2': 'var(--space-2)',  /* 8px  */
        '3': 'var(--space-3)',  /* 12px */
        '4': 'var(--space-4)',  /* 16px */
        '5': 'var(--space-5)',  /* 20px */
        '6': 'var(--space-6)',  /* 24px */
        '7': 'var(--space-7)',  /* 28px */
      },
      maxWidth: {
        'mobile': 'var(--container-mobile-max)',
        'shell-tablet':  '600px',
        'shell-desktop': '720px',
      },
      transitionTimingFunction: {
        'out-custom': 'var(--ease-out)',
      },
    },
  },
  plugins: [],
}
