import Keyboard from './keyboard.js'
import Display from './display.js'
import type { Tab, RuntimeMessage, RuntimeResponse, ICoordinator } from '../types.js'

export default class Coordinator implements ICoordinator {
  keyboard: Keyboard
  display: Display

  constructor(cssString: string) {
    // Create all components with references to coordinator
    this.keyboard = new Keyboard(this)
    this.display = new Display(this, cssString)

    // Set up Chrome runtime messaging
    this.setupMessaging()
  }

  setupMessaging(): void {
    // Single disconnect handler for entire content script
    chrome.runtime.connect().onDisconnect.addListener(() => {
      this.destroy()
    })

    // Single message listener for all incoming messages
    chrome.runtime.onMessage.addListener(
      (
        request: RuntimeMessage,
        _sender: chrome.runtime.MessageSender,
        sendResponse: (response: RuntimeResponse) => void
      ): boolean => {
        return this.handleMessage(request, _sender, sendResponse)
      }
    )
  }

  handleMessage(
    request: RuntimeMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: RuntimeResponse) => void
  ): boolean {
    // Health check (for Connection.js)
    if ('ping' in request && request.ping) {
      sendResponse({ pong: true })
      return false
    }

    // Activation request
    if ('action' in request && request.action === 'activate') {
      if (this.keyboard.active) {
        this.handleNext()
      } else {
        this.handleActivate()
      }
      return false
    }

    // Overlay activation from background script (Alt+Z)
    if ('activateOverlay' in request && request.activateOverlay) {
      this.handleActivate()
      return false
    }

    // Activate or next from background script (Alt+X)
    if ('activateOrNext' in request && request.activateOrNext) {
      if (this.keyboard.active) {
        // Overlay is open, move to next tab
        this.handleNext()
      } else {
        // Overlay is closed, activate it
        this.handleActivate()
      }
      return false
    }

    return false
  }

  // ============================================
  // CHROME API INTERACTIONS (Infrastructure)
  // ============================================

  async getTabs(): Promise<Tab[]> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ tabs: true }, (response: { tabs?: Tab[] }) => {
        if (chrome.runtime.lastError) {
          console.error('Error getting tabs:', chrome.runtime.lastError)
          reject(new Error(chrome.runtime.lastError.message))
          return
        }
        if (!response || !response.tabs) {
          console.error('No tabs in response:', response)
          reject(new Error('No tabs in response'))
          return
        }
        resolve(response.tabs)
      })
    })
  }

  selectTab(tab: Tab): void {
    void chrome.runtime.sendMessage({ selectTab: tab })
  }

  destroy(): void {
    this.keyboard.destroy()
    this.display.destroy()
  }

  // ============================================
  // USER ACTIONS (Domain Logic)
  // Called by components when user interacts
  // ============================================

  handleActivate(): void {
    void this.display.activate()
    this.keyboard.activate()
  }

  handleNext(): void {
    this.display.list.highlightNextTab()
  }

  handlePrevious(): void {
    this.display.list.highlightPreviousTab()
  }

  handleSelect(): void {
    const selectedTab = this.display.list.getSelectedTab()
    if (selectedTab) {
      this.selectTab(selectedTab)
      this.handleDeactivate()
    }
  }

  handleCancel(): void {
    this.handleDeactivate()
  }

  handleDeactivate(): void {
    this.display.deactivate()
    this.keyboard.deactivate()
  }

  handleSearch(): void {
    this.keyboard.unbindModifier()
  }

  handleShowOptions(): void {
    this.keyboard.unbindModifier()
  }
}
