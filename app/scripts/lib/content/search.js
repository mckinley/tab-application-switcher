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
  }

  filterTabs(value) {
    let firstMatch
    this.tabs.forEach((tab) => {
      if (this.match(value, tab)) {
        tab.tabCon.style.display = 'block'
        if (!firstMatch) {
          this.list.highlightTab(tab)
          firstMatch = true
        }
      } else {
        tab.tabCon.style.display = 'none'
      }
    })
  }

  match(text, tab) {
    return tab.title.match(new RegExp(text)) || tab.url.match(new RegExp(text))
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
