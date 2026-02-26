/**
 * Token Mapping - CSS Custom Properties to Atlassian Tokens
 *
 * This file provides the complete token mapping between the current
 * CSS custom properties and Atlassian Design System tokens.
 *
 * The mapping preserves the legal/financial identity (navy/gold palette)
 * while adopting Atlassian's semantic token naming convention.
 *
 * @example
 * // Get the Atlassian token for a legacy variable
 * getTokenValue('navy') // Returns 'color.background.default'
 *
 * // Get all token mappings
 * getAllTokenMappings() // Returns complete TokenSystem
 *
 * // Get CSS variable name
 * getCssVarName('navy') // Returns '--navy' or 'var(--color.background.default)'
 */

import type {
  ColorTokenMapping,
  TypographyTokenMapping,
  SpacingTokenMapping,
  BorderRadiusTokenMapping,
  TokenSystem,
  LegacyColorToken,
  AtlassianColorToken,
} from '../types/tokens';

// =============================================================================
// Color Token Mappings
// =============================================================================

/**
 * Complete color token mappings from legacy CSS variables to Atlassian tokens
 *
 * MIGRATION STRATEGY:
 * The current palette is designed for a dark navy theme with gold accents,
 * conveying trust and authority for the legal/financial context.
 *
 * Mapping rationale:
 * - Navy → Background tokens (the dominant surface color)
 * - Gold → Accent/brand tokens (primary interactive color)
 * - Cream → Text tokens (primary text on dark backgrounds)
 * - Success → Success tokens (validation, completion states)
 * - Danger → Danger tokens (errors, warnings)
 */
export const COLOR_TOKEN_MAPPINGS: ColorTokenMapping[] = [
  // =============================================================================
  // Navy Palette (Background/System)
  // =============================================================================
  {
    legacy: 'navy',
    atlassian: 'color.background.default',
    hex: '#0F1E3C',
    oklch: 'oklch(0.185 0.03 260)',
    description: 'Primary background color - deep navy for authority and trust',
  },
  {
    legacy: 'navy-mid',
    atlassian: 'color.background.neutral.subtle',
    hex: '#162847',
    oklch: 'oklch(0.22 0.035 260)',
    description: 'Card and elevated surface backgrounds - slightly lighter navy',
  },
  {
    legacy: 'navy-light',
    atlassian: 'color.background.neutral.subtle.hovered',
    hex: '#1E3A5F',
    oklch: 'oklch(0.27 0.04 260)',
    description: 'Hover state backgrounds for interactive elements',
  },
  {
    legacy: 'navy-surface',
    atlassian: 'color.surface',
    hex: '#243B5E',
    oklch: 'oklch(0.32 0.045 260)',
    description: 'Surface color for borders, dividers, and subtle boundaries',
  },

  // =============================================================================
  // Gold Palette (Accent/Brand)
  // =============================================================================
  {
    legacy: 'gold',
    atlassian: 'color.text.accent.blue',
    hex: '#D4A017',
    oklch: 'oklch(0.72 0.15 85)',
    description: 'Primary accent color - gold for highlights and CTAs',
  },
  {
    legacy: 'gold-light',
    atlassian: 'color.background.selected',
    hex: '#F0C040',
    oklch: 'oklch(0.82 0.16 85)',
    description: 'Hover accent and selected state background',
  },

  // =============================================================================
  // Cream Palette (Text)
  // =============================================================================
  {
    legacy: 'cream',
    atlassian: 'color.text',
    hex: '#F5F5F0',
    oklch: 'oklch(0.96 0.005 90)',
    description: 'Primary text color - warm cream for readability on navy',
  },
  {
    legacy: 'cream-muted',
    atlassian: 'color.text.subtle',
    hex: '#E8E4D8',
    oklch: 'oklch(0.90 0.01 85)',
    description: 'Secondary text color - slightly darker cream for hierarchy',
  },

  // =============================================================================
  // Semantic Colors (Success/Danger)
  // =============================================================================
  {
    legacy: 'success',
    atlassian: 'color.background.success',
    hex: '#2E7D52',
    oklch: 'oklch(0.52 0.12 145)',
    description: 'Success state color - green for completion and validation',
  },
  {
    legacy: 'danger',
    atlassian: 'color.background.danger',
    hex: '#C0392B',
    oklch: 'oklch(0.50 0.18 25)',
    description: 'Danger/error state color - red for warnings and errors',
  },
];

// =============================================================================
// Typography Token Mappings
// =============================================================================

/**
 * Typography token mappings
 *
 * The current fonts are well-suited for legal/financial content:
 * - Playfair Display: Serif font conveying authority and tradition
 * - Space Grotesk: Modern monospace-like font for labels and stats
 * - Inter: Clean sans-serif for body text and descriptions
 *
 * These fonts are preserved and mapped to Atlassian's typography scale.
 */
