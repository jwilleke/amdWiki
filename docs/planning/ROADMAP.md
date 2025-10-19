# amdWiki Digital Platform Roadmap

**Last Updated:** October 2025
**Current Version:** 1.3.1+
**Status:** Phase 1 Complete, Phase 2 Planning

## Quick Status Overview

| Component | Status | Notes |
|-----------|--------|-------|
| Wiki Core | ✅ Complete | JSPWiki-compatible with WikiDocument DOM parser |
| User Management | ✅ Complete | Full authentication, roles, permissions |
| Access Control | ✅ Complete | Policy-based with audit logging |
| Search System | ✅ Complete | Advanced multi-criteria search |
| Configuration | ✅ Complete | Web-based admin interface |
| Variables | ✅ Complete | 18 system + 4 contextual variables |
| Themes | ✅ Complete | Dark/light modes with user preferences |
| Page Versioning | ✅ Complete | VersioningFileProvider in production |
| Attachments | 🚧 Partial | Manager exists, UI enhancement needed |
| Blog Module | 📋 Planned | Phase 2 feature |
| Business Modules | 📋 Planned | Phase 3 features |

**Key Achievements:**
* 23 specialized managers implementing modular architecture
* 76%+ test coverage on routes
* Complete policy-based security system
* Production-ready DOM-based parser
* Full JSPWiki compatibility for core features

## Platform Vision

**amdWiki** is evolving from a JSPWiki-inspired wiki into a **comprehensive digital platform** for personal and organizational use. The goal is to create a modular, standards-based ecosystem that can be hosted locally or on the internet.

### Core Philosophy
* **Modular Architecture**: Plugin-based modules for different use cases
* **Standards-First**: RFC and widely-adopted standards support
* **Local-First**: Can run entirely offline while supporting cloud deployment
* **Universal Platform**: "Jack of all trades" digital workspace

### Initial Foundation
* **Wiki Core**: JSPWiki-compatible functionality using Markdown
* **Manager Pattern**: Extensible architecture for module integration
* **File-Based Storage**: Portable, database-free content management
* **Node.js Stack**: Modern, performant, widely-supported technology

## Platform Module Roadmap

### Phase 1: Core Foundation ✅ (Completed)
* **Wiki Engine** - JSPWiki-compatible content management ✅
* **User Management** - Authentication and authorization system ✅
* **Configuration Management** - Full web-based configuration with ConfigurationManager ✅
* **Plugin Architecture** - Extensible module loading system ✅
* **Variable System** - JSPWiki-compatible variable expansion ✅
* **Standards Compliance** - Markdown, YAML frontmatter, HTTP standards ✅
* **Schema.org Integration** - Structured data for SEO ✅
* **Dark Mode Theme** - Complete theme system with user preferences ✅

### Phase 2: Content Modules
* **Blog Module** - Multi-author blogging with RSS/Atom feeds
* **Document Management** - File organization, versioning, search
* **Photo Management** - Gallery, EXIF metadata, album organization
* **Asset Management** - Digital asset tracking and maintenance logs

### Phase 3: Business Modules  
* **E-Commerce Store** - Product catalog, cart, payment integration
* **CRM Module** - Contact management and interaction tracking
* **Project Management** - Task tracking, timeline management
* **Knowledge Base** - FAQ, documentation, help desk integration

### Phase 4: Advanced Platform
* **API Gateway** - RESTful API for all modules with OpenAPI specs
* **Workflow Engine** - Business process automation
* **Reporting Dashboard** - Analytics and insights across modules
* **Multi-tenant Support** - Organization and user isolation

## Current Development Status (October 2025)

### ✅ Recently Completed Features (October 2025)

* **Page History & Versioning** - VersioningFileProvider fully implemented and in production ✅
  * Delta-based storage with compression
  * Per-page version history with checkpoint optimization
  * Version comparison and restoration
  * Full UI integration with Page History interface
  * Auto-migration from FileSystemProvider
  * 5 comprehensive test suites
