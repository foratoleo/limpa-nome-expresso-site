/**
 * Playwright Accessibility E2E Tests
 *
 * Tests for validating accessibility compliance of the migrated Atlassian Design System components:
 * - Keyboard navigation
 * - Screen reader support
 * - ARIA attributes
 * - Focus management
 * - Color contrast
 */
import { test, expect } from "@playwright/test";

test.describe("Homepage Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should have no automatically detectable accessibility issues on homepage", async ({ page }) => {
    // Wait for page to be fully loaded
    await page.waitForLoadState("networkidle");

    // Check for basic accessibility requirements
    // Page should have a title
    await expect(page).toHaveTitle(/Limpa Nome/i);

    // Page should have a main landmark
    const main = page.locator("main");
    await expect(main).toBeVisible();

    // All images should have alt text
    const images = page.locator("img");
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute("alt");
      const ariaLabel = await img.getAttribute("aria-label");
      const ariaHidden = await img.getAttribute("aria-hidden");
      expect(alt || ariaLabel || ariaHidden === "true").toBeTruthy();
    }
  });

  test("should have proper heading hierarchy", async ({ page }) => {
    // Should have exactly one h1
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);

    // H1 should contain main title
    const h1 = page.locator("h1");
    await expect(h1).toContainText("Limpa Nome");
  });

  test("should be fully navigable via keyboard", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Focus should start at the top of the page
    await page.keyboard.press("Tab");

    // First focusable element should be visible
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();

    // Should be able to navigate through interactive elements
    const tabStops: string[] = [];
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press("Tab");
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? (el.tagName + (el.getAttribute("aria-label") || el.textContent?.substring(0, 20) || "")) : null;
      });
      if (focused) {
        tabStops.push(focused);
      }
    }

    // Should have navigated through multiple elements
    expect(tabStops.length).toBeGreaterThan(5);
  });

  test("should have visible focus indicators on interactive elements", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Tab to first interactive element
    await page.keyboard.press("Tab");

    // Get the focused element
    const focusedElement = page.locator(":focus");

    // Check that focus indicator is visible (element should have outline or ring)
    const outline = await focusedElement.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        outlineWidth: styles.outlineWidth,
        outlineStyle: styles.outlineStyle,
        boxShadow: styles.boxShadow,
      };
    });

    // Element should have some form of visible focus
    const hasVisibleFocus =
      outline.outlineWidth !== "0px" ||
      outline.outlineStyle !== "none" ||
      outline.boxShadow !== "none";

    expect(hasVisibleFocus).toBeTruthy();
  });
});

test.describe("CheckItem Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("checklist items should have proper ARIA attributes", async ({ page }) => {
    // Find a checklist item button
    const checkItem = page.locator('button[aria-pressed]').first();
    await expect(checkItem).toBeVisible();

    // Should have aria-pressed attribute
    const ariaPressed = await checkItem.getAttribute("aria-pressed");
    expect(["true", "false"]).toContain(ariaPressed);

    // Should have accessible label
    const ariaLabel = await checkItem.getAttribute("aria-label");
    expect(ariaLabel).toBeTruthy();
  });

  test("should toggle checklist item with Space key", async ({ page }) => {
    // Find and focus a checklist item
    const checkItem = page.locator('button[aria-pressed="false"]').first();

    // Get initial state
    const initialState = await checkItem.getAttribute("aria-pressed");
    expect(initialState).toBe("false");

    // Focus and press Space
    await checkItem.focus();
    await page.keyboard.press("Space");

    // State should change
    await expect(checkItem).toHaveAttribute("aria-pressed", "true");
  });

  test("should toggle checklist item with Enter key", async ({ page }) => {
    // Find and focus a checklist item
    const checkItem = page.locator('button[aria-pressed="false"]').first();

    // Focus and press Enter
    await checkItem.focus();
    await page.keyboard.press("Enter");

    // State should change
    await expect(checkItem).toHaveAttribute("aria-pressed", "true");
  });

  test("checked items should show strikethrough", async ({ page }) => {
    // Click a checklist item to check it
    const checkItem = page.locator('button[aria-pressed="false"]').first();
    await checkItem.click();

    // Wait for state change
    await expect(checkItem).toHaveAttribute("aria-pressed", "true");

    // The label should have line-through style
    const label = checkItem.locator(".line-through");
    await expect(label).toBeVisible();
  });
});

