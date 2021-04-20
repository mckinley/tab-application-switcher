export default class Connection {
  constructor () {
    // Required for onDisconnect in content scripts to execute only when reload occurs.
    // Without a listener, onDesconnect is called immediatly.
    chrome.runtime.onConnect.addListener(() => {})

    this.executeContentScripts()
  }

  executeContentScripts () {
    const manifest = chrome.app.getDetails()
    const scripts = manifest.content_scripts[0].js
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (!tab.url.match('chrome.google.com/webstore') && !tab.url.match('chrome://')) {
          scripts.forEach((script) => {
            chrome.tabs.executeScript(tab.id, { file: script, matchAboutBlank: true }, (result) => {
              const e = chrome.runtime.lastError
              if (e !== undefined) {
                console.log('Error executing content script in tab: ', tab, 'result: ', result, 'chrome.runtime.lastError: ', e)
              }
            })
          })
        }
      })
    })
  }
}
