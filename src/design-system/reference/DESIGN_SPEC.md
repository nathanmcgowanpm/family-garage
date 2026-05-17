# Developer Handoff: Family Garage v2 — Arctic Signal

**Date:** May 16, 2026  
**Design:** familygarage.ai mobile app redesign  
**Fidelity:** High-fidelity  

---

## Overview

This is a high-fidelity redesign of the Family Garage iOS app — a family vehicle maintenance tracker. The design introduces a new visual identity ("Arctic Signal") and reimagines four core user flows with fresh UX patterns.

The bundled HTML files are **design references built as interactive prototypes**, not production code. Your task is to **recreate these screens in the target codebase** (React Native, SwiftUI, or web — whichever is in use) using its established patterns and component libraries. Do not ship the HTML directly.

---

## Design Rationale

Four UX shifts from the previous version:

1. **Fleet-first home** — "Family" means plural vehicles. A horizontal chip strip at the top of every home screen lets users switch between cars with one tap.
2. **Scan-first onboarding** — Replace the form with a live camera VIN scanner. Year/make/model/trim autofilled. Manual fallback available.
3. **Live OCR capture** — Replace the upload dropzone with a full-screen camera viewfinder. Detected receipt fields float around the document as the AI reads it.
4. **Mileage-horizon schedule** — Replace service-interval cards with a horizontal odometer ruler. Service stops are plotted ahead on the road like milestones.

---

## Design Files

| File | Description |
|---|---|
| `Family Garage v2.html` | Main canvas — all four screens side by side. Pan/zoom. |
| `components/V2_Primitives.jsx` | Design tokens, shared primitives, tab bar, logo mark |
| `components/V2_Home.jsx` | Screen 01 — Home / command center |
| `components/V2_Onboard.jsx` | Screen 02 — VIN scan onboarding |
| `components/V2_Capture.jsx` | Screen 03 — Live receipt OCR |
| `components/V2_Schedule.jsx` | Screen 04 — Maintenance schedule / road ahead |

Open `Family Garage v2.html` in any modern browser to view all screens at once on an interactive canvas.

---

## Design Tokens

### Colors

```
/* Backgrounds */
--color-ink:       #0A0C0E   /* Page/screen background */
--color-surface:   #131619   /* Card background, bottom sheet */
--color-surface-2: #1C2024   /* Nested card, input field */
--color-surface-3: #262B31   /* Highest elevation surface */

/* Borders / Dividers */
--color-line:      rgba(120, 200, 255, 0.06)   /* Subtle divider */
--color-line-2:    rgba(120, 200, 255, 0.14)   /* Standard border */
--color-line-3:    rgba(120, 200, 255, 0.22)   /* Emphasized border */

/* Text */
--color-text:      #F5F7FA                     /* Primary text */
--color-text-dim:  rgba(245, 247, 250, 0.62)   /* Secondary text */
--color-text-mute: rgba(245, 247, 250, 0.36)   /* Placeholder / caption */

/* Accent — Primary */
--color-primary:      #3DD6FF                  /* Electric cyan — primary accent */
--color-primary-dim:  rgba(61, 214, 255, 0.12) /* Primary tinted background */
--color-primary-line: rgba(61, 214, 255, 0.36) /* Primary tinted border */

/* Semantic */
--color-go:      #6DFFB0   /* Confirmed / synced / success */
--color-signal:  #FFE15D   /* Warning / due soon / review */
--color-danger:  #FF4D6D   /* Overdue / recall / urgent */

/* Gradient — Primary button */
background: linear-gradient(180deg, #5EE2FF 0%, #3DD6FF 100%);

/* Gradient — Tab bar */
background: linear-gradient(to top, #0A0C0E 60%, rgba(10,12,14,0.8));
```

### Typography

Three font roles. All available free on Google Fonts.

```
/* Display — headings, vehicle names, large numbers */
font-family: 'Space Grotesk', -apple-system, system-ui, sans-serif;
font-weight: 700;
letter-spacing: -1px to -3px (scale with size);

/* Mono — ALL tabular data: odometer, mileage, dollars, dates, labels */
font-family: 'JetBrains Mono', 'SF Mono', ui-monospace, monospace;
font-variant-numeric: tabular-nums;  /* ALWAYS on mono numerics */

/* Body — descriptions, copy */
font-family: 'Inter', -apple-system, system-ui, sans-serif;
```

