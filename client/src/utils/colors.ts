/**
 * Color Utility Functions for Atlassian Token System
 *
 * This module provides utility functions for working with colors
 * in the context of the Atlassian Design System token migration.
 *
 * Functions include:
 * - Color space conversions (hex, OKLCH, RGB)
 * - Token lookup by color value
 * - Color manipulation utilities
 * - Contrast checking for accessibility
 */

import { COLOR_TOKEN_MAPPINGS, LEGACY_COLORS } from '../lib/token-mapping';
import type { LegacyColorToken, ColorTokenMapping } from '../types/tokens';

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * RGB color representation
 */
export interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

/**
 * OKLCH color representation
 * OKLCH is a perceptual color space that better represents how humans see colors
 */
export interface OKLCH {
  l: number; // Lightness: 0-1
  c: number; // Chroma: 0-0.4 (approximately)
  h: number; // Hue: 0-360
}

/**
 * HSL color representation
 */
export interface HSL {
  h: number; // Hue: 0-360
  s: number; // Saturation: 0-100
  l: number; // Lightness: 0-100
}

// =============================================================================
// Hex Conversion Functions
// =============================================================================

/**
 * Validate a hex color string
 *
 * @param hex - Hex color string (with or without #)
 * @returns True if valid hex color
 */
export function isValidHex(hex: string): boolean {
  return /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

/**
 * Normalize a hex color to 6-digit format with #
 *
 * @param hex - Hex color string
 * @returns Normalized hex string (e.g., '#0F1E3C')
 */
export function normalizeHex(hex: string): string {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    return `#${clean[0]}${clean[0]}${clean[1]}${clean[1]}${clean[2]}${clean[2]}`;
  }
  return `#${clean.toUpperCase()}`;
}

/**
 * Convert hex color to RGB
 *
 * @param hex - Hex color string (e.g., '#0F1E3C' or '0F1E3C')
 * @returns RGB object or null if invalid
 *
 * @example
 * hexToRgb('#D4A017') // Returns { r: 212, g: 160, b: 23 }
 */
export function hexToRgb(hex: string): RGB | null {
  if (!isValidHex(hex)) return null;

  const normalized = normalizeHex(hex);
  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);

  return { r, g, b };
}

/**
 * Convert RGB to hex color
 *
 * @param rgb - RGB color object
 * @returns Hex color string (e.g., '#D4A017')
 *
 * @example
 * rgbToHex({ r: 212, g: 160, b: 23 }) // Returns '#D4A017'
 */
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, '0').toUpperCase();
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

// =============================================================================
// OKLCH Conversion Functions
// =============================================================================

/**
 * Convert sRGB linear to OKLCH
 * Uses the OKLCH color space which is perceptually uniform
 *
 * @param rgb - RGB color object
 * @returns OKLCH color object
 */
export function rgbToOklch(rgb: RGB): OKLCH {
  // Convert RGB to linear RGB
  const toLinear = (c: number) => {
    const srgb = c / 255;
    return srgb <= 0.04045
      ? srgb / 12.92
      : Math.pow((srgb + 0.055) / 1.055, 2.4);
  };

  const rLinear = toLinear(rgb.r);
  const gLinear = toLinear(rgb.g);
  const bLinear = toLinear(rgb.b);

  // Convert linear RGB to CIE XYZ (D65)
  const x = rLinear * 0.4124564 + gLinear * 0.3575761 + bLinear * 0.1804375;
  const y = rLinear * 0.2126729 + gLinear * 0.7151522 + bLinear * 0.0721750;
  const z = rLinear * 0.0193339 + gLinear * 0.1191920 + bLinear * 0.9503041;

  // Convert XYZ to OKLab
  const l = Math.cbrt(x * 0.8189330101 + y * 0.3618667424 + z * -0.1288597137);
  const m = Math.cbrt(x * 0.0329845436 + y * 0.9293118715 + z * 0.0361456387);
  const s = Math.cbrt(x * 0.0482003018 + y * 0.2643662691 + z * 0.6338517070);

  const L = l * 0.2104542553 + m * 0.7936177850 + s * -0.0040720468;
  const a = l * 1.9779984951 + m * -2.4285922050 + s * 0.4505937099;
  const b = l * 0.0259040375 + m * 0.7827717662 + s * -0.8086757660;

  // Convert OKLab to OKLCH
  const C = Math.sqrt(a * a + b * b);
  let H = Math.atan2(b, a) * (180 / Math.PI);
  if (H < 0) H += 360;

  return {
    l: Math.max(0, Math.min(1, L)),
    c: Math.max(0, C),
    h: H,
  };
}

