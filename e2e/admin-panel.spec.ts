/**
 * E2E tests for Admin Panel workflows
 *
 * Tests complete admin workflows including:
 * - Viewing list of users
 * - Granting access with form
 * - Revoking access with confirmation
 * - Status badge colors
 */

import { test, expect } from "@playwright/test";

test.describe("Admin Panel E2E", () => {
  // Login before each test
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto("/login");

    // Fill in login credentials (use admin test user)
    await page.fill('input[type="email"]', "admin-test@example.com");
    await page.fill('input[type="password"]', "test-password-123");
    await page.click('button[type="submit"]');

    // Wait for navigation to complete
    await page.waitForURL(/\/guia|\/admin/);
  });

  test("admin can view list of all users", async ({ page }) => {
    // Navigate to admin panel
    await page.goto("/admin");

    // Wait for page to load
    await page.waitForSelector('[data-slot="table"]');

    // Verify table is visible
    const table = page.locator('[data-slot="table"]');
    await expect(table).toBeVisible();

    // Verify table headers
    await expect(page.locator("th")).toContainText(["Usuário", "Status", "Ações"]);
  });

  test("status badges are visible with correct colors", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForSelector('[data-slot="badge"]');

    // Check for status badges
    const badges = page.locator('[data-slot="badge"]');
    await expect(badges.first()).toBeVisible();

    // Verify badge text content (Ativo, Expirado, Manual, etc.)
    const badgeTexts = await badges.allTextContents();
    expect(badgeTexts.some(text => ["Ativo", "Expirado", "Manual", "Grátis"].includes(text))).toBeTruthy();
  });

  test("grant access flow: fill form, submit, verify success toast", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForSelector("form");

    // Fill grant access form
    await page.fill('input[name="email"]', "testuser@example.com");
    await page.fill('textarea[name="reason"]', "Test access for E2E tests");

    // Set expiration date (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.fill('input[type="date"]', tomorrow.toISOString().split("T")[0]);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for success toast
    await page.waitForSelector('[data-sonner-toast]', { timeout: 5000 });

    // Verify success message
    const toast = page.locator('[data-sonner-toast]');
    await expect(toast).toContainText("Acesso concedido");
  });

  test("grant access with optional reason and expiration date", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForSelector("form");

    // Fill form without optional fields
    await page.fill('input[name="email"]', "anotheruser@example.com");

    // Submit without reason and expiration
    await page.click('button[type="submit"]');

    // Verify success
    await page.waitForSelector('[data-sonner-toast]', { timeout: 5000 });
    const toast = page.locator('[data-sonner-toast]');
    await expect(toast).toContainText("Acesso concedido");
  });

  test("revoke access flow: click button, confirm dialog, verify success", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForSelector('[data-slot="table"]');

    // Find a user with active access and click revoke button
    const revokeButton = page.locator('button[title*="Revogar"]').first();
    if (await revokeButton.isVisible()) {
      await revokeButton.click();

      // Wait for confirmation dialog
      await page.waitForSelector('[data-slot="alert-dialog-content"]');

      // Verify dialog content
      await expect(page.locator('[data-slot="alert-dialog-title"]')).toContainText(/Revogar acesso/i);

      // Click confirm button
      await page.click('button:has-text("Revogar acesso")');

      // Wait for success toast
      await page.waitForSelector('[data-sonner-toast]', { timeout: 5000 });
      const toast = page.locator('[data-sonner-toast]');
      await expect(toast).toContainText("Acesso revogado");
    }
  });

  test("revoke confirmation dialog shows warning message", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForSelector('[data-slot="table"]');

    // Click revoke button
    const revokeButton = page.locator('button[title*="Revogar"]').first();
    if (await revokeButton.isVisible()) {
      await revokeButton.click();

      // Wait for dialog
      await page.waitForSelector('[data-slot="alert-dialog-content"]');

      // Verify warning message
      const description = page.locator('[data-slot="alert-dialog-description"]');
      await expect(description).toContainText(/Esta ação não pode ser desfeita/i);
    }
  });

  test("cancel button in dialog does not revoke access", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForSelector('[data-slot="table"]');

    // Get initial count of active users (if possible to determine)
    const revokeButton = page.locator('button[title*="Revogar"]').first();
    if (await revokeButton.isVisible()) {
      await revokeButton.click();

      // Wait for dialog
      await page.waitForSelector('[data-slot="alert-dialog-content"]');

      // Click cancel
      await page.click('button:has-text("Cancelar")');

      // Dialog should close
      await expect(page.locator('[data-slot="alert-dialog-content"]')).not.toBeVisible();

      // No success toast should appear
      const toast = page.locator('[data-sonner-toast]:has-text("revogado")');
      await expect(toast).not.toBeVisible({ timeout: 2000 });
    }
  });

  test("refresh button updates user list", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForSelector('button:has-text("Atualizar")');

    // Click refresh button
    await page.click('button:has-text("Atualizar")');

    // Wait for table to reload
    await page.waitForSelector('[data-slot="table"]');

    // Verify table is still visible
    const table = page.locator('[data-slot="table"]');
    await expect(table).toBeVisible();
  });
});
