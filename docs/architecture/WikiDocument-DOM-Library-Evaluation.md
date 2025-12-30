> **ARCHIVED**: This document is for historical purposes only. For the current and complete documentation, please see **[WikiDocument Complete Guide](../WikiDocument-Complete-Guide.md)**.

# WikiDocument DOM Library Evaluation

**Date:** 2025-10-12
**Phase:** 1.1 - Research & Setup
**Related Issue:** [#93 - WikiDocument DOM Migration](https://github.com/jwilleke/amdWiki/issues/93)

## Overview

Evaluation of DOM libraries for the WikiDocument internal DOM implementation. We need a lightweight, performant library that can build and manipulate DOM trees similar to JSPWiki's JDOM2 approach.

## Requirements

### Functional Requirements

1. **DOM Creation** - Create elements, text nodes, attributes
2. **DOM Manipulation** - Append, insert, remove, replace nodes
3. **DOM Query** - querySelector, querySelectorAll, getElementById
4. **Serialization** - Convert DOM to HTML string
5. **JSON Support** - Serialize/deserialize for caching
6. **Lightweight** - Minimal memory footprint
7. **Fast** - Parse and manipulate quickly

### JSPWiki Compatibility

- Similar API to JDOM2 where possible
- Support for metadata storage
- Support for WeakRef context (native JS feature)

## Candidate Libraries

### 1. jsdom

**Repository:** <https://github.com/jsdom/jsdom>
**npm:** `jsdom`
**Version:** 24.x
**Size:** ~4.7 MB (installed)

#### Pros

✅ **Full W3C DOM Implementation**

- Complete HTML5 DOM APIs
- querySelector, querySelectorAll support
- Full DOM manipulation methods
- addEventListener support (not needed but nice)

✅ **Mature and Well-Tested**

- Used by Jest, Enzyme, and other major tools
- 20k+ GitHub stars
- Active maintenance
- Excellent documentation

✅ **Full Browser API Compatibility**

- document.createElement()
- element.innerHTML, outerHTML
- element.textContent
- All standard DOM methods

✅ **Good Developer Experience**

- Familiar browser-like API
- Easy to debug
- TypeScript definitions available

#### Cons

❌ **Heavy Weight**

- Large dependency tree
- Includes unnecessary browser APIs (XMLHttpRequest, fetch, etc.)
- Memory overhead for unused features

❌ **Performance Overhead**

- Slower than lighter alternatives
- More memory usage per document
- Full HTML parsing engine (overkill for wiki markup)

❌ **Complexity**

- More complex than needed
- Difficult to optimize
- Harder to control behavior

#### Code Example

```javascript
const { JSDOM } = require('jsdom');

class WikiDocument {
  constructor(pageData, context) {
    this.dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    this.document = this.dom.window.document;
    this.root = this.document.body;
    this.pageData = pageData;
    this.context = new WeakRef(context);
  }

  createElement(tag, attributes = {}) {
    const element = this.document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    return element;
  }

  createTextNode(text) {
    return this.document.createTextNode(text);
  }

  toHTML() {
    return this.root.innerHTML;
  }
}
```

#### Performance Estimate

- **Parse Time:** 5-10ms per document
- **Memory:** ~2-5 MB per document
- **Serialization:** 1-2ms per document

### 2. cheerio

**Repository:** <https://github.com/cheeriojs/cheerio>
**npm:** `cheerio`
**Version:** 1.0.0
**Size:** ~1.2 MB (installed)

#### Pros

✅ **Lightweight**

- Much smaller than jsdom
- Minimal dependency tree
- Fast load time

✅ **jQuery-Like API**

- Familiar API for developers
- Chaining support
- CSS selector support

✅ **Server-Side Focus**

- Designed for Node.js
- No browser emulation overhead
- Good for HTML manipulation

✅ **Fast**

- Quick parsing (htmlparser2)
- Fast DOM manipulation
- Low memory usage

#### Cons

❌ **Limited DOM API**

- Not a full W3C DOM implementation
- No document.createElement() (uses different API)
- Different API than browser (learning curve)
- No native DOM methods

❌ **jQuery API Not Standard**

- $('.element') instead of querySelector()
- Different manipulation methods
- Not compatible with browser DOM code

❌ **Serialization Differences**

- html() method instead of innerHTML
- May produce slightly different output
- Less control over serialization

#### Code Example

```javascript
const cheerio = require('cheerio');

class WikiDocument {
  constructor(pageData, context) {
    this.$ = cheerio.load('<body></body>');
    this.root = this.$('body');
    this.pageData = pageData;
    this.context = new WeakRef(context);
  }

  createElement(tag, attributes = {}) {
    const element = this.$(`<${tag}>`);
    Object.entries(attributes).forEach(([key, value]) => {
      element.attr(key, value);
    });
    return element;
  }

  createTextNode(text) {
    return this.$(text);
  }

  toHTML() {
    return this.root.html();
  }
}
```

#### Performance Estimate

- **Parse Time:** 1-3ms per document
- **Memory:** ~500KB - 1 MB per document
- **Serialization:** <1ms per document

### 3. linkedom

**Repository:** <https://github.com/WebReflection/linkedom>
**npm:** `linkedom`
**Version:** 0.18.x
**Size:** ~500 KB (installed)

#### Pros

✅ **Lightweight jsdom Alternative**

- Full DOM API compatibility
- Much smaller than jsdom
- Fast performance

✅ **Standard DOM API**

- document.createElement()
- querySelector, querySelectorAll
- Standard DOM manipulation
- Browser-compatible code

✅ **Modern Implementation**

- ES6+ features
- Good TypeScript support
- Active development
- Clean codebase

✅ **Performance**

- 10-40x faster than jsdom
- Lower memory usage
- Optimized for server-side

#### Cons

⚠️ **Less Mature**

- Newer library (fewer stars)
- Smaller community
- Less battle-tested
- Potential edge cases

⚠️ **Documentation**

- Less comprehensive than jsdom
- Fewer examples
- Less Stack Overflow answers

#### Code Example

```javascript
const { parseHTML } = require('linkedom');

class WikiDocument {
  constructor(pageData, context) {
    const { document } = parseHTML('<body></body>');
    this.document = document;
    this.root = document.body;
    this.pageData = pageData;
    this.context = new WeakRef(context);
  }

  createElement(tag, attributes = {}) {
    const element = this.document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    return element;
  }

  createTextNode(text) {
    return this.document.createTextNode(text);
  }

  toHTML() {
    return this.root.innerHTML;
  }
}
```

#### Performance Estimate

- **Parse Time:** 0.5-1ms per document
- **Memory:** ~300-500 KB per document
- **Serialization:** <0.5ms per document

### 4. Custom Lightweight DOM

**Implementation:** Build our own minimal DOM
**Size:** ~50-100 KB (estimated)

#### Pros

✅ **Minimal Dependencies**

- Zero external dependencies
- Full control over behavior
- Exact features we need

✅ **Optimized for Wiki**

- Only wiki-specific nodes
- Custom serialization
- Optimized for our use case

✅ **Learning Opportunity**

- Deep understanding of implementation
- Custom optimizations
- Tailored to amdWiki

#### Cons

❌ **Development Time**

- Weeks to implement properly
- Need to write extensive tests
- Maintenance burden

❌ **Potential Bugs**

- Edge cases to discover
- Less battle-tested
- More debugging

❌ **Reinventing the Wheel**

- Standard libraries exist
- Community solutions proven
- Not a core feature

#### Code Example

```javascript
class WikiElement {
  constructor(tag, attributes = {}) {
    this.tag = tag;
    this.attributes = attributes;
    this.children = [];
    this.textContent = null;
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  querySelector(selector) {
    // Custom implementation
  }

  toHTML() {
    if (this.textContent !== null) {
      return this.textContent;
    }
    const attrs = Object.entries(this.attributes)
      .map(([k, v]) => `${k}="${v}"`)
      .join(' ');
    const children = this.children.map(c => c.toHTML()).join('');
    return `<${this.tag}${attrs ? ' ' + attrs : ''}>${children}</${this.tag}>`;
  }
}

class WikiDocument {
  constructor(pageData, context) {
    this.root = new WikiElement('body');
    this.pageData = pageData;
    this.context = new WeakRef(context);
  }

  createElement(tag, attributes = {}) {
    return new WikiElement(tag, attributes);
  }

  createTextNode(text) {
    const node = new WikiElement(null);
    node.textContent = text;
    return node;
  }

  toHTML() {
    return this.root.toHTML();
  }
}
```

#### Performance Estimate

- **Parse Time:** <0.5ms per document (fastest)
- **Memory:** ~100-200 KB per document (smallest)
- **Serialization:** <0.5ms per document

## Comparison Matrix

| Feature | jsdom | cheerio | linkedom | Custom |
| --------- | ------- | --------- | ---------- | -------- |
| **Size** | 4.7 MB | 1.2 MB | 500 KB | <100 KB |
| **Performance** | Slow | Fast | Very Fast | Fastest |
| **Memory Usage** | High | Medium | Low | Lowest |
| **API Compatibility** | Full DOM | jQuery | Full DOM | Custom |
| **Learning Curve** | None | Low | None | Medium |
| **Maintenance** | Low | Low | Low | High |
| **Battle-Tested** | Very | Very | Moderate | No |
| **TypeScript** | Yes | Yes | Yes | No |
| **Documentation** | Excellent | Excellent | Good | None |
| **Community** | Large | Large | Growing | None |

## Benchmarks

### Test Scenario

Create a WikiDocument with 100 elements, serialize to HTML:

```javascript
const iterations = 1000;

// Benchmark code
console.time('Create');
for (let i = 0; i < iterations; i++) {
  const doc = new WikiDocument('test', {});
  for (let j = 0; j < 100; j++) {
    const el = doc.createElement('p', { id: `para-${j}` });
    const text = doc.createTextNode(`Paragraph ${j}`);
    el.appendChild(text);
    doc.root.appendChild(el);
  }
  const html = doc.toHTML();
}
console.timeEnd('Create');
```

### Expected Results (estimated)

| Library | Time (1000 iterations) | Memory Peak |
| --------- | ------------------------ | ------------- |
| jsdom | ~5000ms | ~500 MB |
| cheerio | ~1500ms | ~150 MB |
| linkedom | ~500ms | ~100 MB |
| Custom | ~300ms | ~50 MB |

## Decision Criteria

### Priority 1: Performance

- Must handle 1000+ pages efficiently
- Parse time < 10ms per page
- Memory < 10 MB for 100 documents

### Priority 2: Maintainability

- Standard API preferred
- Good documentation
- Active community
- Low maintenance burden

### Priority 3: Features

- Full DOM manipulation
- querySelector support
- Easy serialization
- JSON support (for caching)

### Priority 4: Size

- Keep bundle size reasonable
- Avoid unnecessary dependencies

## Recommendation

### Phase 1: Use **linkedom** (Best Balance)

**Rationale:**

1. ✅ **Performance** - 10-40x faster than jsdom
2. ✅ **Standard API** - Full W3C DOM compatibility
3. ✅ **Lightweight** - Only 500 KB vs 4.7 MB
4. ✅ **Maintainability** - Standard DOM API, good docs
5. ✅ **Battle-Tested** - Used in production by several projects
6. ✅ **Future-Proof** - Can swap to jsdom if needed (same API)

**Installation:**

```bash
npm install linkedom --save
```

**Why Not Others:**

- **jsdom**: Too heavy, too slow for our needs
- **cheerio**: Non-standard API, harder to maintain
- **Custom**: Too much development time, not worth it

### Phase 2: Consider Custom (Future Optimization)

If linkedom performance is not sufficient (unlikely), we can:

1. Profile linkedom to find bottlenecks
2. Optimize hot paths
3. Consider custom implementation for specific nodes
4. Keep linkedom for general use

## Implementation Plan

### Step 1: Install linkedom

```bash
npm install linkedom --save
```

### Step 2: Create WikiDocument Class

```javascript
// src/parsers/dom/WikiDocument.js
const { parseHTML } = require('linkedom');

class WikiDocument {
  constructor(pageData, context) {
    const { document } = parseHTML('<body></body>');
    this.document = document;
    this.root = document.body;
    this.pageData = pageData;
    this.context = new WeakRef(context);
    this.metadata = {};
  }

  // DOM manipulation methods...
}

module.exports = WikiDocument;
```

### Step 3: Performance Testing

```javascript
// benchmark/dom-performance.js
const WikiDocument = require('../src/parsers/dom/WikiDocument');

// Test creation
// Test manipulation
// Test serialization
// Test memory usage
```

### Step 4: Integration Testing

```javascript
// src/parsers/dom/__tests__/WikiDocument.test.js
describe('WikiDocument', () => {
  test('creates document', () => {
    const doc = new WikiDocument('test', {});
    expect(doc).toBeDefined();
  });

  // More tests...
});
```

## Fallback Plan

If linkedom has issues:

1. **Try jsdom** - Slower but very reliable
2. **Try cheerio** - Different API but well-tested
3. **Custom implementation** - Last resort

## Success Metrics

After implementation, measure:

- ✅ Parse time < 10ms per page
- ✅ Memory < 5 MB per 100 pages
- ✅ Serialization < 2ms per page
- ✅ Test coverage > 90%
- ✅ No memory leaks
- ✅ Stable performance under load

## References

- [linkedom GitHub](https://github.com/WebReflection/linkedom)
- [jsdom GitHub](https://github.com/jsdom/jsdom)
- [cheerio GitHub](https://github.com/cheeriojs/cheerio)
- [JSPWiki JDOM2](https://github.com/hunterhacker/jdom)
- [W3C DOM Specification](https://dom.spec.whatwg.org/)

## Decision

### APPROVED: Use linkedom for WikiDocument DOM implementation

**Date:** 2025-10-12
**Approved By:** Development Team
**Next Steps:**

1. Install linkedom
2. Create WikiDocument class
3. Benchmark performance
4. Proceed to Phase 1.2

---

**Status:** ✅ **COMPLETE**
**Phase:** 1.1 - Research & Setup
**Related Issue:** #93
