/**
 * Admin Panel Search and Filter E2E Tests
 *
 * End-to-end tests for admin panel search, filtering, and real-time updates.
 */

import { test, expect } from '@playwright/test';

test.describe('Admin Panel Search', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin panel
    await page.goto('/admin');
    // Wait for admin authentication check
    await page.waitForURL('**/admin');
  });

  test('should search for users by email', async ({ page }) => {
    // Click on search input
    const searchInput = page.getByPlaceholder('Buscar por nome ou email...');
    await searchInput.fill('admin@example.com');

    // Wait for debounce (300ms + API response)
    await page.waitForTimeout(500);

    // Verify search results
    const results = page.locator('table tbody tr');
    await expect(results).toHaveCount(1);

    const emailCell = page.locator('table tbody tr td').first();
    await expect(emailCell).toContainText('admin@example.com');
  });

  test('should search for users by name', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Buscar por nome ou email...');
    await searchInput.fill('Admin');

    await page.waitForTimeout(500);

    const results = page.locator('table tbody tr');
    await expect(results).toHaveCountGreaterThan(0);
  });

  test('should clear search with X button', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Buscar por nome ou email...');
    await searchInput.fill('admin');
    await page.waitForTimeout(500);

    // Click clear button
    const clearButton = page.locator('button').filter({ hasText: /×/i });
    await clearButton.click();

    // Verify search is cleared
    await expect(searchInput).toHaveValue('');

    // Wait for results to refresh
    await page.waitForTimeout(500);

    // Verify all users are shown
    const results = page.locator('table tbody tr');
    await expect(results).toHaveCountGreaterThan(1);
  });
});

test.describe('Admin Panel Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
    await page.waitForURL('**/admin');
  });

  test('should filter by status "Ativo"', async ({ page }) => {
    // Click status dropdown
    const statusDropdown = page.getByText('Status');
    await statusDropdown.click();

    // Select "Ativo" checkbox
    const activeCheckbox = page.getByText('Ativo');
    await activeCheckbox.click();

    // Close dropdown
    await statusDropdown.click();

    // Wait for filter to apply
    await page.waitForTimeout(300);

    // Verify only active users shown
    const statusBadges = page.locator('table tbody tr td:nth-child(6)');
    const count = await statusBadges.count();

    for (let i = 0; i < count; i++) {
      await expect(statusBadges.nth(i)).toContainText('Ativo', { useInnerText: true });
    }
  });

  test('should filter by access type "Manual"', async ({ page }) => {
    // Click access type dropdown
    const accessTypeDropdown = page.getByText('Tipo de Acesso');
    await accessTypeDropdown.click();

    // Select "Manual" checkbox
    const manualCheckbox = page.getByText('Manual');
    await manualCheckbox.click();

    // Close dropdown
    await accessTypeDropdown.click();

    // Wait for filter to apply
    await page.waitForTimeout(300);

    // Verify results are updated
    const results = page.locator('table tbody tr');
    await expect(results).toHaveCountGreaterThan(0);
  });

  test('should clear all filters', async ({ page }) => {
    // Apply filters
    const statusDropdown = page.getByText('Status');
    await statusDropdown.click();
    await page.getByText('Ativo').click();
    await statusDropdown.click();

    // Wait for filter
    await page.waitForTimeout(300);

    // Click clear filters
    const clearButton = page.getByText('Limpar filtros');
    await clearButton.click();

    // Verify filters are cleared
    await expect(clearButton).not.toBeVisible();
  });

  test('should combine search and filters', async ({ page }) => {
    // Enter search term
    const searchInput = page.getByPlaceholder('Buscar por nome ou email...');
    await searchInput.fill('admin');
    await page.waitForTimeout(500);

    // Apply status filter
    const statusDropdown = page.getByText('Status');
    await statusDropdown.click();
    await page.getByText('Ativo').click();
    await statusDropdown.click();
    await page.waitForTimeout(300);

    // Verify results match both criteria
    const results = page.locator('table tbody tr');
    await expect(results).toHaveCountGreaterThan(0);

    // Clear search, verify filter still applies
    const clearButton = page.locator('button').filter({ hasText: /×/i });
    await clearButton.click();
    await page.waitForTimeout(500);

    // Should still be filtered by status
    const statusBadges = page.locator('table tbody tr td:nth-child(6)');
    await expect(statusBadges.first()).toContainText('Ativo', { useInnerText: true });
  });
});

test.describe('Admin Panel Optimistic Updates', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
    await page.waitForURL('**/admin');
  });

  test('should show optimistic update when granting access', async ({ page }) => {
    // Get initial user count
    const initialCount = await page.locator('table tbody tr').count();

    // Fill grant access form
    await page.fill('input[type="email"]', 'newuser@example.com');
    await page.click('button:has-text("Conceder Acesso")');

    // Verify user appears immediately (optimistic update)
    const newCount = await page.locator('table tbody tr').count();
    expect(newCount).toBe(initialCount + 1);

    // Verify email is in the list
    await expect(page.locator('table tbody tr')).toContainText('newuser@example.com');
  });

  test('should rollback on error', async ({ page }) => {
    // Simulate network failure
    await page.route('**/api/admin/access/grant', route => route.abort());

    const initialCount = await page.locator('table tbody tr').count();

    // Try to grant access
    await page.fill('input[type="email"]', 'fail@example.com');
    await page.click('button:has-text("Conceder Acesso")');

    // Wait for error
    await page.waitForTimeout(1000);

    // Verify rollback (count should be same)
    const finalCount = await page.locator('table tbody tr').count();
    expect(finalCount).toBe(initialCount);

    // Verify error toast
    await expect(page.locator('text=Erro ao conceder acesso')).toBeVisible();
  });

  test('should update UI immediately when revoking access', async ({ page }) => {
    // Find an active user
    const activeUserRow = page.locator('table tbody tr').filter({
      hasText: 'Ativo',
    }).first();

    const initialBadge = activeUserRow.locator('td:nth-child(6)');
    await expect(initialBadge).toContainText('Ativo');

    // Click revoke button
    const revokeButton = activeUserRow.locator('button[title="Revogar acesso"]');
    await revokeButton.click();

    // Verify optimistic update (badge changes immediately)
    await expect(initialBadge).not.toContainText('Ativo');
  });
});

test.describe('Admin Panel Real-time Updates', () => {
  test('should show updates from another tab', async ({ context }) => {
    // Create two pages/tabs
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    await page1.goto('/admin');
    await page2.goto('/admin');

    // Grant access in page1
    await page1.fill('input[type="email"]', 'realtime@example.com');
    await page1.click('button:has-text("Conceder Acesso")');

    // Verify update appears in page2 without refresh
    await page2.waitForTimeout(500);
    await expect(page2.locator('table tbody tr')).toContainText('realtime@example.com');
  });
});
