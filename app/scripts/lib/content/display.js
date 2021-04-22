import Options from './options.js'
import Search from './search.js'
import List from './list.js'

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
  constructor (eventEmitter) {
    this.eventEmitter = eventEmitter
    this.active = false
    this.stylesheetId = 'TAS_style'
    this.root = undefined
    this.shadowRoot = undefined
    this.options = undefined
    this.tabs = undefined

    this.list = new List(this.eventEmitter)
    this.search = new Search(this.eventEmitter)

    this.eventEmitter.on('keyboard:activate', () => {
      this.activate()
    })

    this.eventEmitter.on('keyboard:select', () => {
      this.deactivate()
    })

    this.eventEmitter.on('list:select', () => {
      this.deactivate()
    })

    this.eventEmitter.on('keyboard:cancel', () => {
      this.deactivate()
    })

    document.addEventListener('click', (event) => {
      if (this.root && !this.root.contains(event.target)) {
        this.deactivate()
      }
    })

    chrome.runtime.connect().onDisconnect.addListener(() => {
      this.destroy()
    })
  }

  activate () {
    if (this.active) return

    this.getTabs(() => {
      this.render()
    })
    this.active = true
  }

  deactivate () {
    if (!this.active) return

    this.eventEmitter.emit('display:deactivate')
    document.body.removeChild(this.root)
    this.list.deactivate()
    this.root = undefined
    this.shadowRoot = undefined
    this.options = undefined
    this.tabs = undefined
    this.active = false
  }

  destroy () {
    this.deactivate()
    this.removeStylesheet()
    delete this.eventEmitter
    delete this.active
    delete this.stylesheetId
    delete this.root
    delete this.shadowRoot
    delete this.options
    delete this.tabs
  }

  getTabs (cb) {
    chrome.runtime.sendMessage({ tabs: true }, (response) => {
      this.tabs = response.tabs
      cb()
    })
  }

  addStylesheet () {
    const style = document.createElement('style')
    style.id = this.stylesheetId
    style.appendChild(document.createTextNode('@import "' + chrome.extension.getURL('styles/main.css') + '";'))
    this.shadowRoot.prepend(style)
  }

  removeStylesheet () {
    const existingStyle = document.getElementById(this.stylesheetId)
    if (existingStyle) {
      document.head.removeChild(existingStyle)
    }
  }

  toggleOptions () {
    if (this.options && this.options.active) {
      this.deactivateOptions()
    } else {
      this.activateOptions()
    }
  }

  activateOptions () {
    if (this.options && this.options.active) return

    const element = this.shadowRoot.querySelector('.TAS_optionsCon')
    element.classList.add('active')
    const icon = this.shadowRoot.querySelector('.TAS_optionsIcon')
    icon.classList.add('active')

    if (!this.options) {
      this.options = new Options(this.eventEmitter)
      element.appendChild(this.options.render())
    } else {
      this.options.activate()
    }

    this.eventEmitter.emit('display:options')
  }

  deactivateOptions () {
    if (!this.options.active) return

    const element = this.shadowRoot.querySelector('.TAS_optionsCon')
    element.classList.remove('active')
    const icon = this.shadowRoot.querySelector('.TAS_optionsIcon')
    icon.classList.remove('active')
    this.options.deactivate()
  }

  shadow () {
    return this.root.attachShadow({ mode: 'closed' })
  }

  render () {
    this.root = document.createElement('div')
    this.root.classList.add('TAS_displayCon')
    const shadow = this.shadow()

    const root = document.createElement('div')
    root.classList.add('TAS_display')
    root.innerHTML = template
    shadow.appendChild(root)

    shadow.querySelector('.TAS_listCon').appendChild(this.list.render(this.tabs))
    shadow.querySelector('.TAS_searchCon').appendChild(this.search.render(this.tabs, this.list))

    shadow.querySelector('.TAS_displayControlClose').addEventListener('click', () => {
      this.deactivate()
    })

    shadow.querySelector('.TAS_optionsControl').addEventListener('click', () => {
      this.toggleOptions()
    })

    this.shadowRoot = shadow

    this.addStylesheet()

    document.body.appendChild(this.root)
  }
}
