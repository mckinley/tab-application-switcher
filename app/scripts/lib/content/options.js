import defaultOptions from './../default-options.js'
import characterFromEvent from 'combokeys/helpers/characterFromEvent.js'

function template (subs) {
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
  constructor (eventEmitter) {
    this.eventEmitter = eventEmitter
    this.active = false
    this.keyListener = undefined
    this.recordingElement = undefined
    this.root = undefined
    this.os = navigator.platform.indexOf('Mac') > -1 ? 'mac' : 'windows'
  }

  activate () {
    if (this.active) return

    this.active = true
  }

  deactivate () {
    if (!this.active) return

    this.recordKeyStop()
    this.active = false
  }

  storageObject () {
    const keyModifier = this.root.querySelector('.TAS_keyModifier').textContent
    const keyNext = this.root.querySelector('.TAS_keyNext').textContent
    const keyPrevious = this.root.querySelector('.TAS_keyPrevious').textContent
    const options = {
      modifier: keyModifier,
      next: keyNext,
      previous: keyPrevious
    }

    const storage = { keys: {} }
    storage.keys[this.os] = options

    return storage
  }

  save () {
    const status = this.root.querySelector('.TAS_status')
    this.recordKeyStop()
    chrome.storage.sync.set(this.storageObject(), () => {
      status.textContent = 'options saved'
      status.classList.add('active')
      setTimeout(() => {
        status.classList.remove('active')
      }, 3000)
    })
  }

  recordKeyStart (element) {
    this.recordKeyStop()
    this.recordingElement = element
    this.recordingElement.classList.add('recording')
    this.recordingElement.addEventListener('keydown', this.keyListener)
  }

  recordKeyStop () {
    if (!this.recordingElement) return
    this.recordingElement.removeEventListener('keydown', this.keyListener)
    this.recordingElement.classList.remove('recording')
    this.recordingElement = undefined
  }

  render () {
    this.root = document.createElement('div')
    this.root.classList.add('TAS_options')

    chrome.storage.sync.get(defaultOptions, (storage) => {
      const keys = storage.keys[this.os]
      this.root.innerHTML = template({
        modifier: chrome.i18n.getMessage('modifier'),
        next: chrome.i18n.getMessage('next'),
        previous: chrome.i18n.getMessage('previous'),
        save: chrome.i18n.getMessage('save'),
        modifierKey: keys.modifier,
        nextKey: keys.next,
        previousKey: keys.previous
      })

      this.keyListener = (event) => {
        this.recordingElement.textContent = characterFromEvent(event)
        this.recordKeyStop()
        return false
      }

      const keyModifier = this.root.querySelector('.TAS_keyModifier')
      keyModifier.addEventListener('click', () => {
        this.recordKeyStart(keyModifier)
      })

      const keyNext = this.root.querySelector('.TAS_keyNext')
      keyNext.addEventListener('click', () => {
        this.recordKeyStart(keyNext)
      })

      const keyPrevious = this.root.querySelector('.TAS_keyPrevious')
      keyPrevious.addEventListener('click', () => {
        this.recordKeyStart(keyPrevious)
      })

      const save = this.root.querySelector('.TAS_save')
      save.addEventListener('click', () => {
        this.save()
      })

      this.activate()
    })

    return this.root
  }
}
