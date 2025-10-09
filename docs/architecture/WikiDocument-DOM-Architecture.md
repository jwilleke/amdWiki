---
title: WikiDocument DOM Architecture - Analysis and Implementation Plan
uuid: wikidocument-dom-architecture
category: documentation
user-keywords: [architecture, parser, DOM, JSPWiki]
lastModified: 2025-10-09
---

# WikiDocument DOM Architecture - Analysis and Implementation Plan

## Problem Statement

**Issue**: The `[[` escaping problem keeps recurring despite multiple fixes because our current string-based parsing pipeline is inherently fragile and order-dependent.

**Root Cause**: amdWiki's MarkupParser processes content as **strings** through multiple phases, making it impossible to reliably handle escaping, variables, plugins, and links without conflicts.

**Example of the Issue**:

```markdown
## Basic System Variables
- Application Name ( [[{$applicationname}] ) : [{$applicationname}]
```

**Expected Output**:
```
Application Name ([{$applicationname}]) : amdWiki
```

**Actual Output**:
```
Application Name ([amdWiki: amdWiki
```

The `[[` escape is being processed incorrectly because string replacements happen in the wrong order.

## JSPWiki's Solution: WikiDocument Internal DOM

### Architecture Overview

JSPWiki solves this problem by **building an internal DOM tree** (not string processing):

```
Raw Wiki Markup
    ↓
MarkupParser (tokenizes and builds JDOM tree)
    ↓
WikiDocument (JDOM2-based DOM structure)
    ↓
Plugins/Variables/Filters (manipulate DOM nodes)
    ↓
XHTMLRenderer (serializes DOM to HTML)
    ↓
Final HTML Output
```

### Key Components from JSPWiki

#### 1. WikiDocument Class
```java
public class WikiDocument extends org.jdom2.Document {
    // Stores the DOM tree of a rendered WikiPage
    // Extends JDOM Document with JSPWiki-specific metadata

    private String pageData;           // Original wiki markup
    private WeakReference<Context> context;  // Rendering context

    public void setPageData(String data);
    public String getPageData();
    public void setContext(Context ctx);
    public Context getContext();
    public WikiPage getPage();
}
```

**Benefits**:
- DOM is cached separately from page metadata
- Context uses weak reference for garbage collection
- Internal representation is already XHTML

#### 2. MarkupParser (Abstract)
```java
public abstract class MarkupParser {
    // Token-based parsing that builds JDOM Elements

    protected abstract WikiDocument parse();  // Build DOM tree
    protected Element makeHeading(int level);  // Create DOM nodes
    protected int parseToken();  // CHARACTER, ELEMENT, or IGNORE
    protected void pushBack(int c);  // Lookahead support

    // Extensible hooks for processing
    addLocalLinkHook();
    addExternalLinkHook();
    addAttachmentLinkHook();
}
```

**Benefits**:
- Processes input character-by-character
- Creates DOM nodes (Elements) incrementally
- Supports lookahead via pushBack()
- Extensible via hooks

#### 3. XHTMLRenderer
```java
public class XHTMLRenderer {
    public XHTMLRenderer(Context context, WikiDocument doc);
    public String getString();  // Serialize DOM to HTML
}
```

**Benefits**:
- Trivial rendering: DOM is already XHTML
- Just dumps out the DOM tree
- No string manipulation needed

### Why This Works

1. **Structure Preservation**: DOM nodes have types (Element, Text, Attribute)
2. **No Order Dependency**: Variables, plugins, links are DOM nodes that can be processed independently
3. **Escaping is Natural**: Escaped content becomes Text nodes, not Elements
4. **Cacheable**: WikiDocument can be cached and reused
5. **Transformable**: DOM can be manipulated before rendering

## amdWiki's Current Architecture (String-Based)

### Current Pipeline

