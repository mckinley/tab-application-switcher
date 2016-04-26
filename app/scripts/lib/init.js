let tabs;

function getTabs() {
  chrome.windows.getAll({ populate: true }, function(windows) {
    tabs = [];
    let focused;
    windows.forEach((w) => {
      if (w.focused) {
        focused = w;
      } else {
        tabs = w.tabs.concat(tabs);
      }
    });
    if (focused) {
      tabs = focused.tabs.concat(tabs);
      sortTab(focused.tabs.find((tab) => {
        return tab.active;
      }));
    }
  });
}

function sortTab(tab) {
  let index = tabs.indexOf(tab);
  if (index === -1) {
    tabs.unshift(tab);
  } else {
    tabs.unshift(tabs.splice(index, 1)[0]);
  }
}

function findTab(id) {
  for (let i = 0; i < tabs.length; i++) {
    let tab = tabs[i];
    if (tab && tab.id === id) {
      return tab;
    }
  }
}

function selectTab(tab) {
  chrome.windows.update(tab.windowId, { focused: true });
  chrome.tabs.update(tab.id, { selected: true });
}

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
    sendResponse({ tabObjects: tabs });
  } else if (request.selectTab) {
    selectTab(request.selectTab);
  }
}

chrome.runtime.onMessage.addListener(contentListener);

chrome.tabs.onCreated.addListener((tab) => {
  tabs.unshift(tab);
});

chrome.tabs.onRemoved.addListener((tabId) => {
  tabs.splice(tabs.indexOf(findTab(tabId)), 1);
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  sortTab(findTab(activeInfo.tabId));
});

function init() {
  getTabs();
  executeContentScripts();
}

export default init;
