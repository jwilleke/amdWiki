/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import FileSystemProvider from './FileSystemProvider';
import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';
import DeltaStorage from '../utils/DeltaStorage';
import {
  WikiPage,
  PageFrontmatter,
  VersionContent,
  VersionDiff,
  VersionHistoryEntry
} from '../types';
import { WikiEngine, ProviderInfo } from './BasePageProvider';

/**
 * Page index entry structure
 */
interface PageIndexEntry {
  title: string;
  uuid: string;
  currentVersion: number;
  location: 'pages' | 'required-pages';
  lastModified: string;
  editor: string;
  hasVersions: boolean;
}

/**
 * Page index structure
 */
interface PageIndex {
  version: string;
  lastUpdated: string;
  pageCount: number;
  pages: Record<string, PageIndexEntry>;
}


/**
 * Version metadata for internal use (matches manifest structure)
 */
interface InternalVersionMetadata {
  version?: number;
  dateCreated: string;
  editor: string;
  changeType: string;
  comment: string;
  contentHash: string;
  contentSize: number;
  compressed: boolean;
  isDelta: boolean;
  isCheckpoint?: boolean;
}

/**
 * Internal manifest structure
 */
interface InternalManifest {
  pageId: string;
  pageName: string;
  currentVersion: number;
  versions: InternalVersionMetadata[];
  lastModified?: string;
  editor?: string;
  author?: string;
}

/**
 * Page cache info (internal)
 */
interface PageCacheInfo {
  title: string;
  uuid: string;
  metadata?: PageFrontmatter;
}

/**
 * VersioningFileProvider - File-based storage with version history
 *
 * Extends FileSystemProvider to add git-style page versioning with delta storage.
 * Maintains backward compatibility - can be swapped with FileSystemProvider.
 *
 * Features:
 * - Per-page version history with delta storage (v1 = full, v2+ = diffs)
 * - Compression of old versions (gzip)
 * - Centralized page index for fast lookups (./data/page-index.json)
 * - Version metadata tracking (author, date, change type, content hash)
 * - Retention policies (maxVersions, retentionDays)
 *
 * Directory Structure:
 * ```
 * ./data/page-index.json              # Centralized index for fast lookups
 * ./pages/{uuid}.md                    # Current version of page
 * ./pages/versions/{uuid}/
 *   ├── manifest.json                  # Single source of truth for all version metadata
 *   ├── v1/content.md                  # Full content (baseline)
 *   ├── v2/content.diff                # Delta from v1
 *   └── v3/content.diff                # Delta from v2
 * ./required-pages/{uuid}.md
 * ./required-pages/versions/{uuid}/... # Same structure for system pages
 * ```
 *
 * Note: Version metadata (author, date, hash, etc.) is stored ONLY in manifest.json
 *       to avoid data inconsistency. Individual v{N}/meta.json files are no longer used.
 *
 * @extends FileSystemProvider
 */
class VersioningFileProvider extends FileSystemProvider {
  /** Path to centralized page index */
  private pageIndexPath: string | null;

  /** Maximum versions to keep per page */
  private maxVersions: number;

  /** Days to retain versions */
  private retentionDays: number;

  /** Enable gzip compression */
  private compressionEnabled: boolean;

  /** Enable delta storage (v1=full, v2+=diff) */
  private deltaStorageEnabled: boolean;

  /** Store full snapshot every N versions (performance optimization) */
  private checkpointInterval: number;

  /** Version directories (created during initialize) */
  private pagesVersionsDir: string | null;
  private requiredPagesVersionsDir: string | null;

  /** In-memory page index cache */
  private pageIndex: PageIndex | null;

  /** Version cache for performance (LRU cache) */
  private versionCache: Map<string, string>;
  private versionCacheSize: number;

  /**
   * Create a new VersioningFileProvider
   * @param engine - The WikiEngine instance
   */
  constructor(engine: WikiEngine) {
    super(engine);

    // Versioning configuration
    this.pageIndexPath = null;
    this.maxVersions = 50;
    this.retentionDays = 365;
    this.compressionEnabled = true;
    this.deltaStorageEnabled = true;
    this.checkpointInterval = 10;

    // Version directories (created during initialize)
    this.pagesVersionsDir = null;
    this.requiredPagesVersionsDir = null;

    // In-memory page index cache
    this.pageIndex = null;

    // Version cache for performance (LRU cache)
    this.versionCache = new Map();
    this.versionCacheSize = 50;
  }

  /**
   * Initialize the versioning provider
   *
   * 1. Calls parent FileSystemProvider.initialize()
   * 2. Loads versioning configuration
   * 3. Creates version directories
   * 4. Loads or creates page-index.json
   *
   * @returns Promise<void>
   */
  async initialize(): Promise<void> {
    // Call parent initialization (sets up pages directories, caching, etc.)
    await super.initialize();

    const configManager = this.engine.getManager('ConfigurationManager');
    if (!configManager) {
      throw new Error('VersioningFileProvider requires ConfigurationManager');
    }

    // Load versioning configuration (ALL LOWERCASE)
    await this.loadVersioningConfig(configManager);

    // Create version directories
    await this.createVersionDirectories();

    // Load or create page index
    await this.loadOrCreatePageIndex();

    logger.info('[VersioningFileProvider] Initialized with versioning enabled');
    logger.info(`[VersioningFileProvider] Delta storage: ${this.deltaStorageEnabled ? 'enabled' : 'disabled'}`);
    logger.info(`[VersioningFileProvider] Compression: ${this.compressionEnabled ? 'enabled' : 'disabled'}`);
    logger.info(`[VersioningFileProvider] Max versions: ${this.maxVersions}, Retention: ${this.retentionDays} days`);
  }

