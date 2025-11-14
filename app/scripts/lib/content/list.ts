import { escapeHtml } from '../utils.js'
import type { ICoordinator, Tab } from '../types.js'

interface TabWithUI extends Tab {
  cursor?: number
  tabCon?: Element
}

function template(subs: { tabs: Tab[] }): string {
  return subs.tabs
    .map((tab) => {
      const escapedFaviconUrl = escapeHtml(tab.favIconUrl)
      const escapedTitle = escapeHtml(tab.title)
      return `
<div class="TAS_tabCon" data-tab-id="${tab.id ?? ''}">
  <div class="TAS_tabIcon">
    <img src="${escapedFaviconUrl}" width="16" height="16" class="TAS_favicon">
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
  ignoreMouseMoveUntil: number

  constructor(coordinator: ICoordinator) {
    this.coordinator = coordinator
    this.root = undefined
    this.tabs = undefined
    this.cursor = undefined
    this.ignoreMouseMoveUntil = 0
  }

  deactivate(): void {
    // Deactivate here
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

  render(tabs: Tab[]): HTMLDivElement {
    this.tabs = tabs as TabWithUI[]
    this.cursor = 0

    // Ignore mousemove events for 100ms after rendering to prevent
    // highlighting tabs when popup opens under the cursor
    this.ignoreMouseMoveUntil = Date.now() + 100

    this.root = document.createElement('div')
    this.root.classList.add('TAS_list')
    this.root.innerHTML = template({ tabs: this.tabs })

    this.tabs.forEach((tab, i) => {
      const tabCon = this.root!.querySelector(`[data-tab-id="${tab.id ?? ''}"]`)
      if (!tabCon) return

      tabCon.addEventListener('mousemove', () => {
        if (Date.now() < this.ignoreMouseMoveUntil) return
        this.highlightTab(tab)
      })

      tabCon.addEventListener('click', () => {
        this.selectHighlightedTab()
        this.coordinator.handleDeactivate()
      })

      // All favicons are data URLs from background script - show immediately
      const faviconImg = tabCon.querySelector<HTMLImageElement>('.TAS_favicon')
      if (faviconImg) {
        faviconImg.classList.add('TAS_favicon-loaded')
      }

      tab.cursor = i
      tab.tabCon = tabCon
    })

    this.highlightNextTab()

    return this.root
  }
}
