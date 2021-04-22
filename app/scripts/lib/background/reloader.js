export default class Reloader {
  constructor () {
    this.socket = new WebSocket('ws://localhost:5454')
    this.socket.onerror = error => {
      this.log(error, 'error')
    }

    this.socket.onmessage = event => {
      this.log(JSON.stringify(event, null, 2))
      if (event.data === 'reload-extension') {
        chrome.runtime.reload()
      }
    }
  }

  log (message, type = 'info') {
    message = `'WebSocket ${type}: ${typeof message === 'string' ? message : JSON.stringify(message, null, 2)}`
    console.log(message)
    this.socket.send(message)
  }
}
