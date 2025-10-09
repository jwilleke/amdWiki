---
title: WikiDocument DOM Migration - GitHub Issues Template
uuid: wikidocument-github-issues
category: documentation
user-keywords: [github, issues, epic, migration]
lastModified: 2025-10-09
---

# WikiDocument DOM Migration - GitHub Issues

## Epic Issue Template

### Title
```
[EPIC] Migrate to WikiDocument DOM-Based Parsing Architecture
```

### Labels
```
epic, enhancement, architecture, parser, high-priority
```

### Description

```markdown
## Overview

Migrate from fragile string-based parsing to robust DOM-based parsing following JSPWiki's proven architecture.

**Problem**: The `[[` escaping issue keeps recurring because string-based parsing is inherently order-dependent and fragile.

**Solution**: Implement WikiDocument internal DOM (like JSPWiki's JDOM2 approach) to eliminate order dependency and permanently fix escaping issues.

## Goals

- ✅ Fix `[[` escaping issues permanently
- ✅ Improve parser robustness and maintainability
- ✅ Enable WikiDocument caching for better performance
- ✅ Follow JSPWiki's proven architecture patterns
- ✅ Maintain backward compatibility during migration

## Architecture

**Current**: String → 7 phases of string manipulation → HTML
**Proposed**: String → Tokenize → Build DOM → Process DOM nodes → Serialize to HTML

## Timeline

6 weeks across 7 phases:
1. Week 1: WikiDocument Class Foundation
2. Week 2: Token-Based Parser
3. Week 3: Variable Handler Migration
4. Week 4: Plugin & Link Handlers
5. Week 5: XHTMLRenderer & Integration
6. Week 6: Testing & Deployment
7. Week 7+: Cleanup

## Documentation

- [Architecture Analysis](../docs/architecture/WikiDocument-DOM-Architecture.md)
- [Migration TODO](../docs/architecture/WikiDocument-Migration-TODO.md)
- [JSPWiki WikiDocument API](https://jspwiki.apache.org/apidocs/2.12.1/org/apache/wiki/parser/WikiDocument.html)

## Success Criteria

- [ ] All `[[` escaping issues resolved
- [ ] No regressions in existing functionality
- [ ] 90%+ test coverage for new code
- [ ] Performance maintained or improved
- [ ] JSPWiki architectural compatibility

## Sub-Tasks

This epic tracks the following phases:
- #XXX Phase 1: WikiDocument Class Foundation
- #XXX Phase 2: Token-Based Parser
- #XXX Phase 3: Variable Handler Migration
- #XXX Phase 4: Plugin & Link Handlers
- #XXX Phase 5: XHTMLRenderer & Integration
- #XXX Phase 6: Testing & Deployment
- #XXX Phase 7: Cleanup & Deprecation

## References

- Original Issue: [Link to [[  escaping bug report]
- JSPWiki Architecture: https://github.com/apache/jspwiki
- Related Epic: #41 JSPWikiMarkupParser Enhancement Support
```

---

## Phase 1: WikiDocument Class Foundation

### Issue #1: Phase 1.1 - Research & Setup

**Title**: `[Phase 1.1] Research and Setup - DOM Library Evaluation`

**Labels**: `enhancement, research, parser, phase-1`

**Milestone**: WikiDocument DOM Migration - Week 1

**Description**:
```markdown
## Phase 1.1: Research & Setup

Part of Epic: #XXX (WikiDocument DOM Migration)

### Objectives

Evaluate and select the appropriate DOM library for WikiDocument implementation.

### Tasks

- [ ] Benchmark jsdom performance
  - Parse time for 1KB, 10KB, 100KB documents
  - Memory usage
  - API compatibility
- [ ] Benchmark cheerio performance
  - Parse time for same test cases
  - Memory usage
  - API compatibility
- [ ] Benchmark custom minimal DOM
  - Estimate implementation time
  - Feature completeness
  - Performance potential
- [ ] Compare feature requirements vs capabilities
  - querySelector/querySelectorAll needed
  - createElement, appendChild, etc.
  - Serialization to HTML
  - JSDOM compatibility desirable
- [ ] Make final decision and document in ADR (Architecture Decision Record)
- [ ] Create `src/parsers/dom/` directory structure
- [ ] Add chosen DOM library to package.json
- [ ] Set up test framework for DOM tests (Jest)

### Decision Criteria

| Library | Pros | Cons | Recommendation |
|---------|------|------|----------------|
| jsdom | Full DOM, querySelector, JSDOM compat | Heavy (50MB+), slower | Best for accuracy |
| cheerio | Lightweight, fast, jQuery-like | Limited DOM API, no full JSDOM | Good compromise |
| custom | Minimal, fast, tailored | Implementation time, maintenance | Only if perf critical |

### Deliverables

- [ ] Performance benchmark report
- [ ] Library selection ADR document
- [ ] `src/parsers/dom/` directory created
- [ ] Dependencies installed and committed

### Acceptance Criteria

- Decision documented with rationale
- Dependencies added to package.json
- Directory structure created
- Team consensus on choice

### Estimated Time

3-4 days
```

---

### Issue #2: Phase 1.2 - WikiDocument Core Implementation

**Title**: `[Phase 1.2] WikiDocument Core Implementation`

**Labels**: `enhancement, parser, phase-1`

**Milestone**: WikiDocument DOM Migration - Week 1

**Description**:
```markdown
## Phase 1.2: WikiDocument Core Implementation

Part of Epic: #XXX (WikiDocument DOM Migration)
Depends on: #XXX (Phase 1.1)

### Objectives

Implement the core WikiDocument class following JSPWiki's WikiDocument pattern.

### Tasks

- [ ] Create `src/parsers/dom/WikiDocument.js`
- [ ] Implement constructor(pageData, context)
  - Store original wiki markup
  - Create WeakRef for context (allows GC)
  - Initialize root DOM element
  - Initialize metadata object
- [ ] Add property getters
  - [ ] `getRootElement()` - returns root DOM node
  - [ ] `getPageData()` - returns original markup
  - [ ] `getContext()` - returns context (may be GC'd)
  - [ ] `getMetadata()` - returns metadata object
- [ ] Add property setters
  - [ ] `setMetadata(key, value)`
  - [ ] `addMetadata(object)` - merge metadata
- [ ] Add JSDoc comments for all methods
- [ ] Export class

### Code Structure

```javascript
const { JSDOM } = require('jsdom'); // or cheerio

class WikiDocument {
  constructor(pageData, context) {
    this.pageData = pageData;
    this.context = new WeakRef(context);
    this.dom = new JSDOM();
    this.root = this.dom.window.document.createElement('div');
    this.root.className = 'wiki-document';
    this.metadata = {};
  }

  getRootElement() { return this.root; }
  getPageData() { return this.pageData; }
  getContext() { return this.context.deref(); }
  getMetadata() { return { ...this.metadata }; }
  setMetadata(key, value) { this.metadata[key] = value; }
  addMetadata(obj) { Object.assign(this.metadata, obj); }
}

module.exports = WikiDocument;
```

### Deliverables

- [ ] `src/parsers/dom/WikiDocument.js` implemented
- [ ] All methods documented
- [ ] Exports functional

### Acceptance Criteria

- Constructor creates valid WikiDocument
- Properties accessible via getters
- Metadata can be set and retrieved
- WeakRef context works correctly
- Code follows project style guide

### Estimated Time

2 days
```

---

### Issue #3: Phase 1.3 - DOM Manipulation Methods

**Title**: `[Phase 1.3] WikiDocument DOM Manipulation Methods`

**Labels**: `enhancement, parser, phase-1`

**Milestone**: WikiDocument DOM Migration - Week 1

**Description**:
```markdown
## Phase 1.3: DOM Manipulation Methods

Part of Epic: #XXX (WikiDocument DOM Migration)
Depends on: #XXX (Phase 1.2)

### Objectives

Add DOM manipulation methods to WikiDocument for building the parse tree.

### Tasks

- [ ] Implement `createElement(tag, attributes)`
  - Create element of specified tag
  - Set attributes if provided
  - Return created element
- [ ] Implement `createTextNode(text)`
  - Create text node with content
  - Handle HTML entity encoding
- [ ] Implement `createCommentNode(text)`
  - Create comment node
- [ ] Implement `appendChild(parent, child)`
  - Append child to parent element
  - Return child for chaining
- [ ] Implement `insertBefore(parent, newNode, referenceNode)`
  - Insert newNode before referenceNode
- [ ] Implement `removeChild(parent, child)`
  - Remove child from parent
- [ ] Implement `replaceChild(parent, newNode, oldNode)`
  - Replace oldNode with newNode
- [ ] Add error handling for invalid operations

### Example API

```javascript
const doc = new WikiDocument('content', context);
const root = doc.getRootElement();

// Create elements
const heading = doc.createElement('h1', { id: 'title' });
const text = doc.createTextNode('My Title');

// Build tree
doc.appendChild(heading, text);
doc.appendChild(root, heading);
```

### Deliverables

- [ ] All manipulation methods implemented
- [ ] Methods documented with JSDoc
- [ ] Error handling added

### Acceptance Criteria

- Can create elements with attributes
- Can create text nodes
- Can build DOM tree structure
- Invalid operations throw helpful errors
- Methods chainable where appropriate

### Estimated Time

2 days
```

---

### Issue #4: Phase 1.4 - DOM Query Methods

**Title**: `[Phase 1.4] WikiDocument DOM Query Methods`

**Labels**: `enhancement, parser, phase-1`

**Milestone**: WikiDocument DOM Migration - Week 1

**Description**:
```markdown
## Phase 1.4: DOM Query Methods

Part of Epic: #XXX (WikiDocument DOM Migration)
Depends on: #XXX (Phase 1.3)

### Objectives

Add DOM query methods to WikiDocument for finding and traversing nodes.

### Tasks

- [ ] Implement `querySelector(selector)`
  - Find first element matching CSS selector
  - Return element or null
- [ ] Implement `querySelectorAll(selector)`
  - Find all elements matching CSS selector
  - Return array of elements
- [ ] Implement `getElementById(id)`
  - Find element by ID attribute
  - Return element or null
- [ ] Implement `getElementsByClassName(className)`
  - Find all elements with class
  - Return array of elements
- [ ] Implement `getElementsByTagName(tagName)`
  - Find all elements with tag name
  - Return array of elements
- [ ] Add convenience methods
  - `findVariables()` - returns all variable elements
  - `findPlugins()` - returns all plugin elements
  - `findLinks()` - returns all link elements

### Example API

```javascript
// Query methods
const variables = doc.querySelectorAll('[data-variable]');
const plugins = doc.querySelectorAll('.wiki-plugin');
const heading = doc.querySelector('h1');

// Convenience methods
const allVars = doc.findVariables();
const allPlugins = doc.findPlugins();
```

### Deliverables

- [ ] All query methods implemented
- [ ] Convenience methods added
- [ ] Methods documented

### Acceptance Criteria

- querySelector works with CSS selectors
- querySelectorAll returns all matches
- ID/class/tag queries work correctly
- Convenience methods simplify common tasks
- Returns empty array (not null) for no matches

### Estimated Time

1-2 days
```

---

### Issue #5: Phase 1.5 - Serialization Methods

**Title**: `[Phase 1.5] WikiDocument Serialization Methods`

**Labels**: `enhancement, parser, phase-1`

**Milestone**: WikiDocument DOM Migration - Week 1

**Description**:
```markdown
## Phase 1.5: Serialization Methods

Part of Epic: #XXX (WikiDocument DOM Migration)
Depends on: #XXX (Phase 1.4)

### Objectives

Implement serialization methods for rendering and caching WikiDocument.

### Tasks

- [ ] Implement `toHTML()`
  - Serialize DOM to HTML string
  - Handle void elements correctly
  - Include doctype if needed
  - Clean up whitespace
- [ ] Implement `toString()`
  - Human-readable debug format
  - Show structure and metadata
- [ ] Implement `toJSON()`
  - Serialize for caching
  - Include pageData, metadata, DOM structure
  - Must be reversible
- [ ] Implement static `fromJSON(json)`
  - Deserialize from cache
  - Reconstruct WikiDocument
  - Restore DOM structure
- [ ] Add `clone()`
  - Deep clone WikiDocument
  - Useful for testing

### Example API

```javascript
// Serialize to HTML
const html = doc.toHTML();
// Output: <div class="wiki-document"><h1>Title</h1>...</div>

// Debug format
console.log(doc.toString());
// Output: WikiDocument {
//   pageData: "! Title\n...",
//   metadata: { ... },
//   nodes: 15
// }

// Cache serialization
const cached = doc.toJSON();
const restored = WikiDocument.fromJSON(cached);
```

### Deliverables

- [ ] Serialization methods implemented
- [ ] Deserialization tested
- [ ] Documentation complete

### Acceptance Criteria

- toHTML() produces valid HTML
- toString() is human-readable
- toJSON()/fromJSON() round-trip works
- Cloning preserves structure
- Performance acceptable for caching

### Estimated Time

2 days
```

---

### Issue #6: Phase 1.6 - WikiDocument Testing

**Title**: `[Phase 1.6] WikiDocument Comprehensive Testing`

**Labels**: `testing, parser, phase-1`

**Milestone**: WikiDocument DOM Migration - Week 1

**Description**:
```markdown
## Phase 1.6: WikiDocument Testing

Part of Epic: #XXX (WikiDocument DOM Migration)
Depends on: #XXX (Phase 1.5)

### Objectives

Achieve 90%+ test coverage for WikiDocument class.

### Tasks

- [ ] Create `src/parsers/dom/__tests__/WikiDocument.test.js`
- [ ] Test constructor
  - [ ] Creates WikiDocument with pageData
  - [ ] Creates WikiDocument with context
  - [ ] Context stored as WeakRef
  - [ ] Root element initialized
- [ ] Test DOM creation methods
  - [ ] createElement with/without attributes
  - [ ] createTextNode
  - [ ] createCommentNode
- [ ] Test DOM manipulation
  - [ ] appendChild
  - [ ] insertBefore
  - [ ] removeChild
  - [ ] replaceChild
  - [ ] Error cases
- [ ] Test DOM query methods
  - [ ] querySelector
  - [ ] querySelectorAll
  - [ ] getElementById
  - [ ] getElementsByClassName
  - [ ] getElementsByTagName
  - [ ] Convenience methods
- [ ] Test serialization
  - [ ] toHTML() produces valid HTML
  - [ ] toString() is readable
  - [ ] toJSON()/fromJSON() round-trip
  - [ ] clone() deep copies
- [ ] Test WeakRef behavior
  - [ ] Context can be garbage collected
  - [ ] getContext() returns null after GC
- [ ] Test metadata
  - [ ] Set/get metadata
  - [ ] Merge metadata
- [ ] Run coverage report
  - [ ] Aim for 90%+ coverage
  - [ ] Document any uncovered lines

### Test Structure

```javascript
describe('WikiDocument', () => {
  describe('constructor', () => {
    test('creates WikiDocument with pageData', () => { ... });
    test('stores context as WeakRef', () => { ... });
  });

  describe('DOM creation', () => {
    test('createElement creates element', () => { ... });
    test('createElement sets attributes', () => { ... });
  });

  // ... more test suites
});
```

### Deliverables

- [ ] Test file created
- [ ] All methods tested
- [ ] Edge cases covered
- [ ] Coverage report generated

### Acceptance Criteria

- All tests pass
- 90%+ code coverage achieved
- Edge cases handled
- Tests are clear and maintainable
- No flaky tests

### Estimated Time

2-3 days
```

---

### Issue #7: Phase 1.7 - WikiDocument Documentation

**Title**: `[Phase 1.7] WikiDocument API Documentation`

**Labels**: `documentation, parser, phase-1`

**Milestone**: WikiDocument DOM Migration - Week 1

**Description**:
```markdown
## Phase 1.7: WikiDocument Documentation

Part of Epic: #XXX (WikiDocument DOM Migration)
Depends on: #XXX (Phase 1.6)

### Objectives

Create comprehensive API documentation for WikiDocument.

### Tasks

- [ ] Ensure all methods have JSDoc comments
  - [ ] Parameter types documented
  - [ ] Return types documented
  - [ ] Exceptions documented
  - [ ] Examples provided
- [ ] Create `docs/api/WikiDocument.md`
  - [ ] Overview section
  - [ ] Constructor documentation
  - [ ] Method reference (all methods)
  - [ ] Usage examples
  - [ ] Best practices
- [ ] Add usage examples
  - [ ] Creating WikiDocument
  - [ ] Building DOM tree
  - [ ] Querying nodes
  - [ ] Serializing to HTML
  - [ ] Caching WikiDocument
- [ ] Document differences from JDOM2
  - [ ] API differences
  - [ ] Behavior differences
  - [ ] Compatibility notes
- [ ] Update architecture docs
  - [ ] Link to WikiDocument API docs
  - [ ] Update diagrams if needed

### Example Documentation

```markdown
# WikiDocument API Reference

## Constructor

### `new WikiDocument(pageData, context)`

Creates a new WikiDocument instance.

**Parameters:**
- `pageData` (string): Original wiki markup
- `context` (Object): Rendering context (stored as WeakRef)

**Example:**
\`\`\`javascript
const doc = new WikiDocument('! My Page\nContent', {
  pageName: 'MyPage',
  userName: 'admin'
});
\`\`\`

## Methods

### `getRootElement()`

Returns the root DOM element.

**Returns:** `Element` - Root element of the document

...
```

### Deliverables

- [ ] JSDoc comments complete
- [ ] API documentation created
- [ ] Examples provided
- [ ] Architecture docs updated

### Acceptance Criteria

- All public methods documented
- Examples are clear and runnable
- Documentation is accurate
- No broken links
- Follows project doc standards

### Estimated Time

1-2 days
```

---

## Commands to Create Issues

Use GitHub CLI to create these issues:

```bash
# Create Epic
gh issue create \
  --title "[EPIC] Migrate to WikiDocument DOM-Based Parsing Architecture" \
  --label "epic,enhancement,architecture,parser,high-priority" \
  --body-file docs/architecture/github-epic-body.md

# Create Phase 1.1
gh issue create \
  --title "[Phase 1.1] Research and Setup - DOM Library Evaluation" \
  --label "enhancement,research,parser,phase-1" \
  --milestone "WikiDocument DOM Migration - Week 1" \
  --body-file docs/architecture/github-issue-1-1.md

# Create Phase 1.2
gh issue create \
  --title "[Phase 1.2] WikiDocument Core Implementation" \
  --label "enhancement,parser,phase-1" \
  --milestone "WikiDocument DOM Migration - Week 1" \
  --body-file docs/architecture/github-issue-1-2.md

# Continue for all Phase 1 issues...
```

---

## Milestone Configuration

Create milestone in GitHub:

**Name**: `WikiDocument DOM Migration - Week 1`

**Description**: Foundation phase - Implement WikiDocument class with DOM manipulation, query methods, serialization, testing, and documentation.

**Due Date**: [Set to 1 week from start date]

---

## Labels to Create

Make sure these labels exist in your repository:

- `epic` - For epic tracking issues
- `enhancement` - For new features
- `architecture` - For architectural changes
- `parser` - For parser-related issues
- `phase-1` through `phase-7` - For phase tracking
- `research` - For investigation tasks
- `testing` - For test-related tasks
- `documentation` - For doc tasks
- `high-priority` - For critical issues

---

**Last Updated**: 2025-10-09
