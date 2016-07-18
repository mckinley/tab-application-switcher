import EventEmitter from 'events';
import TabList from './lib/tab-list';
import Omnibox from './lib/omnibox';
import Connection from './lib/connection';
import Reloader from './lib/reloader';


let eventEmitter = new EventEmitter();
new Omnibox(eventEmitter);
new TabList(eventEmitter);

new Connection();
new Reloader();