**Google Fonts import:**
```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"/>
```

### Type Scale

| Role | Font | Size | Weight | Tracking |
|---|---|---|---|---|
| Hero odometer | Space Grotesk | 64–72px | 700 | -3px |
| Screen title | Space Grotesk | 30–34px | 700 | -1px |
| Section heading | Space Grotesk | 18–22px | 700 | -0.4px |
| Card title | Space Grotesk | 14–16px | 700 | -0.2px |
| Body | Inter | 13–15px | 400/500 | 0 |
| Mono label | JetBrains Mono | 9–10px | 500 | +1.6–1.8px |
| Mono data | JetBrains Mono | 12–18px | 600 | -0.3px |
| Tab label | JetBrains Mono | 9px | 500 | +1.6px |

### Spacing

```
4px   — internal icon padding
8px   — gap between chips/pills
10px  — small gap
12px  — card internal padding (compact)
14px  — card internal padding (standard)
16px  — section padding, card padding
20px  — screen horizontal padding (standard)
22px  — hero card padding
24px  — section gap
28px  — status bar horizontal padding
```

### Border Radius

```
8px   — small chip, mode pill, toast
10px  — input, small button
12px  — standard card
14px  — fleet chip, FAB
16px  — large card
18px  — hero card
20px  — screen-level card / viewfinder
36px  — avatar / dot indicators
```

### Shadows

```css
/* Primary button glow */
box-shadow: 0 8px 24px rgba(61, 214, 255, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);

/* Primary glow dot */
box-shadow: 0 0 8px #3DD6FF;

/* Go state glow */
box-shadow: 0 0 8px #6DFFB0;

/* FAB */
box-shadow: 0 8px 20px rgba(61, 214, 255, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);

/* Cyan bounding box (capture screen) */
box-shadow: 0 0 20px rgba(61, 214, 255, 0.4),
            inset 0 0 20px rgba(61, 214, 255, 0.13);
```

---

## Screens

### Screen 01 — Home (Command Center)

**Purpose:** At-a-glance health of the active vehicle; access to fleet, recent activity, upcoming service.

**Layout (top → bottom):**

```
Status bar (native)
──────────────────────────────────────
Header row                                   padding: 8px 20px 20px
  Left: Logo mark (house SVG + wordmark)
  Right: Avatar chip (32×32, border-radius: 36px)

Fleet chip strip                             padding: 0 20px; overflow-x: scroll; gap: 8px
  VehicleChip (active)                       120px wide, border-radius: 14px, bg: primaryDim, border: primaryLine
  VehicleChip (inactive) ×2                  bg: surface, border: line
  Add chip                                   78×62px, dashed border

Hero card                                    margin: 0 20px; padding: 22px; border-radius: 18px
  Top-right: Sync status badge               dot(go) + "SYNCED · HH:MM" mono
  Label: vehicle name/trim
  Odometer: 64px Space Grotesk -3px tracking
  Sub: "+X,XXX MI since last log" with primary accent
  Health chips row: Health / Due Soon / Recalls   3-up grid

Mileage tape                                 full-width, bg: surface, padding: 16px 0 22px
  SVG ruler with 40 tick marks
  Service markers (NOW glows primary)
  Labels row below ruler

Recent activity header                       padding: 0 20px
Activity rows ×3                             margin: 10px 20px 0
  dot · title · shop · amount · date
```

**Fleet Chip — active state:**
- Background: `rgba(61,214,255,0.12)`
- Border: `1px solid rgba(61,214,255,0.36)`
- Title: Space Grotesk 14px 700, color: `#3DD6FF`
- Sub: JetBrains Mono 9px uppercase muted

**Fleet Chip — inactive:**
- Background: `#131619`
- Border: `1px solid rgba(120,200,255,0.06)`
- Title: Space Grotesk 14px 700, color: `#F5F7FA`

**Health chip:**
- Background: `#1C2024`
- Label: JetBrains Mono 8px uppercase muted
- Value: Space Grotesk 22px 700, primary color
- Unit: JetBrains Mono 9px uppercase muted

**Mileage tape — ruler:**
- 40 ticks: minor `rgba(120,200,255,0.14)`, major (every 5th) `rgba(120,200,255,0.22)`
- NOW marker: 3px wide, full height, primary color, `drop-shadow(0 0 6px #3DD6FF)`
- Service markers: 2px wide, 60% opacity primary, warning markers use signal color
- Below: tabular mono labels (mileage + service name)

