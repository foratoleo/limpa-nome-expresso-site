/**
 * Theme TypeScript interfaces for Atlassian Design System.
 *
 * These interfaces define the theme configuration using Atlassian's
 * standard color palette and design tokens.
 *
 * Atlassian uses a 3-tier token system:
 * 1. Primitive tokens: Raw color values (e.g., --color-swatch-100)
 * 2. Semantic tokens: Purpose-based names (e.g., color.text.subtlest)
 * 3. Component tokens: Component-specific (e.g., color.button)
 *
 * Reference: https://atlassian.design/foundations/tokens/
 */

/**
 * Atlassian Design System brand colors.
 * Standard Atlassian color palette.
 */
export interface BrandColors {
  /** Primary blue - Atlassian B400 */
  primary: '#0052CC';
  /** Primary hover - Atlassian B500 */
  primaryHover: '#0747A6';
  /** Primary light - Atlassian B300 */
  primaryLight: '#4C9AFF';
  /** Primary background - Atlassian B50 */
  primaryBackground: '#DEEBFF';
  /** Dark background - Atlassian N800 */
  background: '#172B4D';
  /** Elevated surface - Atlassian N700 */
  backgroundElevated: '#253858';
  /** Surface overlay - Atlassian N600 */
  surface: '#344563';
  /** Surface hover - Atlassian N500 */
  surfaceHovered: '#42526E';
  /** Primary text - Atlassian N0 */
  text: '#FFFFFF';
  /** Subtle text - Atlassian N200 */
  textSubtle: '#C1C7D0';
  /** Subtlest text - Atlassian N100 */
  textSubtlest: '#7A869A';
  /** Border - Atlassian N500 */
  border: '#42526E';
  /** Border focus - Atlassian B400 */
  borderFocus: '#0052CC';
  /** Success - Atlassian G400 */
  success: '#00875A';
  /** Success light - Atlassian G300 */
  successLight: '#36B37E';
  /** Danger - Atlassian R400 */
  danger: '#DE350B';
  /** Danger light - Atlassian R300 */
  dangerLight: '#FF5630';
  /** Warning - Atlassian Y400 */
  warning: '#FF991F';
  /** Warning light - Atlassian Y300 */
  warningLight: '#FFAB00';
}

/**
 * Typography configuration.
 * Uses Atlassian's recommended font stack.
 */
export interface TypographyTokens {
  /** Display font for headings */
  fontDisplay: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
  /** Monospace font for code */
  fontMono: "'SF Mono', 'Monaco', 'Inconsolata', monospace";
  /** Body font for text content */
  fontBody: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
}

/**
 * Color token overrides for Atlassian semantic tokens.
 */
export interface ColorTokenOverrides {
  background: {
    default: string;
    elevated: string;
    surface: string;
    surfaceHovered: string;
    selected: string;
    success: string;
    successHovered: string;
    danger: string;
    dangerHovered: string;
    information: string;
    disabled: string;
  };
  text: {
    default: string;
    subtle: string;
    subtlest: string;
    disabled: string;
    accent: string;
    selected: string;
    inverse: string;
    success: string;
    danger: string;
    information: string;
  };
  border: {
    default: string;
    focus: string;
    selected: string;
    hover: string;
  };
  shadow: {
    default: string;
    overlay: string;
  };
}

/**
 * Complete theme configuration for Atlassian Design System.
 */
export interface AtlassianTheme {
  brand: BrandColors;
  typography: TypographyTokens;
  colorTokens: ColorTokenOverrides;
  mode: 'light' | 'dark';
  density: 'compact' | 'normal' | 'comfortable';
}

/**
 * Theme context value provided to consumers.
 */
export interface ThemeContextValue {
  theme: AtlassianTheme;
  toggleMode?: () => void;
  switchable: boolean;
}

/**
 * Props for the AtlaskitProvider component.
 */
export interface AtlaskitProviderProps {
  children: React.ReactNode;
  defaultMode?: 'light' | 'dark';
  switchable?: boolean;
}

/**
 * Token path type for type-safe token access.
 */
export type TokenPath =
  | `color.background.${string}`
  | `color.text.${string}`
  | `color.border.${string}`
  | `color.shadow.${string}`
  | `font.${string}`
  | `spacing.${string}`
  | `radius.${string}`;

/**
 * Brand color key type for accessing brand colors.
 */
export type BrandColorKey = keyof BrandColors;

/**
 * CSS custom property name for brand colors.
 */
export type BrandCSSVar = `--${BrandColorKey}`;

/**
 * Atlassian Design System standard colors (Dark mode optimized).
 * Reference: https://atlassian.design/foundations/color/
 */
export const BRAND_COLORS: BrandColors = {
  primary: '#0052CC',
  primaryHover: '#0747A6',
  primaryLight: '#4C9AFF',
  primaryBackground: '#DEEBFF',
  background: '#172B4D',
  backgroundElevated: '#253858',
  surface: '#344563',
  surfaceHovered: '#42526E',
  text: '#FFFFFF',
  textSubtle: '#C1C7D0',
  textSubtlest: '#7A869A',
  border: '#42526E',
  borderFocus: '#0052CC',
  success: '#00875A',
  successLight: '#36B37E',
  danger: '#DE350B',
  dangerLight: '#FF5630',
  warning: '#FF991F',
  warningLight: '#FFAB00',
};

/**
 * Typography tokens using Atlassian's font stack.
 */
export const TYPOGRAPHY_TOKENS: TypographyTokens = {
  fontDisplay: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  fontMono: "'SF Mono', 'Monaco', 'Inconsolata', monospace",
  fontBody: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
};

export const DENSITY_SPACING = {
  compact: 0.75,
  normal: 1,
  comfortable: 1.25,
} as const;

export type Density = keyof typeof DENSITY_SPACING;

// Legacy type aliases for backward compatibility
export type LegalFinancialTheme = AtlassianTheme;
