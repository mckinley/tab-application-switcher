import defaultOptions, { type DefaultOptions, type KeyConfig } from './../default-options.js'
import characterFromEvent from 'combokeys/helpers/characterFromEvent.js'
import type { ICoordinator } from '../types.js'

interface TemplateSubs {
  modifier: string
  next: string
  previous: string
  save: string
  modifierKey: string
  nextKey: string
  previousKey: string
}

function template(subs: TemplateSubs): string {
  return `
<div class="TAS_keys">
  <div class="TAS_keyCon">
    <div tabindex="0" class="TAS_keyModifier TAS_key">${subs.modifierKey}</div>
    <div class="TAS_label">${subs.modifier}</div>
  </div>

  <div class="TAS_keyCon">
    <div tabindex="0" class="TAS_keyNext TAS_key">${subs.nextKey}</div>
    <div class="TAS_label">${subs.next}</div>
  </div>

  <div class="TAS_keyCon">
    <div tabindex="0" class="TAS_keyPrevious TAS_key">${subs.previousKey}</div>
    <div class="TAS_label">${subs.previous}</div>
  </div>

  <div class="TAS_saveCon">
    <div class="TAS_save">${subs.save}</div>
    <div class="TAS_status"></div>
  </div>
</div>
`
}

export default class Options {
  coordinator: ICoordinator
  active: boolean
  keyListener?: (event: KeyboardEvent) => boolean
  recordingElement?: HTMLElement
  root?: HTMLDivElement
  os: 'mac' | 'windows'

  constructor(coordinator: ICoordinator) {
    this.coordinator = coordinator
    this.active = false
    this.keyListener = undefined
    this.recordingElement = undefined
    this.root = undefined
    this.os = navigator.platform.indexOf('Mac') > -1 ? 'mac' : 'windows'
  }

  activate(): void {
    if (this.active) return
    this.active = true
  }

  deactivate(): void {
    if (!this.active) return
    this.recordKeyStop()
    this.active = false
  }

  storageObject(): { keys: Partial<DefaultOptions['keys']> } {
    if (!this.root) {
      return { keys: {} }
    }

    const keyModifier = this.root.querySelector('.TAS_keyModifier')?.textContent ?? ''
    const keyNext = this.root.querySelector('.TAS_keyNext')?.textContent ?? ''
    const keyPrevious = this.root.querySelector('.TAS_keyPrevious')?.textContent ?? ''

    const options: KeyConfig = {
      modifier: keyModifier,
      next: keyNext,
      previous: keyPrevious
    }

    const storage: { keys: Partial<DefaultOptions['keys']> } = { keys: {} }
    storage.keys[this.os] = options

    return storage
  }

  save(): void {
    if (!this.root) return

    const status = this.root.querySelector('.TAS_status')
    this.recordKeyStop()

    chrome.storage.sync.set(this.storageObject(), () => {
      if (status) {
        status.textContent = 'options saved'
        status.classList.add('active')
        setTimeout(() => {
          status.classList.remove('active')
        }, 3000)
      }
    })
  }

  recordKeyStart(element: HTMLElement): void {
    this.recordKeyStop()
    this.recordingElement = element
    this.recordingElement.classList.add('recording')
    if (this.keyListener) {
      this.recordingElement.addEventListener('keydown', this.keyListener)
    }
  }

  recordKeyStop(): void {
    if (!this.recordingElement) return
    if (this.keyListener) {
      this.recordingElement.removeEventListener('keydown', this.keyListener)
    }
    this.recordingElement.classList.remove('recording')
    this.recordingElement = undefined
  }

  render(): HTMLDivElement {
    this.root = document.createElement('div')
    this.root.classList.add('TAS_options')

    chrome.storage.sync.get(defaultOptions, (storage) => {
      const keys = (storage.keys as DefaultOptions['keys'])[this.os]
      if (!this.root) return

      this.root.innerHTML = template({
        modifier: chrome.i18n.getMessage('modifier'),
        next: chrome.i18n.getMessage('next'),
        previous: chrome.i18n.getMessage('previous'),
        save: chrome.i18n.getMessage('save'),
        modifierKey: keys.modifier,
        nextKey: keys.next,
        previousKey: keys.previous
      })

      this.keyListener = (event: KeyboardEvent): boolean => {
        if (this.recordingElement) {
          this.recordingElement.textContent = characterFromEvent(event)
          this.recordKeyStop()
        }
        return false
      }

      const keyModifier = this.root.querySelector<HTMLElement>('.TAS_keyModifier')
      if (keyModifier) {
        keyModifier.addEventListener('click', () => {
          this.recordKeyStart(keyModifier)
        })
      }

      const keyNext = this.root.querySelector<HTMLElement>('.TAS_keyNext')
      if (keyNext) {
        keyNext.addEventListener('click', () => {
          this.recordKeyStart(keyNext)
        })
      }

      const keyPrevious = this.root.querySelector<HTMLElement>('.TAS_keyPrevious')
      if (keyPrevious) {
        keyPrevious.addEventListener('click', () => {
          this.recordKeyStart(keyPrevious)
        })
      }

      const save = this.root.querySelector('.TAS_save')
      if (save) {
        save.addEventListener('click', () => {
          this.save()
        })
      }

      this.activate()
    })

    return this.root
  }
}
