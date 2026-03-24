# Miles & More — Award-Level Website Redesign Plan

## Context

The Miles & More frontend is a Twitch-integrated airline simulation with pages for leaderboards, flight dashboards, bot commands, and admin controls. The current design uses a purple glassmorphism aesthetic with basic Three.js flight lanes and Framer Motion animations. While functional, it lacks the cinematic impact, editorial typography, and immersive 3D experiences that define award-winning sites in 2026.

The redesign aims to elevate the visual experience to Awwwards-level quality while preserving all existing content, functionality, and routing logic. Inspired by the WorldQuant Foundry (dark cinematic 3D hero), Aventura Dental Arts (editorial serif+sans typography), and VSE Aviation (clean corporate aviation) reference designs.

**Confirmed decisions:**
- Fully dark palette throughout (including admin)
- Particle globe with flight route arcs for the hero scene

---

## Phase 0: New Dependencies & Design System Foundation

### 0A. Install new packages

```bash
npm install gsap @gsap/react @react-three/drei @react-three/postprocessing postprocessing
```

- **gsap + @gsap/react**: ScrollTrigger, SplitText (free in 3.13+), Flip for scroll animations and text reveals
- **@react-three/drei**: Helpers (Float, MeshTransmissionMaterial, Environment, Text3D, shaderMaterial)
- **@react-three/postprocessing + postprocessing**: Bloom, ChromaticAberration, Vignette, Noise merged into single-pass pipeline

### 0B. Add display serif font

**File: `src/app/layout.tsx`**
- Add `Playfair_Display` from `next/font/google` (weights: 400, 400-italic, 700, 700-italic) as `--font-display`
- This creates the editorial italic accent seen in the Aventura reference (e.g., *"Aviation"* in italic serif alongside bold sans headings)

### 0C. Redesign the color palette

**File: `src/app/globals.css`**

Shift from purple-centric to a darker, more cinematic airline palette:

| Token | Old | New | Purpose |
|-------|-----|-----|---------|
| `--color-background` | `#FAFAFA` | `#050510` | Dark base (near-black with blue undertone) |
| `--color-foreground` | `#18181B` | `#F0EDE8` | Warm off-white text |
| `--color-card` | `#FFFFFF` | `rgba(255,255,255,0.04)` | Glass card surface |
| `--color-primary` | `#2D1B4E` | `#C8A96E` | Warm gold accent (airline premium) |
| `--color-accent` | `#6341A3` | `#4A90D9` | Aviation blue |
| `--color-border` | `#E4E4E7` | `rgba(255,255,255,0.08)` | Subtle glass borders |

New tokens to add:
- `--color-gold-400`: `#C8A96E` (primary gold)
- `--color-gold-300`: `#D4BC8A` (light gold)
- `--color-gold-500`: `#A8894E` (deep gold)
- `--color-navy-950`: `#050510` (deep background)
- `--color-navy-900`: `#0A0A1A` (card backgrounds)
- `--color-navy-800`: `#12122A` (elevated surfaces)
- `--color-aviation-blue`: `#4A90D9` (info/accent)
- `--color-glow-purple`: `rgba(100, 60, 180, 0.15)` (ambient orb)
- `--color-glow-blue`: `rgba(74, 144, 217, 0.12)` (ambient orb)
- `--color-glow-gold`: `rgba(200, 169, 110, 0.1)` (ambient orb)

### 0D. Typography system update

**File: `src/app/globals.css`**

```
--font-display: var(--font-playfair), Georgia, serif;
--font-sans: var(--font-inter), system-ui, sans-serif;
```

New utility classes:
- `.display-heading` — Playfair Display, large clamp sizes, tracking-tight
- `.display-accent` — Playfair Display italic for emphasis words (like "Dentistry" → *"Aviation"*)
- `.mono-label` — Inter 600, uppercase, letter-spacing 0.14em, for cockpit-style labels

### 0E. New surface classes

Replace existing `.glass`, `.night-panel` etc. with cinematic variants:

- `.surface-glass` — `rgba(255,255,255,0.03)` bg, `rgba(255,255,255,0.06)` border, backdrop-blur(20px), border-radius 1.5rem
- `.surface-elevated` — `rgba(255,255,255,0.06)` bg, stronger border, subtle inset glow
- `.surface-gold-accent` — Gold gradient border (1px) with transparent fill
- `.noise-overlay` — Upgraded grain texture at 3% opacity, fixed overlay