  /**
   * Load versioning configuration from ConfigurationManager
   * @param configManager - ConfigurationManager instance
   */
  private loadVersioningConfig(configManager: any): Promise<void> {
    // Page index location
    const indexPath = configManager.getProperty(
      'amdwiki.page.provider.versioning.indexfile',
      './data/page-index.json'
    );
    this.pageIndexPath = path.isAbsolute(indexPath) ? indexPath : path.join(process.cwd(), indexPath);

    // Version retention settings
    this.maxVersions = configManager.getProperty(
      'amdwiki.page.provider.versioning.maxversions',
      50
    );

    this.retentionDays = configManager.getProperty(
      'amdwiki.page.provider.versioning.retentiondays',
      365
    );

    // Storage optimization settings
    const compressionSetting = configManager.getProperty(
      'amdwiki.page.provider.versioning.compression',
      'gzip'
    );
    this.compressionEnabled = compressionSetting === 'gzip';

    this.deltaStorageEnabled = configManager.getProperty(
      'amdwiki.page.provider.versioning.deltastorage',
      true
    );

    // Performance optimization settings
    this.checkpointInterval = configManager.getProperty(
      'amdwiki.page.provider.versioning.checkpointinterval',
      10
    );

    this.versionCacheSize = configManager.getProperty(
      'amdwiki.page.provider.versioning.cachesize',
      50
    );

    // Validate configuration
    if (this.maxVersions < 1) {
      logger.warn('[VersioningFileProvider] Invalid maxVersions, using default: 50');
      this.maxVersions = 50;
    }

    if (this.retentionDays < 1) {
      logger.warn('[VersioningFileProvider] Invalid retentionDays, using default: 365');
      this.retentionDays = 365;
    }

    if (this.checkpointInterval < 5) {
      logger.warn('[VersioningFileProvider] Invalid checkpointInterval, using default: 10');
      this.checkpointInterval = 10;
    }

    return Promise.resolve();
  }

  /**
   * Create version directories if they don't exist
   */
  private async createVersionDirectories(): Promise<void> {
    if (!this.pagesDirectory || !this.requiredPagesDirectory) {
      throw new Error('FileSystemProvider not initialized - directories not set');
    }

    // Create versions subdirectory under pages
    this.pagesVersionsDir = path.join(this.pagesDirectory, 'versions');
    await fs.ensureDir(this.pagesVersionsDir);

    // Create versions subdirectory under required-pages
    this.requiredPagesVersionsDir = path.join(this.requiredPagesDirectory, 'versions');
    await fs.ensureDir(this.requiredPagesVersionsDir);

    // Create data directory for page index
    if (this.pageIndexPath) {
      const dataDir = path.dirname(this.pageIndexPath);
      await fs.ensureDir(dataDir);
    }

    logger.info('[VersioningFileProvider] Version directories created');
    logger.info(`[VersioningFileProvider]   - ${this.pagesVersionsDir}`);
    logger.info(`[VersioningFileProvider]   - ${this.requiredPagesVersionsDir}`);

    return Promise.resolve();
  }