**Activity row:**
- 6×6 dot: primary (hot) or textMute
- Title: Space Grotesk 13px 600
- Shop: JetBrains Mono 9px uppercase dim
- Amount: `$` in muted + JetBrains Mono 13px 600 (primary if hot)
- Date: JetBrains Mono 8px uppercase muted
- Separator: `1px solid rgba(120,200,255,0.06)`

---

### Screen 02 — Onboarding (VIN Scan)

**Purpose:** Add a new vehicle via live camera scan. Zero form fields on load — camera is the hero.

**Layout:**
```
Status bar
Logo mark                                    padding: 8px 20px 0
Progress rail                                padding: 24px 20px 0
  3 segments (flex), active = primary + glow, inactive = line2
  Step counter: "01/03" JetBrains Mono primary

Screen title                                 padding: 20px 20px 0
  Micro label: "Add Vehicle · Scan mode"
  H1: "Point at your / VIN or plate." (primary tint on second line)
  Sub: bordered-left description

Camera viewfinder                            margin: 22px 20px 0; height: 300px; border-radius: 20px
  Background: #050709 (near-black)
  Simulated VIN plate centered
  Dim overlay mask with transparent hole
  Cyan bounding box (262×74px rotated -2deg)
  4 corner brackets: 16×16px cyan with glow
  Scan line: 2px primary with glow across center
  Recognized overlay: bottom-16, bg rgba(10,12,14,0.85), blur
  Mode switcher: top-12 left-12 (VIN / PLATE / MANUAL pills)
  Flash toggle: top-12 right-12

Auto-filled confirm card                     margin: 18px 20px 0
  Check icon chip (38×38, primaryDim bg)
  Vehicle name: Space Grotesk 18px 700
  Spec line: JetBrains Mono 10px uppercase dim
  Metric row: 2-up grid (ODO + Est service)

CTA button: full-width 56px primary gradient
Sub-CTA: "Not my vehicle · Edit details" centered muted mono
```

**Progress rail:**
- Active segment: `background: #3DD6FF; box-shadow: 0 0 8px #3DD6FF`
- Inactive: `background: rgba(120,200,255,0.14)`
- Height: 2px, border-radius: 2px

**Camera viewfinder bounding box:**
- Border: `1.5px solid #3DD6FF`
- Box-shadow: `0 0 20px rgba(61,214,255,0.4), inset 0 0 20px rgba(61,214,255,0.13)`
- Corner brackets: `3px solid #3DD6FF`, 16×16px at each corner, glow: `box-shadow: 0 0 10px #3DD6FF`
- Transform: `rotate(-2deg)` to feel natural/handheld

**Mode switcher pills:**
- Container: `background: rgba(10,12,14,0.7)`, `border: 1px solid rgba(120,200,255,0.14)`, `backdrop-filter: blur(10px)`, border-radius: 8px, padding: 3px
- Active pill: `background: #3DD6FF; color: #0A0C0E`
- Inactive: transparent, color: textDim
- Font: JetBrains Mono 9px 600, letter-spacing: 1.2px

**Recognized overlay (bottom of viewfinder):**
- `background: rgba(10,12,14,0.85)`, `border: 1px solid rgba(61,214,255,0.36)`, `backdrop-filter: blur(10px)`, border-radius: 10px
- Status dot: `#6DFFB0` with glow
- Label: JetBrains Mono 9px "VIN RECOGNIZED" go color
- Vehicle string: JetBrains Mono 12px 600

**CTA button:**
- Background: `linear-gradient(180deg, #5EE2FF 0%, #3DD6FF 100%)`
- Color: `#0A0C0E` (ink on cyan)
- Font: Space Grotesk 13px 700, letter-spacing: 2px uppercase
- Height: 56px, border-radius: 14px
- Shadow: `0 8px 24px rgba(61,214,255,0.3), inset 0 1px 0 rgba(255,255,255,0.4)`

---

### Screen 03 — Receipt Capture (Live OCR)

**Purpose:** Log a service record by pointing the camera at a receipt. AI detects fields in real time.

**Layout:**
- Full-screen camera — ink bg, simulated receipt document
- Dim overlay mask with transparent window around document
- Cyan bounding box tracks the document edges
- **Floating field chips** appear around the document (animated pulse):
  - Shop, Date, Service (dark chips with cyan border)
  - Total (solid cyan chip — highest confidence)
