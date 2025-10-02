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
    this.encoding = 'UTF-8';
    this.pageCache = new Map();
  }

  /**
   * Initializes the PageManager by reading configuration and caching pages.
   */
  async initialize() {
    const configManager = this.engine.getManager('ConfigurationManager');
    if (!configManager) {
      throw new Error('PageManager requires ConfigurationManager to be initialized.');
    }

    // Fetch configuration from the single source of truth
    this.pagesDirectory = configManager.getProperty('amdwiki.directories.pages', './pages');
    this.encoding = configManager.getProperty('amdwiki.encoding', 'UTF-8');

    // Ensure the pages directory exists
    try {
      await fs.ensureDir(this.pagesDirectory);
      logger.info(`Page directory ensured at: ${this.pagesDirectory}`);
    } catch (error) {
      logger.error(`Failed to create page directory at ${this.pagesDirectory}`, { error });
      throw error;
    }

    // Build the initial page list
    await this.refreshPageList();
    logger.info(`PageManager initialized with ${this.pageCache.size} pages.`);
  }

  /**
   * Reads all .md files from the pages directory and populates the page cache.
   */
  async refreshPageList() {
    this.pageCache.clear();
    const files = await fs.readdir(this.pagesDirectory);
    const pageFiles = files.filter(file => file.endsWith('.md'));

    for (const file of pageFiles) {
      const pageName = path.basename(file, '.md');
      this.pageCache.set(pageName, {
        name: pageName,
        filePath: path.join(this.pagesDirectory, file)
      });
    }
  }

  /**
   * Retrieves the raw markdown content of a page.
   * @param {string} pageName The name of the page to load.
   * @returns {Promise<string>} The raw markdown content.
   */
  async getPageContent(pageName) {
    const pageInfo = this.pageCache.get(pageName);
    if (!pageInfo) {
      throw new Error(`Page '${pageName}' not found.`);
    }
    return fs.readFile(pageInfo.filePath, this.encoding);
  }

  /**
   * Retrieves the metadata (frontmatter) for a given page.
   * @param {string} pageName The name of the page.
   * @returns {Promise<object|null>} The page metadata, or null if not found.
   */
  async getPageMetadata(pageName) {
    try {
      const content = await this.getPageContent(pageName);
      const { data } = matter(content);
      return data;
    } catch (error) {
      logger.warn(`Could not retrieve metadata for page '${pageName}'.`, { error: error.message });
      return null;
    }
  }

  /**
   * Saves content to a wiki page, creating it if it doesn't exist.
   * @param {string} pageName The name of the page.
   * @param {string} content The new markdown content.
   * @param {object} metadata The metadata to save in the frontmatter.
   * @returns {Promise<void>}
   */
  async savePage(pageName, content, metadata = {}) {
    const filePath = path.join(this.pagesDirectory, `${pageName}.md`);
    const now = new Date().toISOString();

    const updatedMetadata = {
      title: pageName,
      uuid: metadata.uuid || uuidv4(),
      ...metadata,
      lastModified: now
    };

    const fileContent = matter.stringify(content, updatedMetadata);
    await fs.writeFile(filePath, fileContent, this.encoding);

    // Update cache
    this.pageCache.set(pageName, { name: pageName, filePath });
    logger.info(`Page '${pageName}' saved successfully.`);
  }

  /**
   * Returns a list of all available page names.
   * @returns {Promise<string[]>} An array of page names.
   */
  async getAllPages() {
    return Array.from(this.pageCache.keys());
  }

  /**
   * Checks if a page exists.
   * @param {string} pageName The name of the page.
   * @returns {boolean} True if the page exists, false otherwise.
   */
  pageExists(pageName) {
    return this.pageCache.has(pageName);
  }
}

module.exports = PageManager;