```
Raw Markdown
    ↓
Phase 1: Preprocessing (string replacement)
    ↓
Phase 2: Syntax Recognition (regex patterns)
    ↓
Phase 3: Context Resolution (variable expansion)
    ↓
Phase 4: Content Transformation (handler execution)
    ↓
Phase 5: Filter Pipeline (validation)
    ↓
Phase 6: Markdown Conversion (Showdown)
    ↓
Phase 7: Post-processing (cleanup)
    ↓
Final HTML (string)
```

### Problems with String-Based Approach

1. **Order Dependency**: Each phase must run in exact order
   - Variables before plugins? Or plugins before variables?
   - Escape before or after variables?
   - One change breaks everything

2. **State Loss**: After string replacement, you lose track of what was what
   - Was `[{$var}]` originally `[[{$var}]`?
   - Is this `[text]` a link or an escaped bracket?
   - Context is lost after replacement

3. **Fragile Escaping**: Escape sequences must survive ALL phases
   - `[[` → temporary token → hope it survives → convert back
   - Any phase can accidentally process escaped content
   - Leads to bugs like the one you're seeing

4. **Performance**: Can't cache intermediate results
   - Must reprocess entire string for each request
   - No way to cache "parsed but not rendered" state

5. **Hard to Debug**: String transformations are opaque
   - Can't inspect "what is this element?"
   - Can't trace "where did this come from?"

### Example of the Brittleness

```javascript
// Phase 1: Escape handling
content = content.replace(/\[\[/g, '___ESCAPED_BRACKET___');

// Phase 3: Variable expansion (WRONG! It processes the escaped content)
content = content.replace(/\[\{(\$\w+)\}\]/g, (match, var) => {
  return expandVariable(var);
});

// Phase 7: Unescape (too late, damage done)
content = content.replace(/___ESCAPED_BRACKET___/g, '[');
```

The problem: Phase 3 matches `___ESCAPED_BRACKET___{$var}]` because the `[` is now just part of a string!

## Proposed Solution: Implement WikiDocument DOM

### Architecture Overview

```javascript
// New architecture
class WikiDocument {
  constructor(pageData, context) {
    this.root = new Element('div');  // Root JSDOM element
    this.pageData = pageData;
    this.context = new WeakRef(context);
    this.metadata = {};
  }

  getRootElement() { return this.root; }
  getPageData() { return this.pageData; }
  getContext() { return this.context.deref(); }
  toHTML() { return this.root.innerHTML; }
}

class MarkupParser {
  parse(content, context) {
    const doc = new WikiDocument(content, context);
    const root = doc.getRootElement();

    // Token-based parsing
    let pos = 0;
    while (pos < content.length) {
      const token = this.nextToken(content, pos);

      switch(token.type) {
        case 'TEXT':
          root.appendChild(this.createTextNode(token.value));
          break;
        case 'VARIABLE':
          root.appendChild(this.createVariableElement(token));
          break;
        case 'PLUGIN':
          root.appendChild(this.createPluginElement(token));
          break;
        case 'LINK':
          root.appendChild(this.createLinkElement(token));
          break;
        case 'ESCAPED':
          root.appendChild(this.createTextNode(token.unescapedValue));
          break;
      }
      pos = token.endPos;
    }

    return doc;
  }

  createVariableElement(token) {
    const el = this.createElement('span');
    el.setAttribute('data-variable', token.name);
    el.setAttribute('class', 'wiki-variable');
    el.textContent = this.resolveVariable(token.name);
    return el;
  }
}

class XHTMLRenderer {
  render(wikiDocument) {
    // Simple: DOM is already HTML-ready
    return wikiDocument.toHTML();
  }
}
```

### Benefits of DOM Approach

1. **No Order Dependency**:
   - Parse everything into DOM first
   - Then process nodes independently
   - Variables don't interfere with plugins

2. **Natural Escaping**:
   ```javascript
   // [[ becomes a text node with value "["
   // [{$var}] becomes a variable element
   // These can't interfere because they're different node types
   ```

