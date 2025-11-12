import { isValidFaviconUrl, DEFAULT_FAVICON, escapeHtml } from '../utils.js'
import type { ICoordinator, Tab } from '../types.js'

interface TemplateTab {
  id?: number
  title?: string
  url?: string
  faviconUrl: string | null
}

interface TabWithUI extends Tab {
  cursor?: number
  tabCon?: Element
}

function template(subs: { tabs: TemplateTab[] }): string {
  return subs.tabs
    .map((tab) => {
      const faviconUrl = escapeHtml(tab.faviconUrl ?? DEFAULT_FAVICON)
      const escapedTitle = escapeHtml(tab.title)
      return `
<div class="TAS_tabCon" data-tab-id="${tab.id ?? ''}">
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
  coordinator: ICoordinator
  root?: HTMLDivElement
  tabs?: TabWithUI[]
  cursor?: number

  constructor(coordinator: ICoordinator) {
    this.coordinator = coordinator
    this.root = undefined
    this.tabs = undefined
    this.cursor = undefined
  }

  deactivate(): void {
    // No event listeners to remove anymore
  }

  highlightTab(tab: TabWithUI): void {
    if (!this.tabs || this.cursor === undefined) return

    const currentTab = this.tabs[this.cursor]
    if (currentTab?.tabCon) {
      currentTab.tabCon.classList.remove('TAS_highlighted')
    }

    if (tab.cursor !== undefined) {
      this.cursor = tab.cursor
      const newTab = this.tabs[this.cursor]
      if (newTab?.tabCon) {
        newTab.tabCon.classList.add('TAS_highlighted')
      }
    }
  }

  highlightNextTab(): void {
    if (!this.tabs || this.cursor === undefined) return

    let searching = true
    const originalCursor = this.cursor
    let newCursor = this.cursor

    while (searching) {
      if (newCursor === this.tabs.length - 1) {
        newCursor = -1
      }
      const nextTab = this.tabs[++newCursor]
      const tabCon = nextTab?.tabCon as HTMLElement | undefined
      if (tabCon?.style.display !== 'none' || newCursor === originalCursor) {
        searching = false
      }
    }

    this.highlightTab(this.tabs[newCursor])
  }

  highlightPreviousTab(): void {
    if (!this.tabs || this.cursor === undefined) return

    let searching = true
    const originalCursor = this.cursor
    let newCursor = this.cursor

    while (searching) {
      if (newCursor === 0) {
        newCursor = this.tabs.length
      }
      const prevTab = this.tabs[--newCursor]
      const tabCon = prevTab?.tabCon as HTMLElement | undefined
      if (tabCon?.style.display !== 'none' || newCursor === originalCursor) {
        searching = false
      }
    }

    this.highlightTab(this.tabs[newCursor])
  }

  selectHighlightedTab(): void {
    if (!this.tabs || this.cursor === undefined) return
    this.coordinator.selectTab(this.tabs[this.cursor])
  }

  getSelectedTab(): TabWithUI | undefined {
    if (!this.tabs || this.cursor === undefined) return undefined
    return this.tabs[this.cursor]
  }

  templateTabs(): TemplateTab[] {
    if (!this.tabs) return []

    return this.tabs.map((tab) => {
      return {
        id: tab.id,
        title: tab.title,
        url: tab.url,
        faviconUrl: isValidFaviconUrl(tab.favIconUrl) ? tab.favIconUrl! : null
      }
    })
  }

  render(tabs: Tab[]): HTMLDivElement {
    this.tabs = tabs as TabWithUI[]
    this.cursor = 0

    this.root = document.createElement('div')
    this.root.classList.add('TAS_list')
    this.root.innerHTML = template({ tabs: this.templateTabs() })

    this.tabs.forEach((tab, i) => {
      const tabCon = this.root!.querySelector(`[data-tab-id="${tab.id ?? ''}"]`)
      if (!tabCon) return

      tabCon.addEventListener('mousemove', () => {
        this.highlightTab(tab)
      })

      tabCon.addEventListener('click', () => {
        this.selectHighlightedTab()
        this.coordinator.handleDeactivate()
      })

      // Add handlers for favicon images
      const faviconImg = tabCon.querySelector<HTMLImageElement>('.TAS_favicon')
      if (faviconImg) {
        // Check if this is a data URL (like the default grey dot)
        const isDataUrl = faviconImg.src.startsWith('data:')

        // Data URLs should show immediately without fade-in
        if (isDataUrl) {
          faviconImg.classList.add('TAS_favicon-loaded')
        } else {
          // Remote URLs: fade in when they load successfully
          faviconImg.addEventListener('load', function (this: HTMLImageElement) {
            this.classList.add('TAS_favicon-loaded')
          })

          // Show default icon on load failure
          faviconImg.addEventListener('error', function (this: HTMLImageElement) {
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
