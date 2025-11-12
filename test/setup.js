import { beforeAll, afterAll } from 'vitest'
import sinon from 'sinon'
import sinonChrome from 'sinon-chrome'

// Setup chrome mock globally
beforeAll(() => {
  global.chrome = sinonChrome
  global.sinon = sinon

  // Setup default chrome.runtime.connect behavior
  chrome.runtime.connect.returns({
    onDisconnect: {
      addListener: () => {}
    }
  })
})

// Cleanup after all tests
afterAll(() => {
  sinonChrome.flush()
  delete global.chrome
  delete global.sinon
})
