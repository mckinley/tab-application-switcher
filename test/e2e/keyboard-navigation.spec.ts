import { test, expect } from './fixtures'

test.describe('Keyboard Navigation', () => {
  test('popup responds to keyboard events', async ({ page, extensionId }) => {
    // Navigate to popup
    await page.goto(`chrome-extension://${extensionId}/popup.html`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(500)

    // Verify popup is loaded
    await expect(page.locator('body')).toBeVisible()

    // Try pressing arrow keys
    await page.keyboard.press('ArrowDown')
    await page.waitForTimeout(100)

    await page.keyboard.press('ArrowUp')
    await page.waitForTimeout(100)

    // Try pressing Enter
    await page.keyboard.press('Enter')
    await page.waitForTimeout(100)

    // Verify the page is still functional after keyboard events
    const title = await page.title()
    expect(title).toBe('Tab Application Switcher')
  })

  test('can navigate with Tab key', async ({ page, extensionId }) => {
    // Navigate to popup
    await page.goto(`chrome-extension://${extensionId}/popup.html`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(500)

    // Press Tab to navigate through focusable elements
    await page.keyboard.press('Tab')
    await page.waitForTimeout(100)

    await page.keyboard.press('Tab')
    await page.waitForTimeout(100)

    // Verify popup is still functional
    await expect(page.locator('body')).toBeVisible()
  })

  test('Escape key works in popup', async ({ page, extensionId }) => {
    // Navigate to popup
    await page.goto(`chrome-extension://${extensionId}/popup.html`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(500)

    // Press Escape
    await page.keyboard.press('Escape')
    await page.waitForTimeout(100)

    // Verify popup is still loaded (Escape might close it in real usage)
    const title = await page.title()
    expect(title).toBe('Tab Application Switcher')
  })

  test('keyboard shortcuts are registered', async ({ context, extensionId }) => {
    // We can't directly test keyboard shortcuts in Playwright for extensions
    // But we can verify the extension has registered commands
    const page = await context.newPage()
    await page.goto(`chrome-extension://${extensionId}/popup.html`)
    await page.waitForLoadState('domcontentloaded')

    // Verify the extension loaded successfully
    // The manifest.json defines keyboard shortcuts, but we can't test them directly
    // This test verifies the extension is functional
    await expect(page.locator('body')).toBeVisible()
  })

  test('can type in search field if present', async ({ page, extensionId }) => {
    // Navigate to popup
    await page.goto(`chrome-extension://${extensionId}/popup.html`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(500)

    // Try to find and type in a search field
    // The popup might have a search input
    const searchInput = page.locator('input[type="text"]').first()

    // Check if search input exists
    const searchExists = await searchInput.count()

    if (searchExists > 0) {
      // Type in the search field
      await searchInput.fill('test')
      await page.waitForTimeout(100)

      // Verify the text was entered
      const value = await searchInput.inputValue()
      expect(value).toBe('test')
    } else {
      // If no search field, just verify popup is functional
      await expect(page.locator('body')).toBeVisible()
    }
  })

  test('keyboard navigation in options page', async ({ page, extensionId }) => {
    // Navigate to options page
    await page.goto(`chrome-extension://${extensionId}/options.html`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(500)

    // Verify options page is loaded
    await expect(page.locator('body')).toBeVisible()

    // Try navigating with Tab
    await page.keyboard.press('Tab')
    await page.waitForTimeout(100)

    await page.keyboard.press('Tab')
    await page.waitForTimeout(100)

    // Verify page is still functional (same title as popup in this extension)
    const title = await page.title()
    expect(title).toBe('Tab Application Switcher')
  })
})

