import EventEmitter from 'events';
import Display from './lib/display';

let eventEmitter = new EventEmitter();
new Display(eventEmitter).activate();
