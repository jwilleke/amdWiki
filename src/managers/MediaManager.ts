/**
 * MediaManager - Manages external media files (photos, videos, etc.)
 *
 * Provides browsing, searching, and thumbnail access for pre-existing
 * media files stored on external drives. Unlike AttachmentManager, this
 * manager is read-only with respect to source files and is independent
 * of wiki pages (though items may be linked to pages via linkedPageName).
 *
 * STUB: Actual filesystem scanning is not yet wired up (Phase 4).
 * The manager compiles and registers cleanly; all index queries return
 * empty results until a real FileSystemMediaProvider scan is implemented.
 *
 * Enabled via config: amdwiki.media.enabled = true
 *
 * @class MediaManager
 * @extends BaseManager
 */

import fs from 'fs-extra';
import path from 'path';
import logger from '../utils/logger';
import BaseManager from './BaseManager';
import type { WikiEngine } from '../types/WikiEngine';
import WikiContext from '../context/WikiContext';
import BaseMediaProvider, { MediaItem, ScanResult } from '../providers/BaseMediaProvider';
import FileSystemMediaProvider from '../providers/FileSystemMediaProvider';
import type ConfigurationManager from './ConfigurationManager';

class MediaManager extends BaseManager {
  /** Active media provider (null when not yet initialized) */
  private provider: BaseMediaProvider | null = null;

  /** Handle for the periodic rescan interval timer */
  private scanTimer: ReturnType<typeof setInterval> | null = null;

  constructor(engine: WikiEngine) {
    super(engine);
  }

  /**
   * Initialize the MediaManager.
   *
   * - Creates the thumbnail directory if it does not exist.
   * - Instantiates the FileSystemMediaProvider with config-driven settings.
   * - Loads any existing media-index.json from disk (stub: no-op).
   * - Schedules a periodic background rescan based on amdwiki.media.scaninterval.
   *
   * @param config - Configuration overrides (passed by BaseManager pattern).
   */
  async initialize(config: Record<string, unknown> = {}): Promise<void> {
    await super.initialize(config);

    const configManager = this.engine.getManager<ConfigurationManager>('ConfigurationManager');
    if (!configManager) {
      throw new Error('[MediaManager] ConfigurationManager not available during initialization');
    }

    const defaultThumbDir = path.join(process.env.FAST_STORAGE ?? './data', 'media', 'thumbs');
    const thumbnailDir =
      configManager.getResolvedDataPath('amdwiki.media.thumbnail.dir', defaultThumbDir) ||
      defaultThumbDir;

    const defaultIndexFile = path.join(process.env.FAST_STORAGE ?? './data', 'media-index.json');
    const indexFile =
      configManager.getResolvedDataPath('amdwiki.media.index.file', defaultIndexFile) ||
      defaultIndexFile;

    // Ensure thumbnail directory exists
    try {
      await fs.ensureDir(thumbnailDir);
      logger.debug(`[MediaManager] Thumbnail directory ready: ${thumbnailDir}`);
    } catch (err) {
      logger.warn(`[MediaManager] Could not create thumbnail dir ${thumbnailDir}: ${String(err)}`);
    }

    const folders = configManager.getProperty('amdwiki.media.folders', []) as string[];
    const ignoreDirs = configManager.getProperty('amdwiki.media.ignoredirs', ['.dtrash', '.ts']) as string[];
    const ignoreFiles = configManager.getProperty('amdwiki.media.ignorefiles', ['.photoviewignore', '.plexignore']) as string[];
    const maxDepth = configManager.getProperty('amdwiki.media.maxdepth', 5) as number;
    const thumbnailSizes = configManager.getProperty('amdwiki.media.thumbnail.sizes', '300x300,150x150') as string;
    const metadataPriority = configManager.getProperty('amdwiki.media.metadata.priority', ['EXIF', 'IPTC', 'XMP']) as string[];

    this.provider = new FileSystemMediaProvider({
      folders,
      ignoreDirs,
      ignoreFiles,
      maxDepth,
      indexFile,
      thumbnailDir,
      thumbnailSizes,
      metadataPriority,
      readonly: true
    });

    // Load persisted index so queries work before the first background scan
    await this.provider.initialize();

    const scanInterval = configManager.getProperty('amdwiki.media.scaninterval', 3600000) as number;
    if (scanInterval > 0) {
      this.scanTimer = setInterval(() => {
        void this.scanFolders();
      }, scanInterval);
      // Allow the Node.js process to exit even if this timer is still active
      if (this.scanTimer.unref) {
        this.scanTimer.unref();
      }
    }

    logger.info(`[MediaManager] Initialized (stub). Configured folders: [${folders.join(', ')}]`);
  }

