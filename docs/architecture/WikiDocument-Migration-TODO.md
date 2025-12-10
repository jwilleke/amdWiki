> **ARCHIVED**: This document is for historical purposes only. For the current and complete documentation, please see **[WikiDocument Complete Guide](../WikiDocument-Complete-Guide.md)**.


---
title: WikiDocument DOM Migration - TODO List
uuid: wikidocument-migration-todo
category: documentation
user-keywords: [migration, parser, DOM, todo]
lastModified: 2025-10-09
---

# WikiDocument DOM Migration - TODO List

**Goal**: Migrate from fragile string-based parsing to robust DOM-based parsing following JSPWiki's proven architecture.

**Reference**: [WikiDocument-DOM-Architecture.md](../../docs/architecture/WikiDocument-DOM-Architecture.md))

**Timeline**: 6 weeks (estimated)

---

## Week 1: Foundation - WikiDocument Class

### Phase 1.1: Research & Setup
- [ ] Evaluate DOM libraries (jsdom vs cheerio vs custom)
  - [ ] Benchmark jsdom performance
  - [ ] Benchmark cheerio performance
  - [ ] Compare API features needed
  - [ ] Make final decision and document
- [ ] Create `src/parsers/dom/` directory structure
- [ ] Add chosen DOM library to package.json
- [ ] Set up test framework for DOM tests

### Phase 1.2: WikiDocument Core Implementation
- [ ] Create `src/parsers/dom/WikiDocument.js`
  - [ ] Implement constructor(pageData, context)
  - [ ] Add pageData property storage
  - [ ] Add WeakRef context storage
  - [ ] Add metadata object
  - [ ] Implement getRootElement()
  - [ ] Implement getPageData()
  - [ ] Implement getContext()
  - [ ] Implement getMetadata()
  - [ ] Implement setMetadata()

### Phase 1.3: DOM Manipulation Methods
- [ ] Implement createElement(tag, attributes)
- [ ] Implement createTextNode(text)
- [ ] Implement createCommentNode(text)
- [ ] Implement appendChild(node)
- [ ] Implement insertBefore(newNode, referenceNode)
- [ ] Implement removeChild(node)
- [ ] Implement replaceChild(newNode, oldNode)

### Phase 1.4: DOM Query Methods
- [ ] Implement querySelector(selector)
- [ ] Implement querySelectorAll(selector)
- [ ] Implement getElementById(id)
- [ ] Implement getElementsByClassName(className)
- [ ] Implement getElementsByTagName(tagName)

### Phase 1.5: Serialization
- [ ] Implement toHTML() - serialize DOM to HTML string
- [ ] Implement toString() - for debugging
- [ ] Implement toJSON() - for caching
- [ ] Implement static fromJSON() - reconstruct from cache

### Phase 1.6: Testing
- [ ] Write unit tests for WikiDocument constructor
- [ ] Write unit tests for DOM creation methods
- [ ] Write unit tests for DOM manipulation methods
- [ ] Write unit tests for DOM query methods
- [ ] Write unit tests for serialization methods
- [ ] Test WeakRef context behavior
- [ ] Test metadata storage and retrieval
- [ ] Achieve 90%+ code coverage

### Phase 1.7: Documentation
- [ ] Add JSDoc comments to all methods
- [ ] Create WikiDocument API documentation
- [ ] Add usage examples
- [ ] Document differences from JDOM2

---

## Week 2: Token-Based Parser

### Phase 2.1: Tokenizer Core
- [ ] Create `src/parsers/dom/Tokenizer.js`
  - [ ] Implement character-by-character reading
  - [ ] Implement pushBack() for lookahead
  - [ ] Implement nextChar() method
  - [ ] Implement peekChar() method
  - [ ] Implement skipWhitespace()
  - [ ] Add position tracking
  - [ ] Add line/column tracking for errors

