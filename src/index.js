const LINK_REGEX = /^\[\[(.+?)\]\]/;

function locator (value, fromIndex) {
  return value.indexOf('[', fromIndex)
}

function wikiLinkPlugin(options = {}) {
    const settings = {
        permalinks: [],
        htmlClass: 'wikilink',
        htmlPrefix: '',
        htmlSuffix: '.html',
        htmlSpace: '-',
        newClassName: 'new',
        ...options
    };

    // This internal function is no longer needed as parsing logic will be in inlineTokenizer
    // function parsePageTitle(pageTitle) {
    //     return {
    //         name: pageTitle,
    //         displayName: pageTitle
    //     }
    // }

    function inlineTokenizer(eat, value) {
        const match = LINK_REGEX.exec(value);

        if (match) {
            const fullMatch = match[0]; // e.g., "[[Value:Alias]]"
            const content = match[1].trim(); // e.g., "Value:Alias"

            // Skip empty or whitespace-only links
            if (!content) {
                return;
            }

            let pageNameFromLink;
            let displayNameFromLink;

            const aliasSeparatorIndex = content.indexOf(':'); // Changed lastIndexOf to indexOf
            if (aliasSeparatorIndex !== -1) {
                pageNameFromLink = content.substring(0, aliasSeparatorIndex).trim();
                displayNameFromLink = content.substring(aliasSeparatorIndex + 1).trim();
                // If pageName is empty after split (e.g., "[[:Alias]]"), treat full content as name.
                if (!pageNameFromLink) {
                    pageNameFromLink = displayNameFromLink;
                }
            } else {
                pageNameFromLink = content;
                displayNameFromLink = content;
            }
             if (!displayNameFromLink) displayNameFromLink = pageNameFromLink;


            // Normalize pageName for checking in permalinks array
            const permalinkKey = pageNameFromLink.toLowerCase().replace(/ /g, '-');
            const pageExists = settings.permalinks.includes(permalinkKey);

            let classNames = settings.htmlClass;
            if (!pageExists) {
                classNames += ` ${settings.newClassName}`;
            }

            const href = settings.htmlPrefix + pageNameFromLink.replace(/ /g, settings.htmlSpace) + settings.htmlSuffix;

            return eat(fullMatch)({
                type: 'wikiLink',
                value: pageNameFromLink, // Canonical name
                data: {
                    alias: displayNameFromLink, // Text to display
                    exists: pageExists,
                    permalink: href, // Generated href
                    hName: 'a',
                    hProperties: {
                        className: classNames.trim(),
                        href: href
                    },
                    hChildren: [{
                        type: 'text',
                        value: displayNameFromLink
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

    // Stringification logic removed for MVP due to complexities with old library versions.
    // The plugin will focus on parsing and HTML transformation.
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
