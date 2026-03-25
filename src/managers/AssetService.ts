/**
 * AssetService — unified search across AttachmentManager and MediaManager.
 *
 * Provides a single `search()` call that fans out to both asset stores and
 * returns a normalised `AssetSearchResult[]` list. Used by the editor picker
 * and the `/api/assets/search` endpoint.
 *
 * Attachment results: searched by filename substring match across all stored
 * attachments (`getAllAttachments()`).
 *
 * Media results: delegated to `MediaManager.search()` which already handles
 * full-text search across the in-memory index (filename, title, description,
 * keywords, year).
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
  /** Wiki page this item is linked to (media) or was first uploaded for (attachment) */
  linkedPageName?: string;
  /** True when the item is gated by a private wiki page */
  isPrivate?: boolean;
  /**
   * Wiki markup snippet ready to paste into the editor.
   * - Attachment: `[{ATTACH src='filename.jpg'}]`
   * - Media:      `[{Image src='media://filename.jpg'}]`
   */
  insertSnippet: string;
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
  /** Maximum results to return (default 50) */
  max?: number;
  /** WikiContext for media access-control evaluation */
  wikiContext?: WikiContext;
}

class AssetService extends BaseManager {
  constructor(engine: WikiEngine) {
    super(engine);
  }

  /**
   * Search across attachment and media stores.
   *
   * Results are attachment-first, then media, each capped at half of `max`
   * when both types are requested.
   */
  async search(options: AssetSearchOptions = {}): Promise<AssetSearchResult[]> {
    const { query = '', types, year, max = 50, wikiContext } = options;
    const includeAttachments = !types || types.includes('attachment');
    const includeMedia = !types || types.includes('media');

    const results: AssetSearchResult[] = [];
    const perTypeMax = types && types.length === 1 ? max : Math.ceil(max / 2);

    if (includeAttachments) {
      try {
        const attachmentResults = await this._searchAttachments(query, perTypeMax);
        results.push(...attachmentResults);
      } catch (err) {
        logger.warn('[AssetService] Attachment search failed:', err);
      }
    }

    if (includeMedia) {
      try {
        const mediaResults = await this._searchMedia(query, year, perTypeMax, wikiContext);
        results.push(...mediaResults);
      } catch (err) {
        logger.warn('[AssetService] Media search failed:', err);
      }
    }

    return results.slice(0, max);
  }

  private async _searchAttachments(query: string, max: number): Promise<AssetSearchResult[]> {
    const attachmentManager = this.engine.getManager('AttachmentManager') as
      | { getAllAttachments(): Promise<Array<{ identifier: string; name?: string; encodingFormat?: string; url?: string; mentions?: Array<{ name: string }> }>> }
      | undefined;

    if (!attachmentManager) return [];

    const all = await attachmentManager.getAllAttachments();
    const q = query.toLowerCase();

    return all
      .filter(a => !q || (a.name || '').toLowerCase().includes(q))
      .slice(0, max)
      .map(a => {
        const filename = a.name || a.identifier;
        const mimeType = a.encodingFormat || '';
        const url = a.url || `/attachments/${a.identifier}`;
        const linkedPageName = a.mentions?.[0]?.name;
        return {
          assetType: 'attachment' as const,
          id: a.identifier,
          filename,
          mimeType,
          url,
          linkedPageName,
          insertSnippet: mimeType.startsWith('image/')
            ? `[{Image src='${filename}'}]`
            : `[{ATTACH src='${filename}'}]`
        };
      });
  }

  private async _searchMedia(
    query: string,
    year: number | undefined,
    max: number,
    wikiContext?: WikiContext
  ): Promise<AssetSearchResult[]> {
    const mediaManager = this.engine.getManager('MediaManager') as
      | {
          search(q: string, ctx?: WikiContext): Promise<Array<{ id: string; filename: string; mimeType: string; year?: number; linkedPageName?: string; isPrivate?: boolean }>>;
          listByYear(y: number, ctx?: WikiContext): Promise<Array<{ id: string; filename: string; mimeType: string; year?: number; linkedPageName?: string; isPrivate?: boolean }>>;
        }
      | undefined;

    if (!mediaManager) return [];

    let items: Array<{ id: string; filename: string; mimeType: string; year?: number; linkedPageName?: string; isPrivate?: boolean }>;

    if (year && !query) {
      items = await mediaManager.listByYear(year, wikiContext);
    } else {
      items = await mediaManager.search(query, wikiContext);
      if (year) {
        items = items.filter(i => i.year === year);
      }
    }

    return items.slice(0, max).map(item => ({
      assetType: 'media' as const,
      id: item.id,
      filename: item.filename,
      mimeType: item.mimeType,
      url: `/media/file/${item.id}`,
      thumbUrl: `/media/thumb/${item.id}?size=150x150`,
      year: item.year,
      linkedPageName: item.linkedPageName,
      isPrivate: item.isPrivate,
      insertSnippet: item.mimeType.startsWith('image/')
        ? `[{Image src='media://${item.filename}'}]`
        : `[{ATTACH src='media://${item.filename}'}]`
    }));
  }
}

export default AssetService;

// CommonJS compatibility
module.exports = AssetService;
