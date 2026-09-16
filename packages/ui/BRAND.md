# RF Intelligence — Brand System

> **Single source of truth:** `packages/ui`
>
> Every color, font, logo, and copy token originates here.
> Apps consume the tokens — they do not redeclare them.

---

## Table of Contents

1. [File Map](#file-map)
2. [Colors](#colors)
3. [Fonts](#fonts)
4. [Logo Inventory](#logo-inventory)
5. [Voice & Tone](#voice--tone)
6. [Clash Report](#clash-report)
7. [Usage Rules — Marketing Site vs Dashboard](#usage-rules)
8. [How to Consume in an App](#how-to-consume-in-an-app)

---

## File Map

```
packages/ui/
├── assets/
│   └── logo.png              ← canonical logo (551 KB PNG, ~1536×1024)
└── src/
    ├── brand.css             ← CSS custom properties — import this in globals.css
    ├── tokens.ts             ← JS/TS mirror of brand.css — import in canvas/JS code
    ├── voice.ts              ← copy constants: CTAs, empty states, onboarding
    ├── index.ts              ← public API (re-exports tokens + voice + components)
    └── components/
        ├── Logo.tsx          ← shared Logo component (uses logo.png from /public)
        └── Button.tsx        ← shared Button (variants: primary/secondary/ghost/outline)
```

---

## Colors

### Red brand scale

Derived from the logo mark. **Never alias these to shadcn `--accent`** — they are separate namespaces (see [Clash Report](#clash-report)).

| Token (CSS var) | Token (JS) | Hex | Use |
|---|---|---|---|
| `--red-50` | `red[50]` | `#FA504D` | accentHover, SweepButton sweep, nav active |
| `--red-100` | `red[100]` | `#F24E4B` | **Primary accent** — CTA buttons, focus ring, eyebrows |
| `--red-200` | `red[200]` | `#CF4240` | Gradient midpoint, NavbarButton hover |
| `--red-300` | `red[300]` | `#AD3836` | Gradient midpoint |
| `--red-400` | `red[400]` | `#8C2D2B` | Particle palette entry |
| `--red-500` | `red[500]` | `#692220` | `--accent-deep` — WhyRF / Benefits section backgrounds |

### Semantic tokens — dark theme (default)

The app is dark-first. `data-theme="dark"` is set on `<html>` at the root layout of every app.

| CSS var | Resolved value | Role |
|---|---|---|
| `--background` | `#05060A` | Page / app background |
| `--surface` | `#0D0E12` | Cards, form containers, table rows |
| `--surface-elevated` | `#15161C` | Elevated surfaces, nav pill hover |
| `--text-primary` | `#F5F5F0` | Body text, headings |
| `--text-secondary` | `rgba(245,245,240,0.7)` | Subtext, nav items |
| `--text-muted` | `rgba(245,245,240,0.45)` | Hints, meta, placeholders |
| `--accent` | `var(--red-100)` → `#F24E4B` | Primary CTA, focus ring |
| `--accent-hover` | `var(--red-50)` → `#FA504D` | Hover on accent elements |
| `--accent-deep` | `var(--red-500)` → `#692220` | Deep-red section backgrounds |
| `--accent-foreground` | `#0D0E12` | Text on red/accent buttons |
| `--border` | `rgba(245,245,240,0.08)` | Subtle dividers |
| `--border-strong` | `rgba(245,245,240,0.16)` | Form fields, strong dividers |
| `--focus-ring` | `var(--red-100)` | `:focus-visible` outline |
| `--glass-bg` | `rgba(13,14,18,0.72)` | Scrolled navbar, modal backdrop |
| `--glass-blur` | `12px` | `backdrop-filter: blur()` value |

#### Component-level surface constants

Used in animation-heavy components (canvas, styled-components) where Tailwind classes aren't practical. Available as CSS vars and mirrored in `tokens.ts`.

| CSS var | Hex | Source component |
|---|---|---|
| `--black-mid` | `#0A0A0A` | Card/section bg inside dark surfaces |
| `--red-tint-card` | `#1A1414` | AboutBento feature card bg |
| `--sweep-btn-bg` | `#212121` | SweepButton resting state |
| `--ink-warm` | `#F5F1EC` | Body copy on red section backgrounds |
| `--ink-soft` | `rgba(245,241,236,0.72)` | Subtext on red sections |
| `--ink-faint` | `rgba(245,241,236,0.50)` | Muted text on red sections |
| `--salmon` | `#FF9B8A` | Eyebrow/highlight text on red backgrounds |

### Semantic tokens — light theme

Defined but **not yet active** — `ThemeProvider` is locked to dark (Phase 1 debt). The toggle is wired; activating it is a dedicated polish pass.

| CSS var | Value | Note |
|---|---|---|
| `--background` | `#F8F8F6` | |
| `--surface` | `#FFFFFF` | |
| `--accent` | `#D63E3B` | **Deepened from red-100 for WCAG AA on white** |
| `--accent-hover` | `#F24E4B` | |
| `--accent-foreground` | `#FFFFFF` | |

> **WCAG note:** `#F24E4B` (red-100) on `#FFFFFF` = 3.0:1 contrast ratio — fails AA for normal text (requires 4.5:1). Only `#D63E3B` clears AA on white. Never use `red-100` as text on light backgrounds.

### Dashboard-specific tokens

These live in `apps/dashboard/app/globals.css` only — they do not belong in `brand.css`.

| CSS var | Value | Role |
|---|---|---|
| `--dash-sidebar-bg` | `#090A0E` | Sidebar background (deeper than `--background`) |
| `--dash-sidebar-width` | `240px` | Expanded sidebar |
| `--dash-sidebar-collapsed` | `56px` | Collapsed sidebar |
| `--dash-topbar-height` | `48px` | Top bar height |
| `--dash-row-bg-alt` | `#0F1016` | Zebra stripe — even rows |
| `--dash-row-hover` | `rgba(242,78,75,0.05)` | Table row hover (brand red at 5%) |
| `--dash-row-selected` | `rgba(242,78,75,0.09)` | Selected row (brand red at 9%) |
| `--dash-font-size-data` | `0.8125rem / 13px` | Table cells, metadata |
| `--dash-font-size-label` | `0.6875rem / 11px` | Column headers, badges |
| `--dash-status-running` | `#4ADE80` | Green-400 — running state |
| `--dash-status-paused` | `#FACC15` | Yellow-400 — paused state |
| `--dash-status-error` | `var(--red-100)` | Brand red — error state |
| `--dash-status-deploying` | `#60A5FA` | Blue-400 — deploying (animated pulse) |
| `--dash-chart-primary` | `var(--red-100)` | Primary data series |
| `--dash-chart-secondary` | `#60A5FA` | Secondary data series (blue) |

---

## Fonts

### Loaded fonts

All four fonts are loaded in both `apps/website/app/layout.tsx` and `apps/dashboard/app/layout.tsx` via `next/font/google`. They are self-hosted at build time — no browser requests to Google.

| CSS variable | Font family | Weights loaded | Primary use |
|---|---|---|---|
| `--font-geist-sans` | **Geist** | Variable | Body default — `font-family: var(--font-sans)` |
| `--font-geist-mono` | **Geist Mono** | Variable | Code, eyebrow labels, column headers, mono UI |
| `--font-playfair` | **Playfair Display** | Variable | Display / editorial headings (`--font-heading`) |
| `--font-stack-sans-text` | **Stack Sans Text** | Variable | RotatingCard labels, alternate text elements |

### Tailwind mapping (`@theme inline`)

```
--font-sans:    'DM Sans', var(--font-geist-sans), system-ui
--font-mono:    'JetBrains Mono', var(--font-geist-mono), monospace
--font-heading: var(--font-playfair)
```

> `DM Sans` and `JetBrains Mono` are in the fallback stack but are not loaded — the actual rendered fonts are Geist and Geist Mono respectively.

### Type conventions

| Pattern | Value | Where |
|---|---|---|
| Display heading tracking | `tracking-[-0.02em]` | Hero H1 |
| Eyebrow tracking | `tracking-[0.2em]` | All eyebrow labels (uppercase) |
| Heading | `tracking-tight` | Section headings |
| Body | `antialiased`, default tracking | Paragraphs |
| Fluid display | `clamp(2.75rem, 6vw, 5.5rem)` | Hero H1 |

---

## Logo Inventory

| File | Location | Format | Size | Use |
|---|---|---|---|---|
| `logo.png` | `packages/ui/assets/` | PNG | 551 KB, ~1536×1024 | **Canonical source** |
| `logo.png` | `apps/website/public/` | PNG | 551 KB | Marketing site runtime |
| `logo.png` | `apps/dashboard/public/` | PNG | copy | Dashboard runtime |
| `favicon.ico` | `apps/website/public/` | ICO | 551 KB | Browser tab (same data as logo.png) |
| `apple-icon.png` | `apps/website/app/` | PNG | — | Apple touch icon |
| `icon.png` | `apps/website/app/` | PNG | — | PWA icon |

### Important limitations

- **No SVG version exists.** The logo is PNG-only. This means it will appear slightly soft at sizes smaller than ~72px wide. A future task is to produce an SVG trace of the mark and add it as `logo.svg` to `packages/ui/assets/`.
- **No separate wordmark file.** The `Logo.tsx` component composes the PNG mark with the "RF Intelligence" text rendered in Geist Semibold. If you need a standalone wordmark graphic, use the component.
- **OG image config** in `apps/website` references the logo at `1536×1024` — this is the native resolution used for social sharing.

### Using the Logo component

```tsx
import { Logo } from "@rf-intelligence/ui";

// Sizes: "sm" (28px mark), "md" (36px mark — default), "lg" (48px mark)
<Logo size="md" />                         // links to "/"
<Logo size="sm" showText={false} />        // mark only, no wordmark
<Logo size="lg" href="/dashboard" />       // custom link target
```

The component uses `/logo.png` as its `src`. Each app must have `logo.png` in its `public/` directory — Next.js `Image` resolves public assets per-app, not from the package.

---

## Voice & Tone

### Register

Enterprise-grade automation. Not a generic startup landing page. The copy is terse, declarative, and B2B — it never uses hype, superlatives, or em dashes in headlines.

### Core framing: Understand → Decide → Execute

Every product touch — hero copy, onboarding, empty states, error messages — should reinforce this triad. RF handles the Understand and Execute layers so the user can focus on Decide.

### Rules

| Rule | Good | Bad |
|---|---|---|
| Short sentences | "RF handles the repeatable work." | "RF Intelligence is an incredibly powerful platform that will transform the way your team works." |
| Hedged claims | "Designed to reduce manual work." | "Reduces manual work by 80%." |
| No em dashes in headlines | "Not Another Tool." | "Not Another Tool — We Mean It" |
| No superlatives | "Built to run quietly." | "The best automation platform ever built." |
| Capitalize impact headings | "BUILT TO RUN QUIETLY." | "Built to run quietly." |
| Eyebrow prefix pattern | `/ what we build` | `What we build:` |
| CTA direction | Always toward demo or contact | "Sign up free" / "Start trial" |

### All copy constants are in `voice.ts`

```ts
import { brand, framing, cta, sections, dashboard } from "@rf-intelligence/ui";

// Brand positioning
brand.tagline       // "The intelligence layer behind modern business."
framing.triadPhrase // "Understand. Decide. Execute."

// CTAs
cta.primary         // "Book Free Demo"
cta.seeInAction     // "See It in Action"

// Dashboard empty states
dashboard.emptyStates.workflows.heading  // "No workflows yet."
dashboard.emptyStates.activityFeed.body  // "RF filters out the noise..."

// Onboarding steps
dashboard.onboarding.step1.heading  // "Connect your first workflow."
dashboard.onboarding.step2.heading  // "Review what RF found."
dashboard.onboarding.step3.heading  // "RF is running."
```

---

## Clash Report

Three places where the marketing site's brand tokens conflict with shadcn/ui defaults. Each clash has been resolved in `brand.css` — the resolution and rationale are documented here so future contributors know which side won and why.

---

### CLASH 1 — `--accent`: brand red vs shadcn green

| | Value | Colour |
|---|---|---|
| shadcn default `--accent` | `oklch(0.7 0.18 145)` | Mid-teal / green |
| RF brand `--accent` | `#F24E4B` (red-100) | **Brand red** |

**Who wins:** RF brand red.

**Why:** The `--accent` var is the highest-visibility interactive color. Letting shadcn's green show through on primary CTAs, focus rings, and eyebrow labels would break brand recognition on the most prominent UI elements. shadcn's green is a reasonable default for neutral apps — it is not appropriate for a product whose logo, marketing site, and identity are built around a specific red.

**Mechanism:** The `[data-theme="dark"]` block in `brand.css` overrides `:root`'s `--accent` to `var(--red-100)`. Since both `apps/website` and `apps/dashboard` set `data-theme="dark"` on `<html>`, the brand red wins at runtime everywhere.

**Collateral:** Any shadcn component that uses `bg-accent` or `text-accent` will render in brand red, not green. This is intentional. If a specific shadcn component looks wrong, use `bg-secondary` or a custom class rather than overriding `--accent` back to green.

---

### CLASH 2 — `--ring`: shadcn green focus ring vs brand red

| | Value |
|---|---|
| shadcn default `--ring` | `oklch(0.7 0.18 145)` — green |
| Brand `--ring` | `oklch(0.62 0.2 25)` — red (≈ #F24E4B) |

**Who wins:** Brand red.

**Why:** The focus ring is a key accessibility indicator. A green focus ring on a dark background with red interactive elements creates visual inconsistency — users learn "red = interactive" from the buttons and nav, then see a green ring on focus. Consistency of the interactive color system takes precedence.

**Mechanism:** `--ring` overridden to `oklch(0.62 0.2 25)` in `brand.css` `:root`. The `@theme inline` block maps `--color-ring: var(--ring)` so Tailwind's `ring-*` utilities follow.

**Decision standing:** Keep brand red. If a specific component needs the green ring for semantic reasons (e.g. a success confirmation field), scope it locally with `ring-[color:#4ADE80]`.

---

### CLASH 3 — `--sidebar-primary` and `--sidebar-ring`: shadcn green vs brand red (dashboard)

| | Value |
|---|---|
| shadcn default `--sidebar-primary` | `oklch(0.7 0.18 145)` — green |
| Brand resolution | `oklch(0.62 0.2 25)` — red |

**Who wins:** Brand red.

**Why:** The sidebar is the most persistent branded surface in the dashboard. Active nav items and sidebar highlights using shadcn's green would look entirely off-brand against a `#090A0E` background that's clearly part of the RF dark palette. The sidebar active/selected state should use the same red the marketing site uses for nav active states.

**Mechanism:** `--sidebar-primary` and `--sidebar-ring` overridden to `oklch(0.62 0.2 25)` in `brand.css`.

---

### PRESERVED: shadcn green in `--chart-2` only

The shadcn green (`oklch(0.7 0.18 145)`) is **intentionally preserved** as `--chart-2` in the chart palette. Data visualisation uses multiple colors to distinguish series — the brand red covers `--chart-1` and `--dash-chart-primary`, so green is a natural second series color for line/bar charts showing comparative data (e.g. RF-automated vs manual processing volume).

**Rule:** Use `--chart-2` / `--dash-chart-secondary` only in data charts, never in UI chrome.

---

### NOT A CLASH — `--destructive`

shadcn's `--destructive` is `oklch(0.65 0.2 25)` — a warm red close to the brand red family. It is kept as-is. Destructive actions (delete confirmations, error states) intentionally use a red tone — there is no conflict with the brand, just a close neighbor. If you need to distinguish destructive red from brand accent red in a design, use `--red-200` (`#CF4240`) for destructive and `--red-100` for accent.

---

## Usage Rules

### What is consistent across both apps

These elements **must match** between the marketing site and the dashboard. They are the user's trust anchors — the thing that makes the dashboard feel like it belongs to the same company as the site they came from.

| Element | Rule |
|---|---|
| **Logo** | Always `<Logo />` from `@rf-intelligence/ui`. Never swap in a different image, resize disproportionately, or change the wordmark text. |
| **Primary accent color** | `--accent` → `#F24E4B`. The same red on CTA buttons, focus rings, and active nav states in both apps. |
| **Background** | `#05060A` on the page/app root. Both apps are dark-first. |
| **Font stack** | Geist (body), Geist Mono (labels/code), Playfair Display (headings), Stack Sans Text (alternate). All four loaded from `next/font/google` in each app's layout. |
| **Voice** | Same register — terse, B2B, Understand → Decide → Execute. Use `voice.ts` constants. |
| **Focus ring** | `2px solid #F24E4B`. Never change this in either app. |

### What intentionally differs

The dashboard is data-dense. The marketing site is full-bleed and editorial. These differences are by design — they are not inconsistencies.

| Dimension | Marketing site | Dashboard |
|---|---|---|
| **Layout** | Full-bleed sections, hero with GLSL canvas | Shell grid (sidebar + topbar + content) |
| **Type sizes** | Fluid clamp(), display at 48–60px | Compact: 13px data cells, 11px column headers |
| **Spacing** | Generous (64–96px vertical rhythm) | Tight (4–8px sub-grid for dense rows) |
| **Surface depth** | 2 levels (background, surface) | 4 levels (sidebar, topbar, surface, elevated) |
| **Red section backgrounds** | `--accent-deep` (#692220) full-bleed panels | Red used only for accents, never as a section fill |
| **Animation** | Particle canvas, scroll-pinned flow sections, GSAP | Subtle: status dot pulse, row hover transitions only |
| **shadcn components** | Minimal — site is mostly custom | Heavy — tables, sidebars, dialogs, dropdowns all shadcn |

---

## How to Consume in an App

### 1. Import brand.css in globals.css

```css
/* apps/your-app/app/globals.css */
@import "tailwindcss";
@import "@rf-intelligence/ui/brand.css";

/* App-specific tokens on top: */
:root {
  --my-app-token: value;
}
```

### 2. Load fonts in layout.tsx

```tsx
import { Geist, Geist_Mono, Playfair_Display, Stack_Sans_Text } from "next/font/google";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], display: "swap" });
const stackSansText = Stack_Sans_Text({ variable: "--font-stack-sans-text", subsets: ["latin"], display: "swap" });

// On <html>: data-theme="dark" suppressHydrationWarning
// On <body>: className with all four .variable values
```

### 3. Copy logo.png to app's public/

```bash
cp packages/ui/assets/logo.png apps/your-app/public/logo.png
```

### 4. Use typed copy from voice.ts

```ts
import { dashboard, cta, framing } from "@rf-intelligence/ui";

// Empty state
<p>{dashboard.emptyStates.workflows.body}</p>

// CTA
<Button>{cta.primary}</Button>

// Onboarding
<h2>{dashboard.onboarding.step1.heading}</h2>
<p>{dashboard.onboarding.step1.body}</p>
```

### 5. Use JS tokens for canvas / non-CSS contexts

```ts
import { red, dark, PARTICLE_COLORS } from "@rf-intelligence/ui";

// Three.js material color
new THREE.MeshBasicMaterial({ color: red[100] });

// Canvas fill
ctx.fillStyle = dark.accent;
```
