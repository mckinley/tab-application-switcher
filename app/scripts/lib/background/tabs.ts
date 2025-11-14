import { DEFAULT_FAVICON } from '../utils.js'
import type { Tab, IBackgroundCoordinator, RuntimeMessage, RuntimeResponse } from '../types.js'

export default class Tabs {
  coordinator: IBackgroundCoordinator
  tabs: Tab[]
  faviconCache: Map<string, string>

  constructor(coordinator: IBackgroundCoordinator) {
    this.coordinator = coordinator
    this.tabs = []
    this.faviconCache = new Map()

    chrome.runtime.onMessage.addListener(
      (
        request: RuntimeMessage,
        _sender: chrome.runtime.MessageSender,
        sendResponse: (response: RuntimeResponse) => void
      ) => {
        // Handle tab list request
        if ('tabs' in request && request.tabs) {
          const tabsWithDataUrls = this.tabs.map((tab) => ({
            ...tab,
            favIconUrl:
              tab.favIconUrl && this.faviconCache.has(tab.favIconUrl)
                ? this.faviconCache.get(tab.favIconUrl)!
                : DEFAULT_FAVICON
          }))
          sendResponse({ tabs: tabsWithDataUrls })
          return
        }

        // Handle tab selection request
        if ('selectTab' in request) {
          this.selectTab(request.selectTab as Tab)
        }
      }
    )

    // TODO: Test if this is redundant with chrome.tabs.onActivated
    // Both might fire when switching windows, potentially calling unshiftTab twice
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
      if (tab.favIconUrl) {
        void this.fetchAndCacheFavicon(tab.favIconUrl)
      }
    })

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this.replaceTab(tabId, tab)
      if (changeInfo.favIconUrl || tab.favIconUrl) {
        void this.fetchAndCacheFavicon(tab.favIconUrl!)
      }
    })

    chrome.tabs.onRemoved.addListener((id) => {
      const tab = this.findTab(id)
      this.removeTab(id)
      if (tab?.favIconUrl) {
        this.cleanupFaviconCache(tab.favIconUrl)
      }
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

      // Proactively cache all favicons
      this.tabs.forEach((tab) => {
        if (tab.favIconUrl) {
          void this.fetchAndCacheFavicon(tab.favIconUrl)
        }
      })
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

  async fetchAndCacheFavicon(url: string): Promise<void> {
    // Skip if already cached or is a data URL
    if (this.faviconCache.has(url) || url.startsWith('data:')) {
      return
    }

    try {
      const response = await fetch(url)
      if (!response.ok) {
        console.log('[TAS] Failed to fetch favicon:', url, response.status)
        return
      }

      const blob = await response.blob()
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })

      this.faviconCache.set(url, dataUrl)
    } catch (error) {
      console.log('[TAS] Failed to cache favicon:', url, error)
    }
  }

  cleanupFaviconCache(url: string): void {
    // Check if any other tabs still use this favicon URL
    const stillInUse = this.tabs.some((tab) => tab.favIconUrl === url)
    if (!stillInUse) {
      this.faviconCache.delete(url)
    }
  }
}
