import { isRestrictedChromeUrl } from '../utils.js'

export default class Connection {
  constructor() {
    // Required for onDisconnect in content scripts to execute only when reload occurs.
    // Without a listener, onDisconnect is called immediately.
    chrome.runtime.onConnect.addListener(() => {})

    // On install/update/reload, force re-injection (old content scripts are orphaned)
    chrome.runtime.onInstalled.addListener(() => {
      console.log('[TAS] Extension installed/updated/reloaded - re-injecting content scripts')
      this.executeContentScripts(true) // Force injection, skip ping check
    })

    // On service worker startup (wake from idle), check before injecting
    this.executeContentScripts(false) // Check with ping first
  }

  async executeContentScripts(forceInject = false) {
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
          // If not forcing injection, check if content script is already there
          if (!forceInject) {
            let response = null
            try {
              response = await chrome.tabs.sendMessage(tab.id, { ping: true })
            } catch (_pingError) {
              // Content script not injected or tab not accessible - this is expected
              response = null
            }

            if (response && response.pong) {
              // Content script already exists, skip injection
              console.log('[TAS] Content script already injected in tab:', tab.id)
              continue
            }
          }

          // Content script not found or forcing injection, inject it
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
