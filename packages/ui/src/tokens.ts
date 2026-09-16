/**
 * RF Intelligence — Design Tokens
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for the entire monorepo.
 * CSS custom properties (brand.css) are the runtime layer; this file mirrors
 * them as typed JS constants for use in:
 *   • Three.js / canvas code (CSS vars not accessible there)
 *   • Runtime theming logic
 *   • Test assertions
 *   • Storybook / design tooling
 *
 * Rule: never hardcode hex values in component files — import from here or
 * reference the CSS vars via Tailwind utility classes backed by brand.css.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Red brand scale ──────────────────────────────────────────────────────────
// Derived from the logo mark. red-100 is the primary accent (#F24E4B).
// red-500 is the deep background used in high-contrast "red section" panels.

export const red = {
  /** #FA504D — accentHover, SweepButton sweep, nav active */
  50: "#FA504D",
  /** #F24E4B — --accent (primary CTA, focus ring, eyebrows) */
  100: "#F24E4B",
  /** #CF4240 — gradient midpoint, NavbarButton hover */
  200: "#CF4240",
  /** #AD3836 — gradient midpoint */
  300: "#AD3836",
  /** #8C2D2B — particle palette entry */
  400: "#8C2D2B",
  /** #692220 — --accent-deep, WhyRF/Benefits section backgrounds */
  500: "#692220",
} as const;

// ─── Semantic tokens — dark theme (default / data-theme="dark") ───────────────

export const dark = {
  background:      "#05060A",
  surface:         "#0D0E12",
  surfaceElevated: "#15161C",
  textPrimary:     "#F5F5F0",
  textSecondary:   "rgba(245, 245, 240, 0.7)",
  textMuted:       "rgba(245, 245, 240, 0.45)",
  /** Primary CTA, focus ring, eyebrows — maps to red.100 */
  accent:          "#F24E4B",
  accentHover:     "#FA504D",
  /** Deep-red section background — maps to red.500 */
  accentDeep:      "#692220",
  /** Near-black text rendered on red/accent buttons */
  accentForeground: "#0D0E12",
  border:          "rgba(245, 245, 240, 0.08)",
  borderStrong:    "rgba(245, 245, 240, 0.16)",
  focusRing:       "#F24E4B",
  /** Scrolled navbar / modal backdrop */
  glassBg:         "rgba(13, 14, 18, 0.72)",
  glassBlur:       "12px",
  /** Warm off-white variant used on red-section body copy */
  inkWarm:         "#F5F1EC",
  /** Warm off-white at 72% opacity — subtext on red sections */
  inkSoft:         "rgba(245, 241, 236, 0.72)",
  /** Warm off-white at 50% opacity — muted text on red sections */
  inkFaint:        "rgba(245, 241, 236, 0.5)",
  /** Salmon accent — eyebrow / highlight text on red section backgrounds */
  salmon:          "#FF9B8A",
  /** Mid-black used as card/section bg inside dark surfaces */
  blackMid:        "#0A0A0A",
  /** Red-tinted dark card bg (AboutBento feature cards) */
  redTintCard:     "#1A1414",
  /** Resting background for SweepButton */
  sweepButtonBg:   "#212121",
} as const;

// ─── Semantic tokens — light theme (data-theme="light") ──────────────────────
// Defined; not yet active in the app (Phase 1 polish item).
// --accent deepened to #D63E3B for AA contrast on white.

export const light = {
  background:      "#F8F8F6",
  surface:         "#FFFFFF",
  surfaceElevated: "#FFFFFF",
  textPrimary:     "#0F0F0E",
  textSecondary:   "rgba(15, 15, 14, 0.65)",
  textMuted:       "rgba(15, 15, 14, 0.40)",
  /** Deepened for WCAG AA on white — do NOT use red.100 here */
  accent:          "#D63E3B",
  accentHover:     "#F24E4B",
  accentDeep:      "#692220",
  accentForeground: "#FFFFFF",
  border:          "rgba(15, 15, 14, 0.12)",
  borderStrong:    "rgba(15, 15, 14, 0.22)",
  focusRing:       "#D63E3B",
  glassBg:         "rgba(255, 255, 255, 0.80)",
  glassBlur:       "12px",
} as const;

// ─── Colors — convenience re-export ──────────────────────────────────────────
// Legacy shape kept for backward compat with apps/website/lib/tokens.ts usage.

export const colors = { red, dark, light } as const;

