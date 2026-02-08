import BasePageProvider, { WikiEngine, ProviderInfo } from './BasePageProvider';
import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';
import PageNameMatcher from '../utils/PageNameMatcher';
import { WikiPage, PageFrontmatter, PageInfo, PageSaveOptions, PageListOptions } from '../types';
import type ConfigurationManager from '../managers/ConfigurationManager';

/**
 * Page cache info (internal)
 */
interface PageCacheInfo {
  title: string;
  uuid: string;
  filePath: string;
  metadata: PageFrontmatter;
}

/**
 * Backup data structure
 */
interface BackupData {
  providerName: string;
  version: string;
  timestamp: string;
  encoding: string;
  pages: Array<{
    relativePath: string;
    content: string;
    size: number;
  }>;
  requiredPages: Array<{
    relativePath: string;
    content: string;
    size: number;
  }>;
  statistics: {
    totalPages: number;
    totalSize: number;
  };
}

/**
 * FileSystemProvider - Markdown file-based page storage provider
 *
 * Implements page storage using filesystem with YAML frontmatter metadata.
 * Pages are stored as .md files in configurable directories with UUID-based
 * filenames for reliable identification.
 *
 * Key features:
 * - UUID-based file naming for reliable page identity
 * - Title-based lookup with case-insensitive matching
 * - Plural name matching support (e.g., "Page" matches "Pages")
 * - Dual storage locations (regular pages and required/system pages)
 * - In-memory caching with multiple lookup indexes
 * - Gray-matter for frontmatter parsing
 * - Configurable encoding support
 *
 * Configuration keys (all lowercase):
 * - amdwiki.page.provider.filesystem.storagedir - Main pages directory
 * - amdwiki.page.provider.filesystem.requiredpagesdir - Required pages directory
 * - amdwiki.page.provider.filesystem.encoding - File encoding (default: utf-8)
 * - amdwiki.translator-reader.match-english-plurals - Enable plural matching
 *
 * @class FileSystemProvider
 * @extends BasePageProvider
 *
 * @see {@link BasePageProvider} for base interface
 * @see {@link PageManager} for usage
 */
class FileSystemProvider extends BasePageProvider {
  /** Path to regular pages directory */
  protected pagesDirectory: string | null;

  /** Path to required pages directory */
  protected requiredPagesDirectory: string | null;

  /** File encoding */
  protected encoding: BufferEncoding;

  /** Main page cache (keyed by title) */
  protected pageCache: Map<string, PageCacheInfo>;

  /** Title index (lowercase title -> canonical title) */
  protected titleIndex: Map<string, string>;

  /** UUID index (UUID -> canonical title) */
  protected uuidIndex: Map<string, string>;

  /** Slug index (slug -> canonical title) */
  protected slugIndex: Map<string, string>;

  /** Page name matcher for fuzzy/plural matching */
  protected pageNameMatcher: PageNameMatcher | null;

  /** Whether installation is complete (required-pages should not be used after install) */
  public installationComplete: boolean;

  /**
   * Creates a new FileSystemProvider instance
   *
   * @constructor
   * @param {WikiEngine} engine - The wiki engine instance
   */
  constructor(engine: WikiEngine) {
    super(engine);
    this.pagesDirectory = null;
    this.requiredPagesDirectory = null;
    this.installationComplete = false; // Will be set during initialize()
    this.encoding = 'utf-8';
    this.pageCache = new Map();
    this.titleIndex = new Map();
    this.uuidIndex = new Map();
    this.slugIndex = new Map();
    this.pageNameMatcher = null;
  }

