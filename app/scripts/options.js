import EventEmitter from 'events';
import Options from './lib/options';

let eventEmitter = new EventEmitter();
let options = new Options(eventEmitter);
document.querySelector('.TAS_optionsCon').appendChild(options.render());
