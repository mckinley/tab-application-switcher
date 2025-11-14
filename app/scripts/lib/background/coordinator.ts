import Tabs from './tabs.js'
import Connection from './connection.js'
import { canInjectContentScript } from '../utils.js'
import type { IBackgroundCoordinator } from '../types.js'

export default class BackgroundCoordinator implements IBackgroundCoordinator {
  tabs: Tabs
  connection: Connection

  constructor() {
    this.tabs = new Tabs(this)
    this.connection = new Connection()

    // Listen for keyboard commands from manifest
    chrome.commands.onCommand.addListener((command) => {
      this.handleCommand(command)
    })
  }

  handleCommand(command: string): void {
    if (command === '_execute_action') {
      // Alt+Z: Always activate the overlay (or popup if restricted)
      void this.activateOverlayOrPopup({ activateOverlay: true })
    } else if (command === 'activate-overlay') {
      // Alt+X: Activate overlay if closed, or move to next tab if open (or popup if restricted)
      void this.activateOverlayOrPopup({ activateOrNext: true })
    }
  }

  async activateOverlayOrPopup(message: { activateOverlay?: boolean; activateOrNext?: boolean }): Promise<void> {
    try {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!activeTab?.id) return

      // First, try to send message to popup (if it's open)
      try {
        await chrome.runtime.sendMessage(message)
        return
      } catch (_popupError) {
        // Popup not open, continue to content script or open popup
      }

      // Check if content scripts can be injected into this tab
      if (!canInjectContentScript(activeTab.url)) {
        // Cannot inject content script, open popup instead
        if (activeTab.windowId !== undefined) {
          try {
            await chrome.action.openPopup({ windowId: activeTab.windowId })
          } catch (error) {
            console.log('[TAS] Failed to open popup:', error)
          }
        }
        return
      }

      // Try to send message to content script
      try {
        await chrome.tabs.sendMessage(activeTab.id, message)
      } catch (_error) {
        // Content script not available, open popup as fallback
        console.log('[TAS] Content script not available, opening popup')
        if (activeTab.windowId !== undefined) {
          try {
            await chrome.action.openPopup({ windowId: activeTab.windowId })
          } catch (error) {
            console.log('[TAS] Failed to open popup:', error)
          }
        }
      }
    } catch (error) {
      console.error('[TAS] Failed to activate overlay or popup:', error)
    }
  }
}
