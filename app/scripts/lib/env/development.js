'use strict';

const connection = new WebSocket('ws://localhost:8080');

connection.onerror = e => {
  console.log('WebSocket Error:', e);
};

connection.onmessage = e => {
  console.log('WebSocket Message:', e.data);
  if (e.data === 'reload-extension') {
    chrome.runtime.reload();
  }
};
