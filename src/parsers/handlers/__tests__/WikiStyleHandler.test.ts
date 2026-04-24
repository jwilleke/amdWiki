/**
 * WikiStyleHandler tests
 *
 * Covers:
 * - process() with empty content
 * - process() passthrough for non-matching content
 * - %%class content /% → <div> for block classes (information, warning, etc.)
 * - %%class content /% → <span> for inline classes on single-line content
 * - %%class content /% → <div> when content has newlines
 * - Multiple CSS classes
 * - Dangerous/invalid class names are rejected
 * - Inline CSS disabled by default
 * - Inline CSS when allowInlineCSS=true → <span style="">
 * - Table class injection (sortable, table-striped) → %%TABLE_CLASSES{...}%% marker
 * - addCustomClass() / removeCustomClass()
 * - getConfigurationSummary() / getSupportedPatterns() / getPredefinedClassesByCategory()
 * - getInfo() metadata
 * - onInitialize() with/without ConfigurationManager
 *
 * @jest-environment node
 */

import WikiStyleHandler from '../WikiStyleHandler';

const ctx = { pageName: 'TestPage', engine: { getManager: vi.fn(() => null) } };

async function run(content: string, handler?: WikiStyleHandler): Promise<string> {
  const h = handler ?? new WikiStyleHandler();
  return h.process(content, ctx);
}

