const assert = require('assert');
const unified = require('unified')
const markdown = require('remark-parse')
const visit = require('unist-util-visit');
const remark2markdown = require('remark-stringify');

const wikiLinkPlugin = require('../lib/index.js'); // Path to built file

describe("remark-wiki-link-a (MVP)", () => {
    describe("Core Parsing and HTML Property Generation", () => {
        it("parses a simple wiki link, page exists", () => {
            const processor = unified()
                .use(markdown)
                .use(wikiLinkPlugin, {
                    permalinks: ['wiki-link'] // Normalized key
                });

            const ast = processor.runSync(processor.parse('[[Wiki Link]]'));
            visit(ast, 'wikiLink', (node) => {
                assert.strictEqual(node.value, 'Wiki Link');
                assert.strictEqual(node.data.alias, 'Wiki Link');
                assert.strictEqual(node.data.exists, true);
                assert.strictEqual(node.data.permalink, 'Wiki-Link.html');
                assert.strictEqual(node.data.hName, 'a');
                assert.strictEqual(node.data.hProperties.className, 'wikilink');
                assert.strictEqual(node.data.hProperties.href, 'Wiki-Link.html');
                assert.deepStrictEqual(node.data.hChildren, [{ type: 'text', value: 'Wiki Link' }]);
            });
        });

        it("parses a simple wiki link, page does not exist", () => {
            const processor = unified()
                .use(markdown)
                .use(wikiLinkPlugin, {
                    permalinks: []
                });

            const ast = processor.runSync(processor.parse('[[New Page]]'));
            visit(ast, 'wikiLink', (node) => {
                assert.strictEqual(node.value, 'New Page');
                assert.strictEqual(node.data.alias, 'New Page');
                assert.strictEqual(node.data.exists, false);
                assert.strictEqual(node.data.permalink, 'New-Page.html');
                assert.strictEqual(node.data.hProperties.className, 'wikilink new');
                assert.strictEqual(node.data.hProperties.href, 'New-Page.html');
                assert.deepStrictEqual(node.data.hChildren, [{ type: 'text', value: 'New Page' }]);
            });
        });

        it("parses an aliased wiki link, page exists", () => {
            const processor = unified()
                .use(markdown)
                .use(wikiLinkPlugin, {
                    permalinks: ['real-page'] // Normalized key
                });

            const ast = processor.runSync(processor.parse('[[Real Page:Page Alias]]'));
            visit(ast, 'wikiLink', (node) => {
                assert.strictEqual(node.value, 'Real Page');
                assert.strictEqual(node.data.alias, 'Page Alias');
                assert.strictEqual(node.data.exists, true);
                assert.strictEqual(node.data.permalink, 'Real-Page.html');
                assert.strictEqual(node.data.hProperties.className, 'wikilink');
                assert.strictEqual(node.data.hProperties.href, 'Real-Page.html');
                assert.deepStrictEqual(node.data.hChildren, [{ type: 'text', value: 'Page Alias' }]);
            });
        });

        it("parses an aliased wiki link with colons in alias, page does not exist", () => {
            const processor = unified()
                .use(markdown)
                .use(wikiLinkPlugin, {
                    permalinks: []
                });

            // Uses indexOf(':') for alias separation now
            const ast = processor.runSync(processor.parse('[[My Page:Alias:With:Colons]]'));
            visit(ast, 'wikiLink', (node) => {
                assert.strictEqual(node.value, 'My Page');
                assert.strictEqual(node.data.alias, 'Alias:With:Colons');
                assert.strictEqual(node.data.exists, false);
                assert.strictEqual(node.data.permalink, 'My-Page.html');
                assert.strictEqual(node.data.hProperties.className, 'wikilink new');
                assert.strictEqual(node.data.hProperties.href, 'My-Page.html');
                assert.deepStrictEqual(node.data.hChildren, [{ type: 'text', value: 'Alias:With:Colons' }]);
            });
        });

        it("parses wiki link with leading/trailing spaces around content and alias parts", () => {
            const processor = unified()
                .use(markdown)
                .use(wikiLinkPlugin, { permalinks: ['page-name'] });

            const ast = processor.runSync(processor.parse('[[  Page Name  :  Display Text  ]]'));
            visit(ast, 'wikiLink', (node) => {
                assert.strictEqual(node.value, 'Page Name');
                assert.strictEqual(node.data.alias, 'Display Text');
                assert.strictEqual(node.data.exists, true);
            });
        });

        it("parses wiki link with only alias part like [[:Alias]] (uses Alias as pagename)", () => {
            const processor = unified()
                .use(markdown)
                .use(wikiLinkPlugin, { permalinks: ['actual-page'] });

            let ast = processor.runSync(processor.parse('[[:Implicit Page Name]]'));
            let visited = false;
            visit(ast, 'wikiLink', (node) => {
                visited = true;
                assert.strictEqual(node.value, 'Implicit Page Name');
                assert.strictEqual(node.data.alias, 'Implicit Page Name');
                assert.strictEqual(node.data.exists, false);
                assert.strictEqual(node.data.permalink, 'Implicit-Page-Name.html');
                assert.strictEqual(node.data.hProperties.className, 'wikilink new');
            });
            assert.ok(visited, "No wikiLink node found for [[:Implicit Page Name]]");
        });
    });

    describe("Configuration Options", () => {
        it("uses custom `htmlClass` and `newClassName`", () => {
            const processor = unified()
                .use(markdown)
                .use(wikiLinkPlugin, {
                    htmlClass: 'custom-link',
                    newClassName: 'missing-page',
                    permalinks: ['existing-page']
                });

            let ast = processor.runSync(processor.parse('[[Existing Page]]'));
            visit(ast, 'wikiLink', (node) => {
                assert.strictEqual(node.data.hProperties.className, 'custom-link');
            });

            ast = processor.runSync(processor.parse('[[Another Page]]'));
            visit(ast, 'wikiLink', (node) => {
                assert.strictEqual(node.data.hProperties.className, 'custom-link missing-page');
            });
        });

        it("uses custom `htmlPrefix`, `htmlSuffix`, and `htmlSpace`", () => {
            const processor = unified()
                .use(markdown)
                .use(wikiLinkPlugin, {
                    htmlPrefix: '/wiki/',
                    htmlSuffix: '',
                    htmlSpace: '_'
                });

            const ast = processor.runSync(processor.parse('[[My Page]]'));
            visit(ast, 'wikiLink', (node) => {
                assert.strictEqual(node.data.permalink, '/wiki/My_Page');
                assert.strictEqual(node.data.hProperties.href, '/wiki/My_Page');
            });
        });
    });

    // Stringification tests removed for MVP as the feature was removed from the plugin.
    // describe("Stringification", () => {
    //     it("stringifies a simple wiki link", () => {
    //         const processor = unified()
    //             .use(markdown)
    //             .use(wikiLinkPlugin)
    //             .use(remark2markdown);

    //         const stringified = processor.processSync('[[Simple Page]]').contents.trim();
    //         assert.strictEqual(stringified, '[[Simple Page]]');
    //     });

    //     it("stringifies an aliased wiki link", () => {
    //         const processor = unified()
    //             .use(markdown)
    //             .use(wikiLinkPlugin)
    //             .use(remark2markdown);

    //         const stringified = processor.processSync('[[Real Value:Display Alias]]').contents.trim();
    //         assert.strictEqual(stringified, '[[Real Value:Display Alias]]');
    //     });

    //     it("stringifies an aliased wiki link where alias is same as value", () => {
    //         const processor = unified()
    //             .use(markdown)
    //             .use(wikiLinkPlugin)
    //             .use(remark2markdown);
    //         const stringified = processor.processSync('[[Same:Same]]').contents.trim();
    //         assert.strictEqual(stringified, '[[Same]]');
    //     });
    // });
});
