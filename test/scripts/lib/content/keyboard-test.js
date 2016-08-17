import '~/test/helper';
import subject from '~/app/scripts/lib/content/keyboard';
import EventEmitter from 'events';
import defaultOptions from '~/app/scripts/lib/default-options.json';

describe('Keyboard', () => {

  describe('initKeys', () => {

    function platform(value) {
      navigator.__defineGetter__('platform', () => {
        return value;
      });
    }

    it('sets windows keys from storage', () => {
      platform('Win32');
      let keyboard = new subject(new EventEmitter());
      keyboard.initKeys(defaultOptions.keys);
      expect(keyboard.keys).to.eql({
        modifier: 'meta',
        next: ['meta+tab', 'meta+down', 'down'],
        previous: ['meta+`', 'meta+up', 'up'],
        activate: 'meta+tab',
        select: ['meta+enter', 'enter'],
        cancel: ['meta+esc', 'esc']
      });
    });

    it('sets mac keys from storage', () => {
      platform('MacIntel');
      let keyboard = new subject(new EventEmitter());
      keyboard.initKeys(defaultOptions.keys);
      expect(keyboard.keys).to.eql({
        modifier: 'alt',
        next: ['alt+tab', 'alt+down', 'down'],
        previous: ['alt+`', 'alt+up', 'up'],
        activate: 'alt+tab',
        select: ['alt+enter', 'enter'],
        cancel: ['alt+esc', 'esc']
      });
    });
  });
});
