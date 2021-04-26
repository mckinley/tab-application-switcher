export default class Omnibox {
  constructor (eventEmitter) {
    this.eventEmitter = eventEmitter
    this.tabs = []

    chrome.omnibox.onInputStarted.addListener(() => {
      this.getTabs()
    })

    chrome.omnibox.onInputChanged.addListener((text, suggest) => {
      this.suggest(text, suggest)
    })

    chrome.omnibox.onInputEntered.addListener((text, _disposition) => {
      const tab = this.findTab(text) || this.matchedTabs(text)[0]
      if (tab) this.eventEmitter.emit('omnibox:select-tab', tab)
    })
  }

  getTabs () {
    this.tabs = []
    chrome.windows.getAll({ populate: true }, (windows) => {
      windows.forEach((w) => {
        this.tabs = this.tabs.concat(w.tabs)
      })
    })
  }

  suggest (text, suggest) {
    const suggestions = []
    const matchedTabs = this.matchedTabs(text)
    matchedTabs.forEach((tab) => {
      suggestions.push({ content: tab.url, description: `tab: <match>${this.encodeXml(tab.title)}</match>` })
    })

    if (suggestions.length > 0) {
      chrome.omnibox.setDefaultSuggestion({ description: suggestions[0].description })
      suggestions.shift()
    }

    if (suggestions.length > 0) {
      suggest(suggestions)
    }
  }

  match (text, tab) {
    return tab.title.match(new RegExp(text)) || tab.url.match(new RegExp(text))
  }

  matchedTabs (text) {
    const matchedTabs = []
    this.tabs.forEach((tab) => {
      if (this.match(text, tab)) {
        matchedTabs.push(tab)
      }
    })
    return matchedTabs
  }

  findTab (url) {
    return this.tabs.find((tab) => tab && tab.url === url)
  }

  encodeXml (s) {
    const holder = document.createElement('div')
    holder.textContent = s
    return holder.innerHTML
  }
}
