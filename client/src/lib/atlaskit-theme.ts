/**
 * Atlassian Design System theme configuration.
 *
 * This module provides the theme configuration using Atlassian's
 * standard color palette and design tokens.
 *
 * @see https://atlassian.design/foundations/tokens/
 */

import { BRAND_COLORS, TYPOGRAPHY_TOKENS, type AtlassianTheme, type ColorTokenOverrides } from '@/types/theme';

/**
 * Creates the color token overrides using Atlassian's standard colors.
 *
 * @param isDark - Whether to generate dark mode tokens (default: true)
 * @returns ColorTokenOverrides object with Atlassian values
 */
function createColorTokenOverrides(isDark: boolean = true): ColorTokenOverrides {
  if (isDark) {
    // Dark mode - Atlassian standard dark theme
    return {
      background: {
        default: BRAND_COLORS.background,
        elevated: BRAND_COLORS.backgroundElevated,
        surface: BRAND_COLORS.surface,
        surfaceHovered: BRAND_COLORS.surfaceHovered,
        selected: BRAND_COLORS.primary,
        success: BRAND_COLORS.success,
        successHovered: BRAND_COLORS.successLight,
        danger: BRAND_COLORS.danger,
        dangerHovered: BRAND_COLORS.dangerLight,
        information: BRAND_COLORS.primary,
        disabled: BRAND_COLORS.surface,
      },
      text: {
        default: BRAND_COLORS.text,
        subtle: BRAND_COLORS.textSubtle,
        subtlest: BRAND_COLORS.textSubtlest,
        disabled: BRAND_COLORS.textSubtlest,
        accent: BRAND_COLORS.primaryLight,
        selected: BRAND_COLORS.text,
        inverse: BRAND_COLORS.background,
        success: BRAND_COLORS.successLight,
        danger: BRAND_COLORS.dangerLight,
        information: BRAND_COLORS.primaryLight,
      },
      border: {
        default: BRAND_COLORS.border,
        focus: BRAND_COLORS.borderFocus,
        selected: BRAND_COLORS.primary,
        hover: BRAND_COLORS.primaryLight,
      },
      shadow: {
        default: 'rgba(0, 0, 0, 0.4)',
        overlay: 'rgba(0, 0, 0, 0.6)',
      },
    };
  }

  // Light mode - Atlassian standard light theme
  return {
    background: {
      default: '#FFFFFF',
      elevated: '#F4F5F7',
      surface: '#EBECF0',
      surfaceHovered: '#DFE1E6',
      selected: BRAND_COLORS.primaryBackground,
      success: '#E3FCEF',
      successHovered: '#ABF5D1',
      danger: '#FFEBE6',
      dangerHovered: '#FFBDAD',
      information: '#DEEBFF',
      disabled: '#F4F5F7',
    },
    text: {
      default: '#172B4D',
      subtle: '#42526E',
      subtlest: '#6B778C',
      disabled: '#A5ADBA',
      accent: BRAND_COLORS.primary,
      selected: BRAND_COLORS.primary,
      inverse: '#FFFFFF',
      success: '#006644',
      danger: '#BF2600',
      information: '#0747A6',
    },
    border: {
      default: '#DFE1E6',
      focus: BRAND_COLORS.primary,
      selected: BRAND_COLORS.primary,
      hover: BRAND_COLORS.primaryLight,
    },
    shadow: {
      default: 'rgba(9, 30, 66, 0.13)',
      overlay: 'rgba(9, 30, 66, 0.54)',
    },
  };
}

/**
 * Creates the complete Atlassian theme configuration.
 *
 * @param mode - Theme mode ('dark' or 'light')
 * @param density - Spacing density ('compact', 'normal', 'comfortable')
 * @returns AtlassianTheme configuration object
 */
export function createLegalFinancialTheme(
  mode: 'light' | 'dark' = 'dark',
  density: 'compact' | 'normal' | 'comfortable' = 'normal'
): AtlassianTheme {
  return {
    brand: BRAND_COLORS,
    typography: TYPOGRAPHY_TOKENS,
    colorTokens: createColorTokenOverrides(mode === 'dark'),
    mode,
    density,
  };
}

/**
 * Default dark theme using Atlassian standard colors.
 */
