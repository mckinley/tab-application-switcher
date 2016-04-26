import tabList from './tab-list';

function executeContentScripts() {
  // let manifest = chrome.app.getDetails();
  // let scripts = manifest.content_scripts[0].js;
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (!tab.url.match('chrome.google.com/webstore/category/extensions') && !tab.url.match('chrome://')) {
        chrome.tabs.executeScript(tab.id, { file: 'scripts/content.js', matchAboutBlank: true });
      }
    });
  });
}

function contentListener(request, sender, sendResponse) {
  if (request.tabObjects) {
    sendResponse({ tabObjects: tabList.tabs });
  } else if (request.selectTab) {
    tabList.selectTab(request.selectTab);
  }
}

chrome.runtime.onMessage.addListener(contentListener);

function init() {
  tabList.getTabs();
  executeContentScripts();
}

export default init;
