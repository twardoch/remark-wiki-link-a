const assert = require('assert');
const unified = require('unified');
const markdown = require('remark-parse');
const remark2rehype = require('remark-rehype');
const html = require('rehype-stringify');
const wikiLinkPlugin = require('../lib/index.js');

describe("Integration Tests", () => {
    describe("Full HTML Output", () => {
        it("generates correct HTML for existing page", () => {
            const processor = unified()
                .use(markdown)
                .use(wikiLinkPlugin, {
                    permalinks: ['test-page'],
                    htmlPrefix: '/wiki/',
                    htmlSuffix: '.html'
                })
                .use(remark2rehype)
                .use(html);

            const result = processor.processSync('[[Test Page]]');
            const htmlOutput = String(result);
            
            assert.ok(htmlOutput.includes('<a class="wikilink" href="/wiki/Test-Page.html">Test Page</a>'));
        });

        it("generates correct HTML for non-existing page", () => {
            const processor = unified()
                .use(markdown)
                .use(wikiLinkPlugin, {
                    permalinks: [],
                    htmlPrefix: '/wiki/',
                    htmlSuffix: '.html'
                })
                .use(remark2rehype)
                .use(html);

            const result = processor.processSync('[[New Page]]');
            const htmlOutput = String(result);
            
            assert.ok(htmlOutput.includes('<a class="wikilink new" href="/wiki/New-Page.html">New Page</a>'));
        });

        it("generates correct HTML for aliased link", () => {
            const processor = unified()
                .use(markdown)
                .use(wikiLinkPlugin, {
                    permalinks: ['actual-page'],
                    htmlPrefix: '/docs/'
                })
                .use(remark2rehype)
                .use(html);

            const result = processor.processSync('[[Actual Page:Display Name]]');
            const htmlOutput = String(result);
            
            assert.ok(htmlOutput.includes('<a class="wikilink" href="/docs/Actual-Page.html">Display Name</a>'));
        });
    });

    describe("Mixed Content Processing", () => {
        it("processes wiki links alongside regular markdown", () => {
            const processor = unified()
                .use(markdown)
                .use(wikiLinkPlugin, {
                    permalinks: ['internal-page']
                })
                .use(remark2rehype)
                .use(html);

            const markdown_input = `# Title

This is a **paragraph** with a [[Internal Page]] and a [regular link](https://example.com).

- List item with [[Another Page]]
- Another item`;

            const result = processor.processSync(markdown_input);
            const htmlOutput = String(result);
            
            assert.ok(htmlOutput.includes('<h1>Title</h1>'));
            assert.ok(htmlOutput.includes('<strong>paragraph</strong>'));
            assert.ok(htmlOutput.includes('<a class="wikilink" href="Internal-Page.html">Internal Page</a>'));
            assert.ok(htmlOutput.includes('<a href="https://example.com">regular link</a>'));
            assert.ok(htmlOutput.includes('<a class="wikilink new" href="Another-Page.html">Another Page</a>'));
        });
    });

    describe("Complex Scenarios", () => {
        it("handles blog-style content with wiki links", () => {
            const processor = unified()
                .use(markdown)
                .use(wikiLinkPlugin, {
                    permalinks: ['javascript', 'node.js'],
                    htmlPrefix: '/topics/',
                    htmlSuffix: '/'
                })
                .use(remark2rehype)
                .use(html);

            const content = `# Learning Web Development

When starting with [[JavaScript]], you'll want to understand the fundamentals. 
Later, you can explore [[Node.js]] for server-side development.

For more advanced topics, check out [[React:React Framework]] and [[Vue.js]].`;

            const result = processor.processSync(content);
            const htmlOutput = String(result);
            
            assert.ok(htmlOutput.includes('<a class="wikilink" href="/topics/JavaScript/">JavaScript</a>'));
            assert.ok(htmlOutput.includes('<a class="wikilink" href="/topics/Node.js/">Node.js</a>'));
            assert.ok(htmlOutput.includes('<a class="wikilink new" href="/topics/React/">React Framework</a>'));
            assert.ok(htmlOutput.includes('<a class="wikilink new" href="/topics/Vue.js/">Vue.js</a>'));
        });

        it("handles documentation-style cross-references", () => {
            const processor = unified()
                .use(markdown)
                .use(wikiLinkPlugin, {
                    permalinks: ['api-reference', 'configuration'],
                    htmlPrefix: '/docs/',
                    htmlClass: 'doc-link',
                    newClassName: 'missing-doc'
                })
                .use(remark2rehype)
                .use(html);

            const content = `## Setup

1. Install the package
2. Configure it (see [[Configuration]])
3. Use the [[API Reference:API]] for implementation details

For troubleshooting, check [[Common Issues]].`;

            const result = processor.processSync(content);
            const htmlOutput = String(result);
            
            assert.ok(htmlOutput.includes('<a class="doc-link" href="/docs/Configuration.html">Configuration</a>'));
            assert.ok(htmlOutput.includes('<a class="doc-link" href="/docs/API-Reference.html">API</a>'));
            assert.ok(htmlOutput.includes('<a class="doc-link missing-doc" href="/docs/Common-Issues.html">Common Issues</a>'));
        });
    });

    describe("Real-world Configuration Examples", () => {
        it("works with static site generator-style config", () => {
            const processor = unified()
                .use(markdown)
                .use(wikiLinkPlugin, {
                    permalinks: ['home', 'about', 'contact'],
                    htmlPrefix: '/',
                    htmlSuffix: '',
                    htmlSpace: '-',
                    htmlClass: 'internal-link',
                    newClassName: 'new-page'
                })
                .use(remark2rehype)
                .use(html);

            const result = processor.processSync('Visit [[Home]], [[About]], or [[Contact]] pages. Also check [[New Feature]].'); 
            const htmlOutput = String(result);
            
            assert.ok(htmlOutput.includes('<a class="internal-link" href="/Home">Home</a>'));
            assert.ok(htmlOutput.includes('<a class="internal-link" href="/About">About</a>'));
            assert.ok(htmlOutput.includes('<a class="internal-link" href="/Contact">Contact</a>'));
            assert.ok(htmlOutput.includes('<a class="internal-link new-page" href="/New-Feature">New Feature</a>'));
        });

        it("works with wiki-style underscores", () => {
            const processor = unified()
                .use(markdown)
                .use(wikiLinkPlugin, {
                    permalinks: ['main-page', 'help-page'],
                    htmlPrefix: '/wiki/',
                    htmlSuffix: '.html',
                    htmlSpace: '_'
                })
                .use(remark2rehype)
                .use(html);

            const result = processor.processSync('See [[Main Page]] and [[Help Page]] for information.');
            const htmlOutput = String(result);
            
            assert.ok(htmlOutput.includes('<a class="wikilink" href="/wiki/Main_Page.html">Main Page</a>'));
            assert.ok(htmlOutput.includes('<a class="wikilink" href="/wiki/Help_Page.html">Help Page</a>'));
        });
    });
});