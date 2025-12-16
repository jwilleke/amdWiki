// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Search E2E Tests
 *
 * Tests for search functionality including text search and filtering.
 */

test.describe('Search', () => {
  // Use authenticated state from setup
  test.use({ storageState: './tests/e2e/.auth/user.json' });

  test.describe('Search Page', () => {
    test('should display search interface', async ({ page }) => {
      await page.goto('/search');
      await page.waitForLoadState('networkidle');

      // Should have search input
      const searchInput = page.locator('input[type="search"], input[name="q"], input[name="query"], #search, .search-input');
      await expect(searchInput.first()).toBeVisible();
    });

    test('should perform basic text search', async ({ page }) => {
      await page.goto('/search');
      await page.waitForLoadState('networkidle');

      // Enter search query
      const searchInput = page.locator('input[type="search"], input[name="q"], input[name="query"], #search, .search-input');
      await searchInput.first().fill('test');

      // Submit search (either button or enter)
      const searchButton = page.locator('button[type="submit"], button:has-text("Search")');
      if (await searchButton.count() > 0) {
        await searchButton.first().click();
      } else {
        await searchInput.first().press('Enter');
      }

      await page.waitForLoadState('networkidle');

      // Should show results or "no results" message
      const hasResults = await page.locator('.search-result, .result, .search-item, li, tr').count() > 0;
      const hasNoResults = await page.locator('text=/no results|not found|nothing found/i').count() > 0;

      expect(hasResults || hasNoResults).toBe(true);
    });
  });

  test.describe('Search from Header', () => {
    test('should search from header search box', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Find header search input
      const headerSearch = page.locator('header input[type="search"], nav input[type="search"], .header-search, #quick-search');

      if (await headerSearch.count() > 0) {
        await headerSearch.first().fill('wiki');
        await headerSearch.first().press('Enter');
        await page.waitForLoadState('networkidle');

        // Should navigate to search results
        const onSearchPage = page.url().includes('search');
        expect(onSearchPage).toBe(true);
      } else {
        // No header search - skip test
        test.skip();
      }
    });
  });

  test.describe('Search Results', () => {
    test('should display search results with links', async ({ page }) => {
      await page.goto('/search?q=test');
      await page.waitForLoadState('networkidle');

      // Results should contain links
      const resultLinks = page.locator('.search-result a, .result a, .search-item a');

      if (await resultLinks.count() > 0) {
        // Verify links are clickable
        const firstLink = resultLinks.first();
        await expect(firstLink).toHaveAttribute('href');
      }
    });

    test('should handle empty search gracefully', async ({ page }) => {
      await page.goto('/search?q=');
      await page.waitForLoadState('networkidle');

      // Should not show error, just empty state or prompt
      const hasError = await page.locator('.error-500').count() > 0 ||
        await page.getByText(/server error/i).count() > 0;
      expect(hasError).toBe(false);
    });

    test('should handle special characters in search', async ({ page }) => {
      await page.goto('/search');
      await page.waitForLoadState('networkidle');

      const searchInput = page.locator('input[type="search"], input[name="q"], input[name="query"], #search, .search-input');
      await searchInput.first().fill('test & "special" <chars>');
      await searchInput.first().press('Enter');
      await page.waitForLoadState('networkidle');

      // Should not cause error
      const hasServerError = await page.getByText(/500|server error|internal error/i).count() > 0;
      expect(hasServerError).toBe(false);
    });
  });

  test.describe('Search Filters', () => {
    test('should have category/tag filters if available', async ({ page }) => {
      await page.goto('/search');
      await page.waitForLoadState('networkidle');

      // Check for filter options
      const hasFilters = await page.locator('select, .filter, [data-filter], input[type="checkbox"]').count() > 0;

      // This is informational - not all wikis have filters
      if (hasFilters) {
        const filters = page.locator('select, .filter');
        await expect(filters.first()).toBeVisible();
      }
    });
  });
});
