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

  save() {
    let keyModifier = this.root.querySelector('.TAS_keyModifier').textContent;
    let keyNext = this.root.querySelector('.TAS_keyNext').textContent;
    let keyPrevious = this.root.querySelector('.TAS_keyPrevious').textContent;
    let status = this.root.querySelector('.TAS_status');
    chrome.storage.sync.set({
      keys: {
        modifier: keyModifier,
        next: keyNext,
        previous: keyPrevious
      }
    }, () => {
      status.textContent = 'options saved';
      status.classList.add('active');
      setTimeout(() => {
        status.classList.remove('active');
      }, 3000);
    });
  }

  recordKeyStart(element) {
    this.recordingElement = element;
    document.removeEventListener('keydown', this.keyListener);
    document.addEventListener('keydown', this.keyListener);
  }

  recordKeyStop() {
    document.removeEventListener('keydown', this.keyListener);
    this.recordingElement = undefined;
  }

  render() {
    this.root = document.createElement('div');
    this.root.classList.add('TAS_options');

    chrome.storage.sync.get(defaultOptions, (storage) => {
      this.root.innerHTML = template({ modifier: storage.keys.modifier, next: storage.keys.next, previous: storage.keys.previous });

      this.keyListener = (event) => {
        event.preventDefault();
        this.recordingElement.textContent = characterFromEvent(event);
        this.recordKeyStop();
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
