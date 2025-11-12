import { isRestrictedChromeUrl } from '../utils.js'

export default class Tabs {
  constructor(eventEmitter) {
    this.eventEmitter = eventEmitter
    this.tabs = []

    chrome.commands.onCommand.addListener((command) => {
      if (command === 'activate') {
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
          if (tabs.length) {
            const tab = tabs[0]

            // Check if the tab URL is a restricted Chrome page
            if (isRestrictedChromeUrl(tab.url)) {
              // Cannot inject content scripts into Chrome internal pages
              console.log('[TAS] Cannot activate on restricted page:', tab.url)
              return
            }

            try {
              await chrome.tabs.sendMessage(tab.id, { action: 'activate' })
            } catch (error) {
              // Content script might not be injected yet or page doesn't allow it
              if (error.message && error.message.includes('Receiving end does not exist')) {
                console.log('[TAS] Content script not available on tab:', tab.url)
              } else {
                console.error('[TAS] Failed to send activate message:', error)
              }
            }
          }
        })
      }
    })

    chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
      if (request.tabs) {
        sendResponse({ tabs: this.tabs })
      } else if (request.selectTab) {
        this.selectTab(request.selectTab)
      }
    })

    chrome.windows.onFocusChanged.addListener(() => {
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        if (tabs[0]) {
          this.unshiftTab(this.findTab(tabs[0].id))
        }
      })
    })

    this.eventEmitter.on('omnibox:select-tab', (tab) => {
      this.selectTab(tab)
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
      this.unshiftTab(this.findTab(info.tabId))
    })

    chrome.tabs.onReplaced.addListener((_addedTabId, removedTabId) => {
      this.removeTab(removedTabId)
    })

    this.getTabs()
  }

  getTabs() {
    chrome.windows.getAll({ populate: true }, (windows) => {
      let focused

      windows.forEach((w) => {
        if (w.focused) {
          focused = w
        } else {
          this.tabs = w.tabs.concat(this.tabs)
        }
      })

      if (focused) {
        this.tabs = focused.tabs.concat(this.tabs)
        this.unshiftTab(focused.tabs.find((tab) => tab.active))
      }

      // Emit event for favicon preloading
      this.eventEmitter.emit('tabs:updated', this.tabs)
    })
  }

  selectTab(tab) {
    chrome.windows.update(tab.windowId, { focused: true })
    chrome.tabs.update(tab.id, { active: true })
  }

  findTab(id) {
    return this.tabs.find((tab) => tab && tab.id === id)
  }

  addTab(tab) {
    if (tab.active) {
      this.tabs.unshift(tab)
    } else {
      this.tabs.push(tab)
    }
    this.eventEmitter.emit('tabs:updated', this.tabs)
  }

  replaceTab(oldId, newTab) {
    const oldTab = this.findTab(oldId)
    if (!oldTab) return
    const index = this.tabs.indexOf(oldTab)
    if (index !== -1) {
      this.tabs[index] = newTab
      this.eventEmitter.emit('tabs:updated', this.tabs)
    }
  }

  unshiftTab(tab) {
    const index = this.tabs.indexOf(tab)
    if (index === -1) {
      this.tabs.unshift(tab)
    } else {
      this.tabs.unshift(this.tabs.splice(index, 1)[0])
    }
    this.eventEmitter.emit('tabs:updated', this.tabs)
  }

  removeTab(id) {
    const tab = this.findTab(id)
    if (!tab) return
    const index = this.tabs.indexOf(tab)
    if (index !== -1) {
      this.tabs.splice(index, 1)
      this.eventEmitter.emit('tabs:updated', this.tabs)
    }
  }
}
