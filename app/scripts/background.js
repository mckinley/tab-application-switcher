'use strict';

console.log('background.js');

(function() {

  var tabs = [];

  function sortTabs(tab) {
    var index = tabs.indexOf(tab);
    if (index === -1) {
      tabs.unshift(tab);
    } else {
      tabs.unshift(tabs.splice(tabs.indexOf(tab), 1)[0]);
    }
  }

  function getTabs() {
    chrome.tabs.query({}, function(results) {
      tabs = results;
      for (var i = 0; i < tabs.length; i++) {
        var tab = tabs[i];
        if (tab.lastFocusedWindow) {
          sortTabs(tab);
        }
      }
    });
  }

  function contentListener(request, sender, sendResponse) {
    if (request.tabObjects) {
      sendResponse({ tabObjects: tabs });
    } else if (request.selectTab) {
      chrome.windows.update(request.selectTab.windowId, { focused: true });
      chrome.tabs.update(request.selectTab.id, { selected: true });
    }
  }

  chrome.runtime.onMessage.addListener(contentListener);

  chrome.tabs.onCreated.addListener(function(tab) {
    console.log('chrome.tabs.onCreated');
  });

  chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    console.log('chrome.tabs.onRemoved');
  });

  chrome.tabs.onActivated.addListener(function(activeInfo) {
    console.log('chrome.tabs.onActivated');
    for (var i = 0; i < tabs.length; i++) {
      var tab = tabs[i];
      if (activeInfo.tabId === tab.id) {
        var activatedTab = tab;
        break;
      }
    }
    sortTabs(activatedTab);
  });

  getTabs();

})();