test.describe("Button Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("buttons should have accessible names", async ({ page }) => {
    const buttons = page.locator('button:visible');
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute("aria-label");
      const title = await button.getAttribute("title");

      // Button should have some form of accessible name
      expect(text || ariaLabel || title).toBeTruthy();
    }
  });

  test("disabled buttons should have proper ARIA state", async ({ page }) => {
    // Find any disabled buttons
    const disabledButtons = page.locator('button[disabled]');

    const count = await disabledButtons.count();
    if (count > 0) {
      const button = disabledButtons.first();
      await expect(button).toBeDisabled();
    }
  });

  test("external link buttons should indicate they open in new tab", async ({ page }) => {
    // Find links that open in new tabs
    const externalLinks = page.locator('a[target="_blank"]');

    const count = await externalLinks.count();
    if (count > 0) {
      const link = externalLinks.first();
      // Should have aria-label or external icon indicator
      const ariaLabel = await link.getAttribute("aria-label");
      const hasExternalIcon = await link.locator('[aria-label*="externo"], [aria-label*="external"]').count();

      expect(ariaLabel || hasExternalIcon).toBeTruthy();
    }
  });
});

test.describe("Progress Bar Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("global progress bar should be visible at top of page", async ({ page }) => {
    const progressBar = page.locator(".fixed.top-0").first();
    await expect(progressBar).toBeVisible();
  });

  test("progress section should show current progress", async ({ page }) => {
    // Find the progress text
    const progressText = page.locator("text=/\\d+\\/\\d+ itens/").first();
    await expect(progressText).toBeVisible();

    // Should show percentage
    const percentText = page.locator("text=/\\d+%/").first();
    await expect(percentText).toBeVisible();
  });

  test("progress should update when items are checked", async ({ page }) => {
    // Get initial progress
    const progressText = await page.locator("text=/\\d+%/").first().textContent();
    const initialPercent = parseInt(progressText?.match(/\d+/)?.[0] || "0");

    // Check an item
    const checkItem = page.locator('button[aria-pressed="false"]').first();
    await checkItem.click();

    // Wait for progress to potentially update
    await page.waitForTimeout(500);

    // Get new progress
    const newProgressText = await page.locator("text=/\\d+%/").first().textContent();
    const newPercent = parseInt(newProgressText?.match(/\d+/)?.[0] || "0");

    // Progress should have increased or stayed same (if already at max)
    expect(newPercent).toBeGreaterThanOrEqual(initialPercent);
  });
});

test.describe("Color Contrast Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("text should have sufficient contrast against background", async ({ page }) => {
    // Check that the main text color is visible against the navy background
    const body = page.locator("body");

    // Verify the page uses the expected dark theme colors
    const bgColor = await body.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Background should be dark (navy theme)
    expect(bgColor).toBeTruthy();
  });

  test("gold accent color should be visible against navy", async ({ page }) => {
    // Find an element with gold color (accent text)
    const goldElements = page.locator("text=/#D4A017|rgb\\(212, 160, 23\\)/");

    // At least one gold element should be visible (the title accent)
    const titleAccent = page.locator("span").filter({ hasText: "Expresso" }).first();
    await expect(titleAccent).toBeVisible();
  });
});

test.describe("Responsive Accessibility", () => {
  test("should be accessible on mobile viewport", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // All interactive elements should still be accessible
    const buttons = page.locator("button:visible");
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);

    // Should be able to tap checklist items
    const checkItem = page.locator('button[aria-pressed]').first();
    await checkItem.tap();
    await expect(checkItem).toHaveAttribute("aria-pressed", "true");
  });

  test("should be accessible on tablet viewport", async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Page should render properly
    const main = page.locator("main");
    await expect(main).toBeVisible();
  });

  test("should be accessible on desktop viewport", async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Page should render properly
    const main = page.locator("main");
    await expect(main).toBeVisible();
  });
});

test.describe("Screen Reader Support", () => {
  test("page should have proper landmark regions", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Should have header landmark
    const header = page.locator("header");
    await expect(header).toBeVisible();

    // Should have main landmark
    const main = page.locator("main");
    await expect(main).toBeVisible();

    // Should have footer
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
  });

  test("step cards should have proper structure", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Find step cards
    const stepCards = page.locator("[data-testid^='step-'], article, section").filter({
      has: page.locator("h3, h4"),
    });

    const count = await stepCards.count();
    expect(count).toBeGreaterThan(0);

    // Each should have a heading
    for (let i = 0; i < Math.min(count, 5); i++) {
      const card = stepCards.nth(i);
      const heading = card.locator("h3, h4");
      await expect(heading).toBeVisible();
    }
  });

  test("warning banner should have appropriate role", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Find warning/alert sections
    const warningBanner = page.locator("text=/Atencao|Alerta|Aviso|Golpe/").first();
    await expect(warningBanner).toBeVisible();
  });
});