  /**
   * Load existing page index or create new one
   * If index is empty but pages exist, auto-migrate them
   */
  private async loadOrCreatePageIndex(): Promise<void> {
    if (!this.pageIndexPath) {
      throw new Error('Page index path not set');
    }

    if (await fs.pathExists(this.pageIndexPath)) {
      try {
        const indexData = await fs.readFile(this.pageIndexPath, 'utf8');
        this.pageIndex = JSON.parse(indexData);
        logger.info(`[VersioningFileProvider] Loaded page index: ${this.pageIndex?.pageCount} pages`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('[VersioningFileProvider] Failed to load page index, creating new:', errorMessage);
        await this.createEmptyPageIndex();
      }
    } else {
      logger.info('[VersioningFileProvider] No page index found, creating new');
      await this.createEmptyPageIndex();
    }

    // Auto-migrate if index is empty but pages exist
    if (this.pageIndex && this.pageIndex.pageCount === 0 && this.pageCache && this.pageCache.size > 0) {
      logger.info(`[VersioningFileProvider] Auto-migrating ${this.pageCache.size} existing pages...`);
      await this.autoMigrateExistingPages();

      // If still empty after migration, rebuild index from existing manifests
      if (this.pageIndex.pageCount === 0) {
        logger.info('[VersioningFileProvider] Rebuilding page index from existing version manifests...');
        await this.rebuildPageIndexFromManifests();
      }
    }
  }

  /**
   * Create empty page index structure
   */
  private createEmptyPageIndex(): Promise<void> {
    this.pageIndex = {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      pageCount: 0,
      pages: {}
    };
    return this.savePageIndex();
  }

  /**
   * Save page index to disk (atomic write)
   */
  private savePageIndex(): Promise<void> {
    if (!this.pageIndex || !this.pageIndexPath) {
      throw new Error('Page index not initialized');
    }

    this.pageIndex.lastUpdated = new Date().toISOString();

    // Atomic write: write to temp file, then rename
    const tempPath = `${this.pageIndexPath}.tmp`;
    return fs.writeFile(tempPath, JSON.stringify(this.pageIndex, null, 2), 'utf8')
      .then(() => fs.rename(tempPath, this.pageIndexPath));
  }

  /**
   * Auto-migrate existing pages to versioning
   * Creates v1 for all pages that don't have versions yet
   */
  private async autoMigrateExistingPages(): Promise<void> {
    let migratedCount = 0;
    let errorCount = 0;

    for (const [uuid, pageData] of this.pageCache.entries()) {
      try {
        // Check if page already has versions
        const versionDir = this.getVersionDirectory(uuid);
        const manifestPath = path.join(versionDir, 'manifest.json');

        if (await fs.pathExists(manifestPath)) {
          logger.debug(`[VersioningFileProvider] Page ${(pageData as PageCacheInfo).title} already has versions, skipping`);
          continue;
        }

        // Determine location (check which directory the page is in)
        const pagesPath = path.join(this.pagesDirectory, `${uuid}.md`);
        const requiredPath = path.join(this.requiredPagesDirectory, `${uuid}.md`);

        let location: 'pages' | 'required-pages' = 'pages';
        let pagePath = pagesPath;

        if (await fs.pathExists(requiredPath)) {
          location = 'required-pages';
          pagePath = requiredPath;
        }

        // Read current page content
        let content = '';
        let metadata: Partial<PageFrontmatter> = {};

        if (await fs.pathExists(pagePath)) {
          const fileContent = await fs.readFile(pagePath, 'utf8');
          const parsed = matter(fileContent);
          content = parsed.content;
          metadata = parsed.data as PageFrontmatter;
        }

        // Create v1
        await this.createInitialVersion(uuid, (pageData as PageCacheInfo).title, content, metadata, location);

        // Update page index
        await this.updatePageInIndex(uuid, {
          title: (pageData as PageCacheInfo).title,
          uuid: uuid,
          currentVersion: 1,
          location: location,
          lastModified: new Date().toISOString(),
          editor: 'system',
          hasVersions: true
        });

        migratedCount++;

        if (migratedCount % 10 === 0) {
          logger.info(`[VersioningFileProvider] Migrated ${migratedCount}/${this.pageCache.size} pages...`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        logger.error(`[VersioningFileProvider] Failed to migrate page ${(pageData as PageCacheInfo).title} (${uuid}): ${errorMessage}`);
        if (errorStack) {
          logger.debug(errorStack);
        }
        errorCount++;
      }
    }

    logger.info(`[VersioningFileProvider] Auto-migration complete: ${migratedCount} pages migrated, ${errorCount} errors`);
  }

  /**
   * Rebuild page index from existing version manifests
   * Used when index is lost but versions exist
   */
  private async rebuildPageIndexFromManifests(): Promise<void> {
    let rebuiltCount = 0;
    let errorCount = 0;

    for (const [uuid, pageData] of this.pageCache.entries()) {
      try {
        // Determine location
        const pagesPath = path.join(this.pagesDirectory, `${uuid}.md`);
        const requiredPath = path.join(this.requiredPagesDirectory, `${uuid}.md`);
        const location: 'pages' | 'required-pages' = (await fs.pathExists(requiredPath)) ? 'required-pages' : 'pages';

        // Load manifest
        const versionDir = this.getVersionDirectory(uuid, location);
        const manifestPath = path.join(versionDir, 'manifest.json');

        if (await fs.pathExists(manifestPath)) {
          const manifestData = await fs.readFile(manifestPath, 'utf8');
          const manifest = JSON.parse(manifestData) as InternalManifest;

          // Update page index
          await this.updatePageInIndex(uuid, {
            title: (pageData as PageCacheInfo).title,
            uuid: uuid,
            currentVersion: manifest.currentVersion,
            location: location,
            lastModified: manifest.lastModified || new Date().toISOString(),
            editor: manifest.editor || manifest.author || 'unknown',
            hasVersions: true
          });

          rebuiltCount++;

          if (rebuiltCount % 10 === 0) {
            logger.info(`[VersioningFileProvider] Rebuilt ${rebuiltCount}/${this.pageCache.size} index entries...`);
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`[VersioningFileProvider] Failed to rebuild index for ${(pageData as PageCacheInfo).title} (${uuid}): ${errorMessage}`);
        errorCount++;
      }
    }

    logger.info(`[VersioningFileProvider] Page index rebuild complete: ${rebuiltCount} entries rebuilt, ${errorCount} errors`);
  }

  /**
   * Update a single page entry in the index
   * @param uuid - Page UUID
   * @param data - Page data to update
   */
  private updatePageInIndex(uuid: string, data: PageIndexEntry): Promise<void> {
    if (!this.pageIndex) {
      throw new Error('Page index not initialized');
    }

    if (!this.pageIndex.pages[uuid]) {
      this.pageIndex.pageCount++;
    }

    this.pageIndex.pages[uuid] = {
      ...this.pageIndex.pages[uuid],
      ...data,
      uuid: uuid
    };

    return this.savePageIndex();
  }

  /**
   * Remove a page from the page index
   * @param uuid - Page UUID
   */
  private removePageFromIndex(uuid: string): Promise<void> {
    if (!this.pageIndex) {
      throw new Error('Page index not initialized');
    }

    if (this.pageIndex.pages[uuid]) {
      delete this.pageIndex.pages[uuid];
      this.pageIndex.pageCount--;
      logger.info(`[VersioningFileProvider] Removed page ${uuid} from index`);
      return this.savePageIndex();
    }
    return Promise.resolve();
  }

  /**
   * Get version directory for a page
   * @param uuid - Page UUID
   * @param location - 'pages' or 'required-pages'
   * @returns Version directory path
   */
  private getVersionDirectory(uuid: string, location: 'pages' | 'required-pages' = 'pages'): string {
    const baseDir = location === 'required-pages'
      ? this.requiredPagesVersionsDir
      : this.pagesVersionsDir;

    if (!baseDir) {
      throw new Error('Version directories not initialized');
    }

    return path.join(baseDir, uuid);
  }

  // ============================================================================
  // Manifest.json Management
  // ============================================================================

  /**
   * Load manifest for a page
   * @param uuid - Page UUID
   * @param location - 'pages' or 'required-pages'
   * @returns Manifest data or null if doesn't exist
   */
  private loadManifest(uuid: string, location: 'pages' | 'required-pages'): Promise<InternalManifest | null> {
    const versionDir = this.getVersionDirectory(uuid, location);
    const manifestPath = path.join(versionDir, 'manifest.json');

    return fs.pathExists(manifestPath).then(exists => {
      if (!exists) {
        return null;
      }

      return fs.readFile(manifestPath, 'utf8')
        .then(manifestData => JSON.parse(manifestData))
        .catch(error => {
          const errorMessage = error instanceof Error ? error.message : String(error);
          logger.error(`[VersioningFileProvider] Failed to load manifest for ${uuid}:`, errorMessage);
          return null;
        });
    });
  }

  /**
   * Save manifest for a page (atomic write)
   * @param uuid - Page UUID
   * @param location - 'pages' or 'required-pages'
   * @param manifest - Manifest data
   */
  private saveManifest(uuid: string, location: 'pages' | 'required-pages', manifest: InternalManifest): Promise<void> {
    const versionDir = this.getVersionDirectory(uuid, location);
    const manifestPath = path.join(versionDir, 'manifest.json');

    // Atomic write
    const tempPath = `${manifestPath}.tmp`;
    return fs.ensureDir(versionDir)
      .then(() => fs.writeFile(tempPath, JSON.stringify(manifest, null, 2), 'utf8'))
      .then(() => fs.rename(tempPath, manifestPath));
  }

  /**
   * Create initial manifest for a new page
   * @param uuid - Page UUID
   * @param pageName - Page title
   * @returns Initial manifest
   */
  private createInitialManifest(uuid: string, pageName: string): InternalManifest {
    return {
      pageId: uuid,
      pageName: pageName,
      currentVersion: 0,
      versions: []
    };
  }

  /**
   * Add version entry to manifest
   * @param manifest - Manifest object
   * @param versionData - Version metadata
   */
  private addVersionToManifest(manifest: InternalManifest, versionData: InternalVersionMetadata): void {
    manifest.currentVersion++;
    manifest.versions.push({
      version: manifest.currentVersion,
      ...versionData
    });
  }

  // ============================================================================
  // Version Creation
  // ============================================================================

  /**
   * Override savePage to create versions
   *
   * Algorithm:
   * 1. Check if page exists (new vs update)
   * 2. If update: create diff and new version
   * 3. If new: create initial version (v1 with full content)
   * 4. Update manifest.json
   * 5. Call parent savePage() for current content
   * 6. Update page-index.json
   *
   * @param pageName - Page title
   * @param content - New content
   * @param metadata - Page metadata
   * @returns Promise<void>
   */
  async savePage(pageName: string, content: string, metadata: Partial<PageFrontmatter> = {}): Promise<void> {
    // Check if page exists using public method
    const pageExists = this.pageExists(pageName);

    // Get existing page info if it exists
    let pageInfo: WikiPage | null = null;
    if (pageExists) {
      try {
        pageInfo = await this.getPage(pageName);
      } catch (error) {
        // Page might exist but not be readable, treat as new
        pageInfo = null;
      }
    }

    // Determine UUID (existing or new)
    const uuid = pageInfo?.uuid || metadata.uuid || uuidv4();

    // Determine location based on system-category
    const systemCategory = metadata['system-category'] || (metadata as any).systemCategory || 'General';
    const configManager = this.engine.getManager('ConfigurationManager') as { getProperty: (key: string, defaultValue: unknown) => unknown } | undefined;
    const systemCategoriesConfig = configManager?.getProperty('amdwiki.system-category', null);

    let location: 'pages' | 'required-pages' = 'pages';
    if (systemCategoriesConfig) {
      for (const [key, config] of Object.entries(systemCategoriesConfig)) {
        if ((config as any).label?.toLowerCase() === systemCategory.toLowerCase()) {
          location = (config as any).storageLocation === 'required' ? 'required-pages' : 'pages';
          break;
        }
      }
    }

    try {
      if (pageInfo) {
        // Existing page: create new version with diff
        await this.createNewVersion(uuid, pageName, content, metadata, location, pageInfo);
      } else {
        // New page: create initial version
        await this.createInitialVersion(uuid, pageName, content, metadata, location);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`[VersioningFileProvider] Failed to create version for ${pageName}:`, errorMessage);
      // Continue with parent savePage even if versioning fails
    }

    // Call parent to save current content
    await super.savePage(pageName, content, { ...metadata, uuid });

    // Update page index
    await this.updatePageInIndex(uuid, {
      title: pageName,
      uuid: uuid,
      currentVersion: await this.getCurrentVersion(uuid, location),
      location: location,
      lastModified: new Date().toISOString(),
      editor: metadata.editor || (metadata as any).author || 'unknown',
      hasVersions: true
    });

    logger.info(`[VersioningFileProvider] Saved page '${pageName}' with versioning`);
  }

  /**
   * Delete a page and its version history
   * @param identifier - Page UUID or title
   * @returns True if deleted, false if not found
   */
  async deletePage(identifier: string): Promise<boolean> {
    // Get page info before deleting
    const pageData = await this.getPage(identifier);
    if (!pageData) {
      logger.warn(`[VersioningFileProvider] Cannot delete - page not found: ${identifier}`);
      return false;
    }

    const uuid = pageData.uuid;
    const location: 'pages' | 'required-pages' = pageData.metadata?.['system-category']?.toLowerCase() === 'system' ? 'required-pages' : 'pages';

    try {
      // Call parent to delete main file and clear caches
      const deleted = await super.deletePage(identifier);
      if (!deleted) {
        return false;
      }

      // Delete version directory if it exists
      const versionDir = this.getVersionDirectory(uuid, location);
      const versionDirExists = await fs.pathExists(versionDir);
      if (versionDirExists) {
        await fs.remove(versionDir);
        logger.info(`[VersioningFileProvider] Deleted version directory for ${uuid}`);
      }

      // Remove from page index
      await this.removePageFromIndex(uuid);

      logger.info(`[VersioningFileProvider] Deleted page '${identifier}' with all versions`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`[VersioningFileProvider] Failed to delete page: ${identifier}`, { error: errorMessage });
      return false;
    }
  }

  /**
   * Create initial version (v1) for a new page
   * @param uuid - Page UUID
   * @param pageName - Page title
   * @param content - Page content
   * @param metadata - Page metadata
   * @param location - 'pages' or 'required-pages'
   */
  private async createInitialVersion(
    uuid: string,
    pageName: string,
    content: string,
    metadata: Partial<PageFrontmatter>,
    location: 'pages' | 'required-pages'
  ): Promise<void> {
    const versionDir = this.getVersionDirectory(uuid, location);
    const v1Dir = path.join(versionDir, 'v1');
    await fs.ensureDir(v1Dir);

    // Write full content for v1
    await fs.writeFile(path.join(v1Dir, 'content.md'), content, 'utf8');

    // Create version metadata (stored in manifest.json only - single source of truth)
    const versionMetadata: InternalVersionMetadata = {
      version: 1,
      dateCreated: new Date().toISOString(),
      editor: metadata.editor || (metadata as any).author || 'unknown',
      changeType: 'created',
      comment: (metadata as any).comment || 'Initial version',
      contentHash: DeltaStorage.calculateHash(content),
      contentSize: Buffer.byteLength(content, 'utf8'),
      compressed: false,
      isDelta: false
    };

    // Create and save manifest
    const manifest = this.createInitialManifest(uuid, pageName);
    this.addVersionToManifest(manifest, versionMetadata);
    await this.saveManifest(uuid, location, manifest);

    logger.info(`[VersioningFileProvider] Created v1 for page ${pageName} (${uuid})`);
  }

  /**
   * Create new version for existing page
   * @param uuid - Page UUID
   * @param pageName - Page title
   * @param newContent - New content
   * @param metadata - Page metadata
   * @param location - 'pages' or 'required-pages'
   * @param pageInfo - Current page info
   */
  private async createNewVersion(
    uuid: string,
    pageName: string,
    newContent: string,
    metadata: Partial<PageFrontmatter>,
    location: 'pages' | 'required-pages',
    pageInfo: WikiPage
  ): Promise<void> {
    // Load manifest
    let manifest = await this.loadManifest(uuid, location);
    if (!manifest) {
      logger.warn(`[VersioningFileProvider] No manifest found for ${pageName}, creating new`);
      manifest = this.createInitialManifest(uuid, pageName);
    }

    const nextVersion = manifest.currentVersion + 1;
    const versionDir = this.getVersionDirectory(uuid, location);
    const vNextDir = path.join(versionDir, `v${nextVersion}`);
    await fs.ensureDir(vNextDir);

    // Read current content from previous version file (not from pageInfo)
    // This ensures we're comparing the exact content we saved, not parsed content
    let currentContent: string;
    try {
      const currentVersion = manifest.currentVersion;
      if (currentVersion === 1) {
        // Read from v1/content.md
        const v1Path = path.join(versionDir, 'v1', 'content.md');
        currentContent = await fs.readFile(v1Path, 'utf8');
      } else {
        // Reconstruct from v1 + diffs
        currentContent = await this.reconstructVersion(uuid, location, currentVersion);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('[VersioningFileProvider] Failed to read current content:', errorMessage);
      currentContent = '';
    }

    // Create version based on delta storage setting and checkpoints
    let versionMetadata: InternalVersionMetadata;
    const isCheckpoint = (nextVersion % this.checkpointInterval === 0);

    if (this.deltaStorageEnabled && nextVersion > 1 && !isCheckpoint) {
      // Create and save diff (unless this is a checkpoint)
      const diff = DeltaStorage.createDiff(currentContent, newContent);
      await fs.writeFile(
        path.join(vNextDir, 'content.diff'),
        JSON.stringify(diff),
        'utf8'
      );

      versionMetadata = {
        dateCreated: new Date().toISOString(),
        editor: metadata.editor || (metadata as any).author || 'unknown',
        changeType: (metadata as any).changeType || 'updated',
        comment: (metadata as any).comment || `Update to version ${nextVersion}`,
        contentHash: DeltaStorage.calculateHash(newContent),
        contentSize: Buffer.byteLength(JSON.stringify(diff), 'utf8'),
        compressed: false,
        isDelta: true,
        isCheckpoint: false
      };
    } else {
      // Store full content (v1, delta storage disabled, or checkpoint)
      await fs.writeFile(path.join(vNextDir, 'content.md'), newContent, 'utf8');

      const comment = isCheckpoint
        ? `Checkpoint at version ${nextVersion}`
        : ((metadata as any).comment || `Update to version ${nextVersion}`);

      versionMetadata = {
        dateCreated: new Date().toISOString(),
        editor: metadata.editor || (metadata as any).author || 'unknown',
        changeType: (metadata as any).changeType || 'updated',
        comment: comment,
        contentHash: DeltaStorage.calculateHash(newContent),
        contentSize: Buffer.byteLength(newContent, 'utf8'),
        compressed: false,
        isDelta: false,
        isCheckpoint: isCheckpoint
      };

      if (isCheckpoint) {
        logger.info(`[VersioningFileProvider] Created checkpoint at v${nextVersion} for page ${pageName}`);
      }
    }

    // Update manifest (single source of truth for metadata)
    // Note: No longer writing individual v{N}/meta.json files
    this.addVersionToManifest(manifest, versionMetadata);
    await this.saveManifest(uuid, location, manifest);

    logger.info(`[VersioningFileProvider] Created v${nextVersion} for page ${pageName} (${uuid})`);
  }

  /**
   * Get current version number for a page
   * @param uuid - Page UUID
   * @param location - 'pages' or 'required-pages'
   * @returns Current version number (0 if no versions)
   */
  private getCurrentVersion(uuid: string, location: 'pages' | 'required-pages'): Promise<number> {
    return this.loadManifest(uuid, location).then(manifest => manifest ? manifest.currentVersion : 0);
  }

  /**
   * Reconstruct content for a specific version by applying diffs
   *
   * Performance optimized: Uses nearest checkpoint instead of always starting from v1.
   *
   * @param uuid - Page UUID
   * @param location - 'pages' or 'required-pages'
   * @param targetVersion - Version to reconstruct
   * @returns Reconstructed content
   */
  private async reconstructVersion(uuid: string, location: 'pages' | 'required-pages', targetVersion: number): Promise<string> {
    // Check cache first
    const cacheKey = `${uuid}:${targetVersion}`;
    if (this.versionCache.has(cacheKey)) {
      this.updateCacheAccess(cacheKey);
      return this.versionCache.get(cacheKey);
    }

    const versionDir = this.getVersionDirectory(uuid, location);

    // Find nearest checkpoint at or before target version
    let startVersion = 1;
    for (let v = targetVersion; v >= 1; v--) {
      if (v === 1 || (v % this.checkpointInterval === 0)) {
        // Check if this checkpoint exists
        const checkpointPath = path.join(versionDir, `v${v}`, 'content.md');
        if (await fs.pathExists(checkpointPath)) {
          startVersion = v;
          break;
        }
      }
    }

    // Read from nearest checkpoint
    const startPath = path.join(versionDir, `v${startVersion}`, 'content.md');
    if (!await fs.pathExists(startPath)) {
      throw new Error(`Checkpoint v${startVersion} not found: ${startPath}`);
    }
    let content = await fs.readFile(startPath, 'utf8');

    // If we're at the target version, we're done
    if (targetVersion === startVersion) {
      this.addToCache(cacheKey, content);
      return content;
    }

    // Apply diffs sequentially from checkpoint + 1 to target version
    for (let v = startVersion + 1; v <= targetVersion; v++) {
      const diffPath = path.join(versionDir, `v${v}`, 'content.diff');
      if (!await fs.pathExists(diffPath)) {
        throw new Error(`Diff file not found for v${v}: ${diffPath}`);
      }

      const diffData = await fs.readFile(diffPath, 'utf8');
      const diff = JSON.parse(diffData);
      content = DeltaStorage.applyDiff(content, diff);
    }

    // Add to cache
    this.addToCache(cacheKey, content);

    return content;
  }

  /**
   * Add content to version cache (LRU eviction)
   * @param key - Cache key
   * @param content - Content to cache
   */
  private addToCache(key: string, content: string): void {
    // Remove oldest entry if cache is full
    if (this.versionCache.size >= this.versionCacheSize) {
      const firstKey = this.versionCache.keys().next().value;
      this.versionCache.delete(firstKey);
    }

    this.versionCache.set(key, content);
  }

  /**
   * Update cache access (move to end for LRU)
   * @param key - Cache key
   */
  private updateCacheAccess(key: string): void {
    const content = this.versionCache.get(key);
    if (content !== undefined) {
      this.versionCache.delete(key);
      this.versionCache.set(key, content);
    }
  }

  // ============================================================================
  // Version Retrieval Methods
  // ============================================================================

  /**
   * Resolve identifier (UUID or title) to UUID and location
   * @param identifier - Page UUID or title
   * @returns UUID and location, or null if not found
   */
  private resolveIdentifier(identifier: string): Promise<{ uuid: string; location: 'pages' | 'required-pages' } | null> {
    // Check if identifier is already a UUID (in page index)
    if (this.pageIndex && this.pageIndex.pages[identifier]) {
      return Promise.resolve({
        uuid: identifier,
        location: this.pageIndex.pages[identifier].location || 'pages'
      });
    }

    // Try to find by title using pageExists and getPage
    if (this.pageExists(identifier)) {
      return this.getPage(identifier)
        .then(pageInfo => {
          if (pageInfo && pageInfo.uuid) {
            // Determine location from page index or default to 'pages'
            const location = this.pageIndex?.pages[pageInfo.uuid]?.location || 'pages';
            return {
              uuid: pageInfo.uuid,
              location: location
            };
          }
          return null;
        })
        .catch(error => {
          const errorMessage = error instanceof Error ? error.message : String(error);
          logger.warn(`[VersioningFileProvider] Failed to resolve identifier '${identifier}':`, errorMessage);
          return null;
        });
    }

    return Promise.resolve(null);
  }

  /**
   * Get version history for a page
   *
   * Returns an array of version metadata sorted by version number (newest first).
   * Each entry includes: version, dateCreated, editor, changeType, comment, contentHash, contentSize.
   *
   * @param identifier - Page UUID or title
   * @param limit - Maximum number of versions to return (optional)
   * @returns Array of version metadata (empty array if no versions)
   * @throws {Error} If page not found
   * @example
   * const history = await provider.getVersionHistory('Main');
   * // [
   * //   { version: 3, timestamp: '2024-01-03T...', author: 'john', ... },
   * //   { version: 2, timestamp: '2024-01-02T...', author: 'jane', ... },
   * //   { version: 1, timestamp: '2024-01-01T...', author: 'admin', ... }
   * // ]
   */
  async getVersionHistory(identifier: string, limit?: number): Promise<VersionHistoryEntry[]> {
    // Resolve identifier to UUID and location
    const resolved = await this.resolveIdentifier(identifier);
    if (!resolved) {
      throw new Error(`Page not found: ${identifier}`);
    }

    const { uuid, location } = resolved;

    // Load manifest
    const manifest = await this.loadManifest(uuid, location);
    if (!manifest || !manifest.versions || manifest.versions.length === 0) {
      return [];
    }

    // Convert to VersionHistoryEntry and return in reverse order (newest first)
    let versions = [...manifest.versions].reverse().map(v => ({
      version: v.version,
      author: v.editor,
      timestamp: v.dateCreated,
      changeType: v.changeType as 'create' | 'update' | 'minor' | 'major',
      message: v.comment,
      contentSize: v.contentSize,
      compressed: v.compressed
    }));

    // Apply limit if specified
    if (limit && limit > 0) {
      versions = versions.slice(0, limit);
    }

    return versions;
  }

  /**
   * Get specific version content for a page
   *
   * Reconstructs the content for a specific version by:
   * 1. Reading v1 (full content)
   * 2. If version > 1 and delta storage enabled: apply diffs sequentially
   * 3. If version > 1 and delta storage disabled: read full content directly
   *
   * @param identifier - Page UUID or title
   * @param version - Version number to retrieve
   * @returns Version content and metadata
   * @throws {Error} If page/version not found or reconstruction fails
   * @example
   * const { content, metadata } = await provider.getPageVersion('Main', 2);
   * console.log(content); // Content at version 2
   * console.log(metadata.author); // Editor of version 2
   */
  async getPageVersion(identifier: string, version: number): Promise<VersionContent> {
    if (typeof version !== 'number' || version < 1) {
      throw new Error(`Invalid version number: ${version}`);
    }

    // Resolve identifier to UUID and location
    const resolved = await this.resolveIdentifier(identifier);
    if (!resolved) {
      throw new Error(`Page not found: ${identifier}`);
    }

    const { uuid, location } = resolved;

    // Load manifest
    const manifest = await this.loadManifest(uuid, location);
    if (!manifest) {
      throw new Error(`No version history found for: ${identifier}`);
    }

    if (version > manifest.currentVersion) {
      throw new Error(`Version ${version} does not exist (current: ${manifest.currentVersion})`);
    }

    // Get version metadata
    const versionMetadata = manifest.versions.find(v => v.version === version);
    if (!versionMetadata) {
      throw new Error(`Version ${version} metadata not found in manifest`);
    }

    const versionDir = this.getVersionDirectory(uuid, location);

    // Reconstruct content based on delta storage setting
    let content: string;
    if (this.deltaStorageEnabled) {
      // Use delta reconstruction (works for all versions including v1)
      content = await this.reconstructVersion(uuid, location, version);
    } else {
      // Delta storage disabled: read full content directly
      const vPath = path.join(versionDir, `v${version}`, 'content.md');
      if (!await fs.pathExists(vPath)) {
        throw new Error(`Version ${version} content file not found: ${vPath}`);
      }
      content = await fs.readFile(vPath, 'utf8');
    }

    // Convert to VersionContent format
    return {
      version: version,
      content: content,
      metadata: {
        version: versionMetadata.version,
        author: versionMetadata.editor,
        timestamp: versionMetadata.dateCreated,
        changeType: versionMetadata.changeType as 'create' | 'update' | 'minor' | 'major',
        message: versionMetadata.comment,
        contentHash: versionMetadata.contentHash,
        contentSize: versionMetadata.contentSize,
        compressed: versionMetadata.compressed,
        isDelta: versionMetadata.isDelta,
        baseVersion: undefined,
        compressionRatio: undefined
      }
    };
  }

  /**
   * Restore page to a specific version
   *
   * Creates a new version with the content from the specified version.
   * This does NOT delete newer versions - it creates a new version with old content.
   *
   * @param identifier - Page UUID or title
   * @param version - Version number to restore to
   * @throws {Error} If page/version not found or restore fails
   * @example
   * await provider.restoreVersion('Main', 5);
   * console.log(`Restored to v5`);
   */
  async restoreVersion(identifier: string, version: number): Promise<void> {
    // Get the content from the target version
    const { content, metadata: versionMetadata } = await this.getPageVersion(identifier, version);

    // Resolve identifier to get current page info
    const resolved = await this.resolveIdentifier(identifier);
    if (!resolved) {
      throw new Error(`Page not found: ${identifier}`);
    }

    const { uuid } = resolved;

    // Get current page to get title
    const currentPage = await this.getPage(identifier);
    if (!currentPage) {
      throw new Error(`Page not found: ${identifier}`);
    }
    const pageName = currentPage.title || identifier;

    // Save as new version with restore metadata
    const editor = 'system';
    const comment = `Restored from v${version}`;

    await this.savePage(pageName, content, {
      uuid: uuid,
      editor: editor,
      comment: comment,
      changeType: 'restored'
    } as any);

    // Get the new version number for logging
    const location = this.pageIndex?.pages[uuid]?.location || 'pages';
    const newVersion = await this.getCurrentVersion(uuid, location);

    logger.info(`[VersioningFileProvider] Restored page '${pageName}' to v${version}, created v${newVersion}`);
  }

  /**
   * Compare two versions of a page
   *
   * Returns a diff showing changes between two versions.
   * Uses DeltaStorage to compute the diff.
   *
   * @param identifier - Page UUID or title
   * @param v1 - First version number (older)
   * @param v2 - Second version number (newer)
   * @returns Comparison result with diff and stats
   * @throws {Error} If page/versions not found
   * @example
   * const comparison = await provider.compareVersions('Main', 2, 5);
   * console.log(comparison.stats); // { additions: 10, deletions: 3, unchanged: 100 }
   * console.log(comparison.diff); // Array of diff operations
   */
  async compareVersions(identifier: string, v1: number, v2: number): Promise<VersionDiff> {
    if (typeof v1 !== 'number' || typeof v2 !== 'number') {
      throw new Error('Version numbers must be integers');
    }

    if (v1 < 1 || v2 < 1) {
      throw new Error('Version numbers must be >= 1');
    }

    // Get content for both versions
    const version1Data = await this.getPageVersion(identifier, v1);
    const version2Data = await this.getPageVersion(identifier, v2);

    // Calculate diff from version1 to version2
    const diff = DeltaStorage.createDiff(version1Data.content, version2Data.content);
    const stats = DeltaStorage.getDiffStats(diff);

    return {
      fromVersion: v1,
      toVersion: v2,
      fromMetadata: version1Data.metadata,
      toMetadata: version2Data.metadata,
      diff: diff,
      stats: stats
    };
  }

  // ============================================================================
  // Maintenance Methods
  // ============================================================================

  /**
   * Purge old versions of a page
   *
   * Removes old versions based on retention policies:
   * - Keep versions newer than retentionDays
   * - Keep last keepLatest versions (minimum)
   * - Optionally keep milestone versions (v1, every 10th version)
   *
   * @param identifier - Page UUID or title
   * @param keepLatest - Minimum number of recent versions to keep
   * @returns Number of versions purged
   * @throws {Error} If page not found or purge fails
   * @example
   * const count = await provider.purgeOldVersions('Main', 20);
   * console.log(`Removed ${count} versions`);
   */
  async purgeOldVersions(identifier: string, keepLatest: number): Promise<number> {
    // Resolve identifier to UUID and location
    const resolved = await this.resolveIdentifier(identifier);
    if (!resolved) {
      throw new Error(`Page not found: ${identifier}`);
    }

    const { uuid, location } = resolved;

    // Load manifest
    const manifest = await this.loadManifest(uuid, location);
    if (!manifest || manifest.versions.length === 0) {
      return 0;
    }

    // Use retention settings from config
    const retentionDays = this.retentionDays;
    const keepMilestones = true; // Always keep milestones

    // Calculate cutoff date for retention
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const versionDir = this.getVersionDirectory(uuid, location);
    const versionsToPurge: number[] = [];

    // Determine which versions to purge
    for (const versionMeta of manifest.versions) {
      const versionNum = versionMeta.version;

      // Always keep the last keepLatest versions
      const versionsFromEnd = manifest.currentVersion - versionNum + 1;
      if (versionsFromEnd <= keepLatest) {
        continue;
      }

      // Check retention date
      const versionDate = new Date(versionMeta.dateCreated);
      if (versionDate >= cutoffDate) {
        continue; // Too recent to purge
      }

      // Keep milestones (v1, every 10th version)
      if (keepMilestones && (versionNum === 1 || versionNum % 10 === 0)) {
        continue;
      }

      // Mark for purging
      versionsToPurge.push(versionNum);
    }

    if (versionsToPurge.length === 0) {
      return 0;
    }

    // Perform purge
    for (const versionNum of versionsToPurge) {
      try {
        const vPath = path.join(versionDir, `v${versionNum}`);
        await fs.remove(vPath);
        logger.info(`[VersioningFileProvider] Purged version ${versionNum} of page ${uuid}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`[VersioningFileProvider] Failed to purge v${versionNum}: ${errorMessage}`);
      }
    }

    // Update manifest (remove purged versions)
    manifest.versions = manifest.versions.filter(v => !versionsToPurge.includes(v.version));
    await this.saveManifest(uuid, location, manifest);

    logger.info(`[VersioningFileProvider] Purged ${versionsToPurge.length} versions from page ${uuid}`);
    return versionsToPurge.length;
  }

  /**
   * Get total size of a directory recursively
   * @param dirPath - Directory path
   * @returns Total size in bytes
   */
  private async getDirectorySize(dirPath: string): Promise<number> {
    let totalSize = 0;

    if (!await fs.pathExists(dirPath)) {
      return 0;
    }

    const items = await fs.readdir(dirPath);
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = await fs.stat(itemPath);

      if (stats.isDirectory()) {
        totalSize += await this.getDirectorySize(itemPath);
      } else {
        totalSize += stats.size;
      }
    }

    return totalSize;
  }

  /**
   * Get provider information
   * @returns Provider metadata
   */
  getProviderInfo(): ProviderInfo {
    return {
      name: 'VersioningFileProvider',
      version: '1.0.0',
      description: 'File storage with version history and delta storage',
      features: [
        'uuid-indexing',
        'title-indexing',
        'plural-matching',
        'dual-storage',
        'case-insensitive-lookup',
        'version-history',
        'delta-storage',
        'compression',
        'page-index',
        'version-purging'
      ]
    };
  }
}

export default VersioningFileProvider;

// CommonJS compatibility
module.exports = VersioningFileProvider;
