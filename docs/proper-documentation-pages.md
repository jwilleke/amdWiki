---
title: Proper Documentation Pages
uuid: 40a798cc-3d17-410e-9087-5a2a5ab396bb
system-category: developer
user-keywords:
  - Documentation
  - Standards
  - Style Guide
  - Authoring
slug: proper-documentation-pages
lastModified: '2026-04-18T00:00:00.000Z'
author: system
---
# Proper Documentation Pages

This page describes the standards and conventions for writing documentation pages on this site. Follow these guidelines when creating or editing any page with `system-category` of `system` or `documentation`.

## Naming and Branding

Do not use the word "Wiki" to describe this site or its features. Pages, content, markup, and plugins are the vocabulary — not wiki pages, wiki markup, or wiki syntax.

Use the site name (visible in [{ConfigAccessor type='siteName'}]) when referring to the platform, or simply say "this site."

## Page Structure

Every documentation page should follow this structure:

| Section | Required | Notes |
| --- | --- | --- |
| Short opening paragraph | Yes | One sentence explaining what the page covers |
| `## Description` or topical `##` sections | Yes | Main content |
| `## Syntax` | For plugins | Show the markup pattern |
| `## Parameters` | For plugins | Table of all parameters |
| `## Examples` | Recommended | Live rendered examples (see below) |
| `## Notes` | As needed | Edge cases, caveats, limitations |
| `## More Information` | Yes | Always the last section |

The `## More Information` section must always end the page with the referring-pages footer:

```
## More Information

There might be more information for this subject on one of the following:
[{ReferringPagesPlugin before='*' after='\n' }]
```

## Writing Style

- Write for end users, not developers. Assume the reader knows what they want to accomplish, not how the code works.
- Use active voice and present tense: "The plugin displays…" not "The plugin will display…"
- Keep the opening paragraph to one sentence. Expand in `## Description`.
- Avoid unexplained jargon. If a term needs explanation, link to the page that explains it.

## Links and Cross-References

Use the site's [Linking] system for all internal cross-references. Do not hard-code URLs.

Prefer inline links over "Related Pages" or "See Also" sections — place the link in context where the reader needs it, not in a separate block at the bottom.

Good:
> See [Plugins] for a complete list of available plugins.

Avoid:
> **Related Pages**
>
> - Plugins
> - Configuration

The `## More Information` footer (with `[{ReferringPagesPlugin}]`) handles automatic cross-referencing — don't duplicate it with a manual related-pages list.

## Table Format

Pages in `required-pages/` (rendered by the platform) must use **ngdpbase table syntax**, not markdown tables. Markdown tables are only appropriate in `docs/` files that live exclusively in GitHub.

Striped table (most common):

```
%%table-striped
|| Column A || Column B ||
| value | value |
/%
```

Styled table with custom row colour:

```
[{Table evenRowStyle:'background: lightblue;'}]
|| Column A || Column B ||
| value | value |
```

Auto-numbered rows:

```
[{Table}]
||# || Task ||
|# | First item |
```

See [Table Syntax Examples] for live rendered examples.

## Use Built-in Syntax

Always use built-in plugins instead of manually listing data that the system already knows.

| Instead of… | Use… |
| --- | --- |
| Manually listing system categories | `[{ConfigAccessor type='systemCategories'}]` |
| Manually listing roles | `[{ConfigAccessor type='roles'}]` |
| Manually listing plugins | `[{PluginList}]` |
| Hard-coding the site name | `[{ConfigAccessor type='siteName'}]` |

This keeps pages accurate as configuration changes — no manual updates needed.

## Showing Examples

For any plugin or markup feature, show a live example using this pattern:

```
[[{PluginName param='value'}] renders as:

[{PluginName param='value'}]
```

The double bracket `[[` escapes the markup so readers see the literal syntax, immediately followed by the rendered output. This side-by-side format lets readers see both what to type and what it produces.

Example — the Location plugin:

[[{Location name='Paris, France'}] renders as:

[{Location name='Paris, France'}]

## Parameter Tables

Plugin parameter tables use this column order and format:

| Parameter | Default | Description |
| --- | --- | --- |
| `param` | `default` or *(required)* or *(none)* | What it does |

- Wrap parameter names and values in backticks.
- Use *(required)* when the parameter has no default and must be supplied.
- Use *(none)* when the parameter is optional and does nothing if omitted.
- List required parameters first, then optional ones alphabetically.

## Frontmatter Requirements

Every documentation page must have:

```yaml
---
title: Page Title
uuid: <uuid-v4>
system-category: documentation
user-keywords:
  - Keyword1
  - Keyword2
slug: page-title-lowercase-hyphenated
lastModified: 'YYYY-MM-DDTHH:MM:SS.000Z'
author: system
---
```

- `slug` must be lowercase, hyphen-separated, and match the page title.
- `user-keywords` drives search and the keyword index — include synonyms a reader might search for.
- `lastModified` must be updated whenever the page content changes.

## What Makes a Good Documentation Page

A documentation page is good when a user can find it by searching a keyword, read the opening sentence and know immediately whether it answers their question, follow the examples to accomplish the task, and find related pages automatically via the `## More Information` footer.

A documentation page is poor when it uses jargon without explanation, lists data that a plugin could render dynamically, uses "Wiki" instead of the site name, omits the `## More Information` footer, or buries the most useful information below long preamble.

## More Information

There might be more information for this subject on one of the following:
[{ReferringPagesPlugin before='*' after='\n' }]
