// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Page Operations E2E Tests
 *
 * Tests for viewing, creating, editing, and deleting wiki pages.
 * These tests run with authenticated user (from setup).
 */

test.describe('Page Operations', () => {
  // Use authenticated state from setup
  test.use({ storageState: './tests/e2e/.auth/user.json' });

  test.describe('View Pages', () => {
    test('should display home page', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Page should load without error
      await expect(page).not.toHaveURL(/error|500|404/);

      // Should have some content
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });

    test('should navigate to wiki pages', async ({ page }) => {
      await page.goto('/wiki/Main');
      await page.waitForLoadState('networkidle');

      // Should either show the page or a "create new page" option
      const hasContent = await page.locator('.wiki-content, .page-content, article, main').count() > 0;
      const hasCreateOption = await page.locator('a:has-text("Create"), button:has-text("Create")').count() > 0;

      expect(hasContent || hasCreateOption).toBe(true);
    });
  });

  test.describe('Create Page', () => {
    const testPageTitle = `E2E-Test-Page-${Date.now()}`;

    test('should create a new wiki page', async ({ page }) => {
      // Navigate to create/edit page
      await page.goto('/edit');
      await page.waitForLoadState('networkidle');

      // Fill in page details
      const titleInput = page.locator('input[name="title"], input[name="pageName"], #title, #pageName');
      const contentInput = page.locator('textarea[name="content"], textarea#content, .editor textarea, .CodeMirror');

      if (await titleInput.count() > 0) {
        await titleInput.first().fill(testPageTitle);
      }

      // Handle different editor types
      if (await contentInput.count() > 0) {
        await contentInput.first().fill('# Test Page\n\nThis is a test page created by E2E tests.');
      } else {
        // CodeMirror or other rich editor
        const editor = page.locator('.CodeMirror, .editor');
        if (await editor.count() > 0) {
          await editor.click();
          await page.keyboard.type('# Test Page\n\nThis is a test page created by E2E tests.');
        }
      }

      // Submit
      await page.click('button[type="submit"], button:has-text("Save"), input[type="submit"]');
      await page.waitForLoadState('networkidle');

      // Verify page was created - should redirect to view page
      await expect(page).not.toHaveURL(/edit/);
    });
  });

  test.describe('Edit Page', () => {
    test('should be able to edit an existing page', async ({ page }) => {
      // Go to home or main page
      await page.goto('/wiki/Main');
      await page.waitForLoadState('networkidle');

      // Find and click edit button/link
      const editLink = page.locator('a:has-text("Edit"), button:has-text("Edit"), a[href*="edit"]');

      if (await editLink.count() > 0) {
        await editLink.first().click();
        await page.waitForLoadState('networkidle');

        // Should be on edit page
        const onEditPage = page.url().includes('edit');
        const hasEditor = await page.locator('textarea, .editor, .CodeMirror').count() > 0;

        expect(onEditPage || hasEditor).toBe(true);
      } else {
        // No edit link - might be permissions or page doesn't exist
        test.skip();
      }
    });
  });

  test.describe('Page Navigation', () => {
    test('should show breadcrumbs or navigation', async ({ page }) => {
      await page.goto('/wiki/Main');
      await page.waitForLoadState('networkidle');

      // Check for navigation elements
      const hasNav = await page.locator('nav, .breadcrumb, .navigation, .sidebar').count() > 0;
      expect(hasNav).toBe(true);
    });

    test('should handle non-existent pages gracefully', async ({ page }) => {
      await page.goto('/wiki/NonExistentPageXYZ123');
      await page.waitForLoadState('networkidle');

      // Should either show 404, redirect, or offer to create
      const is404 = await page.locator('text=/not found|404|does not exist/i').count() > 0;
      const hasCreateOption = await page.locator('a:has-text("Create"), button:has-text("Create")').count() > 0;
      const redirected = !page.url().includes('NonExistentPageXYZ123');

      expect(is404 || hasCreateOption || redirected).toBe(true);
    });
  });

  test.describe('Page History', () => {
    test('should show page version history', async ({ page }) => {
      await page.goto('/wiki/Main');
      await page.waitForLoadState('networkidle');

      // Look for history/versions link
      const historyLink = page.locator('a:has-text("History"), a:has-text("Versions"), a[href*="history"], a[href*="version"]');

      if (await historyLink.count() > 0) {
        await historyLink.first().click();
        await page.waitForLoadState('networkidle');

        // Should show version list
        const hasVersionList = await page.locator('.version, .history-entry, table tr, .revision').count() > 0;
        expect(hasVersionList).toBe(true);
      } else {
        test.skip();
      }
    });
  });
});
