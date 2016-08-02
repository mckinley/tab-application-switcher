export default class Connection {

  constructor() {
    let port = chrome.runtime.connect();
    port.onDisconnect.addListener(() => {
      this.destroy();
    });
    // Required for onDisconnect in content scripts to execute only when reload occurs.
    // Without a listener, onDesconnect is called immediatly.
    chrome.runtime.onConnect.addListener(() => {});

    this.executeContentScripts();
  }

  destroy() {
    chrome.runtime.sendMessage({ connection: 'disconnect' });
  }

  executeContentScripts() {
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
}
