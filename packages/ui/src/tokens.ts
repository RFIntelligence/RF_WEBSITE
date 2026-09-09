/**
 * RF Intelligence Design Tokens
 * Single source of truth for colors, spacing, typography, radius, motion.
 * Used by both apps/website and apps/dashboard.
 */

export const colors = {
  // Red brand scale (from logo)
  red: {
    50: "#FA504D",
    100: "#F24E4B",
    200: "#CF4240",
    300: "#AD3836",
    400: "#8C2D2B",
    500: "#692220",
  },

  // Semantic tokens (dark theme - default)
  dark: {
    background: "#05060A",
    surface: "#0D0E12",
    surfaceElevated: "#15161C",
    textPrimary: "#F5F5F0",
    textSecondary: "rgba(245, 245, 240, 0.7)",
    textMuted: "rgba(245, 245, 240, 0.45)",
    accent: "#F24E4B",
    accentHover: "#FA504D",
    accentDeep: "#692220",
    accentForeground: "#0D0E12",
    border: "rgba(245, 245, 240, 0.08)",
    borderStrong: "rgba(245, 245, 240, 0.16)",
    focusRing: "#F24E4B",
    glassBg: "rgba(13, 14, 18, 0.72)",
    glassBlur: "12px",
  },

  // Light theme tokens
  light: {
    background: "#F8F8F6",
    surface: "#FFFFFF",
    surfaceElevated: "#FFFFFF",
    textPrimary: "#0F0F0E",
    textSecondary: "rgba(15, 15, 14, 0.65)",
    textMuted: "rgba(15, 15, 14, 0.40)",
    accent: "#D63E3B",
    accentHover: "#F24E4B",
    accentDeep: "#692220",
    accentForeground: "#FFFFFF",
    border: "rgba(15, 15, 14, 0.12)",
    borderStrong: "rgba(15, 15, 14, 0.22)",
    focusRing: "#D63E3B",
    glassBg: "rgba(255, 255, 255, 0.80)",
    glassBlur: "12px",
  },
} as const;

export const spacing = {
  1: "0.25rem",  // 4px
  2: "0.5rem",   // 8px
  3: "0.75rem",  // 12px
  4: "1rem",     // 16px
  5: "1.25rem",  // 20px
  6: "1.5rem",   // 24px
  8: "2rem",     // 32px
  10: "2.5rem",  // 40px
  12: "3rem",    // 48px
  16: "4rem",    // 64px
  20: "5rem",    // 80px
  24: "6rem",    // 96px
} as const;

export const fontSize = {
  xs: "0.75rem",   // 12px
  sm: "0.875rem",  // 14px
  base: "1rem",    // 16px
  lg: "1.125rem",  // 18px
  xl: "1.25rem",   // 20px
  "2xl": "1.5rem",   // 24px
  "3xl": "1.875rem", // 30px
  "4xl": "2.25rem",  // 36px
  "5xl": "3rem",     // 48px
  "6xl": "3.75rem",  // 60px
} as const;

export const borderRadius = {
  sm: "6px",
  md: "8px",
  lg: "12px",
} as const;

export const motion = {
  duration: {
    fast: "150ms",
    normal: "250ms",
    slow: "400ms",
    xslow: "600ms",
  },
  easing: {
    out: "cubic-bezier(0.16, 1, 0.3, 1)",
    inout: "cubic-bezier(0.45, 0, 0.55, 1)",
  },
} as const;

export const fonts = {
  sans: "var(--font-geist-sans, system-ui, sans-serif)",
  mono: "var(--font-geist-mono, ui-monospace, monospace)",
  heading: "var(--font-playfair, Georgia, serif)",
  stackSans: "var(--font-stack-sans-text, system-ui, sans-serif)",
} as const;

export type ColorTokens = typeof colors;
export type SpacingTokens = typeof spacing;
export type FontSizeTokens = typeof fontSize;
export type BorderRadiusTokens = typeof borderRadius;
export type MotionTokens = typeof motion;
export type FontTokens = typeof fonts;