# TypeScript Configuration

**Target**: ES2022
**Module System**: CommonJS (with future ES modules support planned)
**Runtime**: Node.js 18+

## Compiler Options

### ES Version: ES2022

ES2022 features available:

- Top-level await
- Class fields and private methods
- `at()` method for arrays
- `Object.hasOwn()`
- Error cause property
- WeakRef and FinalizationRegistry

### Strict Mode

Currently `strict: false` during TypeScript migration (Issue #139).

**Post-migration**: Will enable `strict: true` with:

- strictNullChecks
- noImplicitAny
- strictFunctionTypes
- strictBindCallApply
- strictPropertyInitialization
- noImplicitThis
- alwaysStrict

## Migration Strategy

See: `/docs/planning/TypeScript-Migration-Plan.md`

## References

- **CODE_STANDARDS.md**: Code standards and conventions
- **tsconfig.json**: Complete TypeScript compiler configuration
- **Issue #139**: TypeScript Migration Epic
