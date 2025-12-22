# JSPWiki Table Styles - Complete Guide

## Overview

amdWiki implements JSPWiki-compatible table styles with extensions for modern web applications. Tables support visual styling, interactive features, and custom colors with automatic text contrast.

## Table of Contents

1. [Quick Start](#quick-start)
2. [JSPWiki Syntax](#jspwiki-syntax)
3. [Visual Styles](#visual-styles)
4. [Interactive Features](#interactive-features)
5. [Custom Colors](#custom-colors)
6. [Combining Styles](#combining-styles)
7. [Dark Mode Support](#dark-mode-support)
8. [Advanced Examples](#advanced-examples)
9. [Technical Reference](#technical-reference)

---

## Quick Start

### Basic Table (No Styling)

```
|| Name || Age || City ||
| Alice | 28 | Boston |
| Bob | 35 | Seattle |
```

**Result:** Plain table with headers

### Striped Table

```
%%table-striped
|| Product || Price || Stock ||
| Laptop | $999 | 15 |
| Mouse | $25 | 150 |
/%
```

**Result:** Alternating row colors for readability

### Sortable Table

```
%%sortable
|| Name || Score || Grade ||
| Alice | 95 | A |
| Bob | 87 | B |
/%
```

**Result:** Click column headers to sort

---

## JSPWiki Syntax

### Row Types

**Header Row** - Double pipes (`||`):

```
|| Column 1 || Column 2 || Column 3 ||
```

Rendered as: `<th>Column 1</th>`

**Data Row** - Single pipes (`|`):

```
| Data 1 | Data 2 | Data 3 |
```

Rendered as: `<td>Data 1</td>`

### Style Blocks

**Single Style:**

```
%%style-name
|| Table content ||
| ... |
/%
```

**Nested Styles (JSPWiki Compatible):**

```
%%style-1
%%style-2
%%style-3
|| Table content ||
/%
/%
/%
```

**Important:** Each `%%` requires a matching `/%`

---

## Visual Styles

### 1. Zebra Table / Table Striped

**Purpose:** Alternating row colors for easier reading

**Syntax:**

```
%%zebra-table
|| Header ||
| Row 1 (gray) |
| Row 2 (normal) |
| Row 3 (gray) |
/%
```

**Alternative:** `%%table-striped` (Bootstrap-compatible)

**CSS Classes:** `zebra-table`, `table-striped`

**JavaScript:** zebraTable.js applies `.zebra-even` and `.zebra-odd` classes dynamically

---

### 2. Table Bordered

**Purpose:** Add borders around all cells

**Syntax:**

```
%%table-bordered
|| Name || Value ||
| Item | 123 |
/%
```

**CSS Class:** `table-bordered`

**Visual:** All cells have visible borders

---

### 3. Table Fit (Auto-Width)

**Purpose:** Size table to content width (not full width)

**Syntax:**

```
%%table-fit
|| Code || Language ||
| JS | JavaScript |
| PY | Python |
/%
```

**CSS Class:** `table-fit`

**CSS Rule:** `width: auto !important`

---

### 4. Table Hover

**Purpose:** Highlight row on mouse hover

**Syntax:**

```
%%table-hover
|| Product || Price ||
| Laptop | $999 |
| Mouse | $25 |
/%
```

**CSS Class:** `table-hover`

**JavaScript:** zebraTable.js adds `.zebra-hover` on mouseenter

---

### 5. Table Compact (table-sm / table-condensed)

**Purpose:** Reduce padding for dense information

**Syntax:**

```
%%table-sm
|| Code || Desc ||
| 01 | Item 1 |
| 02 | Item 2 |
/%
```

**CSS Classes:** `table-sm`, `table-condensed`

**CSS Rule:** Reduced padding (4px vs 8px)

---

### 6. Table Responsive

**Purpose:** Horizontal scroll on mobile devices

**Syntax:**

```
%%table-responsive
|| Col 1 || Col 2 || Col 3 || Col 4 || Col 5 || Col 6 ||
| Wide table content... |
/%
```

**CSS Class:** `table-responsive`

**Behavior:** Scrollable on screens < 768px

---

## Interactive Features

### 1. Sortable Tables

**Purpose:** Click column headers to sort

**Syntax:**

```
%%sortable
|| Name || Age || Score ||
| Alice | 28 | 95 |
| Bob | 35 | 87 |
| Charlie | 22 | 92 |
/%
```

**Alternative:** `%%table-sort`

**Features:**

- **Natural sorting:** "Item 2" before "Item 10"
- **Type detection:** Numbers, dates, text
- **Click toggle:** Ascending → Descending → Ascending
- **Visual indicator:** `.sort-asc` / `.sort-desc` classes

**Implementation:** [tableSort.js](../../public/js/tableSort.js)

**Sort Types:**

- **Number:** 123, 45.67, -10
- **Date:** 2025-01-15, Jan 15 2025
- **Text:** Alphabetical (case-insensitive)

---

### 2. Filterable Tables

**Purpose:** Filter rows based on column values

**Syntax:**

```
%%table-filter
|| Product || Category || Price ||
| Laptop | Electronics | 1299 |
| Mouse | Accessories | 29 |
| Keyboard | Accessories | 89 |
/%
```

**Features:**

- **Filter row:** Input fields for each column
- **Live filtering:** 300ms debounce
- **Filter operators:**
  - `text` - Contains (default)
  - `=exact` - Exact match
  - `^starts` - Starts with
  - `ends$` - Ends with
  - `/regex/` - Regular expression

**Examples:**

- `Electronics` - Show rows containing "Electronics"
- `=29` - Show rows with exactly "29"
- `^L` - Show rows starting with "L"
- `/^[A-M]/` - Show rows matching regex

**Implementation:** [tableFilter.js](../../public/js/tableFilter.js)

---

## Custom Colors

### Syntax

**Format:** `%%zebra-HEXCOLOR`

Where `HEXCOLOR` is a 6-digit hex color **without** the `#` symbol.

### Examples

**Pink Stripes:**

```
%%zebra-ffe0e0
|| Product || Price ||
| Item 1 | $10 |
| Item 2 | $20 |
/%
```

**Light Blue Stripes:**

```
%%zebra-e0e0ff
|| Name || Score ||
| Alice | 95 |
| Bob | 87 |
/%
```

**Dark Green Stripes:**

```
%%zebra-006400
|| Status || Count ||
| Active | 42 |
| Pending | 17 |
/%
```

### Automatic Text Contrast

**Algorithm:** WCAG relative luminance

```javascript
luminance = (0.299 * R + 0.587 * G + 0.114 * B) / 255
textColor = luminance > 0.5 ? 'black' : 'white'
```

**Examples:**

- `%%zebra-ffe0e0` (pink, luminance 0.90) → **Black text**
- `%%zebra-800000` (maroon, luminance 0.15) → **White text**
- `%%zebra-808080` (gray, luminance 0.50) → **Black text**

### Color Palette Ideas

**Semantic Colors:**

```
%%zebra-d4edda  # Success (light green)
%%zebra-fff3cd  # Warning (light yellow)
%%zebra-f8d7da  # Error (light red)
%%zebra-d1ecf1  # Info (light blue)
```

**Brand Colors:**

```
%%zebra-e3f2fd  # Material Blue 50
%%zebra-f3e5f5  # Material Purple 50
%%zebra-e8f5e9  # Material Green 50
%%zebra-fff8e1  # Material Yellow 50
```

---

## Combining Styles

### Multiple Visual Styles

```
%%table-bordered
%%table-hover
%%table-fit
|| Code || Name ||
| 01 | Item 1 |
| 02 | Item 2 |
/%
/%
/%
```

**Result:** Bordered + Hover + Auto-width

---

### Visual + Interactive

```
%%zebra-table
%%sortable
|| Product || Price || Stock ||
| Laptop | $999 | 15 |
| Mouse | $25 | 150 |
| Keyboard | $75 | 80 |
/%
/%
```

**Result:** Striped rows + Click to sort

---

### Custom Color + Features

```
%%zebra-e0ffe0
%%sortable
%%table-filter
|| Name || Department || Salary ||
| Alice | Engineering | 95000 |
| Bob | Sales | 87000 |
| Charlie | Engineering | 92000 |
/%
/%
/%
```

**Result:** Light green stripes + Sortable + Filterable

---

### Maximum Features (Jim's Fav Style)

```
%%table-bordered
%%table-fit
%%table-striped
%%table-hover
%%sortable
|| Title || Author || Year || Edition ||
| Book 1 | Smith | 2020 | 5 |
| Book 2 | Jones | 2019 | 3 |
| Book 3 | Davis | 2021 | 2 |
/%
/%
/%
/%
/%
```

**Result:** All features combined!

---

## Dark Mode Support

### Automatic Theme Switching

amdWiki supports three dark mode approaches:

1. **Manual toggle:** `[data-theme="dark"]`
2. **System preference:** `@media (prefers-color-scheme: dark)`
3. **Hybrid:** Manual override system

### Default Colors

**Light Mode:**

```css
--table-stripe: #f0f0f0;        /* Light gray */
--zebra-row-even: rgba(2, 6, 19, 0.08);
--zebra-row-odd: transparent;
```

**Dark Mode:**

```css
--table-stripe: #252525;        /* Dark gray */
--zebra-row-even: #1a1a1a;
--zebra-row-odd: transparent;
```

### Text Brightness

**Dark Mode Enhancement:**

```css
/* Even rows (striped) get brighter text */
.zebra-even td {
  color: #f0f6fc;  /* Bright white */
}

/* Odd rows (normal) use default */
.zebra-odd td {
  color: #e6edf3;  /* Normal white */
}
```

### Custom Colors in Dark Mode

Custom colors (`%%zebra-HEXCOLOR`) override theme colors:

```
%%zebra-4a90e2  /* Medium blue */
```

**Renders as:**

```html
<table style="--zebra-row-even: #4a90e2; --zebra-text-color: #ffffff;">
```

Text color calculated independently of theme.

---

## Advanced Examples

### 1. Product Comparison Table

```
%%table-bordered
%%table-hover
%%sortable
|| Product || Price || Rating || Stock || Actions ||
| MacBook Pro | $2,399 | 4.8 | 12 | 🛒 |
| Dell XPS 15 | $1,799 | 4.6 | 25 | 🛒 |
| Surface Laptop | $1,299 | 4.5 | 8 | 🛒 |
| ThinkPad X1 | $1,899 | 4.7 | 15 | 🛒 |
/%
/%
/%
```

---

### 2. Dashboard Status Table

```
%%zebra-f0f8ff
%%table-fit
|| Service || Status || Uptime || Last Check ||
| API Server | ✅ Active | 99.9% | 2 min ago |
| Database | ✅ Active | 99.8% | 1 min ago |
| Cache | ⚠️ Slow | 98.5% | 5 min ago |
| Queue | ✅ Active | 99.7% | 3 min ago |
/%
/%
```

---

### 3. Financial Report Table

```
%%table-bordered
%%table-hover
%%sortable
|| Quarter || Revenue || Expenses || Profit || Growth ||
| Q1 2024 | $2.5M | $1.8M | $700K | +12% |
| Q2 2024 | $2.8M | $1.9M | $900K | +28% |
| Q3 2024 | $3.1M | $2.0M | $1.1M | +22% |
| Q4 2024 | $3.4M | $2.1M | $1.3M | +18% |
/%
/%
/%
```

---

### 4. User Directory with Filtering

```
%%table-filter
%%zebra-table
%%table-hover
|| Name || Department || Email || Phone ||
| Alice Johnson | Engineering | alice@company.com | (555) 123-4567 |
| Bob Smith | Sales | bob@company.com | (555) 234-5678 |
| Charlie Davis | Engineering | charlie@company.com | (555) 345-6789 |
| Diana Martinez | Marketing | diana@company.com | (555) 456-7890 |
| Eve Wilson | Sales | eve@company.com | (555) 567-8901 |
/%
/%
/%
```

**Filter examples:**

- Department: `Engineering` - Show only engineers
- Email: `@company.com` - Show all (contains)
- Name: `^A` - Show names starting with "A"

---

### 5. Color-Coded Priority Table

```
%%zebra-ffc0cb
%%sortable
|| Task || Priority || Assignee || Due Date ||
| Fix login bug | 🔴 High | Alice | 2025-10-08 |
| Update docs | 🟡 Medium | Bob | 2025-10-15 |
| Refactor API | 🟢 Low | Charlie | 2025-10-30 |
| Add tests | 🔴 High | Diana | 2025-10-09 |
/%
/%
```

---

## Technical Reference

### HTML Structure

**Generated by JSPWikiPreprocessor:**

```html
<table class="table zebra-table sortable" style="--zebra-row-even: #ffe0e0; --zebra-text-color: #000000;">
  <thead>
    <tr>
      <th>Header 1</th>
      <th>Header 2</th>
    </tr>
  </thead>
  <tbody>
    <tr class="zebra-even">
      <td>Cell 1</td>
      <td>Cell 2</td>
    </tr>
    <tr class="zebra-odd">
      <td>Cell 3</td>
      <td>Cell 4</td>
    </tr>
  </tbody>
</table>
```

### CSS Classes

| Class | Applied By | Purpose |
|-------|-----------|---------|
| `table` | JSPWikiPreprocessor | Base table styling |
| `zebra-table` | JSPWikiPreprocessor | Enables zebra striping |
| `sortable` | JSPWikiPreprocessor | Enables sorting |
| `table-filter` | JSPWikiPreprocessor | Enables filtering |
| `zebra-even` | zebraTable.js | Even row (striped) |
| `zebra-odd` | zebraTable.js | Odd row (normal) |
| `zebra-hover` | zebraTable.js | Row being hovered |
| `sort-asc` | tableSort.js | Column sorted ascending |
| `sort-desc` | tableSort.js | Column sorted descending |

### CSS Variables

| Variable | Default (Light) | Default (Dark) | Purpose |
|----------|----------------|----------------|---------|
| `--zebra-row-even` | `rgba(2,6,19,0.08)` | `#1a1a1a` | Even row background |
| `--zebra-row-odd` | `transparent` | `transparent` | Odd row background |
| `--zebra-row-hover` | `rgba(88,166,255,0.24)` | `#21262d` | Hover background |
| `--zebra-text-color` | (none) | (none) | Custom text color |
| `--table-stripe` | `#f0f0f0` | `#252525` | CSS-only striping |
| `--table-hover` | `#e8e8e8` | `#21262d` | CSS-only hover |

### JavaScript APIs

**zebraTable.js:**

```javascript
// Manually refresh zebra striping
window.ZebraTable.init();
window.ZebraTable.refresh();
```

**tableSort.js:**

```javascript
// Manually sort a table
window.TableSort.sortTable(tableElement, columnIndex, ascending);
window.TableSort.refresh();
```

**tableFilter.js:**

```javascript
// Manually refresh filters
window.TableFilter.init();
window.TableFilter.refresh();
```

### Performance

**Server-Side (JSPWikiPreprocessor):**

- Parsing: O(n) where n = content length
- Table generation: O(rows × cells)
- Color calculation: O(1) per custom color

**Client-Side (JavaScript):**

- zebraTable.js: O(rows) per table
- tableSort.js: O(rows × log rows) per sort
- tableFilter.js: O(rows × columns) per filter

**Memory:**

- Minimal: HTML strings only
- No DOM caching
- Event listeners cleaned up on destroy

---

## Browser Support

### Required Features

- CSS Custom Properties (CSS Variables)
- ES6 JavaScript
- `Array.from()`, `Array.sort()`, arrow functions
- `querySelector`, `querySelectorAll`
- MutationObserver (for zebra striping)

### Supported Browsers

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Graceful Degradation

- Without JavaScript: Basic HTML tables still render
- Without CSS variables: Falls back to default colors
- Without MutationObserver: CSS-only striping works

---

## Troubleshooting

### Issue: Custom colors not showing

**Check:**

1. zebraTable.js loaded: `<script src="/js/zebraTable.js"></script>`
2. zebraTable.js selector includes `table.zebra-table`
3. CSS rule includes `table.zebra-table tbody tr.zebra-even`

**Solution:** Clear browser cache, check console for errors

---

### Issue: Headers outside table

**Check:**

1. JSPWikiPreprocessor registered in Phase 1
2. Handler has `this.phase = 1`
3. Using correct syntax: `|| Header ||` not `| Header |`

**Solution:** Verify MarkupParser.js registration order

---

### Issue: Sorting not working

**Check:**

1. tableSort.js loaded
2. Table has `class="sortable"`
3. Table has `<thead>` with `<th>` elements

**Solution:** Check browser console for JavaScript errors

---

### Issue: Dark mode contrast too low

**Check:**

1. CSS variables defined in `[data-theme="dark"]`
2. Text color set for `.zebra-even td`
3. Theme actually applied (check `<html data-theme="dark">`)

**Solution:** Inspect element, verify computed styles

---

## Migration Guide

### From Old WikiStyleHandler/WikiTableHandler

**Before (Phase 4):**

```
Headers appear as <p> tags outside tables
TABLE_CLASSES markers used
Complex priority dependencies
```

**After (Phase 1):**

```
Headers inside <thead> correctly
Direct HTML generation
Simple, clean architecture
```

**No syntax changes required!** All existing `%%` blocks work.

---

## Related Documentation

- [JSPWikiPreprocessor Architecture](../architecture/JSPWikiPreprocessor.md)
- [MarkupParser Pipeline](../architecture/MarkupParser.md)
- [Theme System](./ThemeSystem.md)
- [JavaScript Enhancements](./JavaScriptEnhancements.md)

---

## Credits

**Implementation:**

- JSPWikiPreprocessor: Server-side parser (Phase 1)
- zebraTable.js: Dynamic row striping
- tableSort.js: Interactive sorting
- tableFilter.js: Column filtering

**Inspired by:**

- [Apache JSPWiki](https://jspwiki.apache.org/)
- [JSPWiki Haddock Styles](https://jspwiki-wiki.apache.org/Wiki.jsp?page=Haddock%20Styles)
- Bootstrap Tables
- Material Design Tables

---

**Last Updated:** 2025-10-07
**Version:** 1.0.0
**Maintainer:** amdWiki Development Team
