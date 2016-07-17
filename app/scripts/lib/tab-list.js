export default class TabList {

  constructor(eventEmitter) {
    this.eventEmitter = eventEmitter;
    this.tabList = {};
    this.tabs = [];

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.tabs) {
        sendResponse({ tabs: this.tabs });
      } else if (request.selectTab) {
        this.selectTab(request.selectTab);
      }
    });

    chrome.tabs.onCreated.addListener((tab) => {
      this.tabs.unshift(tab);
    });

    chrome.tabs.onRemoved.addListener((id) => {
      this.tabs.splice(this.tabs.indexOf(this.findTab(id)), 1);
    });

    chrome.tabs.onActivated.addListener((info) => {
      this.unshiftTab(this.findTab(info.tabId));
    });

    this.eventEmitter.on('connection:disconnect', this.destroy);

    this.getTabs();
  }

  destroy() {
    this.eventEmitter = undefined;
    this.tabList = undefined;
    this.tabs = undefined;
  }

  getTabs() {
    chrome.windows.getAll({ populate: true }, (windows) => {
      let focused;
      windows.forEach((w) => {
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

  findTab(id) {
    return this.tabs.find((tab) => tab && tab.id === id);
  }
}
