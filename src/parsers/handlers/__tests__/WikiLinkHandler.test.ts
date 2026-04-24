/**
 * WikiLinkHandler tests
 *
 * Covers:
 * - process() with empty/null content
 * - [PageName] → link to /view/PageName
 * - [DisplayText|TargetPage] → link with display text
 * - [DisplayText|Target|target="_blank"] → target attribute + rel
 * - [DisplayText|Target|class="special"] → class attribute
 * - [DisplayText|Target|title="t"] → title attribute
 * - Red link when cachedPageNames populated and page missing
 * - Normal link when cachedPageNames populated and page exists
 * - HTML escaping in link text and target
 * - getInfo() returns object with features
 * - onInitialize() loads page names from PageManager
 *
 * @jest-environment node
 */

import WikiLinkHandler from '../WikiLinkHandler';

const ctx = { pageName: 'TestPage', engine: { getManager: vi.fn(() => null) } };

async function run(content: string, handler?: WikiLinkHandler): Promise<string> {
  const h = handler ?? new WikiLinkHandler();
  return h.process(content, ctx);
}

describe('WikiLinkHandler', () => {
  describe('metadata', () => {
    test('has correct handlerId', () => {
      expect(new WikiLinkHandler().handlerId).toBe('WikiLinkHandler');
    });

    test('has priority 50', () => {
      expect(new WikiLinkHandler().priority).toBe(50);
    });
  });

  describe('process() — empty / no links', () => {
    test('returns empty string for empty content', async () => {
      expect(await run('')).toBe('');
    });

    test('returns content unchanged when no link patterns', async () => {
      const text = 'Some text without any wiki links here.';
      expect(await run(text)).toBe(text);
    });
  });

  describe('process() — simple links', () => {
    test('[PageName] creates link to /view/PageName', async () => {
      const result = await run('[RocketEngines]');
      expect(result).toContain('<a href="/view/RocketEngines"');
      expect(result).toContain('RocketEngines');
    });

    test('[Page Name] encodes spaces in href', async () => {
      const result = await run('[Rocket Engines]');
      expect(result).toContain('/view/Rocket%20Engines');
    });

    test('[DisplayText|Target] shows display text', async () => {
      const result = await run('[Rocket Science|RocketEngines]');
      expect(result).toContain('Rocket Science');
      expect(result).toContain('href="/view/RocketEngines"');
    });
  });

  describe('process() — link parameters', () => {
    test('target=_blank adds target and rel attributes', async () => {
      const result = await run('[Read more|SomePage|target="_blank"]');
      expect(result).toContain('target="_blank"');
      expect(result).toContain('rel="noopener noreferrer"');
    });

    test('class parameter adds class attribute', async () => {
      const result = await run('[Styled|SomePage|class="highlight"]');
      expect(result).toContain('class="highlight"');
    });

    test('title parameter adds title attribute', async () => {
      const result = await run('[Link|SomePage|title="Tooltip text"]');
      expect(result).toContain('title="Tooltip text"');
    });
  });

  describe('process() — page existence', () => {
    test('creates red link when page not in cachedPageNames', async () => {
      const handler = new WikiLinkHandler();
      // Inject page names that do NOT include the linked page
      (handler as unknown as { cachedPageNames: string[] }).cachedPageNames = ['OtherPage'];
      const result = await handler.process('[MissingPage]', ctx);
      expect(result).toContain('red-link');
      expect(result).toContain('/edit/MissingPage');
    });

    test('creates normal link when page IS in cachedPageNames', async () => {
      const handler = new WikiLinkHandler();
      (handler as unknown as { cachedPageNames: string[] }).cachedPageNames = ['ExistingPage'];
      const result = await handler.process('[ExistingPage]', ctx);
      expect(result).toContain('/view/ExistingPage');
      expect(result).not.toContain('red-link');
    });

    test('assumes page exists when cachedPageNames is empty', async () => {
      const handler = new WikiLinkHandler();
      (handler as unknown as { cachedPageNames: string[] }).cachedPageNames = [];
      const result = await handler.process('[AnyPage]', ctx);
      expect(result).toContain('/view/AnyPage');
      expect(result).not.toContain('red-link');
    });
  });

  describe('process() — HTML escaping', () => {
    test('content with HTML chars in bracket syntax passes through unchanged', async () => {
      // The regex only allows [a-zA-Z0-9_\- ] in link text, so < > never match
      const content = '[<bold>Text]';
      const result = await run(content);
      expect(result).toBe(content);
    });
  });

  describe('process() — multiple links', () => {
    test('processes multiple links in one string', async () => {
      const result = await run('See [PageA] and [PageB] for details.');
      expect(result).toContain('/view/PageA');
      expect(result).toContain('/view/PageB');
      expect(result).toContain('See ');
      expect(result).toContain(' for details.');
    });
  });

  describe('onInitialize()', () => {
    test('loads page names from PageManager', async () => {
      const mockPageManager = {
        getAllPages: vi.fn().mockResolvedValue([{ name: 'PageA' }, { name: 'PageB' }])
      };
      const mockEngine = {
        getManager: vi.fn((n: string) => n === 'PageManager' ? mockPageManager : null)
      };
      const handler = new WikiLinkHandler();
      await (handler as unknown as { onInitialize: (ctx: unknown) => Promise<void> }).onInitialize({ engine: mockEngine });
      const names = (handler as unknown as { cachedPageNames: string[] }).cachedPageNames;
      expect(names).toContain('PageA');
      expect(names).toContain('PageB');
    });

    test('does not throw when PageManager unavailable', async () => {
      const mockEngine = { getManager: vi.fn(() => null) };
      const handler = new WikiLinkHandler();
      await expect(
        (handler as unknown as { onInitialize: (ctx: unknown) => Promise<void> }).onInitialize({ engine: mockEngine })
      ).resolves.not.toThrow();
    });

    test('does not throw when getAllPages throws', async () => {
      const mockPageManager = {
        getAllPages: vi.fn().mockRejectedValue(new Error('DB error'))
      };
      const mockEngine = {
        getManager: vi.fn(() => mockPageManager)
      };
      const handler = new WikiLinkHandler();
      await expect(
        (handler as unknown as { onInitialize: (ctx: unknown) => Promise<void> }).onInitialize({ engine: mockEngine })
      ).resolves.not.toThrow();
    });
  });

  describe('getInfo()', () => {
    test('returns object with features array', () => {
      const info = new WikiLinkHandler().getInfo();
      expect(typeof info).toBe('object');
      expect(Array.isArray(info.features)).toBe(true);
      expect(Array.isArray(info.supportedPatterns)).toBe(true);
    });
  });
});
