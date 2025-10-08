const BaseManager = require('./BaseManager');
const logger = require('../utils/logger');
const FileSystemProvider = require('../providers/FileSystemProvider');

/**
 * PageManager - Manages wiki page operations through a pluggable provider system
 *
 * Follows JSPWiki's provider pattern where the actual storage implementation
 * is abstracted behind a provider interface. This allows for different storage
 * backends (filesystem, database, cloud, etc.) to be swapped via configuration.
 *
 * The PageManager acts as a thin coordinator that:
 * - Loads the configured provider (via "amdwiki.pageProvider")
 * - Proxies all page operations to the provider
 * - Maintains the public API for backward compatibility
 */
class PageManager extends BaseManager {
  constructor(engine) {
    super(engine);
    this.provider = null;
  }

  /**
   * Initialize the PageManager by loading and initializing the configured provider
   */
  async initialize() {
    // MUST get configuration via ConfigurationManager
    const configManager = this.engine.getManager('ConfigurationManager');
    if (!configManager) {
      throw new Error('PageManager requires ConfigurationManager to be initialized.');
    }

    // Get the provider name from configuration
    const providerName = configManager.getProperty('amdwiki.pageProvider', 'FileSystemProvider');

    // Load the provider based on configuration
    this.provider = this.#loadProvider(providerName);

    // Initialize the provider (provider will access ConfigurationManager internally)
    await this.provider.initialize();

    const info = this.provider.getProviderInfo();
    logger.info(`PageManager initialized with ${info.name} v${info.version}`);
    if (info.features && info.features.length > 0) {
      logger.info(`Provider features: ${info.features.join(', ')}`);
    }
  }

  /**
   * Load a provider by name
   * @param {string} providerName - Name of the provider to load
   * @returns {BasePageProvider} The provider instance
   * @private
   */
  #loadProvider(providerName) {
    switch (providerName) {
      case 'FileSystemProvider':
        return new FileSystemProvider(this.engine);

      // Future providers can be added here:
      // case 'DatabaseProvider':
      //   const DatabaseProvider = require('../providers/DatabaseProvider');
      //   return new DatabaseProvider(this.engine);
      //
      // case 'CloudStorageProvider':
      //   const CloudStorageProvider = require('../providers/CloudStorageProvider');
      //   return new CloudStorageProvider(this.engine);

      default:
        throw new Error(`Unknown page provider: ${providerName}`);
    }
  }

  /**
   * Get the current page provider instance
   * @returns {BasePageProvider} The active provider
   */
  getCurrentPageProvider() {
    return this.provider;
  }

  // ============================================================================
  // Proxy Methods - All page operations are delegated to the provider
  // ============================================================================

  /**
   * Get page content and metadata together
   * @param {string} identifier - Page UUID or title
   * @returns {Promise<{content: string, metadata: object, title: string, uuid: string, filePath: string}|null>}
   */
  async getPage(identifier) {
    return this.provider.getPage(identifier);
  }

  /**
   * Get only page content (without metadata)
   * @param {string} identifier - Page UUID or title
   * @returns {Promise<string>}
   */
  async getPageContent(identifier) {
    return this.provider.getPageContent(identifier);
  }

  /**
   * Get only page metadata
   * @param {string} identifier - Page UUID or title
   * @returns {Promise<object|null>}
   */
  async getPageMetadata(identifier) {
    return this.provider.getPageMetadata(identifier);
  }

  /**
   * Save page content and metadata
   * @param {string} pageName - Page title
   * @param {string} content - Page content (markdown)
   * @param {object} metadata - Page metadata (frontmatter)
   * @returns {Promise<void>}
   */
  async savePage(pageName, content, metadata = {}) {
    return this.provider.savePage(pageName, content, metadata);
  }

  /**
   * Delete a page
   * @param {string} identifier - Page UUID or title
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deletePage(identifier) {
    return this.provider.deletePage(identifier);
  }

  /**
   * Check if page exists
   * @param {string} identifier - Page UUID or title
   * @returns {boolean}
   */
  pageExists(identifier) {
    return this.provider.pageExists(identifier);
  }

  /**
   * Get all page titles
   * @returns {Promise<string[]>} Sorted array of page titles
   */
  async getAllPages() {
    return this.provider.getAllPages();
  }

  /**
   * Refresh internal cache/index
   * @returns {Promise<void>}
   */
  async refreshPageList() {
    return this.provider.refreshPageList();
  }

  /**
   * Shutdown the PageManager and its provider
   * @returns {Promise<void>}
   */
  async shutdown() {
    if (this.provider) {
      await this.provider.shutdown();
    }
    logger.info('PageManager shut down');
  }
}

module.exports = PageManager;
