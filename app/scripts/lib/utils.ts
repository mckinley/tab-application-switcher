/**
 * Default favicon - a simple gray circle SVG as data URL
 * Used when a tab's favicon fails to load or is unavailable
 */
export const DEFAULT_FAVICON =
  'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%3E%3Ccircle%20cx%3D%228%22%20cy%3D%228%22%20r%3D%226%22%20fill%3D%22%23ccc%22%2F%3E%3C%2Fsvg%3E'

/**
 * Escape HTML special characters to prevent XSS attacks
 */
export function escapeHtml(text: string | null | undefined): string {
  if (!text) return ''
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Check if content scripts can be injected into a URL
 * Returns true if the URL matches our content script patterns
 */
export function canInjectContentScript(url: string | undefined): boolean {
  if (!url) return false
  return url.startsWith('http://') || url.startsWith('https://')
}
