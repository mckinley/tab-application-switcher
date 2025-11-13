import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration for Chrome extension e2e testing.
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './test/e2e',

  // Chrome extensions don't work well with parallel execution
  fullyParallel: false,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Single worker for extension testing (extensions need sequential execution)
  workers: 1,

  // Reporter to use - list for terminal output, html only on CI
  reporter: process.env.CI ? 'html' : 'list',

  use: {
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})

