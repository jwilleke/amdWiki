import fs from 'fs';
import path from 'path';
import BaseManager from './BaseManager';
import logger from '../utils/logger';
import type { WikiEngine } from '../types/WikiEngine';
import type ConfigurationManager from './ConfigurationManager';

export interface PageFootnote {
  id: string;
  display: string;
  url: string;
  note: string;
  createdBy: string;
  createdAt: string;
}

type FootnoteMap = Record<string, PageFootnote>;

export default class FootnoteManager extends BaseManager {
  private storageDir: string = './data/footnotes';
  private enabled: boolean = true;

  constructor(engine: WikiEngine) {
    super(engine);
  }

  async initialize(): Promise<void> {
    const configManager = this.engine.getManager<ConfigurationManager>('ConfigurationManager');
    if (configManager) {
      this.enabled = configManager.getProperty('ngdpbase.footnotes.enabled', true) as boolean;
      this.storageDir = configManager.getResolvedDataPath(
        'ngdpbase.footnotes.storagedir',
        './data/footnotes'
      );
    }
    if (this.enabled) {
      fs.mkdirSync(this.storageDir, { recursive: true });
      logger.debug('FootnoteManager initialized');
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  private filePath(pageUuid: string): string {
    return path.join(this.storageDir, `${pageUuid}.json`);
  }

  private readMap(pageUuid: string): FootnoteMap {
    const fp = this.filePath(pageUuid);
    if (!fs.existsSync(fp)) return {};
    try {
      return JSON.parse(fs.readFileSync(fp, 'utf-8')) as FootnoteMap;
    } catch {
      return {};
    }
  }

  private writeMap(pageUuid: string, map: FootnoteMap): void {
    fs.writeFileSync(this.filePath(pageUuid), JSON.stringify(map, null, 2), 'utf-8');
  }

  async getFootnotes(pageUuid: string): Promise<PageFootnote[]> {
    const map = this.readMap(pageUuid);
    return Object.values(map).sort((a, b) => {
      const na = parseInt(a.id, 10), nb = parseInt(b.id, 10);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return a.id.localeCompare(b.id);
    });
  }

  async addFootnote(
    pageUuid: string,
    data: { display: string; url: string; note: string },
    createdBy: string
  ): Promise<PageFootnote> {
    const map = this.readMap(pageUuid);

    // Assign next sequential numeric id
    const numericIds = Object.keys(map).map(k => parseInt(k, 10)).filter(n => !isNaN(n));
    const nextId = String(numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1);

    const footnote: PageFootnote = {
      id: nextId,
      display: data.display.trim(),
      url: data.url.trim(),
      note: data.note.trim(),
      createdBy,
      createdAt: new Date().toISOString()
    };

    map[nextId] = footnote;
    this.writeMap(pageUuid, map);
    this.invalidateHandlerCache(pageUuid);
    return footnote;
  }

  async updateFootnote(
    pageUuid: string,
    id: string,
    data: { display: string; url: string; note: string }
  ): Promise<PageFootnote | null> {
    const map = this.readMap(pageUuid);
    if (!map[id]) return null;

    map[id] = {
      ...map[id],
      display: data.display.trim(),
      url: data.url.trim(),
      note: data.note.trim()
    };
    this.writeMap(pageUuid, map);
    this.invalidateHandlerCache(pageUuid);
    return map[id];
  }

  async deleteFootnote(pageUuid: string, id: string): Promise<boolean> {
    const map = this.readMap(pageUuid);
    if (!map[id]) return false;

    delete map[id];

    if (Object.keys(map).length === 0) {
      // Remove the file entirely when no footnotes remain
      const fp = this.filePath(pageUuid);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    } else {
      this.writeMap(pageUuid, map);
    }
    this.invalidateHandlerCache(pageUuid);
    return true;
  }

  hasFootnotes(pageUuid: string): boolean {
    const fp = this.filePath(pageUuid);
    if (!fs.existsSync(fp)) return false;
    try {
      const map = JSON.parse(fs.readFileSync(fp, 'utf-8')) as FootnoteMap;
      return Object.keys(map).length > 0;
    } catch {
      return false;
    }
  }

  async shutdown(): Promise<void> {}
}
