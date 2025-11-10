import { isRestrictedChromeUrl } from '../utils.js'

export default class Connection {
  constructor() {
    // Required for onDisconnect in content scripts to execute only when reload occurs.
    // Without a listener, onDisconnect is called immediately.
    chrome.runtime.onConnect.addListener(() => {})

    // In MV3, content scripts are automatically injected via manifest for new pages
    // We need to inject into existing tabs whenever the service worker starts
    // This handles: install, update, reload, and service worker wake from idle
    this.executeContentScripts()
  }

  async executeContentScripts() {
    const manifest = chrome.runtime.getManifest()
    const scripts = manifest.content_scripts[0].js

    try {
      const tabs = await chrome.tabs.query({})

      for (const tab of tabs) {
        // Skip restricted Chrome pages where content scripts cannot be injected
        if (isRestrictedChromeUrl(tab.url)) {
          continue
        }

        try {
          // Check if content script is already injected
          // We do this by trying to send a message to the tab
          let response = null
          try {
            response = await chrome.tabs.sendMessage(tab.id, { ping: true })
          } catch (pingError) {
            // Content script not injected or tab not accessible - this is expected
            response = null
          }

          if (response && response.pong) {
            // Content script already exists, skip injection
            console.log('[TAS] Content script already injected in tab:', tab.id)
            continue
          }

          // Content script not found, inject it
          console.log('[TAS] Injecting content script in tab:', tab.id)
          await chrome.scripting.executeScript({
            target: { tabId: tab.id, allFrames: false },
            files: scripts
          })
        } catch (error) {
          // Content script might not be accessible
          if (!error.message.includes('Cannot access') && !error.message.includes('Receiving end does not exist')) {
            console.log('[TAS] Could not inject content script in tab:', tab.id, error.message)
          }
        }
      }
    } catch (error) {
      console.error('[TAS] Error querying tabs:', error)
    }
  }
}
