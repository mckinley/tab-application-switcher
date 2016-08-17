import defaultOptions from './../default-options.json';
import template from '~/app/templates/options.hbs';
import characterFromEvent from 'combokeys/helpers/characterFromEvent';

export default class Options {

  constructor(eventEmitter) {
    this.eventEmitter = eventEmitter;
    this.active = false;
    this.keyListener;
    this.recordingElement;
    this.root;
    this.os = navigator.platform.indexOf('Mac') > -1 ? 'mac' : 'windows';
  }

  activate() {
    if (this.active) return;

    this.active = true;
  }

  deactivate() {
    if (!this.active) return;

    this.recordKeyStop();
    this.active = false;
  }

  storageObject() {
    let keyModifier = this.root.querySelector('.TAS_keyModifier').textContent;
    let keyNext = this.root.querySelector('.TAS_keyNext').textContent;
    let keyPrevious = this.root.querySelector('.TAS_keyPrevious').textContent;
    let options = {
      modifier: keyModifier,
      next: keyNext,
      previous: keyPrevious
    };

    let storage = { keys: {} };
    storage.keys[this.os] = options;

    return storage;
  }

  save() {
    let status = this.root.querySelector('.TAS_status');
    this.recordKeyStop();
    chrome.storage.sync.set(this.storageObject(), () => {
      status.textContent = 'options saved';
      status.classList.add('active');
      setTimeout(() => {
        status.classList.remove('active');
      }, 3000);
    });
  }

  recordKeyStart(element) {
    this.recordKeyStop();
    this.recordingElement = element;
    this.recordingElement.classList.add('recording');
    this.recordingElement.addEventListener('keydown', this.keyListener);
  }

  recordKeyStop() {
    if (!this.recordingElement) return;
    this.recordingElement.removeEventListener('keydown', this.keyListener);
    this.recordingElement.classList.remove('recording');
    this.recordingElement = undefined;
  }

  render() {
    this.root = document.createElement('div');
    this.root.classList.add('TAS_options');

    chrome.storage.sync.get(defaultOptions, (storage) => {
      let keys = storage.keys[this.os];
      this.root.innerHTML = template({
        modifier: chrome.i18n.getMessage('modifier'),
        next: chrome.i18n.getMessage('next'),
        previous: chrome.i18n.getMessage('previous'),
        save: chrome.i18n.getMessage('save'),
        modifierKey: keys.modifier,
        nextKey: keys.next,
        previousKey: keys.previous
      });

      this.keyListener = (event) => {
        this.recordingElement.textContent = characterFromEvent(event);
        this.recordKeyStop();
        return false;
      };

      let keyModifier = this.root.querySelector('.TAS_keyModifier');
      keyModifier.addEventListener('click', () => {
        this.recordKeyStart(keyModifier);
      });

      let keyNext = this.root.querySelector('.TAS_keyNext');
      keyNext.addEventListener('click', () => {
        this.recordKeyStart(keyNext);
      });

      let keyPrevious = this.root.querySelector('.TAS_keyPrevious');
      keyPrevious.addEventListener('click', () => {
        this.recordKeyStart(keyPrevious);
      });

      let save = this.root.querySelector('.TAS_save');
      save.addEventListener('click', () => {
        this.save();
      });

      this.activate();
    });

    return this.root;
  }
}
