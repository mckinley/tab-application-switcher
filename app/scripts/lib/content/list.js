function template (subs) {
  return subs.tabs.map((tab) => {
    return `
<div class="TAS_tabCon" data-tab-id="${tab.id}">
  <div class="TAS_tabIcon" style="background-image: url(&quot;${tab.faviconUrl}&quot;);"></div>
  <div title="${tab.title}" class="TAS_tabTitle">
    <div class="TAS_tabTitleText">${tab.title}</div>
  </div>
</div>
`
  }).join('')
}

export default class List {
  constructor (eventEmitter) {
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

  deactivate () {
    this.eventEmitter.removeListener('keyboard:next', this.nextListener)
    this.eventEmitter.removeListener('keyboard:previous', this.previousListener)
    this.eventEmitter.removeListener('keyboard:select', this.selectListener)
    // delete this.tabs;
    // delete this.cursor;
  }

  highlightTab (tab) {
    this.tabs[this.cursor].tabCon.classList.remove('TAS_highlighted')
    this.cursor = tab.cursor
    this.tabs[this.cursor].tabCon.classList.add('TAS_highlighted')
  }

  highlightNextTab () {
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

  highlightPreviousTab () {
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

  selectHighlightedTab () {
    chrome.runtime.sendMessage({ selectTab: this.tabs[this.cursor] })
  }

  templateTabs () {
    return this.tabs.map((tab) => {
      return {
        id: tab.id,
        title: tab.title,
        url: tab.url,
        faviconUrl: tab.favIconDataUrl || (tab.favIconUrl && tab.favIconUrl.indexOf('chrome://theme/') !== 0 ? tab.favIconUrl : '')
      }
    })
  }

  render (tabs) {
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

      tab.cursor = i
      tab.tabCon = tabCon
    })

    this.highlightNextTab()

    return this.root
  }
}
