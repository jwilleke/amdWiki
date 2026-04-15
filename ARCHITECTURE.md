# Architecture

This document outlines the project structure and architectural decisions.

Related documents:

- [CODE_STANDARDS.md](./CODE_STANDARDS.md) - Coding standards and conventions
- [SECURITY.md](./SECURITY.md) - Security guidelines and best practices
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Development workflow
- [AGENTS.md](./AGENTS.md) - Project context and goals

## Project Structure

```text
src/
├── controllers/     # HTTP request handlers / API routes
├── services/        # Business logic and core functionality
├── models/          # Data models and TypeScript types
├── middleware/       # Express middleware or similar
├── utils/           # Utility functions and helpers
├── types/           # TypeScript type definitions and interfaces
└── index.ts         # Application entry point
docs/                # Developer documentation
.github/workflows/   # CI/CD pipelines
```

## Directory Conventions

- **controllers/** - Handle incoming requests and orchestrate responses
- **services/** - Contain business logic, database operations, external API calls
- **models/** - Data structures, interfaces, type definitions
- **middleware/** - Authentication, logging, error handling, validation
- **utils/** - Pure functions, helpers, shared utilities
- **types/** - TypeScript interfaces and types (can also inline in files if small)

## Technology Stack

- **Runtime:** Node.js (v18+)
- **Language:** TypeScript (strict mode, ESM)
- **Package Manager:** npm
- **Testing:** Vitest
- **Linting:** ESLint 9 (flat config) + Prettier + Markdownlint
- **Dev runner:** tsx (ESM-native TypeScript execution)
- **Hooks:** Husky + lint-staged

## Configuration Files

- `tsconfig.json` - TypeScript compiler configuration (strict mode, ESM)
- `tsconfig.build.json` - Build-only config (excludes test files)
- `eslint.config.mjs` - ESLint rules (flat config)
- `vitest.config.ts` - Test runner configuration
- `.prettierrc.json` - Prettier rules for code formatting
- `.env` - Environment variables (not committed)
- `package.json` - Project metadata and scripts

## Naming Conventions

See [CODE_STANDARDS.md](./CODE_STANDARDS.md#naming-conventions) for complete naming conventions.

## Code Quality Standards

See [CODE_STANDARDS.md](./CODE_STANDARDS.md) for all code quality standards including TypeScript configuration, linting rules, formatting, testing requirements, and guiding principles.

## Development Workflow

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the complete development workflow including branching strategy, making changes, testing, and pull request process.

## Security Considerations

See [SECURITY.md](./SECURITY.md) for comprehensive security guidelines including secret management, input validation, database security, authentication practices, and OWASP compliance.
