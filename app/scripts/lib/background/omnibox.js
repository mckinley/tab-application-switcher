import uFuzzy from '@leeoniya/ufuzzy'

export default class Omnibox {
  constructor(eventEmitter) {
    this.eventEmitter = eventEmitter
    this.tabs = []

    // Initialize uFuzzy with same settings as search
    // eslint-disable-next-line new-cap
    this.fuzzy = new uFuzzy({
      intraMode: 1,
      intraIns: 1,
      intraSub: 1,
      intraTrn: 1,
      intraDel: 1
    })

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

  getTabs() {
    this.tabs = []
    chrome.windows.getAll({ populate: true }, (windows) => {
      windows.forEach((w) => {
        this.tabs = this.tabs.concat(w.tabs)
      })
    })
  }

  suggest(text, suggest) {
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

  matchedTabs(text) {
    if (!text) return this.tabs

    // Build haystack from tab titles and URLs
    const haystack = this.tabs.map((tab) => `${tab.title} ${tab.url}`)

    // Search using uFuzzy
    const idxs = this.fuzzy.filter(haystack, text)

    // Return matched tabs
    if (idxs && idxs.length > 0) {
      return idxs.map((idx) => this.tabs[idx])
    }

    return []
  }

  findTab(url) {
    return this.tabs.find((tab) => tab && tab.url === url)
  }

  encodeXml(s) {
    // Service workers don't have access to DOM, so we need to manually encode
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }
}
