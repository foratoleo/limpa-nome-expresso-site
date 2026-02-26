/**
 * Theme System Unit Tests
 *
 * Tests for the Atlassian Design System theme migration:
 * - Brand color definitions
 * - Theme creation functions
 * - Token mapping functions
 * - CSS variable generation
 * - Theme application to DOM
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  BRAND_COLORS,
  TYPOGRAPHY_TOKENS,
  DENSITY_SPACING,
  type BrandColors,
  type TypographyTokens,
} from "@/types/theme";
import {
  createLegalFinancialTheme,
  defaultLegalFinancialTheme,
  lightLegalFinancialTheme,
  getBrandColorCSSVars,
  getSemanticTokenCSSVars,
  applyThemeToRoot,
  TOKEN_MIGRATION_MAP,
} from "@/lib/atlaskit-theme";
import {
  getTokenValue,
  getHexValue,
  getAllTokenMappings,
  getCssVarName,
  getCssVarWithFallback,
  getColorMapping,
  getColorsByCategory,
  generateCssCustomProperties,
  LEGACY_COLORS,
  FONT_FAMILIES,
  COLOR_TOKEN_MAPPINGS,
  SPACING_TOKEN_MAPPINGS,
  BORDER_RADIUS_TOKEN_MAPPINGS,
} from "@/lib/token-mapping";

// ============================================================================
// Brand Colors Tests
// ============================================================================
describe("BRAND_COLORS", () => {
  it("should define all required brand colors", () => {
    const requiredColors: Array<keyof BrandColors> = [
      "primary",
      "primaryHover",
      "primaryLight",
      "primaryBackground",
      "background",
      "backgroundElevated",
      "surface",
      "surfaceHovered",
      "text",
      "textSubtle",
      "textSubtlest",
      "border",
      "borderFocus",
      "success",
      "successLight",
      "danger",
      "dangerLight",
      "warning",
      "warningLight",
    ];

    requiredColors.forEach((color) => {
      expect(BRAND_COLORS[color]).toBeDefined();
      expect(BRAND_COLORS[color]).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  it("should have valid hex color format for all colors", () => {
    Object.entries(BRAND_COLORS).forEach(([name, value]) => {
      expect(value).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  it("should have primary as the Atlassian blue", () => {
    expect(BRAND_COLORS.primary).toBe("#0052CC");
  });

  it("should have background as Atlassian N800", () => {
    expect(BRAND_COLORS.background).toBe("#172B4D");
  });

  it("should have text as white", () => {
    expect(BRAND_COLORS.text).toBe("#FFFFFF");
  });

  it("should have success as Atlassian G400", () => {
    expect(BRAND_COLORS.success).toBe("#00875A");
  });

  it("should have danger as Atlassian R400", () => {
    expect(BRAND_COLORS.danger).toBe("#DE350B");
  });
});

// ============================================================================
// Typography Tokens Tests
// ============================================================================
describe("TYPOGRAPHY_TOKENS", () => {
  it("should define all required font families", () => {
    const requiredFonts: Array<keyof TypographyTokens> = [
      "fontDisplay",
      "fontMono",
      "fontBody",
    ];

    requiredFonts.forEach((font) => {
      expect(TYPOGRAPHY_TOKENS[font]).toBeDefined();
      expect(typeof TYPOGRAPHY_TOKENS[font]).toBe("string");
    });
  });

  it("should have Inter as display font", () => {
    expect(TYPOGRAPHY_TOKENS.fontDisplay).toContain("Inter");
  });

  it("should have SF Mono as mono font", () => {
    expect(TYPOGRAPHY_TOKENS.fontMono).toContain("SF Mono");
  });

  it("should have Inter as body font", () => {
    expect(TYPOGRAPHY_TOKENS.fontBody).toContain("Inter");
  });
});

// ============================================================================
// Density Spacing Tests
// ============================================================================
describe("DENSITY_SPACING", () => {
  it("should define all density levels", () => {
    expect(DENSITY_SPACING.compact).toBe(0.75);
    expect(DENSITY_SPACING.normal).toBe(1);
    expect(DENSITY_SPACING.comfortable).toBe(1.25);
  });

  it("should have increasing spacing values", () => {
    expect(DENSITY_SPACING.compact).toBeLessThan(DENSITY_SPACING.normal);
    expect(DENSITY_SPACING.normal).toBeLessThan(DENSITY_SPACING.comfortable);
  });
});

// ============================================================================
// Theme Creation Tests
// ============================================================================
describe("createLegalFinancialTheme", () => {
  it("should create a dark theme by default", () => {
    const theme = createLegalFinancialTheme();
    expect(theme.mode).toBe("dark");
  });

  it("should create a light theme when specified", () => {
    const theme = createLegalFinancialTheme("light");
    expect(theme.mode).toBe("light");
  });

  it("should use normal density by default", () => {
    const theme = createLegalFinancialTheme();
    expect(theme.density).toBe("normal");
  });

  it("should support compact density", () => {
    const theme = createLegalFinancialTheme("dark", "compact");
    expect(theme.density).toBe("compact");
  });

  it("should support comfortable density", () => {
    const theme = createLegalFinancialTheme("dark", "comfortable");
    expect(theme.density).toBe("comfortable");
  });

  it("should include brand colors", () => {
    const theme = createLegalFinancialTheme();
    expect(theme.brand).toEqual(BRAND_COLORS);
  });

  it("should include typography tokens", () => {
    const theme = createLegalFinancialTheme();
    expect(theme.typography).toEqual(TYPOGRAPHY_TOKENS);
  });

  it("should include color token overrides", () => {
    const theme = createLegalFinancialTheme();
    expect(theme.colorTokens).toBeDefined();
    expect(theme.colorTokens.background).toBeDefined();
    expect(theme.colorTokens.text).toBeDefined();
    expect(theme.colorTokens.border).toBeDefined();
    expect(theme.colorTokens.shadow).toBeDefined();
  });

  it("should generate different tokens for light and dark modes", () => {
    const darkTheme = createLegalFinancialTheme("dark");
    const lightTheme = createLegalFinancialTheme("light");

    // Background should be different
    expect(darkTheme.colorTokens.background.default).not.toBe(
      lightTheme.colorTokens.background.default
    );

    // Text colors should be inverted
    expect(darkTheme.colorTokens.text.default).not.toBe(
      lightTheme.colorTokens.text.default
    );
  });
});

describe("defaultLegalFinancialTheme", () => {
  it("should be a dark theme", () => {
    expect(defaultLegalFinancialTheme.mode).toBe("dark");
  });

  it("should use normal density", () => {
    expect(defaultLegalFinancialTheme.density).toBe("normal");
  });
});

describe("lightLegalFinancialTheme", () => {
  it("should be a light theme", () => {
    expect(lightLegalFinancialTheme.mode).toBe("light");
  });

  it("should use normal density", () => {
    expect(lightLegalFinancialTheme.density).toBe("normal");
  });
});

// ============================================================================
// CSS Variable Generation Tests
// ============================================================================
describe("getBrandColorCSSVars", () => {
  it("should generate CSS variables for all brand colors", () => {
    const vars = getBrandColorCSSVars();

    expect(vars["--primary"]).toBe(BRAND_COLORS.primary);
    expect(vars["--background"]).toBe(BRAND_COLORS.background);
    expect(vars["--text"]).toBe(BRAND_COLORS.text);
  });

  it("should use double-dash prefix for CSS custom properties", () => {
    const vars = getBrandColorCSSVars();
    Object.keys(vars).forEach((key) => {
      expect(key).toMatch(/^--[a-z-]+$/);
    });
  });
});

describe("getSemanticTokenCSSVars", () => {
  it("should generate CSS variables for semantic tokens", () => {
    const theme = createLegalFinancialTheme("dark");
    const vars = getSemanticTokenCSSVars(theme);

    // Background tokens
    expect(vars["--color-background-default"]).toBeDefined();
    expect(vars["--color-background-elevated"]).toBeDefined();

    // Text tokens
    expect(vars["--color-text-default"]).toBeDefined();
    expect(vars["--color-text-subtle"]).toBeDefined();

    // Border tokens
    expect(vars["--color-border-default"]).toBeDefined();
    expect(vars["--color-border-focus"]).toBeDefined();

    // Typography tokens
    expect(vars["--font-display"]).toBeDefined();
    expect(vars["--font-body"]).toBeDefined();
  });

  it("should map brand colors to semantic tokens correctly for dark mode", () => {
    const theme = createLegalFinancialTheme("dark");
    const vars = getSemanticTokenCSSVars(theme);

    // Background should be the default background in dark mode
    expect(vars["--color-background-default"]).toBe(BRAND_COLORS.background);
    // Text should be the default text in dark mode
    expect(vars["--color-text-default"]).toBe(BRAND_COLORS.text);
  });
});

// ============================================================================
// Theme Application Tests
// ============================================================================
describe("applyThemeToRoot", () => {
  beforeEach(() => {
    // Reset document.documentElement styles
    document.documentElement.removeAttribute("style");
    document.documentElement.classList.remove("dark", "light");
  });

  it("should apply CSS variables to document root", () => {
    const theme = createLegalFinancialTheme("dark");
    applyThemeToRoot(theme);

    const style = document.documentElement.getAttribute("style");
    expect(style).toContain("--primary");
    expect(style).toContain("--color-background-default");
  });

  it("should add 'dark' class for dark mode", () => {
    const theme = createLegalFinancialTheme("dark");
    applyThemeToRoot(theme);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("light")).toBe(false);
  });

  it("should add 'light' class for light mode", () => {
    const theme = createLegalFinancialTheme("light");
    applyThemeToRoot(theme);

    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("should switch between modes correctly", () => {
    // Apply dark theme
    applyThemeToRoot(createLegalFinancialTheme("dark"));
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    // Switch to light theme
    applyThemeToRoot(createLegalFinancialTheme("light"));
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});

// ============================================================================
// Token Migration Map Tests
// ============================================================================
describe("TOKEN_MIGRATION_MAP", () => {
  it("should map legacy tokens to Atlassian token paths", () => {
    expect(TOKEN_MIGRATION_MAP["--navy"]).toBe("color.background.default");
    expect(TOKEN_MIGRATION_MAP["--gold"]).toBe("color.text.accent");
    expect(TOKEN_MIGRATION_MAP["--cream"]).toBe("color.text.default");
  });

  it("should include typography token mappings", () => {
    expect(TOKEN_MIGRATION_MAP["--font-display"]).toBe("font.heading");
    expect(TOKEN_MIGRATION_MAP["--font-mono"]).toBe("font.code");
    expect(TOKEN_MIGRATION_MAP["--font-body"]).toBe("font.body");
  });
});

// ============================================================================
// Token Mapping Functions Tests
// ============================================================================
describe("getTokenValue", () => {
  it("should return Atlassian token for legacy token name", () => {
    expect(getTokenValue("navy")).toBe("color.background.default");
    expect(getTokenValue("gold")).toBe("color.text.accent.blue");
    expect(getTokenValue("cream")).toBe("color.text");
  });

  it("should return undefined for unknown token", () => {
    expect(getTokenValue("unknown" as any)).toBeUndefined();
  });
});

describe("getHexValue", () => {
  it("should return hex value for legacy token", () => {
    expect(getHexValue("navy")).toBe("#0F1E3C");
    expect(getHexValue("gold")).toBe("#D4A017");
  });

  it("should return hex value for Atlassian token", () => {
    expect(getHexValue("color.background.default")).toBe("#0F1E3C");
    expect(getHexValue("color.text.accent.blue")).toBe("#D4A017");
  });

  it("should return undefined for unknown token", () => {
    expect(getHexValue("unknown")).toBeUndefined();
  });
});

describe("getAllTokenMappings", () => {
  it("should return complete token system", () => {
    const system = getAllTokenMappings();

    expect(system.colors).toBeDefined();
    expect(system.typography).toBeDefined();
    expect(system.spacing).toBeDefined();
    expect(system.radius).toBeDefined();
  });

  it("should include all color mappings", () => {
    const system = getAllTokenMappings();
    expect(system.colors.length).toBeGreaterThan(0);
  });
});

describe("getCssVarName", () => {
  it("should return CSS variable with Atlassian token and fallback", () => {
    const result = getCssVarName("navy");
    expect(result).toBe("var(--color.background.default, #0F1E3C)");
  });

  it("should return legacy variable for unknown token", () => {
    const result = getCssVarName("unknown" as any);
    expect(result).toBe("var(--unknown)");
  });
});

describe("getCssVarWithFallback", () => {
  it("should return CSS variable with multiple fallbacks", () => {
    const result = getCssVarWithFallback("navy", "blue");
    expect(result).toContain("var(--color.background.default");
    expect(result).toContain("var(--navy");
  });
});

describe("getColorMapping", () => {
  it("should return complete mapping object for known token", () => {
    const mapping = getColorMapping("navy");
    expect(mapping).toBeDefined();
    expect(mapping?.legacy).toBe("navy");
    expect(mapping?.atlassian).toBe("color.background.default");
    expect(mapping?.hex).toBe("#0F1E3C");
  });

  it("should return undefined for unknown token", () => {
    expect(getColorMapping("unknown" as any)).toBeUndefined();
  });
});

describe("getColorsByCategory", () => {
  it("should return navy colors for navy category", () => {
    const colors = getColorsByCategory("navy");
    expect(colors.length).toBe(4); // navy, navy-mid, navy-light, navy-surface
    colors.forEach((c) => {
      expect(c.legacy).toMatch(/^navy/);
    });
  });

  it("should return gold colors for gold category", () => {
    const colors = getColorsByCategory("gold");
    expect(colors.length).toBe(2); // gold, gold-light
    colors.forEach((c) => {
      expect(c.legacy).toMatch(/^gold/);
    });
  });

  it("should return success colors for success category", () => {
    const colors = getColorsByCategory("success");
    expect(colors.length).toBe(1);
    expect(colors[0].legacy).toBe("success");
  });
});

describe("generateCssCustomProperties", () => {
  it("should generate valid CSS string", () => {
    const css = generateCssCustomProperties();
    expect(css).toContain(":root");
    expect(css).toContain("--color.background.default");
    expect(css).toContain("--space.100");
    expect(css).toContain("--radius.100");
  });

  it("should include color tokens with hex values", () => {
    const css = generateCssCustomProperties();
    expect(css).toContain("#0F1E3C");
  });
});

// ============================================================================
// Legacy Constants Tests
// ============================================================================
describe("LEGACY_COLORS", () => {
  it("should define all legacy color values", () => {
    expect(LEGACY_COLORS.NAVY).toBe("#0F1E3C");
    expect(LEGACY_COLORS.GOLD).toBe("#D4A017");
    expect(LEGACY_COLORS.CREAM).toBe("#F5F5F0");
  });
});

describe("FONT_FAMILIES", () => {
  it("should define all font family values", () => {
    expect(FONT_FAMILIES.DISPLAY).toContain("Playfair Display");
    expect(FONT_FAMILIES.MONO).toContain("Space Grotesk");
    expect(FONT_FAMILIES.BODY).toContain("Inter");
  });
});

// ============================================================================
// Token Mapping Arrays Tests
// ============================================================================
describe("COLOR_TOKEN_MAPPINGS", () => {
  it("should include all brand colors", () => {
    const legacyNames = COLOR_TOKEN_MAPPINGS.map((m) => m.legacy);
    expect(legacyNames).toContain("navy");
    expect(legacyNames).toContain("navy-mid");
    expect(legacyNames).toContain("gold");
    expect(legacyNames).toContain("cream");
    expect(legacyNames).toContain("success");
    expect(legacyNames).toContain("danger");
  });

  it("should have valid oklch values for all colors", () => {
    COLOR_TOKEN_MAPPINGS.forEach((mapping) => {
      expect(mapping.oklch).toMatch(/^oklch\(/);
    });
  });

  it("should have descriptions for all colors", () => {
    COLOR_TOKEN_MAPPINGS.forEach((mapping) => {
      expect(mapping.description).toBeDefined();
      expect(mapping.description.length).toBeGreaterThan(0);
    });
  });
});

describe("SPACING_TOKEN_MAPPINGS", () => {
  it("should follow 8px grid system", () => {
    const space100 = SPACING_TOKEN_MAPPINGS.find((m) => m.name === "--space-100");
    expect(space100?.pixels).toBe(8);
    expect(space100?.rem).toBe("0.5rem");
  });

  it("should include all standard spacing values", () => {
    const names = SPACING_TOKEN_MAPPINGS.map((m) => m.name);
    expect(names).toContain("--space-0");
    expect(names).toContain("--space-100");
    expect(names).toContain("--space-200");
    expect(names).toContain("--space-400");
  });
});

describe("BORDER_RADIUS_TOKEN_MAPPINGS", () => {
  it("should include standard border radius values", () => {
    const names = BORDER_RADIUS_TOKEN_MAPPINGS.map((m) => m.name);
    expect(names).toContain("--radius-0");
    expect(names).toContain("--radius-100");
    expect(names).toContain("--radius-200");
    expect(names).toContain("--radius-full");
  });

  it("should have full radius as 9999px", () => {
    const fullRadius = BORDER_RADIUS_TOKEN_MAPPINGS.find(
      (m) => m.name === "--radius-full"
    );
    expect(fullRadius?.pixels).toBe(9999);
  });
});
