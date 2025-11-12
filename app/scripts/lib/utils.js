/**
 * Default favicon - a simple gray circle SVG as data URL
 * Used when a tab's favicon fails to load or is unavailable
 */
export const DEFAULT_FAVICON =
  'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%3E%3Ccircle%20cx%3D%228%22%20cy%3D%228%22%20r%3D%226%22%20fill%3D%22%23ccc%22%2F%3E%3C%2Fsvg%3E'

/**
 * Escape HTML special characters to prevent XSS attacks
 */
export function escapeHtml(text) {
  if (!text) return ''
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Check if a favicon URL is valid and safe to load
 * Filters out URLs that will fail to load or cause CORS errors
 */
export function isValidFaviconUrl(url) {
  if (!url) return false

  return (
    !url.startsWith('chrome://') &&
    !url.startsWith('http://localhost') &&
    !url.startsWith('https://localhost') &&
    !url.startsWith('http://127.0.0.1') &&
    !url.startsWith('https://127.0.0.1') &&
    !url.startsWith('file://')
  )
}

/**
 * Check if a URL is a restricted Chrome internal page
 * Content scripts cannot be injected into these pages
 */
export function isRestrictedChromeUrl(url) {
  if (!url) return true

  return (
    url.startsWith('chrome://') ||
    url.startsWith('chrome-extension://') ||
    url.startsWith('edge://') ||
    url.startsWith('about:') ||
    url.includes('chrome.google.com/webstore')
  )
}
