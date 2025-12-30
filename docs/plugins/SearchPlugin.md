---
name: "SearchPlugin"
description: "Embeds search results directly in wiki pages"
dateModified: "2025-12-18"
category: "plugins"
relatedModules: ["PluginManager", "SearchManager"]
version: "2.0.0"
---

# SearchPlugin

Embeds search results directly in wiki pages with filtering and formatting options.

## Overview

The SearchPlugin allows embedding search results within wiki content. It supports text queries, category filtering, keyword filtering, and multiple output formats. This enables creating dynamic pages that automatically display related content.

**Source:** `plugins/SearchPlugin.js`

## Plugin Metadata

| Property | Value |
| ---------- | ------- |
| Name | SearchPlugin |
| Author | amdWiki |
| Version | 2.0.0 |
| JSPWiki Compatible | Yes |

## Usage

### Basic Syntax

```wiki
[{Search query='keyword'}]
```

### With Category Filter

```wiki
[{Search system-category='documentation'}]
```

### Multiple Filters

```wiki
[{Search query='manager' system-category='system' max=5}]
```

## Parameters

| Parameter | Type | Default | Required | Description |
| ----------- | ------ | --------- | ---------- | ------------- |
| query | string | * | No | Search text query (* for all pages) |
| system-category | string | - | No | Filter by system category |
| user-keywords | string | - | No | Filter by user keywords (pipe-separated for OR) |
| max | number | 50 | No | Maximum results to return |
| format | string | table | No | Output format: table, count, titles, list |

### Format Options

| Format | Description |
| -------- | ------------- |
| table | Full table with page names and scores (default) |
| count | Just the count of matching pages |
| titles | Bullet list with page links |
| list | Simple list of page names (no links) |

### Multi-Value Syntax

For `user-keywords`, use pipe (`|`) for OR logic:

```wiki
[{Search user-keywords='economics|geology'}]
```

Matches pages with either "economics" OR "geology" keywords.

## Examples

### Example 1: Basic Text Search

```wiki
[{Search query='plugin' max=10}]
```

**Output:** Table of pages containing "plugin" with relevance scores.

### Example 2: All Pages in Category

```wiki
[{Search system-category='documentation'}]
```

Shows all pages categorized as "documentation".

### Example 3: Count Format

```wiki
There are [{Search system-category='system' format='count'}] system pages.
```

**Output:** `There are 42 system pages.`

### Example 4: Titles Format

```wiki
[{Search system-category='documentation' format='titles'}]
```

**Output:**

```html
<div class="search-plugin search-titles">
  <ul>
    <li><a class="wikipage" href="/wiki/GettingStarted">Getting Started</a> <span class="badge">documentation</span></li>
    <li><a class="wikipage" href="/wiki/UserGuide">User Guide</a> <span class="badge">documentation</span></li>
  </ul>
</div>
```

### Example 5: List Format (No Links)

```wiki
[{Search user-keywords='test' format='list'}]
```

**Output:** Simple unordered list of page names.

### Example 6: Combined Query and Filter

```wiki
[{Search query='manager' system-category='system' max=5}]
```

Searches for "manager" within system-categorized pages.

### Example 7: Multiple Keywords (OR)

```wiki
[{Search user-keywords='economics|geology|history'}]
```

Pages tagged with economics OR geology OR history.

## Output Formats

### Table Format (Default)

```html
<div class="search-plugin">
  <div class="search-summary">
    <p>Found <strong>5</strong> results for <strong>"manager"</strong></p>
  </div>
  <table class="search-results" border="1">
    <thead>
      <tr><th>Page</th><th>Score</th></tr>
    </thead>
    <tbody>
      <tr>
        <td><a href="/wiki/PageManager">PageManager</a> <span class="badge">system</span></td>
        <td>1.000</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Count Format

```html
<span class="search-count">42</span>
```

### Titles Format

Bullet list with links and category badges.

### List Format

Plain bullet list of page names.

## Technical Implementation

### Execute Method

```javascript
async execute(context, params) {
  const searchManager = context?.engine?.getManager?.('SearchManager');

  const searchOptions = {
    query: opts.query === '*' ? '' : opts.query,
    maxResults: maxResults,
    categories: opts['system-category'] ? [opts['system-category']] : undefined,
    userKeywords: opts['user-keywords'] ? opts['user-keywords'].split('|') : undefined
  };

  const results = await searchManager.advancedSearch(searchOptions);
  return formatResults(results, options);
}
```

### Context Usage

- `context.engine.getManager('SearchManager')` - For search execution

## JSPWiki Compatibility

| Feature | JSPWiki | amdWiki | Notes |
| --------- | --------- | --------- | ------- |
| query parameter | Yes | Yes | Same behavior |
| max parameter | Yes | Yes | Same behavior |
| Table output | Yes | Yes | Similar format |
| system-category | No | Yes | amdWiki extension |
| user-keywords | No | Yes | amdWiki extension |
| format parameter | Partial | Yes | Extended options |

## Error Handling

| Error | Cause | Output |
| ------- | ------- | -------- |
| SearchManager unavailable | Engine not ready | Error message |
| Invalid max | Non-numeric value | Error message |
| Invalid format | Unknown format type | Error message |
| Search failure | Internal error | Error with message |

## CSS Classes

| Class | Description |
| ------- | ------------- |
| search-plugin | Container div |
| search-summary | Results summary |
| search-results | Results table |
| search-titles | Titles format container |
| search-list | List format container |
| search-count | Count format span |

## Related Documentation

- [Plugin System Architecture](../architecture/Plugin-Architecture.md)
- [SearchManager](../managers/SearchManager.md)
- [GitHub Issue #111](https://github.com/jwilleke/amdWiki/issues/111)

## Version History

| Version | Date | Changes |
| --------- | ------ | --------- |
| 2.0.0 | 2025-11-26 | Added format parameter, category/keyword filters |
| 1.0.0 | 2025-10-01 | Initial implementation |