// ─── Particle colour palette (Three.js canvas) ───────────────────────────────
// 60% off-white / 40% red scale — do not change the ratio without a visual review.

export const PARTICLE_COLORS: readonly string[] = [
  // Off-white (9 / 15 entries)
  dark.textPrimary, dark.textPrimary, dark.textPrimary,
  dark.textPrimary, dark.textPrimary, dark.textPrimary,
  dark.textPrimary, dark.textPrimary, dark.textPrimary,
  // Red scale (6 / 15 entries)
  red[50], red[100], red[200], red[300], red[400], red[500],
];

// ─── Typography ───────────────────────────────────────────────────────────────

export const fonts = {
  /** Body default — loaded as --font-geist-sans in layout.tsx */
  sans:      "var(--font-geist-sans, system-ui, sans-serif)",
  /** Code, eyebrow labels, monospace UI — loaded as --font-geist-mono */
  mono:      "var(--font-geist-mono, ui-monospace, monospace)",
  /** Display / editorial headings — loaded as --font-playfair */
  heading:   "var(--font-playfair, Georgia, serif)",
  /** RotatingCard labels, alternate text style — loaded as --font-stack-sans-text */
  stackSans: "var(--font-stack-sans-text, system-ui, sans-serif)",
} as const;

export const fontWeights = {
  normal:    400,
  medium:    500,
  semibold:  600,
  bold:      700,
} as const;

export const fontSize = {
  xs:    "0.75rem",   // 12px
  sm:    "0.875rem",  // 14px
  base:  "1rem",      // 16px
  lg:    "1.125rem",  // 18px
  xl:    "1.25rem",   // 20px
  "2xl": "1.5rem",    // 24px
  "3xl": "1.875rem",  // 30px
  "4xl": "2.25rem",   // 36px
  "5xl": "3rem",      // 48px
  "6xl": "3.75rem",   // 60px
} as const;

export const letterSpacing = {
  /** Hero H1, display headings */
  tight:    "-0.02em",
  /** Eyebrow labels in uppercase */
  wide:     "0.2em",
  /** General tighter tracking for headings */
  trackingTight: "normal", // Tailwind tracking-tight
} as const;

// ─── Spacing (4px base grid) ──────────────────────────────────────────────────

export const spacing = {
  1:  "0.25rem",  //  4px
  2:  "0.5rem",   //  8px
  3:  "0.75rem",  // 12px
  4:  "1rem",     // 16px
  5:  "1.25rem",  // 20px
  6:  "1.5rem",   // 24px
  8:  "2rem",     // 32px
  10: "2.5rem",   // 40px
  12: "3rem",     // 48px
  16: "4rem",     // 64px
  20: "5rem",     // 80px
  24: "6rem",     // 96px
} as const;

// ─── Border radius ────────────────────────────────────────────────────────────

export const borderRadius = {
  sm: "6px",
  md: "8px",
  lg: "12px",
} as const;

// ─── Motion ───────────────────────────────────────────────────────────────────

export const motion = {
  duration: {
    fast:   "150ms",
    normal: "250ms",
    slow:   "400ms",
    xslow:  "600ms",
  },
  easing: {
    /** Snappy deceleration — default for enter animations */
    out:   "cubic-bezier(0.16, 1, 0.3, 1)",
    /** Symmetric ease — default for toggles */
    inout: "cubic-bezier(0.45, 0, 0.55, 1)",
  },
} as const;

// ─── Logo asset paths ─────────────────────────────────────────────────────────
// Canonical source: packages/ui/assets/logo.png
// Apps symlink or copy from there; public/ paths below are the runtime URLs.

export const logoAssets = {
  /** PNG — only format available (no SVG exists). 551 KB, ~1536×1024 native. */
  png: "/logo.png",
  /** Favicon (same image data as logo.png, served as ICO) */
  favicon: "/favicon.ico",
  /** Apple touch icon */
  apple: "/apple-icon.png",
} as const;

// ─── TypeScript utility types ─────────────────────────────────────────────────

export type RedScale       = typeof red;
export type DarkTokens     = typeof dark;
export type LightTokens    = typeof light;
export type ColorTokens    = typeof colors;
export type FontTokens     = typeof fonts;
export type FontSizeTokens = typeof fontSize;
export type SpacingTokens  = typeof spacing;
export type BorderRadiusTokens = typeof borderRadius;
export type MotionTokens   = typeof motion;
