import template from '~/app/templates/display.hbs';
import Options from './options';
import Search from './search';
import List from './list';

export default class Display {

  constructor (eventEmitter) {
    this.eventEmitter = eventEmitter;
    this.active = false;
    this.stylesheetId = 'TAS_style';
    this.root;
    this.shadowRoot;
    this.options;
    this.tabs;

    this.list = new List(this.eventEmitter);
    this.search = new Search(this.eventEmitter);

    this.eventEmitter.on('keyboard:activate', () => {
      this.activate();
    });

    this.eventEmitter.on('keyboard:select', () => {
      this.deactivate();
    });

    this.eventEmitter.on('list:select', () => {
      this.deactivate();
    });

    this.eventEmitter.on('keyboard:cancel', () => {
      this.deactivate();
    });

    document.addEventListener('click', (event) => {
      if (this.root && !this.root.contains(event.target)) {
        this.deactivate();
      }
    });

    chrome.runtime.connect().onDisconnect.addListener(() => { this.destroy(); });
  }

  activate () {
    if (this.active) return;

    this.getTabs(() => {
      this.render();
    });
    this.active = true;
  }

  deactivate () {
    if (!this.active) return;

    this.eventEmitter.emit('display:deactivate');
    document.body.removeChild(this.root);
    this.list.deactivate();
    this.root = undefined;
    this.shadowRoot = undefined;
    this.options = undefined;
    this.tabs = undefined;
    this.active = false;
  }

  destroy () {
    this.deactivate();
    this.removeStylesheet();
    delete this.eventEmitter;
    delete this.active;
    delete this.stylesheetId;
    delete this.root;
    delete this.shadowRoot;
    delete this.options;
    delete this.tabs;
  }

  getTabs (cb) {
    chrome.runtime.sendMessage({ tabs: true }, (response) => {
      this.tabs = response.tabs;
      cb();
    });
  }

  addStylesheet () {
    let style = document.createElement('style');
    style.id = this.stylesheetId;
    style.appendChild(document.createTextNode('@import "' + chrome.extension.getURL('styles/main.css') + '";'));
    this.shadowRoot.prepend(style);
  }

  removeStylesheet () {
    let existingStyle = document.getElementById(this.stylesheetId);
    if (existingStyle) {
      document.head.removeChild(existingStyle);
    }
  }

  toggleOptions () {
    if (this.options && this.options.active) {
      this.deactivateOptions();
    } else {
      this.activateOptions();
    }
  }

  activateOptions () {
    if (this.options && this.options.active) return;

    let element = this.shadowRoot.querySelector('.TAS_optionsCon');
    element.classList.add('active');
    let icon = this.shadowRoot.querySelector('.TAS_optionsIcon');
    icon.classList.add('active');

    if (!this.options) {
      this.options = new Options(this.eventEmitter);
      element.appendChild(this.options.render());
    } else {
      this.options.activate();
    }

    this.eventEmitter.emit('display:options');
  }

  deactivateOptions () {
    if (!this.options.active) return;

    let element = this.shadowRoot.querySelector('.TAS_optionsCon');
    element.classList.remove('active');
    let icon = this.shadowRoot.querySelector('.TAS_optionsIcon');
    icon.classList.remove('active');
    this.options.deactivate();
  }

  shadow () {
    return this.root.attachShadow({ mode: 'open' });
  }

  render () {
    this.root = document.createElement('div');
    this.root.classList.add('TAS_displayCon');
    let shadow = this.shadow();

    let root = document.createElement('div');
    root.classList.add('TAS_display');
    root.innerHTML = template();
    shadow.appendChild(root);

    shadow.querySelector('.TAS_listCon').appendChild(this.list.render(this.tabs));
    shadow.querySelector('.TAS_searchCon').appendChild(this.search.render(this.tabs, this.list));

    shadow.querySelector('.TAS_displayControlClose').addEventListener('click', () => {
      this.deactivate();
    });

    shadow.querySelector('.TAS_optionsControl').addEventListener('click', () => {
      this.toggleOptions();
    });

    this.shadowRoot = shadow;

    this.addStylesheet();

    document.body.appendChild(this.root);
  }
}
