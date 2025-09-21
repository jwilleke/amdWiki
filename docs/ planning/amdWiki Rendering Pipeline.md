# Overview of the Rendering Pipeline for amdWiki

amdWiki is a Node.js-based, file-based wiki application inspired by JSPWiki, using Markdown for page storage and Express.js for server-side handling. It supports JSPWiki-style syntax (e.g., `[Link Text|PageName]` for links, `[{Image src='image.jpg'}]` for plugins) alongside Markdown. The rendering pipeline is primarily **server-side**, processing raw Markdown/wiki markup into HTML, embedding it in EJS templates, and serving styled responses to the browser. It lacks the complex manager-based architecture of JSPWiki but emphasizes simplicity with Express routes, EJS views, and a plugin system for extensibility.

The pipeline is triggered per HTTP request (e.g., GET `/wiki/Main`), orchestrated by Express middleware and routes. It integrates authentication, access control (via JSON policies), and auditing. Client-side enhancements (e.g., Bootstrap JS for interactivity) are minimal, with static assets served from `/public/`. Below is a step-by-step explanation of the inferred rendering pipeline, based on the project's architecture (Node.js/Express, Markdown parsing, EJS templating).

## Steps in the Rendering Pipeline

1. **HTTP Request Handling**:
   - An incoming request (e.g., `GET /wiki/Main`) is received by the Express app in `src/routes/` (e.g., a wiki route handler like `wikiRouter.js`).
   - Middleware processes the request: authentication (three-state system: anonymous, user, admin), policy-based access control (checks JSON config in `/config/` for permissions), and audit logging (records access in `/logs/` or `/data/`).
   - If authorized, extracts parameters (e.g., page name `Main`, action `view`).
   - Fact: Routes delegate to core logic in `src/core/` or `src/managers/`, ensuring security before rendering.

2. **Page Content Retrieval**:
   - The route handler uses a manager (e.g., `PageManager` in `src/managers/`) to fetch the raw page file from `/pages/` (Markdown `.md` files, e.g., `Main.md`).
   - Loads metadata (e.g., categories, keywords) from file headers or a separate JSON store in `/data/`.
   - Checks for existence; if missing, generates a "red link" or creation prompt.
   - Supports attachments (e.g., images in `/attachments/`) via upload handling.
   - Fact: Storage is file-based (no database), with optional archiving to `/archive/`.

3. **Pre-Processing (Syntax and Plugin Handling)**:
   - Raw Markdown is scanned for JSPWiki-style syntax using utility functions in `src/utils/` (e.g., a parser for `[Link Text|PageName]` → temporary placeholders).
   - Plugins (e.g., `[{Image src='image.jpg' width='300'}]`) are processed via the plugin system in `src/core/`:
     - Replaces with HTML (e.g., `<img src="/attachments/image.jpg" width="300">`).
     - Supports inline images (JPEG/PNG/GIF/WebP, max 5MB) with upload validation.
   - Applies filters or transformations (e.g., category/keyword injection, red link detection).
   - Fact: This step handles hybrid Markdown/wiki syntax, ensuring compatibility with JSPWiki markup without full JSPWiki parsing.

4. **Markdown Parsing to HTML**:
   - The pre-processed content is converted to HTML using a Markdown parser (likely `marked` or similar, inferred from Node.js ecosystem; not explicitly named but standard for Markdown wikis).
   - The parser resolves placeholders from step 3 (e.g., links to `<a href="/wiki/PageName">Link Text</a>`).
   - Handles advanced features like multi-criteria search integration (e.g., embedding search results as HTML snippets).
   - Fact: Output is a raw HTML fragment, with support for tables, headings, and lists from Markdown.

5. **Post-Processing and Validation**:
   - Applies any post-parse transformations (e.g., injecting audit trail links or time-based permissions via `src/managers/`).
   - Validates output (e.g., sanitizes HTML to prevent XSS, enforces max file sizes for images).
   - Integrates admin dashboard elements if in admin mode (e.g., monitoring stats from `/reports/`).
   - Fact: Ensures compliance with policy-based access (e.g., hides sensitive content based on user role).

6. **Template Rendering**:
   - The HTML fragment is passed to an EJS template in `/views/` (e.g., `wiki-view.ejs` for view mode).
   - The template wraps the content with layout elements: header (navigation, search bar), sidebar (categories/keywords), footer (audit info), and Bootstrap classes for styling.
   - Includes static assets from `/public/` (e.g., `<link rel="stylesheet" href="/css/bootstrap.css">`).
   - Supports user-specific customizations (e.g., via session data).
   - Fact: EJS allows dynamic insertion (e.g., `<%= htmlContent %>`), with three-state auth influencing visible elements (e.g., edit button for logged-in users).

