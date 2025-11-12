import { describe, it, expect } from 'vitest'
import Keyboard from '../../../../app/scripts/lib/content/keyboard.js'
import defaultOptions from '../../../../app/scripts/lib/default-options.js'
import type { ICoordinator } from '../../../../app/scripts/lib/types.js'

describe('Keyboard', () => {
  describe('initKeys', () => {
    function platform(value: string): void {
      Object.defineProperty(navigator, 'platform', {
        value,
        configurable: true
      })
    }

    // Mock coordinator
    const mockCoordinator: ICoordinator = {
      handleActivate: () => {},
      handleNext: () => {},
      handlePrevious: () => {},
      handleSelect: () => {},
      handleCancel: () => {},
      handleDeactivate: () => {},
      handleSearch: () => {},
      handleShowOptions: () => {},
      getTabs: () => Promise.resolve([]),
      selectTab: () => {},
      destroy: () => {}
    }

    it('sets windows keys from storage', () => {
      platform('Win32')
      const keyboard = new Keyboard(mockCoordinator)
      keyboard.initKeys(defaultOptions.keys)
      expect(keyboard.keys).toEqual({
        modifier: 'meta',
        next: ['meta+tab', 'meta+down', 'down'],
        previous: ['meta+`', 'meta+up', 'up'],
        activate: 'meta+tab',
        select: ['meta+enter', 'enter'],
        cancel: ['meta+esc', 'meta+q', 'esc']
      })
    })

    it('sets mac keys from storage', () => {
      platform('MacIntel')
      const keyboard = new Keyboard(mockCoordinator)
      keyboard.initKeys(defaultOptions.keys)
      expect(keyboard.keys).toEqual({
        modifier: 'alt',
        next: ['alt+tab', 'alt+down', 'down'],
        previous: ['alt+`', 'alt+up', 'up'],
        activate: 'alt+tab',
        select: ['alt+enter', 'enter'],
        cancel: ['alt+esc', 'alt+q', 'esc']
      })
    })
  })
})
