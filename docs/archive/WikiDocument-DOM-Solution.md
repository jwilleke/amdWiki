> **ARCHIVED**: This document is for historical purposes only. For the current and complete documentation, please see **[WikiDocument Complete Guide](../WikiDocument-Complete-Guide.md)**.

# WikiDocument DOM Solution - JSPWiki Approach Analysis

**Date**: 2025-10-13
**Breakthrough**: JSPWiki doesn't parse markdown themselves!
**Source**: <https://github.com/apache/jspwiki/tree/master/jspwiki-markdown>

---

## The Revelation

JSPWiki uses **FlexMark** (a specialized markdown parser) to handle ALL markdown syntax, and only uses their DOM for JSPWiki-specific syntax.

### JSPWiki's Architecture

```java
// JSPWiki Markdown Module
public WikiDocument parse() throws IOException {
    // Step 1: Let FlexMark parse markdown (including headings)
    final Node document = parser.parseReader(m_in);

    // Step 2: Wrap FlexMark's AST in WikiDocument
    final MarkdownDocument md = new MarkdownDocument(m_context.getPage(), document);

    // Step 3: WikiDocument handles JSPWiki syntax only
    md.setContext(m_context);
    return md;
}
```

**Dependencies** (from pom.xml):

- `flexmark` - Core markdown parser
- `flexmark-ext-tables` - Table support
- `flexmark-ext-toc` - Table of contents
- `flexmark-ext-attributes` - Custom attributes
- `flexmark-ext-footnotes` - Footnotes
- `flexmark-ext-definition` - Definition lists

### Key Insight: Separation of Concerns

| Component | Responsibility | Handler |
|-----------|---------------|---------|
| **Markdown Syntax** | `## Heading`, lists, code blocks, tables | **FlexMark Parser** |
| **JSPWiki Syntax** | `[{Plugin}]`, `[{$var}]`, `[link]`, `[[escape]]` | **WikiDocument DOM** |

**They don't try to parse both!**

---

## amdWiki's Current Problem

### What We're Doing Wrong

```javascript
// amdWiki's Tokenizer tries to parse BOTH markdown and JSPWiki
class Tokenizer {
  tokenize(content) {
    // MISTAKE: Trying to tokenize markdown headings
    if (char === '#' && this.isStartOfLine()) {
      return this.tokenizeHeading(); // ← This breaks!
    }

    // CORRECT: Tokenizing JSPWiki syntax
    if (char === '[' && next === '{') {
      return this.tokenizePlugin();
    }
  }
}
```

**Why It Breaks**:

- Tokenizer recognizes `## Heading`
- DOMBuilder creates wrong element type (list item instead of heading)
- Showdown never sees the heading markup
- Result: broken headings

### The Architecture Conflict

```text
Current (Broken):
  Raw Content
      ↓
  Tokenizer (tries to parse markdown + JSPWiki) ← CONFLICT HERE
      ↓
  DOMBuilder (creates wrong nodes for markdown)
      ↓
  Showdown (receives broken content)
      ↓
  Broken HTML

Should Be:
  Raw Content
      ↓
  Extract JSPWiki syntax → WikiDocument DOM
      ↓
  Process markdown → Showdown
      ↓
  Merge DOM + HTML
      ↓
  Correct HTML
```

---

## The Solution: Hybrid Approach

### Strategy: Don't Parse Markdown in Tokenizer

**Principle**: Let Showdown do what it does best (markdown), WikiDocument DOM do what it does best (JSPWiki syntax)

### Approach A: Pre-Extract JSPWiki Syntax (Recommended)

