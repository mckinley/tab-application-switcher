import template from '~/app/templates/search.hbs';

export default class Search {

  constructor(eventEmitter, tabs, list) {
    this.eventEmitter = eventEmitter;
    this.tabs = tabs;
    this.list = list;
    this.root;
  }

  filterTabs(value) {
    let firstMatch;
    this.tabs.forEach((tab) => {
      if (this.match(value, tab)) {
        tab.tabCon.style.display = 'block';
        if (!firstMatch) {
          this.list.highlightTab(tab);
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

  render() {
    this.root = document.createElement('div');
    this.root.classList.add('TAS_search');
    this.root.innerHTML = template();

    let searchInput = this.root.querySelector('.TAS_searchInput');
    searchInput.addEventListener('focus', () => {
      this.eventEmitter.emit('display:search');
    });
    searchInput.addEventListener('input', (event) => {
      event.stopPropagation();
      this.filterTabs(searchInput.value);
    });
    searchInput.addEventListener('keydown', (event) => {
      event.stopPropagation();
    });

    return this.root;
  }
}
