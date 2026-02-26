/**
 * Playwright Visual Regression Tests
 *
 * Screenshot-based visual regression tests for validating the Atlassian Design System migration:
 * - Component visual consistency
 * - Theme application
 * - Responsive layouts
 * - Color accuracy
 */
import { test, expect } from "@playwright/test";

test.describe("Homepage Visual Regression", () => {
  test("homepage should match visual snapshot", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Wait for fonts to load
    await page.waitForTimeout(1000);

    // Take full page screenshot
    await expect(page).toHaveScreenshot("homepage-full.png", {
      fullPage: true,
      maxDiffPixels: 1000, // Allow some variance for anti-aliasing
    });
  });

  test("hero section should match visual snapshot", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const hero = page.locator("header").first();
    await expect(hero).toHaveScreenshot("hero-section.png", {
      maxDiffPixels: 500,
    });
  });

  test("progress bar section should match visual snapshot", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Find the sticky progress section
    const progressSection = page.locator(".sticky").filter({
      has: page.locator("text=/Seu Progresso/"),
    });

    await expect(progressSection).toHaveScreenshot("progress-section.png", {
      maxDiffPixels: 300,
    });
  });
});

test.describe("Step Card Visual Regression", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("first step card should match visual snapshot", async ({ page }) => {
    // Find the first step card (Passo 1)
    const stepCard = page.locator("text=/Passo 1|1\\./").first().locator("xpath=ancestor::*[contains(@class, 'rounded') or contains(@class, 'card')][1]");

    // Alternative: find by step number pattern
    const firstStep = page.locator("div").filter({ hasText: "Reuniao de Documentos" }).first();

    await expect(firstStep).toHaveScreenshot("step-card-1.png", {
      maxDiffPixels: 500,
    });
  });

  test("step card with checked items should look different", async ({ page }) => {
    // Check all items in the first step
    const checkItems = page.locator('button[aria-pressed="false"]').locator("xpath=ancestor::div[contains(@class, 'rounded')][1]//button[aria-pressed]");

    const count = await checkItems.count();
    for (let i = 0; i < Math.min(count, 3); i++) {
      const item = page.locator('button[aria-pressed="false"]').first();
      await item.click();
      await page.waitForTimeout(100);
    }

    // Take screenshot of step card with checked items
    const firstStep = page.locator("div").filter({ hasText: "Reuniao de Documentos" }).first();

    await expect(firstStep).toHaveScreenshot("step-card-checked.png", {
      maxDiffPixels: 500,
    });
  });
});

test.describe("Downloads Section Visual Regression", () => {
  test("downloads section should match visual snapshot", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Find downloads section
    const downloadsSection = page.locator("text=/Downloads|Documentos/").first().locator("xpath=ancestor::div[contains(@class, 'rounded')][1]");

    await expect(downloadsSection).toHaveScreenshot("downloads-section.png", {
      maxDiffPixels: 500,
    });
  });
});

test.describe("Global Progress Bar Visual Regression", () => {
  test("global progress bar should match visual snapshot", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // The global progress bar is fixed at the top
    const globalProgress = page.locator(".fixed.top-0").first();

    await expect(globalProgress).toHaveScreenshot("global-progress-bar.png", {
      maxDiffPixels: 200,
    });
  });

  test("progress bar at 50% should match visual snapshot", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check approximately half of all items
    const allItems = await page.locator('button[aria-pressed]').count();
    const halfItems = Math.floor(allItems / 2);

    for (let i = 0; i < halfItems; i++) {
      const item = page.locator('button[aria-pressed="false"]').first();
      if (await item.count() > 0) {
        await item.click();
        await page.waitForTimeout(50);
      }
    }

    // Take screenshot of progress section
    const progressSection = page.locator(".sticky").filter({
      has: page.locator("text=/Seu Progresso/"),
    });

    await expect(progressSection).toHaveScreenshot("progress-50-percent.png", {
      maxDiffPixels: 300,
    });
  });

  test("progress bar at 100% should match visual snapshot", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check all items
    let remaining = await page.locator('button[aria-pressed="false"]').count();

    while (remaining > 0) {
      const item = page.locator('button[aria-pressed="false"]').first();
      if (await item.count() > 0) {
        await item.click();
        await page.waitForTimeout(50);
        remaining = await page.locator('button[aria-pressed="false"]').count();
      } else {
        break;
      }
    }

    // Take screenshot of progress section at 100%
    const progressSection = page.locator(".sticky").filter({
      has: page.locator("text=/Seu Progresso/"),
    });

    await expect(progressSection).toHaveScreenshot("progress-100-percent.png", {
      maxDiffPixels: 300,
    });
  });
});

