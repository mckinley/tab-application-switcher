const tabList = {};
tabList.tabs = [];

chrome.tabs.onCreated.addListener((tab) => {
  tabList.tabs.unshift(tab);
});

chrome.tabs.onRemoved.addListener((tabId) => {
  tabList.tabs.splice(tabList.tabs.indexOf(findTab(tabId)), 1);
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  sortTab(findTab(activeInfo.tabId));
});

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
      sortTab(focused.tabs.find((tab) => {
        return tab.active;
      }));
    }
  });
}

tabList.selectTab = (tab) => {
  chrome.windows.update(tab.windowId, { focused: true });
  chrome.tabs.update(tab.id, { selected: true });
}


export default tabList;


function sortTab(tab) {
  let index = tabList.tabs.indexOf(tab);
  if (index === -1) {
    tabList.tabs.unshift(tab);
  } else {
    tabList.tabs.unshift(tabList.tabs.splice(index, 1)[0]);
  }
}

function findTab(id) {
  for (let i = 0; i < tabList.tabs.length; i++) {
    let tab = tabList.tabs[i];
    if (tab && tab.id === id) {
      return tab;
    }
  }
}
