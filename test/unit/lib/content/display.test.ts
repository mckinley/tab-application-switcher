import { describe, it, expect } from 'vitest'
import Display from '../../../../app/scripts/lib/content/display.js'

describe('export', () => {
  it('exists', () => {
    expect(Display).toBeTypeOf('function')
  })
})

describe.skip('render', () => {
  it('only selects tab once after multiple renders', async () => {
    // @ts-expect-error - sinon-chrome provides reset method
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    chrome.reset()

    // Mock coordinator
    const mockCoordinator = {
      getTabs: () => Promise.resolve([{ id: 1 }]),
      selectTab: () => {},
      handleDeactivate: () => {},
      handleActivate: () => {},
      handleNext: () => {},
      handlePrevious: () => {},
      handleSelect: () => {},
      handleCancel: () => {},
      handleSearch: () => {},
      handleShowOptions: () => {},
      destroy: () => {}
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const display = new Display(mockCoordinator as any, '')

    await display.activate()
    mockCoordinator.handleDeactivate()
    await display.activate()
    mockCoordinator.handleDeactivate()
    await display.activate()
    mockCoordinator.handleDeactivate()

    // @ts-expect-error - sinon-chrome stub provides callCount
    expect(chrome.runtime.sendMessage.callCount).toBe(3)
  })
})
