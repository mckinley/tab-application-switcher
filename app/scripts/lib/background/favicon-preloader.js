import { isValidFaviconUrl } from '../utils.js'

export default class FaviconPreloader {
  constructor(eventEmitter) {
    this.eventEmitter = eventEmitter
    this.offscreenDocumentCreated = false
    this.pendingUrls = []
    this.lastPreloadedUrls = []

    // Create offscreen document when background script starts
    this.createOffscreenDocument()

    // Listen for tab changes to update preloads immediately
    this.eventEmitter.on('tabs:updated', (tabs) => {
      this.updatePreloads(tabs)
    })
  }

  async createOffscreenDocument() {
    try {
      // Check if offscreen document already exists
      const existingContexts = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT']
      })

      if (existingContexts.length > 0) {
        this.offscreenDocumentCreated = true
        console.log('[TAS] Offscreen document already exists')

        // If we have pending URLs, preload them now
        if (this.pendingUrls.length > 0) {
          this.preloadFavicons(this.pendingUrls)
          this.pendingUrls = []
        }
        return
      }

      // Create offscreen document
      await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['BLOBS'], // Required reason - using BLOBS as closest match
        justification: 'Preload tab favicons for instant display when switching tabs'
      })
      this.offscreenDocumentCreated = true
      console.log('[TAS] Offscreen document created for favicon preloading')

      // If we have pending URLs, preload them now
      if (this.pendingUrls.length > 0) {
        this.preloadFavicons(this.pendingUrls)
        this.pendingUrls = []
      }
    } catch (error) {
      // Check if error is about document already existing
      if (error.message && error.message.includes('Only a single offscreen document')) {
        // Document exists, mark as created and continue
        this.offscreenDocumentCreated = true
        console.log('[TAS] Offscreen document already exists (caught in error handler)')

        // If we have pending URLs, preload them now
        if (this.pendingUrls.length > 0) {
          this.preloadFavicons(this.pendingUrls)
          this.pendingUrls = []
        }
      } else {
        console.error('[TAS] Failed to create offscreen document:', error)
        this.offscreenDocumentCreated = false
      }
    }
  }

  updatePreloads(tabs) {
    if (!tabs || tabs.length === 0) return

    // Get top 20 tabs (most likely to be switched to)
    const topTabs = tabs.slice(0, 20)

    // Extract favicon URLs, filtering out problematic ones
    const faviconUrls = topTabs.map((tab) => tab.favIconUrl).filter((url) => isValidFaviconUrl(url))

    // Only preload if the URLs have actually changed
    if (this.urlsChanged(faviconUrls)) {
      this.lastPreloadedUrls = faviconUrls
      this.preloadFavicons(faviconUrls)
    }
  }

  urlsChanged(newUrls) {
    if (newUrls.length !== this.lastPreloadedUrls.length) return true
    return !newUrls.every((url, i) => url === this.lastPreloadedUrls[i])
  }

  async preloadFavicons(urls) {
    if (!urls || urls.length === 0) return

    if (!this.offscreenDocumentCreated) {
      // Store URLs to preload once offscreen document is ready
      this.pendingUrls = urls
      await this.createOffscreenDocument()
      return
    }

    try {
      await chrome.runtime.sendMessage({
        action: 'preloadFavicons',
        urls: urls
      })
    } catch (error) {
      // Check if it's the "receiving end does not exist" error
      if (error.message && error.message.includes('Receiving end does not exist')) {
        // Offscreen document was closed, recreate it
        this.offscreenDocumentCreated = false
        this.pendingUrls = urls
        await this.createOffscreenDocument()
      } else {
        // Some other error, log it
        console.error('[TAS] Failed to send preload message:', error)
      }
    }
  }
}
