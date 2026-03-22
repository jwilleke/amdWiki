# JSPWikiPreprocessor Architecture

> NOTE: part of [WikiDocument-DOM-Architecture](../../docs/architecture/WikiDocument-DOM-Architecture.md)

## Overview

`JSPWikiPreprocessor` is a Phase 1 handler in the ngdpbase rendering pipeline that processes JSPWiki-specific syntax **before** markdown conversion. This ensures JSPWiki markup is properly converted to HTML before any other transformations occur.

## Position in the Rendering Pipeline

### The 7-Phase Processing Pipeline

```text
User Request → RenderingManager → MarkupParser → 7 Phases → HTML Response
```

#### Complete Phase Breakdown

1. **Phase 1: Preprocessing** ← **JSPWikiPreprocessor runs here**
   - Escape handling (EscapedSyntaxHandler - priority 100)
   - JSPWiki syntax processing (JSPWikiPreprocessor - priority 95)
   - Code block protection
   - Line ending normalization

2. **Phase 2: Syntax Recognition**
   - Pattern detection
   - Token creation

3. **Phase 3: Context Resolution**
   - Variable expansion (VariableManager)
   - Parameter resolution

4. **Phase 4: Content Transformation**
   - PluginSyntaxHandler
   - WikiTagHandler
   - WikiFormHandler
   - LinkParserHandler
   - AttachmentHandler

5. **Phase 5: Filter Pipeline**
   - ValidationFilter
   - Content filtering

6. **Phase 6: Markdown Conversion**
   - Showdown processing
   - Markdown → HTML

7. **Phase 7: Post-processing**
   - HTML cleanup
   - Final validation

### Why Phase 1?

**Critical Design Decision:** JSPWikiPreprocessor runs in Phase 1 (before markdown) to solve a fundamental problem:

PROBLEM (Old Architecture):
Phase 4: WikiStyleHandler sees: %%table-striped
Phase 6: Markdown wraps header: || Product || → ```<p>```|| Product ||</p>
Phase 4: WikiTableHandler can't find headers (they're in ```<p>``` tags!)
Result: Headers appear OUTSIDE tables ❌

SOLUTION (New Architecture):
Phase 1: JSPWikiPreprocessor sees: %%table-striped\n|| Product ||\n| Data |
Phase 1: Converts to: ```<table class="table table-striped"><thead>...```
Phase 6: Markdown leaves ```<table>``` HTML unchanged ✅
Result: Headers are INSIDE tables ✓

## How JSPWikiPreprocessor Works

### 1. Entry Point

```javascript
async process(content, context) {
  const processedContent = this.parseStyleBlocks(content);
  return processedContent;
}
```

### 2. Nested Block Parsing

**Input:**

```markdown
%%zebra-table
%%sortable
|| Header || Data ||
| Cell 1 | Cell 2 |
/%
/%
```

**Processing Flow:**

```javascript
parseStyleBlocks(content, accumulatedClasses = [])
  ├─ Finds: %%zebra-table
  ├─ isTableClass('zebra-table') → true
  ├─ Accumulates: ['zebra-table']
  ├─ Recursively processes inner content:
  │   ├─ Finds: %%sortable
  │   ├─ isTableClass('sortable') → true
  │   ├─ Accumulates: ['zebra-table', 'sortable']
  │   ├─ Finds table syntax: || Header ||
  │   └─ Calls: parseTable(content, 'zebra-table sortable')
  └─ Returns: <table class="table zebra-table sortable">...
```

### 3. Table Parsing

**JSPWiki Syntax:**

``` markdown
|| Header 1 || Header 2 ||   ← Double pipes = header row
| Cell 1 | Cell 2 |          ← Single pipes = data row
```

**Parsing Logic:**

```javascript
parseTableRow(line) {
  const isHeader = line.trim().startsWith('||');
  const delimiter = isHeader ? '||' : '|';
  const cells = line.split(delimiter).slice(1, -1); // Remove empty edges
  return { isHeader, cells };
}
```

**HTML Output:**

```html
<table class="table zebra-table sortable">
  <thead>
    <tr><th>Header 1</th><th>Header 2</th></tr>
  </thead>
  <tbody>
    <tr><td>Cell 1</td><td>Cell 2</td></tr>
  </tbody>
</table>
```

### 4. Custom Color Support

