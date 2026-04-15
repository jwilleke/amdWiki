# Project Template

A Node.js/TypeScript project template with production-ready tooling, code standards, and multi-agent collaboration framework.

## Quick Start

### Prerequisites

- **Node.js** v18+ (`node --version`) — [download](https://nodejs.org/)
- **npm** v9+ (`npm --version`)
- **Git** (`git --version`)

### Setup

```bash
git clone <repository-url>
cd <project-name>
nvm use                  # Uses .nvmrc (Node 20)
npm install
cp .env.example .env     # Edit with your values
```

### Verify

```bash
npm run lint             # Lint code + markdown
npm run typecheck        # TypeScript type checking
npm run test             # Run tests
npm run build            # Build project
```

## Development Scripts

```bash
npm run dev              # Start development server (tsx)
npm run build            # Build project (TypeScript -> dist/)
npm start                # Run built project
npm run lint             # Lint code AND markdown
npm run lint:fix         # Auto-fix lint issues
npm run format           # Format with Prettier
npm run test             # Run tests (Vitest)
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
npm run lint:code        # ESLint only
npm run lint:md          # Markdown only
npm run typecheck        # TypeScript type checking without emit
```

## Documentation

- **[AGENTS.md](AGENTS.md)** - Project context, status, and AI agent collaboration
- **[CODE_STANDARDS.md](CODE_STANDARDS.md)** - Code quality, style, and guiding principles
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Project structure and patterns
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Development workflow and PRs
- **[SECURITY.md](SECURITY.md)** - Security guidelines and best practices
- **[.github/workflows/README.md](.github/workflows/README.md)** - CI/CD pipelines

## What's Included

### Code Quality Tools

- **TypeScript** - Strict type checking
- **ESLint 9** - Code quality with flat config (`eslint.config.mjs`)
- **Vitest** - Fast test runner
- **Prettier** - Automatic code formatting
- **Markdownlint** - Documentation consistency
- **EditorConfig** - Cross-editor consistency
- **Husky + lint-staged** - Pre-commit hooks on changed files only

### Configuration Files

- `eslint.config.mjs` - ESLint rules (flat config)
- `vitest.config.ts` - Test runner configuration
- `.prettierrc.json` - Prettier formatting
- `.markdownlint.json` - Markdown linting rules
- `tsconfig.json` - TypeScript settings (ESM)
- `tsconfig.build.json` - Build-only config
- `.editorconfig` - Editor settings
- `.env.example` - Environment template
- `.nvmrc` - Node version for nvm
- `.husky/` - Git hooks

### GitHub Integration

- **CI workflow** - Lint, typecheck, test, build, security audit
- **Deploy workflow** - Production deployment template
- **PR template** - Standardized pull request format
- **Issue templates** - Bug reports and feature requests

## Using This Template

### For New Projects

- **Clone** this template
- **Run** `npm install`
- **Update** AGENTS.md with your project context
- **Update** README.md with your project details
- **Start developing** following CODE_STANDARDS.md

### For Existing Projects

See [TEMPLATE_INTEGRATION.md](TEMPLATE_INTEGRATION.md) for the smart merge utility.

## For Teams

This template supports teams and AI agents collaborating:

- **AGENTS.md** - Single source of truth for project state (works with any AI agent)
- **CLAUDE.md** - Thin pointer to AGENTS.md (auto-loaded by Claude Code)
- **CODE_STANDARDS.md** - Coding rules and guiding principles
- **CONTRIBUTING.md** - Development workflow

## Troubleshooting

### npm install fails

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Node version issues

```bash
nvm install 20
nvm use 20
```

### Port already in use

```bash
PORT=3001 npm run dev
```

## Customization

- **README.md** - Add project-specific information
- **CODE_STANDARDS.md** - Adjust rules for your team
- **package.json** - Update project name and dependencies
- **.env.example** - Add your required environment variables
- **ARCHITECTURE.md** - Document your specific architecture
- **SECURITY.md** - Review and customize security policies
- **.github/workflows/** - Configure CI/CD for your deployment target
