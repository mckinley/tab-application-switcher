'use strict';
import example from './lib/example';

(function() {
  console.log(example);
  console.log('background.js');

  var tabs;

  function getTabs() {
    chrome.windows.getAll({ populate: true }, function(windows) {
      tabs = [];
      var focused;
      windows.forEach(function(w) {
        if (w.focused) {
          focused = w;
        } else {
          tabs = w.tabs.concat(tabs);
        }
      });
      if (focused) {
        tabs = focused.tabs.concat(tabs);
        sortTab(focused.tabs.find(function(tab) {
          return tab.active;
        }));
      }
    });
  }

  function sortTab(tab) {
    var index = tabs.indexOf(tab);
    if (index === -1) {
      tabs.unshift(tab);
    } else {
      tabs.unshift(tabs.splice(index, 1)[0]);
    }
  }

  function findTab(id) {
    var l = tabs.length;
    for (var i = 0; i < l; i++) {
      var tab = tabs[i];
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
    // var manifest = chrome.app.getDetails();
    // var scripts = manifest.content_scripts[0].js;
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

  function init() {
    getTabs();
    executeContentScripts();
  }

  chrome.runtime.onMessage.addListener(contentListener);

  chrome.tabs.onCreated.addListener(function(tab) {
    tabs.unshift(tab);
  });

  chrome.tabs.onRemoved.addListener(function(tabId) {
    tabs.splice(tabs.indexOf(findTab(tabId)), 1);
  });

  chrome.tabs.onActivated.addListener(function(activeInfo) {
    sortTab(findTab(activeInfo.tabId));
  });

  // Required for onDisconnect in content scripts to execute only when reload occurs.
  chrome.runtime.onConnect.addListener(() => {});

  var connection = new WebSocket('ws://localhost:8080');

  connection.onerror = e => {
    console.log('WebSocket Error:', e);
  };

  connection.onmessage = e => {
    console.log('WebSocket Message:', e);
    if (e.data === 'reload-extension') {
      chrome.runtime.reload();
    }
  };

  init();

})();
