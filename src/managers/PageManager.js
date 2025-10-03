const BaseManager = require('./BaseManager');
const fs = require('fs-extra');
const path = require('path');
const matter = require('gray-matter');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

/**
 * PageManager - Handles all operations related to wiki pages,
 * such as loading, saving, and managing metadata.
 * Follows JSPWiki's model where it's the backend for page storage.
 */
class PageManager extends BaseManager {
  constructor(engine) {
    super(engine);
    this.pagesDirectory = null;
    this.requiredPagesDirectory = null;
    this.encoding = 'UTF-8';
    // Main cache, keyed by canonical identifier (UUID or title)
    this.pageCache = new Map();
    // Lookup maps for resolving different identifiers
    this.titleIndex = new Map(); // Maps lower-case title to canonical identifier
    this.uuidIndex = new Map(); // Maps UUID to canonical identifier
  }

  /**
   * Initializes the PageManager by reading configuration and caching pages.
   */
  async initialize() {
    const configManager = this.engine.getManager('ConfigurationManager');
    if (!configManager) throw new Error('PageManager requires ConfigurationManager to be initialized.');

    const cfgPath = configManager.getProperty('amdwiki.directories.pages', './pages');
    this.pagesDirectory = path.isAbsolute(cfgPath) ? cfgPath : path.join(process.cwd(), cfgPath);

    const reqCfgPath = configManager.getProperty('amdwiki.directories.required-pages', './required-pages');
    this.requiredPagesDirectory = path.isAbsolute(reqCfgPath) ? reqCfgPath : path.join(process.cwd(), reqCfgPath);

    this.encoding = configManager.getProperty('amdwiki.encoding', 'UTF-8');

    await fs.ensureDir(this.pagesDirectory);
    await fs.ensureDir(this.requiredPagesDirectory);
    logger.info(`Page directory ensured at: ${this.pagesDirectory}`);
    logger.info(`Required-pages directory ensured at: ${this.requiredPagesDirectory}`);

    await this.refreshPageList();
    logger.info(`PageManager initialized with ${this.pageCache.size} pages.`);
  }

  /**
   * Reads all .md files from both pages and required-pages directories and populates the page cache.
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
          logger.warn(`[PAGE] Skipping file with no title in frontmatter: ${filePath}`);
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
        logger.error(`[PAGE] Failed to process page file: ${filePath}`, { error: error.message });
      }
    }
    logger.info(`[PAGE] Indexing complete. Found ${this.pageCache.size} valid pages.`);
  }

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
      logger.error(`[PAGE] Failed to walk directory: ${dir}`, { error: error.message });
    }
    return out;
  }

  #resolvePageInfo(identifier) {
    if (!identifier) return null;

    // 1. Try UUID index first
    let canonicalKey = this.uuidIndex.get(identifier);
    if (canonicalKey) {
      return this.pageCache.get(canonicalKey);
    }

    // 2. Try title index (case-insensitive)
    canonicalKey = this.titleIndex.get(identifier.toLowerCase());
    if (canonicalKey) {
      return this.pageCache.get(canonicalKey);
    }

    return null; // Not found
  }

  /**
   * Retrieves the raw markdown content of a page.
   * @param {string} pageName The name of the page to load.
   * @returns {Promise<string>} The raw markdown content.
   */
  async getPageContent(identifier) {
    const info = this.#resolvePageInfo(identifier);
    if (!info) {
      logger.warn(`[PAGE] Not found: ${identifier}`);
      throw new Error(`Page '${identifier}' not found.`);
    }
    const content = await fs.readFile(info.filePath, this.encoding);
    logger.info(`[PAGE] Loaded ${info.title} from ${path.basename(info.filePath)} (${content.length} bytes)`);
    return content;
  }

  /**
   * Retrieves the metadata (frontmatter) for a given page.
   * @param {string} pageName The name of the page.
   * @returns {Promise<object|null>} The page metadata, or null if not found.
   */
  async getPageMetadata(identifier) {
    const info = this.#resolvePageInfo(identifier);
    return info ? info.metadata : null;
  }

  /**
   * Saves content to a wiki page, creating it if it doesn't exist.
   * @param {string} pageName The name of the page.
   * @param {string} content The new markdown content.
   * @param {object} metadata The metadata to save in the frontmatter.
   * @returns {Promise<void>}
   */
  async savePage(pageName, content, metadata = {}) {
    const uuid = metadata.uuid || this.#resolvePageInfo(pageName)?.uuid || uuidv4();
    const filePath = path.join(this.pagesDirectory, `${uuid}.md`);
    await fs.ensureDir(path.dirname(filePath));

    const now = new Date().toISOString();
    const updatedMetadata = {
      title: pageName,
      uuid: uuid,
      ...metadata,
      lastModified: now
    };

    const fileContent = matter.stringify(content, updatedMetadata);
    await fs.writeFile(filePath, fileContent, this.encoding);

    // Update cache immediately
    const pageInfo = { title: pageName, uuid, filePath, metadata: updatedMetadata };
    this.pageCache.set(pageName, pageInfo);
    this.titleIndex.set(pageName.toLowerCase(), pageName);
    this.uuidIndex.set(uuid, pageName);

    logger.info(`Page '${pageName}' saved successfully to ${path.basename(filePath)}.`);
  }

  /**
   * Returns a list of all available page names.
   * @returns {Promise<string[]>} An array of page names.
   */
  async getAllPages() {
    return Array.from(this.pageCache.keys()).sort((a, b) => a.localeCompare(b));
  }

  /**
   * Checks if a page exists.
   * @param {string} pageName The name of the page.
   * @returns {boolean} True if the page exists, false otherwise.
   */
  pageExists(identifier) {
    return !!this.#resolvePageInfo(identifier);
  }

  /**
   * Gets both page content and metadata together.
   * @param {string} identifier Page name or UUID
   * @returns {Promise<{content: string, metadata: object}|null>} Page data or null if not found
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
      logger.error(`[PAGE] Failed to read page: ${identifier}`, { error: error.message });
      return null;
    }
  }
}

module.exports = PageManager;