```javascript
class MarkupParser {
  async parse(content, context) {
    // Phase 1: Extract JSPWiki syntax to placeholders
    const { sanitized, jspwikiElements } = this.extractJSPWikiSyntax(content);
    // sanitized: markdown with placeholders like __PLUGIN_0__, __VAR_1__
    // jspwikiElements: [{type: 'plugin', syntax: '[{TOC}]', id: 0}, ...]

    // Phase 2: Build WikiDocument DOM for JSPWiki elements only
    const wikiDocument = new WikiDocument(content, context);
    for (const element of jspwikiElements) {
      const node = await this.createDOMNode(element, context);
      wikiDocument.appendChild(node);
    }

    // Phase 3: Let Showdown parse markdown (with placeholders)
    const html = this.showdown.makeHtml(sanitized);

    // Phase 4: Replace placeholders with rendered DOM nodes
    const finalHtml = this.mergeDOMNodes(html, wikiDocument);

    return finalHtml;
  }

  extractJSPWikiSyntax(content) {
    const jspwikiElements = [];
    let sanitized = content;
    let id = 0;

    // Extract plugins: [{PluginName params}]
    sanitized = sanitized.replace(/\[\{([^}]+)\}\]/g, (match, inner) => {
      if (inner.startsWith('$')) {
        // Variable
        jspwikiElements.push({ type: 'variable', syntax: match, id: id++ });
      } else {
        // Plugin
        jspwikiElements.push({ type: 'plugin', syntax: match, id: id++ });
      }
      return `__JSPWIKI_${id - 1}__`;
    });

    // Extract escaped syntax: [[{...}]
    sanitized = sanitized.replace(/\[\[\{([^}]+)\}\]/g, (match, inner) => {
      jspwikiElements.push({ type: 'escaped', syntax: match, literal: `[{${inner}}]`, id: id++ });
      return `__JSPWIKI_${id - 1}__`;
    });

    // Extract wiki links: [PageName] or [Text|Target]
    // (but not markdown links [text](url))
    sanitized = sanitized.replace(/\[([^\]]+)\](?!\()/g, (match, inner) => {
      jspwikiElements.push({ type: 'link', syntax: match, target: inner, id: id++ });
      return `__JSPWIKI_${id - 1}__`;
    });

    return { sanitized, jspwikiElements };
  }

  async createDOMNode(element, context) {
    switch(element.type) {
      case 'variable':
        return await this.domVariableHandler.createNode(element, context);
      case 'plugin':
        return await this.domPluginHandler.createNode(element, context);
      case 'link':
        return await this.domLinkHandler.createNode(element, context);
      case 'escaped':
        return this.wikiDocument.createTextNode(element.literal);
    }
  }

  mergeDOMNodes(html, wikiDocument) {
    let result = html;

    // Replace placeholders with rendered DOM nodes
    const nodes = wikiDocument.querySelectorAll('[data-jspwiki-id]');
    for (const node of nodes) {
      const id = node.getAttribute('data-jspwiki-id');
      const placeholder = `__JSPWIKI_${id}__`;
      const rendered = node.outerHTML || node.textContent;
      result = result.replace(placeholder, rendered);
    }

    return result;
  }
}
```

**Example Flow**:

**Input**:

```markdown
## Features

Current user: [{$username}]

[{TableOfContents}]

Visit [HomePage] or [[{$variable}] for more.
```

**After Phase 1 (Extract)**:

```markdown
## Features

Current user: __JSPWIKI_0__

__JSPWIKI_1__

Visit __JSPWIKI_2__ or __JSPWIKI_3__ for more.
```

**WikiDocument DOM**:

```javascript
[
  { id: 0, type: 'variable', name: 'username', node: <span data-jspwiki-id="0">JohnDoe</span> },
  { id: 1, type: 'plugin', name: 'TableOfContents', node: <div data-jspwiki-id="1">...</div> },
  { id: 2, type: 'link', target: 'HomePage', node: <a data-jspwiki-id="2">HomePage</a> },
  { id: 3, type: 'escaped', literal: '[{$variable}]', node: <span data-jspwiki-id="3">[{$variable}]</span> }
]
```

**After Phase 3 (Showdown)**:

```html
<h2>Features</h2>
<p>Current user: __JSPWIKI_0__</p>
<p>__JSPWIKI_1__</p>
<p>Visit __JSPWIKI_2__ or __JSPWIKI_3__ for more.</p>
```

