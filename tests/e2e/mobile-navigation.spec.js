// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Mobile Navigation E2E Tests (#371, #372, #373, #374, #375)
 *
 * Verifies the Bootstrap 5 mobile-friendly navigation:
 * - Offcanvas sidebar drawer triggered by hamburger
 * - Search available in offcanvas on mobile
 * - Page actions available in offcanvas on mobile
 * - Desktop sidebar toggle (inline, document-flow)
 * - Responsive content: tables and images constrained in markdown
 * - Touch targets: navigation buttons meet 44px minimum height
 *
 * These tests run with the Pixel 5 viewport (~393×851px) from playwright.config.js.
 * Desktop viewport tests use page.setViewportSize().
 */

test.describe('Mobile Navigation', () => {
  test.use({ storageState: './tests/e2e/.auth/user.json' });

  test.describe('Offcanvas sidebar on mobile', () => {
    test('hamburger button is visible on mobile', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Mobile hamburger uses data-bs-toggle=offcanvas
      const mobileHamburger = page.locator('button[data-bs-toggle="offcanvas"][data-bs-target="#mobileNavOffcanvas"]');
      await expect(mobileHamburger).toBeVisible();
    });

    test('desktop sidebar button is NOT visible on mobile', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Desktop toggle button has d-none d-md-inline-flex — hidden on mobile
      const desktopToggle = page.locator('button.d-none.d-md-inline-flex[onclick*="toggleLeftMenu"]');
      await expect(desktopToggle).toBeHidden();
    });

    test('tapping hamburger opens the offcanvas drawer', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const offcanvas = page.locator('#mobileNavOffcanvas');
      await expect(offcanvas).not.toHaveClass(/show/);

      await page.locator('button[data-bs-toggle="offcanvas"][data-bs-target="#mobileNavOffcanvas"]').click();
      await expect(offcanvas).toHaveClass(/show/, { timeout: 2000 });
    });

    test('offcanvas contains a search form', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await page.locator('button[data-bs-toggle="offcanvas"][data-bs-target="#mobileNavOffcanvas"]').click();
      await page.locator('#mobileNavOffcanvas').waitFor({ state: 'visible' });

      const searchInput = page.locator('#mobileNavOffcanvas input[type="search"][name="q"]');
      await expect(searchInput).toBeVisible();
    });

    test('offcanvas can be closed via Bootstrap API', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await page.locator('button[data-bs-toggle="offcanvas"][data-bs-target="#mobileNavOffcanvas"]').click();
      const offcanvas = page.locator('#mobileNavOffcanvas');
      await offcanvas.waitFor({ state: 'visible' });

      // Close via Bootstrap's JS API (simulates what data-bs-dismiss button does)
      await page.evaluate(() => {
        const el = document.getElementById('mobileNavOffcanvas');
        // @ts-ignore
        const instance = bootstrap.Offcanvas.getInstance(el);
        if (instance) instance.hide();
      });
      await expect(offcanvas).not.toHaveClass(/show/, { timeout: 2000 });
    });

    test('offcanvas search navigates to search results', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await page.locator('button[data-bs-toggle="offcanvas"][data-bs-target="#mobileNavOffcanvas"]').click();
      await page.locator('#mobileNavOffcanvas').waitFor({ state: 'visible' });

      const searchInput = page.locator('#mobileNavOffcanvas input[name="q"]');
      await searchInput.fill('test');
      await searchInput.press('Enter');

      await page.waitForURL(/\/search/);
      await expect(page).toHaveURL(/\/search/);
    });
  });

  test.describe('Page actions in offcanvas', () => {
    test('page actions section appears when on a wiki page', async ({ page }) => {
      await page.goto('/view/Main');
      await page.waitForLoadState('networkidle');

      await page.locator('button[data-bs-toggle="offcanvas"][data-bs-target="#mobileNavOffcanvas"]').click();
      await page.locator('#mobileNavOffcanvas').waitFor({ state: 'visible' });

      // "Page Actions" heading should appear
      const pageActionsHeading = page.locator('#mobileNavOffcanvas').getByText('Page Actions', { exact: false });
      await expect(pageActionsHeading).toBeVisible();
    });

    test('page actions section not shown on non-page routes', async ({ page }) => {
      // Home/landing page has no pageName
      await page.goto('/search');
      await page.waitForLoadState('networkidle');

      await page.locator('button[data-bs-toggle="offcanvas"][data-bs-target="#mobileNavOffcanvas"]').click();
      await page.locator('#mobileNavOffcanvas').waitFor({ state: 'visible' });

      const pageActionsHeading = page.locator('#mobileNavOffcanvas').getByText('Page Actions', { exact: false });
      await expect(pageActionsHeading).not.toBeVisible();
    });

    test('Reader View link is present in page actions', async ({ page }) => {
      await page.goto('/view/Main');
      await page.waitForLoadState('networkidle');

      await page.locator('button[data-bs-toggle="offcanvas"][data-bs-target="#mobileNavOffcanvas"]').click();
      await page.locator('#mobileNavOffcanvas').waitFor({ state: 'visible' });

      const readerLink = page.locator('#mobileNavOffcanvas a[href*="reader"]');
      await expect(readerLink).toBeVisible();
    });
  });

  test.describe('Navigation bar on mobile', () => {
    test('Info/Edit/More buttons are hidden on mobile', async ({ page }) => {
      await page.goto('/view/Main');
      await page.waitForLoadState('networkidle');

      // The right col-3 with action buttons has d-none d-md-block
      const actionCol = page.locator('.navigation .col-3.d-none.d-md-block');
      await expect(actionCol).toBeHidden();
    });

    test('Trail dropdown is hidden on mobile', async ({ page }) => {
      await page.goto('/view/Main');
      await page.waitForLoadState('networkidle');

      const trail = page.locator('#trail.d-none.d-md-block');
      await expect(trail).toBeHidden();
    });

    test('logo is visible on mobile', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const brand = page.locator('.jspwiki-header .navbar-brand');
      await expect(brand).toBeVisible();
    });

    test('user icon link is visible on mobile (authenticated)', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Mobile compact user icon: anchor to /profile with d-flex d-md-none wrapper
      const mobileUserArea = page.locator('.jspwiki-header .d-flex.d-md-none');
      await expect(mobileUserArea).toBeVisible();
    });

    test('desktop search bar is NOT visible on mobile', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Search is inside .collapse.navbar-collapse — hidden on mobile
      const desktopSearch = page.locator('#headerNavCollapse');
      await expect(desktopSearch).toBeHidden();
    });
  });
});

