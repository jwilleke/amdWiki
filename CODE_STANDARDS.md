# Code Standards

This document outlines the coding standards and best practices for this project.

Related documents:

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Project structure and architectural patterns
- [SECURITY.md](./SECURITY.md) - Security guidelines and dependency management
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Development workflow and contribution process

## Guiding Principles

- **DRY** (Don't Repeat Yourself) - Every piece of knowledge should have a single, unambiguous, authoritative representation. Refactor repeated logic into reusable components.
- **Iterate progressively** - Start with core features only. Gather feedback.
- **No secrets in Git** - NEVER put unencrypted secrets in Git or other CMS systems.
- **GitHub CLI** - Primary method for interacting with GitHub.
- **Think first** - Present options before implementing. On larger objectives, present a phased plan.
- **Markdown style** - Use **bold** at start of list items. Use bullet points, not numbered lists (section headers like `## Step 1` are fine).

## Language & Environment

- **Language:** English (US) for all code and documentation
- **Runtime:** Node.js with TypeScript
- **Target:** ES2020

## TypeScript Configuration

We use strict TypeScript settings (`strict: true`) to catch potential bugs at compile time. Key settings:

- Strict null checks enabled
- No implicit `any` types
- No unused variables or parameters
- All functions must have explicit return types (unless inferable)
- No implicit returns

See `tsconfig.json` for full configuration.

## Code Formatting

### Prettier

Automatic code formatting using Prettier ensures consistency across the codebase.

Key settings:

- Single quotes for strings
- 2-space indentation
- 100-character line width
- Trailing commas disabled
- Unix line endings (LF)

Run formatting:

```bash
npm run format
```

### EditorConfig

EditorConfig settings (`.editorconfig`) ensure consistent editor behavior across different tools and IDEs.

## Linting

### ESLint

We use ESLint 9 (flat config) with TypeScript support to catch code quality issues.

Configuration: `eslint.config.mjs`

Key rules:

- Prefer `const` over `let` and `var`
- Unused variables must be prefixed with `_`
- `console` calls trigger warnings (use proper logging instead)
- Single quotes required (unless string contains quotes)
- Semicolons required
- Explicit function return types (with exceptions)
- No floating promises - always `await` async operations
- Proper async/await usage

Run linting:

```bash
npm run lint          # Runs both code and markdown linting
npm run lint:code     # ESLint only
```

Auto-fix fixable issues:

```bash
npm run lint:fix      # Fixes both code and markdown
npm run lint:code:fix # ESLint only
```

### Markdownlint

We use Markdownlint to ensure consistent and well-formatted documentation.

Configuration: `.markdownlint.json`

Key rules:

- Consistent heading style
- 2-space indentation for lists
- Line length limits (300 chars general, 80 for headings)
- Blank lines around lists and code blocks
- Consistent list marker style
- **No bold text as headings (MD036)** - Use proper heading syntax (`##`, `###`, etc.) instead of `**Bold:**`

Run markdown linting:

```bash
npm run lint:md       # Check all markdown files
npm run lint:md:fix   # Auto-fix markdown issues (note: MD036 requires manual fix)
```

**Heading vs Bold Text:**

```markdown
<!-- Bad - bold text used as heading -->
**Update Requirements:**
- Item 1
- Item 2

<!-- Good - proper heading -->
### Update Requirements

- Item 1
- Item 2
```

## Naming Conventions

- **Files:** Use kebab-case for file names (e.g., `user-service.ts`, `auth-controller.ts`)
- **Classes:** Use PascalCase (e.g., `UserService`, `AuthController`)
- **Functions/Variables:** Use camelCase (e.g., `getUserById`, `isActive`)
- **Constants:** Use UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`, `DEFAULT_TIMEOUT`)
- **Private members:** Prefix with underscore (e.g., `_internalState`, `_validateInput()`)

## Code Organization

### Function Length

- Keep functions focused and single-purpose
- Prefer functions under 50 lines
- Extract complex logic into separate functions

### Comments

- Avoid obvious comments
- Explain *why*, not *what* - the code shows what it does
- Use JSDoc for public APIs and complex functions

Example:

```typescript
/**
 * Validates user email format
 * @param email - The email to validate
 * @returns true if valid RFC 5322 format
 */
function validateEmail(email: string): boolean {
  // Implementation...
}
```

## Error Handling

- Always handle promise rejections
- Use typed errors when possible
- Provide meaningful error messages
- Log errors appropriately

## Testing

We use [Vitest](https://vitest.dev/) as the test runner. Configuration: `vitest.config.ts`

- Write tests for all public functions
- Place test files alongside source: `foo.ts` -> `foo.test.ts`
- Use test naming convention: `describe()` for groups, `it()` for specs
- Aim for >80% code coverage
- Test behavior, not implementation details

```bash
npm run test             # Run tests once
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

## Git Commit Messages

Follow conventional commits format:

```text
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

Example:

```text
feat(auth): add JWT token refresh mechanism

Adds automatic token refresh when access token expires.
Implements exponential backoff for retry logic.

Closes #123
```

## Pre-commit Hooks

Husky + lint-staged runs linting on **changed files only** before each commit. Commits with linting errors will be rejected.

The pre-commit hook runs via lint-staged:

- ESLint + Prettier on staged `.ts` files
- Markdownlint on staged `.md` files

Run the full lint manually:

```bash
npm run lint          # Runs both code and markdown linting
```

## Package Standards

Keep dependencies minimal, well-maintained, and secure.

For complete dependency security guidance, see [SECURITY.md](./SECURITY.md#dependency-management).

Quick checklist:

- Regularly audit: `npm audit`
- Document why each dependency is needed
- Use exact versions for critical dependencies
- Update promptly when security issues are found

## Environment Variables

- Store sensitive data in `.env` files (never commit)
- Document required environment variables in `.env.example`
- Use meaningful variable names: `DATABASE_URL`, not `DB`

## Performance Considerations

- Avoid N+1 queries in loops
- Use async/await properly to prevent blocking
- Cache expensive operations when appropriate
- Profile before optimizing

## Documentation

- Keep README up to date
- Document complex algorithms
- Add examples for public APIs
- Update [AGENTS.md](./AGENTS.md) when making significant changes
- See [ARCHITECTURE.md](./ARCHITECTURE.md) for architectural documentation standards
- All markdown files must pass markdownlint (`npm run lint:md`)

## Review Checklist

Before submitting code for review:

- [ ] Code passes linting (`npm run lint` - includes both code and markdown)
- [ ] Code is formatted (`npm run format`)
- [ ] Tests pass and coverage is adequate
- [ ] TypeScript compiles without errors
- [ ] Markdown files pass linting (included in `npm run lint`)
- [ ] No console.log statements in production code
- [ ] Commit message follows [conventions](#git-commit-messages)
- [ ] [AGENTS.md](./AGENTS.md) updated if applicable
- [ ] No hardcoded secrets or credentials
