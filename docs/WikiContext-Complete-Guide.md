# WikiContext Complete Guide

**Version:** 1.1.0
**Last Updated:** 2026-02-27
**Status:** Production Ready
**Source:** `src/context/WikiContext.ts`

This guide covers everything about WikiContext in amdWiki — its purpose, TypeScript API, usage patterns, and role as the central rendering orchestrator.

---

## Table of Contents

1. [Overview](#overview)
2. [What is WikiContext?](#what-is-wikicontext)
3. [Why WikiContext Exists](#why-wikicontext-exists)
4. [WikiContext Class API](#wikicontext-class-api)
5. [Architecture](#architecture)
6. [Usage Examples](#usage-examples)
7. [Integration with Managers](#integration-with-managers)
8. [Testing](#testing)
9. [Performance](#performance)
10. [Migration Guide](#migration-guide)
11. [Troubleshooting](#troubleshooting)
12. [Related Documentation](#related-documentation)

---

## Overview

**`WikiContext` is the central orchestrator for content rendering in amdWiki.** For each page request, a `WikiContext` instance is created to act as a request-scoped container, bundling all information related to the request — page details, user info, HTTP request, and manager references.

Inspired by JSPWiki's architectural patterns, `WikiContext` solves "parameter explosion" by providing a single, consistent object to the upper levels of the application, while keeping lower-level components decoupled and reusable.

### Key Features

- **Request-scoped container** for all contextual information
- **Orchestration**: manages the rendering pipeline (variable expansion, plugin execution, Markdown → HTML)
- **Decoupling**: passes a plain `pageContext` data object to lower-level systems via `toParseOptions()` — parsers and plugins do not depend on `WikiContext` itself
- **Manager access**: holds direct references to all core engine managers
- **Single source of truth**: all user and page context flows through one object
- **Fallback handling**: graceful degradation when managers are unavailable
- **JSPWiki compatibility**: follows JSPWiki's proven architectural patterns

### Implementation Status

| Component | Status | Tests |
|---|---|---|
| **WikiContext class** (`src/context/WikiContext.ts`) | ✅ Production | 12/12 |
| **Route integration** (`src/routes/WikiRoutes.ts`) | ✅ Active | All routes |
| **Manager method migration** | 🔄 In Progress | `savePageWithContext()` done; new managers start with WikiContext |

---

## What is WikiContext?

WikiContext is a request-scoped object that encapsulates everything needed for rendering a wiki page.

### Core Concept

Instead of passing multiple parameters through the rendering pipeline, WikiContext provides one object containing:

- **Page information** (`pageName`, `content`)
- **User context** (`userContext` — authentication, roles, session)
- **Request details** (`request`, `response`)
- **Manager references** (`pageManager`, `renderingManager`, `pluginManager`, `variableManager`, `aclManager`)
- **Rendering context type** (`WikiContext.CONTEXT.VIEW`, `EDIT`, `PREVIEW`, etc.)

### JSPWiki Inspiration

```typescript
// JSPWiki (Java concept → amdWiki TypeScript)
class WikiContext {
  constructor(engine: WikiEngine, options: WikiContextOptions) {
    this.engine = engine;
    this.context = options.context ?? WikiContext.CONTEXT.NONE;
    this.pageName = options.pageName ?? null;
    this.userContext = options.userContext ?? null;
    this.request = options.request ?? null;

    // Manager references resolved at construction time
    this.pageManager = engine.getManager<PageManager>('PageManager')!;
    this.renderingManager = engine.getManager<RenderingManager>('RenderingManager')!;
    this.pluginManager = engine.getManager<PluginManager>('PluginManager')!;
    this.variableManager = engine.getManager<VariableManager>('VariableManager')!;
    this.aclManager = engine.getManager<ACLManager>('ACLManager')!;
  }
}
```

---

## Why WikiContext Exists

### The Problem: Parameter Explosion

Before WikiContext, rendering required many parameters:

```typescript
// OLD: Parameter explosion
async function renderMarkdown(
  content: string,
  pageName: string,
  userName: string,
  userRoles: string[],
  requestIp: string,
  sessionId: string,
  // ... 10+ more parameters
): Promise<string> { ... }
```

### The Solution: Context Object Pattern

```typescript
// NEW: Single context object
const wikiContext = this.createWikiContext(req, {
  context: WikiContext.CONTEXT.VIEW,
  pageName,
  content,
});

const html = await wikiContext.renderMarkdown();
```

**Benefits:**

1. Cleaner APIs — single parameter instead of many
2. Easier testing — mock one object
3. Better maintainability — add new context without changing signatures
4. JSPWiki compatibility
5. Type safety — single typed object

### Architectural Role

```
HTTP Request
    ↓
WikiRoutes.createWikiContext(req, options)   ← ALWAYS use this helper
    ↓
WikiContext.renderMarkdown()                 ← ORCHESTRATOR
    ↓
├─ RenderingManager.getParser()
│  └─ MarkupParser.parse(content, toParseOptions())
│     └─ WikiDocument DOM operations
├─ VariableManager.expandVariables()
├─ PluginManager.execute()
└─ (returns HTML)
    ↓
WikiRoutes.getTemplateDataFromContext()      ← ALWAYS use for template data
    ↓
res.render(template, templateData)
```

---

## WikiContext Class API

### TypeScript Interfaces

```typescript
// src/context/WikiContext.ts

export interface UserContext {
  username?: string;
  displayName?: string;
  roles?: string[];
  authenticated?: boolean;        // Use this — NOT isAuthenticated
  preferences?: UserPreferences;
  locale?: string;
  timezone?: string;
  [key: string]: unknown;         // Allows extension
}

// Note: req.userContext set by session middleware also carries
// isAuthenticated: true as a runtime alias. Use userContext.authenticated
// when writing typed TypeScript against the UserContext interface.

export interface WikiContextOptions {
  context?: string;               // WikiContext.CONTEXT.VIEW etc.
  pageName?: string;
  content?: string;
  userContext?: UserContext;
  request?: Request;
  response?: Response;
}

export interface RequestInfo {
  acceptLanguage?: string;
  userAgent?: string;
  clientIp?: string;
  referer?: string;
  sessionId?: string;
  query?: Record<string, string>;
}

export interface PageContext {
  pageName: string | null;
  userContext: UserContext | null;
  requestInfo: RequestInfo;
}

export interface ParseOptions {
  pageContext: PageContext;
  engine: WikiEngine;
}
```

### Constructor

**In route handlers, always use `this.createWikiContext()` — not the constructor directly.**

```typescript
// ✅ Correct — always use the factory in WikiRoutes
const wikiContext = this.createWikiContext(req, {
  context: WikiContext.CONTEXT.VIEW,
  pageName,
  content,
});

// ✅ Also correct — direct construction for tests or non-route code
const wikiContext = new WikiContext(engine, {
  context: WikiContext.CONTEXT.VIEW,
  pageName: 'Main',
  userContext: { username: 'admin', authenticated: true, roles: ['admin'] },
  request: req,
  response: res,
});
```

`createWikiContext()` (`src/routes/WikiRoutes.ts:132`) populates `userContext` from `req.userContext` (set by session middleware) automatically.

**Throws:** `Error` if `engine` is not provided.

### Context Type Constants

```typescript
WikiContext.CONTEXT = {
  VIEW:    'view',     // Viewing a page
  EDIT:    'edit',     // Editing a page
  PREVIEW: 'preview',  // Previewing changes
  DIFF:    'diff',     // Viewing diff
  INFO:    'info',     // Viewing page info/metadata
  NONE:    'none'      // No specific context
};
```

### Instance Properties

All properties are **`readonly`** — `WikiContext` is immutable after construction.

```typescript
// Core
wikiContext.engine          // WikiEngine
wikiContext.context         // string — context type ('view', 'edit', ...)
wikiContext.pageName        // string | null
wikiContext.content         // string | null
wikiContext.userContext     // UserContext | null
wikiContext.request         // Request | null
wikiContext.response        // Response | null

// Manager shortcuts (resolved at construction)
wikiContext.pageManager         // PageManager
wikiContext.renderingManager    // RenderingManager
wikiContext.pluginManager       // PluginManager
wikiContext.variableManager     // VariableManager
wikiContext.aclManager          // ACLManager
```

> **Immutability note**: all properties are `readonly`. If you need a different `pageName` with the same user context (e.g. in MediaManager), construct a new instance:
>
> ```typescript
> const linkedPageContext = new WikiContext(this.engine, {
>   context: WikiContext.CONTEXT.VIEW,
>   pageName: linkedPageName,
>   userContext: wikiContext.userContext ?? undefined,
>   request: wikiContext.request ?? undefined,
> });
> ```

### Methods

#### `getContext(): string`

Returns the current rendering context type.

```typescript
if (wikiContext.getContext() === WikiContext.CONTEXT.EDIT) {
  // Show edit-specific UI
}
```

#### `async renderMarkdown(content?): Promise<string>`

Renders markdown content through the full rendering pipeline.

```typescript
// Render stored content
const html = await wikiContext.renderMarkdown();

// Render explicit content
const html = await wikiContext.renderMarkdown('# Custom Content [{$pagename}]');
```

**Processing pipeline:**

1. **MarkupParser** (primary) — WikiDocument DOM, variables, plugins, links
2. **Showdown fallback** (if parser unavailable) — variables expanded, basic Markdown

#### `toParseOptions(): ParseOptions`

Creates the plain object passed to `MarkupParser.parse()`. Decouples the parser from `WikiContext` — the parser only sees `{ pageContext, engine }`.

```typescript
const options = wikiContext.toParseOptions();
// {
//   pageContext: { pageName, userContext, requestInfo: { ... } },
//   engine: WikiEngine
// }
const html = await parser.parse(content, options);
```

---

## Architecture

### File Structure

```
src/
├── context/
│   ├── WikiContext.ts                 # Main WikiContext class (~390 lines)
│   └── __tests__/
│       └── WikiContext.test.js        # Unit tests (12 tests)
│
├── routes/
│   └── WikiRoutes.ts                  # createWikiContext() factory + route handlers
│
└── managers/
    ├── RenderingManager.ts            # Accessed via WikiContext
    ├── VariableManager.ts             # Accessed via WikiContext
    └── PluginManager.ts               # Accessed via WikiContext
```

### Rendering Pipeline

```
┌─────────────────────────────────────────────────────┐
│  HTTP Request (GET /wiki/PageName)                  │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│  WikiRoutes handler                                  │
│  • Load page content from PageManager               │
│  • wikiContext = this.createWikiContext(req, opts)  │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│  WikiContext.renderMarkdown()                        │
│  • RenderingManager.getParser()                     │
│  • parser.parse(content, this.toParseOptions())     │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│  MarkupParser.parse(content, options)                │
│  • Phase 1: Extract JSPWiki syntax                  │
│  • Phase 2: Create WikiDocument DOM nodes           │
│  • Showdown markdown conversion                     │
│  • Phase 3: Merge DOM nodes → HTML                  │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│  WikiRoutes handler (continued)                      │
│  • templateData = this.getTemplateDataFromContext() │
│  • res.render('template', { ...templateData, ... }) │
└─────────────────────────────────────────────────────┘
```

### Architectural Note: Decoupling via toParseOptions()

`WikiContext` does **not** pass itself to lower-level systems. It passes a plain object:

```
WikiContext → toParseOptions() → { pageContext, engine } → MarkupParser → plugins/variables
```

This means plugins and variable handlers depend only on the plain `pageContext` data structure, not on `WikiContext` — making them independently testable and reusable.

---

## Usage Examples

### Example 1: Standard Page View (route handler)

```typescript
// src/routes/WikiRoutes.ts — pattern used throughout
async viewPage(req: Request, res: Response): Promise<void> {
  const pageName = req.params.pageName as string;

  // ✅ Always use createWikiContext() in route handlers
  const wikiContext = this.createWikiContext(req, {
    context: WikiContext.CONTEXT.VIEW,
    pageName,
  });

  const page = await wikiContext.pageManager.getPage(pageName);
  const html = await wikiContext.renderMarkdown(page?.content ?? '');

  // ✅ Always use getTemplateDataFromContext() for template data
  const templateData = this.getTemplateDataFromContext(wikiContext);
  res.render('wiki-view', {
    ...templateData,
    content: html,
  });
}
```

### Example 2: Save Page (passing WikiContext to manager)

```typescript
async savePage(req: Request, res: Response): Promise<void> {
  const { pageName, content } = req.body as { pageName: string; content: string };

  const wikiContext = this.createWikiContext(req, {
    context: WikiContext.CONTEXT.EDIT,
    pageName,
    content,
  });

  const pageManager = this.engine.getManager<PageManager>('PageManager');
  // savePageWithContext() receives WikiContext — manager derives user from it
  await pageManager.savePageWithContext(wikiContext, { category: 'general' });

  res.redirect(`/wiki/${encodeURIComponent(pageName)}`);
}
```

### Example 3: Access control check

```typescript
// Private page guard using ACLManager (note: authenticated field, not isAuthenticated)
function checkPrivatePageAccess(wikiContext: WikiContext): boolean {
  const index = wikiContext.pageObject?.metadata?.['index-entry'] as PageIndexEntry | undefined;
  if (index?.location !== 'private') return true;
  if (!wikiContext.userContext?.authenticated) return false;
  if (wikiContext.userContext.roles?.includes('admin')) return true;
  return wikiContext.userContext.username === index.owner;
}

// In route handler:
const wikiContext = this.createWikiContext(req, { pageName });
if (!checkPrivatePageAccess(wikiContext)) {
  return res.status(403).render('error', { code: 403 });
}
```

### Example 4: Page Preview

```typescript
async previewPage(req: Request, res: Response): Promise<void> {
  const { pageName, content } = req.body as { pageName: string; content: string };

  const wikiContext = this.createWikiContext(req, {
    context: WikiContext.CONTEXT.PREVIEW,
    pageName,
    content,
  });

  const html = await wikiContext.renderMarkdown(content);
  res.json({ success: true, html });
}
```

### Example 5: Testing with Mock Context

```typescript
// In tests — direct construction (no req available in tests)
const mockEngine = {
  getManager: jest.fn((name: string) => {
    if (name === 'RenderingManager') return mockRenderingManager;
    if (name === 'VariableManager') return mockVariableManager;
    if (name === 'PageManager') return mockPageManager;
    if (name === 'PluginManager') return mockPluginManager;
    if (name === 'ACLManager') return mockAclManager;
    return null;
  }),
};

const wikiContext = new WikiContext(mockEngine as unknown as WikiEngine, {
  pageName: 'TestPage',
  content: 'Welcome to [{$pagename}]',
  userContext: { username: 'testuser', authenticated: true, roles: ['user'] },
});

const html = await wikiContext.renderMarkdown();
expect(html).toContain('Welcome to TestPage');
```

### Example 6: toParseOptions() — custom parsing

```typescript
const wikiContext = new WikiContext(engine, {
  pageName: 'Main',
  userContext: { username: 'admin', authenticated: true },
  request: req,
});

const options = wikiContext.toParseOptions();
// {
//   pageContext: {
//     pageName: 'Main',
//     userContext: { username: 'admin', authenticated: true },
//     requestInfo: { clientIp: '...', sessionId: '...', ... }
//   },
//   engine: WikiEngine
// }

const parser = wikiContext.renderingManager.getParser();
if (parser) {
  const html = await parser.parse(content, options as unknown as Record<string, unknown>);
}
```

---

## Integration with Managers

### PageManager

```typescript
// Page access via WikiContext reference
const page = await wikiContext.pageManager.getPage(wikiContext.pageName!);

// Save with full context (manager derives author from wikiContext.userContext)
await wikiContext.pageManager.savePageWithContext(wikiContext, metadata);
```

### VariableManager

```typescript
// Manual variable expansion (renderMarkdown() does this automatically)
const expanded = wikiContext.variableManager.expandVariables(
  'User [{$username}] on [{$pagename}]',
  wikiContext.toParseOptions().pageContext
);
// "User john on Main"
```

### PluginManager

```typescript
if (wikiContext.pluginManager.hasPlugin('TableOfContents')) {
  // Plugin available
}
```

### RenderingManager

```typescript
const parser = wikiContext.renderingManager.getParser();
if (parser) {
  const html = await parser.parse(content, wikiContext.toParseOptions() as unknown as Record<string, unknown>);
}
```

### ACLManager

```typescript
// checkPagePermissionWithContext() takes a WikiContext directly
const canEdit = await wikiContext.aclManager.checkPagePermissionWithContext(
  wikiContext,   // ← pass WikiContext, not separate (userContext, pageName)
  'edit'
);

if (!canEdit) {
  return res.status(403).render('error', { code: 403 });
}
```

---

## Testing

### Test Coverage

| Category | Tests | Status |
|---|---|---|
| Constructor | 3 | ✅ 100% |
| `getContext()` | 2 | ✅ 100% |
| `renderMarkdown()` | 4 | ✅ 100% |
| `toParseOptions()` | 2 | ✅ 100% |
| Context constants | 1 | ✅ 100% |
| **Total** | **12** | **✅ 100%** |

### Running Tests

```bash
npm test -- WikiContext.test.js --verbose
npm test -- WikiContext.test.js --coverage
```

### Mock Setup

```typescript
const mockEngine = {
  getManager: jest.fn((name: string) => ({
    RenderingManager: { getParser: jest.fn(() => ({ parse: jest.fn().mockResolvedValue('<p>html</p>') })) },
    VariableManager: { expandVariables: jest.fn((s: string) => s) },
    PageManager: { getPage: jest.fn(), savePageWithContext: jest.fn() },
    PluginManager: { hasPlugin: jest.fn(() => false) },
    ACLManager: { checkPagePermissionWithContext: jest.fn().mockResolvedValue(true) },
  }[name] ?? null)),
};

const wikiContext = new WikiContext(mockEngine as unknown as WikiEngine, {
  pageName: 'TestPage',
  content: 'Test content',
  userContext: { username: 'testuser', authenticated: true },
});
```

---

## Performance

| Operation | Notes |
|---|---|
| Create WikiContext | Very fast — manager references are cheap pointer assignments |
| `getContext()` | Simple property access |
| `toParseOptions()` | Object construction (~0.1ms) |
| `renderMarkdown()` | Depends on parser and content (20–30ms typical) |

**Key:** `WikiContext` is created once per request. Manager references are stored as pointers — no copying. Always create one instance per request and reuse it for multiple operations within that request.

```typescript
// ✅ One context, multiple operations
const wikiContext = this.createWikiContext(req, { pageName });
const html = await wikiContext.renderMarkdown(pageContent);
const leftMenuHtml = await wikiContext.renderMarkdown(leftMenuContent);
```

---

## Migration Guide

### From inline regex processing

```typescript
// Before
function renderMarkdown(content: string, pageName: string): string {
  let result = content.replace(/\[\{\$pagename\}\]/g, pageName);
  return converter.makeHtml(result);
}

// After
const wikiContext = this.createWikiContext(req, { pageName, content });
const html = await wikiContext.renderMarkdown();
```

### From legacy RenderingManager calls

```typescript
// Before
const html = await renderingManager.renderMarkdown(content, pageName, userContext, requestInfo);

// After
const wikiContext = this.createWikiContext(req, { pageName, content });
const html = await wikiContext.renderMarkdown();
```

### Passing context to managers (migration in progress)

```typescript
// Current hybrid approach (acceptable while migration is in progress)
const wikiContext = this.createWikiContext(req, { context: WikiContext.CONTEXT.EDIT, pageName, content });
const currentUser = wikiContext.userContext;
const metadata = { ...otherMetadata, author: currentUser?.username ?? 'anonymous' };
await pageManager.savePage(pageName, content, metadata);  // old signature

// Target pattern (use where manager supports it)
await pageManager.savePageWithContext(wikiContext, metadata);  // WikiContext-aware
```

When refactoring existing code, add a `// TODO: use savePageWithContext(wikiContext)` comment to mark legacy call sites.

---

## Troubleshooting

### "WikiContext requires a valid WikiEngine instance"

`engine` was `null` or `undefined`. Ensure WikiEngine is fully initialized before constructing.

### Fallback renderer always used ("Using fallback renderer" in logs)

MarkupParser not initialized. Check:

```typescript
const parser = engine.getManager('MarkupParser');
console.log('Parser available:', !!parser, 'initialized:', parser?.isInitialized());
```

### Variables not expanded (`[{$pagename}]` appears literally)

VariableManager not available:

```typescript
console.log('VariableManager:', !!wikiContext.variableManager);
```

### Request info missing from `toParseOptions()`

Must pass `request: req` in options:

```typescript
const wikiContext = this.createWikiContext(req, { pageName, request: req });
// or: new WikiContext(engine, { ..., request: req })
```

### `userContext.isAuthenticated` is `undefined` in typed code

The typed `UserContext` interface uses `authenticated?: boolean`. The `isAuthenticated` alias is set by the session middleware at runtime on `req.userContext`. In typed TypeScript, use:

```typescript
if (wikiContext.userContext?.authenticated) { ... }
```

---

## Related Documentation

- [WikiContext.md](WikiContext.md) — original shorter reference
- [CONTRIBUTING.md](../CONTRIBUTING.md#wikicontext---single-source-of-truth) — contributing guidelines for WikiContext usage
- [docs/architecture/Current-Rendering-Pipeline.md](architecture/Current-Rendering-Pipeline.md) — rendering pipeline detail
- [ARCHITECTURE.md](../ARCHITECTURE.md) — overall amdWiki architecture
- [docs/WikiDocument-Complete-Guide.md](WikiDocument-Complete-Guide.md) — WikiDocument (used internally by MarkupParser)

### Relationship with WikiDocument

| | WikiContext | WikiDocument |
|---|---|---|
| File | `src/context/WikiContext.ts` | `src/parsers/dom/WikiDocument.ts` |
| Scope | Request-scoped | Created during parse phase only |
| Role | Orchestrator — holds all context | Internal DOM for parsed content |
| Lifetime | Full HTTP request | Within `MarkupParser.parse()` call |
| Created by | `WikiRoutes.createWikiContext()` | `MarkupParser` internally |

### Related Issues

- Issue #67 — Create WikiContext Class ✅
- Issue #66 — \[EPIC\] Implement WikiContext and Manager ✅
- Issue #132 — Refactor to use WikiContext as Single Source of Truth ✅
- Issue #68 — Integrate VariableManager.js into WikiContext ✅
- Issue #71 — Refactor Rendering Pipeline in app.js ✅

---

**Last Updated:** 2026-02-27
**Maintained By:** amdWiki Development Team
