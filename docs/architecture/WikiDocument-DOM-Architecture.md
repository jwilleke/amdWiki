---
title: WikiDocument DOM Architecture - Implementation Complete
uuid: wikidocument-dom-architecture
category: documentation
user-keywords: [architecture, parser, DOM, JSPWiki]
lastModified: 2025-10-13
status: IMPLEMENTED
---

# WikiDocument DOM Architecture - Production Ready

**Status:** ✅ Phases 1-6 Complete (Issues #115, #116, #117, #118, #119, #120)
**Last Updated:** 2025-10-13
**Test Coverage:** 376+ tests passing
**Production Status:** DEPLOYED (extraction pipeline active by default)

## Problem Statement

**Issue**: The `[[` escaping problem keeps recurring despite multiple fixes because our current string-based parsing pipeline is inherently fragile and order-dependent.

**Root Cause**: amdWiki's MarkupParser processes content as **strings** through multiple phases, making it impossible to reliably handle escaping, variables, plugins, and links without conflicts.

**Example of the Issue**:

```markdown
## Basic System Variables
- Application Name ( [[{$applicationname}] ) : [{$applicationname}]
```

**Expected Output**:
```text
Application Name ([{$applicationname}]) : amdWiki
```

**Actual Output**:
```text
Application Name ([amdWiki: amdWiki
```

The `[[` escape is being processed incorrectly because string replacements happen in the wrong order.

## JSPWiki's Solution: WikiDocument Internal DOM

### Architecture Overview

JSPWiki solves this problem by **building an internal DOM tree** (not string processing):

```text
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

```text
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

## Implemented Solution: Pre-Extraction Strategy (Phases 1-4)

### Architecture Overview

**The solution was implemented using a pre-extraction strategy** that separates JSPWiki syntax processing from markdown parsing:

```
┌─────────────────────────────────────────────────────────────┐
│                    INPUT: Wiki Markup                        │
│  "## Welcome\n\nUser: [{$username}]\n\nPage: [HomePage]"    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│         PHASE 1: Extract JSPWiki Syntax                      │
│         MarkupParser.extractJSPWikiSyntax()                  │
│         (Issue #115 - ✅ COMPLETE)                           │
│                                                               │
│  • Scan for JSPWiki patterns: [{$var}], [{PLUGIN}], [Link]  │
│  • Extract each element with metadata                        │
│  • Replace with inline span placeholders                     │
│  • Return: { sanitized, jspwikiElements, uuid }             │
│                                                               │
│  RESULT: "## Welcome\n\nUser: <span data-jspwiki-           │
│           placeholder="uuid-0"></span>\n\nPage:              │
│           <span data-jspwiki-placeholder="uuid-1"></span>"   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│         PHASE 2: Create DOM Nodes                            │
│         MarkupParser.createDOMNode()                         │
│         (Issue #116 - ✅ COMPLETE)                           │
│                                                               │
│  • For each extracted element, create WikiDocument DOM node  │
│  • Route to appropriate handler:                             │
│    - DOMVariableHandler.createNodeFromExtract()             │
│    - DOMPluginHandler.createNodeFromExtract()               │
│    - DOMLinkHandler.createNodeFromExtract()                 │
│  • Return: array of DOM nodes with data-jspwiki-id          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│         PHASE 3: Showdown + Merge                            │
│         MarkupParser.parseWithDOMExtraction()                │
│         (Issue #117 - ✅ COMPLETE)                           │
│                                                               │
│  Step A: Let Showdown parse sanitized markdown              │
│    • Showdown.makeHtml(sanitized)                           │
│    • Result: "<h2>Welcome</h2><p>User: <span ...></span></p>" │
│                                                               │
│  Step B: Merge DOM nodes back into HTML                     │
│    • MarkupParser.mergeDOMNodes(html, nodes, uuid)          │
│    • Replace placeholders with rendered DOM nodes            │
│    • Sort by descending ID for nested syntax                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    OUTPUT: Final HTML                        │
│  "<h2 id="welcome">Welcome</h2>                              │
│   <p>User: <span class="wiki-variable">JohnDoe</span></p>   │
│   <p>Page: <a href="#HomePage">HomePage</a></p>"            │
└─────────────────────────────────────────────────────────────┘
```

### Implementation Files

**Core Implementation** (src/parsers/MarkupParser.js):
- `extractJSPWikiSyntax()` - Lines 1235-1393 (Phase 1)
- `createDOMNode()` - Lines 1395-1439 (Phase 2)
- `mergeDOMNodes()` - Lines 1441-1496 (Phase 3)
- `parseWithDOMExtraction()` - Lines 1498-1571 (Phase 3 - main entry point)

**DOM Handlers**:
- `DOMVariableHandler.js` - Variable node creation
- `DOMPluginHandler.js` - Plugin node creation
- `DOMLinkHandler.js` - Link node creation

**Reference-Only Code** (Phase 4, Issue #118):
- `Tokenizer.js` - Token-based parsing (reference)
- `DOMParser.js` - Alternative parser approach (reference)
- `DOMBuilder.js` - DOM building from tokens (reference)

All reference files contain comprehensive architecture notes explaining why they're not actively used and what replaced them.

### Test Coverage

**Total: 95 tests passing**

- **Phase 1 Tests:** 41 tests (MarkupParser-Extraction.test.js)
  - Variable extraction
  - Plugin extraction
  - Link extraction
  - Escaped text extraction
  - Edge cases and error handling

- **Phase 2 Tests:** 23 tests (handler test files)
  - DOMVariableHandler.test.js
  - DOMPluginHandler.test.js
  - DOMLinkHandler.test.js

- **Phase 3 Tests:** 31 tests (MarkupParser-MergePipeline.test.js)
  - Basic replacement
  - Markdown preservation
  - Multiple elements
  - Nested JSPWiki syntax
  - Edge cases
  - Performance

**Verification Test:** test_markdown_heading_fix.js demonstrates the markdown heading bug is fixed:
```
✓ H2 headings present: YES ✅
✓ H3 headings present: YES ✅
✓ H4 headings present: YES ✅
✓ Variable resolved: YES ✅
✓ Plugin executed: YES ✅
✓ Link created: YES ✅
✓ No literal ## in output: YES ✅
```

### Key Design Decisions

#### 1. Inline Span Placeholders (Updated October 2025)

**Decision:** Use `<span data-jspwiki-placeholder="uuid-id"></span>` format

**Rationale:**
- Inline HTML elements preserved by markdown parsers as inline content
- Don't interfere with markdown syntax
- Prevent block-level rendering issues (HTML comments caused unwanted line breaks)
- Valid HTML if replacement fails

**Previous Decision (Deprecated):** HTML comments (`<!--JSPWIKI-uuid-id-->`)
- **Issue Found:** Showdown treats HTML comments at start of line as block-level elements
- **Problem:** `[{$pagename}] text` rendered as two blocks instead of inline
- **Fixed:** Changed to inline span elements to maintain inline rendering

**Rejected Alternative:** `__JSPWIKI_uuid_id__` (underscores interpreted as markdown)

#### 2. Reverse ID Order Merging

**Decision:** Sort nodes by descending ID before merging

**Rationale:** Handles nested JSPWiki syntax correctly (e.g., plugin containing variable)

#### 3. Keep Tokenization Code as Reference

**Decision:** Keep Tokenizer/DOMParser/DOMBuilder with clear documentation (Phase 4)

**Rationale:**
- Preserves JSPWiki syntax pattern knowledge
- Educational value
- May be useful for future enhancements
- Clearer than deleting and losing context

### Benefits Achieved

1. **Markdown Heading Bug Fixed** (#110, #93)
   - `## Heading` now correctly becomes `<h2>Heading</h2>`
   - Showdown handles ALL markdown without JSPWiki interference

2. **No Order Dependency**
   - JSPWiki syntax extracted before markdown parsing
   - Variables, plugins, links can't interfere with markdown

3. **Natural Escaping**
   - `[[...]]` handled during extraction phase
   - Creates text nodes, not parsed syntax

4. **DOM-Based Processing**
   - WikiDocument nodes for JSPWiki elements
   - Type-safe node creation
   - Inspectable structure

5. **Clean Architecture**
   - Clear separation: Extract → Create → Merge
   - Each phase has single responsibility
   - Testable components

### Usage Example

```javascript
const MarkupParser = require('./src/parsers/MarkupParser');

// Initialize parser with engine
const parser = new MarkupParser(engine);
await parser.initialize();

// Parse wiki markup using new pipeline
const content = `
## Welcome to amdWiki

Hello [{$username}]!

Check out [HomePage] for more info.

[{TOC}]
`;

const context = { userName: 'JohnDoe' };
const html = await parser.parseWithDOMExtraction(content, context);

// Result:
// <h2 id="welcome-to-amdwiki">Welcome to amdWiki</h2>
// <p>Hello <span class="wiki-variable">JohnDoe</span>!</p>
// <p>Check out <a href="#HomePage">HomePage</a> for more info.</p>
// <div class="toc">Table of Contents</div>
```

---

## Original Proposed Solution (Pre-Implementation)

**Note:** The section below was the original proposal. The actual implementation used a **pre-extraction strategy** (documented above) rather than the full tokenization approach proposed here. The pre-extraction approach proved simpler and more effective.

### Original Architecture Overview (Proposed, Not Implemented)

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

## Implementation Status (Phases 1-7)

### Phase 1: Extraction (Issue #115) - ✅ COMPLETE

**Objective:** Extract JSPWiki syntax before markdown parsing

**Status:** Complete - `extractJSPWikiSyntax()` implemented with code block protection
**Test Coverage:** 41 tests passing

### Phase 2: DOM Node Creation (Issue #116) - ✅ COMPLETE

**Objective:** Create WikiDocument DOM nodes from extracted elements

**Status:** Complete - Handler methods implemented (`createNodeFromExtract()`)
**Test Coverage:** 23 tests passing

### Phase 3: Merge Pipeline (Issue #117) - ✅ COMPLETE

**Objective:** Merge DOM nodes into Showdown HTML

**Status:** Complete - `parseWithDOMExtraction()` implemented
**Test Coverage:** 31 tests passing

### Phase 4: Document Reference Code (Issue #118) - ✅ COMPLETE

**Objective:** Document tokenization code as reference-only

**Status:** Complete - Architecture notes added to Tokenizer, DOMParser, DOMBuilder
**Documentation:** Updated

### Phase 5: Comprehensive Testing (Issue #119) - ✅ COMPLETE

**Objective:** Integration testing before production deployment

**Status:** Complete - 55 comprehensive integration tests added
**Test Coverage:** 376+ total tests passing
**Manual QA:** Test plan created (docs/testing/Phase5-Manual-QA-Plan.md)

### Phase 6: Production Integration (Issue #120) - ✅ COMPLETE

**Objective:** Deploy new pipeline to production

**Status:** Complete - Integrated into `MarkupParser.parse()`

**Implementation:**
- ✅ Configuration property added (`jspwiki.parser.useExtractionPipeline = true`)
- ✅ Automatic routing to `parseWithDOMExtraction()` when enabled
- ✅ Fallback to legacy 7-phase parser on error
- ✅ Performance monitoring and logging
- ✅ Cache integration
- ✅ Metrics tracking

**Files Modified:**
- `src/parsers/MarkupParser.js` (lines 636-781): Updated `parse()` method
- `config/app-default-config.json`: Added configuration property

### Phase 7: Cleanup & Documentation (Issue #121) - ✅ COMPLETE

**Objective:** Mark deprecated code and complete comprehensive documentation

**Status:** Complete - Production-ready documentation suite created

**Implementation:**
- ✅ GitHub issue #121 created
- ✅ Legacy 7-phase parser marked as deprecated with clear warnings
- ✅ Complete API documentation created (docs/api/MarkupParser-API.md)
- ✅ Comprehensive migration guide created (docs/migration/WikiDocument-DOM-Migration.md)
- ✅ Architecture documentation updated
- ✅ All issues ready for closure

**Files Created:**
- `docs/api/MarkupParser-API.md` - Complete API reference with examples, troubleshooting, and migration guidance
- `docs/migration/WikiDocument-DOM-Migration.md` - Migration patterns, integration guide, common pitfalls, and FAQ

**Files Modified:**
- `src/parsers/MarkupParser.js` - Added @deprecated warnings to legacy code
- `docs/architecture/WikiDocument-DOM-Architecture.md` - Updated status and phase information

**Note:** Legacy 7-phase parser code was KEPT (not removed) for backward compatibility and emergency fallback. It is clearly marked as deprecated with detailed migration guidance.

---

## Original Implementation Plan (Pre-Implementation Reference)

**Note:** The section below was the original proposed implementation plan. The actual implementation followed a different approach (pre-extraction strategy, Phases 1-4 documented above). This is kept for historical reference.

### Original Phase 1: Add WikiDocument Class (Non-Breaking) - NOT IMPLEMENTED

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

### Original Phase 2: Refactor MarkupParser to Build DOM - NOT IMPLEMENTED

**Note:** The actual implementation used extraction instead of tokenization.

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

### Original Phase 3: Update Handlers to Work with DOM - PARTIALLY IMPLEMENTED

**Note:** Handlers were updated to create DOM nodes, but via `createNodeFromExtract()` methods instead of processing a full WikiDocument tree.

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

### Original Phase 4: Add Renderer - NOT IMPLEMENTED

**Note:** The actual implementation merges DOM nodes directly into Showdown's HTML output instead of using a separate renderer.

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

### Original Phase 5: Integrate with RenderingManager - PENDING (see Phase 6 above)

**Note:** This integration is planned for Phase 6 of the actual implementation.

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

## Original Migration Strategy (Pre-Implementation Reference)

**Note:** The actual implementation followed a different timeline and approach (Phases 1-4 completed in ~3 days). This is kept for historical reference.

### Original Step 1: Create WikiDocument Class (Week 1) - MODIFIED
- Implement WikiDocument with JSDOM
- Add basic DOM manipulation methods
- Write unit tests

**Actual implementation:** Used linkedom instead of JSDOM, focused on node creation methods.

### Original Step 2: Add Token-Based Parser (Week 2) - NOT IMPLEMENTED
- Implement tokenizer (character-by-character)
- Parse into WikiDocument DOM
- Keep existing string-based parser as fallback

**Actual implementation:** Used pre-extraction strategy instead of tokenization.

### Original Step 3: Migrate Handlers (Week 3-4) - MODIFIED
- Convert handlers to work with DOM nodes
- One handler at a time
- Test each migration

**Actual implementation:** Added `createNodeFromExtract()` methods to existing handlers (completed in Phase 2).

### Original Step 4: Deprecate String Pipeline (Week 5) - PENDING
- Default to DOM-based parsing
- Remove string-based phases
- Update documentation

**Actual status:** Planned for Phase 6 (Production Integration).

### Original Step 5: Remove Legacy Code (Week 6) - PENDING
- Clean up old string-based code
- Performance tuning
- Final testing

**Actual status:** Planned for Phase 7 (Cleanup & Documentation).

## Original Technical Decisions (Pre-Implementation Reference)

**Note:** This section contains the original technical considerations. See "Key Design Decisions" in the "Implemented Solution" section above for the actual decisions made during implementation.

### DOM Library Choice (Original Proposal)

- Option 1: jsdom** (Recommended)
  - Full DOM implementation
  - querySelector, appendChild, etc.
  - Heavy but feature-complete

- Option 2: cheerio
  - Lighter weight
  - jQuery-like API
  - Might be sufficient

- Option 3: Custom DOM
  - Minimal implementation
  - Only what we need
  - More work, but lighter

**Recommendation**: Start with jsdom for full compatibility, optimize later if needed.

**Actual decision:** Used linkedom (lightweight, server-side DOM library) for WikiDocument implementation.

### Caching Strategy (Original Proposal)

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

## Expected Benefits (from Original Proposal)

**Note:** See "Benefits Achieved" in the "Implemented Solution" section above for actual results. This section is kept for comparison.

### 1. Fixes Escaping Issues Permanently - ✅ ACHIEVED
- `[[` becomes a text node `[`
- Can't be accidentally processed by other phases
- No order dependency

### 2. Improves Performance - ⏳ PENDING
- Cache WikiDocument, not HTML
- Reuse parsed DOM with different contexts
- Avoid redundant parsing

**Status:** Not yet measured; planned for Phase 5 (Comprehensive Testing).

### 3. Enables Advanced Features - ✅ ACHIEVED
- DOM manipulation for plugins
- Query parsed content
- Transform before rendering

**Status:** DOM nodes can be inspected and manipulated.

### 4. Better Debugging - ✅ ACHIEVED
- Inspect DOM structure
- See what each element is
- Trace parsing issues

**Status:** Nodes have data-jspwiki-id attributes for debugging.

### 5. JSPWiki Compatibility - ✅ PARTIALLY ACHIEVED
- Matches JSPWiki architecture
- Easier to port JSPWiki features
- Familiar to JSPWiki developers

**Status:** Uses WikiDocument and DOM-based approach, though implementation differs from full tokenization.

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

### Original Conclusion (Pre-Implementation)

The recurring `[[` escaping issue is a symptom of a deeper architectural problem: **string-based parsing is inherently fragile**.

JSPWiki solved this problem 20 years ago by using an **internal DOM representation**. The recommendation was to follow their proven approach.

### Implementation Complete (October 2025)

**The WikiDocument DOM architecture has been successfully implemented** using a pre-extraction strategy (Phases 1-4):

✅ **Phase 1 (Issue #115):** Extract JSPWiki syntax before markdown parsing
✅ **Phase 2 (Issue #116):** Create WikiDocument DOM nodes via handlers
✅ **Phase 3 (Issue #117):** Merge DOM nodes into Showdown HTML
✅ **Phase 4 (Issue #118):** Document reference code with architecture notes

**Results:**
- ✅ Markdown heading bug fixed (Issue #110, #93)
- ✅ No order dependency between JSPWiki and markdown
- ✅ Natural escaping via text nodes
- ✅ 95 tests passing (100% test success rate)
- ✅ Clean separation of concerns
- ✅ Maintainable, testable architecture

**The parser is now:**
- More robust (no parsing conflicts)
- Better tested (comprehensive test suite)
- Easier to maintain (clear phases)
- JSPWiki-inspired (DOM-based approach)

**Next Steps:**
- Phase 5: Comprehensive testing (Issue #119)
- Phase 6: Production integration
- Phase 7: Cleanup and documentation

## References

### Implementation Files

**Core Implementation:**
- `src/parsers/MarkupParser.js` - Main parser with extraction, node creation, and merge methods
- `src/parsers/dom/WikiDocument.js` - WikiDocument DOM class (linkedom-based)
- `src/parsers/dom/handlers/DOMVariableHandler.js` - Variable node creation
- `src/parsers/dom/handlers/DOMPluginHandler.js` - Plugin node creation
- `src/parsers/dom/handlers/DOMLinkHandler.js` - Link node creation

**Reference Implementation:**
- `src/parsers/dom/Tokenizer.js` - Token-based parser (reference)
- `src/parsers/dom/DOMParser.js` - Alternative parser (reference)
- `src/parsers/dom/DOMBuilder.js` - DOM builder from tokens (reference)

**Tests:**
- `src/parsers/__tests__/MarkupParser-Extraction.test.js` - Phase 1 tests (41 tests)
- `src/parsers/__tests__/MarkupParser-MergePipeline.test.js` - Phase 3 tests (31 tests)
- `src/parsers/dom/handlers/__tests__/` - Phase 2 handler tests (23 tests)
- `test_markdown_heading_fix.js` - Bug verification test

### Related Issues

**Epic:**
- Issue #114 - WikiDocument DOM Solution

**Implementation Phases:**
- Issue #115 - Phase 1: Extraction
- Issue #116 - Phase 2: DOM Node Creation
- Issue #117 - Phase 3: Merge Pipeline
- Issue #118 - Phase 4: Document Reference Code
- Issue #119 - Phase 5: Comprehensive Testing (pending)

**Bug Fixes:**
- Issue #110 - Markdown heading bug
- Issue #93 - Original DOM migration issue

### JSPWiki References

- [JSPWiki WikiDocument API](https://jspwiki.apache.org/apidocs/2.12.1/org/apache/wiki/parser/WikiDocument.html)
- [JSPWiki MarkupParser](https://github.com/apache/jspwiki/blob/master/jspwiki-main/src/main/java/org/apache/wiki/parser/MarkupParser.java)
- [JSPWiki XHTMLRenderer](https://jspwiki.apache.org/apidocs/2.12.1/org/apache/wiki/render/XHTMLRenderer.html)

### Project References

- [Current MarkupParser.js](../../src/parsers/MarkupParser.js)
- [WikiDocument API Documentation](./WikiDocument-API.md)
- [Current Rendering Pipeline](./Current-Rendering-Pipeline.md)
- [.github/copilot-instructions.md RenderPipeline](../../.github/copilot-instructions.md#L19-L32)