7. **Response Serving and Caching**:
   - The rendered HTML is sent as the response with appropriate headers (e.g., `Content-Type: text/html`).
   - Optional caching (inferred via Express middleware; no explicit cache manager like JSPWiki's Ehcache).
   - For exports (e.g., to `/exports/`), generates static HTML/PDF variants.
   - Fact: Responses include Bootstrap JS for client-side interactivity (e.g., search filtering, image uploads).

### Key Components in the Pipeline

| Component              | Role in Pipeline                                                                 | Location in Repo                      |
|------------------------|----------------------------------------------------------------------------------|---------------------------------------|
| **Express Routes**    | Handles requests, authentication, and delegates to managers.                     | `src/routes/` (e.g., `wikiRouter.js`) |
| **PageManager**       | Retrieves/saves Markdown files and metadata.                                     | `src/managers/`                       |
| **Syntax/Plugin Parser** | Pre-processes JSPWiki-style links/plugins to placeholders.                     | `src/utils/` or `src/core/`           |
| **Markdown Parser**   | Converts Markdown + resolved syntax to HTML.                                     | Likely `marked` (Node.js lib)         |
| **EJS Templates**     | Wraps HTML in layout with Bootstrap styling.                                     | `/views/` (e.g., `wiki-view.ejs`)     |
| **Access Control**    | Validates permissions pre/post-rendering.                                        | `/config/` (JSON policies)            |
| **Audit Trail**       | Logs access during retrieval and serving.                                        | `src/managers/` and `/logs/`          |

## Textual Diagram of the Pipeline

``` text
HTTP Request (e.g., GET /wiki/Main) → Express Routes (auth + access check)
              ↓
PageManager (fetch Main.md from /pages/)
              ↓
Pre-Processing (parse links/plugins in src/utils/)
              ↓
Markdown Parser (convert to HTML fragment)
              ↓
Post-Processing (validation + injections)
              ↓
EJS Template (/views/wiki-view.ejs + Bootstrap CSS/JS from /public/)
              ↓
Response (HTML to browser, audit log to /logs/)
```

### Notes
- **Inspiration from JSPWiki**: Unlike JSPWiki's manager-heavy pipeline (e.g., `WikiEngine`, `JSPWikiMarkupParser`), amdWiki simplifies with Express/EJS, focusing on Markdown over full wiki markup. No explicit "RenderingManager" exists, but the flow mirrors JSPWiki's steps.
- **Extensibility**: Plugin system allows custom syntax handlers; time-based permissions add dynamic rendering rules.
- **Performance**: File-based I/O is lightweight but may scale poorly without caching; suitable for small wikis.
- **Documentation**: See [PROJECT-STRUCTURE.md](https://github.com/jwilleke/amdWiki/blob/master/docs/architecture/PROJECT-STRUCTURE.md) and [ROADMAP.md](https://github.com/jwilleke/amdWiki/blob/master/docs/planning/ROADMAP.md) for deeper details.

This pipeline captures amdWiki's server-centric rendering, adapted from JSPWiki concepts. For code-level verification or customizations, refer to the repo's `src/` directory.

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
amdWiki’s pipeline is simpler, built on Node.js with Express.js, using Markdown with JSPWiki-style link syntax and EJS templates. It emphasizes lightweight deployment and file-based storage.

1. **HTTP Request Handling**:
   - **Component**: Express routes (e.g., `src/routes/wikiRouter.js`).
   - **Process**: Receives requests (e.g., `GET /wiki/Main`), applies middleware for authentication (three-state: anonymous, user, admin) and policy-based access control (JSON in `/config/`).
   - **Details**: Logs audit trails to `/logs/`.

2. **Page Content Retrieval**:
   - **Component**: `PageManager` (in `src/managers/`).
   - **Process**: Loads Markdown file (e.g., `Main.md`) from `/pages/` and metadata from `/data/` (JSON).
   - **Details**: No built-in versioning; attachments stored in `/attachments/`.

3. **Pre-Processing (Syntax and Plugin Handling)**:
   - **Component**: Utility functions (`src/utils/` or `src/core/`).
   - **Process**: Scans for JSPWiki-style syntax (e.g., `[Link|PageName]`, `[{Image src='image.jpg'}]`) and converts to placeholders for Markdown compatibility.
   - **Details**: Supports plugins (e.g., images with max 5MB size).

4. **Markdown Parsing to HTML**:
   - **Component**: Markdown parser (likely `marked` or similar, inferred).
   - **Process**: Converts Markdown and resolved placeholders to HTML (e.g., `[Link|PageName]` → `<a href="/wiki/PageName">Link</a>`).
   - **Details**: Handles tables, headings, and search results.

5. **Post-Processing and Validation**:
   - **Component**: Manager logic (`src/managers/`).
   - **Process**: Sanitizes HTML, injects audit trails or time-based permissions.
   - **Details**: Enforces access policies post-rendering.

6. **Template Rendering**:
   - **Component**: EJS templates (`/views/wiki-view.ejs`).
   - **Process**: Wraps HTML with Bootstrap-based layout (header, sidebar, footer) from `/public/css/bootstrap.css`.
   - **Details**: Supports dynamic elements via EJS (e.g., `<%= htmlContent %>`).

7. **Response Serving and Caching**:
   - **Component**: Express response handling.
   - **Process**: Sends HTML response; optional caching via middleware.
   - **Details**: Exports to `/exports/` (HTML/PDF); minimal client-side JS (Bootstrap).

### Comparison Table

| Aspect                    | JSPWiki Rendering Pipeline                          | amdWiki Rendering Pipeline                          |
|---------------------------|----------------------------------------------------|----------------------------------------------------|
| **Technology**            | Java, Servlet, JSP                                 | Node.js, Express, EJS                              |
| **Content Format**        | JSPWiki markup (e.g., `**bold**`, `[{Plugin}]`)    | Markdown + JSPWiki-style links/plugins             |
| **Core Controller**       | `WikiEngine` (singleton)                           | Express routes (`src/routes/`)                     |
| **Context**               | `WikiContext` (page, mode, user)                   | Request object + middleware (auth, policies)       |
| **Storage**               | `PageProvider` (e.g., `FileSystemProvider`)        | File-based (`/pages/*.md`, `/data/`)              |
| **Parsing**               | `JSPWikiMarkupParser` (SPI-extensible)             | Markdown parser + custom syntax handler            |
| **Enhancements**          | Plugins, Variables, Forms, Styles, Filters         | Plugins (e.g., Image), Links, Search               |
| **Filters**               | Pre/post via `PageFilter` (`jspwiki.filters`)      | Middleware-based transformations                   |
| **Templating**            | JSP (`view.jsp`, `jspwiki.css`, skins)             | EJS (`wiki-view.ejs`, Bootstrap CSS)              |
| **Caching**               | `CacheManager` (Ehcache, configurable)             | Optional Express middleware (not explicit)         |
| **Output**                | HTML via `WikiServlet`                             | HTML via Express response                          |

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
- **Lightweight**: Node.js/Express requires minimal setup, ideal for small wikis or quick deployments.
- **Modern Stack**: Uses Markdown (widely adopted) and EJS, simpler than JSP for developers familiar with JavaScript.
- **Simplicity**: Fewer components (no managers, SPI) reduce complexity; file-based storage is straightforward.
- **Bootstrap Integration**: Pre-styled with Bootstrap CSS/JS, providing responsive, modern UI out-of-the-box.
- **Policy-Based Access**: JSON-based access control (`/config/`) is easy to configure and audit.

**Cons**:
- **Limited Features**: Lacks advanced enhancements like WikiForms, Variables, or built-in versioning compared to JSPWiki.
- **No Native Versioning**: File-based storage (`/pages/*.md`) does not support page history or diffs natively.
- **Caching**: No explicit caching mechanism (unlike JSPWiki’s Ehcache), potentially slower for repeated views.
- **Extensibility**: Plugin system is less mature; no formal SPI, limiting modularity compared to JSPWiki.
- **Security**: Three-state authentication and JSON policies are simpler but less granular than JSPWiki’s ACLs.

### Example Workflow Comparison
**JSPWiki**:
- **Markup**: `Welcome **Main**! [{CurrentTimePlugin}]`
- **Flow**: `WikiServlet` → `WikiEngine` → `PageManager` (fetch `Main.txt`) → `SpamFilter` → `JSPWikiMarkupParser` (`<b>Main</b> 2025-09-21 04:35:00 EDT`) → Post-filter → `view.jsp` (with `jspwiki.css`) → Cached → Response.
- **Output**: `<div class="content">Welcome <b>Main</b>! 2025-09-21 04:35:00 EDT</div>`.

**amdWiki**:
- **Markup**: `# Welcome *Main*! [{Image src='logo.jpg'}]`
- **Flow**: Express route → Auth middleware → `PageManager` (fetch `Main.md`) → Syntax parser (links/plugins) → Markdown parser (`<h1>Welcome <em>Main</em>!</h1> <img src="/attachments/logo.jpg">`) → Post-processing (validation) → `wiki-view.ejs` (with Bootstrap) → Response.
- **Output**: `<div class="container"><h1>Welcome <em>Main</em>!</h1> <img src="/attachments/logo.jpg"></div>`.

### Summary
- **JSPWiki**: Suited for complex, enterprise-grade wikis needing versioning, extensibility, and robust access control. Its pipeline is feature-rich but heavyweight, requiring significant setup and tuning.
- **amdWiki**: Ideal for lightweight, modern wikis with simple Markdown-based content and quick deployment. Its pipeline is streamlined but lacks versioning and advanced enhancements, limiting scalability.

For detailed implementation, refer to JSPWiki’s [API docs](https://jspwiki.apache.org/apidocs/2.12.2/) or amdWiki’s [PROJECT-STRUCTURE.md](https://github.com/jwilleke/amdWiki/blob/master/docs/architecture/PROJECT-STRUCTURE.md). If you need a visual comparison (e.g., Chart.js for performance metrics), provide specific data or metrics!