- Top bar: Back button (left), Status badge (center), Flash (right)
- **Bottom sheet:** `background: rgba(10,12,14,0.85)`, blur, border-radius: 18px
  - Micro label: "Auto-parsed · 4 fields" + confidence %
  - Parsed result: Space Grotesk 17px bold + cyan amount
  - Sub: shop · date · mileage
  - Action row: Gallery icon | **Capture & save** button | Upload icon

**Floating field chip (standard):**
- Background: `rgba(10,12,14,0.85)`
- Border: `1px solid rgba(61,214,255,0.36)`
- Blur: `backdrop-filter: blur(10px)`
- Label: JetBrains Mono 8px uppercase muted
- Value: JetBrains Mono 11px 600
- Animation: `opacity 1→0.75→1` at 2s, CSS keyframe `pulse`

**Floating field chip (accent / high-confidence):**
- Background: `#3DD6FF`
- Color: `#0A0C0E`
- Shadow: `0 6px 16px rgba(61,214,255,0.4)`

**Status badge (detecting):**
- Background: `rgba(10,12,14,0.6)`, border: line2, blur
- Dot: `#6DFFB0` with glow
- Label: JetBrains Mono 10px 600 go color "DETECTING"

**Capture button:**
- Background: `#3DD6FF`, color: `#0A0C0E`
- Font: Space Grotesk 12px 700, letter-spacing: 1.8px uppercase
- Height: 40px, border-radius: 10px
- Shadow: `0 6px 18px rgba(61,214,255,0.35)`

---

### Screen 04 — Schedule (Road Ahead)

**Purpose:** Show upcoming maintenance as a timeline road — each service is a stop ahead of the current odometer.

**Layout:**
```
Status bar + logo mark

Screen title block                           padding: 22px 20px 0
  Micro label: "The road ahead"
  H1: "Next [5,000] miles" — number in primary

Odometer card                                margin: 22px 20px 0; padding: 20px 22px; border-radius: 18px
  Left: label + odometer reading + vehicle name
  Right: "Due soon" count badge (primaryDim bg)

Section header with left accent bar

Timeline (vertical)                          margin: 18px 20px 0
  Left rail: 2px gradient line (primary → line2)
  Service stop ×4:
    Node circle (38×38): urgent = primary filled + glow; normal = surface2
    Card: flex row (mileage@mi + date) / title / (interval + IN X MI)

Pre-visit brief CTA card                     margin: 20px 20px 0
  Gradient background: linear-gradient(135deg, #3DD6FF 0%, #5EE2FF 100%)
  Hatched pattern overlay (opacity: 0.12)
  Label + heading + dark button
```

**Timeline rail:**
- Width: 2px
- Background: `linear-gradient(to bottom, #3DD6FF, rgba(120,200,255,0.14))`
- Position: absolute, left: 18px (aligns with node center)

**Service stop node — urgent:**
- Size: 38×38px, border-radius: 38px
- Background: `#3DD6FF`
- Border: `2px solid #3DD6FF`
- Shadow: `0 0 16px #3DD6FF`
- Icon stroke: `#0A0C0E`

**Service stop node — normal:**
- Background: `#1C2024`
- Border: `2px solid rgba(120,200,255,0.22)`
- Icon stroke: textDim

**Service stop card:**
- Background: `#131619`
- Border: urgent = `1px solid rgba(61,214,255,0.36)`, normal = `1px solid rgba(120,200,255,0.06)`
- Border-radius: 12px
- Mileage marker: JetBrains Mono 10px 600, urgent = primary, normal = textMute
- Service name: Space Grotesk 15px 700
- Interval: JetBrains Mono 9px uppercase dim
- "IN X MI": JetBrains Mono 10px 600, urgent = primary

**Pre-visit brief card:**
- Background: `linear-gradient(135deg, #3DD6FF 0%, #5EE2FF 100%)`
- Text: `#0A0C0E`
- Hatch overlay: `repeating-linear-gradient(45deg, transparent 0 10px, rgba(0,0,0,0.3) 10px 11px)`, opacity: 0.12
- Sub-button: `background: #0A0C0E; color: #3DD6FF`, border-radius: 8px, Space Grotesk 11px 700 uppercase

---

## Navigation & Tab Bar

**5 tabs:** Home · Fleet · Log (FAB center) · Next · Me

