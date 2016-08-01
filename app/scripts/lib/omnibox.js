export default class Omnibox {

  constructor(eventEmitter) {
    this.eventEmitter = eventEmitter;
    this.tabs = [];

    this.eventEmitter.on('tabs:tabs', (tabs) => { this.tabs = tabs; });

    chrome.omnibox.onInputChanged.addListener((text, suggest) => {
      this.suggest(text, suggest);
    });

    chrome.omnibox.onInputEntered.addListener((text, _disposition) => {
      let tab = this.findTab(text);
      if (!tab) {
        tab = this.matchedTabs(text)[0];
      }
      if (tab) {
        this.eventEmitter.emit('omnibox:select-tab', tab);
      }
    });
  }

  suggest(text, suggest) {
    let suggestions = [];
    let matchedTabs = this.matchedTabs(text);
    matchedTabs.forEach((tab) => {
      suggestions.push({ content: tab.url, description: 'tab: <match>' + this.encodeXml(tab.title) + '</match>' });
    });

    if (suggestions.length > 0) {
      chrome.omnibox.setDefaultSuggestion({ description: suggestions[0].description });
      suggestions.shift();
    }

    if (suggestions.length > 0) {
      suggest(suggestions);
    }
  }

  match(text, tab) {
    return tab.title.match(new RegExp(text)) || tab.url.match(new RegExp(text));
  }

  matchedTabs(text) {
    let matchedTabs = [];
    let l = this.tabs.length;
    for (let i = 0; i < l; i++) {
      let tab = this.tabs[i];
      if (this.match(text, tab)) {
        matchedTabs.push(tab);
      }
    }
    return matchedTabs;
  }

  findTab(url) {
    return this.tabs.find((tab) => tab && tab.url === url);
  }

  encodeXml(s) {
    var holder = document.createElement('div');
    holder.textContent = s;
    return holder.innerHTML;
  }
}
