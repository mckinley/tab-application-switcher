export default class Reloader {

  constructor() {
    let socket = new WebSocket('ws://localhost:5454');
    socket.onerror = e => {
      console.log('WebSocket Error:', e);
    };

    socket.onmessage = e => {
      console.log('WebSocket Message:', e);
      if (e.data === 'reload-extension') {
        chrome.runtime.reload();
      }
    };
  }
}
