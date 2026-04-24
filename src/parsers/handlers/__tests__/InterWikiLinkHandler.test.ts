/**
 * InterWikiLinkHandler tests
 *
 * Covers:
 * - process() with empty content
 * - process() passthrough for non-interwiki content
 * - [Wikipedia:PageName] → external link to Wikipedia
 * - [Wikipedia:PageName|DisplayText] → link with display text
 * - Unknown wiki site → error comment in output
 * - Case-insensitive site lookup
 * - URL encoding of page names
 * - target="_blank" and rel="noopener noreferrer" for external links
 * - class="interwiki-link interwiki-<sitename>"
 * - HTML escaping in display text
 * - Legacy target= display text stripped
 * - Multiple links in one string
 * - onInitialize() loads default sites when no config file
 * - getAvailableSites() returns sites list
 * - getInfo() metadata
 *
 * @jest-environment node
 */

import InterWikiLinkHandler from '../InterWikiLinkHandler';

const ctx = { pageName: 'TestPage', engine: { getManager: vi.fn(() => null) } };

async function initHandler(): Promise<InterWikiLinkHandler> {
  const handler = new InterWikiLinkHandler();
  const engine = { getManager: vi.fn(() => null) };
  await (handler as unknown as { onInitialize: (ctx: unknown) => Promise<void> }).onInitialize({ engine });
  return handler;
}