* **WikiDocument DOM Parser** - Production-ready JSPWiki DOM-based parsing pipeline
* **Page Link Autocomplete** - Smart autocomplete for internal page links with keyboard navigation
* **Advanced Search System** - Multi-criteria search with categories, keywords, and full-text
* **Access Control System** - Complete policy-based access control with PolicyManager and PolicyEvaluator
* **Audit Trail System** - Comprehensive security monitoring with AuditManager
* **User Preferences** - Complete JSPWiki-style preference management with editor and display options
* **Configuration Management** - Web-based admin interface for all configuration properties
* **Variable System** - 18 system variables and 4 contextual variables (JSPWiki-compatible)
* **Backup/Restore System** - BackupManager with comprehensive data protection
* **Export Capabilities** - HTML and PDF export functionality

### 📋 High Priority - Next Iteration

* **Attachment UI Enhancement** - Complete the AttachmentManager integration
  * Upload widgets in edit pages
  * Inline attachment management
  * Image/video preview and optimization
  * File organization and search
* **Mobile Optimization** - Responsive design improvements
  * Touch-friendly UI components
  * Mobile-optimized editor
  * Progressive Web App (PWA) features
* **Performance Monitoring** - Analytics and metrics dashboard
  * Page load time tracking
  * Search performance metrics
  * User activity analytics

### 📌 Medium Priority

* **Page Comments System** - Discussion functionality
  * Comment threads on wiki pages
  * Mention system with notifications
  * Moderation capabilities
* **Notification System** - Real-time alerts
  * Page change notifications
  * @mention alerts
  * Email notification support
* **Advanced Export Enhancements** - Extended export formats
  * Batch export functionality
  * Custom templates for exports
  * EPUB and other formats
* **Plugin Development** - Extended wiki functionality
  * Additional JSPWiki-compatible plugins
  * Custom macro system
  * Third-party plugin marketplace

### 🔮 Low Priority / Future Considerations

* **Multiple Theme Support** - Additional UI themes beyond dark/light
* **Advanced Analytics** - Deep insights and reporting
* **Workflow Automation** - Automated page management tasks
* **Multi-language Support** - Full internationalization (i18n)

## Implemented Architecture

### Manager System (23 Managers)

The platform follows a modular manager pattern with specialized managers for different functionality:

**Core Managers:**
* ✅ **BaseManager** - Abstract base class for all managers
* ✅ **ConfigurationManager** - Configuration management with web interface
* ✅ **WikiEngine** - Central engine orchestrating all managers

**Content Management:**
* ✅ **PageManager** - Page CRUD operations and metadata
* ✅ **RenderingManager** - Markdown and JSPWiki markup rendering
* ✅ **TemplateManager** - Page template management
* ✅ **ValidationManager** - Content and metadata validation
* ✅ **AttachmentManager** - File attachment handling
* ✅ **ExportManager** - HTML, PDF, and other format exports

**Search & Discovery:**
* ✅ **SearchManager** - Advanced multi-criteria search with Lunr.js
* ✅ **SchemaManager** - Schema.org structured data generation

**User & Security:**
* ✅ **UserManager** - User authentication and management
* ✅ **PolicyManager** - Policy-based access control
* ✅ **PolicyEvaluator** - Policy evaluation engine
* ✅ **PolicyValidator** - Policy validation
* ✅ **ACLManager** - Page-level access control
* ✅ **AuditManager** - Security audit logging

**Extensibility:**
* ✅ **PluginManager** - Plugin loading and execution
* ✅ **VariableManager** - JSPWiki-compatible variable expansion
* ✅ **NotificationManager** - Event notification system

**Utilities:**
* ✅ **CacheManager** - In-memory caching system
* ✅ **BackupManager** - Backup and restore functionality

## Technical details

