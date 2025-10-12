const BasePageProvider = require('./BasePageProvider');
const fs = require('fs-extra');
const path = require('path');
const matter = require('gray-matter');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const PageNameMatcher = require('../utils/PageNameMatcher');

/**
 * FileSystemProvider - Markdown file-based storage provider
 *
 * Implements page storage using filesystem with YAML frontmatter.
 * Pages are stored as .md files in configurable directories.
 *
 * Features:
 * - UUID-based file naming
 * - Title-based lookup with case-insensitive matching
 * - Plural name matching (configurable)
 * - Dual storage locations (regular pages and required/system pages)
 * - In-memory caching with multiple indexes
 */
class FileSystemProvider extends BasePageProvider {
  constructor(engine) {
    super(engine);
    this.pagesDirectory = null;
    this.requiredPagesDirectory = null;
    this.encoding = 'UTF-8';
    // Main cache, keyed by canonical identifier (title)
    this.pageCache = new Map();
    // Lookup maps for resolving different identifiers
    this.titleIndex = new Map(); // Maps lower-case title to canonical identifier
    this.uuidIndex = new Map(); // Maps UUID to canonical identifier
    this.pageNameMatcher = null; // Will be initialized with config
  }

  /**
   * Initialize the provider by reading configuration and caching pages.
   * All configuration access goes through ConfigurationManager (ALL LOWERCASE).
   */
  async initialize() {
    const configManager = this.engine.getManager('ConfigurationManager');
    if (!configManager) {
      throw new Error('FileSystemProvider requires ConfigurationManager');
    }

    // Get directory configuration (ALL LOWERCASE with provider-specific keys)
    const cfgPath = configManager.getProperty(
      'amdwiki.page.provider.filesystem.storagedir',
      './pages'
    );
    this.pagesDirectory = path.isAbsolute(cfgPath) ? cfgPath : path.join(process.cwd(), cfgPath);

    const reqCfgPath = configManager.getProperty(
      'amdwiki.page.provider.filesystem.requiredpagesdir',
      './required-pages'
    );
    this.requiredPagesDirectory = path.isAbsolute(reqCfgPath) ? reqCfgPath : path.join(process.cwd(), reqCfgPath);

    // Get encoding configuration (ALL LOWERCASE)
    this.encoding = configManager.getProperty(
      'amdwiki.page.provider.filesystem.encoding',
      'utf-8'
    );

    // Initialize PageNameMatcher with plural matching config
    const matchEnglishPlurals = configManager.getProperty('amdwiki.translatorReader.matchEnglishPlurals', true);
    this.pageNameMatcher = new PageNameMatcher(matchEnglishPlurals);
    logger.info(`[FileSystemProvider] Plural matching: ${matchEnglishPlurals ? 'enabled' : 'disabled'}`);

    // Ensure directories exist
    await fs.ensureDir(this.pagesDirectory);
    await fs.ensureDir(this.requiredPagesDirectory);
    logger.info(`[FileSystemProvider] Page directory: ${this.pagesDirectory}`);
    logger.info(`[FileSystemProvider] Required-pages directory: ${this.requiredPagesDirectory}`);

    // Load all pages into cache
    await this.refreshPageList();

    this.initialized = true;
    logger.info(`[FileSystemProvider] Initialized with ${this.pageCache.size} pages.`);
  }

