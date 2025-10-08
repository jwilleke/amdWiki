const logger = require('../utils/logger');

/**
 * BasePageProvider - Abstract interface for page storage providers
 *
 * All page storage providers must extend this class and implement its methods.
 * Providers handle the actual storage and retrieval of wiki pages, whether
 * from filesystem, database, cloud storage, or other backends.
 *
 * @abstract
 */
class BasePageProvider {
  /**
   * Create a new page provider
   * @param {object} engine - The WikiEngine instance
   */
  constructor(engine) {
    if (!engine) {
      throw new Error('BasePageProvider requires an engine instance');
    }
    this.engine = engine;
    this.initialized = false;
  }

  /**
   * Initialize the provider
   *
   * IMPORTANT: Providers MUST access configuration via ConfigurationManager:
   *   const configManager = this.engine.getManager('ConfigurationManager');
   *   const value = configManager.getProperty('key', 'default');
   *
   * Do NOT read configuration files directly.
   *
   * @returns {Promise<void>}
   */
  async initialize() {
    throw new Error('initialize() must be implemented by provider');
  }

  /**
   * Get page content and metadata together
   * @param {string} identifier - Page UUID or title
   * @returns {Promise<{content: string, metadata: object, title: string, uuid: string, filePath: string}|null>}
   */
  async getPage(identifier) {
    throw new Error('getPage() must be implemented by provider');
  }

  /**
   * Get only page content (without metadata)
   * @param {string} identifier - Page UUID or title
   * @returns {Promise<string>}
   */
  async getPageContent(identifier) {
    throw new Error('getPageContent() must be implemented by provider');
  }

  /**
   * Get only page metadata
   * @param {string} identifier - Page UUID or title
   * @returns {Promise<object|null>}
   */
  async getPageMetadata(identifier) {
    throw new Error('getPageMetadata() must be implemented by provider');
  }

  /**
   * Save page content and metadata
   * @param {string} pageName - Page title
   * @param {string} content - Page content (markdown)
   * @param {object} metadata - Page metadata (frontmatter)
   * @returns {Promise<void>}
   */
  async savePage(pageName, content, metadata = {}) {
    throw new Error('savePage() must be implemented by provider');
  }

  /**
   * Delete a page
   * @param {string} identifier - Page UUID or title
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deletePage(identifier) {
    throw new Error('deletePage() must be implemented by provider');
  }

  /**
   * Check if page exists
   * @param {string} identifier - Page UUID or title
   * @returns {boolean}
   */
  pageExists(identifier) {
    throw new Error('pageExists() must be implemented by provider');
  }

  /**
   * Get all page titles
   * @returns {Promise<string[]>} Sorted array of page titles
   */
  async getAllPages() {
    throw new Error('getAllPages() must be implemented by provider');
  }

  /**
   * Refresh internal cache/index
   * Re-scans storage and rebuilds indexes
   * @returns {Promise<void>}
   */
  async refreshPageList() {
    throw new Error('refreshPageList() must be implemented by provider');
  }

  /**
   * Get provider information
   * @returns {object} Provider metadata
   */
  getProviderInfo() {
    return {
      name: 'BasePageProvider',
      version: '1.0.0',
      description: 'Abstract base provider',
      features: []
    };
  }

  /**
   * Shutdown the provider (cleanup resources)
   * @returns {Promise<void>}
   */
  async shutdown() {
    this.initialized = false;
    logger.info(`${this.getProviderInfo().name} shut down`);
  }
}

module.exports = BasePageProvider;
