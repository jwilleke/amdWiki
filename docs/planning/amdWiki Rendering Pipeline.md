# Overview of the Rendering Pipeline for amdWiki

amdWiki is a Node.js-based, file-based wiki application inspired by JSPWiki, using Markdown for page storage and Express.js for server-side handling. It supports JSPWiki-style syntax (e.g., `[Link Text|PageName]` for links, `[{Image src='image.jpg'}]` for plugins) alongside Markdown. The rendering pipeline is primarily **server-side**, processing raw Markdown/wiki markup into HTML through a sophisticated 7-phase MarkupParser system, embedding it in EJS templates, and serving styled responses to the browser.

The pipeline is triggered per HTTP request (e.g., GET `/wiki/Main`), orchestrated by Express middleware and routes through the WikiEngine manager architecture. It integrates authentication, access control (via JSON policies), and auditing. The core rendering is handled by RenderingManager which can operate in two modes:

1. **Advanced Parser Mode** (default): Uses the MarkupParser with a 7-phase processing pipeline for comprehensive JSPWiki syntax support
2. **Legacy Parser Mode** (fallback): Original implementation for backward compatibility

Client-side enhancements (e.g., Bootstrap JS for interactivity) are minimal, with static assets served from `/public/`. Below is a step-by-step explanation of the rendering pipeline, based on the project's architecture (Node.js/Express, WikiEngine managers, MarkupParser, Showdown, EJS templating).

## Steps in the Rendering Pipeline

### Phase 1. **HTTP Request Handling**
- An incoming request (e.g., `GET /wiki/Main`) is received by the Express app in `src/routes/` (e.g., a wiki route handler like `wikiRouter.js`).
- Middleware processes the request: authentication (three-state system: anonymous, user, admin), policy-based access control (checks JSON config in `/config/` for permissions), and audit logging (records access in `/logs/` or `/data/`).
- If authorized, extracts parameters (e.g., page name `Main`, action `view`).
- Fact: Routes delegate to core logic in `src/core/` or `src/managers/`, ensuring security before rendering.

### Phase 2. **Page Content Retrieval**
- The route handler uses a manager (e.g., `PageManager` in `src/managers/`) to fetch the raw page file from `/pages/` (Markdown `.md` files, e.g., `Main.md`).
- Loads metadata (e.g., categories, keywords) from file headers or a separate JSON store in `/data/`.
- Checks for existence; if missing, generates a "red link" or creation prompt.
- Supports attachments (e.g., images in `/attachments/`) via upload handling.
- Fact: Storage is file-based (no database), with optional archiving to `/archive/`.

### Phase 3. **Content Rendering (Advanced Parser or Legacy)**
The RenderingManager routes content through either the Advanced Parser (MarkupParser) or Legacy Parser based on configuration.

#### Advanced Parser Mode (Default) - 7-Phase MarkupParser Pipeline

