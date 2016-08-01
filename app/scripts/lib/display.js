import template from '~/app/templates/display.hbs';
import Options from './options';
import Search from './search';
import List from './list';

export default class Display {

  constructor(eventEmitter) {
    this.eventEmitter = eventEmitter;
    this.active = false;
    this.stylesheetId = 'TAS_style';
    this.root;
    this.tabs;

    this.eventEmitter.on('keyboard:activate', () => {
      this.activate();
    });

    this.eventEmitter.on('keyboard:select', () => {
      this.deactivate();
    });

    this.eventEmitter.on('keyboard:cancel', () => {
      this.deactivate();
    });

    this.addStylesheet();

    chrome.runtime.connect().onDisconnect.addListener(() => { this.destroy(); });
  }

  activate() {
    if (this.active) return;

    this.getTabs(() => {
      this.render();
    });
    this.active = true;
  }

  deactivate() {
    if (!this.active) return;

    this.eventEmitter.emit('display:deactivate');
    document.body.removeChild(this.root);
    this.root = undefined;
    this.tabs = undefined;
    this.active = false;
  }

  destroy() {
    this.deactivate();
    this.removeStylesheet();
    delete this.eventEmitter;
    delete this.active;
    delete this.stylesheetId;
    delete this.root;
    delete this.tabs;
  }

  getTabs(cb) {
    chrome.runtime.sendMessage({ tabs: true }, (response) => {
      this.tabs = response.tabs;
      cb();
    });
  }

  addStylesheet() {
    let style = document.createElement('style');
    style.id = this.stylesheetId;
    style.appendChild(document.createTextNode('@import "' + chrome.extension.getURL('styles/main.css') + '";'));
    document.head.appendChild(style);
  }

  removeStylesheet() {
    let existingStyle = document.getElementById(this.stylesheetId);
    if (existingStyle) {
      document.head.removeChild(existingStyle);
    }
  }

  render() {
    this.root = document.createElement('div');
    this.root.classList.add('TAS_displayCon');
    let shadow = this.root.createShadowRoot();
    document.body.appendChild(this.root);

    let root = document.createElement('div');
    root.classList.add('TAS_display');
    root.innerHTML = template();
    shadow.appendChild(root);

    let list = new List(this.eventEmitter, this.tabs);
    shadow.querySelector('.TAS_listCon').appendChild(list.render());

    let search = new Search(this.eventEmitter, this.tabs, list);
    shadow.querySelector('.TAS_searchCon').appendChild(search.render());

    let options = new Options(this.eventEmitter);
    shadow.querySelector('.TAS_optionsCon').appendChild(options.render());
  }
}
