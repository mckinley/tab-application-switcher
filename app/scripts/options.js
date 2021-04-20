import EventEmitter from 'events'
import Options from './lib/content/options'

const eventEmitter = new EventEmitter()
const options = new Options(eventEmitter)
document.querySelector('.TAS_optionsCon').appendChild(options.render())