**Tab bar specs:**
- Height: 92px total, bottom padding: 28px (safe area)
- Background: `linear-gradient(to top, #0A0C0E 60%, rgba(10,12,14,0.8))`
- Top border: `1px solid rgba(120,200,255,0.06)`
- Backdrop: `blur(20px)`

**Active tab indicator:**
- 4×4px dot above label, border-radius: 4px
- Color: `#3DD6FF`, shadow: `0 0 8px #3DD6FF`

**Inactive tab:**
- No dot
- Label: JetBrains Mono 9px uppercase, color: `rgba(245,247,250,0.36)`

**FAB (Log button — center):**
- Size: 48×48px, border-radius: 14px
- Background: `linear-gradient(180deg, #5EE2FF 0%, #3DD6FF 100%)`
- Icon: `+` path, stroke: `#0A0C0E`, stroke-width: 2.2
- Shadow: `0 8px 20px rgba(61,214,255,0.4), inset 0 1px 0 rgba(255,255,255,0.4)`

---

## Logo Mark

SVG house/garage glyph + wordmark:

```jsx
// House path
<path d="M4 20V9l8-5 8 5v11" stroke="#3DD6FF" strokeWidth="1.6" strokeLinejoin="round"/>
// Center dot
<circle cx="12" cy="13" r="2.5" fill="#3DD6FF"/>

// Wordmark
"FAMILY" — Space Grotesk 13px 700 letter-spacing: 1.8px uppercase, color: text
"GARAGE" — same + color: #3DD6FF, margin-left: 4px
```

---

## Interactions & Animations

| Element | Behavior |
|---|---|
| Floating field chips | `opacity: 1 → 0.75 → 1` CSS keyframe `pulse`, 2s infinite |
| Scan line in VIN viewfinder | Static in mockup — implement as vertical CSS translate animation, 1.5s ease-in-out loop |
| Active tab dot | Fade in on tab change, 150ms ease |
| Fleet chip selection | Background + border transition, 200ms ease |
| Primary button press | `scale(0.97)` + shadow reduce, 100ms |
| Mileage tape NOW marker | Static glow; consider subtle pulse in production |
| Health chip values | Count-up animation on first load |

---

## Assets Required

| Asset | Description | Source |
|---|---|---|
| Space Grotesk | Display font | [fonts.google.com/specimen/Space+Grotesk](https://fonts.google.com/specimen/Space+Grotesk) |
| JetBrains Mono | Mono/data font | [fonts.google.com/specimen/JetBrains+Mono](https://fonts.google.com/specimen/JetBrains+Mono) |
| Inter | Body font | [fonts.google.com/specimen/Inter](https://fonts.google.com/specimen/Inter) |
| Vehicle silhouette | SVG inline in Home hero | See `V2_Home.jsx` — custom SVG, adapt per vehicle type |
| Camera viewfinder UI | SVG inline | See `V2_Capture.jsx` |
| All icons | Custom SVG inline | Defined inline in `V2_Primitives.jsx` |

No third-party icon library used — all icons are inline SVG, reproducible from the source files.

---

## Device Target

- **Mobile-first**, iOS 16+
- Screen width: 390pt (iPhone 14/15 base)
- All hit targets: minimum 44×44pt
- Safe areas: 54pt top (status bar + dynamic island), 28pt bottom (home indicator)
- Screen height: 844pt, with 92pt tab bar at bottom

---

## Notes for Claude Code

1. **Cyan is exactly `#3DD6FF`** — not `#00d4ff`, not `#00bcd4`. The whole identity rides on it.
2. **All numbers must use `font-variant-numeric: tabular-nums`** — odometers, costs, mileage. This is non-negotiable for the ledger feel.
3. **JetBrains Mono** for all labels, not Inter. Labels should feel like instrument panel readouts.
4. **Glow shadows** on primary elements are intentional — they give the "live instrument" feel. Don't flatten them.
5. **The FAB is not circular** — it's `border-radius: 14px` (rounded square). The cyan gradient goes top-to-bottom.
6. **The dim overlay on the capture screen** uses CSS mask to cut a transparent hole — this is the key visual. Use `mask: radial-gradient(ellipse ...)` or clip-path depending on your platform.
7. The `Go / Signal / Danger` semantic colors (`#6DFFB0 / #FFE15D / #FF4D6D`) map directly to vehicle health states and should be used consistently across all status indicators.
