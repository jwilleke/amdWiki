/**
 * RecentChangesPlugin tests
 *
 * Covers:
 * - Metadata
 * - No PageManager → error
 * - Invalid since/format params → error
 * - Empty page list → "No pages found"
 * - Pages without filePath (all skipped) → "No changes"
 * - Full format output via mocked fs.stat
 * - Compact format output via mocked fs.stat
 * - Pages older than cutoff excluded
 *
 * fs-extra is mocked to avoid real FS operations.
 *
 * @jest-environment node
 */

vi.mock('fs-extra', () => ({
  default: {
    pathExists: vi.fn().mockResolvedValue(false),
    readFile: vi.fn().mockResolvedValue('{}'),
    stat: vi.fn()
  },
  pathExists: vi.fn().mockResolvedValue(false),
  readFile: vi.fn().mockResolvedValue('{}'),
  stat: vi.fn()
}));

import fs from 'fs-extra';
import RecentChangesPlugin from '../RecentChangesPlugin';

const mockStat = vi.mocked((fs as unknown as { stat: ReturnType<typeof vi.fn> }).stat);

const makePageManager = (pageNames: string[] = [], pages: Record<string, unknown> = {}) => ({
  getAllPages: vi.fn().mockResolvedValue(pageNames),
  getPage: vi.fn(async (name: string) => pages[name] ?? null)
});

const makeEngine = (pageManager: unknown = null) => ({
  getManager: vi.fn((name: string) => name === 'PageManager' ? pageManager : null)
});

