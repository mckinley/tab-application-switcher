import EventEmitter from 'events';
import Keyboard from './lib/content/keyboard';
import Display from './lib/content/display';

let eventEmitter = new EventEmitter();
new Keyboard(eventEmitter);
new Display(eventEmitter);
