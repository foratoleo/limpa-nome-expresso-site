/**
 * Vitest Configuration for Limpa Nome Expresso
 *
 * Supports both component testing (jsdom) and database/integration tests (node)
 */
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    // Use projects to separate client and server test environments
    projects: [
      // Client tests (React components) - uses jsdom
      {
        test: {
          globals: true,
          setupFiles: ["./client/src/__tests__/setup.ts"],
          environment: "jsdom",
          include: ["client/src/**/*.{test,spec}.{ts,tsx}"],
          exclude: ["node_modules", "dist", "e2e"],
          name: "client",
        },
      },
      // Server tests (database, API) - uses node
      {
        test: {
          globals: true,
          environment: "node",
          include: ["server/tests/**/*.{test,spec}.{ts,tsx}"],
          exclude: ["node_modules", "dist", "e2e"],
          name: "server",
        },
      },
    ],
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
        "server/routes/**/*.ts",
        "server/lib/**/*.ts",
      ],
      exclude: [
        "client/src/**/*.d.ts",
        "client/src/**/index.ts",
        "client/src/**/__tests__/**",
        "server/tests/**",
        "server/**/*.test.ts",
        "server/**/*.spec.ts",
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
  // Load environment variables from .env.local for tests
  env: {
    loadEnvFiles: true,
    envDir: process.cwd(),
  },
});
