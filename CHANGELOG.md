# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0-mvp] - YYYY-MM-DD (To be filled with actual date)

### Added
- Core functionality for parsing `[[Wiki Links]]` and `[[Page Name:Display Alias]]`.
- HTML rendering with customizable classes (`htmlClass`, `newClassName`) and href structure (`htmlPrefix`, `htmlSuffix`, `htmlSpace`).
- Page existence check via `permalinks` option (uses normalized keys: lowercase, spaces to hyphens).
- Stringification of wikiLink nodes back to `[[Value]]` or `[[Value:Alias]]` format.

### Changed
- **Breaking Change:** Simplified plugin options significantly for an MVP focus.
  - `wikiLinkPlugin` now accepts a single options object with the following supported keys: `permalinks`, `htmlClass`, `newClassName`, `htmlPrefix`, `htmlSuffix`, `htmlSpace`.
- Internal alias parsing logic updated to use the last colon as a separator, allowing colons in page names.
- Default `htmlSuffix` is `.html`.
- Default `htmlSpace` is `-`.
- `node.value` now stores the canonical page name (part before alias).
- `node.data.alias` now stores the display name.
- `node.data.permalink` stores the generated href.
- `node.data.exists` boolean flag based on `permalinks` check.
- Updated `README.md` with new API and examples.
- Updated tests to reflect new functionality and options.

### Removed
- **Breaking Change:** Removed several options:
  - `rewrite` (and associated `mdPrefix`, `mdSuffix`, `mdSpace`)
  - `hrefTemplate`
  - `pageResolver`
  - `wikiLinkClassName` (functionality covered by `htmlClass`)
- Removed `unist-util-map` dependency as it was unused.
- Removed stringification functionality for `wikiLink` nodes from the plugin. (The plugin now focuses only on parsing and HTML transformation, the stringifier part was removed due to technical issues with older library versions).
