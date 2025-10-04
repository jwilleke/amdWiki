---
title: Project Tasks and TODO
category: System
user-keywords:
  - tasks
  - development
  - planning
uuid: 124f3d52-75a0-4e61-8008-de37d1da4ef6
lastModified: '2025-09-10T12:56:27.573Z'
slug: project-tasks-and-todo
---

# Project Tasks and TODO

[GitHub](https://github.com/jwilleke/amdWiki)

## Well-Implemented (Very Close)

  1. WikiEngine Orchestration ✅
    - Your WikiEngine.js mirrors JSPWiki's central coordinator role
    - Initializes managers in correct dependency order
  2. PageManager & Page Retrieval ✅
    - PageManager.js retrieves page content
    - Uses file system storage (like FileSystemProvider)
    - Properly parses frontmatter with gray-matter
    - Supports UUID-based page identification
  3. RenderingManager Pipeline ✅
    - RenderingManager.js converts markdown to HTML
    - Coordinates rendering through WikiContext
    - Has link graph for backlinks (getReferringPages())
    - Integrates with PluginManager
  4. Access Control ✅
    - ACLManager.js enforces permissions (like AuthorizationManager)
    - PolicyEvaluator.js evaluates policies (mimics JAAS policy evaluation)
    - PolicyManager.js loads policies from configuration
    - Works through checkPagePermission()
  5. User Management ✅
    - UserManager.js handles authentication (like AuthenticationManager)
    - Session management via express-session
    - User database in JSON format
  6. Plugin System ✅
    - PluginManager.js exists
    - Can load and execute plugins during rendering

## ⚠️ Partially Implemented (Needs Work)

  7. Template Rendering ⚠️
    - ✅ Have TemplateManager.js
    - ✅ Using EJS templates (view.ejs, header.ejs, footer.ejs)
    - ⚠️ Not fully integrated with RenderingManager
    - ❌ No dynamic template selection based on context
  8. Parsing & Markup ⚠️
    - ✅ Uses markdown-it for parsing
    - ⚠️ Has MarkupParser.js but marked as "fallback"
    - ❌ No intermediate representation like JSPWiki's WikiParser AST
    - ⚠️ Variable expansion exists but integration unclear
  9. Filter System ⚠️
    - ❌ No FilterManager equivalent
    - ❌ No preprocessing/postprocessing filter pipeline
    - ✅ Has some filters in code but not centralized

  ❌ Missing or Incomplete

  10. Attachment Handling ❌
    - ✅ AttachmentManager.js exists
    - ❌ Not integrated into rendering pipeline
    - ❌ No attachment links rendered in pages
  11. Caching ❌
    - ✅ CacheManager.js exists
    - ❌ Not being used for page rendering
    - ❌ No performance optimization
  12. WikiContext Flow ⚠️
    - ✅ WikiContext.js exists and is passed around
    - ⚠️ Not consistently used across all rendering
    - ⚠️ Context doesn't carry enough state

## 📚 Reference Links

- [JSPWiki Core Plugins](https://jspwiki-wiki.apache.org/Wiki.jsp?page=JSPWikiCorePlugins)
- [JSPWiki Styles Repository](https://github.com/apache/jspwiki/tree/master/jspwiki-war/src/main/styles)
- [JSPWiki Haddock Theme](https://github.com/apache/jspwiki/tree/master/jspwiki-war/src/main/styles/haddock)
- [Bootstrap 5 Migration Guide](https://getbootstrap.com/docs/5.0/migration/)
- [WikiVariable Documentation](https://jspwiki-wiki.apache.org/Wiki.jsp?page=WikiVariable)

## 💭 Development Notes

- Current implementation uses Bootstrap 5 - good foundation
- Page Source Dialog already excellent - JSPWiki quality
- Navigation structure clean and minimal - matches JSPWiki philosophy
- Table functionality implementation complete and working
- Project structure reorganized for better maintainability

---

**Last Updated**: September 8, 2025  
**Status**: Active development with table functionality complete
