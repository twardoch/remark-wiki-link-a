# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0-mvp] - 2025-06-25

### Added
- Core functionality for parsing `[[Wiki Links]]`, `[[Page Name:Display Alias]]`, and `[[:Alias]]` (where alias becomes page name).
- HTML rendering with customizable classes (`htmlClass`, `newClassName`) and href structure (`htmlPrefix`, `htmlSuffix`, `htmlSpace`).
- Page existence check via `permalinks` option (uses normalized keys: lowercase, spaces to hyphens).

### Changed
- **Breaking Change:** Simplified plugin options significantly for an MVP focus.
  - `wikiLinkPlugin` now accepts a single options object with the following supported keys: `permalinks`, `htmlClass`, `newClassName`, `htmlPrefix`, `htmlSuffix`, `htmlSpace`.
- Internal alias parsing logic uses the *first* colon as a separator (e.g., `[[Page:Name:With:Colons]]` results in `Page` as name and `Name:With:Colons` as alias), consistent with provided tests and source code comments.
- Default `htmlSuffix` is `.html`.
- Default `htmlSpace` is `-`.
- `node.value` stores the canonical page name (part before the first colon in an alias, or the full content if no alias, or the alias itself in `[[:Alias]]` syntax).
- `node.data.alias` stores the display name (part after the first colon, or the full content if no alias).
- `node.data.permalink` stores the generated href.
- `node.data.exists` boolean flag based on `permalinks` check.
- Updated `README.md` with new API, examples, and clarification on `[[:Alias]]` syntax.
- Updated tests to reflect new functionality and options, and removed stringification tests.
- Replaced `babel-polyfill` with `core-js@3` managed by `@babel/preset-env` for more efficient polyfilling. `.babelrc` updated accordingly.

### Removed
- **Breaking Change:** Removed several options from previous non-MVP versions (these were not present in the baseline MVP code but are noted for historical context if upgrading):
  - `rewrite` (and associated `mdPrefix`, `mdSuffix`, `mdSpace`)
  - `hrefTemplate`
  - `pageResolver`
  - `wikiLinkClassName` (functionality covered by `htmlClass`)
- Removed `babel-polyfill` dependency.
- Confirmed `unist-util-map` dependency was not present and is not used.
- **Removed stringification functionality for `wikiLink` nodes from the plugin.** The plugin now focuses only on parsing and HTML transformation. Stringifying `wikiLink` nodes back to markdown is no longer supported by this plugin.
