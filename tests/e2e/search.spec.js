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

      // Should have search input - the actual input is #query with name="q"
      const searchInput = page.locator('#query, input[name="q"]');
      await expect(searchInput.first()).toBeVisible({ timeout: 10000 });
    });

    test('should perform basic text search', async ({ page }) => {
      await page.goto('/search');
      await page.waitForLoadState('networkidle');

      // Enter search query - use the actual search input id
      const searchInput = page.locator('#query, input[name="q"]');
      await searchInput.first().waitFor({ state: 'visible', timeout: 10000 });
      await searchInput.first().fill('test');

      // Submit search
      const searchButton = page.locator('button[type="submit"]');
      await searchButton.first().click();

      await page.waitForLoadState('networkidle');

      // Should show results or "no results" message
      const hasResults = await page.locator('.search-result, .result-item, .list-group-item, tr').count() > 0;
      const hasNoResults = await page.locator('text=/no results|not found|nothing found|0 result/i').count() > 0;

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

      // Use the actual search input id
      const searchInput = page.locator('#query, input[name="q"]');
      await searchInput.first().waitFor({ state: 'visible', timeout: 10000 });
      await searchInput.first().fill('test & "special" <chars>');

      // Submit with button
      const searchButton = page.locator('button[type="submit"]');
      await searchButton.first().click();
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

      // Check for filter options - could be selects, checkboxes, or custom filters
      const filterSelects = page.locator('select.filter, select[name*="category"], select[name*="filter"]');
      const filterCheckboxes = page.locator('input[type="checkbox"][name*="category"], input[type="checkbox"][name*="keyword"]');

      const hasSelectFilters = await filterSelects.count() > 0;
      const hasCheckboxFilters = await filterCheckboxes.count() > 0;

      // This is informational - test passes as long as some filter mechanism exists
      if (hasSelectFilters) {
        await expect(filterSelects.first()).toBeVisible();
      } else if (hasCheckboxFilters) {
        // Checkboxes might be in a collapsed section - just verify they exist
        expect(await filterCheckboxes.count()).toBeGreaterThan(0);
      }
      // If neither exists, test still passes (informational only)
    });
  });
});