  /**
   * Reads all .md files from both pages and required-pages directories
   * and populates the page cache with multiple indexes.
   */
  async refreshPageList() {
    this.pageCache.clear();
    this.titleIndex.clear();
    this.uuidIndex.clear();

    // Scan both directories
    const pagesFiles = await this.#walkDir(this.pagesDirectory);
    const requiredFiles = await this.#walkDir(this.requiredPagesDirectory);
    const allFiles = [...pagesFiles, ...requiredFiles];
    const mdFiles = allFiles.filter(f => f.toLowerCase().endsWith('.md'));

    for (const filePath of mdFiles) {
      try {
        const fileContent = await fs.readFile(filePath, this.encoding);
        const { data: metadata } = matter(fileContent);
        const title = metadata.title;
        const uuid = metadata.uuid || path.basename(filePath, '.md');

        if (!title) {
          logger.warn(`[FileSystemProvider] Skipping file with no title in frontmatter: ${filePath}`);
          continue;
        }

        const pageInfo = {
          title: title,
          uuid: uuid,
          filePath: filePath,
          metadata: metadata
        };

        // Use title as the canonical key for the main cache
        const canonicalKey = title;
        this.pageCache.set(canonicalKey, pageInfo);

        // Build lookup indexes
        this.titleIndex.set(title.toLowerCase(), canonicalKey);
        if (uuid) {
          this.uuidIndex.set(uuid, canonicalKey);
        }

      } catch (error) {
        logger.error(`[FileSystemProvider] Failed to process page file: ${filePath}`, { error: error.message });
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
  async #walkDir(dir) {
    const out = [];
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name.startsWith('.')) continue; // Skip hidden dirs
          out.push(...(await this.#walkDir(full)));
        } else if (entry.isFile()) {
          out.push(full);
        }
      }
    } catch (error) {
      logger.error(`[FileSystemProvider] Failed to walk directory: ${dir}`, { error: error.message });
    }
    return out;
  }

  /**
   * Resolve a page identifier (UUID or title) to page info
   * Tries multiple strategies:
   * 1. UUID index lookup
   * 2. Title index (case-insensitive exact match)
   * 3. Fuzzy matching with plurals (if enabled)
   *
   * @param {string} identifier - Page UUID or title
   * @returns {object|null} Page info or null if not found
   * @private
   */
  #resolvePageInfo(identifier) {
    if (!identifier) return null;

    // 1. Try UUID index first
    let canonicalKey = this.uuidIndex.get(identifier);
    if (canonicalKey) {
      return this.pageCache.get(canonicalKey);
    }

    // 2. Try title index (case-insensitive exact match)
    canonicalKey = this.titleIndex.get(identifier.toLowerCase());
    if (canonicalKey) {
      return this.pageCache.get(canonicalKey);
    }

    // 3. Try fuzzy matching with plurals if enabled
    if (this.pageNameMatcher) {
      const allTitles = Array.from(this.pageCache.values()).map(info => info.title);
      const matchedTitle = this.pageNameMatcher.findMatch(identifier, allTitles);
      if (matchedTitle) {
        canonicalKey = this.titleIndex.get(matchedTitle.toLowerCase());
        if (canonicalKey) {
          logger.info(`[FileSystemProvider] Fuzzy match: '${identifier}' -> '${matchedTitle}'`);
          return this.pageCache.get(canonicalKey);
        }
      }
    }

