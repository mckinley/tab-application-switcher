import EventEmitter from 'events';
import Tabs from './lib/tabs';
import Omnibox from './lib/omnibox';
import Connection from './lib/connection';
import Reloader from './lib/reloader';


let eventEmitter = new EventEmitter();
new Omnibox(eventEmitter);
new Tabs(eventEmitter);

new Connection();
new Reloader();