**Phase 3a: Preprocessing** (`src/parsers/MarkupParser.js:phasePreprocessing`)
- Handles JSPWiki double-bracket escaping: `[[{syntax}]` → `[{syntax}]` via EscapedSyntaxHandler
- Converts JSPWiki code blocks `{{{code}}}` to Markdown ``` format
- Protects code blocks and inline code from subsequent handlers using placeholders
- Normalizes line endings and whitespace
- Location: RenderingManager.js:99-121, MarkupParser.js:702-750

**Phase 3b: Syntax Recognition** (`MarkupParser.js:phaseSyntaxRecognition`)
- Identifies and tokenizes markup patterns (currently pass-through, handlers do pattern matching)
- Creates syntax token registry for tracking
- Location: MarkupParser.js:756-761

**Phase 3c: Context Resolution** (`MarkupParser.js:phaseContextResolution`)
- Expands system variables via VariableManager: `[{$pagename}]`, `[{$username}]`, `[{$totalpages}]`, etc.
- Resolves user context and authentication variables
- Location: MarkupParser.js:767-776

**Phase 3d: Content Transformation** (`MarkupParser.js:phaseContentTransformation`)
- Executes syntax handlers in priority-resolved order via HandlerRegistry:
  - **PluginSyntaxHandler** (priority 90): Processes `[{PluginName params}]` via PluginManager
  - **WikiTagHandler** (priority 95): Handles `<wiki:Include>`, `<wiki:InsertPage>` tags
  - **WikiFormHandler** (priority 85): Processes form elements and input handlers
  - **AttachmentHandler** (priority 75): Processes attachment references and thumbnails
  - **WikiStyleHandler** (priority 70): Handles `%%styles%%` and CSS class application
  - **LinkParserHandler** (priority 50): Unified link processing for wiki links, InterWiki, and external links
- Protects generated HTML from markdown encoding
- Location: MarkupParser.js:782-807, HandlerRegistry in src/parsers/handlers/

**Phase 3e: Filter Pipeline** (`MarkupParser.js:phaseFilterPipeline`)
- Applies content filters if enabled (configurable via `amdwiki.markup.filters.enabled`):
  - **SecurityFilter**: XSS prevention, HTML sanitization
  - **SpamFilter**: Spam link detection and blocking
  - **ValidationFilter**: Content validation and compliance checks
- Location: MarkupParser.js:813-826, FilterChain in src/parsers/filters/

**Phase 3f: Markdown Conversion** (`MarkupParser.js:phaseMarkdownConversion`)
- Restores protected code blocks before Showdown processing
- Converts markdown to HTML using Showdown converter with options:
  - Tables support enabled
  - Strikethrough enabled
  - Task lists enabled
  - Simple line breaks enabled
- Showdown handles all standard markdown: code blocks, links, lists, tables, headings, etc.
- Location: MarkupParser.js:833-850, RenderingManager.js:24-32

**Phase 3g: Post-processing** (`MarkupParser.js:phasePostProcessing`)
- Restores protected HTML blocks from Phase 3d
- Applies table classes from WikiStyleHandler `%%TABLE_CLASSES{...}%%` markers
- Final HTML validation and cleanup
- Removes excessive whitespace while preserving code blocks
- Location: MarkupParser.js:856-872

#### Legacy Parser Mode (Fallback)
- Step 1: Expand macros via PluginManager (RenderingManager.js:482-640)
- Step 2: Process JSPWiki-style tables (RenderingManager.js:254-276)
- Step 3: Process wiki-style links (RenderingManager.js:837-918)
- Step 4: Convert to HTML via Showdown (RenderingManager.js:198)
- Step 5: Post-process tables with styling (RenderingManager.js:407-473)
- Used when: `amdwiki.markup.useAdvancedParser=false` or MarkupParser unavailable
- Location: RenderingManager.js:181-204

### Phase 4. **Template Rendering**
- The HTML fragment is passed to an EJS template in `/views/` via TemplateManager (e.g., `wiki-view.ejs` for view mode).
- The template wraps the content with layout elements: header (navigation, search bar), sidebar (categories/keywords), footer (audit info), and Bootstrap classes for styling.
- Includes static assets from `/public/` (e.g., `<link rel="stylesheet" href="/css/bootstrap.css">`).
- Supports user-specific customizations (e.g., via session data and WikiContext).
- Fact: EJS allows dynamic insertion (e.g., `<%= htmlContent %>`), with three-state auth influencing visible elements (e.g., edit button for logged-in users).
- Location: src/managers/TemplateManager.js, views/*.ejs

### Phase 5. **Response Serving and Caching**
- The rendered HTML is sent as the response with appropriate headers (e.g., `Content-Type: text/html`).
- **Advanced caching** via CacheManager with multiple strategies:
  - **Parse Results Cache**: Full content parsing results (TTL: 300s, configurable via `amdwiki.markup.cache.parseResults.ttl`)
  - **Handler Results Cache**: Individual handler outputs (TTL: 600s)
  - **Pattern Compilation Cache**: Pre-compiled regex patterns (TTL: 3600s)
  - **Variable Resolution Cache**: System variable lookups (TTL: 900s)
  - Cache regions managed by MarkupParser, integrated with CacheManager
  - Performance monitoring with cache hit ratio tracking and alerts
- For exports (e.g., to `/exports/`), ExportManager generates static HTML/PDF variants.
- Fact: Responses include Bootstrap JS for client-side interactivity (e.g., search filtering, image uploads).
- Location: src/parsers/MarkupParser.js:436-486 (caching), src/managers/ExportManager.js

### Key Components in the Pipeline

| Component              | Role in Pipeline                                                                 | Location in Repo                      |
|------------------------|----------------------------------------------------------------------------------|---------------------------------------|
| **WikiEngine**        | Central orchestrator, manages all managers and lifecycle                         | `src/WikiEngine.js`                   |
| **Express Routes**    | Handles requests, authentication, and delegates to managers.                     | `src/routes/WikiRoutes.js`            |
| **PageManager**       | Retrieves/saves Markdown files and metadata.                                     | `src/managers/PageManager.js`         |
| **RenderingManager**  | Orchestrates rendering, delegates to MarkupParser or legacy pipeline             | `src/managers/RenderingManager.js`    |
| **MarkupParser**      | 7-phase processing pipeline for JSPWiki syntax                                   | `src/parsers/MarkupParser.js`         |
| **HandlerRegistry**   | Manages syntax handlers with priority resolution                                 | `src/parsers/handlers/HandlerRegistry.js` |
| **Syntax Handlers**   | Process specific syntax types (plugins, links, forms, etc.)                      | `src/parsers/handlers/*Handler.js`    |
| **FilterChain**       | Security, spam, validation filters                                               | `src/parsers/filters/FilterChain.js`  |
| **VariableManager**   | Expands system variables like `[{$pagename}]`                                    | `src/managers/VariableManager.js`     |
| **PluginManager**     | Executes plugins like `[{Image}]`, `[{TableOfContents}]`                        | `src/managers/PluginManager.js`       |
| **Showdown**          | Converts Markdown to HTML                                                        | npm package (configured in RenderingManager) |
| **TemplateManager**   | Manages EJS templates and wraps HTML in layout                                   | `src/managers/TemplateManager.js`     |
| **EJS Templates**     | Wraps HTML in layout with Bootstrap styling                                      | `/views/*.ejs`                        |
| **CacheManager**      | Multi-strategy caching for parse results, handlers, patterns                     | `src/managers/CacheManager.js`        |
| **ACLManager**        | Validates permissions pre/post-rendering                                         | `src/managers/ACLManager.js`          |
| **PolicyEvaluator**   | Evaluates policy-based access control                                            | `src/managers/PolicyEvaluator.js`     |
| **UserManager**       | Three-tier authentication (Anonymous, Authenticated, Admin)                      | `src/managers/UserManager.js`         |
| **ExportManager**     | Generates HTML/PDF exports                                                       | `src/managers/ExportManager.js`       |

## Textual Diagram of the Pipeline

### Advanced Parser Mode (Default)
``` text
HTTP Request (e.g., GET /wiki/Main)
              ↓
Express Routes (src/routes/WikiRoutes.js) → Auth + ACL check
              ↓
PageManager (fetch Main.md from /pages/)
              ↓
RenderingManager.renderMarkdown() → delegates to MarkupParser
              ↓
┌─────────────────────────────────────────────────────────────┐
│ MarkupParser 7-Phase Pipeline                              │
├─────────────────────────────────────────────────────────────┤
│ Phase 1: Preprocessing                                      │
│   - EscapedSyntaxHandler (double-bracket escaping)          │
│   - Code block protection                                   │
│   - Normalize whitespace                                    │
├─────────────────────────────────────────────────────────────┤
│ Phase 2: Syntax Recognition                                 │
│   - Pattern tokenization                                    │
├─────────────────────────────────────────────────────────────┤
│ Phase 3: Context Resolution                                 │
│   - VariableManager (expand [{$variables}])                 │
├─────────────────────────────────────────────────────────────┤
│ Phase 4: Content Transformation                             │
│   - PluginSyntaxHandler → PluginManager                     │
│   - WikiTagHandler                                          │
│   - WikiFormHandler                                         │
│   - AttachmentHandler                                       │
│   - WikiStyleHandler                                        │
│   - LinkParserHandler (unified links)                       │
│   - Protect generated HTML                                  │
├─────────────────────────────────────────────────────────────┤
│ Phase 5: Filter Pipeline                                    │
│   - SecurityFilter (XSS prevention)                         │
│   - SpamFilter                                              │
│   - ValidationFilter                                        │
├─────────────────────────────────────────────────────────────┤
│ Phase 6: Markdown Conversion                                │
│   - Restore code blocks                                     │
│   - Showdown.makeHtml() (markdown → HTML)                   │
├─────────────────────────────────────────────────────────────┤
│ Phase 7: Post-processing                                    │
│   - Restore protected HTML                                  │
│   - Apply table classes                                     │
│   - HTML cleanup                                            │
└─────────────────────────────────────────────────────────────┘
              ↓
CacheManager (cache parse result with multi-strategy caching)
              ↓
TemplateManager → EJS Template (/views/wiki-view.ejs)
              ↓
Response (HTML to browser, audit log to /logs/)
```

### Legacy Parser Mode (Fallback)
``` text
HTTP Request (e.g., GET /wiki/Main)
              ↓
Express Routes → Auth + ACL check
              ↓
PageManager (fetch Main.md)
              ↓
RenderingManager.renderWithLegacyParser()
              ↓
Expand macros (PluginManager)
              ↓
Process JSPWiki tables
              ↓
Process wiki links
              ↓
Showdown.makeHtml() (markdown → HTML)
              ↓
Post-process tables (styling)
              ↓
TemplateManager → EJS Template
              ↓
Response
```

### Notes
- **Inspiration from JSPWiki**: amdWiki implements a manager-based architecture similar to JSPWiki (`WikiEngine`, `RenderingManager`, `PageManager`), with a 7-phase MarkupParser that mirrors JSPWiki's parsing pipeline while using Markdown as the base format.
- **Extensibility**:
  - Plugin system via PluginManager and PluginSyntaxHandler
  - Custom syntax handlers can be registered via HandlerRegistry
  - Modular filter chain for security and validation
  - Time-based permissions add dynamic rendering rules
  - Configuration-driven handler enabling/disabling
- **Performance**:
  - Multi-strategy caching via CacheManager (parse results, handlers, patterns, variables)
  - Performance monitoring with alert thresholds
  - Cache hit ratio tracking and metrics
  - Configurable TTLs for different cache strategies
  - File-based I/O with intelligent caching suitable for small-to-medium wikis
- **Configuration**:
  - Advanced parser mode: `amdwiki.markup.useAdvancedParser=true` (default)
  - Legacy fallback: `amdwiki.markup.fallbackToLegacy=true`
  - Individual handlers: `amdwiki.markup.handlers.[handler].enabled`
  - Filters: `amdwiki.markup.filters.enabled`
  - Cache strategies: `amdwiki.markup.cache.[strategy].enabled`
  - Performance monitoring: `amdwiki.markup.performance.monitoring`
- **Documentation**: See [PROJECT-STRUCTURE.md](https://github.com/jwilleke/amdWiki/blob/master/docs/architecture/PROJECT-STRUCTURE.md) and [ROADMAP.md](https://github.com/jwilleke/amdWiki/blob/master/docs/planning/ROADMAP.md) for deeper details.

This pipeline captures amdWiki's server-centric rendering with sophisticated JSPWiki-style processing. For code-level verification or customizations, refer to:
- `src/WikiEngine.js` - Manager initialization and orchestration
- `src/managers/RenderingManager.js` - Rendering orchestration and legacy parser
- `src/parsers/MarkupParser.js` - 7-phase advanced parsing pipeline
- `src/parsers/handlers/` - Syntax-specific handlers
- `src/parsers/filters/` - Content filtering
- `config/app-default-config.json` - Configuration options

## Rendering Pipeline Comparison

To compare the rendering pipelines of **amdWiki** (based on the GitHub repository [jwilleke/amdWiki](https://github.com/jwilleke/amdWiki)) and **JSPWiki** (version 2.12.x), we’ll analyze their processes for transforming raw content into HTML for browser display, focusing on their architecture, components, and functionality. Both are wiki engines, but amdWiki is a lightweight, Node.js-based application using Markdown and Express.js, while JSPWiki is a Java-based, servlet-driven system with a robust, extensible architecture. Below is a detailed comparison of their rendering pipelines, followed by pros and cons, grounded in their respective documentation and source code.

### Rendering Pipeline Comparison

#### JSPWiki Rendering Pipeline
JSPWiki’s pipeline is a server-side process orchestrated by the `WikiEngine`, leveraging a modular architecture with managers, a dedicated parser, and JSP templates. It handles JSPWiki-specific markup (e.g., `**bold**`, `[{CurrentTimePlugin}]`) and enhancements like WikiForms.

1. **HTTP Request Handling**:
   - **Component**: `WikiServlet` receives requests (e.g., `GET /wiki/Main`) in a servlet container (e.g., Tomcat).
   - **Process**: Initializes `WikiContext` (page: `Main`, mode: `VIEW`, user info) and delegates to `WikiEngine`.
   - **Details**: Uses `AuthenticationManager` for user authentication and `AclManager` for permissions.

2. **Page Content Retrieval**:
   - **Component**: `PageManager` with `PageProvider` (e.g., `FileSystemProvider`, `VersioningFileProvider`).
   - **Process**: Fetches raw markup (e.g., `Main.txt`) and metadata (`Main.properties`) from `jspwiki.pageProvider`-defined storage.
   - **Details**: Supports versioning; retrieves specific versions if requested (e.g., `?version=2`).

3. **Pre-Processing Filters**:
   - **Component**: `ModuleManager` applies `PageFilter` instances (`jspwiki.filters`, e.g., `SpamFilter`).
   - **Process**: Modifies raw markup before parsing (e.g., removes spam links).

4. **Parsing and Enhancement Processing**:
   - **Component**: `RenderingManager` with `JSPWikiMarkupParser` and `WikiRenderer`.
   - **Process**: Parses JSPWiki markup (e.g., `**bold**` → `<b>bold</b>`, `[{CurrentTimePlugin}]` → `2025-09-21 04:35:00 EDT`) into a `WikiDocument`. Handles enhancements (WikiPlugins, WikiVariables, WikiForms, JSPWikiStyles) via managers (`ModuleManager`, `VariableManager`).
   - **Details**: Uses Service Provider Interface (SPI) for custom parsers/renderers.

5. **Post-Processing Filters**:
   - **Component**: `ModuleManager` applies filters post-parsing (e.g., adds watermarks).
   - **Process**: Modifies HTML output.

6. **Template Rendering**:
   - **Component**: JSP templates (e.g., `/templates/default/view.jsp`) with `jspwiki.css`.
   - **Process**: Embeds parsed HTML, evaluates JSP tags (e.g., `<wiki:Include>`), applies styles from `jspwiki.skin`.
   - **Details**: Configurable via `jspwiki.templateDir`.

7. **Caching and Output**:
   - **Component**: `CacheManager` (Ehcache-based).
   - **Process**: Caches HTML fragments (`jspwiki.cache.expiryPeriod`); sends response via `WikiServlet`.
   - **Details**: Optimizes repeated views; dynamic content (e.g., WikiForms) may bypass caching.

#### amdWiki Rendering Pipeline
amdWiki's pipeline is built on Node.js with Express.js, using Markdown with comprehensive JSPWiki-style syntax support and EJS templates. It features a sophisticated 7-phase MarkupParser inspired by JSPWiki's architecture while maintaining lightweight deployment and file-based storage.

1. **HTTP Request Handling**:
   - **Component**: Express routes via `WikiRoutes` (`src/routes/WikiRoutes.js`).
   - **Process**: Receives requests (e.g., `GET /wiki/Main`), applies middleware for authentication (three-state: anonymous, authenticated, admin) via UserManager and policy-based access control via PolicyEvaluator.
   - **Details**: Logs audit trails; WikiContext object created for request tracking.

2. **Page Content Retrieval**:
   - **Component**: `PageManager` (in `src/managers/PageManager.js`).
   - **Process**: Loads Markdown file (e.g., `Main.md`) from `/pages/` or `/required-pages/` with YAML frontmatter metadata.
   - **Details**: File-based versioning via archiving to `/archive/`; attachments stored in `/attachments/`.

3. **Content Rendering - Advanced Parser Mode (Default)**:
   - **Component**: `RenderingManager` delegates to `MarkupParser` (7-phase pipeline).
   - **Process**:
     - **Phase 1**: Preprocessing - EscapedSyntaxHandler, code block protection, normalization
     - **Phase 2**: Syntax Recognition - Pattern tokenization
     - **Phase 3**: Context Resolution - VariableManager expands `[{$variables}]`
     - **Phase 4**: Content Transformation - Priority-ordered handlers (PluginSyntaxHandler, WikiTagHandler, WikiFormHandler, AttachmentHandler, WikiStyleHandler, LinkParserHandler)
     - **Phase 5**: Filter Pipeline - SecurityFilter, SpamFilter, ValidationFilter
     - **Phase 6**: Markdown Conversion - Showdown with tables, strikethrough, tasklists
     - **Phase 7**: Post-processing - HTML restoration, table class application, cleanup
   - **Details**: Configurable via `amdwiki.markup.*` settings; supports JSPWiki plugins, links, forms, styles, attachments.

4. **Content Rendering - Legacy Parser Mode (Fallback)**:
   - **Component**: `RenderingManager.renderWithLegacyParser()`.
   - **Process**: Expand macros → Process JSPWiki tables → Process wiki links → Showdown conversion → Post-process styling.
   - **Details**: Used when `amdwiki.markup.useAdvancedParser=false` or MarkupParser unavailable.

5. **Caching**:
   - **Component**: `CacheManager` with multi-strategy caching integrated in MarkupParser.
   - **Process**: Cache parse results (TTL: 300s), handler results (600s), patterns (3600s), variables (900s).
   - **Details**: Performance monitoring with cache hit ratio tracking and alerts.

6. **Template Rendering**:
   - **Component**: `TemplateManager` using EJS templates (`/views/wiki-view.ejs`).
   - **Process**: Wraps HTML with Bootstrap-based layout (header, sidebar, footer) from `/public/css/bootstrap.css`.
   - **Details**: Supports dynamic elements via EJS with WikiContext integration.

7. **Response Serving and Export**:
   - **Component**: Express response handling via WikiRoutes.
   - **Process**: Sends HTML response with caching headers; `ExportManager` generates HTML/PDF exports.
   - **Details**: Minimal client-side JS (Bootstrap); audit logging to `/logs/`.

### Comparison Table

| Aspect                    | JSPWiki Rendering Pipeline                          | amdWiki Rendering Pipeline                          |
|---------------------------|----------------------------------------------------|----------------------------------------------------|
| **Technology**            | Java, Servlet, JSP                                 | Node.js, Express, EJS                              |
| **Content Format**        | JSPWiki markup (e.g., `**bold**`, `[{Plugin}]`)    | Markdown + JSPWiki-style syntax (links, plugins, forms, styles) |
| **Core Controller**       | `WikiEngine` (singleton)                           | `WikiEngine` (manager-based architecture)          |
| **Context**               | `WikiContext` (page, mode, user)                   | `WikiContext` + `ParseContext` (page, user, request info) |
| **Storage**               | `PageProvider` (e.g., `FileSystemProvider`)        | File-based (`/pages/*.md`, `/required-pages/*.md`) with YAML frontmatter |
| **Parsing**               | `JSPWikiMarkupParser` (SPI-extensible)             | `MarkupParser` (7-phase pipeline with HandlerRegistry) |
| **Parser Phases**         | Single-pass with manager callbacks                 | 7-phase: Preprocessing, Syntax Recognition, Context Resolution, Content Transformation, Filter Pipeline, Markdown Conversion, Post-processing |
| **Enhancements**          | Plugins, Variables, Forms, Styles, Filters         | Plugins, Variables, Forms, Styles, WikiTags, Attachments via modular handlers |
| **Handler System**        | Manager-based (PluginManager, VariableManager)     | HandlerRegistry with priority-ordered execution (PluginSyntaxHandler, WikiTagHandler, WikiFormHandler, LinkParserHandler, WikiStyleHandler, AttachmentHandler) |
| **Filters**               | Pre/post via `PageFilter` (`jspwiki.filters`)      | FilterChain with SecurityFilter, SpamFilter, ValidationFilter |
| **Link Processing**       | JSPWikiMarkupParser built-in                       | Unified LinkParserHandler (wiki links, InterWiki, external) |
| **Variable Expansion**    | `VariableManager`                                  | `VariableManager` (Phase 3: Context Resolution)    |
| **Templating**            | JSP (`view.jsp`, `jspwiki.css`, skins)             | EJS via `TemplateManager` (`wiki-view.ejs`, Bootstrap CSS) |
| **Markdown Support**      | Via custom parsers (optional)                      | Native via Showdown (Phase 6) with JSPWiki enhancements |
| **Caching**               | `CacheManager` (Ehcache, configurable)             | `CacheManager` with multi-strategy caching (parse results, handlers, patterns, variables) |
| **Performance Monitoring**| Limited                                            | Built-in with alert thresholds (parse time, cache hit ratio, error rate) |
| **Configuration**         | `jspwiki.properties`                               | `app-default-config.json` + `app-custom-config.json` (hierarchical) |
| **Output**                | HTML via `WikiServlet`                             | HTML via Express response with audit logging       |

### Pros and Cons

#### JSPWiki Rendering Pipeline
**Pros**:
- **Modularity**: Manager-based architecture (`PageManager`, `ModuleManager`) with SPI allows easy extension (e.g., custom `WikiRenderer`, `PageProvider`).
- **Robust Enhancements**: Supports rich features (WikiPlugins, WikiForms, Variables, Styles, Filters) for dynamic content.
- **Versioning**: `VersioningFileProvider` enables page history and diffs, ideal for collaborative wikis.
- **Caching**: Ehcache-based `CacheManager` optimizes performance for high-traffic wikis.
- **Security**: Integrated `AuthenticationManager` and `AclManager` provide fine-grained access control.

**Cons**:
- **Complexity**: Heavyweight Java/servlet architecture requires more setup (e.g., Tomcat, `web.xml`) and resources.
- **Learning Curve**: Configuring `jspwiki.properties`, SPI, and JSP templates is complex for beginners.
- **Performance Overhead**: Multiple layers (managers, filters, JSP) add latency for small wikis.
- **Dependency**: Relies on servlet containers, less flexible for lightweight deployments.
- **Dynamic Content**: Plugins like `CurrentTimePlugin` require cache tuning to avoid stale outputs.

#### amdWiki Rendering Pipeline
**Pros**:
- **Modern Architecture**: Node.js/Express with manager-based WikiEngine architecture similar to JSPWiki but lighter-weight.
- **Sophisticated Parsing**: 7-phase MarkupParser with comprehensive JSPWiki syntax support (plugins, forms, styles, variables, WikiTags).
- **Handler System**: Extensible HandlerRegistry with priority-ordered execution and dependency resolution.
- **Markdown Native**: Uses Showdown for standard Markdown with JSPWiki enhancements, familiar to modern developers.
- **Advanced Caching**: Multi-strategy caching (parse results, handlers, patterns, variables) with performance monitoring.
- **Configuration-Driven**: Modular configuration system allowing fine-grained control of handlers, filters, and caching.
- **Filter Pipeline**: Security, spam, and validation filters integrated into parsing pipeline.
- **Performance Monitoring**: Built-in metrics tracking with alert thresholds for parse time, cache hit ratio, and error rates.
- **Bootstrap Integration**: Pre-styled with Bootstrap CSS/JS, providing responsive, modern UI out-of-the-box.
- **Dual-Mode Rendering**: Advanced parser with legacy fallback ensures backward compatibility.

**Cons**:
- **Versioning**: File-based archiving less sophisticated than JSPWiki's VersioningFileProvider (no diff, no version retrieval).
- **Maturity**: Handler system and plugin library less mature than JSPWiki's decades of development.
- **Java Ecosystem**: Lacks access to Java-based extensions and enterprise features available to JSPWiki.
- **Documentation**: Still evolving; some handlers and features lack comprehensive documentation compared to JSPWiki.
- **Database Support**: File-based only; no database PageProvider options like JSPWiki.

### Example Workflow Comparison
**JSPWiki**:
- **Markup**: `Welcome **Main**! [{CurrentTimePlugin}]`
- **Flow**: `WikiServlet` → `WikiEngine` → `PageManager` (fetch `Main.txt`) → `SpamFilter` → `JSPWikiMarkupParser` (`<b>Main</b> 2025-09-21 04:35:00 EDT`) → Post-filter → `view.jsp` (with `jspwiki.css`) → Cached → Response.
- **Output**: `<div class="content">Welcome <b>Main</b>! 2025-09-21 04:35:00 EDT</div>`.

**amdWiki** (Advanced Parser):
- **Markup**: `# Welcome *Main*! [{Image src='logo.jpg'}] Current user: [{$username}]`
- **Flow**:
  - Express route → Auth middleware (UserManager) → ACL check (PolicyEvaluator)
  - `PageManager` (fetch `Main.md`)
  - `RenderingManager.renderMarkdown()` → `MarkupParser.parse()`
    - Phase 1: Preprocessing (protect code blocks)
    - Phase 2: Syntax Recognition (tokenize)
    - Phase 3: Context Resolution (expand `[{$username}]` → "JohnDoe")
    - Phase 4: Content Transformation (PluginSyntaxHandler processes `[{Image}]` → `<img src="/attachments/logo.jpg">`)
    - Phase 5: Filter Pipeline (SecurityFilter, SpamFilter)
    - Phase 6: Markdown Conversion (Showdown: `# Welcome` → `<h1>Welcome</h1>`, `*Main*` → `<em>Main</em>`)
    - Phase 7: Post-processing (restore HTML, cleanup)
  - `TemplateManager` → `wiki-view.ejs` (with Bootstrap)
  - Response with cache headers
- **Output**: `<div class="container"><h1>Welcome <em>Main</em>!</h1> <img src="/attachments/logo.jpg"> Current user: JohnDoe</div>`

### Summary
- **JSPWiki**: Suited for complex, enterprise-grade wikis needing robust versioning, extensive extensibility via SPI, and granular access control. Its pipeline is feature-rich and battle-tested but heavyweight, requiring significant setup (servlet container, configuration) and Java expertise.
- **amdWiki**: Modern wiki engine that combines JSPWiki's sophisticated parsing architecture with Node.js/Express agility and Markdown familiarity. Features a comprehensive 7-phase MarkupParser with extensive JSPWiki syntax support, advanced multi-strategy caching, and performance monitoring. Ideal for teams wanting JSPWiki-style features in a modern JavaScript stack with quick deployment. While handler library and versioning are less mature than JSPWiki's decades of development, the architecture is designed for extensibility and growth.

**Key Differentiators**:
- **JSPWiki**: Java/Servlet ecosystem, pure wiki markup, decades of plugins, enterprise features
- **amdWiki**: Node.js/Express, Markdown + JSPWiki syntax, modern tooling, lightweight deployment, manager-based architecture

For detailed implementation, refer to:
- JSPWiki's [API docs](https://jspwiki.apache.org/apidocs/2.12.2/)
- amdWiki's [PROJECT-STRUCTURE.md](https://github.com/jwilleke/amdWiki/blob/master/docs/architecture/PROJECT-STRUCTURE.md)
- amdWiki's source: `src/WikiEngine.js`, `src/managers/RenderingManager.js`, `src/parsers/MarkupParser.js`
