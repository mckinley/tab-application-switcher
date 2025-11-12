import { isValidFaviconUrl, DEFAULT_FAVICON, escapeHtml } from '../utils.js'

function template(subs) {
  return subs.tabs
    .map((tab) => {
      const faviconUrl = escapeHtml(tab.faviconUrl ?? DEFAULT_FAVICON)
      const escapedTitle = escapeHtml(tab.title)
      return `
<div class="TAS_tabCon" data-tab-id="${tab.id}">
  <div class="TAS_tabIcon">
    <img src="${faviconUrl}" width="16" height="16" class="TAS_favicon">
  </div>
  <div title="${escapedTitle}" class="TAS_tabTitle">
    <div class="TAS_tabTitleText">${escapedTitle}</div>
  </div>
</div>
`
    })
    .join('')
}

export default class List {
  constructor(eventEmitter) {
    this.eventEmitter = eventEmitter
    this.root = undefined
    this.tabs = undefined
    this.cursor = undefined

    this.nextListener = () => {
      this.highlightNextTab()
    }

    this.previousListener = () => {
      this.highlightPreviousTab()
    }

    this.selectListener = () => {
      this.selectHighlightedTab()
    }
  }

  deactivate() {
    this.eventEmitter.removeListener('keyboard:next', this.nextListener)
    this.eventEmitter.removeListener('keyboard:previous', this.previousListener)
    this.eventEmitter.removeListener('keyboard:select', this.selectListener)
  }

  highlightTab(tab) {
    this.tabs[this.cursor].tabCon.classList.remove('TAS_highlighted')
    this.cursor = tab.cursor
    this.tabs[this.cursor].tabCon.classList.add('TAS_highlighted')
  }

  highlightNextTab() {
    let searching = true
    const originalCursor = this.cursor
    let newCursor = this.cursor
    while (searching) {
      if (newCursor === this.tabs.length - 1) {
        newCursor = -1
      }
      if (this.tabs[++newCursor].tabCon.style.display !== 'none' || newCursor === originalCursor) {
        searching = false
      }
    }
    this.highlightTab(this.tabs[newCursor])
  }

  highlightPreviousTab() {
    let searching = true
    const originalCursor = this.cursor
    let newCursor = this.cursor
    while (searching) {
      if (newCursor === 0) {
        newCursor = this.tabs.length
      }
      if (this.tabs[--newCursor].tabCon.style.display !== 'none' || newCursor === originalCursor) {
        searching = false
      }
    }
    this.highlightTab(this.tabs[newCursor])
  }

  selectHighlightedTab() {
    chrome.runtime.sendMessage({ selectTab: this.tabs[this.cursor] })
  }

  templateTabs() {
    return this.tabs.map((tab) => {
      return {
        id: tab.id,
        title: tab.title,
        url: tab.url,
        faviconUrl: isValidFaviconUrl(tab.favIconUrl) ? tab.favIconUrl : null
      }
    })
  }

  render(tabs) {
    this.tabs = tabs
    this.cursor = 0
    this.eventEmitter.on('keyboard:next', this.nextListener)
    this.eventEmitter.on('keyboard:previous', this.previousListener)
    this.eventEmitter.on('keyboard:select', this.selectListener)

    this.root = document.createElement('div')
    this.root.classList.add('TAS_list')
    this.root.innerHTML = template({ tabs: this.templateTabs() })

    this.tabs.forEach((tab, i) => {
      const tabCon = this.root.querySelector('[data-tab-id="' + tab.id + '"]')

      tabCon.addEventListener('mousemove', () => {
        this.highlightTab(tab)
      })

      tabCon.addEventListener('click', () => {
        this.selectHighlightedTab()
        this.eventEmitter.emit('list:select')
      })

      // Add handlers for favicon images
      const faviconImg = tabCon.querySelector('.TAS_favicon')
      if (faviconImg) {
        // Check if this is a data URL (like the default grey dot)
        const isDataUrl = faviconImg.src.startsWith('data:')

        // Data URLs should show immediately without fade-in
        if (isDataUrl) {
          faviconImg.classList.add('TAS_favicon-loaded')
        } else {
          // Remote URLs: fade in when they load successfully
          faviconImg.addEventListener('load', function () {
            this.classList.add('TAS_favicon-loaded')
          })

          // Show default icon on load failure
          faviconImg.addEventListener('error', function () {
            // Only replace once to avoid infinite loops
            if (this.src !== DEFAULT_FAVICON) {
              this.src = DEFAULT_FAVICON
              // Default icon is a data URL, show immediately
              this.classList.add('TAS_favicon-loaded')
            }
          })

          // If image is already loaded (from cache), add class immediately
          if (faviconImg.complete && faviconImg.naturalHeight !== 0) {
            faviconImg.classList.add('TAS_favicon-loaded')
          }
        }
      }

      tab.cursor = i
      tab.tabCon = tabCon
    })

    this.highlightNextTab()

    return this.root
  }
}
