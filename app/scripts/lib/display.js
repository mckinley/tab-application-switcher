export default class Display {

  constructor(eventEmitter){
    this.eventEmitter = eventEmitter;
    this.active = false;
    this.cursor = 0;
    this.root;
    this.tabs;

    this.eventEmitter.on('keyboard:next', () => {
      if(!this.active){
        this.activate();
      } else {
        this.highlightNextTab();
      }
    });

    this.eventEmitter.on('keyboard:previous', () => {
      this.highlightPreviousTab();
    });

    this.eventEmitter.on('keyboard:select', () => {
      this.selectHighlightedTab();
      this.deactivate();
    });

    this.eventEmitter.on('keyboard:cancel', () => {
      this.deactivate();
    });

    chrome.runtime.connect().onDisconnect.addListener(() => { this.destroy(); });
  }

  activate() {
    this.getTabs(() => {
      this.render();
      this.highlightNextTab();
      this.active = true;
    });
  }

  deactivate() {
    document.body.removeChild(this.root);
    this.active = false;
    this.cursor = 0;
  }

  destroy() {
    if (this.active) {
      this.deactivate();
    }
    this.eventEmitter = undefined;
    this.active = undefined;
    this.cursor = undefined;
    this.root = undefined;
    this.tabs = undefined;
  }

  highlightNextTab() {
    this.tabs[this.cursor].tabCon.classList.remove('TAS_highlighted');
    if (this.cursor === this.tabs.length - 1) {
      this.cursor = -1;
    }
    this.tabs[++this.cursor].tabCon.classList.add('TAS_highlighted');
  }

  highlightPreviousTab() {
    this.tabs[this.cursor].tabCon.classList.remove('TAS_highlighted');
    if (this.cursor === 0) {
      this.cursor = this.tabs.length;
    }
    this.tabs[--this.cursor].tabCon.classList.add('TAS_highlighted');
  }

  selectHighlightedTab() {
    chrome.runtime.sendMessage({ selectTab: this.tabs[this.cursor] });
  }

  getTabs(cb) {
    chrome.runtime.sendMessage({ tabs: true }, (response) => {
      this.tabs = response.tabs;
      cb();
    });
  }

  render() {
    this.root = document.createElement('div');
    this.root.classList.add('TAS_root');
    var shadow = this.root.createShadowRoot();
    var displayCon = document.createElement('div');
    displayCon.classList.add('TAS_displayCon');
    document.body.appendChild(this.root);
    shadow.appendChild(displayCon);

    let l = this.tabs.length;
    for (let i = 0; i < l; i++) {
      let tab = this.tabs[i];

      let tabCon = document.createElement('div');
      let tabTitle = document.createElement('div');
      let tabTitleText = document.createElement('div');
      let tabIcon = document.createElement('div');

      tabTitle.setAttribute('title', tab.url);
      tabTitleText.appendChild(document.createTextNode(tab.title));
      if (tab.favIconUrl && tab.url != 'chrome://extensions/') {
        tabIcon.style.backgroundImage = 'url(\'' + tab.favIconUrl + '\')';
      }

      tabCon.classList.add('TAS_tabCon', 'mdl-card', 'mdl-shadow--2dp');
      tabTitle.classList.add('TAS_tabTitle', 'mdl-card__title');
      tabTitleText.classList.add('TAS_tabTitleText', 'mdl-typography--title');
      tabIcon.classList.add('TAS_tabIcon', 'mdl-list__item-icon', 'mdl-shadow--1dp');

      displayCon.appendChild(tabCon);
      tabCon.appendChild(tabIcon);
      tabCon.appendChild(tabTitle);
      tabTitle.appendChild(tabTitleText);

      tab.tabCon = tabCon;
    }
  }
}
