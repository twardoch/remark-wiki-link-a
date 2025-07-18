# Installation Guide

This guide provides multiple ways to install and use `remark-wiki-link-a`.

## Quick Install

### NPM
```bash
npm install remark-wiki-link-a
```

### Yarn
```bash
yarn add remark-wiki-link-a
```

### PNPM
```bash
pnpm add remark-wiki-link-a
```

## Installation Methods

### 1. Package Manager (Recommended)

#### Using npm
```bash
# Install latest version
npm install remark-wiki-link-a

# Install specific version
npm install remark-wiki-link-a@1.0.0

# Install as dev dependency
npm install --save-dev remark-wiki-link-a
```

#### Using Yarn
```bash
# Install latest version
yarn add remark-wiki-link-a

# Install specific version
yarn add remark-wiki-link-a@1.0.0

# Install as dev dependency
yarn add --dev remark-wiki-link-a
```

#### Using PNPM
```bash
# Install latest version
pnpm add remark-wiki-link-a

# Install specific version
pnpm add remark-wiki-link-a@1.0.0

# Install as dev dependency
pnpm add --save-dev remark-wiki-link-a
```

### 2. Direct Download

Download the latest release from GitHub:

```bash
# Download and extract
curl -L https://github.com/twardoch/remark-wiki-link-a/archive/refs/tags/v1.0.0.tar.gz | tar -xz
cd remark-wiki-link-a-1.0.0
npm install
npm run build
```

### 3. Git Clone

```bash
# Clone repository
git clone https://github.com/twardoch/remark-wiki-link-a.git
cd remark-wiki-link-a

# Install dependencies
npm install

# Build from source
npm run build
```

### 4. One-line Install Script

```bash
curl -sSL https://raw.githubusercontent.com/twardoch/remark-wiki-link-a/master/scripts/install.sh | bash
```

## Usage

### Basic Usage

```javascript
const unified = require('unified');
const markdown = require('remark-parse');
const wikiLinkPlugin = require('remark-wiki-link-a');
const remark2rehype = require('remark-rehype');
const html = require('rehype-stringify');

const processor = unified()
  .use(markdown)
  .use(wikiLinkPlugin)
  .use(remark2rehype)
  .use(html);

const result = processor.processSync('[[Wiki Link]]');
console.log(String(result));
```

### With Options

```javascript
const processor = unified()
  .use(markdown)
  .use(wikiLinkPlugin, {
    permalinks: ['existing-page', 'another-page'],
    htmlPrefix: '/wiki/',
    htmlSuffix: '.html',
    htmlClass: 'wiki-link',
    newClassName: 'new-page'
  })
  .use(remark2rehype)
  .use(html);
```

## Project Integration

### Static Site Generators

#### Gatsby
```javascript
// gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: 'remark-wiki-link-a',
            options: {
              permalinks: ['page1', 'page2'],
              htmlPrefix: '/wiki/',
            }
          }
        ]
      }
    }
  ]
}
```

#### Next.js
```javascript
// next.config.js
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [
      ['remark-wiki-link-a', {
        permalinks: ['docs', 'guides'],
        htmlPrefix: '/docs/',
      }]
    ],
  },
})

module.exports = withMDX({
  pageExtensions: ['js', 'jsx', 'md', 'mdx'],
})
```

#### Hugo (with unified)
```javascript
// process-markdown.js
const unified = require('unified');
const markdown = require('remark-parse');
const wikiLinkPlugin = require('remark-wiki-link-a');
const stringify = require('remark-stringify');

const processor = unified()
  .use(markdown)
  .use(wikiLinkPlugin, {
    permalinks: process.env.HUGO_PERMALINKS?.split(',') || [],
    htmlPrefix: process.env.HUGO_BASE_URL || '/',
  })
  .use(stringify);

// Process files...
```

### Build Tools

#### Webpack
```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.md$/,
        use: [
          'html-loader',
          {
            loader: 'remark-loader',
            options: {
              plugins: [
                ['remark-wiki-link-a', {
                  permalinks: ['page1', 'page2'],
                  htmlPrefix: '/docs/',
                }]
              ]
            }
          }
        ]
      }
    ]
  }
}
```

#### Rollup
```javascript
// rollup.config.js
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import wikiLinkPlugin from 'remark-wiki-link-a';
import remarkStringify from 'remark-stringify';

const processor = unified()
  .use(remarkParse)
  .use(wikiLinkPlugin, {
    permalinks: ['docs', 'guides'],
    htmlPrefix: '/content/',
  })
  .use(remarkStringify);

export default {
  // ... rollup config
}
```

## Development Installation

For contributing to the project:

```bash
# Clone repository
git clone https://github.com/twardoch/remark-wiki-link-a.git
cd remark-wiki-link-a

# Install dependencies
npm install

# Run tests
npm test

# Build project
npm run build

# Run in watch mode
npm run watch
```

## Troubleshooting

### Common Issues

1. **Module not found**
   ```bash
   # Ensure you're in the right directory
   npm ls remark-wiki-link-a
   
   # Reinstall if needed
   npm uninstall remark-wiki-link-a
   npm install remark-wiki-link-a
   ```

2. **Version conflicts**
   ```bash
   # Check for peer dependency issues
   npm ls
   
   # Install missing peer dependencies
   npm install unified remark-parse remark-rehype rehype-stringify
   ```

3. **Build issues**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

### Getting Help

- **Documentation**: [README.md](README.md)
- **Issues**: [GitHub Issues](https://github.com/twardoch/remark-wiki-link-a/issues)
- **Development**: [DEVELOPMENT.md](DEVELOPMENT.md)

## System Requirements

- **Node.js**: 14.x or later
- **NPM**: 7.x or later (or equivalent yarn/pnpm)
- **Operating System**: Cross-platform (Windows, macOS, Linux)

## License

MIT © [Adam Twardoch](https://twardoch.github.io)