3. **Cacheable**:
   ```javascript
   // Cache the WikiDocument, not the HTML
   cache.set(pageId, wikiDocument);

   // Later, render with different context
   const html = renderer.render(wikiDocument);
   ```

4. **Inspectable**:
   ```javascript
   // Can query the DOM
   doc.querySelectorAll('[data-variable]');  // All variables
   doc.querySelectorAll('.wiki-plugin');     // All plugins
   ```

5. **Transformable**:
   ```javascript
   // Plugins can manipulate DOM before rendering
   const pluginElements = doc.querySelectorAll('.wiki-plugin');
   for (const el of pluginElements) {
     await plugin.execute(el, context);
   }
   ```

## Implementation Plan

### Phase 1: Add WikiDocument Class (Non-Breaking)

```javascript
// New file: src/parsers/WikiDocument.js
class WikiDocument {
  constructor(pageData, context) {
    this.pageData = pageData;
    this.context = new WeakRef(context);
    this.dom = null;  // Will use jsdom or similar
  }

  // Methods to manipulate DOM
  createElement(tag) { /* ... */ }
  createTextNode(text) { /* ... */ }
  appendChild(node) { /* ... */ }
  querySelector(selector) { /* ... */ }
  toHTML() { /* ... */ }
}
```

### Phase 2: Refactor MarkupParser to Build DOM

```javascript
// Modify: src/parsers/MarkupParser.js
async parse(content, context) {
  // NEW: Build WikiDocument instead of string manipulation
  const wikiDoc = new WikiDocument(content, context);

  // Tokenize and build DOM
  await this.buildDOM(content, wikiDoc, context);

  // Process DOM nodes (variables, plugins, etc.)
  await this.processVariables(wikiDoc, context);
  await this.processPlugins(wikiDoc, context);
  await this.processLinks(wikiDoc, context);

  // Serialize to HTML
  return wikiDoc.toHTML();
}
```

### Phase 3: Update Handlers to Work with DOM

```javascript
// Handlers modify DOM nodes, not strings
class VariableHandler {
  async process(wikiDocument, context) {
    const variableNodes = wikiDocument.querySelectorAll('[data-variable]');
    for (const node of variableNodes) {
      const varName = node.getAttribute('data-variable');
      const value = await this.resolveVariable(varName, context);
      node.textContent = value;
    }
  }
}
```

### Phase 4: Add Renderer

```javascript
// New file: src/parsers/XHTMLRenderer.js
class XHTMLRenderer {
  constructor(engine) {
    this.engine = engine;
  }

  render(wikiDocument, context) {
    // Optional: apply post-processing filters
    // But mostly just serialize the DOM
    return wikiDocument.toHTML();
  }
}
```

### Phase 5: Integrate with RenderingManager

```javascript
// Modify: src/managers/RenderingManager.js
async textToHTML(context, pageContent) {
  const markupParser = this.engine.getManager('MarkupParser');

  // NEW: Returns WikiDocument, not string
  const wikiDoc = await markupParser.parseToDocument(pageContent, context);

  // NEW: Render WikiDocument to HTML
  const renderer = new XHTMLRenderer(this.engine);
  return renderer.render(wikiDoc, context);
}
```

## Migration Strategy

### Step 1: Create WikiDocument Class (Week 1)
- Implement WikiDocument with JSDOM
- Add basic DOM manipulation methods
- Write unit tests

### Step 2: Add Token-Based Parser (Week 2)
- Implement tokenizer (character-by-character)
- Parse into WikiDocument DOM
- Keep existing string-based parser as fallback

### Step 3: Migrate Handlers (Week 3-4)
- Convert handlers to work with DOM nodes
- One handler at a time
- Test each migration

### Step 4: Deprecate String Pipeline (Week 5)
- Default to DOM-based parsing
- Remove string-based phases
- Update documentation

### Step 5: Remove Legacy Code (Week 6)
- Clean up old string-based code
- Performance tuning
- Final testing

