import EventEmitter from 'events';
import Keyboard from './lib/keyboard';
import Display from './lib/display';

let eventEmitter = new EventEmitter();
new Keyboard(eventEmitter).onReady = (k) => { k.activate(); };
new Display(eventEmitter).activate();

eventEmitter.on('display:deactivate', () => {
  window.close();
});
