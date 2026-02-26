/**
 * Playwright E2E Test Configuration
 *
 * Configuration for end-to-end testing with:
 * - Accessibility testing with axe-core
 * - Visual regression testing with screenshots
 * - Cross-browser testing
 * - Component migration validation
 */
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  // Test directory
  testDir: "./e2e",
  // Fully parallel tests
  fullyParallel: true,
  // Fail build on CI if you accidentally left test.only
  forbidOnly: !!process.env.CI,
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  // Parallel workers
  workers: process.env.CI ? 1 : undefined,
  // Reporter configuration
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["json", { outputFile: "test-results/results.json" }],
    ["list"],
  ],
  // Shared settings for all tests
  use: {
    // Base URL for tests
    baseURL: "http://localhost:3000",
    // Collect trace on failure
    trace: "on-first-retry",
    // Screenshot on failure
    screenshot: "only-on-failure",
    // Video on failure
    video: "retain-on-failure",
    // Action timeout
    actionTimeout: 10000,
    // Navigation timeout
    navigationTimeout: 30000,
  },
  // Configure projects for major browsers
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    // Mobile viewports for responsive testing
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 12"] },
    },
  ],
  // Run local dev server before tests
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