  /**
   * Initialize the provider by reading configuration and caching pages
   *
   * Loads all pages from both directories into memory for fast lookup.
   * All configuration access goes through ConfigurationManager (ALL LOWERCASE).
   *
   * @async
   * @returns {Promise<void>}
   * @throws {Error} If ConfigurationManager is not available
   */
  async initialize(): Promise<void> {
    const configManager = this.engine.getManager<ConfigurationManager>('ConfigurationManager');
    if (!configManager) {
      throw new Error('FileSystemProvider requires ConfigurationManager');
    }

    // Get directory configuration (ALL LOWERCASE with provider-specific keys)
    // pagesDirectory uses getResolvedDataPath to support INSTANCE_DATA_FOLDER
    this.pagesDirectory = configManager.getResolvedDataPath(
      'amdwiki.page.provider.filesystem.storagedir',
      './data/pages'
    );

    // requiredPagesDirectory is NOT under data folder, resolve manually
    const reqCfgPath = configManager.getProperty(
      'amdwiki.page.provider.filesystem.requiredpagesdir',
      './required-pages'
    ) as string;
    this.requiredPagesDirectory = path.isAbsolute(reqCfgPath) ? reqCfgPath : path.join(process.cwd(), reqCfgPath);

    // Get encoding configuration (ALL LOWERCASE)
    this.encoding = configManager.getProperty(
      'amdwiki.page.provider.filesystem.encoding',
      'utf-8'
    ) as BufferEncoding;

    // Initialize PageNameMatcher with plural matching config
    const matchEnglishPlurals = configManager.getProperty('amdwiki.translator-reader.match-english-plurals', true) as boolean;
    this.pageNameMatcher = new PageNameMatcher(matchEnglishPlurals);
    logger.info(`[FileSystemProvider] Plural matching: ${matchEnglishPlurals ? 'enabled' : 'disabled'}`);

    // Check installation status via .install-complete file (not config)
    const installCompleteFile = path.join(
      configManager.getInstanceDataFolder(),
      '.install-complete'
    );
    this.installationComplete = await fs.pathExists(installCompleteFile);
    logger.info(`[FileSystemProvider] Installation complete: ${this.installationComplete}`);

    // Ensure directories exist
    await fs.ensureDir(this.pagesDirectory);
    logger.info(`[FileSystemProvider] Page directory: ${this.pagesDirectory}`);

    // Only ensure required-pages directory exists if installation is NOT complete
    if (!this.installationComplete) {
      await fs.ensureDir(this.requiredPagesDirectory);
      logger.info(`[FileSystemProvider] Required-pages directory (install mode): ${this.requiredPagesDirectory}`);
    }

    // Load all pages into cache
    await this.refreshPageList();

    this.initialized = true;
    logger.info(`[FileSystemProvider] Initialized with ${this.pageCache.size} pages.`);
  }

  /**
   * Reads all .md files from the pages directory (and required-pages during installation)
   * and populates the page cache with multiple indexes.
   *
   * After installation is complete, only pages from the main pages directory are loaded.
   * The required-pages directory is only used during installation to seed the wiki.
   */
  async refreshPageList(): Promise<void> {
    this.pageCache.clear();
    this.titleIndex.clear();
    this.uuidIndex.clear();
    this.slugIndex.clear();

    if (!this.pagesDirectory || !this.requiredPagesDirectory) {
      throw new Error('FileSystemProvider not initialized - directories not set');
    }

    // Only scan required-pages during installation (before install is complete)
    const pagesFiles = await this.walkDir(this.pagesDirectory);
    let allFiles = [...pagesFiles];

    if (!this.installationComplete) {
      // During installation, also include required-pages
      const requiredFiles = await this.walkDir(this.requiredPagesDirectory);
      allFiles = [...pagesFiles, ...requiredFiles];
      logger.info(`[FileSystemProvider] Install mode: including ${requiredFiles.length} files from required-pages`);
    }

    const mdFiles = allFiles.filter(f => f.toLowerCase().endsWith('.md'));

    for (const filePath of mdFiles) {
      try {
        const fileContent = await fs.readFile(filePath, this.encoding);
        const { data } = matter(fileContent);
        const metadata = data as PageFrontmatter;
        // Ensure title is always a string (YAML may parse numeric titles as numbers)
        const title = metadata.title != null ? String(metadata.title) : '';
        const uuid = (metadata.uuid) || path.basename(filePath, '.md');

        if (!title) {
          logger.warn(`[FileSystemProvider] Skipping file with no title in frontmatter: ${filePath}`);
          continue;
        }

        const pageInfo: PageCacheInfo = {
          title,
          uuid,
          filePath,
          metadata
        };

        // Use title as the canonical key for the main cache
        const canonicalKey = title;
        this.pageCache.set(canonicalKey, pageInfo);

        // Build lookup indexes
        this.titleIndex.set(title.toLowerCase(), canonicalKey);
        if (uuid) {
          this.uuidIndex.set(uuid, canonicalKey);
        }
        const slug = metadata.slug;
        if (slug) {
          this.slugIndex.set(slug.toLowerCase(), canonicalKey);
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`[FileSystemProvider] Failed to process page file: ${filePath}`, { error: errorMessage });
      }
    }
    logger.info(`[FileSystemProvider] Indexing complete. Found ${this.pageCache.size} valid pages.`);
  }

