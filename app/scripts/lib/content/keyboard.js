import defaultOptions from '../default-options.js'
import Combokeys from 'combokeys'

export default class Keyboard {
  constructor(eventEmitter) {
    this.eventEmitter = eventEmitter
    this.active = false
    this.onReady = undefined
    this.keys = undefined
    this.keyBinder = new Combokeys(document.documentElement)
    this.activateKeyBinder = new Combokeys(document.documentElement)

    this.eventEmitter.on('display:search', () => {
      this.keyBinder.unbind(this.keys.modifier, 'keyup')
    })

    this.eventEmitter.on('display:options', () => {
      this.keyBinder.unbind(this.keys.modifier, 'keyup')
    })

    this.eventEmitter.on('display:deactivate', () => {
      this.deactivate()
    })

    // Store the storage listener so we can remove it on destroy
    this.storageListener = (changes, _namespace) => {
      if (changes.keys.newValue) {
        this.updateKeys(changes.keys.newValue)
      }
    }
    chrome.storage.onChanged.addListener(this.storageListener)

    chrome.storage.sync.get(defaultOptions, (storage) => {
      if (storage.keys) {
        this.initKeys(storage.keys)
      }
    })

    chrome.runtime.connect().onDisconnect.addListener(() => {
      this.destroy()
    })

    // Store the message listener so we can remove it on destroy
    this.messageListener = (request, _sender, sendResponse) => {
      // Respond to ping messages to check if content script is already injected
      if (request.ping) {
        sendResponse({ pong: true })
        return
      }

      if (request.action === 'activate') {
        if (this.active) {
          this.eventEmitter.emit('keyboard:next')
        } else {
          this.eventEmitter.emit('keyboard:activate')
          this.activate()
        }
      }
    }
    chrome.runtime.onMessage.addListener(this.messageListener)
  }

  ready() {
    if (this.onReady) {
      this.onReady(this)
      delete this.onReady
    }
  }

  activate() {
    if (this.active) return

    document.activeElement.blur()

    this.bindKeyset(this.keys.next, () => {
      this.eventEmitter.emit('keyboard:next')
      return false
    })

    this.bindKeyset(this.keys.previous, () => {
      this.eventEmitter.emit('keyboard:previous')
      return false
    })

    this.bindKeyset(this.keys.select, () => {
      this.eventEmitter.emit('keyboard:select')
      this.deactivate()
      return false
    })

    this.bindKeyset(this.keys.cancel, () => {
      this.eventEmitter.emit('keyboard:cancel')
      this.deactivate()
      return false
    })

    this.keyBinder.bind(
      this.keys.modifier,
      () => {
        this.eventEmitter.emit('keyboard:select')
        this.deactivate()
        return false
      },
      'keyup'
    )

    this.activateKeyBinder.unbind(this.keys.activate)

    this.active = true
  }

  deactivate() {
    if (!this.active) return

    this.unbindKeyset(this.keys.next)
    this.unbindKeyset(this.keys.previous)
    this.unbindKeyset(this.keys.select)
    this.unbindKeyset(this.keys.cancel)
    this.keyBinder.unbind(this.keys.modifier, 'keyup')

    this.activateKeyBinder.bind(this.keys.activate, () => {
      this.eventEmitter.emit('keyboard:activate')
      this.activate()
      return false
    })

    this.active = false
  }

  destroy() {
    this.deactivate()
    this.activateKeyBinder.unbind(this.keys.activate)

    // Remove Chrome API listeners
    chrome.runtime.onMessage.removeListener(this.messageListener)
    chrome.storage.onChanged.removeListener(this.storageListener)

    // Remove all EventEmitter listeners
    this.eventEmitter.removeAllListeners()

    // Detach Combokeys instances to remove all DOM event listeners
    this.keyBinder.detach()
    this.activateKeyBinder.detach()
  }

  bindKeyset(keyset, cb) {
    keyset.forEach((k) => {
      this.keyBinder.bind(k, cb)
    })
  }

  unbindKeyset(keyset) {
    keyset.forEach((k) => {
      this.keyBinder.unbind(k)
    })
  }

  initKeys(value) {
    const os = navigator.platform.indexOf('Mac') === -1 ? 'windows' : 'mac'
    this.keys = value[os]

    const k = this.keys
    const m = this.keys.modifier

    k.activate = m + '+' + k.next
    k.next = [k.activate, m + '+' + 'down', 'down']
    k.previous = [m + '+' + k.previous, m + '+' + 'up', 'up']
    k.select = [m + '+' + 'enter', 'enter']
    k.cancel = [m + '+' + 'esc', m + '+' + 'q', 'esc']

    this.activateKeyBinder.bind(k.activate, () => {
      this.eventEmitter.emit('keyboard:activate')
      this.activate()
      return false
    })

    this.ready()
  }

  updateKeys(value) {
    this.deactivate()
    this.keyBinder.unbind(this.keys.next)
    this.initKeys(value)
  }
}
