'use strict';

console.log('background.js');

(function() {

  var tabIds = [];

  function contentListener(request, sender, sendResponse) {
    if (request.tabObjects) {
      getOrderedTabs(function(tabs) {
        sendResponse({ tabObjects: tabs });
      });
      return true;
    } else if (request.selectTabId) {
      chrome.tabs.update(request.selectTabId, { selected: true });
    }
  }

  chrome.runtime.onMessage.addListener(contentListener);

  function updateTabIds(tabId) {
    var index = tabIds.indexOf(tabId);
    if (index === -1) {
      tabIds.unshift(tabId);
    } else {
      tabIds.unshift(tabIds.splice(tabIds.indexOf(tabId), 1)[0]);
    }
  }

  function getOrderedTabs(next) {
    chrome.tabs.query({}, function(tabs) {
      var tabsById = {};
      for (var i = 0; i < tabs.length; i++) {
        var tab = tabs[i];
        tabsById[tab.id] = tab;
      }

      var orderedTabs = [];
      for (var j = 0; j < tabIds.length; j++) {
        var tabId = tabIds[j];
        orderedTabs.push(tabsById[tabId]);
      }

      next(orderedTabs);
    });
  }

  function getTabs() {
    chrome.tabs.query({}, function(tabs) {
      for (var i = 0; i < tabs.length; i++) {
        var tab = tabs[i];
        if (tabIds.indexOf(tab.id) === -1) {
          tabIds.push(tab.id);
        }
      }
    });
  }

  function getWindow(next) {
    chrome.windows.getCurrent({ populate: true }, function(window) {
      var tabs = window.tabs;
      var activeTab;
      for (var i = 0; i < tabs.length; i++) {
        var tab = tabs[i];
        if (tab.active) {
          activeTab = tab;
        } else {
          tabIds.push(tab.id);
        }
      }
      tabIds.unshift(activeTab.id);
      next();
    });
  }

  getWindow(getTabs);

  chrome.tabs.onCreated.addListener(function(tab) {
    console.log('chrome.tabs.onCreated');
  });

  chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    console.log('chrome.tabs.onRemoved');
  });

  chrome.tabs.onActivated.addListener(function(activeInfo) {
    console.log('chrome.tabs.onActivated');
    updateTabIds(activeInfo.tabId);
  });

})();
