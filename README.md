# Tab Application Switcher

- It's like your system's Application Switcher, but for your Chrome tabs.
- Tabs can be accessed with intelligent key commands.
- Tabs in the default display are ordered by their use. The last tab you used is the first tab to select.
- Tabs can be searched by url and page title.
- Display appears in your current window if you use the configurable key commands. It is also available as an extension action in the chrome menu area.

## Development
- run `npm install`
- run `node_modules/.bin/gulp dev`
- go to `chrome://extensions/`
- click 'Load unpacked extension...'
- select the `dist` directory

## Example of default key command usage
- Hold `Alt`. Press `Tab` to move back through your most recent tabs.
- Continue holding `Alt`, press `` ` `` to move forward though your tabs.
- Release `Alt` to select your currently highlighted tab.
