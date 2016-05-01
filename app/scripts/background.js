import init from './lib/init';

const connection = new WebSocket('ws://localhost:5454');

connection.onerror = e => {
  console.log('WebSocket Error:', e);
};

connection.onmessage = e => {
  console.log('WebSocket Message:', e);
  if (e.data === 'reload-extension') {
    chrome.runtime.reload();
  }
};

// Required for onDisconnect in content scripts to execute only when reload occurs.
// Without a listener onDesconnect is called immediatly.
chrome.runtime.onConnect.addListener(() => {});

init();