**Syntax:** `%%zebra-HEXCOLOR` (e.g., `%%zebra-ffe0e0`)

**Processing:**

```javascript
extractCustomStyles(['zebra-ffe0e0'])
  ├─ Regex match: /^zebra-([0-9a-fA-F]{6})$/
  ├─ Extract: hexColor = 'ffe0e0'
  ├─ Calculate contrast: getContrastColor('ffe0e0')
  │   ├─ Convert to RGB: r=255, g=224, b=224
  │   ├─ Calculate luminance: (0.299*255 + 0.587*224 + 0.114*224) / 255 = 0.90
  │   └─ Return: '#000000' (black, because 0.90 > 0.5)
  ├─ Output classes: 'zebra-table'
  └─ Output styles: '--zebra-row-even: #ffe0e0; --zebra-text-color: #000000;'
```

**HTML Output:**

```html
<table class="table zebra-table" style="--zebra-row-even: #ffe0e0; --zebra-text-color: #000000;">
```

## Integration Points

### With MarkupParser

**Registration:**

```javascript
// MarkupParser.js - registerDefaultHandlers()
const JSPWikiPreprocessor = require('./handlers/JSPWikiPreprocessor');
const jspwikiPreprocessor = new JSPWikiPreprocessor(this.engine);
await this.registerHandler(jspwikiPreprocessor);
```

**Phase Execution:**

```javascript
// MarkupParser.js - phasePreprocessing()
async phasePreprocessing(content, context) {
  const phase1Handlers = this.handlerRegistry.resolveExecutionOrder()
    .filter(handler => handler.phase === 1);

  for (const handler of phase1Handlers) {
    processedContent = await handler.execute(processedContent, context);
  }
  // ... code block protection, normalization
}
```

### With Client-Side JavaScript

JSPWikiPreprocessor generates HTML that client-side JavaScript enhances:

#### 1. zebraTable.js

```javascript
// Finds tables: table.zebra-table
// Applies classes: .zebra-even, .zebra-odd
// Uses CSS variables: --zebra-row-even, --zebra-text-color
```

#### 2. tableSort.js

```javascript
// Finds tables: table.sortable
// Adds click handlers to <th> elements
// Sorts rows and refreshes zebra striping
```

#### 3. tableFilter.js

```javascript
// Finds tables: table.table-filter
// Injects filter input row
// Filters rows and refreshes zebra striping
```

### With CSS

**CSS Variables Flow:**

```css
JSPWikiPreprocessor (JS)
  ↓ Sets inline style
<table style="--zebra-row-even: #ffe0e0; --zebra-text-color: #000000;">
  ↓ CSS variable inheritance
tbody tr.zebra-even (CSS)
  ↓ Uses variables
background-color: var(--zebra-row-even);
color: var(--zebra-text-color);
```

## Supported Table Classes

### Visual Styles

- `zebra-table` - Alternating row colors (default gray)
- `table-striped` - Bootstrap-style striping
- `table-bordered` - Cell borders
- `table-hover` - Highlight on hover
- `table-fit` - Auto-width to content
- `table-sm` / `table-condensed` - Compact padding
- `table-responsive` - Horizontal scrolling on mobile

### Interactive Features

- `sortable` / `table-sort` - Clickable column headers
- `table-filter` - Filter inputs per column

### Custom Colors

- `zebra-HEXCOLOR` - Custom stripe color with auto-contrast text
  - Example: `zebra-ffe0e0` (pink), `zebra-e0e0ff` (blue)

## Design Patterns

### 1. Recursive Descent Parser

```javascript
parseStyleBlocks(content, accumulatedClasses) {
  // Accumulates classes through recursion
  // Handles arbitrary nesting depth
}
```

### 2. State-Based Parsing (Inspired by JSPWiki)

```javascript
// Line-by-line processing
// Maintains state (depth, accumulated classes)
// Handles block boundaries (/%/)
```

### 3. WCAG Accessibility

```javascript
getContrastColor(hexColor) {
  // Ensures WCAG-compliant contrast
  // Automatic black/white selection
}
```

## Deprecated Components

### WikiStyleHandler (Phase 4)

**Replaced by:** JSPWikiPreprocessor (Phase 1)

**Why deprecated:**

- Ran too late (after markdown preprocessing)
- Used marker system (%%TABLE_CLASSES{...}%%)
- Headers separated from tables

