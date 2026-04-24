/**
 * TabsPlugin tests
 *
 * Covers:
 * - Empty/null body → ''
 * - Single tab rendering
 * - Multiple tabs with active first
 * - Style variants: tabs (default), pills, underline
 * - Persist localStorage script on/off
 * - No engine graceful degradation
 *
 * @jest-environment node
 */

import TabsPlugin from '../TabsPlugin';

const makeConfigManager = (style = 'tabs', persist = true) => ({
  getProperty: vi.fn((key: string, def: unknown) => {
    if (key === 'ngdpbase.tab.style') return style;
    if (key === 'ngdpbase.tab.persist') return persist;
    return def;
  })
});

const makeEngine = (configManager: unknown = null) => ({
  getManager: vi.fn((name: string) => name === 'ConfigurationManager' ? configManager : null)
});

describe('TabsPlugin', () => {
  describe('metadata', () => {
    test('has correct name, version and execute function', () => {
      expect(TabsPlugin.name).toBe('TabsPlugin');
      expect(TabsPlugin.version).toBe('1.0.0');
      expect(typeof TabsPlugin.execute).toBe('function');
    });
  });

  describe('empty/null body', () => {
    test('returns empty string for empty body', async () => {
      const result = await TabsPlugin.execute({ bodyContent: '' }, {});
      expect(result).toBe('');
    });

    test('returns empty string for null body', async () => {
      const result = await TabsPlugin.execute({ bodyContent: null }, {});
      expect(result).toBe('');
    });

    test('returns empty string when no tab blocks found', async () => {
      const result = await TabsPlugin.execute({ bodyContent: 'Just regular text here' }, {});
      expect(result).toBe('');
    });
  });

  describe('single tab', () => {
    test('renders one tab and pane', async () => {
      const body = "[{Tab name='Overview'}]Some content here[{/Tab}]";
      const result = await TabsPlugin.execute({ bodyContent: body, pageName: 'TestPage' }, {});
      expect(result).toContain('Overview');
      expect(result).toContain('Some content here');
      expect(result).toContain('ngdp-tabs');
      expect(result).toContain('nav-tabs');
    });

    test('first tab is active', async () => {
      const body = "[{Tab name='First'}]Content[{/Tab}]";
      const result = await TabsPlugin.execute({ bodyContent: body }, {});
      expect(result).toContain('class="nav-link active"');
      expect(result).toContain('class="tab-pane fade show active"');
    });
  });

  describe('multiple tabs', () => {
    test('renders all tab buttons and panes', async () => {
      const body = "[{Tab name='Alpha'}]Content A[{/Tab}][{Tab name='Beta'}]Content B[{/Tab}][{Tab name='Gamma'}]Content C[{/Tab}]";
      const result = await TabsPlugin.execute({ bodyContent: body, pageName: 'MultiPage', engine: makeEngine() }, {});
      expect(result).toContain('Alpha');
      expect(result).toContain('Beta');
      expect(result).toContain('Gamma');
      expect(result).toContain('Content A');
      expect(result).toContain('Content B');
      expect(result).toContain('Content C');
    });

    test('only first tab has active class', async () => {
      const body = "[{Tab name='Tab1'}]C1[{/Tab}][{Tab name='Tab2'}]C2[{/Tab}]";
      const result = await TabsPlugin.execute({ bodyContent: body }, {});
      const activeCount = (result.match(/class="nav-link active"/g) ?? []).length;
      expect(activeCount).toBe(1);
    });

    test('tab names are slugified for IDs', async () => {
      const body = "[{Tab name='My Great Tab'}]Content[{/Tab}]";
      const result = await TabsPlugin.execute({ bodyContent: body }, {});
      expect(result).toContain('my-great-tab');
    });
  });

  describe('style variants', () => {
    test('uses nav-tabs by default', async () => {
      const body = "[{Tab name='A'}]Content[{/Tab}]";
      const result = await TabsPlugin.execute({ bodyContent: body, engine: makeEngine(makeConfigManager('tabs')) }, {});
      expect(result).toContain('nav-tabs');
    });

    test('uses nav-pills for pills style', async () => {
      const body = "[{Tab name='A'}]Content[{/Tab}]";
      const result = await TabsPlugin.execute({ bodyContent: body, engine: makeEngine(makeConfigManager('pills')) }, {});
      expect(result).toContain('nav-pills');
      expect(result).not.toContain('nav-tabs');
    });

    test('uses nav-underline for underline style', async () => {
      const body = "[{Tab name='A'}]Content[{/Tab}]";
      const result = await TabsPlugin.execute({ bodyContent: body, engine: makeEngine(makeConfigManager('underline')) }, {});
      expect(result).toContain('nav-underline');
    });

    test('defaults to nav-tabs when engine is null', async () => {
      const body = "[{Tab name='A'}]Content[{/Tab}]";
      const result = await TabsPlugin.execute({ bodyContent: body, engine: null }, {});
      expect(result).toContain('nav-tabs');
    });
  });

  describe('persist script', () => {
    test('includes localStorage script when persist=true', async () => {
      const body = "[{Tab name='A'}]Content[{/Tab}]";
      const result = await TabsPlugin.execute(
        { bodyContent: body, engine: makeEngine(makeConfigManager('tabs', true)), pageName: 'P' },
        {}
      );
      expect(result).toContain('localStorage');
      expect(result).toContain('shown.bs.tab');
    });

    test('omits localStorage script when persist=false', async () => {
      const body = "[{Tab name='A'}]Content[{/Tab}]";
      const result = await TabsPlugin.execute(
        { bodyContent: body, engine: makeEngine(makeConfigManager('tabs', false)) },
        {}
      );
      expect(result).not.toContain('localStorage');
    });
  });

  describe('output structure', () => {
    test('wraps output in ngdp-tabs div', async () => {
      const body = "[{Tab name='One'}]X[{/Tab}]";
      const result = await TabsPlugin.execute({ bodyContent: body }, {});
      expect(result).toContain('class="ngdp-tabs"');
    });

    test('includes tab-content wrapper', async () => {
      const body = "[{Tab name='One'}]X[{/Tab}]";
      const result = await TabsPlugin.execute({ bodyContent: body }, {});
      expect(result).toContain('class="tab-content"');
    });

    test('sets aria attributes on buttons', async () => {
      const body = "[{Tab name='Accessible'}]Content[{/Tab}]";
      const result = await TabsPlugin.execute({ bodyContent: body }, {});
      expect(result).toContain('aria-selected="true"');
      expect(result).toContain('role="tab"');
    });
  });
});
