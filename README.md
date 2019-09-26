# Tab Application Switcher

Tab Application Switcher (TAS)

[Install from the chrome web store](https://chrome.google.com/webstore/detail/tab-application-switcher/mfcjanplaceclfoipcengelejgfngcan)

It's like your system's Application Switcher, but for your Chrome tabs:
- Tabs can be accessed with intelligent and configurable keyboard shortcuts, very similar to your operating system's application switcher.
- Tabs are ordered by their last use. The last tab you used is the first tab to select.

Additional features to help you find and access your tabs:
- Tabs can be searched by url and page title.
- Access your tabs in the chrome omnibox by typing 'tas' then `tab`.
- Display appears in your current active window when using the keyboard shortcut. It is also available as an extension action in the chrome menu area.

Default keyboard shortcuts:
- The current window must have focus to use keyboard shortcuts.
- Hold `alt` and press `tab` to activate TAS.
- Continue holding `alt`, and press `tab` again to move forward through the list of tabs.
- Continue holding `alt`, and press `` ` `` to move backward through the list of tabs.
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
- click the 'background page' link in the extension's card on the chrome extension page

## Distribute
- increment the version in manifest.json
- run `gulp package`
- go to https://chrome.google.com/webstore/developer/dashboard
- upload package/tab-application-switcher-0.0.x.zip