  /**
   * Trigger a media folder scan.
   *
   * STUB: Delegates to FileSystemMediaProvider.scan() which logs a warning and
   * returns an empty ScanResult. Real implementation comes in Phase 4.
   *
   * @param force - Pass true to force a full rescan ignoring cached mtimes.
   * @returns ScanResult summary.
   */
  async scanFolders(force?: boolean): Promise<ScanResult> {
    if (!this.provider) {
      logger.warn('[MediaManager] scanFolders() called before initialization');
      return { scanned: 0, added: 0, updated: 0, errors: 0 };
    }
    logger.info(`[MediaManager] scanFolders(force=${force ?? false}) — not yet implemented (stub)`);
    const result = await this.provider.scan(force);
    logger.info(
      `[MediaManager] Scan complete: scanned=${result.scanned} added=${result.added} ` +
        `updated=${result.updated} errors=${result.errors}`
    );
    return result;
  }

  /**
   * Retrieve a single media item, enforcing private-page access control.
   *
   * When the item is linked to a private wiki page and a WikiContext is
   * provided, access is checked using the same rules as page and attachment
   * routes. Returns null if access is denied (treated as not found).
   *
   * @param id          - Item identifier.
   * @param wikiContext - Caller's WikiContext (pass undefined for admin/internal calls).
   * @returns The MediaItem or null.
   */
  async getItem(id: string, wikiContext?: WikiContext): Promise<MediaItem | null> {
    if (!this.provider) return null;
    const item = await this.provider.getItem(id);
    if (!item) return null;

    // Private-awareness: if item is linked to a private page, check access
    if (item.linkedPageName && wikiContext) {
      const pageWikiContext = new WikiContext(this.engine, {
        context: WikiContext.CONTEXT.VIEW,
        pageName: item.linkedPageName,
        userContext: wikiContext.userContext ?? undefined,
        request: wikiContext.request ?? undefined
      });
      const allowed = await this.checkPrivatePageAccess(pageWikiContext, item.linkedPageName);
      if (!allowed) return null;
    }

    return item;
  }

  /**
   * List all media items for a given year, filtering out private items
   * that the current user cannot access.
   *
   * @param year        - Four-digit year.
   * @param wikiContext - Caller's WikiContext (pass undefined for admin/internal calls).
   * @returns Array of accessible MediaItem objects.
   */
  async listByYear(year: number, wikiContext?: WikiContext): Promise<MediaItem[]> {
    if (!this.provider) return [];
    const items = await this.provider.getItemsByYear(year);
    return this.filterPrivateItems(items, wikiContext);
  }

  /**
   * List all media items linked to a specific wiki page, filtering out
   * private items that the current user cannot access.
   *
   * @param pageName    - Wiki page name to match against item.linkedPageName.
   * @param wikiContext - Caller's WikiContext (pass undefined for admin/internal calls).
   * @returns Array of accessible MediaItem objects.
   */
  async listByPage(pageName: string, wikiContext?: WikiContext): Promise<MediaItem[]> {
    if (!this.provider) return [];
    const items = await this.provider.getItemsByPage(pageName);
    return this.filterPrivateItems(items, wikiContext);
  }

