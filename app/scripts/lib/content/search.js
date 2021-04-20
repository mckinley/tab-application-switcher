function template () {
  return `
<input class="TAS_searchInput" type="search" placeholder="search page titles and urls">
<svg class="TAS_searchIcon" viewBox="0 0 0 0" title="">
  <path d="M29.707,28.293l-8.256-8.256C23.042,18.13,24,15.677,24,13c0-6.075-4.925-11-11-11S2,6.925,2,13s4.925,11,11,11c2.677,0,5.13-0.958,7.037-2.549l8.256,8.256L29.707,28.293z M4,13c0-4.963,4.037-9,9-9c4.963,0,9,4.037,9,9s-4.037,9-9,9C8.037,22,4,17.963,4,13z"></path>
</svg>
`
}

export default class Search {
  constructor (eventEmitter) {
    this.eventEmitter = eventEmitter
    this.root = undefined
    this.tabs = undefined
    this.list = undefined
  }

  filterTabs (value) {
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

  match (text, tab) {
    return tab.title.match(new RegExp(text)) || tab.url.match(new RegExp(text))
  }

  render (tabs, list) {
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
      if (event.keyCode === 38 || event.keyCode === 40 || event.keyCode === 13 || (searchInput.value === '' && event.keyCode === 27)) {
        // (38) let up arrow pass through
        // (40) let down arrow pass through
        // (13) let enter pass through
        // (27) let escape pass through if the input is empty
      } else {
        event.stopPropagation()
      }
    })

    return this.root
  }
}