export const TYPOGRAPHY_TOKEN_MAPPINGS: TypographyTokenMapping[] = [
  {
    legacy: 'font-display',
    family: "'Playfair Display'",
    fallbacks: ['Georgia', 'serif'],
    atlassianMapping: ['font.heading.large', 'font.heading.xlarge', 'font.heading.xxlarge'],
    description: 'Display and heading font - serif for legal authority',
  },
  {
    legacy: 'font-mono',
    family: "'Space Grotesk'",
    fallbacks: ['monospace'],
    atlassianMapping: ['font.code', 'font.ui'],
    description: 'Monospace font for labels, statistics, and badges',
  },
  {
    legacy: 'font-body',
    family: "'Inter'",
    fallbacks: ['sans-serif'],
    atlassianMapping: ['font.body', 'font.body.small', 'font.body.medium', 'font.body.large'],
    description: 'Body text font - clean sans-serif for readability',
  },
];

// =============================================================================
// Spacing Token Mappings
// =============================================================================

/**
 * Spacing tokens following Atlassian's 8px grid system
 */
export const SPACING_TOKEN_MAPPINGS: SpacingTokenMapping[] = [
  { name: '--space-0', atlassian: 'space.0', pixels: 0, rem: '0' },
  { name: '--space-025', atlassian: 'space.025', pixels: 2, rem: '0.125rem' },
  { name: '--space-050', atlassian: 'space.050', pixels: 4, rem: '0.25rem' },
  { name: '--space-075', atlassian: 'space.075', pixels: 6, rem: '0.375rem' },
  { name: '--space-100', atlassian: 'space.100', pixels: 8, rem: '0.5rem' },
  { name: '--space-150', atlassian: 'space.150', pixels: 12, rem: '0.75rem' },
  { name: '--space-200', atlassian: 'space.200', pixels: 16, rem: '1rem' },
  { name: '--space-250', atlassian: 'space.250', pixels: 20, rem: '1.25rem' },
  { name: '--space-300', atlassian: 'space.300', pixels: 24, rem: '1.5rem' },
  { name: '--space-400', atlassian: 'space.400', pixels: 32, rem: '2rem' },
  { name: '--space-500', atlassian: 'space.500', pixels: 40, rem: '2.5rem' },
  { name: '--space-600', atlassian: 'space.600', pixels: 48, rem: '3rem' },
  { name: '--space-800', atlassian: 'space.800', pixels: 64, rem: '4rem' },
  { name: '--space-1000', atlassian: 'space.1000', pixels: 80, rem: '5rem' },
];

// =============================================================================
// Border Radius Token Mappings
// =============================================================================

/**
 * Border radius tokens for consistent corner rounding
 */
export const BORDER_RADIUS_TOKEN_MAPPINGS: BorderRadiusTokenMapping[] = [
  { name: '--radius-0', atlassian: 'radius.0', pixels: 0 },
  { name: '--radius-050', atlassian: 'radius.050', pixels: 4 },
  { name: '--radius-100', atlassian: 'radius.100', pixels: 8 },
  { name: '--radius-150', atlassian: 'radius.150', pixels: 12 },
  { name: '--radius-200', atlassian: 'radius.200', pixels: 16 },
  { name: '--radius-300', atlassian: 'radius.300', pixels: 24 },
  { name: '--radius-400', atlassian: 'radius.400', pixels: 32 },
  { name: '--radius-full', atlassian: 'radius.full', pixels: 9999 },
];

// =============================================================================
// Complete Token System
// =============================================================================

/**
 * Complete token system export
 */
