# remark-wiki-link-a

**Parse and render wiki-style links in Markdown.**

`remark-wiki-link-a` is a [remark](https://github.com/remarkjs/remark) plugin that transforms wiki-style links (like `[[Page Name]]` or `[[Page Name:Link Text]]`) in your Markdown files into HTML links. It's designed for users of the [unified](https://unifiedjs.com/) ecosystem who want to incorporate wiki-like internal linking into their content.

This plugin is useful for creating personal wikis, documentation sites, or any project where you want a simple way to cross-reference Markdown documents. It allows for easy creation of links without writing full Markdown link syntax and can visually distinguish between links to existing and non-existing pages.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Programmatic Usage](#programmatic-usage)
  - [CLI Usage](#cli-usage)
- [Syntax Supported](#syntax-supported)
- [Options](#options)
- [How it Works](#how-it-works)
  - [AST Node](#ast-node)
  - [HTML Output](#html-output)
- [Development and Contribution](#development-and-contribution)
  - [Building](#building)
  - [Testing](#testing)
  - [Coding Style](#coding-style)
  - [Contributing](#contributing)
- [License](#license)

## Installation

You can install `remark-wiki-link-a` using npm:

```bash
npm install remark-wiki-link-a
```

Or using yarn:

```bash
yarn add remark-wiki-link-a
```

## Usage

### Programmatic Usage

The primary way to use `remark-wiki-link-a` is within a `unified` processor pipeline.

```javascript
const unified = require('unified');
const markdown = require('remark-parse');
const wikiLinkPlugin = require('remark-wiki-link-a');
const remark2rehype = require('remark-rehype');
const html = require('rehype-stringify');

const processor = unified()
  .use(markdown)
  .use(wikiLinkPlugin, {
    permalinks: ['existing-page', 'another-topic'], // Normalized permalinks
    htmlPrefix: '/wiki/',
  })
  .use(remark2rehype)
  .use(html);

const markdownInput = `
Here is a link to an [[Existing Page]].
Here is a link to a [[New Page]].
And an aliased link to [[Another Topic:Cool Topic]].
This one has a leading colon [[:My Page]].
`;

processor.process(markdownInput).then((file) => {
  console.log(String(file));
});
```

This would output HTML similar to:

```html
<p>Here is a link to an <a href="/wiki/Existing-Page.html" class="wikilink">Existing Page</a>.
Here is a link to a <a href="/wiki/New-Page.html" class="wikilink new">New Page</a>.
And an aliased link to <a href="/wiki/Another-Topic.html" class="wikilink">Cool Topic</a>.
This one has a leading colon <a href="/wiki/My-Page.html" class="wikilink new">My Page</a>.</p>
```

### CLI Usage

`remark-wiki-link-a` itself does not provide a standalone CLI. However, you can use it with tools that process Markdown via remark plugins, such as certain static site generators or Markdown processors that allow plugin configuration. The specific method will depend on the tool you are using. Generally, you'll install this plugin and add it to the list of remark plugins in your tool's configuration.

## Syntax Supported

The plugin recognizes the following wiki link syntaxes:

1.  **Simple Link**: `[[Page Name]]`
    *   Links to `Page Name`.
    *   Displays `Page Name` as the link text.
    *   Example: `[[My Document]]`

2.  **Aliased Link**: `[[Page Name:Display Text]]`
    *   Links to `Page Name`.
    *   Displays `Display Text` as the link text.
    *   The *first* colon (`:`) acts as the separator.
    *   Example: `[[Project Alpha:Details about Alpha]]` will link to `Project Alpha` and display "Details about Alpha".
    *   Example with multiple colons: `[[config:general:settings:User Preferences]]` will link to `config` and display "general:settings:User Preferences".

3.  **Leading Colon Link**: `[[:Display Text]]`
    *   Links to `Display Text`.
    *   Displays `Display Text` as the link text.
    *   This is useful when the desired display text and page name are the same, and you want to ensure it's not misinterpreted as an aliased link if the text contains a colon.
    *   Example: `[[:About Us]]`

Whitespace around the page name and display text within the brackets is trimmed.

## Options

You can pass an options object as the second argument to `use(wikiLinkPlugin, options)`.

*   `permalinks` (default: `[]`): An array of strings representing existing page names. These should be the *normalized* page names (lowercase, with spaces replaced by hyphens `-`). The plugin uses this list to determine if a linked page `exists` and to apply the `newClassName` if it doesn't.
    *   Example: For a link `[[My Cool Page]]`, the corresponding entry in `permalinks` should be `my-cool-page`.
*   `htmlClass` (default: `'wikilink'`): The base CSS class name to apply to the generated `<a>` tags.
*   `newClassName` (default: `'new'`): CSS class name to append if the linked page is not found in `permalinks`.
*   `htmlPrefix` (default: `''`): A string to prepend to the generated `href`. Useful for specifying a base path, e.g., `'/notes/'`.
*   `htmlSuffix` (default: `'.html'`): A string to append to the generated `href`.
*   `htmlSpace` (default: `'-'`): The character used to replace spaces in page names when generating the `href`.

Example with options:

```javascript
.use(wikiLinkPlugin, {
  permalinks: ['home-page', 'contact-us'],
  htmlClass: 'internal-link',
  newClassName: 'missing',
  htmlPrefix: '/docs/',
  htmlSuffix: '',
  htmlSpace: '_'
})
```

A link `[[Home Page]]` would become:
`<a href="/docs/Home_Page" class="internal-link">Home Page</a>`

A link `[[About Us]]` (not in `permalinks`) would become:
`<a href="/docs/About_Us" class="internal-link missing">About Us</a>`

## How it Works

This plugin works by tapping into the remark parsing process. It defines an `inlineTokenizer` that looks for the `[[...]]` syntax.

### AST Node

When a wiki link is found, it creates a node in the Markdown AST (Abstract Syntax Tree) with the type `wikiLink`. This node contains the following properties:

*   `type: 'wikiLink'`
*   `value: string`: The canonical page name (e.g., "Page Name" from `[[Page Name:Alias]]` or `[[Page Name]]`).
*   `data`: An object containing:
    *   `alias: string`: The text to be displayed for the link (e.g., "Alias" from `[[Page Name:Alias]]`, or "Page Name" from `[[Page Name]]`).
    *   `exists: boolean`: `true` if the normalized `value` is found in the `permalinks` option, `false` otherwise.
    *   `permalink: string`: The fully generated href for the link (e.g., `/prefix/Page-Name.html`).
    *   `hName: 'a'`: Specifies that this node should be transformed into an `<a>` HTML tag.
    *   `hProperties`: An object with properties for the HTML tag:
        *   `className: string`: The CSS class(es) for the link.
        *   `href: string`: The URL for the link (same as `data.permalink`).
    *   `hChildren`: An array containing a single text node for the link's content:
        *   `[{ type: 'text', value: data.alias }]`

Example AST node for `[[My Page:Show This]]` (assuming `my-page` is in `permalinks` and default options):

```json
{
  "type": "wikiLink",
  "value": "My Page",
  "data": {
    "alias": "Show This",
    "exists": true,
    "permalink": "My-Page.html",
    "hName": "a",
    "hProperties": {
      "className": "wikilink",
      "href": "My-Page.html"
    },
    "hChildren": [
      {
        "type": "text",
        "value": "Show This"
      }
    ]
  }
}
```

This AST node is then typically processed by `remark-rehype` to generate the final HTML.

**Note on Stringification**: This plugin focuses on parsing wiki links and preparing them for HTML transformation. It does *not* handle stringifying `wikiLink` nodes back into the `[[...]]` Markdown syntax.

### HTML Output

The `hName`, `hProperties`, and `hChildren` data on the AST node guide `remark-rehype` (or similar tools) in generating HTML. The default output is an `<a>` tag.

*   The `href` is constructed from `htmlPrefix` + `pageName` (with spaces replaced by `htmlSpace`) + `htmlSuffix`.
*   The `class` attribute includes `htmlClass` and, if applicable, `newClassName`.
*   The link text is the `alias`.

## Development and Contribution

### Building

The source code is in `src/index.js` and is written in ES6+. It needs to be transpiled by Babel to be compatible with older Node.js versions. The output is placed in the `lib` directory.

To build the code:

```bash
npm run build
```

This uses the script: `babel src --out-dir lib`.

The `prepare` script (`npm run build`) in `package.json` ensures that the code is built automatically when you install dependencies.

### Testing

Tests are written using [Mocha](https://mochajs.org/) and can be found in `test/index_test.js`. Tests cover parsing logic, option handling, and AST node structure.

To run the tests:

```bash
npm test
```

This script first builds the code and then runs Mocha.

### Coding Style

While there isn't a strict linting setup enforced in the current `package.json`, contributions should aim to follow common JavaScript best practices and maintain consistency with the existing codebase.

Key aspects of the current style:

*   Uses `const` and `let` appropriately.
*   Generally follows Airbnb style guide conventions (though not strictly enforced).
*   Comments are used to explain complex logic or decisions.

### Contributing

Contributions are welcome! If you find a bug or have a feature request, please open an issue on the [GitHub repository](https://github.com/twardoch/remark-wiki-link-a/issues).

If you'd like to contribute code:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes, including adding or updating tests.
4.  Ensure all tests pass (`npm test`).
5.  Submit a pull request.

Please ensure your pull request clearly describes the problem and solution. Include any relevant issue numbers.

## License

[MIT](LICENSE) © [Adam Twardoch](https://twardoch.github.io) (original author of this version), [Mark Hudnall](https://github.com/markhudnall) (author of earlier versions/inspirations).