**After Phase 4 (Merge)**:

```html
<h2>Features</h2>
<p>Current user: <span data-jspwiki-id="0">JohnDoe</span></p>
<p><div data-jspwiki-id="1"><ul><li><a href="#features">Features</a></li></ul></div></p>
<p>Visit <a data-jspwiki-id="2" href="/wiki/HomePage">HomePage</a> or <span data-jspwiki-id="3">[{$variable}]</span> for more.</p>
```

**Result**: ✅ Markdown headings preserved, JSPWiki syntax processed correctly!

---

### Approach B: Post-Showdown DOM Injection

```javascript
class MarkupParser {
  async parse(content, context) {
    // Phase 1: Protect JSPWiki syntax from Showdown
    const protected = this.protectJSPWikiSyntax(content);

    // Phase 2: Let Showdown parse markdown
    const html = this.showdown.makeHtml(protected);

    // Phase 3: Parse JSPWiki syntax in HTML
    const wikiDocument = new WikiDocument(html, context);
    const htmlWithPlaceholders = wikiDocument.getRootElement().innerHTML;

    // Phase 4: Process JSPWiki placeholders
    await this.domVariableHandler.process(wikiDocument, context);
    await this.domPluginHandler.process(wikiDocument, context);
    await this.domLinkHandler.process(wikiDocument, context);

    return wikiDocument.toHTML();
  }

  protectJSPWikiSyntax(content) {
    // Convert JSPWiki syntax to HTML comments (Showdown ignores)
    let protected = content;

    // [{$var}] → <!--JSPWIKI:VAR:username-->
    protected = protected.replace(/\[\{(\$\w+)\}\]/g,
      (match, var) => `<!--JSPWIKI:VAR:${var}-->`);

    // [{Plugin}] → <!--JSPWIKI:PLUGIN:PluginName:params-->
    protected = protected.replace(/\[\{([^$][^}]+)\}\]/g,
      (match, inner) => `<!--JSPWIKI:PLUGIN:${inner}-->`);

    // [PageName] → <!--JSPWIKI:LINK:PageName-->
    protected = protected.replace(/\[([^\]]+)\](?!\()/g,
      (match, target) => `<!--JSPWIKI:LINK:${target}-->`);

    return protected;
  }
}
```

**Pros**:

- Simpler extraction (HTML comments)
- Showdown completely unaware of JSPWiki syntax
- No placeholder replacement needed

**Cons**:

- HTML comments in output (need cleanup)
- Harder to handle nested elements

---

### Approach C: Markdown-First with Extension

Use a markdown parser that supports custom extensions (like FlexMark in Java)

**JavaScript Equivalent**: Use `marked` with custom renderer

```javascript
const marked = require('marked');

class JSPWikiRenderer extends marked.Renderer {
  // Override text rendering to handle JSPWiki syntax
  text(text) {
    // Process [{$variables}]
    text = this.processVariables(text);

    // Process [{Plugins}]
    text = this.processPlugins(text);

    // Process [links]
    text = this.processLinks(text);

    return text;
  }

  processVariables(text) {
    return text.replace(/\[\{(\$\w+)\}\]/g, (match, varName) => {
      const value = this.variableManager.get(varName);
      return `<span class="wiki-variable" data-var="${varName}">${value}</span>`;
    });
  }
}

// Use custom renderer
const renderer = new JSPWikiRenderer();
marked.setOptions({ renderer });
const html = marked.parse(content);
```

**Pros**:

- Clean integration
- Markdown parser handles all markdown
- Custom renderer handles JSPWiki syntax

**Cons**:

- Tied to `marked` library
- Need to implement renderer for all JSPWiki features

---

## Comparison: Approaches

| Approach | Complexity | Markdown Safety | DOM Benefits | Performance |
|----------|-----------|----------------|--------------|-------------|
| **A: Pre-Extract** | Medium | ✅ Perfect | ✅ Full | ⚡ Fast |
| **B: Post-Inject** | Low | ✅ Perfect | ✅ Full | ⚡ Fast |
| **C: Custom Renderer** | High | ✅ Perfect | ⚠️ Limited | ⚡⚡ Fastest |

