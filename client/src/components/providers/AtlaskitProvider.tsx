/**
 * AtlaskitProvider - Theme context provider for Atlassian Design System integration.
 *
 * This component wraps the application with the Atlassian AppProvider and
 * applies the custom Legal Financial theme (navy/gold color palette).
 *
 * Features:
 * - Integrates with @atlaskit/app-provider for Atlassian component theming
 * - Applies CSS custom properties for token access in stylesheets
 * - Supports optional theme switching (light/dark modes)
 * - Maintains compatibility with existing ThemeProvider context
 * - Includes error boundary for theme loading failures
 *
 * @example
 * ```tsx
 * // Basic usage
 * <AtlaskitProvider>
 *   <App />
 * </AtlaskitProvider>
 *
 * // With theme switching
 * <AtlaskitProvider defaultMode="dark" switchable>
 *   <App />
 * </AtlaskitProvider>
 * ```
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AppProvider, { ThemeProvider as AtlaskitThemeProvider, type Theme } from '@atlaskit/app-provider';
import {
  createLegalFinancialTheme,
  applyThemeToRoot,
} from '@/lib/atlaskit-theme';
import type { AtlaskitProviderProps, ThemeContextValue, LegalFinancialTheme } from '@/types/theme';

// Context for Legal Financial theme state
const LegalFinancialThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Hook to access the current Legal Financial theme context.
 *
 * @returns ThemeContextValue with theme, toggleMode, and switchable
 * @throws Error if used outside of AtlaskitProvider
 *
 * @example
 * ```tsx
 * const { theme, toggleMode, switchable } = useLegalFinancialTheme();
 * console.log(theme.mode); // 'dark' or 'light'
 * if (switchable) toggleMode?.();
 * ```
 */
export function useLegalFinancialTheme(): ThemeContextValue {
  const context = useContext(LegalFinancialThemeContext);
  if (!context) {
    throw new Error('useLegalFinancialTheme must be used within AtlaskitProvider');
  }
  return context;
}

/**
 * Error Boundary component for catching theme-related errors.
 * Provides a fallback UI when theme initialization fails.
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ThemeErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('AtlaskitProvider theme error:', error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            style={{
              padding: '20px',
              backgroundColor: '#0F1E3C',
              color: '#F5F5F0',
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <h1 style={{ marginBottom: '16px' }}>Erro ao carregar tema</h1>
            <p style={{ marginBottom: '8px', color: '#E8E4D8' }}>
              Ocorreu um erro ao inicializar o sistema de design.
            </p>
            {this.state.error && (
              <pre style={{
                marginBottom: '16px',
                padding: '12px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '8px',
                maxWidth: '600px',
                overflow: 'auto',
                fontSize: '12px',
                color: '#FF5630'
              }}>
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                backgroundColor: '#D4A017',
                color: '#0F1E3C',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Recarregar pagina
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

/**
 * Inner component that handles theme state and application.
 * Separated to use hooks within the AppProvider context.
 */
function AtlaskitProviderInner({
  children,
  defaultMode = 'dark',
  switchable = false,
}: AtlaskitProviderProps): React.ReactElement {
  const [theme, setTheme] = useState<LegalFinancialTheme>(() => {
    // Initialize theme from localStorage if switchable
    const initialMode = switchable
      ? (localStorage.getItem('legal-financial-theme-mode') as 'light' | 'dark') || defaultMode
      : defaultMode;
    return createLegalFinancialTheme(initialMode, 'normal');
  });

  // Apply theme to root element on mount and when theme changes
  useEffect(() => {
    applyThemeToRoot(theme);

    // Persist mode preference if switchable
    if (switchable) {
      localStorage.setItem('legal-financial-theme-mode', theme.mode);
    }
  }, [theme, switchable]);

  // Toggle function for theme switching
  const toggleMode = useCallback(() => {
    if (!switchable) return;

    setTheme((prevTheme: LegalFinancialTheme) => {
      const newMode = prevTheme.mode === 'dark' ? 'light' : 'dark';
      return createLegalFinancialTheme(newMode, prevTheme.density);
    });
  }, [switchable]);

  const contextValue: ThemeContextValue = {
    theme,
    toggleMode: switchable ? toggleMode : undefined,
    switchable,
  };

  return (
    <LegalFinancialThemeContext.Provider value={contextValue}>
      {children}
    </LegalFinancialThemeContext.Provider>
  );
}

/**
 * AtlaskitProvider - Main provider component for Atlassian Design System.
 *
 * Wraps the application with:
 * 1. AppProvider from @atlaskit/app-provider for component theming
 * 2. LegalFinancialThemeContext for custom theme state
 * 3. ThemeErrorBoundary for graceful error handling
 *
 * @param props - AtlaskitProviderProps
 * @param props.children - Child components to wrap
 * @param props.defaultMode - Initial theme mode ('dark' | 'light'), default 'dark'
 * @param props.switchable - Enable theme mode switching, default false
 *
 * @example
 * ```tsx
 * // In App.tsx
 * import { AtlaskitProvider } from '@/components/providers/AtlaskitProvider';
 *
 * function App() {
 *   return (
 *     <AtlaskitProvider defaultMode="dark">
 *       <Router />
 *     </AtlaskitProvider>
 *   );
 * }
 * ```
 */
export function AtlaskitProvider({
  children,
  defaultMode = 'dark',
  switchable = false,
}: AtlaskitProviderProps): React.ReactElement {
  return (
    <ThemeErrorBoundary>
      <AppProvider defaultColorMode={defaultMode}>
        <AtlaskitProviderInner defaultMode={defaultMode} switchable={switchable}>
          {children}
        </AtlaskitProviderInner>
      </AppProvider>
    </ThemeErrorBoundary>
  );
}

export default AtlaskitProvider;
