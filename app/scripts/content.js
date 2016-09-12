import EventEmitter from 'events';
import Keyboard from './lib/content/keyboard';
import Display from './lib/content/display';

EventEmitter.defaultMaxListeners = 1000;
let eventEmitter = new EventEmitter();
new Keyboard(eventEmitter);
new Display(eventEmitter);