**Recommendation**: **Approach A (Pre-Extract)** - Best balance of simplicity and DOM benefits

---

## Implementation Plan

### Phase 1: Prototype Pre-Extract (2 days)

**File**: `src/parsers/MarkupParser.js`

```javascript
// Add new method
extractJSPWikiSyntax(content) {
  // Implementation as shown above
}

// Modify parse method
async parse(content, context) {
  // Use pre-extract approach
  const { sanitized, jspwikiElements } = this.extractJSPWikiSyntax(content);

  // Rest of implementation
}
```

**Test**:

```javascript
// Test case
const content = `
## Heading

Current user: [{$username}]

[{TableOfContents}]
`;

const result = await parser.parse(content, context);

// Verify
expect(result).toContain('<h2>Heading</h2>'); // ✅ Heading preserved
expect(result).toContain('JohnDoe'); // ✅ Variable expanded
expect(result).toContain('<div class="toc">'); // ✅ Plugin executed
```

### Phase 2: Update DOM Handlers (1 day)

Modify DOM handlers to work with extracted elements:

```javascript
// src/parsers/dom/handlers/DOMVariableHandler.js
async createNode(element, context) {
  const varName = element.syntax.match(/\[\{(\$\w+)\}\]/)[1];
  const value = await this.variableManager.getVariable(varName, context);

  const node = this.wikiDocument.createElement('span', {
    'class': 'wiki-variable',
    'data-variable': varName,
    'data-jspwiki-id': element.id
  });
  node.textContent = value;

  return node;
}
```

### Phase 3: Integration Testing (2 days)

Test all combinations:

- ✅ Markdown headings + variables
- ✅ Markdown lists + plugins
- ✅ Markdown code blocks + links
- ✅ Markdown tables + JSPWiki tables
- ✅ Escaped syntax + markdown

### Phase 4: Performance Validation (1 day)

Benchmark:

- Parse time should be similar or better (no tokenizing markdown)
- Memory usage should be lower (fewer DOM nodes)
- Cache hit ratio should improve

---

## Why This Solves the Heading Issue

### Root Cause

```javascript
// OLD: Tokenizer tries to parse markdown headings
if (char === '#' && this.isStartOfLine()) {
  return this.tokenizeHeading(); // ← Creates token
}

// DOMBuilder receives HEADING token
case 'HEADING':
  node = this.createHeading(token); // ← Creates wrong element
```

### Solution

```javascript
// NEW: Don't tokenize markdown at all!
extractJSPWikiSyntax(content) {
  // Only extract JSPWiki syntax
  // Markdown (including ##) stays in content
  // Showdown handles ## → <h2> correctly
}
```

**Before**:

- Content: `## Heading`
- Tokenizer: Creates `{ type: 'HEADING', level: 2, text: 'Heading' }`
- DOMBuilder: Creates `<li>Heading</li>` (BUG!)
- Result: ❌ Broken

**After**:

- Content: `## Heading`
- Extractor: Ignores (not JSPWiki syntax)
- Showdown: Converts `## Heading` → `<h2>Heading</h2>`
- Result: ✅ Correct

---

## Benefits of This Approach

### 1. Eliminates Markdown Conflicts

- WikiDocument DOM doesn't parse markdown
- Showdown handles all markdown syntax
- No confusion about who handles what

### 2. Maintains DOM Benefits

- Variables, plugins, links still as DOM nodes
- Query-based processing: `querySelectorAll('[data-plugin]')`
- Caching WikiDocument objects
- No order dependency for JSPWiki syntax

### 3. Matches JSPWiki Architecture

- JSPWiki: FlexMark handles markdown, WikiDocument handles JSPWiki syntax
- amdWiki: Showdown handles markdown, WikiDocument handles JSPWiki syntax
- Same separation of concerns

### 4. Simpler Implementation

