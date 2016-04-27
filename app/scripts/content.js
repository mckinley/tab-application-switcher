'use strict';

(function() {
  console.log('content.js');

  var active;
  var root;
  var tabs;
  var cursor = 0;

  function onKeyDown(e) {
    if (e.metaKey) {
      if (e.keyCode === 18) { // Alt
        if (active) {
          highlightNextTab();
        } else {
          displayTabs();
        }
      } else if (active && e.keyCode === 17) { // Control
        highlightPreviousTab();
      } else if (e.keyCode === 27) { // Esc
        deactivate();
      }
    }
  }

  function onKeyUp(e) {
    if (active && e.keyCode === 91) { // Meta
      selectHighlightedTab();
      deactivate();
    }
  }

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  function getTabs(cb) {
    chrome.runtime.sendMessage({ tabs: true }, function(response) {
      tabs = response.tabs;
      cb();
    });
  }

  function activate() {
    if (!active) {
      getTabs(() => {
        render();
        highlightNextTab();
        active = true;
      });
    }
  }

  function deactivate() {
    if (active) {
      document.body.removeChild(root);
      root = undefined;
      tabs = undefined;
      cursor = 0;
      active = false;
    }
  }

  function render() {
    root = document.createElement('div');
    root.classList.add('TAS_root');
    var shadow = root.createShadowRoot();
    var displayCon = document.createElement('div');
    displayCon.classList.add('TAS_displayCon');
    document.body.appendChild(root);
    shadow.appendChild(displayCon);

    var l = tabs.length;
    for (var i = 0; i < l; i++) {
      var tab = tabs[i];

      var tabCon = document.createElement('div');
      var tabTitle = document.createElement('div');
      var tabTitleText = document.createElement('div')
      var tabIcon = document.createElement('div');

      tabTitle.setAttribute('title', tab.url);
      tabTitleText.appendChild(document.createTextNode(tab.title));
      if (tab.favIconUrl && tab.url != 'chrome://extensions/') {
        tabIcon.style.backgroundImage = "url('" + tab.favIconUrl + "')";
      }

      tabCon.classList.add('TAS_tabCon', 'mdl-card', 'mdl-shadow--2dp');
      tabTitle.classList.add('TAS_tabTitle', 'mdl-card__title');
      tabTitleText.classList.add('TAS_tabTitleText', 'mdl-typography--title');
      tabIcon.classList.add('TAS_tabIcon', 'mdl-list__item-icon', 'mdl-shadow--1dp');

      displayCon.appendChild(tabCon);
      tabCon.appendChild(tabIcon);
      tabCon.appendChild(tabTitle);
      tabTitle.appendChild(tabTitleText);

      tab.tabCon = tabCon;
    }
  }

  function highlightNextTab() {
    tabs[cursor].tabCon.classList.remove('TAS_highlighted');
    if (cursor === tabs.length - 1) {
      cursor = -1;
    }
    tabs[++cursor].tabCon.classList.add('TAS_highlighted');
  }

  function highlightPreviousTab() {
    tabs[cursor].tabCon.classList.remove('TAS_highlighted');
    if (cursor === 0) {
      cursor = tabs.length;
    }
    tabs[--cursor].tabCon.classList.add('TAS_highlighted');
  }

  function selectHighlightedTab() {
    chrome.runtime.sendMessage({ selectTab: tabs[cursor] });
  }

  function destroy() {
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
    deactivate();
  }

  let port = chrome.runtime.connect();
  port.onDisconnect.addListener(() => {
    destroy();
  });
})();
