export default class Reloader {
  constructor() {
    // Development-only hot reload functionality
    // This entire file is excluded from production builds via the import comment in background.js
    this.socket = null
    this.connected = false

    // Check if dev server is running before attempting WebSocket connection
    // This prevents the ugly ERR_CONNECTION_REFUSED error in the console
    setTimeout(() => {
      this.checkAndConnect()
    }, 100)
  }

  async checkAndConnect() {
    try {
      // Try to reach the dev server with a quick HTTP check first
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 500)

      await fetch('http://localhost:5454', {
        signal: controller.signal,
        mode: 'no-cors' // We don't care about the response, just if it's reachable
      })

      clearTimeout(timeoutId)

      // Server is reachable, connect WebSocket
      this.connect()
    } catch (error) {
      // Dev server not running - this is fine, just log it
      console.log(
        '%c[TAS Dev] Hot reload disabled - run "npm start" to enable auto-reload on file changes',
        'color: #FF9800'
      )
    }
  }

  connect() {
    try {
      this.socket = new WebSocket('ws://localhost:5454')

      this.socket.onerror = () => {
        this.socket = null
      }

      this.socket.onopen = () => {
        this.connected = true
        console.log(
          '%c[TAS Dev] Hot reload enabled - changes will auto-reload the extension',
          'color: #4CAF50; font-weight: bold'
        )
      }

      this.socket.onclose = () => {
        this.connected = false
        this.socket = null
      }

      this.socket.onmessage = (event) => {
        if (event.data === 'reload-extension') {
          console.log('%c[TAS Dev] Files changed - reloading extension...', 'color: #2196F3; font-weight: bold')
          chrome.runtime.reload()
        }
      }
    } catch (error) {
      // WebSocket not available
      this.socket = null
    }
  }

  log(message, type = 'info') {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return
    }
    try {
      this.socket.send(`WebSocket ${type}: ${typeof message === 'string' ? message : JSON.stringify(message, null, 2)}`)
    } catch (error) {
      // Socket closed, ignore
    }
  }
}