    return null; // Not found
  }

  /**
   * Get page content and metadata together
   * @param {string} identifier - Page UUID or title
   * @returns {Promise<{content: string, metadata: object, title: string, uuid: string, filePath: string}|null>}
   */
  async getPage(identifier) {
    const info = this.#resolvePageInfo(identifier);
    if (!info) {
      return null;
    }

    try {
      const fullContent = await fs.readFile(info.filePath, this.encoding);
      const { content, data: metadata } = matter(fullContent);

      return {
        content,
        metadata,
        title: info.title,
        uuid: info.uuid,
        filePath: info.filePath
      };
    } catch (error) {
      logger.error(`[FileSystemProvider] Failed to read page: ${identifier}`, { error: error.message });
      return null;
    }
  }

  /**
   * Retrieves the raw markdown content of a page (without frontmatter).
   * @param {string} identifier - Page UUID or title
   * @returns {Promise<string>} The raw markdown content without frontmatter
   */
  async getPageContent(identifier) {
    const info = this.#resolvePageInfo(identifier);
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
   * @returns {Promise<object|null>} The page metadata, or null if not found
   */
  async getPageMetadata(identifier) {
    const info = this.#resolvePageInfo(identifier);
    return info ? info.metadata : null;
  }

  /**
   * Saves content to a wiki page, creating it if it doesn't exist.
   * Determines storage location based on system-category metadata.
   *
   * @param {string} pageName - The name of the page
   * @param {string} content - The new markdown content
   * @param {object} metadata - The metadata to save in the frontmatter
   * @returns {Promise<void>}
   */
  async savePage(pageName, content, metadata = {}) {
    const uuid = metadata.uuid || this.#resolvePageInfo(pageName)?.uuid || uuidv4();

    // Determine which directory to save to based on system-category
    // Use configuration from amdwiki.systemCategories via ConfigurationManager
    const configManager = this.engine.getManager('ConfigurationManager');
    const systemCategory = metadata['system-category'] || metadata.systemCategory || 'General';

    let targetDirectory;
    if (configManager) {
      const systemCategoriesConfig = configManager.getProperty('amdwiki.systemCategories', null);

      if (systemCategoriesConfig) {
        // Find the category configuration by label (case-insensitive)
        let storageLocation = 'regular'; // default
        for (const [key, config] of Object.entries(systemCategoriesConfig)) {
          if (config.label.toLowerCase() === systemCategory.toLowerCase()) {
            storageLocation = config.storageLocation || 'regular';
            break;
          }
        }
        targetDirectory = storageLocation === 'required' ? this.requiredPagesDirectory : this.pagesDirectory;
      } else {
        // Fallback to hardcoded logic if config not available
        const systemCategoryLower = systemCategory.toLowerCase();
        const isRequiredPage = systemCategoryLower === 'system' ||
                               systemCategoryLower === 'documentation' ||
                               systemCategoryLower === 'test';
        targetDirectory = isRequiredPage ? this.requiredPagesDirectory : this.pagesDirectory;
      }
    } else {
      // Fallback if ConfigurationManager not available
      const systemCategoryLower = systemCategory.toLowerCase();
      const isRequiredPage = systemCategoryLower === 'system' ||
                             systemCategoryLower === 'documentation' ||
                             systemCategoryLower === 'test';
      targetDirectory = isRequiredPage ? this.requiredPagesDirectory : this.pagesDirectory;
    }
    const filePath = path.join(targetDirectory, `${uuid}.md`);
    await fs.ensureDir(path.dirname(filePath));

    // If the file exists in the wrong directory, remove it
    const oldPageInfo = this.#resolvePageInfo(pageName);
    if (oldPageInfo && oldPageInfo.filePath !== filePath) {
      try {
        await fs.unlink(oldPageInfo.filePath);
        logger.info(`[FileSystemProvider] Moved page from ${oldPageInfo.filePath} to ${filePath}`);
      } catch (err) {
        logger.warn(`[FileSystemProvider] Could not remove old file: ${oldPageInfo.filePath}`, { error: err.message });
      }
    }

    const now = new Date().toISOString();
    // Use metadata.title if provided (for renames), otherwise use pageName
    const finalTitle = metadata.title || pageName;
    const updatedMetadata = {
      title: finalTitle,
      uuid: uuid,
      ...metadata,
      title: finalTitle, // Ensure title is not overridden by spread
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
      logger.info(`[FileSystemProvider] Page renamed from '${oldPageInfo.title}' to '${finalTitle}'`);
    }

    // Update cache with NEW title as the key
    const pageInfo = { title: finalTitle, uuid, filePath, metadata: updatedMetadata };
    this.pageCache.set(finalTitle, pageInfo);
    this.titleIndex.set(finalTitle.toLowerCase(), finalTitle);
    this.uuidIndex.set(uuid, finalTitle);

    logger.info(`[FileSystemProvider] Page '${finalTitle}' saved successfully to ${path.basename(filePath)}.`);
  }

  /**
   * Delete a page
   * @param {string} identifier - Page UUID or title
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deletePage(identifier) {
    const info = this.#resolvePageInfo(identifier);
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

      logger.info(`[FileSystemProvider] Deleted page '${info.title}' (${info.uuid})`);
      return true;
    } catch (error) {
      logger.error(`[FileSystemProvider] Failed to delete page: ${identifier}`, { error: error.message });
      return false;
    }
  }

  /**
   * Check if a page exists
   * @param {string} identifier - Page UUID or title
   * @returns {boolean}
   */
  pageExists(identifier) {
    return !!this.#resolvePageInfo(identifier);
  }

  /**
   * Returns a list of all available page titles (sorted)
   * @returns {Promise<string[]>} An array of page titles
   */
  async getAllPages() {
    return Array.from(this.pageCache.keys()).sort((a, b) => a.localeCompare(b));
  }

  /**
   * Get provider information
   * @returns {object}
   */
  getProviderInfo() {
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
}

module.exports = FileSystemProvider;