### 0F. GSAP + Lenis integration

**File: `src/components/layout/SmoothScrollProvider.tsx`**

Rewire the Lenis RAF loop to sync with GSAP's ticker instead of Framer Motion's frame loop:

```tsx
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// In useEffect:
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

### 0G. New shared animation components

**New file: `src/components/effects/TextReveal.tsx`**
- GSAP SplitText wrapper for cinematic text reveals
- Split by chars/words/lines with staggered mask animation
- Triggered by ScrollTrigger or on mount
- Respects `prefers-reduced-motion`

**New file: `src/components/effects/MagneticButton.tsx`**
- GSAP-powered magnetic hover effect for CTAs
- Smooth easing toward cursor position within bounds

**New file: `src/components/effects/ParallaxSection.tsx`**
- ScrollTrigger-driven parallax for images/sections
- Configurable speed and direction

---

## Phase 1: New Landing Page (`/`)

### Current state
`src/app/page.tsx` redirects to `/leaderboard`.

### New structure

**File: `src/app/page.tsx`** — Server component fetching stats from backend (total pilots, miles, flights) via `botApi`, then rendering `<LandingPageClient>`.

**New file: `src/components/landing/LandingPageClient.tsx`** — Client component composing the full landing page:

#### Section 1: Full-viewport 3D Hero (Particle Globe with Routes)
- **New file: `src/components/effects/HeroGlobe.tsx`**
  - R3F Canvas with a wireframe globe made of ~4000 particles (lat/lng grid mapped to sphere, slight noise displacement for organic feel)
  - 8-12 flight route arcs rendered as glowing CatmullRom curves connecting real city pairs (FRA→JFK, SIN→SYD, etc.), reuse curve pattern from existing `FlightLane` in `AirspaceScene.tsx`
  - Animated marker spheres traveling along routes (gold glow, trail fade)
  - Globe slowly auto-rotates; scroll-driven tilt via GSAP ScrollTrigger (section pinned at 100vh, scroll controls camera Y rotation from 0° to 30°)
  - Post-processing pipeline (single merged pass): Bloom (luminanceThreshold 0.8, intensity 1.2), ChromaticAberration (offset [0.001, 0.001]), Vignette (darkness 0.7), Noise (opacity 0.04)
  - Globe particles use `InstancedMesh` for performance (single draw call for all points)
  - Route arcs use `MeshLineMaterial` or custom tube geometry with emissive >1.0 for selective bloom
  - WebGL2 fallback automatic (Three.js r183); reduced-motion fallback: static CSS radial gradient globe silhouette (like existing AirspaceScene pattern)
  - Mobile: DPR [0.7, 1], ~1500 particles, no post-processing, fewer routes (4 arcs)

- **Typography overlay** (HTML layer on top of Canvas):
  - "MILES &" in large Inter 800 (sans), "MORE" in Playfair Display italic — referencing the WorldQuant split-typography style
  - GSAP SplitText reveal on load: chars mask-animate in with stagger
  - Tagline below: "Sammle Meilen. Erkunde die Welt. Steige im Ranking auf." with line-by-line reveal
  - Corner bracket decorations (like WorldQuant's CONTACT button) for nav links

#### Section 2: Stats Strip (scroll-triggered)
- 3 large animated counters: Total Pilots, Total Miles (formatted), Total Flights
- GSAP number counter animation with spring easing
- Monospace cockpit-style labels
- Horizontal dividers with gold accent lines

#### Section 3: Feature Triptych
- 3 feature cards in a grid:
  1. "Leaderboard" — ranking icon, brief description, CTA
  2. "Live Flights" — flight tracking icon, brief description, CTA
  3. "Commands" — terminal icon, brief description, CTA
- Cards use `.surface-glass` with hover: subtle scale + gold border glow
- Staggered scroll-reveal via GSAP ScrollTrigger

#### Section 4: How It Works
- 4-step process (reuse content from current leaderboard "How to earn miles" section)
- Horizontal scroll-pinned reveal on desktop, vertical stack on mobile
- Each step has an animated icon (SVG morph or Lottie-style)

#### Section 5: Footer
- Minimal dark footer with logo, nav links, and "CONTACT US" in corner brackets
- Monospace style text for description (like WorldQuant's footer)

---

## Phase 2: Leaderboard Page Enhancement

**File: `src/components/LeaderboardPageClient.tsx`**

### Visual upgrades (preserve all content/data):
- Dark background throughout (remove white bottom section)
- Header: GSAP SplitText reveal for "LEADERBOARD" heading, Playfair italic accent on a keyword
- Tab rail: Redesign with gold underline indicator instead of background pill
- Top 3 entries: Larger cards with gold/silver/bronze gradient borders, subtle glow
- Medal icons: Replace emoji with custom SVG medals with shimmer animation
- Table rows: Staggered fade-in on scroll, hover state with glass highlight
- Stats panel: Redesigned with `.surface-glass` cards, animated number counters
- "How to earn" section: Moved to landing page (or kept as collapsed accordion)
- Featured performers: Cards with subtle parallax on scroll

### Preserved exactly:
- All data fetching, polling, refresh logic
- Tab switching (Miles/Countries)
- All German labels and content
- Ranking data display format
- Quick command reference

---

## Phase 3: Flight Dashboard Enhancement

**File: `src/components/flight/FlightDashboard.tsx`** and sub-components

### Boarding Pass (`BoardingPass.tsx`)
- Keep 3D flip/tilt interaction
- Upgrade holographic strip: Replace CSS gradient with a WebGL shader effect (iridescent rainbow that responds to tilt angle)
- Dark card background matching new palette
- Gold accent text for flight number and route
- Enhanced tear-line with subtle animation

### Seat Map (`SeatMap.tsx`)
- Keep all seat selection logic
- Add a small 3D aircraft cross-section header (R3F scene showing cabin perspective, loaded via drei's `useGLTF` or procedural geometry)
- Upgrade seat colors to match new palette (gold for user seat, aviation-blue for available)
- Smoother selection animations with GSAP Flip

### Flight Tracker (`FlightTracker.tsx` + `FlightMap.tsx`)
- Keep Leaflet map and all telemetry logic
- Switch to dark map tiles (already using CARTO dark)
- Add glowing route arc overlay (CSS/SVG great-circle line with gold glow)
- Telemetry panel: Cockpit-instrument aesthetic with `.surface-glass` cards
- Animated altitude/speed gauges

### Tab transitions
- GSAP Flip for smooth layout transitions between tabs

---

## Phase 4: Commands Page Enhancement

**File: `src/components/CommandsPageClient.tsx`**

### Visual upgrades (preserve all content):
- Terminal/cockpit aesthetic: Dark background with monospace heading
- "COMMAND *ATLAS*" — Atlas in Playfair italic
- Category filter: Redesigned as pill buttons with gold active state
- Command cards: `.surface-glass` with left gold accent border
- Permission badges: Refined with new color system
- Staggered card reveal on category switch (GSAP stagger)
- Subtle scan-line effect in the background (CSS animation)

---

## Phase 5: Shared Layout & Navigation

### Navigation (`src/components/layout/` — new or updated)

**New file: `src/components/layout/Navigation.tsx`**
- Fixed top nav, transparent on hero, glass on scroll (intersection observer)
- Logo left, nav links center, CTA right
- Links styled like WorldQuant: uppercase monospace, widely spaced
- CTA "CONTACT" / "ADMIN" in corner bracket frame (CSS borders on corners only)
- Mobile: Hamburger with full-screen overlay menu, staggered link reveals

### PageShell updates
- Remove `.night-shell` white-bottom gradient — entire site is dark now
- Background: Deep navy `#050510` with subtle animated aurora orbs (CSS radial-gradient with ambient-drift)
- Noise overlay at 3% opacity across all pages

