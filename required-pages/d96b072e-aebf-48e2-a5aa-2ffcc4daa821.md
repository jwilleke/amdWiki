---
title: FootnotesPlugin
uuid: d96b072e-aebf-48e2-a5aa-2ffcc4daa821
system-category: documentation
user-keywords:
  - FootnotesPlugin
  - footnotes
  - references
  - external links
  - citations
slug: footnotesplugin
lastModified: '2026-04-21T00:00:00.000Z'
author: system
---
# FootnotesPlugin

[{FootnotesPlugin}] collects all footnote definitions from the current page and renders them as a numbered reference list.

## Description

FootnotesPlugin reads the raw content of the current page and extracts footnote entries in any of three formats. It renders them as a sorted, numbered list — typically shown in the Footnotes tab of the page tab section.

The plugin is automatically included in the default [Template:PageTabs] configuration. It can also be placed inline on any page.

## Footnote Formats

Three formats are recognised:

%%table-striped
|| Format || Example || Notes ||
| Markdown definition | `[^1]: Some text or https://example.com` | Standard markdown footnote definition |
| Bullet (preferred) | `* [^1] - [Link text\|Wikipedia:Page]` | Preferred format; supports wiki link syntax |
| Bullet (legacy) | `* [#1] - [Link text\|Wikipedia:Page]` | JSPWiki-compatible; still supported |
/%

Footnote numbers are sorted numerically. Named ids (non-numeric) sort lexically after numbers.

## Wiki Link Syntax in Footnotes

The bullet formats support wiki link syntax in the footnote content:

```
* [^1] - [Washington Post|https://www.washingtonpost.com]
* [^2] - [Application Performance Management|Wikipedia:Application_performance_management]
```

Interwiki prefixes (e.g. `Wikipedia:`, `MDN:`) are resolved using the site's interwiki configuration. Links without a recognised prefix are treated as literal URLs. All external links open in a new tab.

## Adding Footnotes to a Page

To add a footnote reference inline and define the footnote at the bottom of the page:

```
The study showed significant results.[^1]

* [^1] - [Smith et al. 2023|https://example.com/study]
```

External markdown links are automatically converted to footnote form by the site's migration tooling — `[text](https://url)` becomes `text[^N]` with a corresponding `* [^N]` bullet appended.

## Syntax

```
[{FootnotesPlugin}]
[{FootnotesPlugin noheader='true'}]
```

## Parameters

%%table-striped
|| Parameter || Type || Default || Description ||
| `noheader` | boolean | `false` | Suppress the "Footnotes" heading. Pass `true` when embedding inside a tab (e.g. [Template:PageTabs]). |
/%

## Examples

[[{FootnotesPlugin}] renders as:

[{FootnotesPlugin}]

## Notes

- The plugin reads the **raw page source**, not the rendered output. Footnotes inside code blocks are still extracted.
- If the page has no footnote definitions, the plugin renders: *No footnotes on this page.*
- The `[^id]` inline references (e.g. `text[^1]`) are rendered by the markdown parser; FootnotesPlugin only renders the definition list.
- Bare `https://` URLs in `[^id]: url` style definitions are auto-linked.
