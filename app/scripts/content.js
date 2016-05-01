'use strict';
import mousetrap from 'mousetrap';

(function() {
  console.log('content.js');

  var keys;
  var active;
  var root;
  var tabs;
  var cursor = 0;

  chrome.storage.onChanged.addListener((changes, namespace) => {
    if(changes.keys){
      if (active) {
        deactivate();
      }
      mousetrap.unbind(keys.next);
      initKeys(changes.keys.newValue);
    }
  });

  chrome.storage.sync.get('keys', (storage) => {
    initKeys(storage.keys);
  });

  function initKeys(value) {
    keys = value;
    let modifier = keys.modifier;

    keys.next = modifier + '+' + keys.next;
    keys.previous = modifier + '+' + keys.previous;
    keys.select = modifier + '+' + 'enter';
    keys.cancel = modifier + '+' + 'esc';

    mousetrap.bind(keys.next, () => {
      next();
      return false;
    });
  }

  function next() {
    if (!active) {
      activate();
    } else {
      highlightNextTab();
    }
  }

  function previous() {
    highlightPreviousTab();
  }

  function select() {
    selectHighlightedTab();
    deactivate();
  }

  function activate() {
    mousetrap.bind(keys.previous, () => {
      previous();
      return false;
    });
    mousetrap.bind(keys.select, () => {
      select();
      return false;
    });
    mousetrap.bind(keys.modifier, () => {
      select();
      return false;
    }, 'keyup');
    Mousetrap.bind(keys.cancel, () => {
      deactivate();
      return false;
    });

    getTabs(() => {
      render();
      highlightNextTab();
      active = true;
    });
  }

  function deactivate() {
    mousetrap.unbind(keys.previous);
    mousetrap.unbind(keys.select);
    mousetrap.unbind(keys.modifier, 'keyup');
    Mousetrap.unbind(keys.cancel);

    document.body.removeChild(root);
    root = undefined;
    tabs = undefined;
    cursor = 0;
    active = false;
  }

  function getTabs(cb) {
    chrome.runtime.sendMessage({ tabs: true }, function(response) {
      tabs = response.tabs;
      cb();
    });
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
    if (active) {
      deactivate();
    }
    mousetrap.unbind(keys.next);
    keys = undefined;
  }

  let port = chrome.runtime.connect();
  port.onDisconnect.addListener(() => {
    destroy();
  });
})();
