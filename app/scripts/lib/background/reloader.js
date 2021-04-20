export default class Reloader {
  constructor () {
    this.socket = new WebSocket('ws://localhost:5454')
    this.socket.onerror = e => {
      this.log(e, 'error')
    }

    this.socket.onmessage = e => {
      this.log(JSON.stringify(e, null, 2))
      if (e.data === 'reload-extension') {
        chrome.runtime.reload()
      }
    }
  }

  log(message, type = 'info'){
    message = `'WebSocket ${type}: ${message}`
    console.log(message)
    this.socket.send(message)
  }
}