test.describe("Theme Visual Regression", () => {
  test("navy background theme should be applied correctly", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check that the navy background is applied
    const body = page.locator("body");
    const bgColor = await body.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Background should be dark (close to navy #0F1E3C)
    // Parse RGB values
    const match = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      const [, r, g, b] = match.map(Number);
      // Navy #0F1E3C = rgb(15, 30, 60)
      // Allow some tolerance
      expect(r).toBeLessThan(50);
      expect(g).toBeLessThan(60);
      expect(b).toBeLessThan(100);
    }
  });

  test("gold accent color should be visible", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Find the title with gold accent
    const goldAccent = page.locator("span").filter({ hasText: "Expresso" }).first();
    await expect(goldAccent).toBeVisible();

    // Take screenshot focusing on the gold accent
    await expect(goldAccent).toHaveScreenshot("gold-accent.png", {
      maxDiffPixels: 200,
    });
  });
});

test.describe("Responsive Visual Regression", () => {
  test("mobile layout should match visual snapshot", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot("mobile-homepage.png", {
      fullPage: true,
      maxDiffPixels: 1500,
    });
  });

  test("tablet layout should match visual snapshot", async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot("tablet-homepage.png", {
      fullPage: true,
      maxDiffPixels: 1500,
    });
  });

  test("desktop layout should match visual snapshot", async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot("desktop-homepage.png", {
      fullPage: true,
      maxDiffPixels: 2000,
    });
  });
});

test.describe("Component Visual Regression", () => {
  test("check item unchecked state should match visual snapshot", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const uncheckedItem = page.locator('button[aria-pressed="false"]').first();

    await expect(uncheckedItem).toHaveScreenshot("checkitem-unchecked.png", {
      maxDiffPixels: 200,
    });
  });

  test("check item checked state should match visual snapshot", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Find and click an item
    const item = page.locator('button[aria-pressed="false"]').first();
    await item.click();
    await page.waitForTimeout(100);

    // Now it should be checked
    const checkedItem = page.locator('button[aria-pressed="true"]').first();

    await expect(checkedItem).toHaveScreenshot("checkitem-checked.png", {
      maxDiffPixels: 200,
    });
  });

  test("external link button should match visual snapshot", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Find an external link
    const externalLink = page.locator('a[target="_blank"]').first();

    if (await externalLink.count() > 0) {
      await expect(externalLink).toHaveScreenshot("external-link.png", {
        maxDiffPixels: 200,
      });
    }
  });
});

test.describe("Warning Banner Visual Regression", () => {
  test("warning banner should match visual snapshot", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Find the warning banner about scams
    const warningBanner = page.locator("text=/Golpe|Atencao/").first().locator("xpath=ancestor::div[contains(@class, 'rounded') or contains(@class, 'border')][1]");

    await expect(warningBanner).toHaveScreenshot("warning-banner.png", {
      maxDiffPixels: 500,
    });
  });
});

test.describe("Footer Visual Regression", () => {
  test("footer should match visual snapshot", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const footer = page.locator("footer");
    await expect(footer).toHaveScreenshot("footer.png", {
      maxDiffPixels: 300,
    });
  });
});