### Loading states
- Update `LoadingPlane` to match new dark palette
- Gold accent on the animated flight path

---

## Phase 6: Admin Dashboard (Fully Dark)

The admin dashboard is functional, not public-facing. Full dark theme conversion:
- Update all surfaces to dark palette (`.surface-glass` cards instead of white `.control-panel`)
- Gold accent on active tab, status indicators
- Dark input fields with subtle borders
- Keep all functionality and sub-panels untouched — visual skin change only

---

## Phase 7: Performance & Accessibility

### Performance
- **Code-split all 3D scenes** via `next/dynamic` with `ssr: false` (already done for AirspaceScene — follow same pattern for HeroGlobe)
- **Lazy-load GSAP plugins** — register ScrollTrigger/SplitText only when needed
- **Post-processing budget**: Max 3 effects merged in single pass via `@react-three/postprocessing`
- **DPR scaling**: [0.7, 1] on mobile, [1, 1.5] on desktop
- **Reduced particles on mobile**: 50% of desktop count
- **Preload display font**: Add `<link rel="preload">` for Playfair Display in layout

### Accessibility
- **`prefers-reduced-motion`**: All GSAP animations check this via `gsap.matchMedia()`, 3D scenes fall back to static gradients (existing pattern in AirspaceScene)
- **Color contrast**: Gold `#C8A96E` on navy `#050510` exceeds 7:1 ratio (AAA). Off-white `#F0EDE8` on navy exceeds 15:1
- **Focus indicators**: Visible gold outline rings on all interactive elements
- **Semantic HTML**: Preserve all existing heading hierarchy and ARIA labels
- **Tab navigation**: Ensure all interactive elements are keyboard-accessible

