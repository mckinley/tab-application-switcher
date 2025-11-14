import { describe, it, expect, beforeEach } from 'vitest'
import List from '../../../../app/scripts/lib/content/list.js'
import type { ICoordinator, Tab } from '../../../../app/scripts/lib/types.js'

describe('List', () => {
  let mockCoordinator: ICoordinator
  let list: List

  beforeEach(() => {
    mockCoordinator = {
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
    list = new List(mockCoordinator)
  })

  describe('highlightNextTab', () => {
    it('wraps from last tab to first tab', () => {
      const tabs: Tab[] = [
        { id: 1, title: 'Tab 1', url: 'http://example.com/1' },
        { id: 2, title: 'Tab 2', url: 'http://example.com/2' },
        { id: 3, title: 'Tab 3', url: 'http://example.com/3' }
      ]

      const root = list.render(tabs)
      document.body.appendChild(root)

      // Start at last tab
      list.cursor = 2
      list.highlightTab(list.tabs![2])

      // Next should wrap to first
      list.highlightNextTab()
      expect(list.cursor).toBe(0)

      document.body.removeChild(root)
    })

    it('skips hidden tabs when searching', () => {
      const tabs: Tab[] = [
        { id: 1, title: 'Tab 1', url: 'http://example.com/1' },
        { id: 2, title: 'Tab 2', url: 'http://example.com/2' },
        { id: 3, title: 'Tab 3', url: 'http://example.com/3' }
      ]

      const root = list.render(tabs)
      document.body.appendChild(root)

      // Hide middle tab
      const middleTab = list.tabs![1]
      if (middleTab.tabCon) {
        (middleTab.tabCon as HTMLElement).style.display = 'none'
      }

      // Start at first tab
      list.cursor = 0

      // Next should skip hidden tab and go to third
      list.highlightNextTab()
      expect(list.cursor).toBe(2)

      document.body.removeChild(root)
    })
  })

  describe('highlightPreviousTab', () => {
    it('wraps from first tab to last tab', () => {
      const tabs: Tab[] = [
        { id: 1, title: 'Tab 1', url: 'http://example.com/1' },
        { id: 2, title: 'Tab 2', url: 'http://example.com/2' },
        { id: 3, title: 'Tab 3', url: 'http://example.com/3' }
      ]

      const root = list.render(tabs)
      document.body.appendChild(root)

      // Start at first tab
      list.cursor = 0

      // Previous should wrap to last
      list.highlightPreviousTab()
      expect(list.cursor).toBe(2)

      document.body.removeChild(root)
    })
  })

  describe('render', () => {
    it('escapes malicious tab titles to prevent XSS', () => {
      const tabs: Tab[] = [
        { id: 1, title: '<script>alert("xss")</script>', url: 'http://example.com' }
      ]

      const root = list.render(tabs)

      // The important part: should not have actual script element that could execute
      const scripts = root.querySelectorAll('script')
      expect(scripts.length).toBe(0)

      // The innerHTML should contain escaped HTML entities
      const html = root.innerHTML
      expect(html).toContain('&lt;script&gt;')
      expect(html).toContain('&lt;/script&gt;')
    })
  })
})

