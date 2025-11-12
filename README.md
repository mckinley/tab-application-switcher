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

Start the Vite development server with hot module replacement:

```bash
npm run dev
```

This will:

- Build the extension in development mode
- Watch for file changes and rebuild automatically
- Enable hot module replacement for instant updates
- Output to the `dist` directory

### Load Extension in Chrome

1. Run the dev server: `npm run dev`
2. Open `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked extension"
5. Select the `dist` directory
6. For service worker debugging, click "service worker" link in the extension card

The extension will automatically reload when you make changes to the code.

### Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests once with Vitest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with Vitest UI
- `npm run lint` - Check code style with ESLint
- `npm run lint:fix` - Auto-fix code style issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run prep` - Run lint:fix, format, and test (pre-deployment check)
- `npm run pack` - Run prep, build, and create distribution zip
- `npm run release` - Interactive release script (creates tag, builds, and guides through GitHub release)

## Distribution

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` directory.

### Create Distribution Package

```bash
npm run pack
```

This will:

1. Run linting and formatting checks
2. Run tests
3. Build for production
4. Create a versioned zip file in the `package` directory

### Publish

1. Increment version in `app/manifest.json`
2. Run `npm run pack`
3. Upload `package/tab-application-switcher-x.x.x.zip` to:
   - [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard)
   - [Microsoft Edge Add-ons](https://partner.microsoft.com/en-us/dashboard/microsoftedge/fe1f2d5b-8edd-437a-bd83-daeddebedfca/packages/overview)

## Releasing

This project uses a streamlined release workflow:

### Quick Release

```bash
npm run release
```

This interactive script will:

1. Validate your working directory is clean
2. Run tests and linting
3. Prompt for the new version number
4. Update `manifest.json`
5. Build and package the extension
6. Create a git commit and tag
7. Provide instructions for pushing and creating a GitHub Release

### Manual Release Steps

If you prefer to do it manually:

```bash
# 1. Update version in manifest.json
# 2. Run tests and build
npm run pack

# 3. Commit and tag
git add app/manifest.json
git commit -m "chore: bump version to 1.2.3"
git tag -a v1.2.3 -m "Release v1.2.3"

# 4. Push
git push origin main
git push origin v1.2.3

# 5. Create GitHub Release at github.com/your-repo/releases/new
# 6. Upload package/tab-application-switcher-1.2.3.zip
```

### Automated GitHub Releases

When you push a tag (e.g., `v1.2.3`), GitHub Actions will automatically:

- Run tests and linting
- Build the extension
- Create a GitHub Release with the zip file attached
- Generate release notes from commits

### Version History

- **Git Tags**: All versions are tagged in git (e.g., `v0.1.0`)
- **GitHub Releases**: Download any version from the [Releases page](../../releases)
- **CHANGELOG.md**: Human-readable changelog following [Keep a Changelog](https://keepachangelog.com/)

## Build System

This project uses [Vite](https://vitejs.dev/) with the [@crxjs/vite-plugin](https://crxjs.dev/vite-plugin) for building the Chrome extension. Key features:

- **Fast Development**: Near-instant hot module replacement (HMR)
- **Modern Tooling**: Native ES modules and optimized builds
- **Chrome Extension Support**: Automatic manifest processing and content script handling
- **Testing**: Vitest for fast, Vite-native unit testing with jsdom
- **Code Quality**: ESLint for linting and Prettier for formatting
