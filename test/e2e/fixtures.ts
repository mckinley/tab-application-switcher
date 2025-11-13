import { test as base, chromium, type BrowserContext } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Extended test fixtures for Chrome extension testing.
 *
 * Provides:
 * - context: A persistent browser context with the extension loaded
 * - extensionId: The ID of the loaded extension
 */
export const test = base.extend<{
  context: BrowserContext
  extensionId: string
}>({
  context: async ({}, use) => {
    // Path to the built extension
    const pathToExtension = path.join(__dirname, '../../dist')

    // Launch persistent context with extension loaded
    // Note: Using empty string for userDataDir creates a temporary profile
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium', // Required for extension support
      headless: true, // Chromium channel supports headless mode with extensions
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    })

    await use(context)
    await context.close()
  },

  extensionId: async ({ context }, use) => {
    // For Manifest v3 extensions, get the service worker
    let [serviceWorker] = context.serviceWorkers()
    if (!serviceWorker) {
      serviceWorker = await context.waitForEvent('serviceworker')
    }

    // Extract extension ID from service worker URL
    // Service worker URL format: chrome-extension://<extension-id>/service-worker.js
    const extensionId = serviceWorker.url().split('/')[2]

    await use(extensionId)
  },
})

export const expect = test.expect

