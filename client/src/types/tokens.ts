/**
 * Design Token Types for Atlassian Design System Migration
 *
 * This file defines TypeScript interfaces for the token mapping system
 * that bridges the current CSS custom properties to Atlassian's token architecture.
 *
 * Atlassian uses a 3-tier token system:
 * - Primitive: Raw color values (e.g., #0F1E3C)
 * - Semantic: Purpose-based names (e.g., color.background.default)
 * - Component: Specific to components (e.g., color.button.primary)
 */

// =============================================================================
// Color Token Types
// =============================================================================

/**
 * Current CSS custom property names used in the project
 * These are the "old" tokens that need to be mapped to Atlassian tokens
 */
export type LegacyColorToken =
  | 'navy'        // #0F1E3C - Primary background
  | 'navy-mid'    // #162847 - Card backgrounds
  | 'navy-light'  // #1E3A5F - Hover states
  | 'navy-surface' // #243B5E - Borders, surfaces
  | 'gold'        // #D4A017 - Primary accent
  | 'gold-light'  // #F0C040 - Hover accent
  | 'cream'       // #F5F5F0 - Text primary
  | 'cream-muted' // #E8E4D8 - Text secondary
  | 'success'     // #2E7D52 - Success states
  | 'danger';     // #C0392B - Danger states

/**
 * Atlassian semantic color token paths
 * These follow Atlassian's naming convention: color.{element}.{state}
 */
export type AtlassianColorToken =
  // Background tokens
  | 'color.background.default'
  | 'color.background.neutral.subtle'
  | 'color.background.neutral.subtle.hovered'
  | 'color.background.selected'
  | 'color.background.selected.hovered'
  | 'color.background.success'
  | 'color.background.success.hovered'
  | 'color.background.danger'
  | 'color.background.danger.hovered'
  | 'color.background.warning'
  | 'color.background.information'
  | 'color.surface'
  | 'color.surface.sunken'
  | 'color.surface.overlay'
  // Text tokens
  | 'color.text'
  | 'color.text.subtle'
  | 'color.text.subtlest'
  | 'color.text.disabled'
  | 'color.text.selected'
  | 'color.text.brand'
  | 'color.text.success'
  | 'color.text.danger'
  | 'color.text.warning'
  | 'color.text.information'
  | 'color.text.accent.blue'
  | 'color.text.accent.red'
  | 'color.text.accent.orange'
  | 'color.text.accent.yellow'
  | 'color.text.accent.green'
  | 'color.text.accent.teal'
  | 'color.text.accent.purple'
  | 'color.text.accent.magenta'
  // Border tokens
  | 'color.border'
  | 'color.border.accent.blue'
  | 'color.border.focused'
  | 'color.border.selected'
  | 'color.border.success'
  | 'color.border.danger'
  | 'color.border.warning'
  | 'color.border.information';

/**
 * Complete token mapping interface
 * Maps legacy CSS variable names to Atlassian token paths
 */
export interface ColorTokenMapping {
  /** Legacy token name (e.g., 'navy') */
  legacy: LegacyColorToken;
  /** Atlassian token path (e.g., 'color.background.default') */
  atlassian: AtlassianColorToken;
  /** Raw hex value for fallback */
  hex: string;
  /** OKLCH representation for modern browsers */
  oklch?: string;
  /** Description of the token's purpose */
  description: string;
}

// =============================================================================
// Typography Token Types
// =============================================================================

/**
 * Font family tokens
 * Preserving the current fonts which are well-suited for legal/financial content
 */
export type FontFamilyToken =
  | 'font-display'  // Playfair Display - Legal authority, headings
  | 'font-mono'     // Space Grotesk - Labels, statistics, badges
  | 'font-body';    // Inter - Body text, descriptions

/**
 * Atlassian typography scale tokens
 */
export type AtlassianTypographyToken =
  | 'font.body'
  | 'font.body.medium'
  | 'font.body.large'
  | 'font.body.small'
  | 'font.heading'
  | 'font.heading.medium'
  | 'font.heading.large'
  | 'font.heading.xlarge'
  | 'font.heading.xxlarge'
  | 'font.code'
  | 'font.ui';

