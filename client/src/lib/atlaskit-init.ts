/**
 * Atlaskit Feature Flags Initialization
 *
 * This module initializes the @atlaskit/platform-feature-flags system to prevent
 * console errors about uninitialized clients. The 'platform_dst_subtree_theming'
 * feature gate requires a boolean resolver to be set before AppProvider renders.
 *
 * Background:
 * - @atlaskit/app-provider uses @atlaskit/platform-feature-flags internally
 * - Without initialization, it throws: "Client must be initialized before using this method"
 * - We set a resolver that returns false for experimental features to avoid errors
 *
 * @see https://bitbucket.org/atlassian/atlassian-frontend-mirror
 */

import { setBooleanFeatureFlagResolver } from '@atlaskit/platform-feature-flags';

/**
 * Feature flag keys that require explicit handling
 */
const ATLASKIT_FEATURE_FLAGS = {
  /**
   * Platform DST (Design System Tokens) Subtree Theming
   * This is an experimental theming feature that we don't use.
   * Returning false disables the subtree theming implementation.
   */
  platform_dst_subtree_theming: false,

  /**
   * Platform Increased Contrast Themes
   * High contrast theme support for accessibility.
   * We handle theming through our custom LegalFinancialThemeContext.
   */
  platform_increased_contrast_themes: false,
} as const;

/**
 * Check if we're in development mode
 */
function isDevelopment(): boolean {
  // Check multiple sources since Vite's import.meta.env might not be available
  // in all contexts (e.g., test environments, certain bundler configurations)
  return (
    (typeof import.meta !== 'undefined' && import.meta.env?.DEV) ||
    (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') ||
    false
  );
}

/**
 * Custom feature flag resolver for Atlaskit components
 *
 * Returns false for all known experimental features to prevent
 * initialization errors. Unknown flags return false by default for safety.
 *
 * @param flagName - The feature flag key being checked
 * @returns boolean value for the flag (false for all experimental features)
 */
function atlaskitFeatureFlagResolver(flagName: string): boolean {
  // Check if this is a known Atlaskit feature flag
  if (flagName in ATLASKIT_FEATURE_FLAGS) {
    return ATLASKIT_FEATURE_FLAGS[flagName as keyof typeof ATLASKIT_FEATURE_FLAGS];
  }

  // Log unknown flags in development for debugging
  if (isDevelopment()) {
    console.debug(`[Atlaskit] Unknown feature flag checked: ${flagName}, returning false`);
  }

  // Return false for unknown flags (safe default)
  return false;
}

/**
 * Initialize Atlaskit platform feature flags
 *
 * This must be called before any Atlaskit components (especially AppProvider)
 * are rendered. Call this in your app entry point (main.tsx or index.tsx).
 *
 * @example
 * ```tsx
 * // In main.tsx or App.tsx
 * import { initAtlaskitFeatureFlags } from '@/lib/atlaskit-init';
 *
 * // Initialize before rendering
 * initAtlaskitFeatureFlags();
 *
 * // Now it's safe to use AtlaskitProvider
 * ReactDOM.render(<App />, rootElement);
 * ```
 */
export function initAtlaskitFeatureFlags(): void {
  try {
    setBooleanFeatureFlagResolver(atlaskitFeatureFlagResolver);

    if (isDevelopment()) {
      console.log('[Atlaskit] Feature flags initialized successfully');
    }
  } catch (error) {
    // If initialization fails, log but don't crash the app
    console.error('[Atlaskit] Failed to initialize feature flags:', error);

    // The app should still work, just with console warnings from Atlaskit
  }
}

/**
 * Re-export the setBooleanFeatureFlagResolver for advanced use cases
 * where apps might want to provide their own resolver implementation.
 */
export { setBooleanFeatureFlagResolver };
