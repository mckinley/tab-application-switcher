import defaultOptions from './../default-options.json';
import Combokeys from 'combokeys';

export default class Keyboard {

  constructor(eventEmitter) {
    this.eventEmitter = eventEmitter;
    this.active = false;
    this.onReady;
    this.keys;
    this.keyBinder = new Combokeys(document);
    this.activateKeyBinder = new Combokeys(document);

    this.eventEmitter.on('display:search', () => {
      this.keyBinder.unbind(this.keys.modifier, 'keyup');
    });

    this.eventEmitter.on('display:options', () => {
      this.keyBinder.unbind(this.keys.modifier, 'keyup');
    });

    this.eventEmitter.on('display:deactivate', () => {
      this.deactivate();
    });

    chrome.storage.onChanged.addListener((changes, _namespace) => {
      if (changes.keys.newValue) {
        this.updateKeys(changes.keys.newValue);
      }
    });

    chrome.storage.sync.get(defaultOptions, (storage) => {
      if (storage.keys) {
        this.initKeys(storage.keys);
      }
    });

    chrome.runtime.connect().onDisconnect.addListener(() => { this.destroy(); });
  }

  ready() {
    if(this.onReady){
      this.onReady(this);
      delete this.onReady;
    }
  }

  activate() {
    if (this.active) return;

    this.bindKeyset(this.keys.next, () => {
      event.stopPropagation();
      this.eventEmitter.emit('keyboard:next');
    });

    this.bindKeyset(this.keys.previous, () => {
      event.stopPropagation();
      this.eventEmitter.emit('keyboard:previous');
    });

    this.bindKeyset(this.keys.select, () => {
      event.stopPropagation();
      this.eventEmitter.emit('keyboard:select');
      this.deactivate();
    });

    this.bindKeyset(this.keys.cancel, () => {
      event.stopPropagation();
      this.eventEmitter.emit('keyboard:cancel');
      this.deactivate();
    });

    this.keyBinder.bind(this.keys.modifier, () => {
      event.stopPropagation();
      this.eventEmitter.emit('keyboard:select');
      this.deactivate();
    }, 'keyup');

    this.activateKeyBinder.unbind(this.keys.activate);

    this.active = true;
  }

  deactivate() {
    if (!this.active) return;

    this.unbindKeyset(this.keys.next);
    this.unbindKeyset(this.keys.previous);
    this.unbindKeyset(this.keys.select);
    this.unbindKeyset(this.keys.cancel);
    this.keyBinder.unbind(this.keys.modifier, 'keyup');

    this.activateKeyBinder.bind(this.keys.activate, () => {
      event.stopPropagation();
      this.eventEmitter.emit('keyboard:activate');
      this.activate();
    });

    this.active = false;
  }

  destroy() {
    this.deactivate();
    this.activateKeyBinder.unbind(this.keys.activate);
    delete this.eventEmitter;
    delete this.active;
    delete this.onReady;
    delete this.keys;
    delete this.keyBinder;
    delete this.activateKeyBinder;
  }

  bindKeyset(keyset, cb) {
    keyset.forEach((k) => {
      this.keyBinder.bind(k, cb);
    });
  }

  unbindKeyset(keyset) {
    keyset.forEach((k) => {
      this.keyBinder.unbind(k);
    });
  }

  initKeys(value) {
    this.keys = value;

    let k = this.keys;
    let m = this.keys.modifier;

    k.activate = m + '+' + k.next;
    k.next = [k.activate, m + '+' + 'down', 'down'];
    k.previous = [m + '+' + k.previous, m + '+' + 'up', 'up'];
    k.select = [m + '+' + 'enter', 'enter'];
    k.cancel = [m + '+' + 'esc', 'esc'];

    this.activateKeyBinder.bind(k.activate, () => {
      event.stopPropagation();
      this.eventEmitter.emit('keyboard:activate');
      this.activate();
    });

    this.ready();
  }

  updateKeys(value) {
    this.deactivate();
    this.keyBinder.unbind(this.keys.next);
    this.initKeys(value);
  }
}