/**
 * Typography token mapping interface
 */
export interface TypographyTokenMapping {
  /** Legacy font variable name */
  legacy: FontFamilyToken;
  /** Font family value */
  family: string;
  /** Fallback fonts */
  fallbacks: string[];
  /** Atlassian typography token to map to */
  atlassianMapping: AtlassianTypographyToken[];
  /** Description */
  description: string;
}

// =============================================================================
// Spacing Token Types
// =============================================================================

/**
 * Spacing scale tokens following Atlassian's 8px grid
 */
export type SpacingToken =
  | 'space.0'    // 0px
  | 'space.025'  // 2px
  | 'space.050'  // 4px
  | 'space.075'  // 6px
  | 'space.100'  // 8px
  | 'space.150'  // 12px
  | 'space.200'  // 16px
  | 'space.250'  // 20px
  | 'space.300'  // 24px
  | 'space.400'  // 32px
  | 'space.500'  // 40px
  | 'space.600'  // 48px
  | 'space.800'  // 64px
  | 'space.1000'; // 80px

/**
 * Spacing token mapping interface
 */
export interface SpacingTokenMapping {
  /** CSS custom property name */
  name: string;
  /** Atlassian token path */
  atlassian: SpacingToken;
  /** Pixel value */
  pixels: number;
  /** Rem value */
  rem: string;
}

// =============================================================================
// Border Radius Token Types
// =============================================================================

/**
 * Border radius tokens
 */
export type BorderRadiusToken =
  | 'radius.0'     // 0px
  | 'radius.050'   // 4px
  | 'radius.100'   // 8px
  | 'radius.150'   // 12px
  | 'radius.200'   // 16px
  | 'radius.300'   // 24px
  | 'radius.400'   // 32px
  | 'radius.full'; // 9999px

/**
 * Border radius token mapping interface
 */
export interface BorderRadiusTokenMapping {
  /** CSS custom property name */
  name: string;
  /** Atlassian token path */
  atlassian: BorderRadiusToken;
  /** Pixel value */
  pixels: number;
}

// =============================================================================
// Complete Token System Types
// =============================================================================

/**
 * Complete token mapping system
 */
export interface TokenSystem {
  /** Color token mappings */
  colors: ColorTokenMapping[];
  /** Typography token mappings */
  typography: TypographyTokenMapping[];
  /** Spacing token mappings */
  spacing: SpacingTokenMapping[];
  /** Border radius token mappings */
  radius: BorderRadiusTokenMapping[];
}

/**
 * Token category for organization
 */
export type TokenCategory = 'color' | 'typography' | 'spacing' | 'radius' | 'elevation' | 'shadow';

/**
 * Token lookup function type
 */
export type TokenLookupFunction = (token: LegacyColorToken) => AtlassianColorToken | undefined;

/**
 * Token value extraction function type
 */
export type TokenValueFunction = (token: LegacyColorToken | AtlassianColorToken) => string | undefined;

// =============================================================================
// Theme Override Types
// =============================================================================

/**
 * Theme mode
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Custom theme overrides for the legal/financial identity
 * These override Atlassian's default semantic tokens
 */
export interface LegalFinancialThemeOverrides {
  /** Background colors - Navy palette */
  backgrounds: {
    default: string;
    neutral: {
      subtle: string;
      subtleHovered: string;
    };
    selected: string;
    selectedHovered: string;
  };
  /** Text colors - Cream palette */
  text: {
    default: string;
    subtle: string;
    subtlest: string;
    accent: string;
    success: string;
    danger: string;
  };
  /** Border colors */
  borders: {
    default: string;
    accent: string;
    success: string;
    danger: string;
    focused: string;
  };
  /** Interaction colors */
  interactions: {
    primary: string;
    primaryHovered: string;
    success: string;
    danger: string;
  };
}

/**
 * Complete theme configuration
 */
export interface ThemeConfig {
  /** Current theme mode */
  mode: ThemeMode;
  /** Custom token overrides */
  overrides: LegalFinancialThemeOverrides;
  /** Whether to use CSS custom properties fallback */
  useCssFallback: boolean;
}
