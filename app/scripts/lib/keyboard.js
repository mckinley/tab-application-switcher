import defaultOptions from './default-options.json';
import mousetrap from 'mousetrap';

export default class Keyboard {

  constructor(eventEmitter){
    this.eventEmitter = eventEmitter;
    this.active = false;
    this.keys;

    chrome.storage.onChanged.addListener((changes, _namespace) => {
      if(changes.keys.newValue){
        this.updateKeys(changes.keys.newValue);
      }
    });

    chrome.storage.sync.get(defaultOptions, (storage) => {
      if(storage.keys){
        this.initKeys(storage.keys);
      }
    });

    chrome.runtime.connect().onDisconnect.addListener(() => { this.destroy(); });
  }

  activate() {
    mousetrap.bind(this.keys.previous, () => {
      this.eventEmitter.emit('keyboard:previous');
      return false;
    });

    mousetrap.bind(this.keys.select, () => {
      this.eventEmitter.emit('keyboard:select');
      this.select();
      return false;
    });

    mousetrap.bind(this.keys.modifier, () => {
      this.eventEmitter.emit('keyboard:select');
      this.select();
      return false;
    }, 'keyup');

    mousetrap.bind(this.keys.cancel, () => {
      this.eventEmitter.emit('keyboard:cancel');
      return false;
    });
  }

  deactivate() {
    mousetrap.unbind(this.keys.previous);
    mousetrap.unbind(this.keys.select);
    mousetrap.unbind(this.keys.modifier, 'keyup');
    mousetrap.unbind(this.keys.cancel);
    this.active = false;
  }

  destroy() {
    if (this.active) {
      this.deactivate();
    }
    mousetrap.unbind(this.keys.next);
    this.eventEmitter = undefined;
    this.keys = undefined;
  }

  initKeys(value) {
    this.keys = value;

    let k = this.keys;
    let m = this.keys.modifier;

    k.next = m + '+' + k.next;
    k.previous = m + '+' + k.previous;
    k.select = m + '+' + 'enter';
    k.cancel = m + '+' + 'esc';

    mousetrap.bind(this.keys.next, () => {
      this.eventEmitter.emit('keyboard:next');
      this.next();
      return false;
    });
  }

  updateKeys(value){
    if (this.active) {
      this.deactivate();
    }
    mousetrap.unbind(this.keys.next);
    this.initKeys(value);
  }

  next() {
    if (!this.active) {
      this.activate();
    }
  }

  select() {
    this.deactivate();
  }
}