export const TOKEN_SYSTEM: TokenSystem = {
  colors: COLOR_TOKEN_MAPPINGS,
  typography: TYPOGRAPHY_TOKEN_MAPPINGS,
  spacing: SPACING_TOKEN_MAPPINGS,
  radius: BORDER_RADIUS_TOKEN_MAPPINGS,
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Lookup map for fast token resolution
 */
const legacyToAtlassianMap = new Map<LegacyColorToken, AtlassianColorToken>(
  COLOR_TOKEN_MAPPINGS.map((m) => [m.legacy, m.atlassian])
);

const atlassianToHexMap = new Map<AtlassianColorToken, string>(
  COLOR_TOKEN_MAPPINGS.map((m) => [m.atlassian, m.hex])
);

const legacyToHexMap = new Map<LegacyColorToken, string>(
  COLOR_TOKEN_MAPPINGS.map((m) => [m.legacy, m.hex])
);

/**
 * Get the Atlassian token path for a legacy CSS variable name
 *
 * @param legacy - Legacy CSS variable name (e.g., 'navy')
 * @returns Atlassian token path (e.g., 'color.background.default') or undefined
 *
 * @example
 * getTokenValue('navy') // Returns 'color.background.default'
 * getTokenValue('gold') // Returns 'color.text.accent.blue'
 */
export function getTokenValue(legacy: LegacyColorToken): AtlassianColorToken | undefined {
  return legacyToAtlassianMap.get(legacy);
}

/**
 * Get the hex color value for a token
 *
 * @param token - Legacy or Atlassian token name
 * @returns Hex color value (e.g., '#0F1E3C') or undefined
 *
 * @example
 * getHexValue('navy') // Returns '#0F1E3C'
 * getHexValue('color.background.default') // Returns '#0F1E3C'
 */
export function getHexValue(token: LegacyColorToken | AtlassianColorToken): string | undefined {
  // Try legacy first, then Atlassian
  if (legacyToHexMap.has(token as LegacyColorToken)) {
    return legacyToHexMap.get(token as LegacyColorToken);
  }
  return atlassianToHexMap.get(token as AtlassianColorToken);
}

/**
 * Get all token mappings
 *
 * @returns Complete TokenSystem object
 */
export function getAllTokenMappings(): TokenSystem {
  return TOKEN_SYSTEM;
}

/**
 * Get the CSS variable name for a token
 * Returns the Atlassian CSS custom property format
 *
 * @param legacy - Legacy CSS variable name
 * @returns CSS variable string (e.g., 'var(--color.background.default)')
 *
 * @example
 * getCssVarName('navy') // Returns 'var(--color.background.default, #0F1E3C)'
 */
export function getCssVarName(legacy: LegacyColorToken): string {
  const atlassianToken = legacyToAtlassianMap.get(legacy);
  const fallback = legacyToHexMap.get(legacy);

  if (atlassianToken && fallback) {
    return `var(--${atlassianToken}, ${fallback})`;
  }

  // Fallback to legacy variable if mapping not found
  return `var(--${legacy})`;
}

/**
 * Get the CSS variable name with fallback for a token
 *
 * @param legacy - Legacy CSS variable name
 * @param additionalFallback - Additional fallback value
 * @returns CSS variable string with multiple fallbacks
 *
 * @example
 * getCssVarWithFallback('navy', 'blue') // Returns 'var(--color.background.default, var(--navy, #0F1E3C))'
 */
export function getCssVarWithFallback(
  legacy: LegacyColorToken,
  additionalFallback?: string
): string {
  const atlassianToken = legacyToAtlassianMap.get(legacy);
  const hexFallback = legacyToHexMap.get(legacy);

  if (atlassianToken && hexFallback) {
    const fallbacks = additionalFallback
      ? `var(--${legacy}, ${additionalFallback})`
      : `var(--${legacy}, ${hexFallback})`;
    return `var(--${atlassianToken}, ${fallbacks})`;
  }

  return `var(--${legacy})`;
}

/**
 * Get color token mapping by legacy name
 *
 * @param legacy - Legacy CSS variable name
 * @returns Complete ColorTokenMapping object or undefined
 */
export function getColorMapping(legacy: LegacyColorToken): ColorTokenMapping | undefined {
  return COLOR_TOKEN_MAPPINGS.find((m) => m.legacy === legacy);
}

/**
 * Get all color tokens for a specific category
 *
 * @param category - Token category ('navy', 'gold', 'cream', 'success', 'danger')
 * @returns Array of matching ColorTokenMapping objects
 */
export function getColorsByCategory(
  category: 'navy' | 'gold' | 'cream' | 'success' | 'danger'
): ColorTokenMapping[] {
  return COLOR_TOKEN_MAPPINGS.filter((m) => m.legacy.startsWith(category));
}

/**
 * Generate CSS custom property definitions for all tokens
 * Useful for creating fallback CSS
 *
 * @returns CSS string with all custom property definitions
 */
export function generateCssCustomProperties(): string {
  const colorProps = COLOR_TOKEN_MAPPINGS.map(
    (m) => `  --${m.atlassian}: ${m.hex}; /* Mapped from --${m.legacy} */`
  ).join('\n');

  const spacingProps = SPACING_TOKEN_MAPPINGS.map(
    (m) => `  --${m.atlassian}: ${m.rem};`
  ).join('\n');

  const radiusProps = BORDER_RADIUS_TOKEN_MAPPINGS.map(
    (m) => `  --${m.atlassian}: ${m.pixels}px;`
  ).join('\n');

  return `:root {
  /* Color Tokens */
${colorProps}

  /* Spacing Tokens */
${spacingProps}

  /* Border Radius Tokens */
${radiusProps}
}`;
}

// =============================================================================
// Export Token Constants for Direct Access
// =============================================================================

/**
 * Legacy color values as constants for direct access
 */
export const LEGACY_COLORS = {
  NAVY: '#0F1E3C',
  NAVY_MID: '#162847',
  NAVY_LIGHT: '#1E3A5F',
  NAVY_SURFACE: '#243B5E',
  GOLD: '#D4A017',
  GOLD_LIGHT: '#F0C040',
  CREAM: '#F5F5F0',
  CREAM_MUTED: '#E8E4D8',
  SUCCESS: '#2E7D52',
  DANGER: '#C0392B',
} as const;

/**
 * Typography font families as constants
 */
export const FONT_FAMILIES = {
  DISPLAY: "'Playfair Display', Georgia, serif",
  MONO: "'Space Grotesk', monospace",
  BODY: "'Inter', sans-serif",
} as const;
