'use strict';

import test from './lib/test.json';

console.log(test);

console.log('background.js');

(function() {
  var tabs = [];

  function getTabs() {
    chrome.windows.getAll({populate: true}, function(windows){
      var focused;
      windows.forEach(function(w){
        if(w.focused){
          focused = w;
        } else {
          tabs = w.tabs.concat(tabs);
        }
      });
      tabs = focused.tabs.concat(tabs);
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

  function contentListener(request, sender, sendResponse) {
    if (request.tabObjects) {
      sendResponse({ tabObjects: tabs });
    } else if (request.selectTab) {
      selectTab(request.selectTab);
    }
  }

  function init() {
    getTabs();
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

  init();
})();
