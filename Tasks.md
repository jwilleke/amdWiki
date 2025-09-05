# Tasks

## Intial Setup

* Preview on Right side
* Need to prompt for pagename when creatting a "new-page" and the pagename will be the name of stored file pagename.md

  
### Macro type Expansion

[JSPWiki](https://jspwiki-wiki.apache.org/Wiki.jsp?page=JSPWikiCorePlugins) use "Plugins" which is what the [ReferringPagesPlugin](https://jspwiki-wiki.apache.org/Wiki.jsp?page=ReferringPagesPlugin) is based on.


[WikiVariable](https://jspwiki-wiki.apache.org/Wiki.jsp?page=WikiVariable) is what used for [{$pagename}]

* There are other marco that is expanded on rendering the page.
 * [{ReferringPagesPlugin before='*' after='\n' }] expands to a list of "pages that have been linked to this page (https://jspwiki-wiki.apache.org/Wiki.jsp?page=ReferredPagesPlugin) with a seperate line for each linked page

### Normal links to other pages

links [new-page] should be rendered as a link to the pagenamed new-page

### Auto-complete

I am expecting to host this in my home lab setup and not require any data off my local network
I want to build a Markdown wiki similar to https://github.com/apache/jspwiki.
Current task is to come up with a method to perform pagename type down when editing a page and I enter [] (Search for existing pages)

I will also want full text search capabilities and I am unsure how ot accomplich this in node.
In jspwiki they used Apache Lucene, but I am not tied to that.

### UUID

Implement UUID for keeping track of pages and versions even after renaming.
All pages shsould have a globally Unique Identitfier when created
Store in YAML frontmatter at bottom of page and do NOT allow editng of this section.

### Hierarchical Keyword and Category Design

* Category: Treat these as top-level containers or themes for grouping pages. Store each page's category as a discrete field in its metadata. Every Page Must have ONLY ONE Category. Category can be Added or changed by editor from dropdown at top of edit page.
* Keywords: Auto-generate them using an LLM like Ollama at indexing time. These should reflect the core topics or semantic features of page content. Store as an array or set under each page, ideally distinguished from user keywords. (Limit to 3 keywords per page)
* User-Keywords: Allow creators or editors to add custom keywords or tags. Store these in a separate array or field under each page's metadata, keeping them distinct from system-assigned keywords. (Limit to 3 keywords per page). User-Keywords can be Added or changed by editor from dropdown at top of edit page. (Multi-selet)

Store in YAML frontmatter at bottom of page and do NOT allow editng of this section.

### Header

My Blog Post (Emphasized) (as it is now)
Category: Physics Keywords: [markdown, syntax, keywords, formatting] (UUID:XXX)

### Search Features to Support

* Title Search: Map this to the filename minus its extension. Index and expose this as a searchable field.
* Category/Keyword Search: Enable filtering (or faceted search) by assigned category, automatic keywords, and user keywords. 
* Your full-text engine or database (FlexSearch, Elastic, MongoDB full-text, or similar) should allow filtering fields alongside free-text queries.

Full Content Search: Index the entire markdown body for "anywhere" search, possibly returning search scores or highlights for relevance

### markdownlint

use markdownlint library for Node.js to validate and build markdown documents.

### Export of Makrdown

We will output Markdown to:
- HTML
- odt
- PDF
- Tables Downlaod to .ods