---

## File Change Summary

### New files to create:
| File | Purpose |
|------|---------|
| `src/components/landing/LandingPageClient.tsx` | New landing page client component |
| `src/components/effects/HeroGlobe.tsx` | 3D globe hero scene (R3F + postprocessing) |
| `src/components/effects/TextReveal.tsx` | GSAP SplitText animation wrapper |
| `src/components/effects/MagneticButton.tsx` | GSAP magnetic hover button |
| `src/components/effects/ParallaxSection.tsx` | ScrollTrigger parallax wrapper |
| `src/components/layout/Navigation.tsx` | New fixed navigation bar |

### Existing files to modify:
| File | Changes |
|------|---------|
| `src/app/globals.css` | New color palette, typography tokens, surface classes, animations |
| `src/app/layout.tsx` | Add Playfair Display font, GSAP setup |
| `src/app/page.tsx` | Replace redirect with landing page (server data fetch + client component) |
| `src/components/layout/SmoothScrollProvider.tsx` | Rewire Lenis to GSAP ticker |
| `src/components/layout/PageShell.tsx` | Dark-first backgrounds, updated noise overlay |
| `src/components/LeaderboardPageClient.tsx` | Dark theme, GSAP reveals, redesigned cards |
| `src/components/CommandsPageClient.tsx` | Dark theme, terminal aesthetic, GSAP stagger |
| `src/components/flight/BoardingPass.tsx` | New palette, enhanced holographic effect |
| `src/components/flight/SeatMap.tsx` | New palette, gold/blue seat colors |
| `src/components/flight/FlightDashboard.tsx` | Tab transitions, dark theme |
| `src/components/flight/FlightTracker.tsx` | Cockpit-style telemetry panel |
| `src/components/ui/SASButton.tsx` | New palette, magnetic hover option |
| `src/components/ui/SASCard.tsx` | New glass variants for dark theme |
| `src/components/effects/AirspaceScene.tsx` | Keep as secondary scene, update colors |
| `src/components/LoadingPlane.tsx` | Dark palette, gold accents |
| `src/components/admin/AdminDashboard.tsx` | Full dark theme update |

### Files untouched (logic/data layer):
- `src/lib/botApi.ts`
- `src/lib/types.ts`
- `src/auth.ts`
- `src/app/api/**`
- All OG image generators

---

## Implementation Order

1. **Phase 0** (foundation) — Must be first: deps, colors, fonts, GSAP integration
2. **Phase 5** (navigation + PageShell) — Sets the global frame for all pages
3. **Phase 1** (landing page) — Highest visual impact, new hero
4. **Phase 2** (leaderboard) — Most-visited public page
5. **Phase 3** (flight dashboard) — Complex interactive page
6. **Phase 4** (commands) — Simpler page, quick wins
7. **Phase 6** (admin) — Internal, full dark conversion
8. **Phase 7** (performance/a11y) — Final polish pass

---

## Verification

1. **`npm run build`** — Ensure no TypeScript or build errors
2. **`npm run dev`** — Visual check all pages at desktop (1440px) and mobile (375px)
3. **Preview tool** — Screenshot each page, inspect key elements for correct colors/fonts
4. **Lighthouse audit** — Performance score >80, Accessibility score >90
5. **Reduced motion** — Toggle `prefers-reduced-motion: reduce` in dev tools, verify all pages degrade gracefully (no 3D, no scroll animations, instant transitions)
6. **Content parity** — Cross-reference every page's text content and functionality against the current production site to ensure nothing was lost
