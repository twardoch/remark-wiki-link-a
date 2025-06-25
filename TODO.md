# TODO: Streamline remark-wiki-link-a for MVP

## Phase 1: Preparation & Option Refinement

- [x] **Project Setup & Initial Cleanup:**
    - [x] Create `CHANGELOG.md` (already exists, will be updated in Phase 4).
    - [x] In `package.json`: Remove `unist-util-map` from dependencies (confirmed not present).
    - [x] In `package.json`: Review `babel-polyfill` dependency (removed, `core-js` added for `@babel/preset-env`, `.babelrc` updated).
    - [x] In `src/index.js`: Remove `require('unist-util-map')` (confirmed not present).
- [x] **Refactor Options in `src/index.js`:**
    - [x] Define default options object for: `permalinks`, `htmlClass`, `htmlPrefix`, `htmlSuffix`, `htmlSpace`, `newClassName` (confirmed current structure meets MVP).
    - [x] Remove handling and references to old options: `rewrite`, `mdPrefix`, `mdSuffix`, `mdSpace`, `hrefTemplate`, `pageResolver`, `wikiLinkClassName` (confirmed not handled in current code).

## Phase 2: Core Logic Implementation (`src/index.js`)

- [x] **Update `inlineTokenizer`:** (Verified current implementation in `src/index.js` from `llms.txt` meets MVP requirements for parsing, node structure, and HTML properties. Uses first colon for alias separation, consistent with tests.)
    - [x] **Alias Parsing:** Logic parses `[[Value:Alias]]`, `[[Value]]`, `[[:Alias]]`, and handles spaces correctly.
        - [x] Stores canonical name in `node.value`.
        - [x] Stores display name in `node.data.alias`.
    - [x] **Permalink Key & Existence Check:**
        - [x] Generates a normalized `permalinkKey` from `node.value`.
        - [x] Sets `node.data.exists = settings.permalinks.includes(permalinkKey)`.
    - [x] **Node Structure:**
        - [x] `node.value` is the canonical page name.
        - [x] `node.data.alias` is the display text.
        - [x] `node.data.exists` is correctly set.
    - [x] **`hProperties.className`:**
        - [x] Set to `settings.htmlClass`.
        - [x] If `!node.data.exists`, appends `settings.newClassName`.
    - [x] **`hProperties.href` & `data.permalink`:**
        - [x] Generates `href` using `settings.htmlPrefix + node.value.replace(/ /g, settings.htmlSpace) + settings.htmlSuffix`.
        - [x] Assigns this generated `href` to both `node.data.permalink` and `node.data.hProperties.href`.
    - [x] **`hChildren`:**
        - [x] Sets `hChildren` to `[{ type: 'text', value: node.data.alias }]`.
- [x] **Address Stringification:** (Confirmed no stringification logic for `wikiLink` type in `src/index.js`. Comment explicitly states removal for MVP. `README.md` and `CHANGELOG.md` also state removal.)
    - [-] ~~Simplify `Compiler` (Stringifier)~~ (Task invalid as stringification is removed)
    - [-] ~~Remove logic related to the old `rewrite` option.~~
    - [-] ~~Stringify to `[[${node.value}]]` if alias is same as value or not present.~~
    - [-] ~~Stringify to `[[${node.value}:${node.data.alias}]]` if alias exists and is different.~~

## Phase 3: Testing & Documentation

- [x] **Update `test/index_test.js`:**
    - [x] Remove tests for all deprecated options (verified none existed for truly old options).
    - [x] Add/Update tests for alias parsing (various cases) (verified existing tests from `llms.txt` are comprehensive for MVP).
    - [x] Add/Update tests for `node.data.exists` (with permalink normalization) (verified existing tests cover this).
    - [x] Add/Update tests for `hProperties.className` (default and custom classes, new/existing states) (verified existing tests cover this).
    - [x] Add/Update tests for `hProperties.href` and `data.permalink` generation (verified existing tests cover this).
    - [x] Add/Update tests for `hChildren` content (display alias) (verified existing tests cover this).
    - [x] Remove stringify tests (done, also removed `remark-stringify` import and commented out test section).
- [x] **Update `README.md`:**
    - [x] Remove documentation for all deprecated options (verified, README from `llms.txt` was already good).
    - [x] Document current options: `permalinks`, `htmlClass`, `newClassName`, `htmlPrefix`, `htmlSuffix`, `htmlSpace` (verified, README from `llms.txt` was already good).
    - [x] Explain alias syntax `[[Page Name:Display Alias]]` (verified, README from `llms.txt` was mostly good, added clarification for `[[:Alias]]`).
    - [x] Update AST node structure example (verified, README from `llms.txt` was already good and reflects MVP).
    - [x] Update HTML output examples (verified, README from `llms.txt` was already good).
    - [x] Update basic usage example (verified, README from `llms.txt` was already good).
    - [x] Ensure note about stringification removal is clear (verified, README from `llms.txt` was already good).

## Phase 4: Finalization

- [x] **Run all tests:** `npm test` and ensure they pass.
- [x] **Manual Review:** Briefly review code changes and documentation.
- [x] **Update `CHANGELOG.md`:** Summarize all changes for this version/refactor (MVP 1.0.0).
- [ ] **Submit:** Commit all changes.
