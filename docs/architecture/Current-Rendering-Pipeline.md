# Current Rendering Pipeline

**Status**: Production Architecture (as of 2026-04-27)
**Related**: [Current-Save-Page-Pipeline.md](./Current-Save-Page-Pipeline.md) | [WikiDocument-DOM-Architecture.md](./WikiDocument-DOM-Architecture.md) | [JSPWikiPreprocessor.md](./JSPWikiPreprocessor.md)

---

## Request-to-HTML Flow

```
HTTP GET /wiki/PageName
    │
    ▼
WikiRoutes.viewPage()
    │  ACL check, page load
    ▼
WikiContext (request encapsulation)
    │
    ▼
RenderingManager.renderMarkdown()
    │  cache check → MarkupParser.parse()
    ▼
MarkupParser.parseWithDOMExtraction()   ← primary path
    │
    ├─ Phase 1: extractJSPWikiSyntax()
    ├─ Phase 2: WikiDocument DOM node creation
    ├─ Phase 2.5: JSPWikiPreprocessor (tables, style blocks)
    ├─ Step 0.55: inline style conversion (%%sup/sub/strike%%)
    ├─ Phase 2.6: registered handlers
    └─ Phase 3: Showdown markdown → HTML
    │
    ▼
DOM placeholder restoration (UUID spans → rendered HTML)
    │
    ▼
FilterChain  ⚠️ WIRED BUT NOT CALLED — see #596
    │
    ▼
TemplateManager (EJS) → HTTP Response
```

---

## Component Status

