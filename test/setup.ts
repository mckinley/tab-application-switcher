import { beforeAll, afterAll } from 'vitest'
import * as sinonLib from 'sinon'
import sinonChromeLib from 'sinon-chrome'

// Setup chrome mock globally
beforeAll(() => {
  // @ts-expect-error - sinon-chrome doesn't match exact chrome type
  global.chrome = sinonChromeLib
  global.sinon = sinonLib

  // Setup default chrome.runtime.connect behavior
  // @ts-expect-error - sinon-chrome stub doesn't match exact Port type
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  chrome.runtime.connect.returns({
    onDisconnect: {
      addListener: () => {}
    }
  })
})

// Cleanup after all tests
afterAll(() => {
  sinonChromeLib.flush()
  // @ts-expect-error - cleanup
  delete global.chrome
  // @ts-expect-error - cleanup
  delete global.sinon
})
