# ExportManager Complete Guide

**Module:** `src/managers/ExportManager.js`
**Quick Reference:** [ExportManager.md](ExportManager.md)
**Generated API:** [API Docs](../api/generated/src/managers/ExportManager/README.md)

---

## Table of Contents

1. [Architecture](#architecture)
2. [Initialization](#initialization)
3. [Export Methods](#export-methods)
4. [File Management](#file-management)
5. [Locale Support](#locale-support)
6. [API Reference](#api-reference)
7. [Integration Examples](#integration-examples)

---

## Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                    ExportManager                         │
│  - exportPageToHtml(pageName, user)                     │
│  - exportPagesToHtml(pageNames, user)                   │
│  - exportToMarkdown(pageNames, user)                    │
│  - saveExport(content, filename, format)                │
└────────────────┬──────────────────────────────────────┘
                 │
         ┌───────┼───────┐
         ▼       ▼       ▼
┌─────────────┐ ┌──────────────┐ ┌──────────────┐
│ PageManager │ │ Rendering    │ │ LocaleUtils  │
│ (content)   │ │ Manager      │ │ (timestamps) │
└─────────────┘ └──────────────┘ └──────────────┘
```

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `exportDirectory` | `string` | `./exports` | Directory for saved exports |
| `supportedFormats` | `string[]` | `['html', 'pdf', 'markdown']` | Supported export formats |

---

## Initialization

```javascript
async initialize(config = {}) {
  await super.initialize(config);

  this.exportDirectory = config.exportDirectory || './exports';

  // Create exports directory
  await fs.mkdir(this.exportDirectory, { recursive: true });
}
```

ExportManager creates the export directory automatically during initialization.

---

## Export Methods

### exportPageToHtml(pageName, user)

Export a single page to a complete HTML document.

```javascript
async exportPageToHtml(pageName, user = null)
```

**Parameters:**
- `pageName` - Name of the page to export
- `user` - User object for locale-aware timestamps (optional)

**Returns:** `string` - Complete HTML document

**Throws:** `Error` if page not found

**Features:**
- Full HTML5 document with `<head>` and `<body>`
- Responsive CSS styling included
- Page metadata (modified date, categories, keywords)
- Print-friendly styles

**Example:**
```javascript
const exportManager = engine.getManager('ExportManager');
const html = await exportManager.exportPageToHtml('Main', req.user);

// Send as download
res.setHeader('Content-Type', 'text/html');
res.setHeader('Content-Disposition', 'attachment; filename="Main.html"');
res.send(html);
```

---

### exportPagesToHtml(pageNames, user)

Export multiple pages to a single HTML document with table of contents.

```javascript
async exportPagesToHtml(pageNames, user = null)
```

**Parameters:**
- `pageNames` - Array of page names to export
- `user` - User object for locale-aware timestamps (optional)

**Returns:** `string` - Combined HTML document with TOC

**Features:**
- Auto-generated table of contents
- Two-column TOC layout
- Page dividers between sections
- Anchor links for navigation
- Print page-break hints

**Example:**
```javascript
const pages = ['Introduction', 'Getting Started', 'Configuration', 'FAQ'];
const html = await exportManager.exportPagesToHtml(pages);
```

---

### exportToMarkdown(pageNames, user)

Export pages to raw Markdown format.

```javascript
async exportToMarkdown(pageNames, user = null)
```

**Parameters:**
- `pageNames` - Single page name or array of page names
- `user` - User object for timestamps (optional)

**Returns:** `string` - Markdown content

**Features:**
- Raw page content (no rendering)
- Multi-page exports include TOC
- Page separators between pages

**Example:**
```javascript
// Single page
const md = await exportManager.exportToMarkdown('Main');

// Multiple pages
const md = await exportManager.exportToMarkdown(['Main', 'About', 'Help']);
```

---

## File Management

### saveExport(content, filename, format)

Save export content to a file.

```javascript
async saveExport(content, filename, format)
```

**Parameters:**
- `content` - Content to save
- `filename` - Base filename (sanitized automatically)
- `format` - File extension (html, md, etc.)

**Returns:** `string` - Full path to saved file

**Filename format:** `{sanitized-name}_{YYYY-MM-DD}.{format}`

**Example:**
```javascript
const html = await exportManager.exportPageToHtml('Main');
const path = await exportManager.saveExport(html, 'Main Export', 'html');
// Returns: ./exports/Main-Export_2025-12-19.html
```

---

### getExports()

List all export files in the export directory.

```javascript
async getExports()
```

**Returns:** `Array<Object>` sorted by creation date (newest first)

Each object contains:
- `filename` - File name
- `path` - Full file path
- `size` - File size in bytes
- `created` - Creation date
- `modified` - Last modified date

---

### deleteExport(filename)

Delete an export file.

```javascript
async deleteExport(filename)
```

**Parameters:**
- `filename` - Name of file to delete

---

## Locale Support

### getFormattedTimestamp(user)

Get locale-aware formatted timestamp.

```javascript
getFormattedTimestamp(user = null)
```

**Parameters:**
- `user` - User object with locale preferences (optional)

**Returns:** `string` - Formatted date/time string

If user has `preferences.locale` set, uses LocaleUtils for formatting. Otherwise falls back to system default.

---

## API Reference

### Export Methods

| Method | Parameters | Returns |
|--------|------------|---------|
| `exportPageToHtml(pageName, user)` | string, Object? | `Promise<string>` |
| `exportPagesToHtml(pageNames, user)` | string[], Object? | `Promise<string>` |
| `exportToMarkdown(pageNames, user)` | string\|string[], Object? | `Promise<string>` |

### File Management

| Method | Parameters | Returns |
|--------|------------|---------|
| `saveExport(content, filename, format)` | string, string, string | `Promise<string>` |
| `getExports()` | - | `Promise<Array<Object>>` |
| `deleteExport(filename)` | string | `Promise<void>` |

### Utility

| Method | Parameters | Returns |
|--------|------------|---------|
| `getFormattedTimestamp(user)` | Object? | `string` |

---

## Integration Examples

### Route Handler for HTML Export

```javascript
app.get('/wiki/:pageName/export/html', async (req, res) => {
  const exportManager = engine.getManager('ExportManager');

  try {
    const html = await exportManager.exportPageToHtml(
      req.params.pageName,
      req.user
    );

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${req.params.pageName}.html"`
    );
    res.send(html);
  } catch (err) {
    res.status(404).send('Page not found');
  }
});
```

### Bulk Export API

```javascript
app.post('/api/export/bulk', async (req, res) => {
  const exportManager = engine.getManager('ExportManager');
  const { pages, format } = req.body;

  let content;
  if (format === 'markdown') {
    content = await exportManager.exportToMarkdown(pages, req.user);
  } else {
    content = await exportManager.exportPagesToHtml(pages, req.user);
  }

  const filePath = await exportManager.saveExport(content, 'bulk-export', format);
  res.json({ success: true, path: filePath });
});
```

### Export Management Dashboard

```javascript
app.get('/admin/exports', async (req, res) => {
  const exportManager = engine.getManager('ExportManager');
  const exports = await exportManager.getExports();

  res.render('admin/exports', { exports });
});

app.delete('/admin/exports/:filename', async (req, res) => {
  const exportManager = engine.getManager('ExportManager');
  await exportManager.deleteExport(req.params.filename);
  res.json({ success: true });
});
```

---

## Notes

- **HTML styling:** Exports include embedded CSS for consistent rendering
- **Print support:** HTML exports have print-friendly styles
- **File sanitization:** Filenames are sanitized to remove special characters
- **No PDF yet:** PDF export listed in supportedFormats but not implemented

---

## Related Documentation

- [ExportManager.md](ExportManager.md) - Quick reference
- [PageManager](PageManager.md) - Page content source
- [RenderingManager](RenderingManager.md) - Markdown rendering
- [LocaleUtils](../utils/LocaleUtils.md) - Locale formatting
