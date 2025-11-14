import defaultOptions, { type DefaultOptions } from '../default-options.js'
import Combokeys from 'combokeys'
import type { ICoordinator, Keys } from '../types.js'

export default class Keyboard {
  coordinator: ICoordinator
  active: boolean
  onReady?: (keyboard: Keyboard) => void
  keys!: Keys
  keyBinder: Combokeys
  activateKeyBinder: Combokeys
  private storageListener: (changes: { [key: string]: chrome.storage.StorageChange }, namespace: string) => void

  constructor(coordinator: ICoordinator) {
    this.coordinator = coordinator
    this.active = false
    this.onReady = undefined
    this.keyBinder = new Combokeys(document.documentElement)
    this.activateKeyBinder = new Combokeys(document.documentElement)

    // Store the storage listener so we can remove it on destroy
    this.storageListener = (changes: { [key: string]: chrome.storage.StorageChange }, _namespace: string) => {
      if (changes.keys && changes.keys.newValue) {
        this.updateKeys(changes.keys.newValue as DefaultOptions['keys'])
      }
    }
    chrome.storage.onChanged.addListener(this.storageListener)

    chrome.storage.sync.get(defaultOptions, (storage) => {
      if (storage.keys) {
        this.initKeys(storage.keys as DefaultOptions['keys'])
      }
    })
  }

  ready(): void {
    if (this.onReady) {
      this.onReady(this)
      delete this.onReady
    }
  }

  activate(): void {
    if (this.active) return

    const activeElement = document.activeElement as HTMLElement | null
    activeElement?.blur()

    this.bindKeyset(this.keys.next, () => {
      this.coordinator.handleNext()
      return false
    })

    // Also bind Alt+X for next (from manifest command)
    this.keyBinder.bind(this.keys.modifier + '+x', () => {
      this.coordinator.handleNext()
      return false
    })

    this.bindKeyset(this.keys.previous, () => {
      this.coordinator.handlePrevious()
      return false
    })

    this.bindKeyset(this.keys.select, () => {
      this.coordinator.handleSelect()
      return false
    })

    this.bindKeyset(this.keys.cancel, () => {
      this.coordinator.handleCancel()
      return false
    })

    this.keyBinder.bind(
      this.keys.modifier,
      () => {
        this.coordinator.handleSelect()
        return false
      },
      'keyup'
    )

    this.activateKeyBinder.unbind(this.keys.activate)

    this.active = true
  }

  deactivate(): void {
    if (!this.active) return

    this.unbindKeyset(this.keys.next)
    this.keyBinder.unbind(this.keys.modifier + '+x')
    this.unbindKeyset(this.keys.previous)
    this.unbindKeyset(this.keys.select)
    this.unbindKeyset(this.keys.cancel)
    this.keyBinder.unbind(this.keys.modifier, 'keyup')

    this.activateKeyBinder.bind(this.keys.activate, () => {
      this.coordinator.handleActivate()
      return false
    })

    this.active = false
  }

  unbindModifier(): void {
    this.keyBinder.unbind(this.keys.modifier, 'keyup')
  }

  destroy(): void {
    this.deactivate()
    this.activateKeyBinder.unbind(this.keys.activate)

    // Remove Chrome API listeners
    chrome.storage.onChanged.removeListener(this.storageListener)

    // Detach Combokeys instances to remove all DOM event listeners
    this.keyBinder.detach()
    this.activateKeyBinder.detach()
  }

  bindKeyset(keyset: string[], cb: () => boolean): void {
    keyset.forEach((k) => {
      this.keyBinder.bind(k, cb)
    })
  }

  unbindKeyset(keyset: string[]): void {
    keyset.forEach((k) => {
      this.keyBinder.unbind(k)
    })
  }

  initKeys(value: DefaultOptions['keys']): void {
    const os = navigator.platform.indexOf('Mac') === -1 ? 'windows' : 'mac'
    const osKeys = value[os]

    const m = osKeys.modifier

    this.keys = {
      modifier: m,
      activate: m + '+' + osKeys.next,
      next: [m + '+' + osKeys.next, m + '+' + 'down', 'down'],
      previous: [m + '+' + osKeys.previous, m + '+' + 'up', 'up'],
      select: [m + '+' + 'enter', 'enter'],
      cancel: [m + '+' + 'esc', m + '+' + 'q', 'esc']
    }

    this.activateKeyBinder.bind(this.keys.activate, () => {
      this.coordinator.handleActivate()
      return false
    })

    this.ready()
  }

  updateKeys(value: DefaultOptions['keys']): void {
    this.deactivate()
    this.keyBinder.unbind(this.keys.next)
    this.initKeys(value)
  }
}
