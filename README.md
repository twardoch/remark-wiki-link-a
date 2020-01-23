# remark-wiki-link-a

This [remark](https://github.com/wooorm/remark) plugin parses and renders `[[Wiki Links]]`. It is derived from the plugin by [landakram](https://github.com/landakram/remark-wiki-link).

* Parse wiki-style links and render them as anchors
* Parse aliased wiki links i.e `[[Real Page:Page Alias]]`

## Installation

[npm][npm]:

```bash
npm install remark-wiki-link-a
```

## Usage

```javascript
const unified = require('unified')
const markdown = require('remark-parse')
const wikiLinkPlugin = require('remark-wiki-link-a');

let processor = unified()
    .use(markdown, { gfm: true })
    .use(wikiLinkPlugin)
```

When the processor is run, wiki links will be parsed to a `wikiLink` node. 

If we have this markdown string: 

```
[[Test Page]]
```

A node will be created that looks like this:

```javascript
{
    value: 'Test Page',
    data: {
        alias: 'Test Page',
        permalink: 'Test-Page.html',
        exists: false,
        hName: 'a',
        hProperties: {
            className: 'wikilink',
            href: 'Test-Page.html'
        },
        hChildren: [{
            type: 'text',
            value: 'Test Page'
        }]
    }
}
```

* `data.alias`: The display name for this link
* `data.permalink`: The permalink for this page. This permalink is computed from `node.value` using `options.pageResolver`, which can be passed in when initializing the plugin. 
* `data.exists`: Whether the page exists. A page exists if its permalink is found in `options.permalinks`, passed when initializing the plugin.
* `data.hProperties.className`: Classes that are automatically attached to the `a` when it is rendered as HTML. These are configurable with `options.wikiLinkClassName` and `options.newClassName`. `options.newClassName` is attached when `data.exists` is false.
* `data.hProperties.href`: `href` value for the rendered `a`. This `href` is computed using `options.hrefTemplate`.

When rendered to HTML, we get:

```
<a class="wikilink" href="Test-Page.html">Test Page</a>
```

### Configuration options

- `options.stringify`: if `true`, replaces the wiki links by traditional links in Markdown; default: `false`
- `options.mdPrefix`: if `stringify` is true, the prefix added to the Markdown link; default: `""`
- `options.mdSuffix`: if `stringify` is true, the suffix added to the Markdown link; default: `".md"`
- `options.mdSpace`: if `stringify` is true, replace space with this; default: `"-"`
- `options.htmlClass`: add this class to the HTML `a` element; default: `wikilink`
- `options.htmlPrefix`: the prefix added to the HTML `a href` link; default: `""`
- `options.htmlSuffix`: the prefix added to the HTML `a href` link; default: `".html"`
- `options.htmlSpace`: replace space with this; default: `"-"`

