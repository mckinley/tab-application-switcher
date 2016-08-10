# Tab Application Switcher

Tab Application Switcher (TAS)

It's like your system's Application Switcher, but for your Chrome tabs:
- Tabs can be accessed with intelligent and configurable keyboard shortcuts, very similar to your operating system's application switcher.
- Tabs are ordered by their last use. The last tab you used is the first tab to select.

And additional features to help you find and access your tabs:
- Tabs can be searched by url and page title.
- Access your tabs in the chrome omnibox by typing 'tas' then `tab`.
- Display appears in your current active window when using the keyboard shortcut. It is also available as an extension action in the chrome menu area.

Default keyboard shortcuts:
- The current window must have focus to use keyboard shortcuts.
- Hold `alt` and press `tab` to activate TAS.
- While still holding `alt`, press `tab` again to move forward through the list of tabs.
- While still holding `alt`, press `` ` `` to move backward through the list of tabs.
- Release `alt` to select the highlighted tab.

Additional commands:
- Use the up and down arrows to move through the list of tabs.
- Press `enter` to select the highlighted tab.
- Press `esc` to close TAS without making a selection.

## Development
- run `npm install`
- run `node_modules/.bin/gulp dev`
- go to `chrome://extensions/`
- check 'Developer mode'
- click 'Load unpacked extension...'
- select the `dist` directory
