# Family Garage v2 — Design System ("Arctic Signal")

Phase 0 foundation: tokens, font wiring, AppShell, and four foundational
primitives. **No screens yet** — those are Phase 1+.

The source of truth for every value here is
[`reference/DESIGN_SPEC.md`](./reference/DESIGN_SPEC.md). If something in code
disagrees with that file, the file wins.

---

## Folder layout

```
src/design-system/
├── README.md              ← this file
├── tokens.css             ← CSS variables, source of truth for tokens
├── AppShell.jsx           ← centered max-width content container
├── primitives/
│   ├── index.js           ← barrel re-export
│   ├── Logo.jsx
│   ├── MicroLabel.jsx
│   ├── MonoNum.jsx
│   └── StatusDot.jsx
└── reference/             ← prototype handoff, READ-ONLY (do not import)
    ├── README.md
    ├── DESIGN_SPEC.md
    ├── Family_Garage_v2.html
    └── V2_*.jsx
```

---

## Tokens

CSS variables in [`tokens.css`](./tokens.css) are the canonical token form.
Tailwind references them in `tailwind.config.js`, so the same value resolves
identically through any of three channels:

```jsx
// 1. Tailwind utility class
<div className="bg-primary text-ink rounded-lg" />

// 2. CSS variable in an inline style (for third-party components or
//    one-off needs)
<div style={{ background: 'var(--color-primary)' }} />

// 3. CSS variable in a stylesheet
.my-thing { background: var(--color-primary); }
```

All three render `#3DD6FF`. **Never hardcode hex values.**

### What's defined

| Group       | Tokens                                                                                        |
|-------------|-----------------------------------------------------------------------------------------------|
| Backgrounds | `--color-ink`, `--color-surface`, `--color-surface-2`, `--color-surface-3`                    |
| Lines       | `--color-line`, `--color-line-2`, `--color-line-3`                                            |
| Text        | `--color-text`, `--color-text-dim`, `--color-text-mute`                                       |
| Primary     | `--color-primary` (`#3DD6FF`), `--color-primary-dim`, `--color-primary-line`                  |
| Semantic    | `--color-go`, `--color-signal`, `--color-danger`                                              |
| Gradients   | `--gradient-primary-button`, `--gradient-tab-bar`                                             |
| Shadows     | `--shadow-primary-button`, `--shadow-primary-glow`, `--shadow-go-glow`, `--shadow-fab`, `--shadow-bounding-box` |
| Spacing     | `--space-1` (4px) … `--space-7` (28px)                                                        |
| Radius      | `--radius-sm` (8) / `-md` (12) / `-lg` (14) / `-xl` (18) / `-2xl` (20) / `-pill` (36)         |
| Type        | `--font-display`, `--font-mono`, `--font-body`                                                |

### Tailwind utility map

| Token             | Tailwind class examples                          |
|-------------------|--------------------------------------------------|
| `--color-ink`     | `bg-ink`, `text-ink`, `border-ink`               |
| `--color-surface` | `bg-surface`, `bg-surface-2`, `bg-surface-3`     |
| `--color-line-2`  | `border-line-2`                                  |
| `--color-text`    | `text-text` (DEFAULT), `text-text-dim`, `text-text-mute` |
| `--color-primary` | `bg-primary`, `text-primary`, `border-primary`   |
| `--color-go`      | `bg-go`, `text-go`                               |
| `--font-display`  | `font-display`                                   |
| `--shadow-fab`    | `shadow-fab`                                     |
| `--radius-xl`     | `rounded-xl`                                     |
| `--space-5`       | `p-5`, `m-5`, `gap-5` (= 20px)                   |

### Coexistence with legacy tokens

The project keeps a previous token set in [`src/styles/tokens.css`](../styles/tokens.css)
(`--color-bg-base`, `--color-accent`, `text.primary` and friends). Existing
screens still use those. New components use **only** the v2 tokens above.
Treat the legacy set as frozen — don't add to it.

---

## Primitives

Import via the barrel:

```jsx
import { Logo, MicroLabel, MonoNum, StatusDot } from '@/design-system/primitives'
```

| Primitive    | Purpose                                                                 |
|--------------|-------------------------------------------------------------------------|
| `<Logo />`   | House SVG glyph + `FAMILY GARAGE` wordmark. `size` prop (default 22).   |
| `<MicroLabel>` | Uppercase JetBrains Mono micro-caption. `color` prop overrides cyan.    |
| `<MonoNum>`  | Tabular-num numeric span. `size`, `color`, `bold` props.                |
| `<StatusDot>` | 6–8px filled circle with matching color glow. `variant`, `size` props. |

Future primitives (`FleetPill`, `HealthChip`, `MileageTape`, `ActRow`,
`SchedStop`, `FloatChip`, `Metric`, the tab bar) are intentionally not yet
built — they'll be added in the screen phases where their context is clear.

---

## AppShell

A centered, max-width wrapper for any v2 screen. No iOS chrome, no tab bar —
just the content rail.

```jsx
import AppShell from '@/design-system/AppShell'

export default function HomeScreen() {
  return (
    <AppShell>
      {/* page content */}
    </AppShell>
  )
}
```

### Philosophy C — responsive strategy

Mobile is the canonical design. On larger viewports we widen the content rail
rather than reflow:

| Viewport        | Width            | Side padding |
|-----------------|------------------|--------------|
| `<640px`        | full width       | 0            |
| `640–1023px`    | max-width 600px  | 20px         |
| `≥1024px`       | max-width 720px  | 24px         |

This is intentionally simpler than the legacy
[`src/components/AppShell.jsx`](../components/AppShell.jsx), which renders a
desktop sidebar. That older component is still in use by existing screens —
leave it alone until each screen is migrated.

---

## Reference materials

Prototype handoff lives in [`reference/`](./reference/) and is **never
imported into the app**. See [`reference/README.md`](./reference/README.md)
for why.
