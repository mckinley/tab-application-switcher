import '../../../../test/helper.js'
import Display from '../../../../app/scripts/lib/content/display.js'
import EventEmitter from 'events'

describe('export', () => {
  it('exists', () => {
    expect(Display).to.be.a('function')
  })
})

xdescribe('render', () => {
  it('only selects tab once after multiple renders', () => {
    chrome.reset()

    const eventEmitter = new EventEmitter()
    const display = new Display(eventEmitter)

    display.getTabs = (cb) => {
      display.tabs = [{ id: 1 }]
      cb()
    }

    // display.shadow = () => {
    //   return document.createElement('div');
    // };

    display.activate()
    eventEmitter.emit('keyboard:select')
    display.activate()
    eventEmitter.emit('keyboard:select')
    display.activate()
    eventEmitter.emit('keyboard:select')

    expect(chrome.runtime.sendMessage.callCount).equal(3)
  })
})
