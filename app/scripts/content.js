'use strict';

(function() {
  console.log('content.js');

  var active;
  var root;
  var tabObjects;
  var tabObjectsCursor = 0;

  function onKeyDown(e) {
    if (e.metaKey) {
      if (e.keyCode === 18) { // Alt
        if (active) {
          highlightNextTab();
        } else {
          displayTabObjects();
        }
      } else if (active && e.keyCode === 17) { // Control
        highlightPreviousTab();
      } else if (e.keyCode === 27) { // Esc
        distroyTabObjects();
      }
    }
  }

  function onKeyUp(e) {
    if (active && e.keyCode === 91) { // Meta
      selectHighlightedTab();
      distroyTabObjects();
    }
  }

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  function getTabObjects(next) {
    runtime().sendMessage({ tabObjects: true }, function(response) {
      tabObjects = response.tabObjects;
      next();
    });
  }

  function displayTabObjects() {
    if (!active) {
      getTabObjects(display);
      active = true;
    }
  }

  function distroyTabObjects() {
    if (active) {
      document.body.removeChild(root);
      root = undefined;
      tabObjects = undefined;
      tabObjectsCursor = 0;
      active = false;
    }
  }

  function display() {
    root = document.createElement('div');
    root.classList.add('TAS_root')
    var shadow = root.createShadowRoot();
    var displayCon = document.createElement('div');
    displayCon.classList.add('TAS_displayCon');
    document.body.appendChild(root);
    shadow.appendChild(displayCon);

    var l = tabObjects.length;
    for (var i = 0; i < l; i++) {
      var tabObject = tabObjects[i];

      var tabCon = document.createElement('div');
      var tabTitle = document.createElement('div');
      var tabTitleText = document.createTextNode(tabObject.title);
      var tabIcon = document.createElement('div');

      tabTitle.setAttribute('title', tabObject.url);
      if (tabObject.favIconUrl && tabObject.url != 'chrome://extensions/') {
        tabIcon.style.backgroundImage = "url('" + tabObject.favIconUrl + "')";
      }

      tabCon.classList.add('TAS_tabCon');
      tabTitle.classList.add('TAS_tabTitle');
      tabIcon.classList.add('TAS_tabIcon');

      displayCon.appendChild(tabCon);
      tabCon.appendChild(tabIcon);
      tabCon.appendChild(tabTitle);
      tabTitle.appendChild(tabTitleText);

      tabObject.tabCon = tabCon;
    }

    highlightNextTab();
  }

  function highlightNextTab() {
    tabObjects[tabObjectsCursor].tabCon.classList.remove('TAS_highlighted');
    if (tabObjectsCursor === tabObjects.length - 1) {
      tabObjectsCursor = -1;
    }
    tabObjects[++tabObjectsCursor].tabCon.classList.add('TAS_highlighted');
  }

  function highlightPreviousTab() {
    tabObjects[tabObjectsCursor].tabCon.classList.remove('TAS_highlighted');
    if (tabObjectsCursor === 0) {
      tabObjectsCursor = tabObjects.length;
    }
    tabObjects[--tabObjectsCursor].tabCon.classList.add('TAS_highlighted');
  }

  function selectHighlightedTab() {
    runtime().sendMessage({ selectTab: tabObjects[tabObjectsCursor] });
  }

  function destroy() {
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
  }

  function runtime() {
    if (chrome.runtime && !!chrome.runtime.getManifest()) {
      return chrome.runtime;
    } else {
      destroy();
      return { sendMessage: function() {} };
    }
  }
})();
