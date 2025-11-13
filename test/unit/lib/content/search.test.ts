import { describe, it, expect, beforeEach } from 'vitest'
import Search from '../../../../app/scripts/lib/content/search.js'
import List from '../../../../app/scripts/lib/content/list.js'
import type { ICoordinator, Tab } from '../../../../app/scripts/lib/types.js'

describe('Search', () => {
  let mockCoordinator: ICoordinator
  let search: Search
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
    search = new Search(mockCoordinator)
    list = new List(mockCoordinator)
  })

  describe('filterTabs', () => {
    it('shows all tabs when search is empty', () => {
      const tabs: Tab[] = [
        { id: 1, title: 'GitHub', url: 'https://github.com' },
        { id: 2, title: 'Google', url: 'https://google.com' }
      ]

      const listRoot = list.render(tabs)
      const searchRoot = search.render(list.tabs!, list)
      document.body.appendChild(listRoot)
      document.body.appendChild(searchRoot)

      // Filter with empty string
      search.filterTabs('')

      // All tabs should be visible
      list.tabs!.forEach((tab) => {
        expect((tab.tabCon as HTMLElement).style.display).toBe('block')
      })

      document.body.removeChild(listRoot)
      document.body.removeChild(searchRoot)
    })

    it('filters tabs by exact title match', () => {
      const tabs: Tab[] = [
        { id: 1, title: 'GitHub', url: 'https://github.com' },
        { id: 2, title: 'Google', url: 'https://google.com' },
        { id: 3, title: 'GitLab', url: 'https://gitlab.com' }
      ]

      const listRoot = list.render(tabs)
      const searchRoot = search.render(list.tabs!, list)
      document.body.appendChild(listRoot)
      document.body.appendChild(searchRoot)

      // Search for "GitHub"
      search.filterTabs('GitHub')

      // Only GitHub tab should be visible
      expect((list.tabs![0].tabCon as HTMLElement).style.display).toBe('block')
      expect((list.tabs![1].tabCon as HTMLElement).style.display).toBe('none')
      expect((list.tabs![2].tabCon as HTMLElement).style.display).toBe('none')

      document.body.removeChild(listRoot)
      document.body.removeChild(searchRoot)
    })

    it('filters tabs by URL match', () => {
      const tabs: Tab[] = [
        { id: 1, title: 'GitHub', url: 'https://github.com' },
        { id: 2, title: 'Google', url: 'https://google.com' }
      ]

      const listRoot = list.render(tabs)
      const searchRoot = search.render(list.tabs!, list)
      document.body.appendChild(listRoot)
      document.body.appendChild(searchRoot)

      // Search by URL
      search.filterTabs('github.com')

      // Only GitHub tab should be visible
      expect((list.tabs![0].tabCon as HTMLElement).style.display).toBe('block')
      expect((list.tabs![1].tabCon as HTMLElement).style.display).toBe('none')

      document.body.removeChild(listRoot)
      document.body.removeChild(searchRoot)
    })

    it('supports fuzzy matching with typos', () => {
      const tabs: Tab[] = [
        { id: 1, title: 'GitHub Repository', url: 'https://github.com' },
        { id: 2, title: 'Google Search', url: 'https://google.com' }
      ]

      const listRoot = list.render(tabs)
      const searchRoot = search.render(list.tabs!, list)
      document.body.appendChild(listRoot)
      document.body.appendChild(searchRoot)

      // Search with typo: "gihub" instead of "github"
      search.filterTabs('gihub')

      // GitHub should still match due to fuzzy search
      expect((list.tabs![0].tabCon as HTMLElement).style.display).toBe('block')

      document.body.removeChild(listRoot)
      document.body.removeChild(searchRoot)
    })

    it('highlights first matching tab', () => {
      const tabs: Tab[] = [
        { id: 1, title: 'GitHub', url: 'https://github.com' },
        { id: 2, title: 'Google', url: 'https://google.com' }
      ]

      const listRoot = list.render(tabs)
      const searchRoot = search.render(list.tabs!, list)
      document.body.appendChild(listRoot)
      document.body.appendChild(searchRoot)

      // Search for GitHub
      search.filterTabs('GitHub')

      // First matching tab should be highlighted
      expect(list.cursor).toBe(0)

      document.body.removeChild(listRoot)
      document.body.removeChild(searchRoot)
    })

    it('hides all tabs when no matches found', () => {
      const tabs: Tab[] = [
        { id: 1, title: 'GitHub', url: 'https://github.com' },
        { id: 2, title: 'Google', url: 'https://google.com' }
      ]

      const listRoot = list.render(tabs)
      const searchRoot = search.render(list.tabs!, list)
      document.body.appendChild(listRoot)
      document.body.appendChild(searchRoot)

      // Search for something that doesn't exist
      search.filterTabs('xyzabc123notfound')

      // All tabs should be hidden
      list.tabs!.forEach((tab) => {
        expect((tab.tabCon as HTMLElement).style.display).toBe('none')
      })

      document.body.removeChild(listRoot)
      document.body.removeChild(searchRoot)
    })
  })
})

