import EventEmitter from 'events';
import Keyboard from './lib/keyboard';
import Display from './lib/display';

let eventEmitter = new EventEmitter();
new Keyboard(eventEmitter);
new Display(eventEmitter);