/**
 * Convert hex color to OKLCH
 *
 * @param hex - Hex color string
 * @returns OKLCH color object or null if invalid
 *
 * @example
 * hexToOklch('#D4A017') // Returns { l: 0.72, c: 0.15, h: 85 }
 */
export function hexToOklch(hex: string): OKLCH | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return rgbToOklch(rgb);
}

/**
 * Convert OKLCH to RGB
 *
 * @param oklch - OKLCH color object
 * @returns RGB color object
 */
export function oklchToRgb(oklch: OKLCH): RGB {
  const { l, c, h } = oklch;

  // Convert OKLCH to OKLab
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);

  // Convert OKLab to LMS
  const L = l + 0.3963377774 * a + 0.2158037573 * b;
  const M = l - 0.1055613458 * a - 0.0638541728 * b;
  const S = l - 0.0894841775 * a - 1.2914855480 * b;

  // Convert LMS to XYZ
  const x = L * L * L;
  const y = M * M * M;
  const z = S * S * S;

  // Convert XYZ to linear RGB (D65)
  const rLinear = x * 1.2270138511 + y * -0.5577999807 + z * 0.2812561490;
  const gLinear = x * -0.0405801784 + y * 1.1122568696 + z * -0.0716766787;
  const bLinear = x * -0.0763812845 + y * -0.4214819784 + z * 1.5861632204;

  // Convert linear RGB to sRGB
  const toSRGB = (c: number) => {
    return c <= 0.0031308
      ? c * 12.92
      : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  };

  return {
    r: Math.round(Math.max(0, Math.min(255, toSRGB(rLinear) * 255))),
    g: Math.round(Math.max(0, Math.min(255, toSRGB(gLinear) * 255))),
    b: Math.round(Math.max(0, Math.min(255, toSRGB(bLinear) * 255))),
  };
}

/**
 * Convert OKLCH to hex color
 *
 * @param oklch - OKLCH color object
 * @returns Hex color string
 *
 * @example
 * oklchToHex({ l: 0.72, c: 0.15, h: 85 }) // Returns approximately '#D4A017'
 */
export function oklchToHex(oklch: OKLCH): string {
  return rgbToHex(oklchToRgb(oklch));
}

// =============================================================================
// HSL Conversion Functions
// =============================================================================

/**
 * Convert RGB to HSL
 *
 * @param rgb - RGB color object
 * @returns HSL color object
 */
