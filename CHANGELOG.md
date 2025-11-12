# Changelog

All notable changes to Tab Application Switcher will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Modern build system using Vite
- Vitest for testing
- ESLint for linting
- Fuzzy search using uFuzzy

### Changed

- Migrated from Gulp to Vite
- Migrated from Mocha/Chai to Vitest
- Migrated from StandardJS to ESLint
- Converted SCSS to plain CSS
- Improved CSS injection for content scripts

### Removed

- Gulp build system
- SASS/SCSS preprocessing
- StandardJS
- Legacy backwards compatibility code

## [0.1.0] - 2024-11-11

### Added

- Initial modern build setup

## [0.0.9] - 2021-04-30

Previous versions (0.0.1 - 0.0.9) used the legacy Gulp build system.

---

## How to Update This Changelog

When preparing a release:

1. Move items from `[Unreleased]` to a new version section
2. Add the release date
3. Follow these categories:
   - **Added** for new features
   - **Changed** for changes in existing functionality
   - **Deprecated** for soon-to-be removed features
   - **Removed** for now removed features
   - **Fixed** for any bug fixes
   - **Security** for vulnerability fixes

Example:

```markdown
## [1.2.0] - 2024-11-15

### Added

- New keyboard shortcut for closing tabs

### Fixed

- Fixed issue with tab switching on certain websites
```