- No need to parse markdown grammar
- No need to maintain markdown tokenization
- Leverage existing, tested libraries

### 5. Performance Gains

- Fewer tokens to create (only JSPWiki elements)
- Smaller DOM trees (only JSPWiki nodes)
- Faster parsing (no markdown tokenization)

---

## Migration from Current System

### What Stays

- ✅ WikiDocument class (no changes)
- ✅ DOM handlers (minor API changes)
- ✅ DOMParser infrastructure (used differently)
- ✅ Showdown integration (enhanced)

### What Changes

- ⚠️ Tokenizer: Remove markdown tokenization
- ⚠️ DOMBuilder: Only build JSPWiki nodes
- ⚠️ MarkupParser.parse(): New extraction-based flow
- ⚠️ Phase 0: Becomes extraction phase, not full DOM parsing

### What's Removed

- ❌ Markdown heading tokenization
- ❌ Markdown list tokenization
- ❌ Markdown code block tokenization
- ❌ Conflict resolution between markdown and JSPWiki

---

## Risks and Mitigation

### Risk 1: Placeholder Conflicts

**Risk**: User writes `__JSPWIKI_0__` in content
**Mitigation**: Use UUID-based placeholders: `__JSPWIKI_${uuid}_0__`

### Risk 2: JSPWiki Syntax in Code Blocks

**Risk**: `[{$var}]` in code block gets extracted
**Mitigation**: Protect code blocks first (already done in Phase 1)

### Risk 3: Nested JSPWiki Syntax

**Risk**: `[{Plugin text="[{$var}]"}]` - variable inside plugin
**Mitigation**: Extract in correct order (plugins first, then variables in plugin params)

### Risk 4: Performance Overhead

**Risk**: Multiple passes over content (extract, showdown, merge)
**Mitigation**:

- Extract and merge are fast (regex-based)
- Showdown is already in pipeline
- Overall should be faster (no DOM for markdown)

---

## Success Criteria

### Functional

- ✅ Markdown headings render correctly (`## → <h2>`)
- ✅ Variables expand correctly (`[{$username}] → JohnDoe`)
- ✅ Plugins execute correctly (`[{TOC}] → table of contents`)
- ✅ Links work correctly (`[PageName] → <a href="/wiki/PageName">`)
- ✅ Escaping works correctly (`[[{$var}] → [{$var}]`)

### Non-Functional

- ✅ Parse time < 30ms per page
- ✅ Memory usage < 50MB per 1000 pages
- ✅ All existing tests pass
- ✅ No regressions in escaping behavior

### Code Quality

- ✅ Simpler codebase (remove markdown tokenization)
- ✅ Clear separation of concerns
- ✅ Maintainable architecture
- ✅ Well-documented approach

---

## Conclusion

**The Breakthrough**: JSPWiki doesn't parse markdown themselves - they use FlexMark. We shouldn't parse markdown either - we have Showdown!

**The Solution**: Pre-extract JSPWiki syntax, let Showdown handle markdown, merge the results.

**The Benefits**:

- ✅ Fixes heading issue permanently
- ✅ Maintains WikiDocument DOM benefits
- ✅ Simpler, more maintainable
- ✅ Matches JSPWiki's proven approach

**Next Steps**:

1. Prototype extraction approach (2 days)
2. Test with real content (2 days)
3. Deploy to canary (1 week)
4. Full rollout (1 week)

**Timeline**: 2-3 weeks to production-ready

---

## References

- [JSPWiki MarkdownParser Source](https://github.com/apache/jspwiki/blob/master/jspwiki-markdown/src/main/java/org/apache/wiki/parser/markdown/MarkdownParser.java)
- [FlexMark Library](https://github.com/vsch/flexmark-java)
- [WikiDocument-DOM-Architecture.md](../architecture/WikiDocument-DOM-Architecture.md)
- [WikiDocument-DOM-Migration-Plan.md](./WikiDocument-DOM-Migration-Plan.md)
- [Current-Rendering-Pipeline.md](../architecture/Current-Rendering-Pipeline.md)
