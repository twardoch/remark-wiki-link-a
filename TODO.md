# TODO: Streamline remark-wiki-link-a for MVP

## Phase 1: Preparation & Option Refinement

- [ ] **Project Setup & Initial Cleanup:**
    - [ ] Create `CHANGELOG.md`.
    - [ ] In `package.json`: Remove `unist-util-map` from dependencies.
    - [ ] In `package.json`: Review `babel-polyfill` dependency (potential removal).
    - [ ] In `src/index.js`: Remove `require('unist-util-map')`.
- [ ] **Refactor Options in `src/index.js`:**
    - [ ] Define default options object for: `permalinks`, `htmlClass`, `htmlPrefix`, `htmlSuffix`, `htmlSpace`, `newClassName`.
    - [ ] Remove handling and references to old options: `rewrite`, `mdPrefix`, `mdSuffix`, `mdSpace`, `hrefTemplate`, `pageResolver`, `wikiLinkClassName`.

## Phase 2: Core Logic Implementation (`src/index.js`)

- [ ] **Update `inlineTokenizer`:**
    - [ ] **Alias Parsing:** Implement logic to parse `[[Value:Alias]]` and `[[Value]]`.
        - Store canonical name in `node.value`.
        - Store display name in `node.data.alias`.
    - [ ] **Permalink Key & Existence Check:**
        - Generate a normalized `permalinkKey` from `node.value` (e.g., lowercase, spaces to hyphens).
        - Set `node.data.exists = settings.permalinks.includes(permalinkKey)`.
    - [ ] **Node Structure:**
        - Ensure `node.value` is the canonical page name.
        - Ensure `node.data.alias` is the display text.
        - Ensure `node.data.exists` is correctly set.
    - [ ] **`hProperties.className`:**
        - Set to `settings.htmlClass`.
        - If `!node.data.exists`, append `settings.newClassName`.
    - [ ] **`hProperties.href` & `data.permalink`:**
        - Generate `href` using `settings.htmlPrefix + node.value.replace(/ /g, settings.htmlSpace) + settings.htmlSuffix`.
        - Assign this generated `href` to both `node.data.permalink` and `node.data.hProperties.href`.
    - [ ] **`hChildren`:**
        - Set `hChildren` to `[{ type: 'text', value: node.data.alias }]`.
- [ ] **Simplify `Compiler` (Stringifier):**
    - [ ] Remove logic related to the old `rewrite` option.
    - [ ] Stringify to `[[${node.value}]]` if alias is same as value or not present.
    - [ ] Stringify to `[[${node.value}:${node.data.alias}]]` if alias exists and is different.

## Phase 3: Testing & Documentation

- [ ] **Update `test/index_test.js`:**
    - [ ] Remove tests for all deprecated options.
    - [ ] Add/Update tests for alias parsing (various cases).
    - [ ] Add/Update tests for `node.data.exists` (with permalink normalization).
    - [ ] Add/Update tests for `hProperties.className` (default and custom classes, new/existing states).
    - [ ] Add/Update tests for `hProperties.href` and `data.permalink` generation.
    - [ ] Add/Update tests for `hChildren` content (display alias).
    - [ ] Add/Update stringify tests for `[[Value]]` and `[[Value:Alias]]` formats.
- [ ] **Update `README.md`:**
    - [ ] Remove documentation for all deprecated options.
    - [ ] Document current options: `permalinks`, `htmlClass`, `newClassName`, `htmlPrefix`, `htmlSuffix`, `htmlSpace`.
    - [ ] Explain alias syntax `[[Page Name:Display Alias]]`.
    - [ ] Update AST node structure example.
    - [ ] Update HTML output examples.
    - [ ] Update basic usage example.

## Phase 4: Finalization

- [ ] **Run all tests:** `npm test` and ensure they pass.
- [ ] **Manual Review:** Briefly review code changes and documentation.
- [ ] **Update `CHANGELOG.md`:** Summarize all changes for this version/refactor.
- [ ] **Submit:** Commit all changes.
