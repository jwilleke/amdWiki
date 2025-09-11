---
alwaysApply: true
---

# Project Standards

When working on the amdWiki project:

## Architecture & Design Patterns
1. Follow the JSPWiki-inspired manager-based architecture with WikiEngine as central orchestrator
2. All managers must extend BaseManager and follow lifecycle (constructor → initialize → methods)
3. Use the established Engine → Manager → Component hierarchy
4. Store pages as Markdown files with YAML frontmatter in UUID-based filenames (uuid.md)
5. Use file-based storage: /pages for regular content, /required-pages for system pages
6. Use Markdownlint Configuration**: `.markdownlint.json` for formating all Markdown files

## Code Standards
1. Use CommonJS modules (require/module.exports) - no ES6 imports
2. Use JavaScript throughout (not TypeScript) with JSDoc comments for documentation
3. Follow existing error handling patterns with try/catch and graceful degradation
4. Use async/await for asynchronous operations consistently
5. Implement proper validation and sanitization for user inputs


## Testing Standards (Critical - Per CHANGELOG.md)
1. **Use mocks instead of real file operations** - PageManager tests were removed for not following this
2. Mock fs-extra completely using in-memory Map-based file systems for predictable behavior
3. Mock gray-matter for YAML frontmatter parsing
4. Use Jest with comprehensive test coverage (>80% for critical managers)
5. Structure tests in __tests__ directories with descriptive test names
6. Use testUtils.js for common test utilities and mock objects

## Page Management Standards
1. All pages require YAML frontmatter with: title, uuid, slug, category, user-keywords, lastModified
2. Use UUID-based file naming (uuid.md) for all pages
3. Store System category pages in required-pages/, others in pages/
4. Implement proper slug generation (lowercase, hyphenated) from titles
5. Support both title and slug-based page resolution

## Authentication & Security
1. Implement three-state authentication: Anonymous → Asserted → Authenticated
2. Use role-based permissions (reader, contributor, editor, admin)
3. Protect routes with proper authentication middleware
4. Use ACLManager for content filtering based on user permissions
5. Validate all user inputs and sanitize outputs

## UI/UX Standards
1. Use Bootstrap 5 components and styling throughout
2. Follow JSPWiki-style navigation and layout patterns
3. Use EJS templates with consistent template data structure
4. Implement responsive design for mobile compatibility
5. Use professional styling with cards, shadows, and hover effects

## Plugin System
1. Follow JSPWiki plugin syntax: [{PluginName param='value'}]
2. Plugins receive context with engine instance for manager access
3. Return HTML strings from plugin execute() methods
4. Support system variables: [{$username}], [{$loginstatus}], [{$totalpages}]

## Version Management
1. Follow Semantic Versioning (Major.Minor.Patch)
2. Update CHANGELOG.md with detailed release notes
3. Use npm scripts for version management (version:patch, version:minor, version:major)
4. Document breaking changes and migration paths

## Performance & Reliability
1. Use caching for page lookups (titleToUuidMap, slugToUuidMap)
2. Rebuild caches after page modifications
3. Handle file system errors gracefully without crashing
4. Implement proper cleanup in finally blocks