console.log('options.js');

function save() {
  var keyModifier = document.getElementById('key-modifier').value;
  var keyNext = document.getElementById('key-next').value;
  var keyPrevious = document.getElementById('key-previous').value;
  chrome.storage.sync.set({
    keys: {
      modifier: keyModifier,
      next: keyNext,
      previous: keyPrevious
    }
  }, function() {
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 2000);
  });
}

function init() {
  chrome.storage.sync.get({
    keys: {
      modifier: 'alt',
      next: 'tab',
      previous: '`'
    }
  }, function(storage) {
    document.getElementById('key-modifier').value = storage.keys.modifier;
    document.getElementById('key-next').value = storage.keys.next;
    document.getElementById('key-previous').value = storage.keys.previous;
  });
}
document.addEventListener('DOMContentLoaded', init);
document.getElementById('save').addEventListener('click', save);
