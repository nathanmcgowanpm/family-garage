# Reference materials — Family Garage v2 ("Arctic Signal")

**Do not import anything in this folder into the app.** It is version-controlled
prototype code from the design handoff, kept here only so the implementation can
be diffed against the source of truth.

## Contents

- `DESIGN_SPEC.md` — canonical design spec. Tokens, type scale, shadows,
  screen-by-screen layouts. The token values in `../tokens.css` come from this
  file. **If something disagrees, this file wins.**
- `Family_Garage_v2.html` — interactive prototype of all four screens. Open in a
  browser to see the design intent.
- `V2_Primitives.jsx`, `V2_Home.jsx`, `V2_Onboard.jsx`, `V2_Capture.jsx`,
  `V2_Schedule.jsx` — prototype React components.

## Why these are not production code

The prototype components rely on patterns that do not belong in this codebase:

- inline `style={{ ... }}` everywhere instead of Tailwind / CSS variables
- `Object.assign(window, { ... })` to share primitives across files
- a fake iOS device chrome (`IOSDevice`, `IOSStatusBar`) that wraps every screen
- hardcoded hex colors duplicated per file instead of token references

Read them for shape, glow values, SVG paths, and spec intent. Reimplement
through `../tokens.css`, `../AppShell.jsx`, and `../primitives/`.
