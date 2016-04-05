'use strict';

(function() {

  console.log('content.js');

  var displayCon;

  function onKeyDown(e) {
    if (e.metaKey) {
      if (e.keyIdentifier == 'Alt') {
        displayTabObjects();
        // rotate through tabs
      } else if (e.keyIdentifier == 'Control') {
        displayTabObjects();
        // rotate through tabs
      }
    }
  }

  function onKeyUp(e) {
    if (e.keyIdentifier == 'Meta') {
      // select new tab
      distroyTabObjects();
    }
  }

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  function tabObjects(next) {
    chrome.runtime.sendMessage({ tabObjects: true }, function(response) {
      next(response.tabObjects);
    });
  }

  function displayTabObjects() {
    if (!displayCon) {
      tabObjects(display);
    }
  }

  function distroyTabObjects() {
    if (displayCon) {
      document.body.removeChild(displayCon);
      displayCon = undefined;
    }
  }

  function display(tabObjects) {
    displayCon = document.createElement('div');
    var l = tabObjects.length;
    for (var i = 0; i < l; i++) {
      var tabObject = tabObjects[i];
      // tabObject.favIconUrl
      // tabObject.url
      var tabCon = document.createElement('div');
      var tabTitle = document.createTextNode(tabObject.title);
      var tabIcon = document.createElement('div');
      displayCon.appendChild(tabCon);
      tabCon.appendChild(tabTitle);
      document.body.appendChild(displayCon);
    }
  }

})();
