import EventEmitter from 'events'
import Tabs from './lib/background/tabs'
import Omnibox from './lib/background/omnibox'
import Connection from './lib/background/connection'

const eventEmitter = new EventEmitter()

new Tabs(eventEmitter)
new Omnibox(eventEmitter)
new Connection()
