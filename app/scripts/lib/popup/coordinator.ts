import Keyboard from '../content/keyboard.js'
import Display from '../content/display.js'
import type { Tab, RuntimeMessage, RuntimeResponse } from '../types.js'

// Import CSS - Vite will bundle it as a string we can inject
import mainCss from '../../../styles/main.css?inline'

export default class PopupCoordinator {
  keyboard: Keyboard
  display: Display

  constructor() {
    this.keyboard = new Keyboard(this)
    this.display = new Display(this, mainCss)

    // Set up message listener for commands from background script
    this.setupMessaging()

    // Wait for keyboard to be ready before activating
    this.keyboard.onReady = () => {
      this.keyboard.activate()
      void this.display.activate()
    }
  }

  setupMessaging(): void {
    chrome.runtime.onMessage.addListener(
      (
        request: RuntimeMessage,
        _sender: chrome.runtime.MessageSender,
        _sendResponse: (response: RuntimeResponse) => void
      ) => {
        return this.handleMessage(request, _sender, _sendResponse)
      }
    )
  }

  handleMessage(
    request: RuntimeMessage,
    _sender: chrome.runtime.MessageSender,
    _sendResponse: (response: RuntimeResponse) => void
  ): boolean {
    // Activate or next from background script (Alt+X)
    if ('activateOrNext' in request && request.activateOrNext) {
      if (this.keyboard.active) {
        // Popup is open, move to next tab
        this.handleNext()
      } else {
        // Popup is opening, activate it
        this.handleActivate()
      }
      return false
    }

    // Overlay activation from background script (Alt+Z)
    if ('activateOverlay' in request && request.activateOverlay) {
      this.handleActivate()
      return false
    }

    return false
  }

  // ============================================
  // CHROME MESSAGING
  // ============================================

  async getTabs(): Promise<Tab[]> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ tabs: true }, (response: { tabs: Tab[] }) => {
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
  // USER ACTION HANDLERS
  // Called by components when user performs actions
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
    this.display.list.selectHighlightedTab()
    this.handleDeactivate()
  }

  handleCancel(): void {
    this.handleDeactivate()
  }

  handleDeactivate(): void {
    window.close()
  }

  handleSearch(): void {
    // Search is already active in popup
  }

  handleShowOptions(): void {
    this.keyboard.deactivate()
  }
}
