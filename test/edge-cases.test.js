const assert = require('assert');
const unified = require('unified');
const markdown = require('remark-parse');
const visit = require('unist-util-visit');
const wikiLinkPlugin = require('../lib/index.js');

describe("Edge Cases and Error Handling", () => {
    describe("Invalid or Malformed Links", () => {
        it("ignores links with no content", () => {
            const processor = unified()
                .use(markdown)
                .use(wikiLinkPlugin);

            const ast = processor.runSync(processor.parse('[[]]'));
            let found = false;
            visit(ast, 'wikiLink', () => {
                found = true;
            });
            assert.strictEqual(found, false);
        });

        it("ignores unclosed links", () => {
            const processor = unified()
                .use(markdown)
                .use(wikiLinkPlugin);

            const ast = processor.runSync(processor.parse('[[Unclosed Link'));
            let found = false;
            visit(ast, 'wikiLink', () => {
                found = true;
            });
            assert.strictEqual(found, false);
        });

        it("ignores links with only whitespace", () => {
            const processor = unified()
                .use(markdown)
                .use(wikiLinkPlugin);

            const ast = processor.runSync(processor.parse('[[   ]]'));
            let found = false;
            visit(ast, 'wikiLink', () => {
                found = true;
            });
            assert.strictEqual(found, false);
        });
    });

    describe("Special Characters and Unicode", () => {
        it("handles unicode characters in page names", () => {
            const processor = unified()
                .use(markdown)
                .use(wikiLinkPlugin, {
                    permalinks: ['café-münchen']
                });

            const ast = processor.runSync(processor.parse('[[Café München]]'));
            visit(ast, 'wikiLink', (node) => {
                assert.strictEqual(node.value, 'Café München');
                assert.strictEqual(node.data.alias, 'Café München');
                assert.strictEqual(node.data.permalink, 'Café-München.html');
            });
        });

        it("handles special characters in page names", () => {
            const processor = unified()
                .use(markdown)
                .use(wikiLinkPlugin);

            const ast = processor.runSync(processor.parse('[[Page & Title (2023)]]'));
            visit(ast, 'wikiLink', (node) => {
                assert.strictEqual(node.value, 'Page & Title (2023)');
                assert.strictEqual(node.data.permalink, 'Page-&-Title-(2023).html');
            });
        });
    });

    describe("Nested and Mixed Content", () => {
        it("handles multiple wiki links in same paragraph", () => {
            const processor = unified()
                .use(markdown)
                .use(wikiLinkPlugin);

            const ast = processor.runSync(processor.parse('See [[Page One]] and [[Page Two]] for details.'));
            const links = [];
            visit(ast, 'wikiLink', (node) => {
                links.push(node.value);
            });
            assert.deepStrictEqual(links, ['Page One', 'Page Two']);
        });

        it("handles wiki links mixed with regular markdown links", () => {
            const processor = unified()
                .use(markdown)
                .use(wikiLinkPlugin);

            const ast = processor.runSync(processor.parse('See [[Internal Page]] and [external link](https://example.com).'));
            let wikiLinkCount = 0;
            let linkCount = 0;
            
            visit(ast, 'wikiLink', () => {
                wikiLinkCount++;
            });
            
            visit(ast, 'link', () => {
                linkCount++;
            });
            
            assert.strictEqual(wikiLinkCount, 1);
            assert.strictEqual(linkCount, 1);
        });
    });

    describe("Configuration Edge Cases", () => {
        it("handles empty permalinks array", () => {
            const processor = unified()
                .use(markdown)
                .use(wikiLinkPlugin, { permalinks: [] });

            const ast = processor.runSync(processor.parse('[[Any Page]]'));
            visit(ast, 'wikiLink', (node) => {
                assert.strictEqual(node.data.exists, false);
                assert.strictEqual(node.data.hProperties.className, 'wikilink new');
            });
        });

        it("handles null/undefined options gracefully", () => {
            const processor = unified()
                .use(markdown)
                .use(wikiLinkPlugin, null);

            const ast = processor.runSync(processor.parse('[[Test Page]]'));
            visit(ast, 'wikiLink', (node) => {
                assert.strictEqual(node.data.exists, false);
                assert.strictEqual(node.data.hProperties.className, 'wikilink new');
            });
        });

        it("handles empty string options", () => {
            const processor = unified()
                .use(markdown)
                .use(wikiLinkPlugin, {
                    htmlClass: '',
                    newClassName: '',
                    htmlPrefix: '',
                    htmlSuffix: '',
                    htmlSpace: ''
                });

            const ast = processor.runSync(processor.parse('[[Test Page]]'));
            visit(ast, 'wikiLink', (node) => {
                assert.strictEqual(node.data.hProperties.className, '');
                assert.strictEqual(node.data.permalink, 'TestPage');
            });
        });
    });

    describe("Performance and Stress Tests", () => {
        it("handles large number of links efficiently", () => {
            const processor = unified()
                .use(markdown)
                .use(wikiLinkPlugin);

            const manyLinks = Array.from({ length: 100 }, (_, i) => `[[Page ${i}]]`).join(' ');
            const ast = processor.runSync(processor.parse(manyLinks));
            
            let linkCount = 0;
            visit(ast, 'wikiLink', () => {
                linkCount++;
            });
            
            assert.strictEqual(linkCount, 100);
        });

        it("handles very long page names", () => {
            const processor = unified()
                .use(markdown)
                .use(wikiLinkPlugin);

            const longPageName = 'A'.repeat(1000);
            const ast = processor.runSync(processor.parse(`[[${longPageName}]]`));
            
            visit(ast, 'wikiLink', (node) => {
                assert.strictEqual(node.value, longPageName);
                assert.strictEqual(node.data.alias, longPageName);
            });
        });
    });
});