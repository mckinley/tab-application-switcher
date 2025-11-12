import { isRestrictedChromeUrl } from '../utils.js'
import type { Tab, IBackgroundCoordinator } from '../types.js'

export default class Tabs {
  coordinator: IBackgroundCoordinator
  tabs: Tab[]

  constructor(coordinator: IBackgroundCoordinator) {
    this.coordinator = coordinator
    this.tabs = []

    chrome.commands.onCommand.addListener((command) => {
      if (command === 'activate') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const tab = tabs[0]
          if (!tab) return

          // Check if the tab URL is a restricted Chrome page
          if (isRestrictedChromeUrl(tab.url)) {
            // Cannot inject content scripts into Chrome internal pages
            console.log('[TAS] Cannot activate on restricted page:', tab.url)
            return
          }

          if (!tab.id) return

          void chrome.tabs.sendMessage(tab.id, { action: 'activate' }).catch((error) => {
            // Content script might not be injected yet or page doesn't allow it
            const errorMessage = error instanceof Error ? error.message : String(error)
            if (errorMessage.includes('Receiving end does not exist')) {
              console.log('[TAS] Content script not available on tab:', tab.url)
            } else {
              console.error('[TAS] Failed to send activate message:', error)
            }
          })
        })
      }
    })

    chrome.runtime.onMessage.addListener((request: unknown, _sender, sendResponse) => {
      if (typeof request === 'object' && request !== null && 'tabs' in request && request.tabs) {
        sendResponse({ tabs: this.tabs })
      } else if (typeof request === 'object' && request !== null && 'selectTab' in request) {
        this.selectTab(request.selectTab as Tab)
      }
    })

    chrome.windows.onFocusChanged.addListener(() => {
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        if (tabs[0]) {
          const tab = this.findTab(tabs[0].id!)
          if (tab) {
            this.unshiftTab(tab)
          }
        }
      })
    })

    chrome.tabs.onCreated.addListener((tab) => {
      this.addTab(tab)
    })

    chrome.tabs.onUpdated.addListener((tabId, _changeInfo, tab) => {
      this.replaceTab(tabId, tab)
    })

    chrome.tabs.onRemoved.addListener((id) => {
      this.removeTab(id)
    })

    chrome.tabs.onActivated.addListener((info) => {
      const tab = this.findTab(info.tabId)
      if (tab) {
        this.unshiftTab(tab)
      }
    })

    chrome.tabs.onReplaced.addListener((_addedTabId, removedTabId) => {
      this.removeTab(removedTabId)
    })

    this.getTabs()
  }

  getTabs(): void {
    chrome.windows.getAll({ populate: true }, (windows) => {
      let focused: chrome.windows.Window | undefined

      windows.forEach((w) => {
        if (w.focused) {
          focused = w
        } else if (w.tabs) {
          this.tabs = [...w.tabs, ...this.tabs]
        }
      })

      if (focused?.tabs) {
        this.tabs = [...focused.tabs, ...this.tabs]
        const activeTab = focused.tabs.find((tab) => tab.active)
        if (activeTab) {
          this.unshiftTab(activeTab)
        }
      }
    })
  }

  selectTab(tab: Tab): void {
    if (tab.windowId !== undefined) {
      void chrome.windows.update(tab.windowId, { focused: true })
    }
    if (tab.id !== undefined) {
      void chrome.tabs.update(tab.id, { active: true })
    }
  }

  findTab(id: number): Tab | undefined {
    return this.tabs.find((tab) => tab && tab.id === id)
  }

  addTab(tab: Tab): void {
    if (tab.active) {
      this.tabs.unshift(tab)
    } else {
      this.tabs.push(tab)
    }
  }

  replaceTab(oldId: number, newTab: Tab): void {
    const oldTab = this.findTab(oldId)
    if (!oldTab) return
    const index = this.tabs.indexOf(oldTab)
    if (index !== -1) {
      this.tabs[index] = newTab
    }
  }

  unshiftTab(tab: Tab): void {
    const index = this.tabs.indexOf(tab)
    if (index === -1) {
      this.tabs.unshift(tab)
    } else {
      const [removed] = this.tabs.splice(index, 1)
      if (removed) {
        this.tabs.unshift(removed)
      }
    }
  }

  removeTab(id: number): void {
    const tab = this.findTab(id)
    if (!tab) return
    const index = this.tabs.indexOf(tab)
    if (index !== -1) {
      this.tabs.splice(index, 1)
    }
  }
}
