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
      selectTab(request.selectTab);
    }
  }

  function selectTab(tab) {
    chrome.windows.update(tab.windowId, { focused: true });
    chrome.tabs.update(tab.id, { selected: true });
  }

  chrome.runtime.onMessage.addListener(contentListener);

  chrome.tabs.onCreated.addListener(function(tab) {
    tabs.unshift(tab);
  });

  chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    tabs.splice(tabs.indexOf(findTab(tabId)), 1);
  });

  chrome.tabs.onActivated.addListener(function(activeInfo) {
    sortTabs(findTab(activeInfo.tabId));
  });

  function findTab(id) {
    var l = tabs.length;
    for (var i = 0; i < l; i++) {
      var tab = tabs[i];
      if (id === tab.id) {
        return tab;
      }
    }
  }

  getTabs();

})();
