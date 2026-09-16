/**
 * Design token constants — mirrors the CSS custom properties defined in globals.css.
 * Use these in Three.js / canvas code where CSS vars are not accessible.
 * All other component styling must use Tailwind utility classes backed by the CSS vars.
 */

export const COLORS = {
  // Red scale (brand accent spectrum)
  red50: "#FA504D",
  red100: "#F24E4B",
  red200: "#CF4240",
  red300: "#AD3836",
  red400: "#8C2D2B",
  red500: "#692220",

  // Semantic
  background: "#05060A",
  surface: "#0D0E12",
  surfaceElevated: "#15161C",
  textPrimary: "#F5F5F0",
  accent: "#F24E4B",
  accentHover: "#FA504D",
  accentDeep: "#692220",
} as const;

/** Particle color palette for the Three.js canvas — 60% white/off-white, 40% red scale */
export const PARTICLE_COLORS: string[] = [
  // Off-white (60% weight — 9 entries out of 15)
  COLORS.textPrimary,
  COLORS.textPrimary,
  COLORS.textPrimary,
  COLORS.textPrimary,
  COLORS.textPrimary,
  COLORS.textPrimary,
  COLORS.textPrimary,
  COLORS.textPrimary,
  COLORS.textPrimary,
  // Red scale (40% weight — 6 entries out of 15)
  COLORS.red50,
  COLORS.red100,
  COLORS.red200,
  COLORS.red300,
  COLORS.red400,
  COLORS.red500,
];
