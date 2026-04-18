'use strict';

import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

import JournalDataManager from '../JournalDataManager';
import type { JournalIndexEntry } from '../JournalDataManager';

// Minimal engine stub — JournalDataManager never calls engine methods
const ENGINE_STUB = {} as never;

function makeEntry(overrides: Partial<JournalIndexEntry> = {}): JournalIndexEntry {
  return {
    uuid:         overrides.uuid         ?? uuidv4(),
    slug:         overrides.slug         ?? 'journal-alice-2026-01-01',
    title:        overrides.title        ?? 'Test Entry',
    author:       overrides.author       ?? 'alice',
    journalDate:  overrides.journalDate  ?? '2026-01-01',
    tags:         overrides.tags         ?? [],
    isPrivate:    overrides.isPrivate    ?? true,
    lastModified: overrides.lastModified ?? new Date().toISOString(),
    ...overrides
  };
}

function tmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'jdm-test-'));
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('JournalDataManager', () => {
  let dir: string;

  beforeEach(() => {
    dir = tmpDir();
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  // ── Persistence ──────────────────────────────────────────────────────────────

  describe('load / save', () => {
    it('starts with an empty index when no file exists', async () => {
      const m = new JournalDataManager(ENGINE_STUB, dir);
      await m.load();
      expect(m.count()).toBe(0);
    });

    it('persists and reloads entries', async () => {
      const m1 = new JournalDataManager(ENGINE_STUB, dir);
      await m1.load();
      const entry = makeEntry();
      await m1.indexEntry(entry);

      const m2 = new JournalDataManager(ENGINE_STUB, dir);
      await m2.load();
      expect(m2.count()).toBe(1);
      expect(m2.getBySlug(entry.slug)).toMatchObject({ uuid: entry.uuid });
    });

    it('silently starts fresh on corrupt index', async () => {
      const indexPath = path.join(dir, 'journal-index.json');
      fs.writeFileSync(indexPath, 'not-json');
      const m = new JournalDataManager(ENGINE_STUB, dir);
      await m.load();
      expect(m.count()).toBe(0);
    });
  });

  // ── indexEntry / removeEntry ──────────────────────────────────────────────────

  describe('indexEntry / removeEntry', () => {
    it('upserts an entry by uuid', async () => {
      const m = new JournalDataManager(ENGINE_STUB, dir);
      await m.load();
      const entry = makeEntry({ title: 'Original' });
      await m.indexEntry(entry);
      await m.indexEntry({ ...entry, title: 'Updated' });
      expect(m.count()).toBe(1);
      expect(m.getBySlug(entry.slug)?.title).toBe('Updated');
    });

    it('removes an entry by uuid', async () => {
      const m = new JournalDataManager(ENGINE_STUB, dir);
      await m.load();
      const entry = makeEntry();
      await m.indexEntry(entry);
      await m.removeEntry(entry.uuid);
      expect(m.count()).toBe(0);
    });

    it('removeEntry is a no-op for unknown uuid', async () => {
      const m = new JournalDataManager(ENGINE_STUB, dir);
      await m.load();
      await expect(m.removeEntry('nonexistent')).resolves.not.toThrow();
    });
  });

  // ── listByAuthor ──────────────────────────────────────────────────────────────

  describe('listByAuthor', () => {
    it('returns only entries for the specified author', async () => {
      const m = new JournalDataManager(ENGINE_STUB, dir);
      await m.load();
      await m.indexEntry(makeEntry({ uuid: uuidv4(), author: 'alice', slug: 'a1', journalDate: '2026-01-01' }));
      await m.indexEntry(makeEntry({ uuid: uuidv4(), author: 'bob',   slug: 'b1', journalDate: '2026-01-02' }));
      const results = m.listByAuthor('alice');
      expect(results).toHaveLength(1);
      expect(results[0].author).toBe('alice');
    });

    it('returns entries sorted newest-first', async () => {
      const m = new JournalDataManager(ENGINE_STUB, dir);
      await m.load();
      await m.indexEntry(makeEntry({ uuid: uuidv4(), slug: 'e1', journalDate: '2026-01-01' }));
      await m.indexEntry(makeEntry({ uuid: uuidv4(), slug: 'e2', journalDate: '2026-03-01' }));
      await m.indexEntry(makeEntry({ uuid: uuidv4(), slug: 'e3', journalDate: '2026-02-01' }));
      const dates = m.listByAuthor('alice').map(e => e.journalDate);
      expect(dates).toEqual(['2026-03-01', '2026-02-01', '2026-01-01']);
    });

    it('filters by tag', async () => {
      const m = new JournalDataManager(ENGINE_STUB, dir);
      await m.load();
      await m.indexEntry(makeEntry({ uuid: uuidv4(), slug: 'e1', tags: ['gratitude', 'family'] }));
      await m.indexEntry(makeEntry({ uuid: uuidv4(), slug: 'e2', tags: ['work'] }));
      expect(m.listByAuthor('alice', { tag: 'gratitude' })).toHaveLength(1);
      expect(m.listByAuthor('alice', { tag: 'work' })).toHaveLength(1);
      expect(m.listByAuthor('alice', { tag: 'missing' })).toHaveLength(0);
    });

    it('filters by mood', async () => {
      const m = new JournalDataManager(ENGINE_STUB, dir);
      await m.load();
      await m.indexEntry(makeEntry({ uuid: uuidv4(), slug: 'e1', mood: 'happy' }));
      await m.indexEntry(makeEntry({ uuid: uuidv4(), slug: 'e2', mood: 'sad' }));
      expect(m.listByAuthor('alice', { mood: 'happy' })).toHaveLength(1);
      expect(m.listByAuthor('alice', { mood: 'missing' })).toHaveLength(0);
    });

    it('applies limit and offset', async () => {
      const m = new JournalDataManager(ENGINE_STUB, dir);
      await m.load();
      for (let i = 1; i <= 5; i++) {
        await m.indexEntry(makeEntry({ uuid: uuidv4(), slug: `e${i}`, journalDate: `2026-01-0${i}` }));
      }
      expect(m.listByAuthor('alice', { limit: 2 })).toHaveLength(2);
      expect(m.listByAuthor('alice', { limit: 2, offset: 4 })).toHaveLength(1);
    });
  });

  // ── computeStreak ─────────────────────────────────────────────────────────────

  describe('computeStreak', () => {
    it('returns 0 for author with no entries', async () => {
      const m = new JournalDataManager(ENGINE_STUB, dir);
      await m.load();
      expect(m.computeStreak('alice')).toBe(0);
    });

    it('counts a streak starting today', async () => {
      const m = new JournalDataManager(ENGINE_STUB, dir);
      await m.load();
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10);
      await m.indexEntry(makeEntry({ uuid: uuidv4(), slug: 'e1', journalDate: today }));
      await m.indexEntry(makeEntry({ uuid: uuidv4(), slug: 'e2', journalDate: yesterday }));
      await m.indexEntry(makeEntry({ uuid: uuidv4(), slug: 'e3', journalDate: twoDaysAgo }));
      expect(m.computeStreak('alice')).toBe(3);
    });

    it('breaks streak on a gap', async () => {
      const m = new JournalDataManager(ENGINE_STUB, dir);
      await m.load();
      const today = new Date().toISOString().slice(0, 10);
      const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10);
      await m.indexEntry(makeEntry({ uuid: uuidv4(), slug: 'e1', journalDate: today }));
      await m.indexEntry(makeEntry({ uuid: uuidv4(), slug: 'e2', journalDate: twoDaysAgo }));
      expect(m.computeStreak('alice')).toBe(1);
    });

    it('counts 1 for today only', async () => {
      const m = new JournalDataManager(ENGINE_STUB, dir);
      await m.load();
      const today = new Date().toISOString().slice(0, 10);
      await m.indexEntry(makeEntry({ uuid: uuidv4(), slug: 'e1', journalDate: today }));
      expect(m.computeStreak('alice')).toBe(1);
    });

    it('returns 0 when most recent entry is not today or yesterday', async () => {
      const m = new JournalDataManager(ENGINE_STUB, dir);
      await m.load();
      const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);
      await m.indexEntry(makeEntry({ uuid: uuidv4(), slug: 'e1', journalDate: threeDaysAgo }));
      expect(m.computeStreak('alice')).toBe(0);
    });

    it('deduplicates multiple entries on the same day', async () => {
      const m = new JournalDataManager(ENGINE_STUB, dir);
      await m.load();
      const today = new Date().toISOString().slice(0, 10);
      await m.indexEntry(makeEntry({ uuid: uuidv4(), slug: 'e1', journalDate: today }));
      await m.indexEntry(makeEntry({ uuid: uuidv4(), slug: 'e2', journalDate: today }));
      expect(m.computeStreak('alice')).toBe(1);
    });

    it('does not count another author\'s entries in streak', async () => {
      const m = new JournalDataManager(ENGINE_STUB, dir);
      await m.load();
      const today = new Date().toISOString().slice(0, 10);
      await m.indexEntry(makeEntry({ uuid: uuidv4(), slug: 'b1', author: 'bob', journalDate: today }));
      expect(m.computeStreak('alice')).toBe(0);
    });
  });

  // ── getOnThisDay ──────────────────────────────────────────────────────────────

  describe('getOnThisDay', () => {
    it('returns entries from the same MM-DD in prior years', async () => {
      const m = new JournalDataManager(ENGINE_STUB, dir);
      await m.load();
      const today = '2026-04-18';
      await m.indexEntry(makeEntry({ uuid: uuidv4(), slug: 'past1', journalDate: '2025-04-18' }));
      await m.indexEntry(makeEntry({ uuid: uuidv4(), slug: 'past2', journalDate: '2024-04-18' }));
      await m.indexEntry(makeEntry({ uuid: uuidv4(), slug: 'today', journalDate: today }));
      await m.indexEntry(makeEntry({ uuid: uuidv4(), slug: 'other', journalDate: '2025-04-19' }));
      const results = m.getOnThisDay('alice', today);
      expect(results).toHaveLength(2);
      expect(results.map(e => e.slug).sort()).toEqual(['past1', 'past2'].sort());
    });

    it('excludes other authors', async () => {
      const m = new JournalDataManager(ENGINE_STUB, dir);
      await m.load();
      await m.indexEntry(makeEntry({ uuid: uuidv4(), slug: 'b1', author: 'bob', journalDate: '2025-04-18' }));
      const results = m.getOnThisDay('alice', '2026-04-18');
      expect(results).toHaveLength(0);
    });

    it('returns results sorted newest-first', async () => {
      const m = new JournalDataManager(ENGINE_STUB, dir);
      await m.load();
      await m.indexEntry(makeEntry({ uuid: uuidv4(), slug: 'p1', journalDate: '2023-04-18' }));
      await m.indexEntry(makeEntry({ uuid: uuidv4(), slug: 'p2', journalDate: '2025-04-18' }));
      await m.indexEntry(makeEntry({ uuid: uuidv4(), slug: 'p3', journalDate: '2024-04-18' }));
      const dates = m.getOnThisDay('alice', '2026-04-18').map(e => e.journalDate);
      expect(dates).toEqual(['2025-04-18', '2024-04-18', '2023-04-18']);
    });
  });

  // ── getMoodFacets ─────────────────────────────────────────────────────────────

  describe('getMoodFacets', () => {
    it('returns mood counts sorted by frequency', async () => {
      const m = new JournalDataManager(ENGINE_STUB, dir);
      await m.load();
      await m.indexEntry(makeEntry({ uuid: uuidv4(), slug: 'e1', mood: 'happy' }));
      await m.indexEntry(makeEntry({ uuid: uuidv4(), slug: 'e2', mood: 'happy' }));
      await m.indexEntry(makeEntry({ uuid: uuidv4(), slug: 'e3', mood: 'sad' }));
      const facets = m.getMoodFacets('alice');
      expect(facets[0]).toEqual({ mood: 'happy', count: 2 });
      expect(facets[1]).toEqual({ mood: 'sad',   count: 1 });
    });

    it('excludes entries with no mood', async () => {
      const m = new JournalDataManager(ENGINE_STUB, dir);
      await m.load();
      await m.indexEntry(makeEntry({ uuid: uuidv4(), slug: 'e1' })); // no mood
      expect(m.getMoodFacets('alice')).toHaveLength(0);
    });

    it('excludes other authors', async () => {
      const m = new JournalDataManager(ENGINE_STUB, dir);
      await m.load();
      await m.indexEntry(makeEntry({ uuid: uuidv4(), slug: 'b1', author: 'bob', mood: 'happy' }));
      expect(m.getMoodFacets('alice')).toHaveLength(0);
    });
  });

  // ── getTagFacets ──────────────────────────────────────────────────────────────

  describe('getTagFacets', () => {
    it('returns tag counts sorted by frequency', async () => {
      const m = new JournalDataManager(ENGINE_STUB, dir);
      await m.load();
      await m.indexEntry(makeEntry({ uuid: uuidv4(), slug: 'e1', tags: ['gratitude', 'family'] }));
      await m.indexEntry(makeEntry({ uuid: uuidv4(), slug: 'e2', tags: ['gratitude'] }));
      await m.indexEntry(makeEntry({ uuid: uuidv4(), slug: 'e3', tags: ['work'] }));
      const facets = m.getTagFacets('alice');
      expect(facets[0]).toEqual({ tag: 'gratitude', count: 2 });
      expect(facets).toHaveLength(3);
    });

    it('returns empty array when no tags exist', async () => {
      const m = new JournalDataManager(ENGINE_STUB, dir);
      await m.load();
      await m.indexEntry(makeEntry({ uuid: uuidv4(), slug: 'e1', tags: [] }));
      expect(m.getTagFacets('alice')).toHaveLength(0);
    });

    it('excludes other authors', async () => {
      const m = new JournalDataManager(ENGINE_STUB, dir);
      await m.load();
      await m.indexEntry(makeEntry({ uuid: uuidv4(), slug: 'b1', author: 'bob', tags: ['family'] }));
      expect(m.getTagFacets('alice')).toHaveLength(0);
    });
  });

  // ── toMarqueeText ─────────────────────────────────────────────────────────────

  describe('toMarqueeText', () => {
    it('uses singular for 1 entry', async () => {
      const m = new JournalDataManager(ENGINE_STUB, dir);
      await m.load();
      await m.indexEntry(makeEntry());
      expect(await m.toMarqueeText()).toBe('Journal: 1 entry indexed');
    });

    it('uses plural for 0 or multiple entries', async () => {
      const m = new JournalDataManager(ENGINE_STUB, dir);
      await m.load();
      expect(await m.toMarqueeText()).toBe('Journal: 0 entries indexed');
      await m.indexEntry(makeEntry({ uuid: uuidv4(), slug: 'e1' }));
      await m.indexEntry(makeEntry({ uuid: uuidv4(), slug: 'e2' }));
      expect(await m.toMarqueeText()).toBe('Journal: 2 entries indexed');
    });
  });
});
