import { canInjectContentScript } from '../utils.js'

interface Manifest {
  content_scripts?: Array<{
    js: string[]
  }>
}

export default class Connection {
  constructor() {
    // Required for onDisconnect in content scripts to execute only when reload occurs.
    // Without a listener, onDisconnect is called immediately.
    chrome.runtime.onConnect.addListener(() => {})

    // On install/update/reload, force re-injection (old content scripts are orphaned)
    chrome.runtime.onInstalled.addListener(() => {
      console.log('[TAS] Extension installed/updated/reloaded - re-injecting content scripts')
      void this.executeContentScripts(true) // Force injection, skip ping check
    })

    // On service worker startup (wake from idle), check before injecting
    void this.executeContentScripts(false) // Check with ping first
  }

  async executeContentScripts(forceInject = false): Promise<void> {
    const manifest = chrome.runtime.getManifest() as Manifest
    const scripts = manifest.content_scripts?.[0]?.js

    if (!scripts) {
      console.error('[TAS] No content scripts found in manifest')
      return
    }

    try {
      const tabs = await chrome.tabs.query({})

      for (const tab of tabs) {
        // Skip tabs where content scripts cannot be injected
        if (!canInjectContentScript(tab.url)) {
          continue
        }

        if (!tab.id) continue

        try {
          // If not forcing injection, check if content script is already there
          if (!forceInject) {
            let response: { pong?: boolean } | null = null
            try {
              response = await chrome.tabs.sendMessage(tab.id, { ping: true })
            } catch (_pingError) {
              // Content script not injected or tab not accessible - this is expected
              response = null
            }

            if (response?.pong) {
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
          const errorMessage = error instanceof Error ? error.message : String(error)
          if (!errorMessage.includes('Cannot access') && !errorMessage.includes('Receiving end does not exist')) {
            console.log('[TAS] Could not inject content script in tab:', tab.id, errorMessage)
          }
        }
      }
    } catch (error) {
      console.error('[TAS] Error querying tabs:', error)
    }
  }
}
