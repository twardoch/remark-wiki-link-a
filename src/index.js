const map = require('unist-util-map');

const LINK_REGEX = /^\[\[(.+?)\]\]/;

function locator (value, fromIndex) {
  return value.indexOf('[', fromIndex)
}

function wikiLinkPlugin(opts = {}) {
    let permalinks = opts.permalinks || [];
    let rewrite = opts.stringify || false;
    let mdPrefix = opts.mdPrefix || '';
    let mdSuffix = opts.mdSuffix || '.md';
    let mdSpace = opts.mdSpace || '-';
    let htmlClass = opts.htmlClass || 'wikilink';
    let htmlPrefix = opts.htmlPrefix || mdPrefix;
    let htmlSuffix = opts.htmlSuffix || '.html';
    let htmlSpace = opts.htmlSpace || mdSpace;
    let defaultHrefTemplate = (permalink) => `${permalink}`
    let hrefTemplate = opts.hrefTemplate || defaultHrefTemplate

    function parsePageTitle(pageTitle) {
        return {
            name: pageTitle,
            displayName: pageTitle
        }
    }

    function inlineTokenizer(eat, value) {
        let match = LINK_REGEX.exec(value);

        if (match) {
            const pageName = match[1].trim();
            const { name, displayName } = parsePageTitle(pageName);

            let htmlLink =  htmlPrefix + name.replace(/ /g, htmlSpace) + htmlSuffix;

            let classNames = htmlClass;

            return eat(match[0])({
                type: 'wikiLink',
                value: name,
                data: {
                    alias: displayName,
                    permalink: htmlLink,
                    hName: 'a',
                    hProperties: {
                        className: classNames,
                        href: hrefTemplate(htmlLink)
                    },
                    hChildren: [{
                        type: 'text',
                        value: displayName
                    }]
                },
            });
        }
    }

    inlineTokenizer.locator = locator

    const Parser = this.Parser

    const inlineTokenizers = Parser.prototype.inlineTokenizers
    const inlineMethods = Parser.prototype.inlineMethods
    inlineTokenizers.wikiLink = inlineTokenizer
    inlineMethods.splice(inlineMethods.indexOf('link'), 0, 'wikiLink')

    // Stringify for wiki link
    const Compiler = this.Compiler

    if (Compiler != null) {
        const visitors = Compiler.prototype.visitors
        if (visitors) {
            visitors.wikiLink = function (node) {
                if (rewrite) {
                    return `[${node.value}](${mdPrefix}${node.value.replace(/ /g, mdSpace)}${mdSuffix})`
                }
                return `[[${node.value}]]`
            }
        }
    }
}

const unified = require('unified')
const markdown = require('remark-parse')
const visit = require('unist-util-visit');
const remark2rehype = require('remark-rehype');
const html = require('rehype-stringify');
const remark2markdown = require('remark-stringify');

let processor = unified()
    .use(markdown, { gfm: true, footnotes: true, yaml: true })
    // .use(remark2markdown)
    .use(wikiLinkPlugin, { permalinks: ['wiki_link', 'real_page'] })
    .use(remark2rehype)
    .use(html)


//console.log(processor.processSync('Hey here is a [[Wiki Link]]. Here is [[Another one]]. Here is an [[real page:aliased page]]. Here is a [normal link](https://google.com).'))

module.exports = wikiLinkPlugin
