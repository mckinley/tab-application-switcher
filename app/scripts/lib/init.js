import tabList from './tab-list';

function init() {
  tabList.getTabs();
  executeContentScripts();
}


export default init;


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

function contentListener(request, sender, sendResponse) {
  if (request.tabs) {
    sendResponse({ tabs: tabList.tabs });
  } else if (request.selectTab) {
    tabList.selectTab(request.selectTab);
  }
}

chrome.runtime.onMessage.addListener(contentListener);
