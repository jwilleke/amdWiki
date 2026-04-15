# Contributing

Thank you for your interest in contributing to this project! This document provides guidelines for developers and AI agents working on this codebase.

## Before You Start

- Read [AGENTS.md](./AGENTS.md) for project context and status
- Review [CODE_STANDARDS.md](./CODE_STANDARDS.md) for coding guidelines and guiding principles
- Check [SECURITY.md](./SECURITY.md) for security practices
- See [ARCHITECTURE.md](./ARCHITECTURE.md) for project structure

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Making Changes](#making-changes)
- [Commit Guidelines](#commit-guidelines)
- [Pull Requests](#pull-requests)
- [Code Review Process](#code-review-process)

## Getting Started

See [README.md](./README.md#quick-start) for setup instructions including prerequisites, cloning, and dependency installation.

## Development Workflow

### Read Project Context First

Before starting work, read `AGENTS.md` to understand:

- Project goals and current status
- Architecture and tech stack
- Known blockers or issues
- Priority tasks

Use the slash command:

```bash
/context
```

### Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
git checkout -b fix/bug-description
```

Branch naming: `type/description`

### Make Changes

Follow [CODE_STANDARDS.md](./CODE_STANDARDS.md) for all code conventions including TypeScript strict mode, naming conventions, formatting rules, and the DRY principle.

## Making Changes

### Linting and Formatting

```bash
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix issues
npm run format      # Format with Prettier
```

### Testing

```bash
npm run test              # Run tests
npm run test:watch        # Watch mode
npm run test:coverage     # Check coverage
```

## Commit Guidelines

**All commit messages must follow the format specified in [CODE_STANDARDS.md - Git Commit Messages](./CODE_STANDARDS.md#git-commit-messages).**

This includes:

- Conventional commits format (type, scope, description)
- Required types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`
- Pre-commit hooks that enforce linting standards

## Pull Requests

### Before Creating a PR

1. Update branch: `git fetch origin && git rebase origin/master`
2. Run tests: `npm run lint && npm run test && npm run build`
3. Update [AGENTS.md](./AGENTS.md) if making significant changes

### PR Checklist

- [ ] Code follows [CODE_STANDARDS.md](./CODE_STANDARDS.md)
- [ ] Tests pass
- [ ] Linting passes
- [ ] No hardcoded secrets
- [ ] Commit messages follow [CODE_STANDARDS.md conventions](./CODE_STANDARDS.md#git-commit-messages)
- [ ] [AGENTS.md](./AGENTS.md) updated if applicable

## Code Review Process

- Be respectful and constructive
- Review promptly
- Approve when satisfactory
- All CI checks must pass before merging

## Questions?

- Check AGENTS.md for project context
- Read CODE_STANDARDS.md for guidelines
- Open an issue for questions
