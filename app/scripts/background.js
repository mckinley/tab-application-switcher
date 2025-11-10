import EventEmitter from 'events'
import Tabs from './lib/background/tabs'
import Omnibox from './lib/background/omnibox'
import Connection from './lib/background/connection'
import FaviconPreloader from './lib/background/favicon-preloader'
import Reloader from './lib/background/reloader' // dev

const eventEmitter = new EventEmitter()
/* eslint-disable no-new */
new Tabs(eventEmitter)
new Omnibox(eventEmitter)
new FaviconPreloader(eventEmitter)
new Connection()
new Reloader() // dev
