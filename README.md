# remark-wiki-link-a (Streamlined MVP)

This [remark](https://github.com/wooorm/remark) plugin parses and renders `[[Wiki Links]]`. It is a streamlined version focusing on core functionality.

*   Parses `[[Wiki Links]]` and `[[Page Name:Display Alias]]` formats.
*   Renders them as HTML `<a>` tags.
*   Allows customization of HTML output (classes, href structure).
*   Checks for page existence against a provided list of permalinks.

## Installation

[npm][npm]:

```bash
npm install remark-wiki-link-a
```

## Usage

```javascript
const unified = require('unified');
const markdown = require('remark-parse');
const wikiLinkPlugin = require('remark-wiki-link-a');
const html = require('rehype-stringify'); // For converting to HTML
const remark2rehype = require('remark-rehype');

// Example: Process markdown to HTML
const processor = unified()
    .use(markdown)
    .use(wikiLinkPlugin, {
        permalinks: ['existing-page'] // Normalized keys: 'existing-page' from "Existing Page"
    })
    .use(remark2rehype)
    .use(html);

const markdownInput = "Here is a link to [[An Existing Page]] and one to [[A New Page:With Alias]].";
processor.process(markdownInput).then(result => {
    console.log(String(result));
    // Expected HTML (simplified):
    // <p>Here is a link to <a class="wikilink" href="An-Existing-Page.html">An Existing Page</a> and one to <a class="wikilink new" href="A-New-Page.html">With Alias</a>.</p>
});
```

## AST Node Structure

When a wiki link like `[[My Page:My Alias]]` is parsed, a `wikiLink` node is created:

```javascript
{
  type: 'wikiLink',
  value: 'My Page', // Canonical page name
  data: {
    alias: 'My Alias', // Display text for the link
    exists: false,     // Boolean, true if 'my-page' (normalized) is in options.permalinks
    permalink: 'My-Page.html', // Generated href string, e.g., using default htmlPrefix, htmlSuffix, htmlSpace
    hName: 'a',
    hProperties: {
      className: 'wikilink new', // e.g., 'wikilink' or 'wikilink new'
      href: 'My-Page.html'       // The actual href for the <a> tag
    },
    hChildren: [{
      type: 'text',
      value: 'My Alias' // Display text
    }]
  }
}
```

**Key Node Properties:**

*   `node.value`: The canonical name of the page (e.g., "My Page" from `[[My Page:Anything]]`). Used for generating the HREF and for the permalink existence check key.
*   `node.data.alias`: The text to be displayed for the link (e.g., "My Alias"). If no alias is specified (e.g., `[[My Page]]`), this defaults to `node.value`. If the link syntax `[[:My Alias]]` is used (colon at the beginning), "My Alias" will be used for both `node.value` (the page name) and `node.data.alias` (the display text).
*   `node.data.exists`: A boolean indicating if the page is considered to exist. This is determined by checking a normalized version of `node.value` (lowercase, spaces replaced by hyphens, e.g., "my-page") against the `options.permalinks` array.
*   `node.data.permalink`: The generated permalink (HREF string) for the link. This is identical to `node.data.hProperties.href`.
*   `node.data.hProperties.className`: The CSS class(es) for the generated `<a>` tag. By default, this is `wikilink`. If `node.data.exists` is `false`, ` new` (or `options.newClassName`) is appended.
*   `node.data.hProperties.href`: The actual HREF for the `<a>` tag.
*   `node.data.hChildren[0].value`: The display text, same as `node.data.alias`.

## Configuration Options

Options can be passed to `wikiLinkPlugin` as the second argument to `.use()`:

*   `permalinks` (Array of strings, default: `[]`):
    An array of known page permalink keys. The plugin normalizes the `value` of a wiki link (converts to lowercase, replaces spaces with hyphens) and checks if this key exists in the `permalinks` array to set `node.data.exists`.
    Example: `permalinks: ['home-page', 'about-us']` would match `[[Home Page]]` and `[[About Us]]`.

*   `htmlClass` (string, default: `'wikilink'`):
    The base CSS class name to apply to the generated `<a>` HTML element.

*   `newClassName` (string, default: `'new'`):
    The CSS class name to append to `htmlClass` if the page link does not exist in `permalinks`.

*   `htmlPrefix` (string, default: `''`):
    A prefix to prepend to the generated `href` value. Example: `'/wiki/'`.

*   `htmlSuffix` (string, default: `'.html'`):
    A suffix to append to the generated `href` value. Example: `''` or `'.php'`.

*   `htmlSpace` (string, default: `'-'`):
    The character used to replace spaces in the page name when generating the `href` value. Example: `'_'`.

## Stringification (Note)

This MVP version of the plugin focuses on parsing wiki links and rendering them to HTML. The functionality to stringify `wikiLink` AST nodes back into `[[PageName]]` or `[[PageName:DisplayAlias]]` markdown text has been removed due to complexities with older versions of underlying libraries. If you process an AST containing these `wikiLink` nodes with a standard `remark-stringify`, they will not be converted back to the wiki link syntax unless you provide a custom stringifier for the `wikiLink` node type.

