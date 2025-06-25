# Project Plan: Streamline remark-wiki-link-a for MVP

This document outlines the plan to refactor `remark-wiki-link-a` to a Minimum Viable Product (MVP) state.

## Overall Goal:
Simplify the plugin by removing less critical features and options, focusing on core wiki link parsing and HTML rendering. Update tests and documentation to match the streamlined functionality.

## Phases:

1.  **Phase 1: Preparation & Option Refinement**
    *   **Project Setup & Initial Cleanup:**
        *   [x] Create `PLAN.md` (this file).
        *   [x] In `package.json`: Remove `unist-util-map` from dependencies (confirmed not present).
        *   [x] In `package.json`: Review `babel-polyfill` dependency (removed, `core-js` added for `@babel/preset-env`).
        *   [x] In `src/index.js`: Remove `require('unist-util-map')` if it exists (confirmed not present).
    *   **Refactor Options in `src/index.js`:**
        *   [x] Define default options object for: `permalinks`, `htmlClass`, `htmlPrefix`, `htmlSuffix`, `htmlSpace`, `newClassName` (confirmed current structure meets MVP).
        *   [x] Remove handling and references to old options: `rewrite`, `mdPrefix`, `mdSuffix`, `mdSpace`, `hrefTemplate`, `pageResolver`, `wikiLinkClassName` (confirmed not handled in current code).

2.  **Phase 2: Core Logic Implementation (`src/index.js`)**
    *   **Update `inlineTokenizer`:** (Verified current implementation in `src/index.js` meets MVP requirements)
        *   [x] **Alias Parsing:** Logic parses `[[Value:Alias]]`, `[[Value]]`, `[[:Alias]]`, and handles spaces correctly using the first colon as a separator.
            *   [x] Stores canonical name in `node.value`.
            *   [x] Stores display name in `node.data.alias`.
            *   [x] Handles `[[:Alias]]` by setting page name from alias.
            *   [x] Trims leading/trailing spaces.
        *   [x] **Permalink Key & Existence Check:**
            *   [x] Generates normalized `permalinkKey`.
            *   [x] Sets `node.data.exists` based on `settings.permalinks`.
        *   [x] **Node Structure:**
            *   [x] Ensures correct `node.value`, `node.data.alias`, `node.data.exists`.
        *   [x] **`hProperties.className`:**
            *   [x] Sets based on `settings.htmlClass` and `settings.newClassName` if page doesn't exist.
        *   [x] **`hProperties.href` & `data.permalink`:**
            *   [x] Generates `href` using settings.
        *   [x] **`hChildren`:**
            *   [x] Sets to `[{ type: 'text', value: node.data.alias }]`.
    *   **Address Stringification:**
        *   [x] Confirm removal of stringification logic from `src/index.js` (confirmed: no stringifier for `wikiLink` type, and a comment indicates its removal).

3.  **Phase 3: Testing & Documentation**
    *   **Update `test/index_test.js`:**
        *   [x] Remove tests for deprecated options (verified no tests for very old options; stringification tests removed).
        *   [x] Add/Update tests for new core functionality (alias parsing, existence check, HTML properties, custom options) (verified existing tests from `llms.txt` are comprehensive for MVP).
        *   [x] Remove stringification tests (done, including `remark-stringify` import and commented test block).
    *   **Update `README.md`:**
        *   [x] Remove documentation for deprecated options (verified `README.md` from `llms.txt` was already focused on MVP options).
        *   [x] Document current options and alias syntax (verified `README.md` from `llms.txt` was good, added specific clarification for `[[:Alias]]` syntax).
        *   [x] Update AST examples and usage (verified `README.md` from `llms.txt` already reflected MVP AST and usage).
        *   [x] Clarify removal of stringification (verified `README.md` from `llms.txt` had a clear note).
    *   **Update `TODO.md`:**
        *   [x] Mark completed tasks for Phase 3.
        *   [x] Adjust tasks related to stringification (stringification tasks were already addressed in Phase 2's `TODO.md` update).

4.  **Phase 4: Finalization**
    *   [x] Run all tests: `npm test` (passed).
    *   [x] Update `CHANGELOG.md` (date, summary) (done).
    *   [x] Manual Review (done).
    *   [ ] Submit.