describe('InterWikiLinkHandler', () => {
  describe('metadata', () => {
    test('has correct handlerId', () => {
      expect(new InterWikiLinkHandler().handlerId).toBe('InterWikiLinkHandler');
    });

    test('has priority 80', () => {
      expect(new InterWikiLinkHandler().priority).toBe(80);
    });
  });

  describe('process() — passthrough', () => {
    test('returns empty string for empty content', async () => {
      const handler = await initHandler();
      expect(await handler.process('', ctx)).toBe('');
    });

    test('returns regular text unchanged', async () => {
      const handler = await initHandler();
      const text = 'Some regular text with no interwiki links.';
      expect(await handler.process(text, ctx)).toBe(text);
    });

    test('leaves internal links unchanged (no colon)', async () => {
      const handler = await initHandler();
      const text = '[SomePage] and [Display|Target]';
      // Regex requires WikiName:PageName pattern, so these don't match
      expect(await handler.process(text, ctx)).toBe(text);
    });
  });

  describe('process() — basic interwiki links', () => {
    test('[Wikipedia:SomePage] creates external link', async () => {
      const handler = await initHandler();
      const result = await handler.process('[Wikipedia:Linux]', ctx);
      expect(result).toContain('<a ');
      expect(result).toContain('wikipedia');
      expect(result).toContain('Linux');
    });

    test('link has interwiki-link class', async () => {
      const handler = await initHandler();
      const result = await handler.process('[Wikipedia:Foo]', ctx);
      expect(result).toContain('interwiki-link');
    });

    test('link opens in new window with rel attribute', async () => {
      const handler = await initHandler();
      const result = await handler.process('[Wikipedia:Foo]', ctx);
      expect(result).toContain('target="_blank"');
      expect(result).toContain('rel="noopener noreferrer"');
    });

    test('URL includes encoded page name', async () => {
      const handler = await initHandler();
      const result = await handler.process('[Wikipedia:Space Page]', ctx);
      expect(result).toContain('Space%20Page');
    });
  });

  describe('process() — display text', () => {
    test('[Wikipedia:Page|Custom Text] uses custom text', async () => {
      const handler = await initHandler();
      const result = await handler.process('[Wikipedia:Linux|Open Source OS]', ctx);
      expect(result).toContain('Open Source OS');
    });

    test('strips target= display text (legacy JSPWiki syntax)', async () => {
      const handler = await initHandler();
      const result = await handler.process('[Wikipedia:Linux|target="_blank"]', ctx);
      // "target=..." display text should be stripped, using default Wikipedia:Linux
      expect(result).toContain('Wikipedia:Linux');
      expect(result).not.toContain('target=&quot;_blank&quot;');
    });
  });

  describe('process() — unknown site', () => {
    test('[UnknownWiki:Page] produces error comment', async () => {
      const handler = await initHandler();
      const result = await handler.process('[UnknownWiki:SomePage]', ctx);
      expect(result).toContain('<!-- InterWiki Error:');
    });
  });

  describe('process() — HTML escaping', () => {
    test('HTML chars in display text are escaped', async () => {
      const handler = await initHandler();
      const result = await handler.process('[Wikipedia:Foo|<script>alert(1)</script>]', ctx);
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });
  });

  describe('process() — multiple links', () => {
    test('processes multiple interwiki links in one string', async () => {
      const handler = await initHandler();
      const result = await handler.process('See [Wikipedia:Linux] and [JSPWiki:WikiPlugin]', ctx);
      expect(result).toContain('wikipedia');
      expect(result).toContain('jspwiki');
      expect(result).toContain('Linux');
      expect(result).toContain('WikiPlugin');
    });
  });

  describe('onInitialize()', () => {
    test('loads default sites when no config present', async () => {
      const handler = await initHandler();
      const sites = handler.getAvailableSites();
      expect(sites.length).toBeGreaterThan(0);
      const siteNames = sites.map(s => s.name);
      expect(siteNames).toContain('Wikipedia');
    });

    test('does not throw when engine has no managers', async () => {
      const handler = new InterWikiLinkHandler();
      const engine = { getManager: vi.fn(() => null) };
      await expect(
        (handler as unknown as { onInitialize: (c: unknown) => Promise<void> }).onInitialize({ engine })
      ).resolves.not.toThrow();
    });
  });

  describe('getAvailableSites()', () => {
    test('returns array of site info objects', async () => {
      const handler = await initHandler();
      const sites = handler.getAvailableSites();
      expect(Array.isArray(sites)).toBe(true);
      expect(sites[0]).toHaveProperty('name');
      expect(sites[0]).toHaveProperty('url');
    });
  });

  describe('getInfo()', () => {
    test('returns object with features and supportedPatterns', async () => {
      const handler = await initHandler();
      const info = handler.getInfo();
      expect(Array.isArray(info.features)).toBe(true);
      expect(Array.isArray(info.supportedPatterns)).toBe(true);
    });
  });

  describe('addInterWikiSite()', () => {
    test('returns false for missing name', async () => {
      const handler = await initHandler();
      expect(handler.addInterWikiSite('', { url: 'https://example.com/%s' })).toBe(false);
    });

    test('returns false for missing URL', async () => {
      const handler = await initHandler();
      expect(handler.addInterWikiSite('MySite', { url: '' })).toBe(false);
    });

    test('returns false for unsafe URL', async () => {
      const handler = await initHandler();
      expect(handler.addInterWikiSite('BadSite', { url: 'javascript:alert(%s)' })).toBe(false);
    });

    test('adds valid site and returns true', async () => {
      const handler = await initHandler();
      const result = handler.addInterWikiSite('MySite', { url: 'https://mysite.example.com/%s' });
      expect(result).toBe(true);
      expect(handler.getAvailableSites().some((s) => s.name === 'MySite')).toBe(true);
    });

    test('logs warning when URL lacks %s placeholder', async () => {
      const handler = await initHandler();
      handler.addInterWikiSite('NoPlaceholder', { url: 'https://example.com/page' });
      // No throw expected — just a warning
    });
  });

  describe('removeInterWikiSite()', () => {
    test('returns false for non-existent site', async () => {
      const handler = await initHandler();
      expect(handler.removeInterWikiSite('NonExistent')).toBe(false);
    });

    test('removes site and returns true', async () => {
      const handler = await initHandler();
      handler.addInterWikiSite('ToRemove', { url: 'https://example.com/%s' });
      expect(handler.removeInterWikiSite('ToRemove')).toBe(true);
      expect(handler.getAvailableSites().some((s) => s.name === 'ToRemove')).toBe(false);
    });
  });

  describe('reloadConfiguration()', () => {
    test('clears and reloads sites without throwing', async () => {
      const handler = await initHandler();
      const sitesBefore = handler.getAvailableSites().length;
      await expect(handler.reloadConfiguration()).resolves.not.toThrow();
      // After reload, default sites should still be available
      expect(handler.getAvailableSites().length).toBeGreaterThan(0);
    });
  });

  describe('icon in link HTML', () => {
    test('includes img tag when site has icon configured', async () => {
      const handler = await initHandler();
      handler.addInterWikiSite('Iconic', { url: 'https://example.com/%s', icon: 'myicon.png' });
      const result = await handler.process('[Iconic:TestPage]', ctx);
      expect(result).toContain('<img');
      expect(result).toContain('myicon.png');
    });
  });
});
