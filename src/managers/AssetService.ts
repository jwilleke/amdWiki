/**
 * AssetService — unified search across AttachmentManager and MediaManager.
 *
 * Provides a single `search()` call that fans out to both asset stores and
 * returns a normalised `AssetPage` (results slice + total count).
 * Used by the editor picker and the `/api/assets/search` endpoint.
 *
 * Results are returned as `AssetRecord` (schema.org-aligned fields).
 * Both stores hold their working sets in memory so fetching all matches then
 * slicing for pagination is fast and accurate.
 *
 * Access control: MediaManager.search() accepts a WikiContext for private-page
 * filtering. Attachments have no per-item privacy model today — all are returned
 * for authenticated users.
 */

import BaseManager from './BaseManager';
import type { WikiEngine } from '../types/WikiEngine';
import WikiContext from '../context/WikiContext';
import type { AssetRecord, AssetPage } from '../types/Asset';
import logger from '../utils/logger';

/**
 * Options for AssetService.search().
 *
 * Extends the per-provider AssetQuery with service-level concerns:
 * store filtering (types) and access-control context (wikiContext).
 */
export interface AssetSearchOptions {
  /** Free-text query — case-insensitive substring / keyword match */
  query?: string;
  /** Restrict results to one store (omit for both) */
  types?: ('attachment' | 'media')[];
  /** Filter media results to a specific year */
  year?: number;
  /** Number of results per page (default 48) */
  pageSize?: number;
  /** Zero-based offset into the full result set (default 0) */
  offset?: number;
  /** Sort field: 'date' (default) or 'caption' */
  sort?: 'date' | 'caption';
  /** Sort direction: 'asc' (default) or 'desc' */
  order?: 'asc' | 'desc';
  /** Filter results to a MIME category: 'image', 'document', or 'other' */
  mimeCategory?: 'image' | 'document' | 'other';
  /** WikiContext for media access-control evaluation */
  wikiContext?: WikiContext;
}

// ---------------------------------------------------------------------------
// Deprecated aliases — kept so existing imports compile during the transition
// to AssetRecord / AssetPage. Will be removed in a future cleanup.
// ---------------------------------------------------------------------------

/** @deprecated Use AssetRecord from src/types/Asset.ts */
export type AssetSearchResult = AssetRecord;

/** @deprecated Use AssetPage from src/types/Asset.ts */
export type AssetSearchPage = AssetPage;

// ---------------------------------------------------------------------------

class AssetService extends BaseManager {
  constructor(engine: WikiEngine) {
    super(engine);
  }

  /**
   * Search across attachment and media stores with pagination.
   *
   * Fetches all matching items from both stores (in-memory operations),
   * combines them (attachments first, then media), applies offset+pageSize
   * slicing, and returns the page along with the total match count.
   */
  async search(options: AssetSearchOptions = {}): Promise<AssetPage> {
    const { query = '', types, year, pageSize = 48, offset = 0, sort = 'date', order = 'asc', mimeCategory, wikiContext } = options;
    const includeAttachments = !types || types.includes('attachment');
    const includeMedia = !types || types.includes('media');

    const all: AssetRecord[] = [];

    if (includeAttachments) {
      try {
        all.push(...await this._searchAttachments(query));
      } catch (err) {
        logger.warn('[AssetService] Attachment search failed:', err);
      }
    }

    if (includeMedia) {
      try {
        all.push(...await this._searchMedia(query, year, wikiContext));
      } catch (err) {
        logger.warn('[AssetService] Media search failed:', err);
      }
    }

    const filtered = mimeCategory ? all.filter(r => this._matchesMimeCategory(r.encodingFormat, mimeCategory)) : all;

    this._sortResults(filtered, sort, order);

    const total = filtered.length;
    const results = filtered.slice(offset, offset + pageSize);

    return { results, total, hasMore: offset + results.length < total };
  }

  private _matchesMimeCategory(encodingFormat: string, category: 'image' | 'document' | 'other'): boolean {
    const m = encodingFormat || '';
    const isImage = m.startsWith('image/');
    const isDocument = m.includes('pdf') || m.includes('document') ||
      m.includes('spreadsheet') || m.startsWith('text/');
    if (category === 'image') return isImage;
    if (category === 'document') return isDocument;
    return !isImage && !isDocument;
  }

