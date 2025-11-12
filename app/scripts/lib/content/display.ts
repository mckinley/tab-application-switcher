import Options from './options.js'
import Search from './search.js'
import List from './list.js'
import type { ICoordinator, Tab } from '../types.js'

const template = `
<style>
  .TAS_optionsIcon {
    width: 0;
  }

  .TAS_displayIconClose {
    width: 0;
  }
</style>

<div class="TAS_displayControlClose">
  <svg class="TAS_displayIconClose" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
  </svg>
</div>
<div class="TAS_optionsControl">
  <svg class="TAS_optionsIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
  </svg>
</div>
<div class="TAS_optionsCon"></div>
<div class="TAS_searchCon"></div>
<div class="TAS_listCon"></div>
`

export default class Display {
  coordinator: ICoordinator
  cssString: string
  active: boolean
  stylesheetId: string
  root?: HTMLDivElement
  shadowRoot?: ShadowRoot
  options?: Options
  tabs?: Tab[]
  list: List
  search: Search
  private clickListener: (event: MouseEvent) => void

  constructor(coordinator: ICoordinator, cssString: string) {
    this.coordinator = coordinator
    this.cssString = cssString
    this.active = false
    this.stylesheetId = 'TAS_style'
    this.root = undefined
    this.shadowRoot = undefined
    this.options = undefined
    this.tabs = undefined

    this.list = new List(this.coordinator)
    this.search = new Search(this.coordinator)

    // Store the click listener so we can remove it on destroy
    this.clickListener = (event: MouseEvent) => {
      if (this.root && !this.root.contains(event.target as Node)) {
        this.coordinator.handleDeactivate()
      }
    }
    document.addEventListener('click', this.clickListener)
  }

  async activate(): Promise<void> {
    if (this.active) return

    try {
      this.tabs = await this.coordinator.getTabs()
      this.render()
      this.active = true
    } catch (error) {
      console.error('Failed to activate display:', error)
    }
  }

  deactivate(): void {
    if (!this.active) return

    if (this.root) {
      document.body.removeChild(this.root)
    }
    this.list.deactivate()
    this.root = undefined
    this.shadowRoot = undefined
    this.options = undefined
    this.tabs = undefined
    this.active = false
  }

  destroy(): void {
    if (this.active) {
      this.deactivate()
    }
    this.removeStylesheet()

    // Remove document click listener
    document.removeEventListener('click', this.clickListener)
  }

  addStylesheet(): void {
    if (!this.shadowRoot) return

    const style = document.createElement('style')
    style.id = this.stylesheetId
    // Inject the CSS string directly into the shadow DOM
    style.textContent = this.cssString
    this.shadowRoot.prepend(style)
  }

  removeStylesheet(): void {
    const existingStyle = document.getElementById(this.stylesheetId)
    if (existingStyle && existingStyle.parentNode) {
      existingStyle.parentNode.removeChild(existingStyle)
    }
  }

  toggleOptions(): void {
    if (this.options?.active) {
      this.deactivateOptions()
    } else {
      this.activateOptions()
    }
  }

  activateOptions(): void {
    if (!this.shadowRoot) return
    if (this.options?.active) return

    const element = this.shadowRoot.querySelector('.TAS_optionsCon')
    if (!element) return
    element.classList.add('active')

    const icon = this.shadowRoot.querySelector('.TAS_optionsIcon')
    if (icon) {
      icon.classList.add('active')
    }

    if (!this.options) {
      this.options = new Options(this.coordinator)
      element.appendChild(this.options.render())
    } else {
      this.options.activate()
    }

    this.coordinator.handleShowOptions()
  }

  deactivateOptions(): void {
    if (!this.shadowRoot || !this.options) return
    if (!this.options.active) return

    const element = this.shadowRoot.querySelector('.TAS_optionsCon')
    if (element) {
      element.classList.remove('active')
    }

    const icon = this.shadowRoot.querySelector('.TAS_optionsIcon')
    if (icon) {
      icon.classList.remove('active')
    }

    this.options.deactivate()
  }

  shadow(): ShadowRoot {
    if (!this.root) {
      throw new Error('Root element not initialized')
    }
    return this.root.attachShadow({ mode: 'closed' })
  }

  render(): void {
    if (!this.tabs) return

    this.root = document.createElement('div')
    this.root.classList.add('TAS_displayCon')
    const shadow = this.shadow()

    const root = document.createElement('div')
    root.style.display = 'none'
    root.classList.add('TAS_display')
    root.innerHTML = template
    shadow.appendChild(root)

    const listCon = shadow.querySelector('.TAS_listCon')
    if (listCon) {
      listCon.appendChild(this.list.render(this.tabs))
    }

    const searchCon = shadow.querySelector('.TAS_searchCon')
    if (searchCon) {
      searchCon.appendChild(this.search.render(this.tabs, this.list))
    }

    const closeControl = shadow.querySelector('.TAS_displayControlClose')
    if (closeControl) {
      closeControl.addEventListener('click', () => {
        this.coordinator.handleDeactivate()
      })
    }

    const optionsControl = shadow.querySelector('.TAS_optionsControl')
    if (optionsControl) {
      optionsControl.addEventListener('click', () => {
        this.toggleOptions()
      })
    }

    this.shadowRoot = shadow

    this.addStylesheet()

    document.body.appendChild(this.root)
  }
}
