import uFuzzy from '@leeoniya/ufuzzy'
import type { ICoordinator, Tab } from '../types.js'
import type List from './list.js'

interface TabWithUI extends Tab {
  tabCon?: HTMLElement
}

function template(): string {
  return `
<input class="TAS_searchInput" type="search" placeholder="search page titles and urls">
<svg class="TAS_searchIcon" fill="#f00" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M11.5 7a4.499 4.499 0 11-8.998 0A4.499 4.499 0 0111.5 7zm-.82 4.74a6 6 0 111.06-1.06l3.04 3.04a.75.75 0 11-1.06 1.06l-3.04-3.04z"/></svg>
`
}

export default class Search {
  coordinator: ICoordinator
  root?: HTMLDivElement
  tabs?: TabWithUI[]
  list?: List
  fuzzy: uFuzzy

  constructor(coordinator: ICoordinator) {
    this.coordinator = coordinator
    this.root = undefined
    this.tabs = undefined
    this.list = undefined

    // Initialize uFuzzy with optimized settings for tab search
    this.fuzzy = new uFuzzy({
      intraMode: 1, // Allow single typo per term
      intraIns: 1, // Allow 1 extra char between chars in a term
      intraSub: 1, // Allow substitutions
      intraTrn: 1, // Allow transpositions
      intraDel: 1 // Allow deletions
    })
  }

  filterTabs(value: string): void {
    if (!this.tabs || !this.list) return

    if (!value) {
      // Show all tabs when search is empty
      this.tabs.forEach((tab) => {
        if (tab.tabCon) {
          tab.tabCon.style.display = 'block'
        }
      })
      if (this.tabs.length > 0) {
        this.list.highlightTab(this.tabs[0])
      }
      return
    }

    // Build haystack from tab titles and URLs
    const haystack = this.tabs.map((tab) => `${tab.title ?? ''} ${tab.url ?? ''}`)

    // Search using uFuzzy
    const idxs = this.fuzzy.filter(haystack, value)

    // Hide all tabs first
    this.tabs.forEach((tab) => {
      if (tab.tabCon) {
        tab.tabCon.style.display = 'none'
      }
    })

    // Show matching tabs
    let firstMatch = false
    if (idxs && idxs.length > 0) {
      idxs.forEach((idx) => {
        const tab = this.tabs![idx]
        if (tab?.tabCon) {
          tab.tabCon.style.display = 'block'
          if (!firstMatch) {
            this.list!.highlightTab(tab)
            firstMatch = true
          }
        }
      })
    }
  }

  render(tabs: TabWithUI[], list: List): HTMLDivElement {
    this.tabs = tabs
    this.list = list

    this.root = document.createElement('div')
    this.root.classList.add('TAS_search')
    this.root.innerHTML = template()

    const searchInput = this.root.querySelector<HTMLInputElement>('.TAS_searchInput')
    if (searchInput) {
      searchInput.addEventListener('focus', () => {
        this.coordinator.handleSearch()
      })

      searchInput.addEventListener('input', (event) => {
        event.stopPropagation()
        this.filterTabs(searchInput.value)
      })

      searchInput.addEventListener('keydown', (event) => {
        const keyEvent = event
        if (keyEvent.keyCode === 38 || keyEvent.keyCode === 40 || keyEvent.keyCode === 13 || keyEvent.keyCode === 27) {
          // (38) let up arrow pass through
          // (40) let down arrow pass through
          // (13) let enter pass through
          // (27) let escape pass through
        } else {
          event.stopPropagation()
        }
      })
    }

    return this.root
  }
}
