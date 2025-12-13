# Code Standards

This document outlines the coding standards and best practices for the amdWiki project.

## Overview

amdWiki maintains high code quality through:

- **JSDoc documentation** (95% coverage required)
- **TypeScript for new code** (progressive migration)
- **CommonJS modules** with TypeScript compatibility
- **Manager-based patterns** for new features
- **DRY principle** - reference, don't duplicate
- **No over-engineering** - implement only what's needed
- **Jest testing** with >80% coverage target

## JSDoc Documentation

All classes, methods, and functions MUST have JSDoc comments.

### Format Requirements

```javascript
/**
 * Brief one-line description
 *
 * Optional longer description explaining the "why" not just "what"
 *
 * @param {type} paramName - Description of parameter
 * @returns {type} Description of return value
 * @throws {ErrorType} When this error is thrown
 * @example
 * // Example usage
 * const result = function(arg);
 */
```

### Coverage Standards

- **95% JSDoc coverage** across all source files
- Include `@param`, `@returns`, `@throws`, `@example` tags
- Document "why" not just "what"
- See: [CONTRIBUTING.md](./CONTRIBUTING.md) section "JSDoc Documentation Standards"

## Code Style

### Module Format

- **CommonJS** for current code (`require/module.exports`)
- **TypeScript** for new code (progressive migration)
- Maintain backward compatibility with CommonJS
- Use TypeScript strict mode for new files

### Naming Conventions

- **Classes**: PascalCase (e.g., `PageManager`, `WikiContext`)
- **Functions/methods**: camelCase (e.g., `getPageContent()`, `validateInput()`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_TIMEOUT`, `MAX_RETRIES`)
- **Private methods/properties**: prefix with `#` (e.g., `#validateData()`)
- **Files**: kebab-case or PascalCase matching exports

### DRY Principle

- Reference code, don't duplicate
- Extract common patterns into utilities
- Reuse managers and services across codebase
- Avoid one-off helpers for single use

### Manager Patterns

New features SHOULD extend BaseManager:

```javascript
class NewManager extends BaseManager {
  constructor(engine) {
    super(engine);
  }

  async initialize(config = {}) {
    await super.initialize(config);
    // Manager initialization
  }

  // Implement manager methods
}
```

### WikiContext Pattern

Request handling MUST use WikiContext for state:

```javascript
const wikiContext = this.createWikiContext(req, {
  context: WikiContext.CONTEXT.VIEW,
  pageName: pageName,
  content: content
});

const templateData = this.getTemplateDataFromContext(wikiContext);
```

### Configuration Access

```javascript
const configManager = engine.getManager('ConfigurationManager');
const value = configManager.getProperty('amdwiki.category.property', 'default');
```

### Avoid Over-Engineering

- Implement only what's needed
- Don't add features/refactoring beyond the request
- Don't add error handling for impossible scenarios
- Don't create helpers for one-time operations
- Keep solutions simple and focused
- Trust internal code and framework guarantees

## Testing Standards

### Test Structure

- **Jest framework** for all tests
- **Co-located pattern**: `__tests__/` directories alongside source
- **Mock file operations**: No real file I/O in tests
- Mock `fs-extra` and `gray-matter`

### Coverage Requirements

- **>80% coverage** for all managers
- **>90% coverage** for critical managers
- **Integration tests** for cross-component features
- Unit tests for all public methods

### Test Organization

```
src/managers/PageManager.js
src/managers/__tests__/PageManager.test.js
```

## Version Control

### Commit Messages

- **Semantic format**: `feat:`, `fix:`, `chore:`, `docs:`
- **Imperative mood**: "Add feature" not "Added feature"
- **Reference issues**: "Fix #123"
- Keep messages concise (50 char title)

### Keep a Changelog

- Update [CHANGELOG.md](./CHANGELOG.md) for each release
- Use [Keep a Changelog](https://keepachangelog.com) format
- Include version number and date
- List changes by type: Added, Changed, Fixed, Removed

### Server Restart

Configuration changes require server restart:

```bash
./server.sh restart
```

## File Operations

### Using fs-extra

```javascript
const fs = require('fs-extra');

// Instead of callbacks, use promises
await fs.ensureDir(dirPath);
const exists = await fs.pathExists(filePath);
const data = await fs.readFile(path, 'utf8');
await fs.writeFile(path, data);
```

### Configuration Files

```javascript
const configPath = path.join(__dirname, '../../config/app-default-config.json');
const config = await fs.readJson(configPath);
```

## Error Handling

### Validation

- Validate at system boundaries (user input, external APIs)
- Trust internal code and framework guarantees
- Don't validate for impossible scenarios

### Error Messages

- Be specific about what went wrong
- Suggest corrective action when possible
- Include context in error logs
- Log with appropriate severity level

## Code Quality Tools

### markdownlint

- All documentation files validated
- Configuration: `.markdownlint.json`
- Common rules: MD031 (fenced code blocks spacing), MD041 (first line heading)

### .editorconfig

- Enforces consistent formatting
- Indentation, line endings, trailing whitespace
- IDE integration for automatic application

### Prettier

- Code formatter for JavaScript/TypeScript
- Configuration: `.prettierrc.json`
- Run before committing

## TypeScript Migration

### Strategy

- Progressive migration from CommonJS to TypeScript
- New code written in TypeScript
- Existing CommonJS modules remain compatible
- Strict mode enabled for all TypeScript files

### File Naming

- TypeScript files: `.ts` and `.tsx`
- JavaScript files: `.js` (legacy)
- Type definitions: `.d.ts`

### tsconfig.json Settings

- `"strict": true` - Strict type checking
- `"moduleResolution": "node"` - Node module resolution
- `"declaration": true` - Generate .d.ts files

## Documentation

### Required Locations

- **API documentation**: `docs/api/`
- **Architecture**: `docs/architecture/`
- **Developer guides**: `docs/developer/`
- **Testing guides**: `docs/testing/`

### README Files

- Each major module SHOULD have a README
- Document purpose, usage, and key concepts
- Link to related documentation

## Tools & Configuration

### Development Environment

- Node.js v18+ required
- npm for package management
- PM2 for local development

### Running Tests

```bash
npm test                  # Run all tests
npm run test:coverage     # With coverage report
npm run test:watch       # Watch mode
```

### Building & Type Checking

```bash
npm run build            # Build project
npm run typecheck        # TypeScript checking
```

## Best Practices Summary

1. **Document everything** - JSDoc for code, README for features
2. **Test thoroughly** - >80% coverage, integration tests
3. **Keep it simple** - Avoid premature optimization
4. **DRY principle** - Reference, don't duplicate
5. **Use patterns** - Managers, WikiContext, Providers
6. **Validate smartly** - Only at boundaries
7. **Semantic commits** - Clear version history
8. **Code style** - Use .editorconfig and Prettier

## Related Documentation

- [CONTRIBUTING.md](./CONTRIBUTING.md) - Full development workflow
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design patterns
- [SECURITY.md](./SECURITY.md) - Security best practices
