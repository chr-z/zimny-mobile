/**
 * Design Tokens — Zimny Magazine Design System
 *
 * Single source of truth for colors, typography, spacing, and radii.
 * Every component must import from here instead of hardcoding values.
 *
 * Zimny é preto e branco — sem dourado. Estética Quiet Luxury.
 */

// ─── Theme Color Set Type ──────────────────────────────────────────────────
export type ThemeColorSet = {
  surface:          string;
  surfaceAlt:       string;
  surfaceElevated:  string;
  text:             string;
  textSecondary:    string;
  textTertiary:     string;
  border:           string;
  borderStrong:     string;
  overlay:          string;
  skeleton:         string;
  skeletonPulse:    string;
};

// ─── Semantic Colors (Preto & Branco) ──────────────────────────────────────
export const color: { light: ThemeColorSet; dark: ThemeColorSet } = {
  light: {
    surface:          '#0A0A0A',
    surfaceAlt:       '#1C1C1E',
    surfaceElevated:  '#2C2C2E',
    text:             '#FFFFFF',
    textSecondary:    '#8E8E93',
    textTertiary:     'rgba(255,255,255,0.30)',
    border:           'rgba(255,255,255,0.08)',
    borderStrong:     'rgba(255,255,255,0.15)',
    overlay:          'rgba(0,0,0,0.65)',
    skeleton:         '#3A3A3C',
    skeletonPulse:    '#2C2C2E',
  },
  dark: {
    surface:          '#0A0A0A',
    surfaceAlt:       '#1C1C1E',
    surfaceElevated:  '#2C2C2E',
    text:             '#FFFFFF',
    textSecondary:    '#8E8E93',
    textTertiary:     'rgba(255,255,255,0.30)',
    border:           'rgba(255,255,255,0.08)',
    borderStrong:     'rgba(255,255,255,0.15)',
    overlay:          'rgba(0,0,0,0.65)',
    skeleton:         '#3A3A3C',
    skeletonPulse:    '#2C2C2E',
  },
};

// ─── Typography ─────────────────────────────────────────────────────────────
export const font = {
  serif:   'Georgia',
  mono:    'SpaceMono',
  // Fallback stack for system sans-serif
  sans: undefined, // uses system default

  // Type scale (in pixels)
  size: {
    kicker:   9,
    caption:  11,
    small:    13,
    body:     16,
    bodyLarge: 18,
    title:    20,
    headline: 24,
    display:  28,
    hero:     32,
  } as const,

  // Line heights (multiplier × fontSize)
  leading: {
    tight:   1.15,
    normal:  1.4,
    relaxed: 1.6,
  } as const,

  // Letter spacing
  tracking: {
    tight:   '-0.02',
    normal:  '0',
    wide:    '0.02',
    wider:   '0.05',
    widest:  '0.15',
    editorial: '0.2',
    kicker:  '4', // px-based for uppercase kickers
  } as const,
} as const;

// ─── Spacing ────────────────────────────────────────────────────────────────
export const spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

// ─── Border Radius ──────────────────────────────────────────────────────────
export const radius = {
  sm:   4,
  md:   8,
  lg:   12,
  xl:   16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
} as const;

// ─── Shadows ────────────────────────────────────────────────────────────────
export const shadow = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
} as const;

// ─── Animation ──────────────────────────────────────────────────────────────
export const spring = {
  gentle:  { damping: 28, stiffness: 200, mass: 0.85 } as const,
  snappy:  { damping: 18, stiffness: 300, mass: 0.7 } as const,
  bouncy:  { damping: 12, stiffness: 250, mass: 0.6 } as const,
} as const;

export const timing = {
  fast:   150,
  normal: 250,
  slow:   400,
} as const;

// ─── Glass Intensity ────────────────────────────────────────────────────────
export const glass = {
  light:  60,
  medium: 80,
  heavy:  90,
} as const;

// ─── Tab Bar ────────────────────────────────────────────────────────────────
export const TAB_BAR_HEIGHT = 50;