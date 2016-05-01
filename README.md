# Tab Application Switcher

- Its like your systems Application Switcher, but for your Chrome tabs.
- Quickly get a view of all your open tabs when they get crowded at the top of your browser.
- Includes page title, and icon if present on the tabbed page, and a tool-tip containing the tab's url.

Tracking features and tasks with [waffle.io](https://waffle.io/mckinley/tab-application-switcher).

## Development
- run `npm install`
- run `node_modules/.bin/gulp dev`
- go to `chrome://extensions/`
- click 'Load unpacked extension...'
- select the `dist` directory
- click 'background page' if you want to see console output for the background script.

## Usage
- hold `Command` and move backwards and forwards through your tab history with `Alt` and `Control`
- release the `Command` key to select the highlighted tab
- works across windows
