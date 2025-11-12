import uFuzzy from '@leeoniya/ufuzzy'
import type { Tab, IBackgroundCoordinator } from '../types.js'

export default class Omnibox {
  coordinator: IBackgroundCoordinator
  tabs: Tab[]
  fuzzy: uFuzzy

  constructor(coordinator: IBackgroundCoordinator) {
    this.coordinator = coordinator
    this.tabs = []

    // Initialize uFuzzy with same settings as search
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
      if (tab) this.coordinator.handleOmniboxSelectTab(tab)
    })
  }

  getTabs(): void {
    this.tabs = []
    chrome.windows.getAll({ populate: true }, (windows) => {
      windows.forEach((w) => {
        if (w.tabs) {
          this.tabs = this.tabs.concat(w.tabs)
        }
      })
    })
  }

  suggest(text: string, suggest: (suggestions: chrome.omnibox.SuggestResult[]) => void): void {
    const suggestions: chrome.omnibox.SuggestResult[] = []
    const matchedTabs = this.matchedTabs(text)

    matchedTabs.forEach((tab) => {
      if (tab.url && tab.title) {
        suggestions.push({
          content: tab.url,
          description: `tab: <match>${this.encodeXml(tab.title)}</match>`
        })
      }
    })

    if (suggestions.length > 0) {
      void chrome.omnibox.setDefaultSuggestion({ description: suggestions[0].description })
      suggestions.shift()
    }

    if (suggestions.length > 0) {
      suggest(suggestions)
    }
  }

  matchedTabs(text: string): Tab[] {
    if (!text) return this.tabs

    // Build haystack from tab titles and URLs
    const haystack = this.tabs.map((tab) => `${tab.title ?? ''} ${tab.url ?? ''}`)

    // Search using uFuzzy
    const idxs = this.fuzzy.filter(haystack, text)

    // Return matched tabs
    if (idxs && idxs.length > 0) {
      return idxs.map((idx) => this.tabs[idx]).filter((tab): tab is Tab => tab !== undefined)
    }

    return []
  }

  findTab(url: string): Tab | undefined {
    return this.tabs.find((tab) => tab && tab.url === url)
  }

  encodeXml(s: string): string {
    // Service workers don't have access to DOM, so we need to manually encode
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }
}
