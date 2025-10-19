---
title: TypeScript Migration Plan
category: System
user-keywords:
  - typescript
  - migration
  - planning
  - architecture
uuid: ts-migration-plan-2025
lastModified: '2025-10-19T00:00:00.000Z'
slug: typescript-migration-plan
---

# TypeScript Migration Plan for amdWiki

**Created**: October 19, 2025
**Status**: 📋 Planning Phase
**Owner**: Development Team

---

## Executive Summary

This document outlines a comprehensive plan to migrate amdWiki from JavaScript to TypeScript. The migration will be **incremental** to minimize disruption and allow for continuous deployment.

**Key Statistics**:
- **Total JS Files**: ~8,462 (including node_modules and tests)
- **Source Files**: ~155 files in `/src`
- **Current Stack**: Node.js + CommonJS + Jest
- **Proposed Stack**: Node.js + TypeScript + CommonJS/ESM hybrid + Jest/ts-jest

---

## Table of Contents

1. [Rationale](#rationale)
2. [Pros and Cons Analysis](#pros-and-cons-analysis)
3. [Runtime Options: Node vs tsx vs ts-node](#runtime-options)
4. [Migration Strategy](#migration-strategy)
5. [Implementation Phases](#implementation-phases)
6. [Configuration Setup](#configuration-setup)
7. [Tooling Decisions](#tooling-decisions)
8. [Risk Assessment](#risk-assessment)
9. [Timeline and Resources](#timeline-and-resources)
10. [Success Criteria](#success-criteria)

---

## Rationale

### Why Migrate to TypeScript?

1. **Type Safety**: Catch errors at compile-time instead of runtime
2. **Better IDE Support**: Enhanced autocomplete, refactoring, and navigation
3. **Self-Documenting Code**: Types serve as inline documentation
4. **Easier Refactoring**: Confidence when making large-scale changes
5. **Growing Ecosystem**: Most modern Node.js projects use TypeScript
6. **Team Scalability**: Easier onboarding for new developers

### Current Pain Points in amdWiki

- **Implicit interfaces**: Classes like `BasePageProvider` have undocumented contracts
- **Configuration typing**: `ConfigurationManager` returns `any` for config properties
- **API response types**: REST endpoints lack type contracts
- **Callback signatures**: Event handlers and filters lack type definitions
- **JSDoc maintenance**: Manual type annotations in comments become stale

---

## Pros and Cons Analysis

### ✅ Pros of TypeScript Migration

| Benefit | Impact | Details |
|---------|--------|---------|
| **Type Safety** | 🟢 High | Catch bugs before runtime (null checks, property typos, etc.) |
| **IDE Support** | 🟢 High | IntelliSense, auto-imports, refactoring tools |
| **Code Quality** | 🟢 High | Forces explicit interfaces and contracts |
| **Maintainability** | 🟢 High | Easier to understand code intent |
| **Refactoring Safety** | 🟢 High | Rename, move, delete with confidence |
| **Documentation** | 🟡 Medium | Types replace some JSDoc, but comments still needed |
| **Ecosystem** | 🟡 Medium | Access to `@types/*` packages and DefinitelyTyped |
| **Modern Features** | 🟡 Medium | Latest ECMAScript features with downlevel compilation |
| **Team Productivity** | 🟢 High | Less time debugging runtime type errors |
| **API Contracts** | 🟢 High | REST endpoints and internal APIs become typed |

**Total Score**: 9/10 (Highly Recommended)

---

### ❌ Cons of TypeScript Migration

| Challenge | Impact | Mitigation |
|-----------|--------|------------|
| **Learning Curve** | 🟡 Medium | Team training, gradual adoption, good docs |
| **Build Step Required** | 🟡 Medium | Use `tsx` or `ts-node` for development |
| **Compilation Time** | 🟡 Medium | Incremental builds, fast tooling (esbuild/swc) |
| **Initial Setup Time** | 🟢 Low | 1-2 days for basic config |
| **Migration Effort** | 🔴 High | ~155 files to migrate (6-12 weeks) |
| **Third-Party Types** | 🟡 Medium | Some packages lack types (need `@types/*` or custom `.d.ts`) |
| **Debugging** | 🟢 Low | Source maps make debugging straightforward |
| **Bundle Size** | 🟢 Low | No runtime overhead (types erased at compile time) |
| **Tooling Complexity** | 🟡 Medium | Additional config files (tsconfig.json, jest.config.ts) |
| **Strict Mode Challenges** | 🟡 Medium | Gradual strictness increase recommended |

**Total Impact**: 6/10 (Manageable with planning)

---

## Runtime Options

### Option 1: Compiled JavaScript (Production Standard) ⭐ **RECOMMENDED**

**How it works**:
```bash
# Development
npm run dev       # tsc --watch + nodemon

# Production
npm run build     # tsc (compile to ./dist)
npm start         # node ./dist/app.js
```

**Pros**:
- ✅ No runtime dependencies (production uses plain JS)
- ✅ Fastest production performance
- ✅ Standard approach for Node.js TypeScript projects
- ✅ Clear separation of source (src/*.ts) and output (dist/*.js)
- ✅ Works with all Node.js tools and infrastructure

**Cons**:
- ❌ Requires build step before running
- ❌ Slower development cycle (compile → run → test)
- ❌ Need to manage compiled output directory

**Best for**: Production deployments, CI/CD pipelines, Docker containers

---

### Option 2: `tsx` (Modern, Fast) 🚀 **RECOMMENDED FOR DEVELOPMENT**

**How it works**:
```bash
npm install --save-dev tsx

# Run TypeScript directly
npx tsx src/app.ts

# Watch mode
npx tsx watch src/app.ts
```

**Pros**:
- ✅ Extremely fast (uses esbuild internally)
- ✅ Zero config required
- ✅ Supports ESM and CommonJS
- ✅ Watch mode built-in
- ✅ Modern, actively maintained
- ✅ Faster than ts-node (5-10x speedup)

**Cons**:
- ❌ Relatively new tool (less mature than ts-node)
- ❌ Not suitable for production (dev-only)
- ❌ Limited type-checking (relies on separate `tsc --noEmit`)

**Best for**: Development, quick prototyping, hot-reload workflows

**Project**: https://github.com/privatenumber/tsx

---

### Option 3: `ts-node` (Traditional)

**How it works**:
```bash
npm install --save-dev ts-node @types/node

# Run TypeScript directly
npx ts-node src/app.ts

# Or add to scripts
"dev": "ts-node src/app.ts"
```

**Pros**:
- ✅ Battle-tested and mature
- ✅ Full type-checking during execution
- ✅ Excellent TypeScript ecosystem integration
- ✅ Works with most Node.js tools

**Cons**:
- ❌ Slower than `tsx` (uses TypeScript compiler directly)
- ❌ Higher memory usage
- ❌ Slower startup time for large projects
- ❌ Not recommended for production

**Best for**: Testing, scripts, traditional setups

---

### Option 4: Hybrid Approach ⭐ **RECOMMENDED STRATEGY**

**Development**: Use `tsx` for fast iteration
```json
{
  "scripts": {
    "dev": "tsx watch src/app.ts",
    "dev:debug": "node --inspect -r tsx/cjs src/app.ts"
  }
}
```

**Production**: Compile to JavaScript
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/app.js",
    "start:prod": "NODE_ENV=production node dist/app.js"
  }
}
```

**Type-checking**: Separate from runtime
```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "typecheck:watch": "tsc --noEmit --watch"
  }
}
```

**Benefits**:
- ⚡ Fast development with `tsx`
- 🏭 Production-ready compiled JS
- 🔍 Explicit type-checking step
- 🧪 Works with existing Jest setup (ts-jest)

---

## Migration Strategy

### Approach: **Incremental Migration** (Recommended)

Rather than converting all 155 files at once, we'll use TypeScript's support for gradual migration.

### Phase-by-Phase Strategy

```
JavaScript (Current)
    ↓
JavaScript + TypeScript Config (Allow .js and .ts)
    ↓
Convert Utilities First (low-risk)
    ↓
Convert Core Classes (providers, managers)
    ↓
Convert Routes and Controllers
    ↓
Convert Tests
    ↓
Full TypeScript (100% coverage)
```

### File Organization

**Before**:
```
src/
  managers/
    PageManager.js
  providers/
    FileSystemProvider.js
```

**During Migration**:
```
src/
  managers/
    PageManager.ts          ✅ Migrated
    AttachmentManager.js    ⏳ Not migrated yet
  providers/
    FileSystemProvider.ts   ✅ Migrated
```

**After**:
```
src/
  managers/
    PageManager.ts
    AttachmentManager.ts
  providers/
    FileSystemProvider.ts

dist/                       # Compiled output
  managers/
    PageManager.js
    AttachmentManager.js
```

---

## Implementation Phases

### Phase 0: Setup and Preparation (Week 1)

**Objective**: Install TypeScript and configure tooling without touching existing code

#### Tasks

- [ ] Install TypeScript and related packages
  ```bash
  npm install --save-dev typescript
  npm install --save-dev @types/node
  npm install --save-dev tsx
  npm install --save-dev ts-jest @types/jest
  ```

- [ ] Create `tsconfig.json` (permissive initial config)
  ```json
  {
    "compilerOptions": {
      "target": "ES2022",
      "module": "commonjs",
      "lib": ["ES2022"],
      "outDir": "./dist",
      "rootDir": "./src",
      "strict": false,              // Start permissive
      "esModuleInterop": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true,
      "resolveJsonModule": true,
      "allowJs": true,              // Allow .js files initially
      "checkJs": false,             // Don't type-check .js files
      "declaration": true,
      "declarationMap": true,
      "sourceMap": true
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.test.js"]
  }
  ```

- [ ] Update `package.json` scripts
  ```json
  {
    "scripts": {
      "dev": "tsx watch src/app.ts",
      "dev:js": "node app.js",
      "build": "tsc",
      "typecheck": "tsc --noEmit",
      "start": "node dist/app.js",
      "test": "jest",
      "test:ts": "jest --config jest.config.ts"
    }
  }
  ```

- [ ] Configure Jest for TypeScript
  ```javascript
  // jest.config.ts
  module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.ts', '**/*.test.ts'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    collectCoverageFrom: [
      'src/**/*.{ts,tsx}',
      '!src/**/__tests__/**',
      '!src/**/*.test.ts'
    ]
  };
  ```

- [ ] Create `.gitignore` updates
  ```
  # TypeScript
  dist/
  *.tsbuildinfo
  ```

- [ ] Document TypeScript setup in `CONTRIBUTING.md`

**Deliverables**:
- TypeScript installed and configured
- Build pipeline working (`npm run build`)
- Tests still passing with existing .js files
- Team trained on TypeScript basics

---

### Phase 1: Utility Functions (Week 2-3)

**Objective**: Convert low-risk utility modules first to gain experience

**Priority Files** (lowest coupling, highest value):
1. `src/utils/DeltaStorage.js` → `.ts`
2. `src/utils/VersionCompression.js` → `.ts`
3. `src/utils/logger.js` → `.ts`
4. `src/utils/config-loader.js` → `.ts`
5. `src/utils/hash.js` → `.ts`
6. `src/utils/slugify.js` → `.ts`

#### Example: Converting DeltaStorage.js

**Before** (`DeltaStorage.js`):
```javascript
const diff = require('fast-diff');

class DeltaStorage {
  createDiff(oldContent, newContent) {
    return diff(oldContent, newContent);
  }

  applyDiff(baseContent, diffData) {
    // Implementation
  }
}

module.exports = DeltaStorage;
```

**After** (`DeltaStorage.ts`):
```typescript
import * as diff from 'fast-diff';

export interface DiffOperation {
  type: 'insert' | 'delete' | 'equal';
  text: string;
}

export class DeltaStorage {
  createDiff(oldContent: string, newContent: string): DiffOperation[] {
    return diff(oldContent, newContent) as DiffOperation[];
  }

  applyDiff(baseContent: string, diffData: DiffOperation[]): string {
    // Implementation with type safety
    let result = '';
    // ... typed implementation
    return result;
  }
}
```

#### Tasks
- [ ] Convert each utility file to `.ts`
- [ ] Add type annotations to all functions
- [ ] Create interfaces for complex data structures
- [ ] Update imports in dependent files (still .js for now)
- [ ] Run tests to ensure no regressions
- [ ] Update JSDoc → TypeScript doc comments

**Deliverables**:
- 6-10 utility files converted
- Type definitions created for common structures
- All tests passing
- Team comfortable with TypeScript syntax

---

### Phase 2: Type Definitions and Interfaces (Week 4)

**Objective**: Create type definitions for core domain models

#### Create Type Definition Files

**File**: `src/types/index.ts`
```typescript
// Page types
export interface WikiPage {
  uuid: string;
  title: string;
  content: string;
  frontmatter: PageFrontmatter;
  version: number;
  lastModified: Date;
  author: string;
  category: string;
}

export interface PageFrontmatter {
  title: string;
  category: string;
  'user-keywords'?: string[];
  uuid: string;
  lastModified: string;
  slug?: string;
  author?: string;
}

// Version types
export interface VersionMetadata {
  version: number;
  dateCreated: Date;
  author: string;
  changeType: 'created' | 'updated' | 'restored' | 'renamed';
  comment?: string;
  contentHash: string;
  contentSize: number;
  compressed: boolean;
  isDelta?: boolean;
}

// User types
export interface User {
  username: string;
  email: string;
  fullName?: string;
  roles: string[];
  isAuthenticated: boolean;
}

// Configuration types
export interface WikiConfig {
  applicationName: string;
  baseURL: string;
  port: number;
  // ... all config properties
}

// API types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

**File**: `src/types/providers.ts`
```typescript
export interface PageProvider {
  initialize(): Promise<void>;
  getPage(identifier: string): Promise<WikiPage | null>;
  savePage(page: WikiPage, userContext: UserContext): Promise<void>;
  deletePage(identifier: string, userContext: UserContext): Promise<void>;
  pageExists(identifier: string): Promise<boolean>;
  getAllPages(): Promise<WikiPage[]>;
}

export interface VersioningPageProvider extends PageProvider {
  getVersionHistory(identifier: string): Promise<VersionMetadata[]>;
  getPageVersion(identifier: string, version: number): Promise<WikiPage>;
  restoreVersion(identifier: string, version: number): Promise<void>;
  compareVersions(identifier: string, v1: number, v2: number): Promise<DiffResult>;
}
```

#### Tasks
- [ ] Create `src/types/` directory
- [ ] Define all core interfaces
- [ ] Export types from `src/types/index.ts`
- [ ] Create type guards for runtime checks
- [ ] Document complex types with TSDoc comments

**Deliverables**:
- Comprehensive type definitions
- Shared types available for import
- Foundation for converting classes

---

### Phase 3: Core Providers (Week 5-6)

**Objective**: Convert provider classes (high complexity, high value)

**Target Files**:
1. `src/providers/BasePageProvider.js` → `.ts` (abstract base)
2. `src/providers/FileSystemProvider.js` → `.ts`
3. `src/providers/VersioningFileProvider.js` → `.ts`
4. `src/providers/BasicAttachmentProvider.js` → `.ts`
5. `src/cache/NodeCacheAdapter.js` → `.ts`

#### Example: BasePageProvider

**Before** (`BasePageProvider.js`):
```javascript
class BasePageProvider {
  constructor(engine) {
    this.engine = engine;
  }

  async getPage(identifier) {
    throw new Error('Must be implemented');
  }
}

module.exports = BasePageProvider;
```

**After** (`BasePageProvider.ts`):
```typescript
import { WikiEngine } from '../core/Engine';
import { WikiPage, UserContext } from '../types';

export abstract class BasePageProvider {
  protected engine: WikiEngine;
  protected initialized: boolean = false;

  constructor(engine: WikiEngine) {
    this.engine = engine;
  }

  abstract initialize(): Promise<void>;
  abstract getPage(identifier: string): Promise<WikiPage | null>;
  abstract savePage(page: WikiPage, userContext: UserContext): Promise<void>;
  abstract deletePage(identifier: string, userContext: UserContext): Promise<void>;
  abstract pageExists(identifier: string): Promise<boolean>;
  abstract getAllPages(): Promise<WikiPage[]>;

  protected ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('Provider not initialized');
    }
  }
}
```

#### Tasks
- [ ] Convert `BasePageProvider` to TypeScript
- [ ] Add abstract method signatures with types
- [ ] Convert `FileSystemProvider` (extends base)
- [ ] Convert `VersioningFileProvider` (extends FileSystemProvider)
- [ ] Update all provider tests to TypeScript
- [ ] Verify provider registry still works

**Deliverables**:
- All providers typed
- Provider interface contracts enforced
- Tests passing with TypeScript

---

### Phase 4: Managers (Week 7-8)

**Objective**: Convert manager classes that orchestrate business logic

**Target Files**:
1. `src/managers/PageManager.js` → `.ts`
2. `src/managers/AttachmentManager.js` → `.ts`
3. `src/managers/SearchManager.js` → `.ts`
4. `src/managers/UserManager.js` → `.ts`
5. `src/managers/ACLManager.js` → `.ts`
6. `src/managers/ConfigurationManager.js` → `.ts`

#### Example: ConfigurationManager

**After** (`ConfigurationManager.ts`):
```typescript
import { WikiConfig } from '../types';

export class ConfigurationManager {
  private config: Partial<WikiConfig> = {};

  getProperty<K extends keyof WikiConfig>(
    key: K,
    defaultValue: WikiConfig[K]
  ): WikiConfig[K] {
    return (this.config[key] ?? defaultValue) as WikiConfig[K];
  }

  setProperty<K extends keyof WikiConfig>(
    key: K,
    value: WikiConfig[K]
  ): void {
    this.config[key] = value;
  }

  // Type-safe getters
  get applicationName(): string {
    return this.getProperty('applicationName', 'amdWiki');
  }

  get port(): number {
    return this.getProperty('port', 3000);
  }
}
```

#### Tasks
- [ ] Convert each manager to TypeScript
- [ ] Add method signatures with return types
- [ ] Type manager dependencies (engine, providers, config)
- [ ] Update manager tests
- [ ] Ensure WikiEngine integration works

**Deliverables**:
- All managers typed
- Manager APIs fully documented via types
- Integration tests passing

---

### Phase 5: Routes and Controllers (Week 9)

**Objective**: Type Express routes and request/response handlers

**Target Files**:
- `src/routes/WikiRoutes.js` → `.ts`
- `src/routes/AuthRoutes.js` → `.ts`
- `src/routes/APIRoutes.js` → `.ts`

#### Example: Typed Express Handler

**Before**:
```javascript
router.get('/api/pages/:page', async (req, res) => {
  const page = await pageManager.getPage(req.params.page);
  res.json({ success: true, data: page });
});
```

**After**:
```typescript
import { Request, Response, NextFunction } from 'express';
import { ApiResponse, WikiPage } from '../types';

interface PageParams {
  page: string;
}

router.get('/api/pages/:page', async (
  req: Request<PageParams>,
  res: Response<ApiResponse<WikiPage>>,
  next: NextFunction
) => {
  try {
    const page = await pageManager.getPage(req.params.page);
    res.json({
      success: true,
      data: page
    });
  } catch (error) {
    next(error);
  }
});
```

#### Tasks
- [ ] Install `@types/express`
- [ ] Type all route handlers
- [ ] Create request/response interfaces
- [ ] Type middleware functions
- [ ] Add error handler types

**Deliverables**:
- All routes typed
- API contracts clear from types
- Integration tests updated

---

### Phase 6: Enable Strict Mode (Week 10)

**Objective**: Gradually increase TypeScript strictness for better type safety

#### Update tsconfig.json

```json
{
  "compilerOptions": {
    "strict": true,                    // Enable all strict checks
    "noImplicitAny": true,             // No implicit 'any' types
    "strictNullChecks": true,          // Null/undefined handling
    "strictFunctionTypes": true,       // Function type checking
    "strictBindCallApply": true,       // bind/call/apply checking
    "noUnusedLocals": true,            // Warn on unused variables
    "noUnusedParameters": true,        // Warn on unused params
    "noImplicitReturns": true,         // All code paths return
    "noFallthroughCasesInSwitch": true // Switch case fall-through
  }
}
```

#### Tasks
- [ ] Enable `strict: true`
- [ ] Fix all type errors file-by-file
- [ ] Add null checks where needed
- [ ] Remove `any` types (replace with proper types or `unknown`)
- [ ] Add return type annotations to all functions
- [ ] Fix unused variable warnings

**Deliverables**:
- Zero TypeScript errors with strict mode
- Null-safety enforced
- No implicit `any` types

---

### Phase 7: Tests and Documentation (Week 11-12)

**Objective**: Convert tests to TypeScript and update docs

#### Convert Tests

**Before** (`PageManager.test.js`):
```javascript
const PageManager = require('../PageManager');

describe('PageManager', () => {
  it('should get page', async () => {
    const page = await pageManager.getPage('test');
    expect(page).toBeDefined();
  });
});
```

**After** (`PageManager.test.ts`):
```typescript
import { PageManager } from '../PageManager';
import { WikiEngine } from '../../core/Engine';
import { WikiPage } from '../../types';

describe('PageManager', () => {
  let pageManager: PageManager;
  let mockEngine: jest.Mocked<WikiEngine>;

  beforeEach(() => {
    mockEngine = createMockEngine();
    pageManager = new PageManager(mockEngine);
  });

  it('should get page', async () => {
    const page: WikiPage | null = await pageManager.getPage('test');
    expect(page).toBeDefined();
    expect(page?.title).toBe('Test Page');
  });
});
```

#### Tasks
- [ ] Convert all test files to `.test.ts`
- [ ] Add type annotations to test data
- [ ] Type mock objects properly
- [ ] Update Jest config for TypeScript
- [ ] Ensure 100% test coverage maintained

#### Update Documentation
- [ ] Update `CONTRIBUTING.md` with TypeScript guidelines
- [ ] Create `docs/TypeScript-Style-Guide.md`
- [ ] Update API documentation with types
- [ ] Add TSDoc comments to public APIs
- [ ] Generate type documentation (TypeDoc)

**Deliverables**:
- All tests in TypeScript
- Documentation updated
- Style guide established

---

## Configuration Setup

### Complete tsconfig.json (Production-Ready)

```json
{
  "compilerOptions": {
    // Target and Module
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],

    // Output
    "outDir": "./dist",
    "rootDir": "./src",
    "removeComments": true,
    "sourceMap": true,

    // Type Checking
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    // Additional Checks
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,

    // Module Resolution
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "forceConsistentCasingInFileNames": true,

    // Declaration Files
    "declaration": true,
    "declarationMap": true,

    // Other
    "skipLibCheck": true,
    "allowJs": false,
    "checkJs": false
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/__tests__/**"
  ]
}
```

### package.json Scripts (Complete)

```json
{
  "scripts": {
    "// Development": "",
    "dev": "tsx watch src/app.ts",
    "dev:inspect": "node --inspect -r tsx/cjs src/app.ts",

    "// Building": "",
    "build": "npm run clean && tsc",
    "build:watch": "tsc --watch",
    "clean": "rm -rf dist",

    "// Type Checking": "",
    "typecheck": "tsc --noEmit",
    "typecheck:watch": "tsc --noEmit --watch",

    "// Production": "",
    "start": "NODE_ENV=production node dist/app.js",
    "start:dev": "NODE_ENV=development node dist/app.js",

    "// Testing": "",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ts": "tsc --noEmit && jest",

    "// Code Quality": "",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "format": "prettier --write \"src/**/*.ts\"",

    "// Documentation": "",
    "docs:generate": "typedoc --out docs/api src/index.ts"
  }
}
```

### Dependencies to Install

```bash
# Core TypeScript
npm install --save-dev typescript @types/node

# Development Runtime
npm install --save-dev tsx ts-node

# Testing
npm install --save-dev ts-jest @types/jest

# Express Types
npm install --save-dev @types/express @types/express-session @types/cookie-parser

# Other Library Types
npm install --save-dev @types/uuid @types/bcrypt @types/multer @types/node-cache

# Linting and Formatting
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install --save-dev prettier eslint-config-prettier

# Documentation
npm install --save-dev typedoc
```

---

## Tooling Decisions

### ESLint Configuration for TypeScript

**File**: `.eslintrc.json`
```json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
  }
}
```

### Prettier Configuration

**File**: `.prettierrc.json`
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

### VS Code Settings

**File**: `.vscode/settings.json`
```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true
    }
  }
}
```

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Breaking changes during migration** | 🟡 Medium | 🔴 High | Incremental migration, comprehensive tests, feature flags |
| **Team resistance to TypeScript** | 🟢 Low | 🟡 Medium | Training, pair programming, gradual adoption |
| **Performance degradation** | 🟢 Low | 🟡 Medium | Benchmark critical paths, use compiled JS in production |
| **Third-party type issues** | 🟡 Medium | 🟢 Low | Custom `.d.ts` files, `@types/*` packages |
| **Compilation errors block deployment** | 🟡 Medium | 🔴 High | Separate type-checking from build, allow warnings initially |
| **Migration takes longer than expected** | 🔴 High | 🟡 Medium | Buffer time, prioritize high-value files, accept partial migration |
| **IDE performance issues** | 🟢 Low | 🟢 Low | Use `skipLibCheck: true`, incremental compilation |

---

## Timeline and Resources

### Total Duration: **12 Weeks** (3 months)

| Phase | Duration | Resources | Risk |
|-------|----------|-----------|------|
| Phase 0: Setup | 1 week | 1 dev | Low |
| Phase 1: Utilities | 2 weeks | 1-2 devs | Low |
| Phase 2: Type Definitions | 1 week | 1 dev | Medium |
| Phase 3: Providers | 2 weeks | 2 devs | High |
| Phase 4: Managers | 2 weeks | 2 devs | High |
| Phase 5: Routes | 1 week | 1 dev | Medium |
| Phase 6: Strict Mode | 1 week | 2 devs | Medium |
| Phase 7: Tests & Docs | 2 weeks | 2 devs | Low |

**Total Effort**: ~20-24 person-weeks

### Resource Requirements

- **Senior TypeScript Developer**: Lead migration, review PRs
- **Development Team**: Convert files, write tests
- **QA/Testing**: Regression testing at each phase
- **DevOps**: Update CI/CD for TypeScript builds

---

## Success Criteria

### Technical Metrics

- [ ] ✅ 100% of source files converted to TypeScript
- [ ] ✅ Zero TypeScript errors with `strict: true`
- [ ] ✅ All tests passing (90%+ coverage maintained)
- [ ] ✅ Build time < 30 seconds for incremental builds
- [ ] ✅ No performance regressions in production
- [ ] ✅ IDE autocomplete working for all modules

### Quality Metrics

- [ ] ✅ All public APIs have type definitions
- [ ] ✅ All complex types documented with TSDoc
- [ ] ✅ Zero `any` types in production code
- [ ] ✅ Type guards for runtime validation
- [ ] ✅ Code review standards include type safety

### Documentation Metrics

- [ ] ✅ TypeScript style guide published
- [ ] ✅ Migration guide for team members
- [ ] ✅ API documentation includes types
- [ ] ✅ CONTRIBUTING.md updated

---

## Recommended Decision: **YES, Migrate to TypeScript**

### Summary

**Verdict**: ⭐ **Strongly Recommended**

**Rationale**:
1. **High value**: Type safety will prevent entire categories of bugs
2. **Manageable effort**: 12 weeks for 155 files is reasonable
3. **Low risk**: Incremental migration allows continuous deployment
4. **Modern tooling**: `tsx` and compiled JS provide best of both worlds
5. **Team growth**: Investment in developer productivity and code quality

### Recommended Approach

1. **Development**: Use `tsx` for fast iteration
2. **Production**: Compile to JavaScript for zero runtime overhead
3. **Migration**: Incremental (utilities → providers → managers → routes)
4. **Strictness**: Start permissive, gradually enable strict mode
5. **Timeline**: 12 weeks with 2 developers

### Next Steps

1. Get team buy-in and schedule TypeScript training
2. Create Phase 0 setup PR (no code changes, just config)
3. Convert 2-3 utility files as proof-of-concept
4. Review with team and adjust plan
5. Proceed with full migration

---

**Approved**: _______________
**Start Date**: _______________
**Target Completion**: _______________

---

**Document Version**: 1.0
**Last Updated**: October 19, 2025
**Next Review**: Start of Phase 3