export const defaultLegalFinancialTheme = createLegalFinancialTheme('dark', 'normal');

/**
 * Light theme variant.
 */
export const lightLegalFinancialTheme = createLegalFinancialTheme('light', 'normal');

/**
 * CSS custom property generator for brand colors.
 */
export function getBrandColorCSSVars(): Record<`--${string}`, string> {
  return {
    '--primary': BRAND_COLORS.primary,
    '--primary-hover': BRAND_COLORS.primaryHover,
    '--primary-light': BRAND_COLORS.primaryLight,
    '--primary-background': BRAND_COLORS.primaryBackground,
    '--background': BRAND_COLORS.background,
    '--background-elevated': BRAND_COLORS.backgroundElevated,
    '--surface': BRAND_COLORS.surface,
    '--surface-hovered': BRAND_COLORS.surfaceHovered,
    '--text': BRAND_COLORS.text,
    '--text-subtle': BRAND_COLORS.textSubtle,
    '--text-subtlest': BRAND_COLORS.textSubtlest,
    '--border': BRAND_COLORS.border,
    '--border-focus': BRAND_COLORS.borderFocus,
    '--success': BRAND_COLORS.success,
    '--success-light': BRAND_COLORS.successLight,
    '--danger': BRAND_COLORS.danger,
    '--danger-light': BRAND_COLORS.dangerLight,
    '--warning': BRAND_COLORS.warning,
    '--warning-light': BRAND_COLORS.warningLight,
  };
}

/**
 * Generates CSS custom properties for Atlassian semantic tokens.
 */
export function getSemanticTokenCSSVars(theme: AtlassianTheme): Record<`--${string}`, string> {
  const { colorTokens } = theme;

  return {
    // Background tokens
    '--color-background-default': colorTokens.background.default,
    '--color-background-elevated': colorTokens.background.elevated,
    '--color-background-surface': colorTokens.background.surface,
    '--color-background-surface-hovered': colorTokens.background.surfaceHovered,
    '--color-background-selected': colorTokens.background.selected,
    '--color-background-success': colorTokens.background.success,
    '--color-background-danger': colorTokens.background.danger,
    '--color-background-information': colorTokens.background.information,
    '--color-background-disabled': colorTokens.background.disabled,

    // Text tokens
    '--color-text-default': colorTokens.text.default,
    '--color-text-subtle': colorTokens.text.subtle,
    '--color-text-subtlest': colorTokens.text.subtlest,
    '--color-text-disabled': colorTokens.text.disabled,
    '--color-text-accent': colorTokens.text.accent,
    '--color-text-selected': colorTokens.text.selected,
    '--color-text-inverse': colorTokens.text.inverse,
    '--color-text-success': colorTokens.text.success,
    '--color-text-danger': colorTokens.text.danger,
    '--color-text-information': colorTokens.text.information,

    // Border tokens
    '--color-border-default': colorTokens.border.default,
    '--color-border-focus': colorTokens.border.focus,
    '--color-border-selected': colorTokens.border.selected,
    '--color-border-hover': colorTokens.border.hover,

    // Shadow tokens
    '--color-shadow-default': colorTokens.shadow.default,
    '--color-shadow-overlay': colorTokens.shadow.overlay,

    // Typography tokens
    '--font-display': theme.typography.fontDisplay,
    '--font-mono': theme.typography.fontMono,
    '--font-body': theme.typography.fontBody,
  };
}

/**
 * Applies theme CSS variables to the document root element.
 */
export function applyThemeToRoot(theme: AtlassianTheme): void {
  const root = document.documentElement;
  const brandVars = getBrandColorCSSVars();
  const semanticVars = getSemanticTokenCSSVars(theme);

  Object.entries(brandVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  Object.entries(semanticVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  if (theme.mode === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }
}

/**
 * Token mapping for migration reference.
 */
export const TOKEN_MIGRATION_MAP: Record<string, string> = {
  '--navy': 'color.background.default',
  '--gold': 'color.text.accent',
  '--cream': 'color.text.default',
  '--success': 'color.background.success',
  '--danger': 'color.background.danger',
  '--font-display': 'font.heading',
  '--font-mono': 'font.code',
  '--font-body': 'font.body',
};

export type TokenMigrationKey = keyof typeof TOKEN_MIGRATION_MAP;
