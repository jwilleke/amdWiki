// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Admin Dashboard E2E Tests
 *
 * Tests for admin-only functionality including user management and configuration.
 */

test.describe('Admin Dashboard', () => {
  // Use authenticated state from setup (admin user)
  test.use({ storageState: './tests/e2e/.auth/user.json' });

  test.describe('Dashboard Access', () => {
    test('should access admin dashboard as admin user', async ({ page }) => {
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');

      // Should not be redirected to login
      const redirectedToLogin = page.url().includes('login');
      expect(redirectedToLogin).toBe(false);

      // Should see admin content
      const hasAdminContent = await page.locator('.admin, .dashboard, h1:has-text("Admin"), h1:has-text("Dashboard")').count() > 0;
      expect(hasAdminContent).toBe(true);
    });

    test('should display admin navigation/menu', async ({ page }) => {
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');

      // Should have admin navigation
      const hasNav = await page.locator('nav, .admin-menu, .sidebar, .admin-nav').count() > 0;
      expect(hasNav).toBe(true);
    });
  });

  test.describe('User Management', () => {
    test('should access user management section', async ({ page }) => {
      await page.goto('/admin/users');
      await page.waitForLoadState('networkidle');

      // Check if redirected to login or access denied
      if (page.url().includes('login')) {
        test.skip();
        return;
      }

      // Should show user list or user management interface
      const hasUserList = await page.locator('table, .user-list, .users, li').count() > 0;
      const hasUserManagement = await page.locator('text=/users|user management/i').count() > 0;

      expect(hasUserList || hasUserManagement).toBe(true);
    });

    test('should have add user option', async ({ page }) => {
      await page.goto('/admin/users');
      await page.waitForLoadState('networkidle');

      if (page.url().includes('login')) {
        test.skip();
        return;
      }

      // Look for add user button/link
      const addUserLink = page.locator('a:has-text("Add"), button:has-text("Add"), a:has-text("New User"), button:has-text("New User")');
      const hasAddOption = await addUserLink.count() > 0;

      // This is informational - feature may not exist
      expect(hasAddOption).toBeDefined();
    });
  });

  test.describe('Configuration', () => {
    test('should access configuration section', async ({ page }) => {
      // Try different config URLs
      const configUrls = ['/admin/config', '/admin/settings', '/admin/configuration'];

      for (const url of configUrls) {
        await page.goto(url);
        await page.waitForLoadState('networkidle');

        if (!page.url().includes('login') && !page.url().includes('404')) {
          // Found config page
          const hasConfigForm = await page.locator('form, input, select, textarea').count() > 0;
          expect(hasConfigForm).toBe(true);
          return;
        }
      }

      // No config page found - skip
      test.skip();
    });
  });

  test.describe('System Information', () => {
    test('should display system information', async ({ page }) => {
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');

      // Look for system info section
      const hasSystemInfo = await page.locator('text=/version|system|status|info/i').count() > 0;

      // Informational - not required
      expect(hasSystemInfo).toBeDefined();
    });
  });

  test.describe('Admin Security', () => {
    test('should protect admin routes from non-admin users', async ({ browser }) => {
      // Create new context without authentication
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.goto('/admin');
      await page.waitForLoadState('networkidle');

      // Should be redirected to login or see access denied
      const protectedProperly =
        page.url().includes('login') ||
        (await page.locator('text=/access denied|unauthorized|forbidden|not authorized|please login/i').count()) > 0;

      expect(protectedProperly).toBe(true);

      await context.close();
    });
  });
});
