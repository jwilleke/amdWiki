---
title: "Search Documentation"
categories: [System, Documentation]
user-keywords: []
author: "System"
lastModified: "2025-09-07"
version: "1.0"
---

This page provides comprehensive documentation for the amdWiki search functionality, which offers JSPWiki-style search capabilities with advanced filtering and organization features.

## Quick Start

### Basic Search

- Click the **Search** link in the navigation bar or visit `/search`
- Enter your search terms in the text box
- Click **Search** or press Enter
- View results with relevance scores and metadata

### Advanced Search

- Use the **Search Options** panel to access advanced features
- Combine text search with category and keyword filters
- Select specific fields to search in (titles, content, categories, keywords)
- Browse by categories or keywords without entering search terms

## Search Types

### 1. Text Search

Search across page content, titles, and metadata using keywords or phrases.

**Examples:**

- `wiki documentation` - Find pages containing both words
- `"exact phrase"` - Search for exact phrase matches
- `+required -excluded` - Require/exclude specific terms
- `word*` - Wildcard matching (word, words, working, etc.)

### 2. Category Search

Filter pages by their assigned categories. Categories are defined in page front matter.

**How to use:**

- Select a category from the **Category** dropdown
- Leave search text empty to browse all pages in that category
- Combine with text search to find specific content within a category

### 3. Keyword Search

Filter pages by user-defined keywords. Keywords are specified in the `userKeywords` field of page front matter.

**How to use:**

- Select keywords from the **User Keywords** dropdown
- Browse all pages tagged with specific keywords
- Combine with text and category filters for precise results

### 4. Advanced Multi-Criteria Search

Combine multiple search criteria for powerful filtering:

- **Text + Category**: Find specific content within a category
- **Text + Keywords**: Search for content with specific tags
- **Text + Category + Keywords**: Maximum precision filtering
- **Category + Keywords**: Browse intersection of categories and tags

## Search Interface Features

### Search Options Panel

The collapsible **Search Options** panel provides access to all search features:

- **Search Text**: Main query input field
- **Search In**: Limit search scope to specific fields
- **Category**: Filter by page categories
- **User Keywords**: Filter by page keywords
- **Toggle**: Show/hide advanced options

### Search Scope Options

Control where your search looks using the **Search In** dropdown:

- **All Fields** (default): Search across all content and metadata
- **Page Titles**: Search only in page titles
- **Page Content**: Search only in page body content
- **Categories**: Search within category names
- **Keywords**: Search within keyword tags

### Results Display

Search results show comprehensive information:

- **Page Title**: Clickable link to the page
- **Relevance Score**: How well the page matches your query
- **Content Snippet**: Preview of matching content
- **Category Badge**: Page category (if assigned)
- **Keyword Tags**: Up to 3 keywords shown, with "+X more" indicator
- **Metadata**: Word count and last modified date

### Search Statistics Sidebar

The sidebar provides useful information:

- **Total Pages**: Number of indexed pages
- **Categories**: Number of available categories
- **Keywords**: Number of available user keywords

### Search Tips Panel

Built-in help shows advanced search syntax:

- **Exact phrase**: Use quotes `"your phrase"`
- **Required word**: Use plus `+required`
- **Excluded word**: Use minus `-excluded`
- **Wildcard**: Use asterisk `word*`
- **Field search**: Use colon `title:word`

## Page Organization

### Categories

Categories provide high-level organization for wiki pages. They are defined in the page front matter:

```yaml
---
title: "Page Title"
category: "Documentation"
---
```

**Best Practices:**

- Use broad, descriptive categories like "Documentation", "Reference", "Tutorials"
- Keep category names consistent across pages
- Avoid too many categories - aim for 5-15 main categories

### User Keywords

Keywords provide fine-grained tagging for pages. They are defined in the `userKeywords` field:

```yaml
---
title: "Page Title"
userKeywords: ["search", "documentation", "help"]
---
```

**Best Practices:**

- Use specific, descriptive keywords
- Include both general and specific terms
- Consider synonyms users might search for
- Limit to 3-7 keywords per page for clarity

