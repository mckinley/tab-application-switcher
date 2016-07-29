export default class Display {

  constructor(eventEmitter) {
    this.eventEmitter = eventEmitter;
    this.active = false;
    this.cursor;
    this.root;
    this.tabs;

    this.eventEmitter.on('keyboard:activate', () => {
      this.activate();
    });

    this.eventEmitter.on('keyboard:next', () => {
      this.highlightNextTab();
    });

    this.eventEmitter.on('keyboard:previous', () => {
      this.highlightPreviousTab();
    });

    this.eventEmitter.on('keyboard:select', () => {
      this.selectHighlightedTab();
    });

    this.eventEmitter.on('keyboard:cancel', () => {
      this.deactivate();
    });

    chrome.runtime.connect().onDisconnect.addListener(() => { this.destroy(); });
  }

  activate() {
    if (this.active) return;

    this.cursor = 0;
    this.getTabs(() => {
      this.render();
      this.highlightNextTab();
    });
    this.active = true;
  }

  deactivate() {
    if (!this.active) return;

    this.eventEmitter.emit('display:deactivate');
    document.body.removeChild(this.root);
    this.cursor = undefined;
    this.root = undefined;
    this.tabs = undefined;
    this.active = false;
  }

  destroy() {
    this.deactivate();
    delete this.eventEmitter;
    delete this.active;
    delete this.cursor;
    delete this.root;
    delete this.tabs;
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
    this.deactivate();
  }

  getTabs(cb) {
    chrome.runtime.sendMessage({ tabs: true }, (response) => {
      this.tabs = response.tabs;
      cb();
    });
  }

  addStylesheet() {
    let id = 'TAS_style';
    let existingStyle = document.getElementById(id);
    if (existingStyle) {
      document.head.removeChild(existingStyle);
    }
    let style = document.createElement('style');
    style.id = id;
    style.appendChild(document.createTextNode('@import "' + chrome.extension.getURL('styles/main.css') + '";'));
    document.head.appendChild(style);
  }

  render() {
    this.root = document.createElement('div');
    var shadow = this.root.createShadowRoot();
    var displayCon = document.createElement('div');
    let searchCon = document.createElement('div');
    let searchInput = document.createElement('input');
    searchInput.setAttribute('type', 'search');
    searchInput.setAttribute('placeholder', 'search page titles and urls');

    this.addStylesheet();

    this.root.classList.add('TAS_root');
    displayCon.classList.add('TAS_displayCon');
    searchCon.classList.add('TAS_searchCon');
    searchInput.classList.add('TAS_searchInput');

    document.body.appendChild(this.root);
    shadow.appendChild(displayCon);
    displayCon.appendChild(searchCon);
    searchCon.appendChild(searchInput);

    let searchIcon = '<svg class="TAS_searchIcon" viewBox="0 0 32 32" title=""><path d="M29.707,28.293l-8.256-8.256C23.042,18.13,24,15.677,24,13c0-6.075-4.925-11-11-11S2,6.925,2,13s4.925,11,11,11c2.677,0,5.13-0.958,7.037-2.549l8.256,8.256L29.707,28.293z M4,13c0-4.963,4.037-9,9-9c4.963,0,9,4.037,9,9s-4.037,9-9,9C8.037,22,4,17.963,4,13z"></path></svg>';
    let temp = document.createElement('div');
    temp.innerHTML = searchIcon;
    searchCon.appendChild(temp.firstChild);

    searchInput.addEventListener('focus', () => {
      console.log('focus');
      this.eventEmitter.emit('display:search');
    });

    searchInput.addEventListener('input', () => {
      this.filterTabs(searchInput.value);
    });

    this.tabs.forEach((tab, i) => {
      let tabCon = document.createElement('div');
      let tabTitle = document.createElement('div');
      let tabTitleText = document.createElement('div');
      let tabIcon = document.createElement('div');

      tabTitle.setAttribute('title', tab.url);
      tabTitleText.appendChild(document.createTextNode(tab.title));
      if (tab.favIconUrl && tab.favIconUrl.indexOf('chrome://theme/') !== 0) {
        tabIcon.style.backgroundImage = 'url(\'' + tab.favIconUrl + '\')';
      }

      tabCon.classList.add('TAS_tabCon');
      tabTitle.classList.add('TAS_tabTitle');
      tabTitleText.classList.add('TAS_tabTitleText');
      tabIcon.classList.add('TAS_tabIcon');

      displayCon.appendChild(tabCon);
      tabCon.appendChild(tabIcon);
      tabCon.appendChild(tabTitle);
      tabTitle.appendChild(tabTitleText);


      tabCon.addEventListener('mouseover', () => {
        this.highlightTab(tab);
      });

      tabCon.addEventListener('click', () => {
        this.selectHighlightedTab();
      });

      tab.cursor = i;
      tab.tabCon = tabCon;
    });
  }

  filterTabs(value) {
    let firstMatch;
    this.tabs.forEach((tab) => {
      if (this.match(value, tab)) {
        tab.tabCon.style.display = 'block';
        if (!firstMatch) {
          this.highlightTab(tab);
          firstMatch = true;
        }
      } else {
        tab.tabCon.style.display = 'none';
      }
    });
  }

  match(text, tab) {
    return tab.title.match(new RegExp(text)) || tab.url.match(new RegExp(text));
  }
}