All code is at /Volumes/hd3/GitHub/amdWiki and is available on GitHub at <https://github.com/jwilleke/amdWiki>

**Technology Stack:**
* Node.js + Express.js for server
* EJS for templating
* Lunr.js for search indexing
* marked.js for Markdown parsing
* linkedom for WikiDocument DOM
* Jest for testing
* Bootstrap 5 for UI

**Code Quality:**
* Markdownlint for document validation
* UTF-8 encoding throughout
* JSDoc documentation
* Comprehensive test coverage (76%+ on routes)

### Export of Markdown ✅ (Partially Implemented)

Currently supported export formats:

* ✅ **HTML** - Full HTML export with CSS styling
* ✅ **PDF** - PDF generation from rendered pages
* 📋 **ODT** - OpenDocument Text format (planned)
* 📋 **ODS** - OpenDocument Spreadsheet for tables (planned)

### New Page and editing

* Preview on Right side
* Need to prompt for pagename when creatting a "new-page" and the pagename will be the name of stored file pagename.md

### Macro type Expansion

[JSPWiki](https://jspwiki-wiki.apache.org/Wiki.jsp?page=JSPWikiCorePlugins) use "Plugins" which is what the [ReferringPagesPlugin](https://jspwiki-wiki.apache.org/Wiki.jsp?page=ReferringPagesPlugin) is based on.

The [ReferringPagesPlugin](https://jspwiki-wiki.apache.org/Wiki.jsp?page=ReferringPagesPlugin) should be implemented with options
Parameters

* max=n : How many pages to list. Default is 10. Some pages might create very long lists, so it's a good idea to limit the list size.
* maxwidth=n : Limits the length of the generated links to at most n characters. This should used to keep the LeftMenu or LeftMenuFooter at a manageable width. Default is to not limit the length at all.
* separator='''markup''' : What should be put between the different items. It's WikiMarkup, and by default it's two backslashes (meaning a carriage return, or line break). JesseWilbur: If you want to use something like a "|", you have to put it in single quotes. separator='|'
* page="page name"
* before="markup"
* after="markup"
* show=pages|count : This parameter can have two values, "pages" (the default), and "count". The value "pages" will give you the list containing the pages, the value "count" will give you just the number of pages, not the whole list.
* showLastModified=true|false : The showLastModified parameter gives you the last modified date/time of the most recently changed page. It is only valid if show="count", otherwise a PluginException is thrown.

[WikiVariable](https://jspwiki-wiki.apache.org/Wiki.jsp?page=WikiVariable) is what used for [{$pagename}]

* [{$pagename}] simply expands the Title of the current page.
* applicationname - is the name of this wiki
* totalpages - The total number of pages available in this Wiki.
* uptime - Inserts the amount of time since this Wiki has been last restarted.
* username - Inserts the current user name: For example, you are now logged in as 174.105.183.192.
* loginstatus - Shows how the current user has logged in. For example, you are anonymous.

### Plugin Escaping ✅ (Implemented)

JSPWiki-style plugins and system variables support proper escaping:

* ✅ **Code Blocks**: Plugins in ```code blocks``` are NOT expanded
* ✅ **Inline Code**: Plugins in `inline code` are NOT expanded
* ✅ **Escaped Syntax**: Use `[[{$variable}]` (double brackets) to prevent expansion and show literal text

**Examples:**
* Normal: `[{$pagename}]` → expands to page name
* Escaped: `[[{$pagename}]` → shows literal `[{$pagename}]`
* Code: `` `[{$pagename}]` `` → shows literal `[{$pagename}]`

### Configuration

* wiki.conf folder should store configuration data
* wiki.conf/template folder should store templates for pages etc.

### Metadata ✅ (Implemented)

YAML frontmatter is stored at the bottom of each page file and is managed by the system (not directly editable in the editor).

#### UUID ✅ (Implemented)

Each page has a globally unique identifier (UUID v4) assigned at creation time, enabling:
* Page tracking across renames
* Version history correlation
* Link integrity maintenance

#### Hierarchical Keyword and Category Design ✅ (Implemented)

* **Categories** - Array-based categories for multi-classification
  * Stored as `categories: []` in YAML frontmatter
  * Default categories: System, Documentation, Test, General
  * Managed via dropdown in create/edit interface
  * Required: At least one category must be assigned

* **Keywords** - System-generated semantic keywords
  * Auto-generated during indexing (LLM integration ready)
  * Stored as `keywords: []` in metadata
  * Reflect core topics and semantic features
  * Limit: Up to 3 keywords per page

* **User-Keywords** - User-defined tags
  * Custom tags added by editors
  * Stored as `user-keywords: []` in metadata
  * Multi-select dropdown interface in editor
  * Limit: Up to 3 user keywords per page
  * Master list maintained in "User Keywords" wiki page

**Category and Keyword Pages:**
* ✅ System foundation pages created (System Keywords, User Keywords)
* ✅ Each category/keyword has a dedicated wiki page
* ✅ Automated link generation and management

### Page Templates

Page Templats are stored in wiki.conf/template folder.

#### Default Page Template

``` markdown
# Overview

[{$pagename}]


### Table Styles

Would like ot support [TablePlugin](https://jspwiki-wiki.apache.org/Wiki.jsp?page=TablePlugin)

Which has several Styles

* [Zebra Table](https://jspwiki-wiki.apache.org/Wiki.jsp?page=Zebra%20Table%20Style)
* [Filtered wiki table](https://jspwiki-wiki.apache.org/Wiki.jsp?page=Filtered%20Tables)
* [Sortable wiki tables](https://jspwiki-wiki.apache.org/Wiki.jsp?page=SortableTables)


### Normal links to other pages

* links [Jims] should be rendered as a link to the existing pagenamed Jims.md. Use a dropdown dialog, hprfully inline with typedoan capabilities.
* Normal Makrdown Links

### Search Features to Support

* Title Search: Map this to the filename minus its extension. Index and expose this as a searchable field.
* Category/Keyword Search: Enable filtering (or faceted search) by assigned category, automatic keywords, and user keywords. 
* Your full-text engine or database (FlexSearch, Elastic, MongoDB full-text, or similar) should allow filtering fields alongside free-text queries.

Full Content Search: Index the entire markdown body for "anywhere" search, possibly returning search scores or highlights for relevance

### Attachments
Attachments should be able to be added as tow different methods.

* inline with text
* Just an Attachments

Attachments thta are NOT Links will be stored wwithin /resources folder.

When they Attachments is "inline with text" we should be able to perform a refresh on loading the page.

## Security Within Wiki ✅ (Implemented)

The following user states have been implemented with policy-based access control:

- **Anonymous** - No session cookie present
  - Read-only access to public pages
  - No write permissions
- **Asserted** - Has session cookie but expired/invalid authentication
  - Read-only access (slightly elevated from anonymous)
  - No write permissions
- **Authenticated** - Valid session with active authentication
  - Configurable permissions via PolicyManager
  - Default roles: reader, editor, contributor
- **Admin** - Full administrative access
  - All permissions (create, read, update, delete)
  - Access to admin interfaces
  - User and configuration management

**Implemented Systems:**
* ✅ PolicyManager - JSON-based policy configuration
* ✅ PolicyEvaluator - Policy evaluation engine
* ✅ ACLManager - Page-level access control
* ✅ AuditManager - Comprehensive audit logging
* ✅ UserManager - User authentication and role management

## Standards Compliance Strategy

### Technical Standards (RFC & Widely Adopted)
* **HTTP/REST**: RFC 7231 compliant API design
* **JSON API**: JSON:API specification for consistent data exchange
* **OpenAPI 3.0**: API documentation and client generation
* **OAuth 2.0/OIDC**: Industry-standard authentication protocols
* **RSS/Atom**: Syndication feeds for blog and content modules
* **WebDAV**: File management and synchronization protocols
* **CommonMark**: Markdown specification compliance
* **Runtime Validation**: Joi/Zod for data validation (avoiding JSON Schema fragmentation)
* **Schema.org**: Structured data markup for SEO and semantic web integration

### Content Standards
* **Dublin Core**: Metadata schema for digital assets
* **Schema.org Vocabulary**: Semantic markup for all content types and modules
* **EXIF**: Photo metadata preservation and management
* **MIME Types**: Proper content-type handling across modules
* **Unicode UTF-8**: Full internationalization support
* **ISO 8601**: Date/time formatting consistency

### Platform Architecture Standards
* **Twelve-Factor App**: Deployment and configuration methodology
* **Semantic Versioning**: Module version management
* **Container Standards**: Docker/OCI compliance for deployment
* **Environment Variables**: Configuration management patterns

## Schema.org Integration Strategy

### Core Platform Benefits
* **SEO Enhancement**: Automatic structured data generation from YAML frontmatter
* **Search Engine Optimization**: Rich snippets and enhanced search results
* **Semantic Interoperability**: Machine-readable content across all modules
* **Content Discoverability**: Improved indexing and content relationships

### Module-Specific Schema Types
* **Wiki Pages**: Article, WebPage, CreativeWork schemas
* **Blog Module**: BlogPosting, Person (author), Organization schemas  
* **E-commerce Module**: Product, Offer, Review, Organization schemas
* **Document Management**: DigitalDocument, MediaObject, Dataset schemas
* **Photo Management**: ImageObject, PhotoAlbum, Place (location) schemas
* **CRM Module**: Person, Organization, ContactPoint schemas

### Implementation Approach
* **Automatic Generation**: RenderingManager creates JSON-LD from page metadata
* **Module Registration**: Each module defines its schema.org mappings
* **Template Integration**: Schema markup injected into page <head> sections
* **Validation Tools**: Structured data testing and validation

### Schema.org Compliance Benefits
* **Google Rich Results**: Enhanced search appearance
* **Voice Assistant Support**: Better content understanding for Alexa/Google
* **Knowledge Graph Integration**: Potential inclusion in search knowledge panels
* **API Interoperability**: Machine-readable data for external integrations

## Documentation Strategy

### User Documentation
* **Installation Guides**: Self-hosting and cloud deployment
* **User Manuals**: Per-module functionality guides
* **Video Tutorials**: Visual learning for complex workflows
* **FAQ/Troubleshooting**: Common issues and solutions

### Hosting Provider Documentation
* **Deployment Guides**: Various hosting platform instructions
* **Performance Tuning**: Optimization recommendations
* **Security Hardening**: Best practices for production
* **Backup/Recovery**: Data protection strategies

### Developer Documentation
* **API References**: Complete OpenAPI specifications
* **Module Development**: Plugin/module creation guides
* **Architecture Guides**: Platform internals and patterns
* **Contributing Guidelines**: Code standards and review process

### Integration Documentation
* **Third-party APIs**: Integration patterns and examples
* **Webhook Systems**: Event-driven integration guides
* **Import/Export**: Data migration tools and formats
* **Extension Points**: Customization and theming guides

## Platform Success Metrics

### Technical Excellence
* **Standards Compliance**: 100% adherence to chosen standards
* **API Coverage**: Complete OpenAPI documentation
* **Test Coverage**: >90% code coverage across modules
* **Performance**: <200ms average response times

### Community Growth
* **Module Ecosystem**: 3rd-party module marketplace
* **Documentation Quality**: Comprehensive guides for all audiences
* **Support Community**: Forums, Discord, Stack Overflow presence
* **Hosting Adoption**: Multiple hosting provider support

## More Information

There might be more information for this subject on one of the following:
[{ReferringPagesPlugin before='*' after='\n' }]
```
