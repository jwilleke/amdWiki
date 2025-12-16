// @ts-check
const { expect } = require('@playwright/test');

/**
 * Common test helpers for E2E tests
 */

/**
 * Wait for page to be fully loaded
 * @param {import('@playwright/test').Page} page
 */
async function waitForPageReady(page) {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Create a new wiki page
 * @param {import('@playwright/test').Page} page
 * @param {string} title - Page title
 * @param {string} content - Page content in markdown
 */
async function createPage(page, title, content) {
  await page.goto('/edit?new=true');
  await page.fill('input[name="title"], #title', title);
  await page.fill('textarea[name="content"], #content, .editor-content', content);
  await page.click('button[type="submit"], button:has-text("Save")');
  await waitForPageReady(page);
}

/**
 * Navigate to a wiki page by name
 * @param {import('@playwright/test').Page} page
 * @param {string} pageName
 */
async function navigateToPage(page, pageName) {
  await page.goto(`/wiki/${encodeURIComponent(pageName)}`);
  await waitForPageReady(page);
}

/**
 * Perform a search
 * @param {import('@playwright/test').Page} page
 * @param {string} query
 */
async function performSearch(page, query) {
  // Find search input - could be in header or dedicated search page
  const searchInput = page.locator('input[type="search"], input[name="q"], #search-input, .search-input');

  if (await searchInput.count() === 0) {
    // Navigate to search page if no search input visible
    await page.goto('/search');
  }

  await searchInput.first().fill(query);
  await searchInput.first().press('Enter');
  await waitForPageReady(page);
}

/**
 * Get flash/notification messages from page
 * @param {import('@playwright/test').Page} page
 */
async function getNotifications(page) {
  const notifications = page.locator('.flash, .notification, .alert, .message');
  const texts = [];
  const count = await notifications.count();
  for (let i = 0; i < count; i++) {
    texts.push(await notifications.nth(i).textContent());
  }
  return texts;
}

/**
 * Check if element with text exists
 * @param {import('@playwright/test').Page} page
 * @param {string} text
 */
async function hasText(page, text) {
  const element = page.locator(`text=${text}`);
  return (await element.count()) > 0;
}

module.exports = {
  waitForPageReady,
  createPage,
  navigateToPage,
  performSearch,
  getNotifications,
  hasText,
};