### Phase 2.2: Token Types
- [ ] Define token types enum
  - [ ] TEXT - plain text
  - [ ] ESCAPED - escaped content (e.g., [[)
  - [ ] VARIABLE - [{$varname}]
  - [ ] PLUGIN - [{PluginName param=value}]
  - [ ] WIKI_TAG - <wiki:tag>
  - [ ] LINK - [PageName] or [text|url]
  - [ ] INTERWIKI - [Wiki:PageName]
  - [ ] HEADING - !, !!, !!!, etc.
  - [ ] LIST_ITEM - *, #
  - [ ] TABLE_CELL - |
  - [ ] BOLD - ```__text__```
  - [ ] ITALIC - ''text''
  - [ ] CODE_INLINE - {{text}}
  - [ ] CODE_BLOCK - {{{...}}}
  - [ ] COMMENT - %%comment%%

### Phase 2.3: Token Recognition
- [ ] Implement recognizeToken() - determine token type
- [ ] Implement parseTextToken()
- [ ] Implement parseEscapedToken() - handles [[
- [ ] Implement parseVariableToken()
- [ ] Implement parsePluginToken()
- [ ] Implement parseWikiTagToken()
- [ ] Implement parseLinkToken()
- [ ] Implement parseInterWikiToken()
- [ ] Implement parseHeadingToken()
- [ ] Implement parseListToken()
- [ ] Implement parseTableToken()
- [ ] Implement parseFormattingToken() (bold, italic)
- [ ] Implement parseCodeToken()
- [ ] Implement parseCommentToken()

### Phase 2.4: DOM Builder
- [ ] Create `src/parsers/dom/DOMBuilder.js`
- [ ] Implement buildFromTokens(tokens, wikiDocument)
- [ ] Implement createNodeFromToken(token)
  - [ ] Handle TEXT tokens → Text nodes
  - [ ] Handle ESCAPED tokens → Text nodes (unescaped)
  - [ ] Handle VARIABLE tokens → span.wiki-variable elements
  - [ ] Handle PLUGIN tokens → div.wiki-plugin elements
  - [ ] Handle WIKI_TAG tokens → appropriate elements
  - [ ] Handle LINK tokens → a elements
  - [ ] Handle HEADING tokens → h1-h6 elements
  - [ ] Handle LIST tokens → ul/ol/li elements
  - [ ] Handle TABLE tokens → table/tr/td elements
  - [ ] Handle BOLD tokens → strong elements
  - [ ] Handle ITALIC tokens → em elements
  - [ ] Handle CODE tokens → code/pre elements

### Phase 2.5: Parser Integration
- [ ] Create `src/parsers/dom/DOMParser.js`
- [ ] Implement parse(content, context) → WikiDocument
- [ ] Integrate Tokenizer
- [ ] Integrate DOMBuilder
- [ ] Add error handling and recovery
- [ ] Add parse position tracking
- [ ] Add helpful error messages

### Phase 2.6: Testing
- [ ] Write tokenizer unit tests
  - [ ] Test each token type recognition
  - [ ] Test pushBack/lookahead
  - [ ] Test position tracking
- [ ] Write DOMBuilder unit tests
  - [ ] Test node creation for each token type
  - [ ] Test DOM tree structure
- [ ] Write DOMParser integration tests
  - [ ] Test simple text
  - [ ] Test escaped brackets [[
  - [ ] Test variables
  - [ ] Test plugins
  - [ ] Test links
  - [ ] Test complex nested structures
- [ ] Test error handling
- [ ] Achieve 90%+ code coverage

### Phase 2.7: Fallback Strategy
- [ ] Add config flag: `amdwiki.parser.useDOMParser` (default: false)
- [ ] Keep string-based parser functional
- [ ] Add parser selection logic in MarkupParser
- [ ] Ensure both parsers work side-by-side

---

## Week 3: Migrate Variable Handler

### Phase 3.1: DOM-Based Variable Handler
- [ ] Create `src/parsers/dom/handlers/DOMVariableHandler.js`
- [ ] Implement processVariables(wikiDocument, context)
- [ ] Find all variable elements: querySelectorAll('[data-variable]')
- [ ] For each variable element:
  - [ ] Extract variable name from data attribute
  - [ ] Resolve variable value via VariableManager
  - [ ] Update element textContent
  - [ ] Handle errors gracefully
- [ ] Support all existing variable types
  - [ ] System variables ($pagename, $username, etc.)
  - [ ] Context variables
  - [ ] User variables

### Phase 3.2: Testing
- [ ] Write unit tests for DOMVariableHandler
- [ ] Test each variable type
- [ ] Test escaped variables (should not be processed)
- [ ] Test variable resolution errors
- [ ] Compare output with string-based handler
- [ ] Ensure identical behavior

### Phase 3.3: Integration
- [ ] Add DOMVariableHandler to DOMParser pipeline
- [ ] Configure execution order
- [ ] Test with real wiki pages
- [ ] Fix any issues found

---

## Week 4: Migrate Plugin and Link Handlers

### Phase 4.1: DOM-Based Plugin Handler
- [ ] Create `src/parsers/dom/handlers/DOMPluginHandler.js`
- [ ] Implement processPlugins(wikiDocument, context)
- [ ] Find all plugin elements: querySelectorAll('.wiki-plugin')
- [ ] For each plugin element:
  - [ ] Extract plugin name and parameters
  - [ ] Execute plugin via PluginManager
  - [ ] Replace element with plugin output (as DOM)
  - [ ] Handle async plugins
  - [ ] Handle plugin errors
- [ ] Support all existing plugins
  - [ ] IndexPlugin
  - [ ] CurrentTimePlugin
  - [ ] ReferringPagesPlugin
  - [ ] Custom plugins

### Phase 4.2: DOM-Based Link Handler
- [ ] Create `src/parsers/dom/handlers/DOMLinkHandler.js`
- [ ] Implement processLinks(wikiDocument, context)
- [ ] Find all link elements: querySelectorAll('a[data-wiki-link]')
- [ ] For each link element:
  - [ ] Resolve wiki page existence
  - [ ] Add appropriate CSS classes (wikipage vs redlink)
  - [ ] Update href attributes
  - [ ] Handle InterWiki links
  - [ ] Handle external links
  - [ ] Handle attachment links

### Phase 4.3: DOM-Based WikiTag Handler
- [ ] Create `src/parsers/dom/handlers/DOMWikiTagHandler.js`
- [ ] Implement processWikiTags(wikiDocument, context)
- [ ] Support existing wiki tags
  - [ ] <wiki:include>
  - [ ] <wiki:link>
  - [ ] <wiki:var>
  - [ ] Others as needed

### Phase 4.4: Testing
- [ ] Write unit tests for DOMPluginHandler
- [ ] Write unit tests for DOMLinkHandler
- [ ] Write unit tests for DOMWikiTagHandler
- [ ] Test plugin execution in DOM context
- [ ] Test link resolution and styling
- [ ] Test escaped plugins/links (should not be processed)
- [ ] Integration tests with real content
- [ ] Compare output with string-based handlers

### Phase 4.5: Integration
- [ ] Add all handlers to DOMParser pipeline
- [ ] Configure execution order:
  1. Variables first
  2. Links second
  3. Plugins third (may reference variables/links)
  4. WikiTags last
- [ ] Test full pipeline
- [ ] Fix any issues

---

## Week 5: XHTMLRenderer and Integration

### Phase 5.1: XHTMLRenderer Implementation
- [ ] Create `src/parsers/dom/XHTMLRenderer.js`
- [ ] Implement render(wikiDocument, context)
- [ ] Add pre-rendering filters (optional)
- [ ] Serialize WikiDocument.toHTML()
- [ ] Add post-rendering cleanup
- [ ] Add security filtering (XSS prevention)
- [ ] Add HTML validation

### Phase 5.2: RenderingManager Integration
- [ ] Update `src/managers/RenderingManager.js`
- [ ] Add parseToDocument(content, context) method
- [ ] Update textToHTML() to use DOM pipeline when enabled
- [ ] Keep string-based pipeline as fallback
- [ ] Add configuration support:
  ```javascript
  if (config.get('amdwiki.parser.useDOMParser')) {
    // Use DOM-based pipeline
    const wikiDoc = await markupParser.parseToDocument(content, context);
    return renderer.render(wikiDoc, context);
  } else {
    // Use string-based pipeline (legacy)
    return markupParser.parse(content, context);
  }
  ```

### Phase 5.3: Caching Strategy
- [ ] Create `src/parsers/dom/WikiDocumentCache.js`
- [ ] Implement cache.set(key, wikiDocument)
- [ ] Implement cache.get(key) → wikiDocument
- [ ] Add WikiDocument serialization for caching
- [ ] Add WikiDocument deserialization
- [ ] Integrate with existing CacheManager
- [ ] Configure cache TTL and eviction

### Phase 5.4: Configuration
- [ ] Add to `config/app-default-config.json`:
  ```json
  {
    "amdwiki.parser.useDOMParser": false,
    "amdwiki.parser.dom.enabled": true,
    "amdwiki.parser.dom.cache.enabled": true,
    "amdwiki.parser.dom.cache.ttl": 3600000,
    "amdwiki.parser.dom.debug": false
  }
  ```
- [ ] Document configuration options
- [ ] Add ConfigurationManager validation

### Phase 5.5: Testing
- [ ] End-to-end tests with DOM pipeline
- [ ] Test with all wiki pages
- [ ] Test caching behavior
- [ ] Test cache invalidation
- [ ] Performance benchmarks
- [ ] Compare DOM vs string performance
- [ ] Memory usage analysis

### Phase 5.6: Bug Fixes
- [ ] Fix [[  escaping (primary issue)
- [ ] Test escaped content in all contexts
- [ ] Test variable expansion order
- [ ] Test plugin execution order
- [ ] Test complex nested structures
- [ ] Fix any regressions

---

## Week 6: Testing, Documentation, and Deployment

### Phase 6.1: Comprehensive Testing
- [ ] Test all wiki pages in development
- [ ] Test all plugins with DOM pipeline
- [ ] Test all variables with DOM pipeline
- [ ] Test all link types
- [ ] Test escaped content extensively
- [ ] Test performance under load
- [ ] Test memory leaks
- [ ] Test cache effectiveness

### Phase 6.2: Performance Optimization
- [ ] Profile DOM parser performance
- [ ] Optimize hot paths
- [ ] Optimize DOM creation
- [ ] Optimize serialization
- [ ] Cache commonly used patterns
- [ ] Benchmark improvements

### Phase 6.3: Documentation
- [ ] Update [MarkupParser documentation](../../src/parsers/MarkupParser.js)
- [ ] Create DOM Parser user guide
- [ ] Document WikiDocument API
- [ ] Document handler development guide
- [ ] Add architecture diagrams
- [ ] Document migration benefits
- [ ] Create troubleshooting guide

### Phase 6.4: Migration Guide
- [ ] Write migration guide for existing pages
- [ ] Document breaking changes (if any)
- [ ] Document new features enabled by DOM
- [ ] Provide code examples
- [ ] Document rollback procedure

### Phase 6.5: Enable DOM Parser by Default
- [ ] Set `amdwiki.parser.useDOMParser: true` in config
- [ ] Monitor for issues
- [ ] Fix any bugs found
- [ ] Verify escaping issues are resolved
- [ ] Celebrate! 🎉

### Phase 6.6: Deprecate String-Based Parser
- [ ] Add deprecation warnings to string-based parser
- [ ] Set timeline for removal
- [ ] Notify users of deprecation
- [ ] Update documentation

### Phase 6.7: Cleanup (Week 7+)
- [ ] Remove string-based parser code
- [ ] Remove legacy handlers
- [ ] Clean up tests
- [ ] Remove temporary configuration flags
- [ ] Final documentation update

---

## Success Criteria

### Primary Goals
- [x] **Fix [[  escaping permanently** - Root cause resolved by DOM architecture
- [ ] **No regressions** - All existing functionality works
- [ ] **Performance maintained** - DOM parser as fast or faster (with caching)
- [ ] **JSPWiki compatible** - Follows proven architecture

### Secondary Goals
- [ ] **Cacheable parsing** - WikiDocument objects can be cached
- [ ] **Inspectable DOM** - Can query parsed structure
- [ ] **Plugin DOM manipulation** - Plugins can modify DOM before rendering
- [ ] **Better error messages** - Parse errors show line/column

### Metrics
- [ ] 90%+ test coverage for all new code
- [ ] Zero escaping issues reported
- [ ] Parse time < 100ms for typical page
- [ ] Cache hit ratio > 60%
- [ ] Memory usage < 50MB for 1000 pages

---

## Risk Management

### Risk: Performance Regression
**Mitigation**:
- Benchmark at each phase
- Implement aggressive caching
- Optimize hot paths
- Use lightweight DOM library if needed

### Risk: Breaking Changes
**Mitigation**:
- Keep string parser as fallback
- Phased rollout
- Comprehensive testing
- Easy rollback mechanism

### Risk: Scope Creep
**Mitigation**:
- Stick to defined phases
- Don't add new features during migration
- Focus on parity first, improvements later

### Risk: Timeline Slip
**Mitigation**:
- Weekly progress reviews
- Adjust scope if needed
- Prioritize core functionality
- Defer nice-to-haves

---

## Progress Tracking

**Current Status**: Planning Complete ✅

**Next Steps**:
1. Start Phase 1.1: Evaluate DOM libraries
2. Make library decision
3. Begin WikiDocument implementation

**Blockers**: None

**Notes**:
- This migration addresses the root cause of recurring escaping issues
- Follows JSPWiki's proven 20-year-old architecture
- Will permanently fix the [[  escaping problem
- Enables future enhancements (DOM manipulation, better caching)

---

## References

- [WikiDocument-DOM-Architecture.md](WikiDocument-DOM-Architecture.md) - Detailed architecture analysis
- [JSPWiki WikiDocument API](https://jspwiki.apache.org/apidocs/2.12.1/org/apache/wiki/parser/WikiDocument.html)
- [JSPWiki MarkupParser](https://github.com/apache/jspwiki/blob/master/jspwiki-main/src/main/java/org/apache/wiki/parser/MarkupParser.java)
- [Current MarkupParser.js](../../src/parsers/MarkupParser.js)
- [.github/copilot-instructions.md](../../.github/copilot-instructions.md)

---

**Last Updated**: 2025-10-09
**Maintained By**: Development Team
**Status**: Active Development
