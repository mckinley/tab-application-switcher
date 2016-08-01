import defaultOptions from './default-options.json';
import template from '~/app/templates/options.hbs';

export default class Options {

  constructor(eventEmitter) {
    this.eventEmitter = eventEmitter;
    this.root;
  }

  save() {
    let keyModifier = this.root.querySelector('#key-modifier').value;
    let keyNext = this.root.querySelector('#key-next').value;
    let keyPrevious = this.root.querySelector('#key-previous').value;
    let status = this.root.querySelector('#status');
    chrome.storage.sync.set({
      keys: {
        modifier: keyModifier,
        next: keyNext,
        previous: keyPrevious
      }
    }, () => {
      status.textContent = 'Options saved.';
      setTimeout(function() {
        status.textContent = '';
      }, 2000);
    });
  }

  render() {
    this.root = document.createElement('div');
    this.root.classList.add('TAS_options');
    this.root.innerHTML = template();

    chrome.storage.sync.get(defaultOptions, (storage) => {
      this.root.querySelector('#key-modifier').value = storage.keys.modifier;
      this.root.querySelector('#key-next').value = storage.keys.next;
      this.root.querySelector('#key-previous').value = storage.keys.previous;
    });
    this.root.querySelector('#save').addEventListener('click', () => {
      this.save();
    });

    return this.root;
  }
}
