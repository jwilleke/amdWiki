'use strict';

import { existsSync, mkdirSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import * as path from 'path';
import BaseManager from '../../../dist/src/managers/BaseManager';
import type { WikiEngine } from '../../../dist/src/types/WikiEngine';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface JournalIndexEntry {
  uuid: string;
  slug: string;
  title: string;
  author: string;
  journalDate: string;       // YYYY-MM-DD
  mood?: string;
  tags: string[];
  isPrivate: boolean;
  lastModified: string;      // ISO 8601
}

export interface JournalQueryOptions {
  limit?: number;
  offset?: number;
  tag?: string;
  mood?: string;
}

interface JournalIndex {
  version: 1;
  entries: Record<string, JournalIndexEntry>;
}

// ── Manager ───────────────────────────────────────────────────────────────────

class JournalDataManager extends BaseManager {
  private dataPath: string;
  private indexPath: string;
  private index: JournalIndex;

  readonly description = 'Journal entry sidecar index — fast timeline, streak, and facet queries';

  constructor(engine: WikiEngine, dataPath: string) {
    super(engine);
    this.dataPath = dataPath;
    this.indexPath = path.join(dataPath, 'journal-index.json');
    this.index = { version: 1, entries: {} };
  }

  // ── Persistence ──────────────────────────────────────────────────────────────

  async load(): Promise<void> {
    if (!existsSync(this.dataPath)) {
      mkdirSync(this.dataPath, { recursive: true });
      return;
    }
    if (!existsSync(this.indexPath)) {
      return;
    }
    try {
      const raw = await readFile(this.indexPath, 'utf8');
      const parsed = JSON.parse(raw) as Partial<JournalIndex>;
      if (parsed.version === 1 && parsed.entries && typeof parsed.entries === 'object') {
        this.index = parsed as JournalIndex;
      }
    } catch {
      // Corrupt index — start fresh; will rebuild on next save
    }
  }

  async save(): Promise<void> {
    if (!existsSync(this.dataPath)) {
      mkdirSync(this.dataPath, { recursive: true });
    }
    // Atomic write via temp file
    const tmp = `${this.indexPath}.tmp`;
    await writeFile(tmp, JSON.stringify(this.index, null, 2), 'utf8');
    const { rename } = await import('fs/promises');
    await rename(tmp, this.indexPath);
  }

  // ── Write operations ─────────────────────────────────────────────────────────

  async indexEntry(entry: JournalIndexEntry): Promise<void> {
    this.index.entries[entry.uuid] = entry;
    await this.save();
  }

  async removeEntry(uuid: string): Promise<void> {
    if (uuid in this.index.entries) {
      delete this.index.entries[uuid];
      await this.save();
    }
  }

  // ── Read operations ──────────────────────────────────────────────────────────

  count(): number {
    return Object.keys(this.index.entries).length;
  }

  getBySlug(slug: string): JournalIndexEntry | undefined {
    return Object.values(this.index.entries).find(e => e.slug === slug);
  }

  listByAuthor(author: string, opts: JournalQueryOptions = {}): JournalIndexEntry[] {
    let results = Object.values(this.index.entries)
      .filter(e => e.author === author);

    if (opts.tag) {
      results = results.filter(e => e.tags.includes(opts.tag!));
    }
    if (opts.mood) {
      results = results.filter(e => e.mood === opts.mood);
    }

    results.sort((a, b) => b.journalDate.localeCompare(a.journalDate));

    const offset = opts.offset ?? 0;
    const limit  = opts.limit ?? results.length;
    return results.slice(offset, offset + limit);
  }

  listAll(opts: JournalQueryOptions = {}): JournalIndexEntry[] {
    const results = Object.values(this.index.entries);
    results.sort((a, b) => b.journalDate.localeCompare(a.journalDate));
    const offset = opts.offset ?? 0;
    const limit  = opts.limit ?? results.length;
    return results.slice(offset, offset + limit);
  }

  countByAuthor(author: string): number {
    return Object.values(this.index.entries).filter(e => e.author === author).length;
  }

  getOnThisDay(author: string, date?: string): JournalIndexEntry[] {
    const today   = date ?? new Date().toISOString().slice(0, 10);
    const mmdd    = today.slice(5);
    const year    = today.slice(0, 4);
    return Object.values(this.index.entries)
      .filter(e =>
        e.author === author &&
        e.journalDate.slice(5)    === mmdd &&
        e.journalDate.slice(0, 4) !== year
      )
      .sort((a, b) => b.journalDate.localeCompare(a.journalDate));
  }

  computeStreak(author: string): number {
    const dates = [...new Set(
      Object.values(this.index.entries)
        .filter(e => e.author === author)
        .map(e => e.journalDate)
    )].sort().reverse();

    if (dates.length === 0) return 0;

    let streak  = 0;
    let current = new Date().toISOString().slice(0, 10);
    for (const d of dates) {
      if (d === current) {
        streak++;
        const prev = new Date(`${current}T12:00:00`);
        prev.setDate(prev.getDate() - 1);
        current = prev.toISOString().slice(0, 10);
      } else if (d < current) {
        break;
      }
    }
    return streak;
  }

  getMoodFacets(author: string): Array<{ mood: string; count: number }> {
    const counts = new Map<string, number>();
    for (const e of Object.values(this.index.entries)) {
      if (e.author === author && e.mood) {
        counts.set(e.mood, (counts.get(e.mood) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .map(([mood, count]) => ({ mood, count }))
      .sort((a, b) => b.count - a.count);
  }

  getTagFacets(author: string): Array<{ tag: string; count: number }> {
    const counts = new Map<string, number>();
    for (const e of Object.values(this.index.entries)) {
      if (e.author === author) {
        for (const tag of e.tags) {
          counts.set(tag, (counts.get(tag) ?? 0) + 1);
        }
      }
    }
    return [...counts.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }

  // ── BaseManager overrides ────────────────────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/require-await
  async toMarqueeText(): Promise<string> {
    const total = this.count();
    return `Journal: ${total} entr${total === 1 ? 'y' : 'ies'} indexed`;
  }
}

export default JournalDataManager;
module.exports = JournalDataManager;
