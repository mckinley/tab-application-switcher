import template from '~/app/templates/list.hbs';

export default class List {

  constructor(eventEmitter, tabs) {
    this.eventEmitter = eventEmitter;
    this.tabs = tabs;
    this.cursor = 0;
    this.root;

    this.eventEmitter.on('keyboard:next', () => {
      this.highlightNextTab();
    });

    this.eventEmitter.on('keyboard:previous', () => {
      this.highlightPreviousTab();
    });

    this.eventEmitter.on('keyboard:select', () => {
      this.selectHighlightedTab();
    });
  }

  highlightTab(tab) {
    this.tabs[this.cursor].tabCon.classList.remove('TAS_highlighted');
    this.cursor = tab.cursor;
    this.tabs[this.cursor].tabCon.classList.add('TAS_highlighted');
  }

  highlightNextTab() {
    let searching = true;
    let originalCursor = this.cursor;
    let newCursor = this.cursor;
    while (searching) {
      if (newCursor === this.tabs.length - 1) {
        newCursor = -1;
      }
      if (this.tabs[++newCursor].tabCon.style.display !== 'none' || newCursor === originalCursor) {
        searching = false;
      }
    }
    this.highlightTab(this.tabs[newCursor]);
  }

  highlightPreviousTab() {
    let searching = true;
    let originalCursor = this.cursor;
    let newCursor = this.cursor;
    while (searching) {
      if (newCursor === 0) {
        newCursor = this.tabs.length;
      }
      if (this.tabs[--newCursor].tabCon.style.display !== 'none' || newCursor === originalCursor) {
        searching = false;
      }
    }
    this.highlightTab(this.tabs[newCursor]);
  }

  selectHighlightedTab() {
    chrome.runtime.sendMessage({ selectTab: this.tabs[this.cursor] });
  }

  templateTabs() {
    return this.tabs.map(function(tab) {
      return {
        id: tab.id,
        title: tab.title,
        url: tab.url,
        faviconUrl: (tab.favIconUrl.indexOf('chrome://theme/') !== 0 ? tab.favIconUrl : '')
      };
    });
  }

  render() {
    this.root = document.createElement('div');
    this.root.classList.add('TAS_list');
    this.root.innerHTML = template({ tabs: this.templateTabs() });

    this.tabs.forEach((tab, i) => {
      let tabCon = this.root.querySelector('[data-tab-id="' + tab.id + '"]');

      tabCon.addEventListener('mouseover', () => {
        this.highlightTab(tab);
      });

      tabCon.addEventListener('click', () => {
        this.selectHighlightedTab();
      });

      tab.cursor = i;
      tab.tabCon = tabCon;
    });

    this.highlightNextTab();

    return this.root;
  }
}