  /**
   * Search media items, filtering out private items that the current user
   * cannot access.
   *
   * @param query       - Search query string.
   * @param wikiContext - Caller's WikiContext.
   * @returns Array of accessible MediaItem objects.
   */
  async search(query: string, wikiContext?: WikiContext): Promise<MediaItem[]> {
    if (!this.provider) return [];
    const items = await this.provider.search(query);
    return this.filterPrivateItems(items, wikiContext);
  }

  /**
   * Retrieve a thumbnail buffer for an item.
   *
   * @param id   - Item identifier.
   * @param size - Requested size string (e.g. "300x300").
   * @returns JPEG buffer or null.
   */
  async getThumbnailBuffer(id: string, size: string): Promise<Buffer | null> {
    if (!this.provider) return null;
    return this.provider.getThumbnailBuffer(id, size);
  }

  /**
   * Return the list of years that have at least one media item, sorted
   * descending (most recent first), filtered by the caller's access level.
   *
   * Currently all years are public — private filtering is at the item level.
   *
   * @param _wikiContext - Caller's WikiContext (reserved for future per-year ACL).
   * @returns Sorted year list.
   */
  async getYears(_wikiContext?: WikiContext): Promise<number[]> {
    if (!this.provider) return [];
    return this.provider.getYears();
  }

  /**
   * Shut down the MediaManager, clearing the rescan timer and releasing
   * provider resources.
   */
  async shutdown(): Promise<void> {
    if (this.scanTimer !== null) {
      clearInterval(this.scanTimer);
      this.scanTimer = null;
    }
    if (this.provider) {
      await this.provider.shutdown();
      this.provider = null;
    }
    await super.shutdown();
    logger.info('[MediaManager] Shutdown complete');
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Filter a list of media items, removing those linked to private pages
   * that the current user is not permitted to access.
   */
  private async filterPrivateItems(items: MediaItem[], wikiContext?: WikiContext): Promise<MediaItem[]> {
    if (!wikiContext) return items; // No context — no filtering (admin/internal)
    const results: MediaItem[] = [];
    for (const item of items) {
      if (item.linkedPageName) {
        const pageWikiContext = new WikiContext(this.engine, {
          context: WikiContext.CONTEXT.VIEW,
          pageName: item.linkedPageName,
          userContext: wikiContext.userContext ?? undefined,
          request: wikiContext.request ?? undefined
        });
        const allowed = await this.checkPrivatePageAccess(pageWikiContext, item.linkedPageName);
        if (allowed) results.push(item);
      } else {
        results.push(item);
      }
    }
    return results;
  }

  /**
   * Check whether the user in wikiContext may access a (potentially private) page.
   * Mirrors the logic in WikiRoutes.checkPrivatePageAccess().
   *
   * Returns true (allow) if the page is not private, if the user is an admin,
   * or if the user is the page creator.  Returns false (deny) otherwise.
   */
  private async checkPrivatePageAccess(wikiContext: WikiContext, pageName: string): Promise<boolean> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- dynamic manager access mirrors WikiRoutes pattern
      const pageManager = this.engine.getManager('PageManager');
      if (!pageManager) return true;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const pageMetadata = await pageManager.getPageMetadata(pageName) as { uuid?: string } | null;
      if (!pageMetadata?.uuid) return true;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const provider = (pageManager.getCurrentPageProvider?.() ?? pageManager.provider) as { pageIndex?: { pages: Record<string, { location?: string; creator?: string }> } | null } | undefined;
      if (!provider) return true;

      const pageIndex = provider.pageIndex;
      if (!pageIndex) return true;

      const entry = pageIndex.pages[pageMetadata.uuid];
      if (!entry || entry.location !== 'private') return true;

      const userContext = wikiContext.userContext as { username?: string; roles?: string[] } | null | undefined;
      if (!userContext?.username) return false;
      if (Array.isArray(userContext.roles) && userContext.roles.includes('admin')) return true;
      if (userContext.username === entry.creator) return true;
      return false;
    } catch {
      return true; // conservative: allow if check fails
    }
  }
}

export default MediaManager;

// CommonJS compatibility
module.exports = MediaManager;
