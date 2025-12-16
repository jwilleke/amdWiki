// @ts-check
const { defineConfig } = require('@playwright/test');

/**
 * Playwright E2E Test Configuration for amdWiki
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  // All E2E files consolidated under tests/e2e/
  testDir: './tests/e2e',

  // Run tests in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI for stability
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration - consolidated under tests/e2e/.output/
  reporter: [
    ['html', { outputFolder: 'tests/e2e/.output/report' }],
    ['list']
  ],

  // Shared settings for all projects
  use: {
    // Base URL for the application (default to 3000 for local dev, 3099 for CI)
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',
  },

  // Configure the web server to start before running tests
  // Only starts a new server in CI - locally, use existing server on port 3000
  webServer: process.env.CI ? {
    command: 'PORT=3099 NODE_ENV=test node app.js',
    url: 'http://localhost:3099',
    reuseExistingServer: false,
    timeout: 60000,
    stdout: 'pipe',
    stderr: 'pipe',
  } : undefined,

  // Test projects for different browsers
  projects: [
    // Setup project for authentication
    {
      name: 'setup',
      testMatch: /.*\.setup\.js/,
    },

    // Chromium tests (main browser)
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        // Use setup project for authenticated tests
        storageState: './tests/e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],

  // Output folder for test artifacts - consolidated under tests/e2e/.output/
  outputDir: 'tests/e2e/.output/results',

  // Global timeout for each test
  timeout: 30000,

  // Expect timeout
  expect: {
    timeout: 5000,
  },
});