export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / delta + 2) / 6;
        break;
      case b:
        h = ((r - g) / delta + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to RGB
 *
 * @param hsl - HSL color object
 * @returns RGB color object
 */
export function hslToRgb(hsl: HSL): RGB {
  const { h, s, l } = hsl;
  const sNorm = s / 100;
  const lNorm = l / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let r = 0, g = 0, b = 0;

  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

// =============================================================================
// Token Lookup Functions
// =============================================================================

/**
 * Find a token mapping by hex color value
 *
 * @param hex - Hex color to find
 * @returns ColorTokenMapping if found, undefined otherwise
 *
 * @example
 * getTokenForHex('#D4A017') // Returns the gold token mapping
 */
export function getTokenForHex(hex: string): ColorTokenMapping | undefined {
  const normalized = normalizeHex(hex);
  return COLOR_TOKEN_MAPPINGS.find(
    (m) => normalizeHex(m.hex) === normalized
  );
}

/**
 * Find a legacy token name by hex color value
 *
 * @param hex - Hex color to find
 * @returns Legacy token name if found, undefined otherwise
 *
 * @example
 * getLegacyTokenForHex('#D4A017') // Returns 'gold'
 */
export function getLegacyTokenForHex(hex: string): LegacyColorToken | undefined {
  const mapping = getTokenForHex(hex);
  return mapping?.legacy;
}

/**
 * Get the closest token for an arbitrary color
 * Uses OKLCH lightness and hue to find the closest match
 *
 * @param hex - Hex color to match
 * @returns Closest ColorTokenMapping
 */
export function getClosestTokenForHex(hex: string): ColorTokenMapping | undefined {
  const targetOklch = hexToOklch(hex);
  if (!targetOklch) return undefined;

  let closestMapping: ColorTokenMapping | undefined;
  let closestDistance = Infinity;

  for (const mapping of COLOR_TOKEN_MAPPINGS) {
    const mappingOklch = hexToOklch(mapping.hex);
    if (!mappingOklch) continue;

    // Calculate perceptual distance in OKLCH space
    // Weight lightness more heavily as it's more perceptually important
    const dl = (targetOklch.l - mappingOklch.l) * 2;
    const dc = targetOklch.c - mappingOklch.c;
    const dh = ((targetOklch.h - mappingOklch.h + 180) % 360) - 180;

    const distance = Math.sqrt(dl * dl + dc * dc + dh * dh * 0.01);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestMapping = mapping;
    }
  }

  return closestMapping;
}

// =============================================================================
// Color Manipulation Functions
// =============================================================================

/**
 * Lighten a color by a percentage
 *
 * @param hex - Hex color string
 * @param amount - Percentage to lighten (0-100)
 * @returns Lightened hex color
 */
export function lighten(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const hsl = rgbToHsl(rgb);
  hsl.l = Math.min(100, hsl.l + amount);

  return rgbToHex(hslToRgb(hsl));
}

/**
 * Darken a color by a percentage
 *
 * @param hex - Hex color string
 * @param amount - Percentage to darken (0-100)
 * @returns Darkened hex color
 */
export function darken(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const hsl = rgbToHsl(rgb);
  hsl.l = Math.max(0, hsl.l - amount);

  return rgbToHex(hslToRgb(hsl));
}

/**
 * Mix two colors together
 *
 * @param hex1 - First hex color
 * @param hex2 - Second hex color
 * @param ratio - Mix ratio (0-1, 0 = all hex1, 1 = all hex2)
 * @returns Mixed hex color
 */
export function mix(hex1: string, hex2: string, ratio: number = 0.5): string {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  if (!rgb1 || !rgb2) return hex1;

  const clampedRatio = Math.max(0, Math.min(1, ratio));

  return rgbToHex({
    r: Math.round(rgb1.r * (1 - clampedRatio) + rgb2.r * clampedRatio),
    g: Math.round(rgb1.g * (1 - clampedRatio) + rgb2.g * clampedRatio),
    b: Math.round(rgb1.b * (1 - clampedRatio) + rgb2.b * clampedRatio),
  });
}

/**
 * Add alpha transparency to a color
 *
 * @param hex - Hex color string
 * @param alpha - Alpha value (0-1)
 * @returns CSS color string with alpha
 */
export function withAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const clampedAlpha = Math.max(0, Math.min(1, alpha));
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${clampedAlpha})`;
}

// =============================================================================
// Accessibility Functions
// =============================================================================

/**
 * Calculate relative luminance for WCAG contrast calculations
 *
 * @param rgb - RGB color object
 * @returns Relative luminance (0-1)
 */
export function getRelativeLuminance(rgb: RGB): number {
  const toLinear = (c: number) => {
    const srgb = c / 255;
    return srgb <= 0.03928
      ? srgb / 12.92
      : Math.pow((srgb + 0.055) / 1.055, 2.4);
  };

  const r = toLinear(rgb.r);
  const g = toLinear(rgb.g);
  const b = toLinear(rgb.b);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate WCAG contrast ratio between two colors
 *
 * @param hex1 - First hex color
 * @param hex2 - Second hex color
 * @returns Contrast ratio (1-21)
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  if (!rgb1 || !rgb2) return 1;

  const l1 = getRelativeLuminance(rgb1);
  const l2 = getRelativeLuminance(rgb2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG requirements
 *
 * @param ratio - Contrast ratio
 * @param level - WCAG level ('AA' or 'AAA')
 * @param isLargeText - Whether the text is large (18pt+ or 14pt bold+)
 * @returns True if contrast meets requirements
 */
export function meetsWcag(
  ratio: number,
  level: 'AA' | 'AAA' = 'AA',
  isLargeText: boolean = false
): boolean {
  const thresholds = {
    AA: { normal: 4.5, large: 3 },
    AAA: { normal: 7, large: 4.5 },
  };

  const threshold = isLargeText
    ? thresholds[level].large
    : thresholds[level].normal;

  return ratio >= threshold;
}

/**
 * Get accessible text color for a given background
 *
 * @param bgHex - Background hex color
 * @returns '#FFFFFF' or '#000000' depending on which has better contrast
 */
export function getAccessibleTextColor(bgHex: string): string {
  const contrastWhite = getContrastRatio(bgHex, '#FFFFFF');
  const contrastBlack = getContrastRatio(bgHex, '#000000');

  return contrastWhite > contrastBlack ? '#FFFFFF' : '#000000';
}

// =============================================================================
// CSS String Generation
// =============================================================================

/**
 * Generate CSS OKLCH color string
 *
 * @param oklch - OKLCH color object
 * @param alpha - Optional alpha value (0-1)
 * @returns CSS color string
 */
export function oklchToCss(oklch: OKLCH, alpha?: number): string {
  if (alpha !== undefined) {
    return `oklch(${oklch.l} ${oklch.c} ${oklch.h} / ${alpha})`;
  }
  return `oklch(${oklch.l} ${oklch.c} ${oklch.h})`;
}

/**
 * Generate CSS RGB/RGBA color string
 *
 * @param rgb - RGB color object
 * @param alpha - Optional alpha value (0-1)
 * @returns CSS color string
 */
export function rgbToCss(rgb: RGB, alpha?: number): string {
  if (alpha !== undefined) {
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  }
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

// =============================================================================
// Legacy Color Constants Export
// =============================================================================

/**
 * Export legacy colors as RGB for direct access
 */
export const LEGACY_RGB = {
  NAVY: hexToRgb(LEGACY_COLORS.NAVY)!,
  NAVY_MID: hexToRgb(LEGACY_COLORS.NAVY_MID)!,
  NAVY_LIGHT: hexToRgb(LEGACY_COLORS.NAVY_LIGHT)!,
  NAVY_SURFACE: hexToRgb(LEGACY_COLORS.NAVY_SURFACE)!,
  GOLD: hexToRgb(LEGACY_COLORS.GOLD)!,
  GOLD_LIGHT: hexToRgb(LEGACY_COLORS.GOLD_LIGHT)!,
  CREAM: hexToRgb(LEGACY_COLORS.CREAM)!,
  CREAM_MUTED: hexToRgb(LEGACY_COLORS.CREAM_MUTED)!,
  SUCCESS: hexToRgb(LEGACY_COLORS.SUCCESS)!,
  DANGER: hexToRgb(LEGACY_COLORS.DANGER)!,
} as const;

/**
 * Export legacy colors as OKLCH for direct access
 */
export const LEGACY_OKLCH = {
  NAVY: hexToOklch(LEGACY_COLORS.NAVY)!,
  NAVY_MID: hexToOklch(LEGACY_COLORS.NAVY_MID)!,
  NAVY_LIGHT: hexToOklch(LEGACY_COLORS.NAVY_LIGHT)!,
  NAVY_SURFACE: hexToOklch(LEGACY_COLORS.NAVY_SURFACE)!,
  GOLD: hexToOklch(LEGACY_COLORS.GOLD)!,
  GOLD_LIGHT: hexToOklch(LEGACY_COLORS.GOLD_LIGHT)!,
  CREAM: hexToOklch(LEGACY_COLORS.CREAM)!,
  CREAM_MUTED: hexToOklch(LEGACY_COLORS.CREAM_MUTED)!,
  SUCCESS: hexToOklch(LEGACY_COLORS.SUCCESS)!,
  DANGER: hexToOklch(LEGACY_COLORS.DANGER)!,
} as const;
