import EventEmitter from 'events'
import Keyboard from './lib/content/keyboard'
import Display from './lib/content/display'
// Import CSS - Vite will bundle it as a string we can inject
import mainCss from '../styles/main.css?inline'

EventEmitter.defaultMaxListeners = 1000
const eventEmitter = new EventEmitter()

new Keyboard(eventEmitter)
new Display(eventEmitter, mainCss)
