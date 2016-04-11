'use strict';

console.log('development.js');

(function() {
  var connection = new WebSocket('ws://localhost:8080');

  connection.onerror = e => {
    console.log('WebSocket Error:', e);
  };

  connection.onmessage = e => {
    console.log('WebSocket Message:', e.data);
    runtime().sendMessage({ reloadExtension: true });
    if (e.data === 'reload-extension' && typeof(runtime().reload) === 'function') {
      runtime().reload();
    }
  };

  runtime().onMessage.addListener(function(request, sender, sendResponse) {
    if (request.reloadExtension && typeof(runtime().reload) === 'function') {
      runtime().reload();
    }
  });

  function runtime() {
    if (chrome.runtime && !!chrome.runtime.getManifest()) {
      return chrome.runtime;
    } else {
      destroy();
      return { sendMessage: function() {}, reload: false };
    }
  }

  function destroy(){
  }
})();
