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
- Press `alt+q` to close TAS while holding the modifier key.

**Note for macOS users:** The `alt+esc` (Option+Escape) keyboard shortcut may conflict with macOS's "Speak Selection" feature. You can either:

- Use `alt+q` instead to close TAS while holding the modifier key, or
- Disable "Speak Selection" in System Settings:
  1. Open **System Settings** (Apple menu > System Settings)
  2. Click **Accessibility** in the sidebar
  3. Click **Spoken Content**
  4. Toggle off **Speak Selection**

Limitations:

- Tab Application Switcher will not automatically select a tab while focus is in the address bar (omnibox).
  If you find that your selected tab is not activating when you release the modifier key, you may need to click the desired tab in TAS with your mouse.
- Keyboard shortcuts will not activate TAS on the Chrome Web Store, on New Tab pages, or on other settings-like pages (urls starting with chrome://).
  Click the extension icon to activate TAS in these situations.
- It is possible that other extensions or system preferences can conflict with TAS keyboard shortcuts.
  The Options panel can be used to change TAS keyboard shortcuts. Further management can be done here: chrome://extensions/shortcuts

## Development

### Requirements

- Node.js 22.x (managed via asdf - see `.tool-versions`)

### Setup

```bash
npm install
```

### Development Mode

```bash
npm start
# or
npx gulp dev
```

### Load Extension in Chrome

1. Run the build: `npm start` or `npx gulp build`
2. Open `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked extension"
5. Select the `dist` directory
6. For service worker debugging, click "service worker" link in the extension card

### Type Checking

```bash
npm run typecheck
```

## Distribution

### Build for Production

```bash
npm run build
# or
npx gulp pack
```

### Publish

1. Increment version in `app/manifest.json`
2. Run `npm run build`
3. Upload `package/tab-application-switcher-x.x.x.zip` to:
   - [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard)
   - [Microsoft Edge Add-ons](https://partner.microsoft.com/en-us/dashboard/microsoftedge/fe1f2d5b-8edd-437a-bd83-daeddebedfca/packages/overview)
