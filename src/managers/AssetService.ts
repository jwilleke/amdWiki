/**
 * AssetService — unified search across AttachmentManager and MediaManager.
 *
 * Provides a single `search()` call that fans out to both asset stores and
 * returns a normalised `AssetSearchPage` (results slice + total count).
 * Used by the editor picker and the `/api/assets/search` endpoint.
 *
 * Attachment results: searched by filename substring match across all stored
 * attachments (`getAllAttachments()`).
 *
 * Media results: delegated to `MediaManager.search()` which already handles
 * full-text search across the in-memory index (filename, title, description,
 * keywords, year).
 *
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
import logger from '../utils/logger';

/**
 * A normalised asset record returned by AssetService.search().
 */
export interface AssetSearchResult {
  /** Discriminator — which store this came from */
  assetType: 'attachment' | 'media';
  /** Store-internal identifier */
  id: string;
  /** Original filename */
  filename: string;
  /** MIME type */
  mimeType: string;
  /** Browsable / embeddable URL */
  url: string;
  /** Thumbnail URL (media only) */
  thumbUrl?: string;
  /** Year (media only) */
  year?: number;
  /** Caption from EXIF Description field (media only) */
  caption?: string;
  /** ISO-style date string from EXIF DateTimeOriginal, e.g. "2024-06-15 10:30:00" (media only) */
  dateTimeOriginal?: string;
  /** Wiki page this item is linked to (media) or was first uploaded for (attachment) */
  linkedPageName?: string;
  /** True when the item is gated by a private wiki page */
  isPrivate?: boolean;
  /**
   * Wiki markup snippet ready to paste into the editor.
   * - Attachment image:   `[{Image src='filename.jpg'}]`
   * - Attachment other:   `[{ATTACH src='filename.pdf'}]`
   * - Media image:        `[{Image src='media://filename.jpg'}]`
   * - Media other:        `[{ATTACH src='media://clip.mp4'}]`
   */
  insertSnippet: string;
}

/**
 * Paginated result returned by AssetService.search().
 */
export interface AssetSearchPage {
  /** The current page of results */
  results: AssetSearchResult[];
  /** Total number of matching items across both stores */
  total: number;
  /** True when there are more results beyond this page */
  hasMore: boolean;
}

/**
 * Options for AssetService.search().
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
  /** WikiContext for media access-control evaluation */
  wikiContext?: WikiContext;
}

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
  async search(options: AssetSearchOptions = {}): Promise<AssetSearchPage> {
    const { query = '', types, year, pageSize = 48, offset = 0, sort = 'date', order = 'asc', wikiContext } = options;
    const includeAttachments = !types || types.includes('attachment');
    const includeMedia = !types || types.includes('media');

    const all: AssetSearchResult[] = [];

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

    this._sortResults(all, sort, order);

    const total = all.length;
    const results = all.slice(offset, offset + pageSize);

    return { results, total, hasMore: offset + results.length < total };
  }

  private _sortResults(items: AssetSearchResult[], sort: 'date' | 'caption', order: 'asc' | 'desc'): void {
    const asc = order === 'asc';
    items.sort((a, b) => {
      let cmp = 0;
      if (sort === 'caption') {
        const getCaption = (r: AssetSearchResult) =>
          (r.caption ?? r.filename ?? '').toLowerCase();
        cmp = getCaption(a).localeCompare(getCaption(b));
      } else {
        const getDate = (r: AssetSearchResult): number => {
          if (r.dateTimeOriginal) {
            const d = new Date(r.dateTimeOriginal);
            if (!isNaN(d.getTime())) return d.getTime();
          }
          return (r.year ?? 0) * 10000;
        };
        cmp = getDate(a) - getDate(b);
      }
      return asc ? cmp : -cmp;
    });
  }

  private async _searchAttachments(query: string): Promise<AssetSearchResult[]> {
    type AttachmentManagerLike = { getAllAttachments(): Promise<Array<{ id: string; filename: string; mimeType?: string; description?: string; uploadedAt?: string }>> };
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
        const mimeType = a.mimeType || '';
        const url = `/attachments/${a.id}`;
        return {
          assetType: 'attachment' as const,
          id: a.id,
          filename,
          mimeType,
          url,
          dateTimeOriginal: a.uploadedAt,
          insertSnippet: mimeType.startsWith('image/')
            ? `[{Image src='${filename}'}]`
            : `[{ATTACH src='${filename}'}]`
        };
      });
  }

  private async _searchMedia(
    query: string,
    year: number | undefined,
    wikiContext?: WikiContext
  ): Promise<AssetSearchResult[]> {
    type MediaManagerLike = {
      search(q: string, ctx?: WikiContext): Promise<Array<{ id: string; filename: string; mimeType: string; year?: number; linkedPageName?: string; isPrivate?: boolean; metadata?: Record<string, unknown> }>>;
      listByYear(y: number, ctx?: WikiContext): Promise<Array<{ id: string; filename: string; mimeType: string; year?: number; linkedPageName?: string; isPrivate?: boolean; metadata?: Record<string, unknown> }>>;
    };
    const mediaManager = this.engine.getManager<MediaManagerLike>('MediaManager');

    if (!mediaManager) return [];

    let items: Array<{ id: string; filename: string; mimeType: string; year?: number; linkedPageName?: string; isPrivate?: boolean; metadata?: Record<string, unknown> }>;

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
      const caption = typeof m['caption'] === 'string' && m['caption']
        ? m['caption']
        : (typeof m['imageDescription'] === 'string' && m['imageDescription'] ? m['imageDescription'] : undefined);
      const dateTimeOriginal = typeof m['dateTimeOriginal'] === 'string' ? m['dateTimeOriginal'] : undefined;
      return {
        assetType: 'media' as const,
        id: item.id,
        filename: item.filename,
        mimeType: item.mimeType,
        url: `/media/file/${item.id}`,
        thumbUrl: `/media/thumb/${item.id}?size=150x150`,
        year: item.year,
        caption,
        dateTimeOriginal,
        linkedPageName: item.linkedPageName,
        isPrivate: item.isPrivate,
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
