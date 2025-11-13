import Keyboard from '../content/keyboard.js'
import Display from '../content/display.js'
import type { Tab } from '../types.js'

// Import CSS - Vite will bundle it as a string we can inject
import mainCss from '../../../styles/main.css?inline'

export default class PopupCoordinator {
  keyboard: Keyboard
  display: Display

  constructor() {
    this.keyboard = new Keyboard(this)
    this.display = new Display(this, mainCss)

    // Wait for keyboard to be ready before activating
    this.keyboard.onReady = () => {
      this.keyboard.activate()
      void this.display.activate()
    }
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