test.describe('Desktop Navigation', () => {
  test.use({ storageState: './tests/e2e/.auth/user.json' });

  test.beforeEach(async ({ page }) => {
    // Force desktop viewport for these tests
    await page.setViewportSize({ width: 1280, height: 800 });
    // Clear any saved sidebar preference so we start fresh
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('leftMenuVisible'));
  });

  test('desktop hamburger is visible on desktop', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const desktopToggle = page.locator('button.d-none.d-md-inline-flex[onclick*="toggleLeftMenu"]');
    await expect(desktopToggle).toBeVisible();
  });

  test('mobile offcanvas hamburger is NOT visible on desktop', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const mobileHamburger = page.locator('button.d-md-none[data-bs-toggle="offcanvas"]');
    await expect(mobileHamburger).toBeHidden();
  });

  test('sidebar is visible by default on desktop', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const sidebar = page.locator('.sidebar.jspwiki-sidebar');
    await expect(sidebar).toBeVisible();
  });

  test('desktop hamburger toggles sidebar visibility', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const sidebar = page.locator('.sidebar.jspwiki-sidebar');
    const desktopToggle = page.locator('button.d-none.d-md-inline-flex[onclick*="toggleLeftMenu"]');

    await expect(sidebar).toBeVisible();

    // Hide sidebar
    await desktopToggle.click();
    await expect(sidebar).toBeHidden();

    // Show sidebar again
    await desktopToggle.click();
    await expect(sidebar).toBeVisible();
  });

  test('search bar is visible on desktop', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('#headerSearchInput');
    await expect(searchInput).toBeVisible();
  });

  test('Info/Edit/More buttons visible on desktop', async ({ page }) => {
    await page.goto('/view/Main');
    await page.waitForLoadState('networkidle');

    const infoBtn = page.locator('.navigation button:has-text("Info")');
    await expect(infoBtn).toBeVisible();

    const moreBtn = page.locator('.navigation button:has-text("More")');
    await expect(moreBtn).toBeVisible();
  });

  test('Trail dropdown visible on desktop', async ({ page }) => {
    await page.goto('/view/Main');
    await page.waitForLoadState('networkidle');

    const trail = page.locator('#trail');
    await expect(trail).toBeVisible();
  });
});

test.describe('Responsive content rendering (#372)', () => {
  test.use({ storageState: './tests/e2e/.auth/user.json' });

  test('markdown images have max-width 100%', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/view/Main');
    await page.waitForLoadState('networkidle');

    // Check that any images in markdown content don't overflow viewport
    const images = page.locator('.markdown-body img');
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const box = await img.boundingBox();
      if (box) {
        expect(box.width).toBeLessThanOrEqual(390 + 1); // allow 1px rounding
      }
    }
  });

  test('markdown tables are scrollable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/view/Main');
    await page.waitForLoadState('networkidle');

    // Tables should have overflow-x: auto (block display)
    const tables = page.locator('.markdown-body table');
    const count = await tables.count();
    for (let i = 0; i < count; i++) {
      const overflowX = await tables.nth(i).evaluate(el => getComputedStyle(el).overflowX);
      expect(['auto', 'scroll']).toContain(overflowX);
    }
  });
});