### WikiTableHandler (Phase 4)

**Replaced by:** JSPWikiPreprocessor (Phase 1)

**Why deprecated:**

- Couldn't find headers (wrapped in `<p>` tags)
- State-based approach incomplete
- Timing issues with WikiStyleHandler

## Future Plans

### Near-Term Enhancements

1. **Additional JSPWiki Syntax**
   - Definition lists
   - Quote blocks
   - Inline styles (%%style="..." text /%)

2. **Extended Table Features**
   - Column alignment (left/center/right)
   - Column span (`||colspan=2 Header||`)
   - Row span support
   - Cell-level styling

3. **Performance Optimization**
   - Caching parsed tables
   - Incremental parsing for large documents

### Long-Term Architecture

1. **Unified Preprocessor**

   ```text
   JSPWikiPreprocessor (current)
     ├─ Table Parsing ✓
     ├─ Style Blocks ✓
     ├─ Custom Colors ✓
     └─ Future: All JSPWiki syntax
   ```

2. **Plugin System Integration**
   - Allow plugins to extend table styles
   - Custom renderers for special tables
   - Dynamic table generation

3. **Progressive Enhancement**
   - Server-side: Basic HTML tables
   - Client-side: Enhanced interactivity
   - Graceful degradation without JavaScript

## Testing

### Unit Test Coverage Needed

```javascript
describe('JSPWikiPreprocessor', () => {
  describe('parseStyleBlocks', () => {
    test('single style block');
    test('nested style blocks');
    test('multiple tables in one block');
  });

  describe('parseTable', () => {
    test('header rows only');
    test('data rows only');
    test('mixed header and data');
    test('empty cells');
    test('HTML escaping');
  });

  describe('getContrastColor', () => {
    test('light colors return black');
    test('dark colors return white');
    test('edge case: 50% luminance');
  });

  describe('extractCustomStyles', () => {
    test('zebra-HEXCOLOR pattern');
    test('invalid hex colors ignored');
    test('multiple custom colors');
  });
});
```

### Integration Test Scenarios

1. **End-to-End Rendering**
   - Markdown file → MarkupParser → HTML output
   - Verify table structure, classes, inline styles

2. **JavaScript Enhancement**
   - HTML table → zebraTable.js → .zebra-even classes
   - HTML table → tableSort.js → sortable columns

3. **Theme Compatibility**
   - Light mode, dark mode, system preference
   - Custom colors in all themes

## Performance Considerations

### Complexity Analysis

- **Nested blocks:** O(n) where n = content length
- **Table parsing:** O(rows × cells) per table
- **Color calculation:** O(1) per custom color

### Optimization Strategies

1. **Early Exit**

   ```javascript
   if (!content.includes('%%')) return content; // No JSPWiki syntax
   ```

2. **Regex Compilation**

   ```javascript
   // Compile once in constructor
   this.blockPattern = /^%%([a-zA-Z0-9_-]+)$/;
   ```

3. **Minimal DOM Manipulation**
   - Generate complete HTML strings
   - Single innerHTML assignment client-side

## Debugging

### Enable Debug Logging

```javascript
// Add to JSPWikiPreprocessor constructor
this.debug = true;

// Add logging in parseStyleBlocks
if (this.debug) {
  console.log(`🔍 Found block: ${className}`);
  console.log(`🔍 Accumulated classes: ${accumulatedClasses.join(' ')}`);
}
```

### Common Issues

**Issue:** Custom colors not applied

- **Check:** zebraTable.js selector includes `table.zebra-table`
- **Check:** CSS rule includes `table.zebra-table tbody tr.zebra-even`

**Issue:** Headers outside table

- **Check:** JSPWikiPreprocessor registered in Phase 1
- **Check:** Handler phase property: `this.phase = 1`

**Issue:** Nested blocks not working

- **Check:** Matching `/%` for each `%%`
- **Check:** Recursive call passes `accumulatedClasses`

## Related Documentation

- [MarkupParser Architecture](./MarkupParser.md)
- [Handler Priority System](./HandlerRegistry.md)
- [Table Styles Guide](../features/TableStyles.md)
- [Phase Processing Pipeline](./ProcessingPipeline.md)

---

**Last Updated:** 2025-10-07
**Maintainer:** ngdpbase Development Team
