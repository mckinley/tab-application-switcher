import { test, expect } from './fixtures'

test.describe('Extension Loading', () => {
  test('extension loads successfully with service worker', async ({ context, extensionId }) => {
    // Verify extension ID is available
    expect(extensionId).toBeTruthy()
    expect(extensionId).toMatch(/^[a-z]{32}$/)

    // Verify service worker is running
    const serviceWorkers = context.serviceWorkers()
    expect(serviceWorkers.length).toBeGreaterThan(0)

    const serviceWorker = serviceWorkers[0]
    expect(serviceWorker.url()).toContain(extensionId)
    // Vite bundles the service worker as service-worker-loader.js
    expect(serviceWorker.url()).toContain('service-worker')
  })

  test('popup page loads correctly', async ({ page, extensionId }) => {
    // Navigate to the popup page
    await page.goto(`chrome-extension://${extensionId}/popup.html`)

    // Verify popup title
    await expect(page).toHaveTitle('Tab Application Switcher')

    // Verify popup content is present
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('options page loads correctly', async ({ page, extensionId }) => {
    // Navigate to the options page
    await page.goto(`chrome-extension://${extensionId}/options.html`)

    // Verify options page title (same as popup in this extension)
    await expect(page).toHaveTitle('Tab Application Switcher')

    // Verify options content is present
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })
})

