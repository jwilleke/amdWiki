# WikiDocument DOM Migration Guide

**Version:** 1.3.2
**Last Updated:** 2025-10-13
**Target Audience:** Developers with custom handlers or extensions

## Overview

This guide helps developers migrate from the legacy 7-phase string-based parser to the new WikiDocument DOM extraction pipeline (Issues #115-#120).

**Good News:** Most users don't need to do anything! The new pipeline is backward compatible and active by default.

## Do You Need to Migrate?

### You DON'T need to migrate if:

- ✅ You only use standard JSPWiki syntax (variables, plugins, links)
- ✅ You haven't created custom syntax handlers
- ✅ You haven't modified the MarkupParser code
- ✅ You use amdWiki's standard configuration

**Action:** None required. The new pipeline is active by default.

### You DO need to migrate if:

- ⚠️ You created custom phase processors
- ⚠️ You created custom syntax handlers
- ⚠️ You modified MarkupParser internals
- ⚠️ You rely on specific phase execution order

**Action:** Follow the migration steps below.

---

## Migration Steps

### Step 1: Understand the New Architecture

**Old Approach (7-Phase):**
```
Content → Phase 1 → Phase 2 → ... → Phase 7 → HTML
(String manipulation at each phase)
```

**New Approach (Extraction):**
```
Content → Extract JSPWiki → Create DOM Nodes → Showdown → Merge → HTML
(Separation of concerns, no conflicts)
```

**Key Differences:**
- **Pre-extraction**: JSPWiki syntax extracted BEFORE markdown parsing
- **DOM-based**: Nodes created instead of string manipulation
- **No conflicts**: Markdown and JSPWiki don't interfere
- **Order-independent**: Extraction order doesn't matter

### Step 2: Assess Your Custom Code

**Check for custom handlers:**
```bash
# Search for custom phase processors
grep -r "process.*function\|process.*=>" src/

# Search for custom syntax handlers
grep -r "Handler.*extends\|class.*Handler" src/
```

**If found:** Proceed to Step 3
**If not found:** You're done! No migration needed.

### Step 3: Choose Migration Strategy

**Option A: DOM Handler (Recommended)**
- Create a new DOM handler class
- Implement `createNodeFromExtract()` method
- Integrate with extraction pipeline

**Option B: Keep Legacy (Temporary)**
- Set `jspwiki.parser.useExtractionPipeline = false`
- Continue using legacy parser
- Plan migration for future

**Option C: Hybrid (Advanced)**
- Use extraction pipeline for standard syntax
- Add post-processing for custom syntax
- Best of both worlds

---

## Migration Patterns

### Pattern 1: Simple String Replacement

**Before (Legacy Phase):**
```javascript
// Custom phase in phases array
{
  name: 'CustomSyntax',
  priority: 250,
  process: async (content, context) => {
    // Replace custom syntax with HTML
    return content.replace(/\{\{highlight:(.*?)\}\}/g, (match, text) => {
      return `<mark>${text}</mark>`;
    });
  }
}
```

**After (DOM Handler):**
```javascript
// 1. Add extraction pattern in extractJSPWikiSyntax()
sanitized = sanitized.replace(/\{\{highlight:(.*?)\}\}/g, (match, text) => {
  jspwikiElements.push({
    type: 'highlight',
    text: text,
    id: id++,
    syntax: match
  });
  return `<!--JSPWIKI-${uuid}-${id - 1}-->`;
});

// 2. Create DOM handler
class HighlightHandler {
  async createNodeFromExtract(element, context, wikiDocument) {
    const node = wikiDocument.createElement('mark', {
      'class': 'wiki-highlight',
      'data-jspwiki-id': element.id.toString()
    });
    node.textContent = element.text;
    return node;
  }
}

// 3. Add to createDOMNode() switch
case 'highlight':
  return await this.highlightHandler.createNodeFromExtract(
    element, context, wikiDocument
  );
```

---

### Pattern 2: Complex Processing

**Before (Multiple Phases):**
```javascript
// Phase 1: Extract metadata
{
  name: 'ExtractMetadata',
  process: async (content, context) => {
    const metadata = {};
    content = content.replace(/<!--META:(.*?)-->/g, (match, data) => {
      metadata[data.split('=')[0]] = data.split('=')[1];
      return '';
    });
    context.metadata = metadata;
    return content;
  }
}

// Phase 2: Use metadata
{
  name: 'ApplyMetadata',
  process: async (content, context) => {
    if (context.metadata.theme) {
      return `<div class="${context.metadata.theme}">${content}</div>`;
    }
    return content;
  }
}
```

**After (Single Handler):**
```javascript
// Extract metadata during extraction phase
sanitized = sanitized.replace(/<!--META:(.*?)-->/g, (match, data) => {
  const [key, value] = data.split('=');
  jspwikiElements.push({
    type: 'metadata',
    key, value,
    id: id++,
    syntax: match
  });
  return `<!--JSPWIKI-${uuid}-${id - 1}-->`;
});

// Create metadata handler
class MetadataHandler {
  constructor() {
    this.metadata = {};
  }

  async createNodeFromExtract(element, context, wikiDocument) {
    // Store metadata (invisible node)
    this.metadata[element.key] = element.value;

    // Return empty text node (metadata is invisible)
    return wikiDocument.createTextNode('');
  }

  async applyMetadata(wikiDocument) {
    // Apply metadata after all nodes created
    if (this.metadata.theme) {
      const root = wikiDocument.getRootElement();
      root.setAttribute('class', this.metadata.theme);
    }
  }
}
```

---

### Pattern 3: Context-Dependent Processing

**Before (Using Parse Context):**
```javascript
{
  name: 'UserContent',
  process: async (content, context) => {
    if (context.userRole === 'admin') {
      // Show admin content
      return content.replace(/\[\[ADMIN\]\](.*?)\[\[\/ADMIN\]\]/gs, '$1');
    } else {
      // Hide admin content
      return content.replace(/\[\[ADMIN\]\].*?\[\[\/ADMIN\]\]/gs, '');
    }
  }
}
```

**After (Context in Handler):**
```javascript
// Extract admin blocks
sanitized = sanitized.replace(
  /\[\[ADMIN\]\](.*?)\[\[\/ADMIN\]\]/gs,
  (match, content) => {
    jspwikiElements.push({
      type: 'adminBlock',
      content: content,
      id: id++,
      syntax: match
    });
    return `<!--JSPWIKI-${uuid}-${id - 1}-->`;
  }
);

// Create admin block handler
class AdminBlockHandler {
  async createNodeFromExtract(element, context, wikiDocument) {
    // Check user role from context
    if (context.userRole === 'admin' || context.userContext?.roles?.includes('admin')) {
      // Create div with admin content
      const node = wikiDocument.createElement('div', {
        'class': 'admin-content',
        'data-jspwiki-id': element.id.toString()
      });
      node.textContent = element.content;
      return node;
    } else {
      // Return empty text node (hidden)
      return wikiDocument.createTextNode('');
    }
  }
}
```

---

## Integration Guide

### Adding a Custom Handler

**Step 1: Create Handler Class**

```javascript
// src/parsers/dom/handlers/CustomHandler.js
class CustomHandler {
  constructor(engine) {
    this.engine = engine;
  }

  async initialize() {
    // Initialize resources
    console.log('CustomHandler initialized');
  }

  async createNodeFromExtract(element, context, wikiDocument) {
    // Create and return DOM node
    const node = wikiDocument.createElement('div', {
      'class': 'custom-element',
      'data-jspwiki-id': element.id.toString()
    });
    node.textContent = element.content;
    return node;
  }
}

module.exports = CustomHandler;
```

**Step 2: Add Extraction Pattern**

```javascript
// In MarkupParser.extractJSPWikiSyntax()
// Add after existing extraction patterns

// Step X: Extract custom syntax
sanitized = sanitized.replace(/\[\[CUSTOM:(.*?)\]\]/g, (match, content) => {
  jspwikiElements.push({
    type: 'custom',
    content: content.trim(),
    id: id++,
    position: match.index,
    syntax: match
  });
  return `<!--JSPWIKI-${uuid}-${id - 1}-->`;
});
```

**Step 3: Integrate Handler**

```javascript
// In MarkupParser constructor
const CustomHandler = require('./dom/handlers/CustomHandler');
this.customHandler = new CustomHandler(engine);

// In MarkupParser.initialize()
await this.customHandler.initialize();

// In MarkupParser.createDOMNode() switch statement
case 'custom':
  return await this.customHandler.createNodeFromExtract(
    element, context, wikiDocument
  );
```

**Step 4: Test**

```javascript
// Test your custom syntax
const content = '[[CUSTOM:Hello World]]';
const html = await parser.parseWithDOMExtraction(content, context);
// Should output: <div class="custom-element">Hello World</div>
```

---

## Common Pitfalls

### Pitfall 1: Extracting Inside Code Blocks

**Problem:**
```javascript
// This extracts from code blocks (wrong!)
sanitized = sanitized.replace(/pattern/g, ...);
```

**Solution:**
```javascript
// Code blocks are already protected in extractJSPWikiSyntax()
// Your pattern added there will automatically skip code blocks
```

### Pitfall 2: Order Dependency

**Problem:**
```javascript
// Assuming variables are expanded before plugins
const content = element.content.replace(/\[\{\$(\w+)\}\]/g, ...);
```

**Solution:**
```javascript
// Don't process JSPWiki syntax manually
// Let the pipeline handle it:
// 1. Extract both variables and plugins
// 2. Create nodes for each
// 3. Merge will handle correct order
```

### Pitfall 3: Modifying Sanitized Content

**Problem:**
```javascript
// Trying to add markup to sanitized content
sanitized += '<div>footer</div>';  // Wrong!
```

**Solution:**
```javascript
// Add elements via extraction/DOM creation
jspwikiElements.push({
  type: 'footer',
  id: id++
});
// Then create node in handler
```

### Pitfall 4: Synchronous Handlers

**Problem:**
```javascript
// Handler is not async
createNodeFromExtract(element, context, wikiDocument) {
  return node;  // Missing await for async operations
}
```

**Solution:**
```javascript
// Always use async
async createNodeFromExtract(element, context, wikiDocument) {
  const data = await this.fetchData();  // Can use await
  return node;
}
```

---

## Testing Your Migration

### Unit Tests

```javascript
// test/CustomHandler.test.js
describe('CustomHandler', () => {
  let parser, customHandler;

  beforeEach(async () => {
    parser = new MarkupParser(mockEngine);
    await parser.initialize();
    customHandler = parser.customHandler;
  });

  test('extracts custom syntax', () => {
    const content = '[[CUSTOM:test]]';
    const { jspwikiElements } = parser.extractJSPWikiSyntax(content);

    expect(jspwikiElements).toHaveLength(1);
    expect(jspwikiElements[0].type).toBe('custom');
    expect(jspwikiElements[0].content).toBe('test');
  });

  test('creates DOM node', async () => {
    const WikiDocument = require('../src/parsers/dom/WikiDocument');
    const wikiDocument = new WikiDocument();

    const element = { type: 'custom', content: 'test', id: 0 };
    const node = await customHandler.createNodeFromExtract(
      element, {}, wikiDocument
    );

    expect(node.tagName).toBe('DIV');
    expect(node.textContent).toBe('test');
  });

  test('full pipeline', async () => {
    const content = '[[CUSTOM:Hello]]';
    const html = await parser.parseWithDOMExtraction(content, {});

    expect(html).toContain('<div class="custom-element">Hello</div>');
    expect(html).not.toContain('<!--JSPWIKI-');
  });
});
```

### Integration Tests

See [Phase 5 Manual QA Plan](../testing/Phase5-Manual-QA-Plan.md) for comprehensive testing procedures.

---

## Rollback Plan

If you encounter issues with the new pipeline:

### Temporary Rollback (Immediate)

**config/app-custom-config.json:**
```json
{
  "jspwiki.parser.useExtractionPipeline": false
}
```

Restart server. Pages will use legacy parser.

### Permanent Rollback (If Needed)

1. Set configuration permanently:
   ```json
   {
     "jspwiki.parser.useExtractionPipeline": false
   }
   ```

2. Report issues on GitHub: https://github.com/jwilleke/amdWiki/issues

3. Include:
   - Error messages
   - Content that fails
   - Expected vs actual output
   - Configuration

---

## Performance Considerations

### Handler Performance

**Good:**
```javascript
async createNodeFromExtract(element, context, wikiDocument) {
  // Fast node creation
  const node = wikiDocument.createElement('div');
  node.textContent = element.content;
  return node;
}
```

**Bad:**
```javascript
async createNodeFromExtract(element, context, wikiDocument) {
  // Slow: database query for every element
  const data = await database.query('SELECT ...');
  // ...
}
```

**Better:**
```javascript
async initialize() {
  // Cache data during initialization
  this.cache = await database.query('SELECT ...');
}

async createNodeFromExtract(element, context, wikiDocument) {
  // Fast: lookup in cache
  const data = this.cache[element.key];
  // ...
}
```

### Extraction Performance

- Keep regex patterns simple
- Avoid backtracking in regex
- Don't extract too much (only what you need)
- Test with large pages (10KB+)

---

## Getting Help

### Resources

- **API Documentation:** [MarkupParser API](../api/MarkupParser-API.md)
- **Architecture:** [WikiDocument DOM Architecture](../architecture/WikiDocument-DOM-Architecture.md)
- **Examples:** See `src/parsers/dom/handlers/` for reference implementations

### Support

- **GitHub Issues:** https://github.com/jwilleke/amdWiki/issues
- **Documentation:** https://github.com/jwilleke/amdWiki/tree/master/docs

### Reporting Issues

Include:
1. amdWiki version
2. Custom handler code
3. Input content that fails
4. Expected output
5. Actual output
6. Error logs

---

## FAQ

**Q: Do I need to rewrite all my pages?**

A: No! Pages are backward compatible. The parser changes how they're processed internally.

**Q: What if my custom handler breaks?**

A: Set `jspwiki.parser.useExtractionPipeline = false` temporarily, then follow this guide to migrate.

**Q: Can I use both pipelines?**

A: No, only one pipeline is active at a time. Choose via configuration.

**Q: Will the legacy parser be removed?**

A: Not in the near term. It's kept for backward compatibility.

**Q: How do I know which pipeline is running?**

A: Check server logs on startup. You'll see:
- `"🔄 Using WikiDocument DOM extraction pipeline"` (new)
- `"🔄 Using legacy 7-phase parser"` (old)

**Q: Can I add custom syntax without modifying MarkupParser.js?**

A: Currently, no. Custom syntax requires modifying extraction patterns. A plugin system for extraction is planned for a future release.

---

## Changelog

### Phase 7 (Issue #121) - Documentation
- ✅ Created comprehensive migration guide
- ✅ Added migration patterns
- ✅ Added integration examples
- ✅ Added testing guidance

### Phase 6 (Issue #120) - Production Integration
- ✅ Integrated extraction pipeline
- ✅ Made extraction pipeline default
- ✅ Added configuration property

---

**Last Updated:** 2025-10-13
**Status:** Complete
**Next Review:** Phase 8 (if needed)
