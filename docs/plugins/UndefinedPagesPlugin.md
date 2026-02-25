---
name: "UndefinedPagesPlugin"
description: "Lists pages that are linked to (RED-LINKs) but do not exist in the wiki"
dateModified: "2026-02-25"
category: "plugins"
relatedModules: ["PluginManager", "PageManager", "RenderingManager"]
version: "1.0.0"
---

# UndefinedPagesPlugin

Lists all pages that are referenced by wiki links (RED-LINKs) but do not exist in the wiki.

## Overview

The UndefinedPagesPlugin inspects the in-memory link graph to find every page title that
has been linked to but has never been created. Results are rendered as create links
(`/edit/PageName`) styled like inline red links, so clicking one takes you directly to
the page creation editor.

**Source:** `plugins/UndefinedPagesPlugin.ts`
**Shared utilities:** `src/utils/pluginFormatters.ts` (see [#238 Code Consolidation](https://github.com/jwilleke/amdWiki/issues/238))

## Plugin Metadata

| Property | Value |
| --- | --- |
| Name | UndefinedPagesPlugin |
| Author | amdWiki |
| Version | 1.0.0 |
| JSPWiki Compatible | Yes |

## Usage

### Basic Syntax

```wiki
[{UndefinedPagesPlugin}]
```

Returns a bulleted list of all undefined (red-link) pages, sorted alphabetically.

### Count Only

```wiki
[{UndefinedPagesPlugin format='count'}]
```

### Table with Referrer Count

```wiki
[{UndefinedPagesPlugin format='table'}]
```

Shows each undefined page alongside the number of pages that currently link to it.

## Parameters

| Parameter | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| max | integer | 0 (unlimited) | No | Maximum number of results to display. `count` format always returns the total regardless of `max`. |
| format | string | `list` | No | Output format: `list`, `count`, or `table` |
| before | string | — | No | Text/markup before each item (`list` format only, ignored when `showReferring='true'`) |
| after | string | — | No | Text/markup after each item (`list` format only, ignored when `showReferring='true'`) |
| include | regex | — | No | Only include undefined pages matching this pattern |
| exclude | regex | — | No | Exclude undefined pages matching this pattern |
| showReferring | boolean | `false` | No | Expand referring page info. `list`: nested `<ul class="referring-pages">` per item. `table`: page links instead of count in Referenced By column. No effect on `count` format. |

## Output Formats

| Format | `showReferring='false'` (default) | `showReferring='true'` |
| --- | --- | --- |
| `list` | `<ul>` of red create-links | Same `<ul>`, each `<li>` has a nested `<ul class="referring-pages">` |
| `count` | Plain integer total (ignores `max`) | Unchanged — `showReferring` has no effect |
| `table` | Two columns: Undefined Page \| count | Two columns: Undefined Page \| comma-separated page links |

## Examples

### Example 1: Full List

```wiki
[{UndefinedPagesPlugin}]
```

Bulleted list of all undefined pages, alphabetically sorted.

### Example 2: Top 25

```wiki
[{UndefinedPagesPlugin max='25'}]
```

### Example 3: Count for a Dashboard

```wiki
Undefined pages: [{UndefinedPagesPlugin format='count'}]
```

### Example 4: Table View

```wiki
[{UndefinedPagesPlugin format='table'}]
```

Output columns: **Undefined Page** (red-link create link) | **Referenced By** (integer count).

### Example 5: Limit to a Namespace

```wiki
[{UndefinedPagesPlugin include='^Project.*'}]
```

Only shows undefined pages whose titles start with "Project".

### Example 6: Exclude Test Pages

```wiki
[{UndefinedPagesPlugin exclude='.*Test.*'}]
```

### Example 7: Custom List Markers (JSPWiki-style before/after)

```wiki
[{UndefinedPagesPlugin before='* ' after='\n'}]
```

### Example 8: List with Referring Pages Expanded

```wiki
[{UndefinedPagesPlugin showReferring='true'}]
```

Each `<li>` contains the red create-link followed by a nested `<ul class="referring-pages">` of the existing pages that link to it. Equivalent to running `[{ReferringPagesPlugin page='X'}]` inline for every undefined page X.

```html
<ul>
  <li><a class="redlink" href="/edit/MissingPage" ...>MissingPage</a>
    <ul class="referring-pages">
      <li><a class="wikipage" href="/wiki/PageA">PageA</a></li>
      <li><a class="wikipage" href="/wiki/PageB">PageB</a></li>
    </ul>
  </li>
  ...
</ul>
```

### Example 9: Table with Referring Pages Expanded

```wiki
[{UndefinedPagesPlugin format='table' showReferring='true'}]
```

The **Referenced By** column shows comma-separated `<a class="wikipage">` links instead of an integer count. Pages with no referrers still show `0`.

### Example 10: Filtered Audit — Project Pages Only

```wiki
[{UndefinedPagesPlugin include='^Project.*' showReferring='true'}]
```

Scoped audit: only undefined pages in the "Project" namespace, with full referrer detail.

## Technical Implementation

### Data Source

The plugin reads `context.linkGraph` (provided by `RenderingManager`) — a
`Record<string, string[]>` map of `targetPage → [referringPages]`. Every key
in this map that is **not** present in `PageManager.getAllPages()` is an
undefined page.

```typescript
const allPages  = await pageManager.getAllPages();
const pageSet   = new Set(allPages.map(p => p.toLowerCase()));
const undefined = Object.keys(linkGraph).filter(p => !pageSet.has(p.toLowerCase()));
```

### Shared Formatters

Output is generated via `src/utils/pluginFormatters.ts`:

| Helper | Used for |
| --- | --- |
| `parseMaxParam` | Parse and validate the `max` parameter |
| `applyMax` | Slice the results array |
| `formatAsList` | `list` format with optional `before`/`after` |
| `formatAsCount` | `count` format |
| `formatAsTable` | `table` format |
| `escapeHtml` | Safe HTML escaping in error messages and table cells |

### Context Usage

- `context.linkGraph` — link graph from RenderingManager
- `context.engine.getManager('PageManager')` — for the current page list

## JSPWiki Compatibility

| Feature | JSPWiki | amdWiki | Notes |
| --- | --- | --- | --- |
| Basic undefined page listing | Yes | Yes | Fully compatible |
| `max` parameter | Yes | Yes | Same semantics |
| `format='count'` | Yes | Yes | |
| `include`/`exclude` filters | No | Yes | amdWiki extension |
| `format='table'` | No | Yes | amdWiki extension |
| `before`/`after` | No | Yes | amdWiki extension |
| `showReferring` | No | Yes | amdWiki extension |

## Error Handling

| Error | Cause | Output |
| --- | --- | --- |
| PageManager unavailable | Engine not initialized | Error paragraph |
| Invalid `include` pattern | Bad regex | Error with pattern text |
| Invalid `exclude` pattern | Bad regex | Error with pattern text |

## CSS Classes

| Class | Applied to | Description |
| --- | --- | --- |
| `redlink` | `<a>` | Marks the link as a create (red) link |
| `plugin-table` | `<table>` | Table wrapper (from `formatAsTable`) |
| `wikipage` | `<a>` | Applied to referring page links when `showReferring='true'` |
| `referring-pages` | `<ul>` | Nested list of referring pages in `list` format with `showReferring='true'` |

## Related Plugins

- [ReferringPagesPlugin](./ReferringPagesPlugin.md) — Lists pages that link *to* the current page
- [IndexPlugin](./IndexPlugin.md) — Alphabetical index of all existing pages
- [SearchPlugin](./SearchPlugin.md) — Dynamic page search

## Related Documentation

- [Plugin System Architecture](../architecture/Plugin-Architecture.md)
- [pluginFormatters utility](../../src/utils/pluginFormatters.ts) — Shared formatting helpers
- [PageManager](../managers/PageManager.md)

## Version History

| Version | Date | Changes |
| --- | --- | --- |
| 1.1.0 | 2026-02-25 | Add `showReferring` parameter — inline referring page expansion for list and table formats |
| 1.0.0 | 2026-02-25 | Initial implementation — list, count, table formats; include/exclude filters |