## Technical Decisions

### DOM Library Choice

**Option 1: jsdom** (Recommended)
- Full DOM implementation
- querySelector, appendChild, etc.
- Heavy but feature-complete

**Option 2: cheerio**
- Lighter weight
- jQuery-like API
- Might be sufficient

**Option 3: Custom DOM**
- Minimal implementation
- Only what we need
- More work, but lighter

**Recommendation**: Start with jsdom for full compatibility, optimize later if needed.

### Caching Strategy

```javascript
// Cache WikiDocument objects, not HTML strings
class WikiDocumentCache {
  set(key, wikiDocument) {
    // Serialize WikiDocument for caching
    const serialized = {
      pageData: wikiDocument.pageData,
      dom: wikiDocument.toHTML(),  // Or serialize full DOM
      metadata: wikiDocument.metadata
    };
    return this.cache.set(key, serialized);
  }

  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Reconstruct WikiDocument
    return WikiDocument.fromSerialized(cached);
  }
}
```

### Backward Compatibility

During migration, support both approaches:

```javascript
async parse(content, context) {
  if (this.config.useDOMParser) {
    // NEW: DOM-based
    return this.parseToDocument(content, context);
  } else {
    // OLD: String-based (deprecated)
    return this.parseString(content, context);
  }
}
```

## Expected Benefits

### 1. Fixes Escaping Issues Permanently
- `[[` becomes a text node `[`
- Can't be accidentally processed by other phases
- No order dependency

### 2. Improves Performance
- Cache WikiDocument, not HTML
- Reuse parsed DOM with different contexts
- Avoid redundant parsing

### 3. Enables Advanced Features
- DOM manipulation for plugins
- Query parsed content
- Transform before rendering

### 4. Better Debugging
- Inspect DOM structure
- See what each element is
- Trace parsing issues

### 5. JSPWiki Compatibility
- Matches JSPWiki architecture
- Easier to port JSPWiki features
- Familiar to JSPWiki developers

## Risks and Mitigations

### Risk 1: Performance Overhead
**Mitigation**:
- Cache WikiDocument objects
- Use lightweight DOM library
- Benchmark and optimize

### Risk 2: Breaking Changes
**Mitigation**:
- Phased migration
- Keep old parser as fallback
- Comprehensive testing

### Risk 3: Complexity
**Mitigation**:
- Start simple
- Add features incrementally
- Good documentation

### Risk 4: Learning Curve
**Mitigation**:
- Follow JSPWiki patterns
- Clear examples
- Team training

## Conclusion

The recurring `[[` escaping issue is a symptom of a deeper architectural problem: **string-based parsing is inherently fragile**.

JSPWiki solved this problem 20 years ago by using an **internal DOM representation**. We should follow their proven approach:

1. ✅ **Parse to DOM** - Token-based parsing builds WikiDocument
2. ✅ **Process DOM nodes** - Variables, plugins, links as DOM elements
3. ✅ **Render from DOM** - Serialize to HTML at the end

This will **permanently fix** the escaping issues and make the parser:
- More robust
- More performant
- Easier to maintain
- JSPWiki-compatible

**Recommendation**: Implement WikiDocument DOM architecture following JSPWiki's proven design.

## References

- [JSPWiki WikiDocument API](https://jspwiki.apache.org/apidocs/2.12.1/org/apache/wiki/parser/WikiDocument.html)
- [JSPWiki MarkupParser](https://github.com/apache/jspwiki/blob/master/jspwiki-main/src/main/java/org/apache/wiki/parser/MarkupParser.java)
- [JSPWiki XHTMLRenderer](https://jspwiki.apache.org/apidocs/2.12.1/org/apache/wiki/render/XHTMLRenderer.html)
- [Current MarkupParser.js](../../src/parsers/MarkupParser.js)
- [.github/copilot-instructions.md RenderPipeline](../../.github/copilot-instructions.md#L19-L32)