### Tags

Additional tags can be specified in the `tags` field for even more granular organization:

```yaml
---
title: "Page Title"
tags: ["search", "help", "documentation", "guide", "tutorial"]
---
```

## Search Syntax

### Basic Operators

- **AND** (default): `wiki documentation` finds pages with both terms
- **OR**: Use multiple searches or browse by categories/keywords
- **NOT**: Use minus sign `-term` to exclude terms
- **Required**: Use plus sign `+term` to require terms

### Advanced Syntax

- **Exact Phrases**: `"search documentation"` matches exact phrase
- **Wildcards**: `doc*` matches doc, docs, documentation, etc.
- **Field Search**: `title:search` searches only in page titles
- **Boost Terms**: More relevant terms naturally score higher

### Fuzzy Matching

The search engine provides intelligent matching:

- Handles common typos and variations
- Stemming (search, searches, searching)
- Case-insensitive matching
- Partial word matching with wildcards

## Empty Search State

When you visit the search page without parameters, you'll see:

- **Browse by Category**: Quick links to all available categories
- **Browse by Keywords**: Quick links to popular user keywords
- **Search Tips**: Helpful information about search syntax
- **Statistics**: Overview of wiki content organization

## Performance and Indexing

### Search Index

- **Real-time**: Pages are indexed when created or modified
- **Metadata Extraction**: Automatically extracts categories, keywords, and tags
- **Boost Values**: Different fields have different importance weights:
  - Categories: 8x boost (highest priority)
  - User Keywords: 6x boost
  - Tags: 5x boost
  - Keywords: 4x boost
  - Content: 1x boost (baseline)

### Search Speed

- **Instant Results**: Lunr.js provides fast client-side search
- **Indexed Content**: All pages pre-indexed for maximum speed
- **Smart Filtering**: Efficient category and keyword filtering

## Troubleshooting

### No Results Found

If your search returns no results:

1. **Check Spelling**: Verify search terms are spelled correctly
2. **Broaden Search**: Try fewer or more general terms
3. **Remove Filters**: Clear category and keyword filters
4. **Use Wildcards**: Try `term*` for partial matches
5. **Browse Categories**: Use category links to explore content

### Unexpected Results

If results don't match expectations:

1. **Check Search Scope**: Ensure "Search In" is set to "All Fields"
2. **Review Filters**: Clear category/keyword filters if they're too restrictive
3. **Use Exact Phrases**: Put phrases in quotes for exact matching
4. **Check Page Metadata**: Verify pages have correct categories/keywords

### Performance Issues

If search seems slow:

1. **Clear Browser Cache**: Refresh the page and try again
2. **Simplify Query**: Use fewer search terms
3. **Check Network**: Ensure stable internet connection

## Best Practices

### For Content Creators

1. **Use Consistent Categories**: Establish and follow category naming conventions
2. **Add Relevant Keywords**: Include searchable keywords in page metadata
3. **Write Descriptive Titles**: Use clear, searchable page titles
4. **Include Summaries**: Add brief descriptions in page content

### For Search Users

1. **Start Simple**: Begin with basic keywords, then add filters
2. **Use Categories**: Browse by category when exploring topics
3. **Combine Filters**: Use multiple criteria for precise results
4. **Check Metadata**: Look at page categories and keywords for related content

### For Wiki Administrators

1. **Monitor Categories**: Regularly review and organize categories
2. **Update Keywords**: Keep keyword lists current and relevant
3. **Train Users**: Provide search training for wiki users
4. **Regular Maintenance**: Periodically review and update page metadata

## Related Pages

- [Welcome](Welcome) - Wiki introduction and getting started
- [User-Keywords](User-Keywords) - Complete list of available keywords
- [Categories](Categories) - Complete list of available categories
- [Wiki Documentation](Wiki%20Documentation) - General wiki documentation

---

*This documentation covers amdWiki search features as of version 1.0. For questions or suggestions, please contact the wiki administrator.*
