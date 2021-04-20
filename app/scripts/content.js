import EventEmitter from 'events'
import Keyboard from './lib/content/keyboard'
import Display from './lib/content/display'

EventEmitter.defaultMaxListeners = 1000
const eventEmitter = new EventEmitter()
/* eslint-disable no-new */
new Keyboard(eventEmitter)
new Display(eventEmitter)
