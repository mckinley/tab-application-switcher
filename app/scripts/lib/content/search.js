import uFuzzy from '@leeoniya/ufuzzy'

function template() {
  return `
<input class="TAS_searchInput" type="search" placeholder="search page titles and urls">
<svg class="TAS_searchIcon" fill="#f00" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M11.5 7a4.499 4.499 0 11-8.998 0A4.499 4.499 0 0111.5 7zm-.82 4.74a6 6 0 111.06-1.06l3.04 3.04a.75.75 0 11-1.06 1.06l-3.04-3.04z"/></svg>
`
}

export default class Search {
  constructor(eventEmitter) {
    this.eventEmitter = eventEmitter
    this.root = undefined
    this.tabs = undefined
    this.list = undefined

    // Initialize uFuzzy with optimized settings for tab search
    // eslint-disable-next-line new-cap
    this.fuzzy = new uFuzzy({
      intraMode: 1, // Allow single typo per term
      intraIns: 1, // Allow 1 extra char between chars in a term
      intraSub: 1, // Allow substitutions
      intraTrn: 1, // Allow transpositions
      intraDel: 1 // Allow deletions
    })
  }

  filterTabs(value) {
    if (!value) {
      // Show all tabs when search is empty
      this.tabs.forEach((tab) => {
        tab.tabCon.style.display = 'block'
      })
      if (this.tabs.length > 0) {
        this.list.highlightTab(this.tabs[0])
      }
      return
    }

    // Build haystack from tab titles and URLs
    const haystack = this.tabs.map((tab) => `${tab.title} ${tab.url}`)

    // Search using uFuzzy
    const idxs = this.fuzzy.filter(haystack, value)

    // Hide all tabs first
    this.tabs.forEach((tab) => {
      tab.tabCon.style.display = 'none'
    })

    // Show matching tabs
    let firstMatch = false
    if (idxs && idxs.length > 0) {
      idxs.forEach((idx) => {
        this.tabs[idx].tabCon.style.display = 'block'
        if (!firstMatch) {
          this.list.highlightTab(this.tabs[idx])
          firstMatch = true
        }
      })
    }
  }

  render(tabs, list) {
    this.tabs = tabs
    this.list = list

    this.root = document.createElement('div')
    this.root.classList.add('TAS_search')
    this.root.innerHTML = template()

    const searchInput = this.root.querySelector('.TAS_searchInput')
    searchInput.addEventListener('focus', () => {
      this.eventEmitter.emit('display:search')
    })
    searchInput.addEventListener('input', (event) => {
      event.stopPropagation()
      this.filterTabs(searchInput.value)
    })
    searchInput.addEventListener('keydown', (event) => {
      if (event.keyCode === 38 || event.keyCode === 40 || event.keyCode === 13 || event.keyCode === 27) {
        // (38) let up arrow pass through
        // (40) let down arrow pass through
        // (13) let enter pass through
        // (27) let escape pass through
      } else {
        event.stopPropagation()
      }
    })

    return this.root
  }
}
