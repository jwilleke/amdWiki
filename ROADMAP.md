# amdWiki Digital Platform Roadmap

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

### Phase 1: Core Foundation (Current)
* **Wiki Engine** - JSPWiki-compatible content management ✅
* **User Management** - Authentication and authorization system
* **Plugin Architecture** - Extensible module loading system
* **Standards Compliance** - Markdown, YAML frontmatter, HTTP standards

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

## Next Iteration Opportunities

### High Priority

* User Authentication System - Login/permissions
* Page History & Versioning - Track changes over time
* Advanced Search Filters - Category/keyword/date filtering
* Attachment UI Integration - Upload widgets in edit pages

### Medium Priority

* Page Comments System - Discussion functionality
* Notification System - Changes/mentions alerts
* Advanced Export Options - PDF generation, batch exports
* Plugin Development - More wiki functionality plugins

### Low Priority

* Theme System - Multiple UI themes
* Mobile Optimization - Responsive design improvements
* Performance Monitoring - Analytics and metrics
* Backup/Restore - Automated backup system

## Technical details

All code is at /Volumes/hd3/GitHub/amdWiki and Will be on GitHub

Use of use markdownlint library for Node.js to validate and build markdown documents.

encoding should be UTF-8.

### Export of Makrdown

We will output Markdown to:

* HTML
* odt
* PDF
* Tables Downlaod to .ods

### New Page and editing

* Preview on Right side
* Need to prompt for pagename when creatting a "new-page" and the pagename will be the name of stored file pagename.md

### Macro type Expansion

[JSPWiki](https://jspwiki-wiki.apache.org/Wiki.jsp?page=JSPWikiCorePlugins) use "Plugins" which is what the [ReferringPagesPlugin](https://jspwiki-wiki.apache.org/Wiki.jsp?page=ReferringPagesPlugin) is based on.

The [ReferringPagesPlugin](https://jspwiki-wiki.apache.org/Wiki.jsp?page=ReferringPagesPlugin) should be implemented with options
Parameters

* max=n : How many pages to list. Default is 10. Some pages might create very long lists, so it's a good idea to limit the list size.
* maxwidth=n : Limits the length of the generated links to at most n characters. This should used to keep the LeftMenu or LeftMenuFooter at a manageable width. Default is to not limit the length at all.
* separator='''markup''' : What should be put between the different items. It's WikiMarkup, and by default it's two backslashes (meaning a carriage return, or <br />). JesseWilbur: If you want to use something like a "|", you have to put it in single quotes. separator='|'
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

### Plugin Escaping

JSPWiki-style plugins and system variables support proper escaping:

* **Code Blocks**: Plugins in ```code blocks``` are NOT expanded
* **Inline Code**: Plugins in `inline code` are NOT expanded  
* **Escaped Syntax**: Use [[{$variable}] (double brackets) to prevent expansion and show literal text

Examples:
* Normal: [{$pagename}] → expands to page name
* Escaped: [[{$pagename}] → shows literal [{$pagename}]
* Code: `[{$pagename}]` → shows literal [{$pagename}]

### Configuration

* wiki.conf folder should store configuration data
* wiki.conf/template folder should store templates for pages etc.

### Metadata

Store in YAML frontmatter at bottom of page and __do NOT allow editng of this section__.

#### UUID

Implement UUID for keeping track of pages and versions even after renaming.
All pages shsould have a globally Unique Identitfier when created

#### Hierarchical Keyword and Category Design

* Category: Treat these as top-level containers or themes for grouping pages. Store each page's category as a discrete field in its metadata. Every Page Must have ONLY ONE Category. Category can be Added or changed by editor from dropdown at top of edit page. __Do not allow saving of a file without One Category assigned.__
* Keywords: Auto-generate them using an LLM like Ollama at indexing time. These should reflect the core topics or semantic features of page content. Store as an array or set under each page, ideally distinguished from user keywords.  (Limit to 3 keywords per page)
* User-Keywords: Allow creators or editors to add custom keywords or tags. Store these in a separate array or field under each page's metadata, keeping them distinct from system-assigned keywords. (Limit to 3 keywords per page). User-Keywords can be Added or changed by editor from dropdown at top of edit page. (Multi-selet) from dropdown at top of edit page generated from the User-Keywords page.

For the entries of

* Category
* Keywords
* User-Keywords

There should be a wikipage for each describing each entity and having a that Category or Keywords or User-Keywords.

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

## Security Within Wiki

Implement the following default User State

- anybody
  - readonly
- anonymous
  - readonly
- asserted (Those we have a cookie on but have not authenticated)
  - readonly
- authenticated
- 
- admin
  - all permissions

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
