// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Authentication E2E Tests
 *
 * Tests for login, logout, and session management.
 */

// Test credentials - use env vars or defaults
const TEST_USER = process.env.E2E_ADMIN_USER || 'admin';
const TEST_PASS = process.env.E2E_ADMIN_PASS || 'admin123';

/**
 * Helper to fill login form - targets inputs inside the login form specifically
 */
async function fillLoginForm(page, username, password) {
  // Target the form that contains the password field (login form)
  const loginForm = page.locator('form:has(input[type="password"])');
  const usernameInput = loginForm.locator('input:not([type="hidden"]):not([type="checkbox"]):not([type="password"])').first();
  const passwordInput = loginForm.locator('input[type="password"]');

  await usernameInput.fill(username);
  await passwordInput.fill(password);
}

/**
 * Helper to submit login form
 */
async function submitLogin(page) {
  await page.getByRole('button', { name: /login/i }).click();
  await page.waitForLoadState('networkidle');
}

// Tests that need unauthenticated state
test.describe('Authentication - Unauthenticated', () => {
  // Clear storage state for all tests in this block
  test.use({ storageState: { cookies: [], origins: [] } });

  test.describe('Login Page', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/login');

      // Verify login form elements - use login form specifically (has password input)
      const loginForm = page.locator('form:has(input[type="password"])');
      await expect(loginForm).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');

      await fillLoginForm(page, 'invaliduser', 'wrongpassword');
      await submitLogin(page);

      // Should remain on login page or show error
      const currentUrl = page.url();
      const hasError = currentUrl.includes('login') || currentUrl.includes('error');

      expect(hasError).toBe(true);
    });

    test('should login successfully with valid credentials', async ({ page }) => {
      await page.goto('/login');

      await fillLoginForm(page, TEST_USER, TEST_PASS);
      await submitLogin(page);

      // Should redirect away from login page
      await expect(page).not.toHaveURL(/\/login/);
    });
  });

  test.describe('Session Management', () => {
    test('should maintain session across page navigation', async ({ page }) => {
      // Login first
      await page.goto('/login');
      await fillLoginForm(page, TEST_USER, TEST_PASS);
      await submitLogin(page);

      // Navigate to different pages
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Should still be logged in (logout link visible or no login link)
      const logoutVisible = await page.locator('a[href*="logout"], button:has-text("Logout")').count() > 0;
      expect(logoutVisible).toBe(true);
    });
  });

  test.describe('Logout', () => {
    test('should logout successfully', async ({ page }) => {
      // Login first
      await page.goto('/login');
      await fillLoginForm(page, TEST_USER, TEST_PASS);
      await submitLogin(page);

      // Find and click logout
      const logoutLink = page.locator('a[href*="logout"], button:has-text("Logout")');
      if (await logoutLink.count() > 0) {
        await logoutLink.first().click();
      } else {
        await page.goto('/logout');
      }
      await page.waitForLoadState('networkidle');

      // Verify logged out - should see login option or be on login page
      const onLoginPage = page.url().includes('login');
      const loginLinkVisible = await page.locator('a[href*="login"]').count() > 0;

      expect(onLoginPage || loginLinkVisible).toBe(true);
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect to login for protected pages when not authenticated', async ({ page }) => {
      // Try to access admin page (protected) without auth
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');

      // Should be redirected to login or see access denied
      const redirectedToLogin = page.url().includes('login');
      const accessDenied = await page.getByText(/access denied|unauthorized|forbidden|not authorized/i).count() > 0;

      expect(redirectedToLogin || accessDenied).toBe(true);
    });
  });
});
