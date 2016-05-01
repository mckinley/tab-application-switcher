const tabList = {};
tabList.tabs = [];

tabList.getTabs = () => {
  chrome.windows.getAll({ populate: true }, function(windows) {
    let focused;
    windows.forEach((w) => {
      if (w.focused) {
        focused = w;
      } else {
        tabList.tabs = w.tabs.concat(tabList.tabs);
      }
    });
    if (focused) {
      tabList.tabs = focused.tabs.concat(tabList.tabs);
      unshiftTab(focused.tabs.find((tab) => tab.active));
    }
  });
};

tabList.selectTab = (tab) => {
  chrome.windows.update(tab.windowId, { focused: true });
  chrome.tabs.update(tab.id, { selected: true });
};


export default tabList;


function unshiftTab(tab) {
  let index = tabList.tabs.indexOf(tab);
  if (index === -1) {
    tabList.tabs.unshift(tab);
  } else {
    tabList.tabs.unshift(tabList.tabs.splice(index, 1)[0]);
  }
}

function findTab(id) {
  return tabList.tabs.find((tab) => tab && tab.id === id);
}

chrome.tabs.onCreated.addListener((tab) => {
  tabList.tabs.unshift(tab);
});

chrome.tabs.onRemoved.addListener((id) => {
  tabList.tabs.splice(tabList.tabs.indexOf(findTab(id)), 1);
});

chrome.tabs.onActivated.addListener((info) => {
  unshiftTab(findTab(info.tabId));
});