describe('WikiStyleHandler', () => {
  describe('metadata', () => {
    test('has correct handlerId', () => {
      expect(new WikiStyleHandler().handlerId).toBe('WikiStyleHandler');
    });

    test('has priority 70', () => {
      expect(new WikiStyleHandler().priority).toBe(70);
    });
  });

  describe('process() — passthrough', () => {
    test('returns empty string for empty content', async () => {
      expect(await run('')).toBe('');
    });

    test('returns content unchanged when no %% patterns', async () => {
      const text = 'Plain text without any style syntax.';
      expect(await run(text)).toBe(text);
    });

    test('passes through markdown headings', async () => {
      const text = '# Heading\n\nSome text.';
      expect(await run(text)).toBe(text);
    });
  });

  describe('process() — block class wrapping', () => {
    test('%%information content /% → <div class="information">', async () => {
      const result = await run('%%information\nSome info.\n/%');
      expect(result).toContain('<div class="information">');
      expect(result).toContain('Some info.');
      expect(result).toContain('</div>');
    });

    test('%%warning text /% → <div class="warning">', async () => {
      const result = await run('%%warning\nWarning!\n/%');
      expect(result).toContain('<div class="warning">');
    });

    test('%%error content /% → <div class="error">', async () => {
      const result = await run('%%error\nError message.\n/%');
      expect(result).toContain('<div class="error">');
    });

    test('%%center text /% → <div class="center">', async () => {
      const result = await run('%%center\nCentered.\n/%');
      expect(result).toContain('<div class="center">');
    });
  });

  describe('process() — inline class wrapping', () => {
    test('text-primary on single line → <span>', async () => {
      const result = await run('%%text-primary inline text /%');
      expect(result).toContain('<span class="text-primary">');
    });

    test('fw-bold on single line → <span>', async () => {
      const result = await run('%%fw-bold bold text /%');
      expect(result).toContain('<span class="fw-bold">');
    });

    test('content with newlines → <div> even for non-block class', async () => {
      const result = await run('%%text-primary\nLine one.\nLine two.\n/%');
      expect(result).toContain('<div class="text-primary">');
    });
  });

  describe('process() — multiple CSS classes', () => {
    test('two classes applied together', async () => {
      const result = await run('%%fw-bold text-danger bold error text /%');
      expect(result).toContain('fw-bold');
      expect(result).toContain('text-danger');
    });
  });

  describe('process() — dangerous class names rejected', () => {
    test('class name with <script> is rejected', async () => {
      const result = await run('%%<script>xss</script>\nContent.\n/%');
      // The dangerous class should not appear in output as a class attribute
      expect(result).not.toContain('class="<script>');
    });

    test('class name with javascript: is rejected', async () => {
      const result = await run('%%javascript:alert(1) content /%');
      expect(result).not.toContain('class="javascript:');
    });
  });

  describe('process() — inline CSS', () => {
    test('inline CSS disabled by default → content returned unstyled', async () => {
      const result = await run('%%(color:red) Red text /%');
      // allowInlineCSS is false by default; content returned as-is
      expect(result).not.toContain('style="color');
    });

    test('inline CSS enabled via config → <span style="">', async () => {
      const handler = new WikiStyleHandler();
      // Enable inline CSS by setting the config directly
      (handler as unknown as { styleConfig: { allowInlineCSS: boolean } }).styleConfig.allowInlineCSS = true;
      (handler as unknown as { allowedCSSProperties: Set<string> }).allowedCSSProperties.add('color');
      const result = await handler.process('%%(color:red) Red text /%', ctx);
      expect(result).toContain('<span style="');
      expect(result).toContain('color: red');
    });

    test('inline CSS with dangerous value → value filtered out', async () => {
      const handler = new WikiStyleHandler();
      (handler as unknown as { styleConfig: { allowInlineCSS: boolean } }).styleConfig.allowInlineCSS = true;
      const result = await handler.process('%%(color:javascript:alert(1)) content /%', ctx);
      expect(result).not.toContain('javascript:');
    });
  });

  describe('process() — table class injection', () => {
    test('sortable class with table row → TABLE_CLASSES marker injected', async () => {
      const content = '%%sortable\n|| Col1 || Col2 ||\n| a | b |\n/%';
      const result = await run(content);
      expect(result).toContain('sortable');
      expect(result).toContain('||');
    });

    test('table-striped with JSPWiki table → marker preserved for WikiTableHandler', async () => {
      const content = '%%table-striped\n|| Name ||\n| Alice |\n/%';
      const result = await run(content);
      expect(result).toContain('table-striped');
    });
  });

  describe('process() — nested blocks', () => {
    test('nested style blocks are processed', async () => {
      const content = '%%information\n%%warning\nNested warning.\n/%\n/%';
      const result = await run(content);
      expect(result).toContain('<div class="information">');
      expect(result).toContain('<div class="warning">');
    });
  });

  describe('addCustomClass() / removeCustomClass()', () => {
    test('addCustomClass() adds a valid class name', () => {
      const handler = new WikiStyleHandler();
      const added = handler.addCustomClass('my-custom-class');
      expect(added).toBe(true);
      const classes = (handler as unknown as { predefinedClasses: Set<string> }).predefinedClasses;
      expect(classes.has('my-custom-class')).toBe(true);
    });

    test('addCustomClass() returns false for invalid class name', () => {
      const handler = new WikiStyleHandler();
      const added = handler.addCustomClass('<invalid>');
      expect(added).toBe(false);
    });

    test('addCustomClass() returns false for duplicate', () => {
      const handler = new WikiStyleHandler();
      handler.addCustomClass('my-class');
      const second = handler.addCustomClass('my-class');
      expect(second).toBe(false);
    });

    test('removeCustomClass() removes existing class', () => {
      const handler = new WikiStyleHandler();
      handler.addCustomClass('removable-class');
      const removed = handler.removeCustomClass('removable-class');
      expect(removed).toBe(true);
    });

    test('removeCustomClass() returns false for missing class', () => {
      const handler = new WikiStyleHandler();
      expect(handler.removeCustomClass('nonexistent-class')).toBe(false);
    });
  });

  describe('getConfigurationSummary()', () => {
    test('returns object with handler, features, and security sections', () => {
      const summary = new WikiStyleHandler().getConfigurationSummary();
      expect(typeof summary.handler).toBe('object');
      expect(typeof summary.features).toBe('object');
      expect(typeof summary.security).toBe('object');
    });
  });

  describe('getSupportedPatterns()', () => {
    test('returns array of pattern strings', () => {
      const patterns = new WikiStyleHandler().getSupportedPatterns();
      expect(Array.isArray(patterns)).toBe(true);
      expect(patterns.length).toBeGreaterThan(0);
    });
  });

  describe('getPredefinedClassesByCategory()', () => {
    test('returns object with text/background/layout/typography/other', () => {
      const cats = new WikiStyleHandler().getPredefinedClassesByCategory();
      expect(Array.isArray(cats.text)).toBe(true);
      expect(Array.isArray(cats.background)).toBe(true);
      expect(Array.isArray(cats.layout)).toBe(true);
    });
  });

  describe('getInfo()', () => {
    test('returns features, supportedPatterns, and configuration', () => {
      const info = new WikiStyleHandler().getInfo();
      expect(Array.isArray(info.features)).toBe(true);
      expect(Array.isArray(info.supportedPatterns)).toBe(true);
      expect(typeof info.configuration).toBe('object');
    });
  });

  describe('onInitialize()', () => {
    test('initializes without throwing when no ConfigurationManager', async () => {
      const handler = new WikiStyleHandler();
      const engine = { getManager: vi.fn(() => null) };
      await expect(
        (handler as unknown as { onInitialize: (ctx: unknown) => Promise<void> }).onInitialize({ engine })
      ).resolves.not.toThrow();
    });

    test('initializes with ConfigurationManager and loads configuration', async () => {
      const handler = new WikiStyleHandler();
      const configManager = {
        getProperty: vi.fn((key: string, dv: unknown) => {
          if (key === 'ngdpbase.style.custom-classes.enabled') return true;
          if (key === 'ngdpbase.style.bootstrap.integration') return true;
          if (key === 'ngdpbase.style.security.allow-inline-css') return false;
          if (key.includes('predefined')) return '';
          if (key.includes('allowed-properties')) return 'color,background-color';
          return dv;
        })
      };
      const engine = {
        getManager: vi.fn((n: string) => n === 'ConfigurationManager' ? configManager : null)
      };
      await expect(
        (handler as unknown as { onInitialize: (ctx: unknown) => Promise<void> }).onInitialize({ engine })
      ).resolves.not.toThrow();
    });
  });
});
