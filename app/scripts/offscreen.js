// Offscreen document for preloading tab favicons
// This runs in a hidden document with full DOM access

// Store Image objects to prevent garbage collection while loading
const preloadedImages = new Map()

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'preloadFavicons') {
    preloadFavicons(request.urls)
    sendResponse({ success: true })
  }
})

function preloadFavicons(urls) {
  if (!urls || !Array.isArray(urls)) return

  // Clear old preloaded images that are no longer in the list
  const urlSet = new Set(urls)
  for (const [url] of preloadedImages.entries()) {
    if (!urlSet.has(url)) {
      preloadedImages.delete(url)
    }
  }

  // Preload new URLs
  urls.forEach((url) => {
    if (!url || preloadedImages.has(url)) return

    const img = new Image()
    img.src = url

    // Store the image to prevent garbage collection
    preloadedImages.set(url, img)

    // Optional: Remove from map after successful load to free memory
    img.onload = () => {
      // Image is now cached by browser, we can remove our reference
      // But keep it for a bit in case user switches tabs quickly
      setTimeout(() => {
        preloadedImages.delete(url)
      }, 60000) // Keep for 1 minute
    }

    img.onerror = () => {
      // Failed to load, remove from map
      preloadedImages.delete(url)
    }
  })
}
