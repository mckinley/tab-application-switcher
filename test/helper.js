import chai from 'chai'
import sinon from 'sinon'
import sinonChrome from 'sinon-chrome'
import 'jsdom-global/register.js'

function setGlobal (property, value) {
  if (global[property] === undefined) {
    global[property] = value
  }
}

before(() => {
  setGlobal('chrome', sinonChrome)
  setGlobal('expect', chai.expect)
  setGlobal('sinon', sinon)

  chrome.runtime.connect.returns({
    onDisconnect: {
      addListener: () => {
      }
    }
  })
})

after(() => {
  sinonChrome.flush()

  delete global.chrome
  delete global.expect
  delete global.sinon
})
