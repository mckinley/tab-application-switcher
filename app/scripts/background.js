import EventEmitter from 'events';
import TabList from './lib/tab-list';

let eventEmitter = new EventEmitter();
new TabList(eventEmitter);

let socket = new WebSocket('ws://localhost:5454');
let port = chrome.runtime.connect();
port.onDisconnect.addListener(() => {
  eventEmitter.emit('connection:disconnect');
});

socket.onerror = e => {
  console.log('WebSocket Error:', e);
};

socket.onmessage = e => {
  console.log('WebSocket Message:', e);
  if (e.data === 'reload-extension') {
    chrome.runtime.reload();
  }
};

// Required for onDisconnect in content scripts to execute only when reload occurs.
// Without a listener, onDesconnect is called immediatly.
chrome.runtime.onConnect.addListener(() => {});

function executeContentScripts() {
  let manifest = chrome.app.getDetails();
  let scripts = manifest.content_scripts[0].js;
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (!tab.url.match('chrome.google.com/webstore/category/extensions') && !tab.url.match('chrome://')) {
        scripts.forEach((script) => {
          chrome.tabs.executeScript(tab.id, { file: script, matchAboutBlank: true });
        });
      }
    });
  });
}

executeContentScripts();
