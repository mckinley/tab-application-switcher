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
  <svg class="TAS_displayIconClose" viewBox="0 0 32 32" title="close">
    <polygon points="23.778,5.393 16,13.172 8.222,5.393 5.393,8.222 13.172,16 5.393,23.778 8.222,26.607 16,18.828 23.778,26.607 26.607,23.778 18.828,16 26.607,8.222"></polygon>
  </svg>
</div>
<div class="TAS_optionsControl">
  <svg class="TAS_optionsIcon" viewBox="0 0 32 32" title="options">
    <path d="M29.181 19.070c-1.679-2.908-0.669-6.634 2.255-8.328l-3.145-5.447c-0.898 0.527-1.943 0.829-3.058 0.829-3.361 0-6.085-2.742-6.085-6.125h-6.289c0.008 1.044-0.252 2.103-0.811 3.070-1.679 2.908-5.411 3.897-8.339 2.211l-3.144 5.447c0.905 0.515 1.689 1.268 2.246 2.234 1.676 2.903 0.672 6.623-2.241 8.319l3.145 5.447c0.895-0.522 1.935-0.82 3.044-0.82 3.35 0 6.067 2.725 6.084 6.092h6.289c-0.003-1.034 0.259-2.080 0.811-3.038 1.676-2.903 5.399-3.894 8.325-2.219l3.145-5.447c-0.899-0.515-1.678-1.266-2.232-2.226zM16 22.479c-3.578 0-6.479-2.901-6.479-6.479s2.901-6.479 6.479-6.479c3.578 0 6.479 2.901 6.479 6.479s-2.901 6.479-6.479 6.479z"></path>
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

    chrome.runtime.connect().onDisconnect.addListener(() => { this.destroy() })
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
    return this.root.attachShadow({ mode: 'open' })
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