| Component | Status | Notes |
|---|---|---|
| `MarkupParser.parseWithDOMExtraction()` | ✅ Active | Primary rendering path |
| `WikiDocument` DOM | ✅ Active (partial) | Used for extracted elements (code, plugins, style blocks, links) — not full-page DOM parse |
| `JSPWikiPreprocessor` | ✅ Active | Phase 2.5 — converts bare table syntax and `%%class%%` style blocks to HTML |
| `FilterChain` (Security/Spam/Validation) | ⚠️ Initialized, never called | `filterChain.execute()` missing — tracked in [#596](https://github.com/jwilleke/ngdpbase/issues/596) |
| Legacy 7-phase string pipeline | ❌ Superseded | Replaced by `parseWithDOMExtraction()` |

---

## Detailed Pipeline Phases

### Phase 1 — `extractJSPWikiSyntax()`

**Source**: `src/parsers/MarkupParser.ts` → `extractJSPWikiSyntax()`

Extracts structured elements from raw wiki markup and replaces them with UUID placeholder spans. Extracted elements become `WikiDocument` DOM nodes in Phase 2.

| Step | What it does |
|---|---|
| 0 | Fenced code blocks (` ``` `) — line-scanner, handles CRLF |
| 0.5 | `%%class … /%` style blocks via `extractStyleBlocksWithStack()` |
| 0.5 (inline) | Inline code spans (`` `…` ``) |
| 0.56 | JSPWiki status boxes (`%%information`, `%%warning`, `%%error`) → Bootstrap alerts |
| 0.6 | JSPWiki line breaks (`\\` → `<br>`, `\\\` → `<br class="wiki-clearfix">`) |
| 0.7 | Emoji shortcodes (`:name:` → Unicode) |

> **Note**: Inline style conversion (`%%sup/sub/strike%%`) was previously Step 0.55 here.
> It was moved to after Phase 2.5 (#592) so that `escapeHtml()` in `parseTable()` does not
> destroy the generated `<sup>`/`<sub>` tags. See Phase 2.5 notes below.

---

### Phase 2 — WikiDocument DOM Node Creation

**Source**: `src/parsers/MarkupParser.ts` → `parseWithDOMExtraction()` lines ~2115–2134

A `WikiDocument` instance is created. For each element extracted in Phase 1, a DOM node is created via `createDOMNode()`. These nodes hold the rendered HTML for plugins, variables, code blocks, and style blocks — they are restored into the output in Phase 4 (placeholder replacement).

WikiDocument is **not** used as a full-document parser here — the surrounding wiki text continues through the string pipeline. Only the extracted elements are DOM-managed.

---

### Phase 2.5 — JSPWikiPreprocessor

**Source**: `src/parsers/handlers/JSPWikiPreprocessor.ts`
**Registered priority**: 95 (highest among handlers)

Converts bare JSPWiki syntax that was not captured as a style block in Phase 1:

- **Table syntax**: `||header||` / `|cell|` rows → `<table>/<thead>/<tbody>/<th>/<td>` HTML
- Calls `escapeHtml()` on each cell value — protects placeholder spans, escapes `&`, `<`, `>`, `"`, `'`

> **Important**: `%` is not an HTML-special character, so `%%sup 2%%` text inside a table
> cell survives `escapeHtml()` unchanged and is correctly converted in Step 0.55 below.
> See [#592](https://github.com/jwilleke/ngdpbase/issues/592) for the ordering fix history.

---

### Step 0.55 — Inline Style Conversion (after Phase 2.5)

**Source**: `src/parsers/MarkupParser.ts` → `parseWithDOMExtraction()` after the Phase 2.5 block

Converts inline JSPWiki style markers to HTML. Runs **after** Phase 2.5 so these patterns are preserved through `escapeHtml()` in table cells.

| Pattern | Output | Notes |
|---|---|---|
| `%%sup content /%` or `%%sup content%%` | `<sup>content</sup>` | Superscript |
| `%%sub content /%` or `%%sub content%%` | `<sub>content</sub>` | Subscript |
| `%%strike content /%` or `%%strike content%%` | `<del>content</del>` | Strikethrough |

After conversion, any remaining `%%sup2%%`-style pattern (compact form with no space — malformed syntax) triggers a `<!-- VALIDATION WARNING [markup-syntax]: … -->` HTML comment. Correct syntax requires a space: `%%sup 2%%` or `%%sup 2 /%`.

> **TODO**: Once [#596](https://github.com/jwilleke/ngdpbase/issues/596) wires `filterChain.execute()`, move this warning to `ValidationFilter.validateMarkupSyntax()`.

---

### Phase 2.6 — Other Registered Handlers

All handlers except `JSPWikiPreprocessor` run here in priority order. Because JSPWiki syntax was already extracted in Phase 1 (replaced with UUID placeholders), built-in handlers (PluginSyntaxHandler etc.) are effectively no-ops on this content. Custom addon handlers with their own patterns run here.

---

### Phase 3 — Showdown Markdown Conversion

**Source**: `RenderingManager.converter.makeHtml(preprocessed)`

Showdown converts the preprocessed string (which now contains table HTML, inline style HTML, and UUID placeholder spans) to final HTML. Showdown configuration:

```javascript
{
  tables: true,
  strikethrough: true,
  tasklists: true,
  simpleLineBreaks: false,
  ghCodeBlocks: true,
  ghHeaderIds: true
}
```

---

### Phase 4 — DOM Placeholder Restoration

After Showdown runs, UUID placeholder spans (`<span data-jspwiki-placeholder="uuid-N">`) are replaced with the rendered HTML from the WikiDocument DOM nodes created in Phase 2. This is where plugin output, variable values, code blocks, and style block HTML are injected into the final document.

---

### FilterChain — ⚠️ Not Currently Executing

**Source**: `src/parsers/MarkupParser.ts` → `this.filterChain`

Three filters are registered and initialized:

| Filter | Config key | Default |
|---|---|---|
| `SecurityFilter` | `ngdpbase.markup.filters.security.enabled` | `false` |
| `SpamFilter` | `ngdpbase.markup.filters.spam.enabled` | `false` |
| `ValidationFilter` | `ngdpbase.markup.filters.validation.enabled` | `true` |

**However, `filterChain.execute()` is never called** in `parse()` or `parseWithDOMExtraction()`. All three filters are dead code in the current production path.

This means:

- `ValidationFilter.validateMarkupSyntax()` does not run
- `<!-- VALIDATION WARNING -->` injection via `ValidationFilter` does not fire
- `SecurityFilter` HTML sanitization does not run
- `SpamFilter` link detection does not run

**Tracked in**: [#596 — FilterChain configured but filterChain.execute() never called](https://github.com/jwilleke/ngdpbase/issues/596)

---

## Caching

`MarkupParser.parse()` checks and populates a parse-result cache before calling `parseWithDOMExtraction()`:

```
cache key = hash(content + context)
cache TTL = ngdpbase.markup.cache-ttl (default: 300s)
```

Cache hits skip the entire pipeline and return stored HTML directly.

---

## Configuration

Key config properties controlling the rendering pipeline:

| Property | Default | Effect |
|---|---|---|
| `ngdpbase.markup.enabled` | `true` | Enable MarkupParser; falls back to basic Showdown if false |
| `ngdpbase.markup.caching` | `true` | Enable parse-result caching |
| `ngdpbase.markup.cache-ttl` | `300` | Cache TTL in seconds |
| `ngdpbase.markup.filters.enabled` | `true` | Global filter switch (has no effect until #596 is fixed) |
| `ngdpbase.markup.filters.validation.enabled` | `true` | Enable ValidationFilter (has no effect until #596 is fixed) |
| `ngdpbase.markup.filters.security.enabled` | `false` | Enable SecurityFilter (has no effect until #596 is fixed) |
| `ngdpbase.markup.filters.spam.enabled` | `false` | Enable SpamFilter (has no effect until #596 is fixed) |

---

## Key Source Files

| File | Role |
|---|---|
| `src/parsers/MarkupParser.ts` | Pipeline orchestration — `parse()`, `parseWithDOMExtraction()`, `extractJSPWikiSyntax()` |
| `src/parsers/handlers/JSPWikiPreprocessor.ts` | Table and style-block conversion (Phase 2.5) |
| `src/parsers/dom/WikiDocument.ts` | DOM node container for extracted elements |
| `src/parsers/filters/ValidationFilter.ts` | Markup validation (wired but not called — #596) |
| `src/parsers/filters/SecurityFilter.ts` | HTML sanitization (wired but not called — #596) |
| `src/managers/RenderingManager.ts` | Entry point — calls `MarkupParser.parse()`, holds Showdown converter |
| `src/routes/WikiRoutes.ts` | HTTP layer — `viewPage()` triggers rendering |

---

## See Also

- [Current-Save-Page-Pipeline.md](./Current-Save-Page-Pipeline.md) — How pages are written to disk
- [JSPWikiPreprocessor.md](./JSPWikiPreprocessor.md) — Table and style-block handler detail
- [WikiDocument-DOM-Architecture.md](./WikiDocument-DOM-Architecture.md) — WikiDocument design
- [RenderingManager Complete Guide](../managers/RenderingManager-Complete-Guide.md)
- [Issue #596](https://github.com/jwilleke/ngdpbase/issues/596) — FilterChain not wired
- [Issue #592](https://github.com/jwilleke/ngdpbase/issues/592) — Table inline style fix (Step 0.55 ordering)
