// @ts-check
const { test: setup, expect } = require('@playwright/test');

const STORAGE_STATE = './tests/e2e/.auth/user.json';

/**
 * Authentication Setup
 *
 * This setup runs before the main tests to authenticate and save session state.
 * The saved state is reused by authenticated tests to avoid logging in repeatedly.
 */
setup('authenticate', async ({ page }) => {
  // Test credentials from env or defaults
  const adminUser = process.env.E2E_ADMIN_USER || 'admin';
  const adminPass = process.env.E2E_ADMIN_PASS || 'admin123';

  // Navigate to login page
  await page.goto('/login');
  await page.waitForSelector('form');

  // Fill in credentials - target inputs inside the login form specifically
  const loginForm = page.locator('form:has(input[type="password"])');
  const usernameInput = loginForm.locator('input:not([type="hidden"]):not([type="checkbox"]):not([type="password"])').first();
  const passwordInput = loginForm.locator('input[type="password"]');

  await usernameInput.fill(adminUser);
  await passwordInput.fill(adminPass);

  // Submit login form
  await page.getByRole('button', { name: /login/i }).click();

  // Wait for successful login - should redirect away from login page
  await expect(page).not.toHaveURL(/\/login/);
  await page.waitForLoadState('networkidle');

  // Save authentication state
  await page.context().storageState({ path: STORAGE_STATE });
});