  private _sortResults(items: AssetRecord[], sort: 'date' | 'caption', order: 'asc' | 'desc'): void {
    const asc = order === 'asc';
    items.sort((a, b) => {
      let cmp = 0;
      if (sort === 'caption') {
        const getCaption = (r: AssetRecord) =>
          (r.description ?? r.filename ?? '').toLowerCase();
        cmp = getCaption(a).localeCompare(getCaption(b));
      } else {
        const getDate = (r: AssetRecord): number => {
          if (r.dateCreated) {
            const d = new Date(r.dateCreated);
            if (!isNaN(d.getTime())) return d.getTime();
          }
          return 0;
        };
        cmp = getDate(a) - getDate(b);
      }
      return asc ? cmp : -cmp;
    });
  }

  private async _searchAttachments(query: string): Promise<AssetRecord[]> {
    type AttachmentManagerLike = {
      getAllAttachments(): Promise<Array<{
        id: string;
        filename: string;
        mimeType?: string;
        description?: string;
        uploadedAt?: string;
        uploadedBy?: string;
      }>>;
    };
    const attachmentManager = this.engine.getManager<AttachmentManagerLike>('AttachmentManager');

    if (!attachmentManager) return [];

    const all = await attachmentManager.getAllAttachments();
    const q = query.toLowerCase();

    return all
      .filter(a => !q ||
        (a.filename || '').toLowerCase().includes(q) ||
        (a.description || '').toLowerCase().includes(q))
      .map(a => {
        const filename = a.filename || a.id;
        const encodingFormat = a.mimeType || '';
        return {
          id: a.id,
          providerId: 'local',
          filename,
          encodingFormat,
          url: `/attachments/${a.id}`,
          dateCreated: a.uploadedAt,
          author: a.uploadedBy,
          description: a.description || undefined,
          keywords: [],
          mentions: [],
          metadata: {},
          insertSnippet: encodingFormat.startsWith('image/')
            ? `[{Image src='${filename}'}]`
            : `[{ATTACH src='${filename}'}]`
        };
      });
  }

  private async _searchMedia(
    query: string,
    year: number | undefined,
    wikiContext?: WikiContext
  ): Promise<AssetRecord[]> {
    type MediaManagerLike = {
      search(q: string, ctx?: WikiContext): Promise<Array<{
        id: string;
        filename: string;
        mimeType: string;
        year?: number;
        linkedPageName?: string;
        isPrivate?: boolean;
        metadata?: Record<string, unknown>;
      }>>;
      listByYear(y: number, ctx?: WikiContext): Promise<Array<{
        id: string;
        filename: string;
        mimeType: string;
        year?: number;
        linkedPageName?: string;
        isPrivate?: boolean;
        metadata?: Record<string, unknown>;
      }>>;
    };
    const mediaManager = this.engine.getManager<MediaManagerLike>('MediaManager');

    if (!mediaManager) return [];

    let items: Array<{
      id: string;
      filename: string;
      mimeType: string;
      year?: number;
      linkedPageName?: string;
      isPrivate?: boolean;
      metadata?: Record<string, unknown>;
    }>;

    if (year && !query) {
      items = await mediaManager.listByYear(year, wikiContext);
    } else {
      items = await mediaManager.search(query, wikiContext);
      if (year) {
        items = items.filter(i => i.year === year);
      }
    }

    return items.map(item => {
      const m = item.metadata ?? {};
      const description = typeof m['caption'] === 'string' && m['caption']
        ? m['caption']
        : (typeof m['imageDescription'] === 'string' && m['imageDescription'] ? m['imageDescription'] : undefined);
      const dateCreated = typeof m['dateTimeOriginal'] === 'string' ? m['dateTimeOriginal'] : undefined;
      const rawKeywords = m['keywords'];
      const keywords: string[] = Array.isArray(rawKeywords)
        ? (rawKeywords as unknown[]).filter((k): k is string => typeof k === 'string')
        : typeof rawKeywords === 'string' && rawKeywords ? [rawKeywords] : [];
      return {
        id: item.id,
        providerId: 'media-library',
        filename: item.filename,
        encodingFormat: item.mimeType,
        url: `/media/file/${item.id}`,
        thumbnailUrl: `/media/thumb/${item.id}?size=150x150`,
        dateCreated,
        description,
        keywords,
        mentions: item.linkedPageName ? [item.linkedPageName] : [],
        isPrivate: item.isPrivate,
        metadata: item.metadata ?? {},
        insertSnippet: item.mimeType.startsWith('image/')
          ? `[{Image src='media://${item.filename}'}]`
          : `[{ATTACH src='media://${item.filename}'}]`
      };
    });
  }
}

export default AssetService;

// CommonJS compatibility
module.exports = AssetService;
