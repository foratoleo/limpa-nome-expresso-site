/**
 * Vitest Configuration for Limpa Nome Expresso
 *
 * Component testing configuration for React components using:
 * - jsdom environment for DOM simulation
 * - @testing-library/react for component testing
 * - Coverage reporting for migration validation
 */
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom for DOM simulation
    environment: "jsdom",
    jsdom: {
      // Include custom elements for Atlaskit components
      resources: "usable",
    },
    // Global test utilities
    globals: true,
    // Setup files
    setupFiles: ["./client/src/__tests__/setup.ts"],
    // Include patterns
    include: ["client/src/**/*.{test,spec}.{ts,tsx}"],
    // Exclude patterns
    exclude: ["node_modules", "dist", "e2e"],
    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: [
        "client/src/components/**/*.{ts,tsx}",
        "client/src/lib/**/*.{ts,tsx}",
        "client/src/utils/**/*.{ts,tsx}",
        "client/src/types/**/*.{ts,tsx}",
      ],
      exclude: [
        "client/src/**/*.d.ts",
        "client/src/**/index.ts",
        "client/src/**/__tests__/**",
      ],
      // Thresholds for migration validation
      thresholds: {
        statements: 50,
        branches: 40,
        functions: 50,
        lines: 50,
      },
    },
    // Timeout for async operations
    testTimeout: 10000,
    // Retry failed tests once
    retry: 1,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  // Define environment variables for tests
  define: {
    "process.env.NODE_ENV": JSON.stringify("test"),
  },
});
