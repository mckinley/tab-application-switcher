import template from '~/app/templates/search.hbs';

export default class Search {

  constructor(eventEmitter) {
    this.eventEmitter = eventEmitter;
    this.root;
    this.tabs;
    this.list;
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

  render(tabs, list) {
    this.tabs = tabs;
    this.list = list;

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
      if (event.keyCode === 38 || event.keyCode === 40 || event.keyCode === 13 || (searchInput.value === '' && event.keyCode === 27)) {
        // (38) let up arrow pass through
        // (40) let down arrow pass through
        // (13) let enter pass through
        // (27) let escape pass through if the input is empty
      } else {
        event.stopPropagation();
      }
    });

    return this.root;
  }
}