  /**
   * Recursively walk directory tree and return all file paths
   * @param {string} dir - Directory to walk
   * @returns {Promise<string[]>} Array of absolute file paths
   * @private
   */
  private async walkDir(dir: string): Promise<string[]> {
    const out: string[] = [];
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name.startsWith('.')) continue; // Skip hidden dirs
          if (entry.name === 'versions') continue; // Skip version snapshot dirs
          out.push(...(await this.walkDir(full)));
        } else if (entry.isFile()) {
          out.push(full);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`[FileSystemProvider] Failed to walk directory: ${dir}`, { error: errorMessage });
    }
    return out;
  }

  /**
   * Resolve a page identifier (UUID, slug, or title) to page info
   * Tries multiple strategies:
   * 1. UUID index lookup
   * 2. Slug index lookup (URL-friendly identifiers)
   * 3. Title index (case-insensitive exact match)
   * 4. Fuzzy matching with plurals (if enabled)
   *
   * @param {string} identifier - Page UUID, slug, or title
   * @returns {PageCacheInfo|null} Page info or null if not found
   * @private
   */
  private resolvePageInfo(identifier: string): PageCacheInfo | null {
    if (!identifier) return null;

    // 1. Try UUID index first
    let canonicalKey = this.uuidIndex.get(identifier);
    if (canonicalKey) {
      return this.pageCache.get(canonicalKey) || null;
    }

    // 2. Try slug index (URL-friendly identifiers like "my-page-name")
    canonicalKey = this.slugIndex.get(identifier.toLowerCase());
    if (canonicalKey) {
      return this.pageCache.get(canonicalKey) || null;
    }

    // 3. Try title index (case-insensitive exact match)
    canonicalKey = this.titleIndex.get(identifier.toLowerCase());
    if (canonicalKey) {
      return this.pageCache.get(canonicalKey) || null;
    }

    // 4. Try fuzzy matching with plurals if enabled
    if (this.pageNameMatcher) {
      const allTitles = Array.from(this.pageCache.values()).map(info => info.title);
      const matchedTitle = this.pageNameMatcher.findMatch(identifier, allTitles);
      if (matchedTitle) {
        canonicalKey = this.titleIndex.get(matchedTitle.toLowerCase());
        if (canonicalKey) {
          logger.info(`[FileSystemProvider] Fuzzy match: '${identifier}' -> '${matchedTitle}'`);
          return this.pageCache.get(canonicalKey) || null;
        }
      }
    }

    return null; // Not found
  }

  /**
   * Get page content and metadata together
   * @param {string} identifier - Page UUID or title
   * @returns {Promise<WikiPage|null>}
   */
  async getPage(identifier: string): Promise<WikiPage | null> {
    const info = this.resolvePageInfo(identifier);
    if (!info) {
      return null;
    }

    try {
      const fullContent = await fs.readFile(info.filePath, this.encoding);
      const { content, data: metadata } = matter(fullContent);

      return {
        content,
        metadata: metadata as PageFrontmatter,
        title: info.title,
        uuid: info.uuid,
        filePath: info.filePath
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`[FileSystemProvider] Failed to read page: ${identifier}`, { error: errorMessage });
      return null;
    }
  }

  /**
   * Retrieves the raw markdown content of a page (without frontmatter).
   * @param {string} identifier - Page UUID or title
   * @returns {Promise<string>} The raw markdown content without frontmatter
   */
  async getPageContent(identifier: string): Promise<string> {
    const info = this.resolvePageInfo(identifier);
    if (!info) {
      logger.warn(`[FileSystemProvider] Not found: ${identifier}`);
      throw new Error(`Page '${identifier}' not found.`);
    }
    const fullContent = await fs.readFile(info.filePath, this.encoding);
    const { content } = matter(fullContent);
    logger.info(`[FileSystemProvider] Loaded ${info.title} from ${path.basename(info.filePath)} (${content.length} bytes)`);
    return content;
  }

  /**
   * Retrieves the metadata (frontmatter) for a given page.
   * @param {string} identifier - Page UUID or title
   * @returns {Promise<PageFrontmatter|null>} The page metadata, or null if not found
   */
  getPageMetadata(identifier: string): Promise<PageFrontmatter | null> {
    const info = this.resolvePageInfo(identifier);
    return Promise.resolve(info ? info.metadata : null);
  }

  /**
   * Saves content to a wiki page, creating it if it doesn't exist.
   * Determines storage location based on system-category metadata.
   *
   * @param {string} pageName - The name of the page
   * @param {string} content - The new markdown content
   * @param {Partial<PageFrontmatter>} metadata - The metadata to save in the frontmatter
   * @param {PageSaveOptions} options - Save options
   * @returns {Promise<void>}
   */
  async savePage(
    pageName: string,
    content: string,
    metadata: Partial<PageFrontmatter> = {},
    _options?: PageSaveOptions
  ): Promise<void> {
    const uuid = metadata.uuid || this.resolvePageInfo(pageName)?.uuid || uuidv4();

    if (!this.pagesDirectory || !this.requiredPagesDirectory) {
      throw new Error('FileSystemProvider not initialized - directories not set');
    }

    // Determine which directory to save to based on system-category
    // Use ValidationManager to get storage location from config
    const systemCategory = String(metadata['system-category'] ?? 'general');

    // Get storage location from ValidationManager (if available)
    interface ValidationManagerType { getCategoryStorageLocation(category: string): string }
    const validationManager = this.engine.getManager<ValidationManagerType>('ValidationManager');
    const storageLocation = validationManager?.getCategoryStorageLocation(systemCategory) ?? 'regular';

    // Handle github storage location - these pages should not be saved to wiki
    if (storageLocation === 'github') {
      throw new Error(`Cannot save page with system-category '${systemCategory}' - pages with storageLocation 'github' are not stored in the wiki (docs/ folder only)`);
    }

    // Determine target directory based on storage location
    const targetDirectory = storageLocation === 'required' ? this.requiredPagesDirectory : this.pagesDirectory;

    const filePath = path.join(targetDirectory, `${uuid}.md`);
    await fs.ensureDir(path.dirname(filePath));

    // If the file exists in the wrong directory, remove it
    const oldPageInfo = this.resolvePageInfo(pageName);
    if (oldPageInfo && oldPageInfo.filePath !== filePath) {
      try {
        await fs.unlink(oldPageInfo.filePath);
        logger.info(`[FileSystemProvider] Moved page from ${oldPageInfo.filePath} to ${filePath}`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        logger.warn(`[FileSystemProvider] Could not remove old file: ${oldPageInfo.filePath}`, { error: errorMessage });
      }
    }

    const now = new Date().toISOString();
    // Use metadata.title if provided (for renames), otherwise use pageName
    const finalTitle = metadata.title || pageName;
    const updatedMetadata: Partial<PageFrontmatter> = {
      ...metadata,
      title: finalTitle, // Ensure title is set after spread
      uuid: uuid,
      lastModified: now
    };

    const fileContent = matter.stringify(content, updatedMetadata);
    await fs.writeFile(filePath, fileContent, this.encoding);

    // Handle title change: remove old cache entries
    const titleChanged = oldPageInfo && oldPageInfo.title !== finalTitle;
    if (titleChanged) {
      // Remove old title from cache and indexes
      this.pageCache.delete(oldPageInfo.title);
      this.titleIndex.delete(oldPageInfo.title.toLowerCase());
      // Remove old slug from index if it existed
      const oldSlug = oldPageInfo.metadata?.slug;
      if (oldSlug) {
        this.slugIndex.delete(oldSlug.toLowerCase());
      }
      logger.info(`[FileSystemProvider] Page renamed from '${oldPageInfo.title}' to '${finalTitle}'`);
    }

    // Update cache with NEW title as the key
    const pageInfo: PageCacheInfo = {
      title: finalTitle,
      uuid,
      filePath,
      metadata: updatedMetadata as PageFrontmatter
    };
    this.pageCache.set(finalTitle, pageInfo);
    this.titleIndex.set(finalTitle.toLowerCase(), finalTitle);
    this.uuidIndex.set(uuid, finalTitle);
    // Update slug index if the page has a slug
    const newSlug = updatedMetadata.slug;
    if (newSlug) {
      this.slugIndex.set(newSlug.toLowerCase(), finalTitle);
    }

    logger.info(`[FileSystemProvider] Page '${finalTitle}' saved successfully to ${path.basename(filePath)}.`);
  }

  /**
   * Delete a page
   * @param {string} identifier - Page UUID or title
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deletePage(identifier: string): Promise<boolean> {
    const info = this.resolvePageInfo(identifier);
    if (!info) {
      logger.warn(`[FileSystemProvider] Cannot delete - page not found: ${identifier}`);
      return false;
    }

    try {
      // Delete the file
      await fs.unlink(info.filePath);

      // Remove from all caches and indexes
      this.pageCache.delete(info.title);
      this.titleIndex.delete(info.title.toLowerCase());
      if (info.uuid) {
        this.uuidIndex.delete(info.uuid);
      }
      // Remove slug from index if it existed
      const slug = info.metadata?.slug;
      if (slug) {
        this.slugIndex.delete(slug.toLowerCase());
      }

      logger.info(`[FileSystemProvider] Deleted page '${info.title}' (${info.uuid})`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`[FileSystemProvider] Failed to delete page: ${identifier}`, { error: errorMessage });
      return false;
    }
  }

  /**
   * Check if a page exists
   * @param {string} identifier - Page UUID or title
   * @returns {boolean}
   */
  pageExists(identifier: string): boolean {
    return !!this.resolvePageInfo(identifier);
  }

  /**
   * Returns a list of all available page titles (sorted)
   * @returns {Promise<string[]>} An array of page titles
   */
  getAllPages(): Promise<string[]> {
    return Promise.resolve(Array.from(this.pageCache.keys()).sort((a, b) => a.localeCompare(b)));
  }

  /**
   * Get all page info objects
   * @param {PageListOptions} _options - List options (unused, for future filtering)
   * @returns {Promise<PageInfo[]>} Array of page info objects
   */
  getAllPageInfo(_options?: PageListOptions): Promise<PageInfo[]> {
    const pages = Array.from(this.pageCache.values()).map(info => ({
      title: info.title,
      uuid: info.uuid,
      filePath: info.filePath,
      metadata: info.metadata
    }));

    // TODO: Apply filtering and sorting based on options
    return Promise.resolve(pages);
  }

  /**
   * Find page by various identifiers
   * @param {string} identifier - UUID, title, or slug
   * @returns {string|null} Canonical page title or null
   */
  findPage(identifier: string): string | null {
    const info = this.resolvePageInfo(identifier);
    return info ? info.title : null;
  }

  /**
   * Get provider information
   * @returns {ProviderInfo}
   */
  getProviderInfo(): ProviderInfo {
    return {
      name: 'FileSystemProvider',
      version: '1.0.0',
      description: 'Markdown file storage with YAML frontmatter',
      features: [
        'uuid-indexing',
        'title-indexing',
        'plural-matching',
        'dual-storage',
        'case-insensitive-lookup'
      ]
    };
  }

  /**
   * Backup all pages to a serializable format
   *
   * Returns all page files with their content and relative paths.
   * This allows the backup to be restored to different directory locations.
   *
   * @returns {Promise<BackupData>} Backup data containing all pages
   */
  async backup(): Promise<BackupData> {
    logger.info('[FileSystemProvider] Starting backup...');

    if (!this.pagesDirectory || !this.requiredPagesDirectory) {
      throw new Error('FileSystemProvider not initialized - directories not set');
    }

    try {
      const backupData: BackupData = {
        providerName: 'FileSystemProvider',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        encoding: this.encoding,
        pages: [],
        requiredPages: [],
        statistics: {
          totalPages: 0,
          totalSize: 0
        }
      };

      // Backup regular pages
      const pagesFiles = await this.walkDir(this.pagesDirectory);
      const pagesMdFiles = pagesFiles.filter(f => f.toLowerCase().endsWith('.md'));

      for (const filePath of pagesMdFiles) {
        try {
          const content = await fs.readFile(filePath, this.encoding);
          const relativePath = path.relative(this.pagesDirectory, filePath);

          backupData.pages.push({
            relativePath: relativePath,
            content: content,
            size: Buffer.byteLength(content, this.encoding)
          });

          backupData.statistics.totalPages++;
          backupData.statistics.totalSize += Buffer.byteLength(content, this.encoding);
        } catch (error) {
          logger.error(`[FileSystemProvider] Failed to backup page: ${filePath}`, error);
        }
      }

      // Backup required pages
      const requiredFiles = await this.walkDir(this.requiredPagesDirectory);
      const requiredMdFiles = requiredFiles.filter(f => f.toLowerCase().endsWith('.md'));

      for (const filePath of requiredMdFiles) {
        try {
          const content = await fs.readFile(filePath, this.encoding);
          const relativePath = path.relative(this.requiredPagesDirectory, filePath);

          backupData.requiredPages.push({
            relativePath: relativePath,
            content: content,
            size: Buffer.byteLength(content, this.encoding)
          });

          backupData.statistics.totalPages++;
          backupData.statistics.totalSize += Buffer.byteLength(content, this.encoding);
        } catch (error) {
          logger.error(`[FileSystemProvider] Failed to backup required page: ${filePath}`, error);
        }
      }

      logger.info(`[FileSystemProvider] Backup complete: ${backupData.statistics.totalPages} pages, ${(backupData.statistics.totalSize / 1024).toFixed(2)} KB`);

      return backupData;
    } catch (error) {
      logger.error('[FileSystemProvider] Backup failed:', error);
      throw error;
    }
  }

  /**
   * Restore pages from backup data
   *
   * Recreates all page files from the backup data.
   * Preserves directory structure and file content.
   *
   * @param {BackupData} backupData - Backup data from backup() method
   * @returns {Promise<void>}
   */
  async restore(backupData: BackupData): Promise<void> {
    logger.info('[FileSystemProvider] Starting restore...');

    if (!backupData || !backupData.providerName) {
      throw new Error('Invalid backup data: missing provider information');
    }

    if (backupData.providerName !== 'FileSystemProvider') {
      logger.warn(`[FileSystemProvider] Backup is from different provider: ${backupData.providerName}`);
    }

    if (!this.pagesDirectory || !this.requiredPagesDirectory) {
      throw new Error('FileSystemProvider not initialized - directories not set');
    }

    try {
      let restoredCount = 0;

      // Restore regular pages
      if (backupData.pages && Array.isArray(backupData.pages)) {
        for (const page of backupData.pages) {
          try {
            const targetPath = path.join(this.pagesDirectory, page.relativePath);
            const targetDir = path.dirname(targetPath);

            // Ensure directory exists
            await fs.ensureDir(targetDir);

            // Write page file
            await fs.writeFile(targetPath, page.content, this.encoding);
            restoredCount++;
          } catch (error) {
            logger.error(`[FileSystemProvider] Failed to restore page: ${page.relativePath}`, error);
          }
        }
      }

      // Restore required pages
      if (backupData.requiredPages && Array.isArray(backupData.requiredPages)) {
        for (const page of backupData.requiredPages) {
          try {
            const targetPath = path.join(this.requiredPagesDirectory, page.relativePath);
            const targetDir = path.dirname(targetPath);

            // Ensure directory exists
            await fs.ensureDir(targetDir);

            // Write page file
            await fs.writeFile(targetPath, page.content, this.encoding);
            restoredCount++;
          } catch (error) {
            logger.error(`[FileSystemProvider] Failed to restore required page: ${page.relativePath}`, error);
          }
        }
      }

      // Refresh page cache after restore
      await this.refreshPageList();

      logger.info(`[FileSystemProvider] Restore complete: ${restoredCount} pages restored, ${this.pageCache.size} pages in cache`);
    } catch (error) {
      logger.error('[FileSystemProvider] Restore failed:', error);
      throw error;
    }
  }
}

export default FileSystemProvider;

// CommonJS compatibility
module.exports = FileSystemProvider;
