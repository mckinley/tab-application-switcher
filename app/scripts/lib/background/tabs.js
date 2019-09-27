export default class Tabs {

  constructor(eventEmitter) {
    this.eventEmitter = eventEmitter;
    this.tabs = [];

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.tabs) {
        sendResponse({ tabs: this.tabs });
      } else if (request.selectTab) {
        this.selectTab(request.selectTab);
      }
    });

    this.eventEmitter.on('omnibox:select-tab', (tab) => {
      this.selectTab(tab);
    });

    chrome.tabs.onCreated.addListener((tab) => {
      if (tab.active) {
        this.tabs.unshift(tab);
      } else {
        this.tabs.push(tab);
      }
    });

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this.tabs[this.tabs.indexOf(this.findTab(tabId))] = tab;
    });

    chrome.tabs.onReplaced.addListener((addedTabId, removedTabId) => {
      this.removeTab(removedTabId);
    });

    chrome.tabs.onRemoved.addListener((id) => {
      this.removeTab(id);
    });

    chrome.tabs.onActivated.addListener((info) => {
      this.unshiftTab(this.findTab(info.tabId));
    });

    chrome.windows.onFocusChanged.addListener(() => {
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        if(tabs[0]){
          this.unshiftTab(this.findTab(tabs[0].id));
        }
      });
    });

    this.getTabs();
  }

  getTabs() {
    chrome.windows.getAll({ populate: true }, (windows) => {
      let focused;
      windows.forEach((w) => {

        function toDataURL(url, callback) {
          var xhr = new XMLHttpRequest();
          xhr.onload = function() {
            var reader = new FileReader();
            reader.onloadend = function() {
              callback(reader.result);
            };
            reader.readAsDataURL(xhr.response);
          };
          xhr.open('GET', url);
          xhr.responseType = 'blob';
          xhr.send();
        }

        w.tabs.map((t) => {
          toDataURL('chrome://favicon/size/16@1x/' + t.url, (dataUrl) => {
            t.favIconDataUrl = dataUrl;
          });
        });

        if (w.focused) {
          focused = w;
        } else {
          this.tabs = w.tabs.concat(this.tabs);
        }
      });

      if (focused) {
        this.tabs = focused.tabs.concat(this.tabs);
        this.unshiftTab(focused.tabs.find((tab) => tab.active));
      }
    });
  }

  selectTab(tab) {
    chrome.windows.update(tab.windowId, { focused: true });
    chrome.tabs.update(tab.id, { selected: true });
  }

  unshiftTab(tab) {
    let index = this.tabs.indexOf(tab);
    if (index === -1) {
      this.tabs.unshift(tab);
    } else {
      this.tabs.unshift(this.tabs.splice(index, 1)[0]);
    }
  }

  removeTab(id) {
    this.tabs.splice(this.tabs.indexOf(this.findTab(id)), 1);
  }

  findTab(id) {
    return this.tabs.find((tab) => tab && tab.id === id);
  }
}