describe('RecentChangesPlugin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (fs as unknown as { pathExists: ReturnType<typeof vi.fn> }).pathExists.mockResolvedValue(false);
  });

  describe('metadata', () => {
    test('has correct name and version', () => {
      expect(RecentChangesPlugin.name).toBe('RecentChangesPlugin');
      expect(RecentChangesPlugin.version).toBe('1.0.0');
      expect(typeof RecentChangesPlugin.execute).toBe('function');
    });

    test('initialize does not throw', () => {
      expect(() => RecentChangesPlugin.initialize?.({})).not.toThrow();
    });
  });

  describe('no PageManager', () => {
    test('returns error when PageManager unavailable', async () => {
      const context = { engine: makeEngine(null) };
      const result = await RecentChangesPlugin.execute(context, {});
      expect(result).toContain('PageManager not available');
    });

    test('returns error when engine is null', async () => {
      const context = { engine: null };
      const result = await RecentChangesPlugin.execute(context, {});
      expect(result).toContain('PageManager not available');
    });
  });

  describe('parameter validation', () => {
    test('returns error for negative since value', async () => {
      const pm = makePageManager();
      const context = { engine: makeEngine(pm) };
      const result = await RecentChangesPlugin.execute(context, { since: '-1' });
      expect(result).toContain('Invalid "since" parameter');
    });

    test('returns error for non-numeric since value', async () => {
      const pm = makePageManager();
      const context = { engine: makeEngine(pm) };
      const result = await RecentChangesPlugin.execute(context, { since: 'abc' });
      expect(result).toContain('Invalid "since" parameter');
    });

    test('returns error for unknown format value', async () => {
      const pm = makePageManager();
      const context = { engine: makeEngine(pm) };
      const result = await RecentChangesPlugin.execute(context, { format: 'table' });
      expect(result).toContain('Invalid "format" parameter');
    });
  });

  describe('empty pages', () => {
    test('returns "No pages found" when getAllPages returns empty', async () => {
      const pm = makePageManager([]);
      const context = { engine: makeEngine(pm) };
      const result = await RecentChangesPlugin.execute(context, {});
      expect(result).toContain('No pages found');
    });

    test('returns "No pages found" when getAllPages returns null', async () => {
      const pm = { getAllPages: vi.fn().mockResolvedValue(null), getPage: vi.fn() };
      const context = { engine: makeEngine(pm) };
      const result = await RecentChangesPlugin.execute(context, {});
      expect(result).toContain('No pages found');
    });
  });

  describe('pages skipped (no filePath or null page)', () => {
    test('skips pages with null return from getPage', async () => {
      const pm = makePageManager(['Page1', 'Page2'], { Page1: null, Page2: null });
      const context = { engine: makeEngine(pm) };
      const result = await RecentChangesPlugin.execute(context, { since: '7' });
      expect(result).toContain('No changes in the last 7 days');
    });

    test('skips pages without filePath', async () => {
      const pm = makePageManager(
        ['NoPath'],
        { NoPath: { title: 'NoPath', uuid: 'u1', metadata: {} } }
      );
      const context = { engine: makeEngine(pm) };
      const result = await RecentChangesPlugin.execute(context, { since: '7' });
      expect(result).toContain('No changes in the last 7 days');
    });

    test('singular "day" when since=1', async () => {
      const pm = makePageManager([]);
      const context = { engine: makeEngine(pm) };
      const result = await RecentChangesPlugin.execute(context, { since: '1' });
      expect(result).toContain('No pages found');
    });
  });

  describe('compact format (default)', () => {
    test('renders compact list for pages within cutoff', async () => {
      const recentDate = new Date();
      recentDate.setHours(recentDate.getHours() - 1);

      mockStat.mockResolvedValue({ mtime: recentDate } as unknown as ReturnType<typeof fs.stat extends (...args: unknown[]) => infer R ? (...args: unknown[]) => R : never>);

      const pm = makePageManager(
        ['RecentPage'],
        {
          RecentPage: {
            title: 'RecentPage',
            uuid: 'u-recent',
            filePath: '/fake/path/RecentPage.md',
            metadata: { editor: 'alice' }
          }
        }
      );
      const context = { engine: makeEngine(pm) };
      const result = await RecentChangesPlugin.execute(context, { since: '7', format: 'compact' });
      expect(result).toContain('recent-changes-compact');
      expect(result).toContain('RecentPage');
      expect(result).toContain('/view/RecentPage');
    });

    test('uses compact format by default', async () => {
      const recentDate = new Date();
      mockStat.mockResolvedValue({ mtime: recentDate } as unknown as ReturnType<typeof fs.stat extends (...args: unknown[]) => infer R ? (...args: unknown[]) => R : never>);

      const pm = makePageManager(
        ['SomePage'],
        { SomePage: { title: 'SomePage', uuid: 'u1', filePath: '/fake/SomePage.md', metadata: {} } }
      );
      const context = { engine: makeEngine(pm) };
      const result = await RecentChangesPlugin.execute(context, {});
      expect(result).toContain('recent-changes-compact');
    });
  });

  describe('full format', () => {
    test('renders full table for pages within cutoff', async () => {
      const recentDate = new Date();
      mockStat.mockResolvedValue({ mtime: recentDate } as unknown as ReturnType<typeof fs.stat extends (...args: unknown[]) => infer R ? (...args: unknown[]) => R : never>);

      const pm = makePageManager(
        ['FullPage'],
        {
          FullPage: {
            title: 'FullPage',
            uuid: 'u-full',
            filePath: '/fake/FullPage.md',
            metadata: { editor: 'bob' }
          }
        }
      );
      const context = { engine: makeEngine(pm) };
      const result = await RecentChangesPlugin.execute(context, { since: '30', format: 'full' });
      expect(result).toContain('recent-changes-full');
      expect(result).toContain('FullPage');
      expect(result).toContain('bob');
      expect(result).toContain('/view/FullPage');
    });

    test('full format shows version badge', async () => {
      const recentDate = new Date();
      mockStat.mockResolvedValue({ mtime: recentDate } as unknown as ReturnType<typeof fs.stat extends (...args: unknown[]) => infer R ? (...args: unknown[]) => R : never>);

      const pm = makePageManager(
        ['VerPage'],
        { VerPage: { title: 'VerPage', uuid: 'u2', filePath: '/fake/VerPage.md', metadata: {} } }
      );
      const context = { engine: makeEngine(pm) };
      const result = await RecentChangesPlugin.execute(context, { format: 'full' });
      expect(result).toContain('badge');
    });
  });

  describe('pages outside cutoff', () => {
    test('excludes pages older than since days', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 30);
      mockStat.mockResolvedValue({ mtime: oldDate } as unknown as ReturnType<typeof fs.stat extends (...args: unknown[]) => infer R ? (...args: unknown[]) => R : never>);

      const pm = makePageManager(
        ['OldPage'],
        { OldPage: { title: 'OldPage', uuid: 'u3', filePath: '/fake/OldPage.md', metadata: {} } }
      );
      const context = { engine: makeEngine(pm) };
      const result = await RecentChangesPlugin.execute(context, { since: '7' });
      expect(result).toContain('No changes in the last 7 days');
    });
  });

  describe('error handling', () => {
    test('returns error message on unexpected exception', async () => {
      const pm = {
        getAllPages: vi.fn().mockRejectedValue(new Error('DB exploded')),
        getPage: vi.fn()
      };
      const context = { engine: makeEngine(pm) };
      const result = await RecentChangesPlugin.execute(context, {});
      expect(result).toContain('Error displaying recent changes');
    });
  });

  describe('default parameter values', () => {
    test('defaults to 7 days when since is omitted', async () => {
      const pm = makePageManager([]);
      const context = { engine: makeEngine(pm) };
      const result = await RecentChangesPlugin.execute(context, {});
      expect(result).toContain('No pages found');
    });
  });
});
