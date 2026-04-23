import { defineConfig } from 'vitest/config';
import type { Plugin } from 'vite';

// Strip `module.exports = X` CJS compat shims from TypeScript source files.
// These shims cause "Cannot set property default" errors in Vitest's ESM module
// system when a file has both `export default X` and `module.exports = X`.
const stripCjsShims: Plugin = {
  name: 'strip-cjs-shims',
  enforce: 'pre',
  transform(code, id) {
    if (!id.endsWith('.ts') || id.includes('node_modules') || id.includes('__tests__')) {
      return;
    }
    // Only strip CJS shims from files that already have a TypeScript ESM default export.
    // Files with ONLY module.exports (no export default) are left untouched so Vitest's
    // CJS interop layer can handle them correctly.
    const hasEsmDefaultExport = /^export\s+default\s/m.test(code) || /^export\s*=/m.test(code);
    if (!hasEsmDefaultExport) {
      return;
    }
    // Strip all module.exports CJS compat assignments:
    //   module.exports = X;
    //   (module.exports as ...).default = X;
    //   Object.assign(module.exports, { ... });
    let stripped = code.replace(/^\s*(?:\(module\.exports[^)]*\)|module\.exports)[^\n]*\n/gm, '\n');
    stripped = stripped.replace(/^\s*Object\.assign\(module\.exports[^\n]*\n/gm, '\n');
    if (stripped !== code) {
      return { code: stripped, map: null };
    }
  }
};

export default defineConfig({
  plugins: [stripCjsShims],
  resolve: {
    // Map .js imports to .ts sources so Vitest can resolve ESM-style imports
    // (TypeScript emits `import './foo.js'` but source files are `.ts`)
    extensionAlias: {
      '.js': ['.ts', '.js']
    }
  },
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    include: [
      'src/**/__tests__/**/*.ts',
      'src/**/*.test.ts',
      'addons/**/__tests__/**/*.ts',
      'addons/**/*.test.ts'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'tests/e2e/**'
    ],
    testTimeout: 20000,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/__tests__/**',
        'src/legacy/**',
        '**/*.d.ts'
      ],
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: 'coverage'
    }
  }
});
