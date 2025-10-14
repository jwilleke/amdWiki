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
  async initialize(config = {}) {
    await super.initialize(config);

    const configManager = this.engine.getManager('ConfigurationManager');
    if (!configManager) {
      throw new Error('PageManager requires ConfigurationManager');
    }

    // Check if page storage is enabled (ALL LOWERCASE)
    const pageEnabled = configManager.getProperty('amdwiki.page.enabled', true);
    if (!pageEnabled) {
      logger.info('📄 PageManager: Page storage disabled by configuration');
      return;
    }

    // Load provider with fallback (ALL LOWERCASE)
    const defaultProvider = configManager.getProperty(
      'amdwiki.page.provider.default',
      'filesystemprovider'
    );
    const providerName = configManager.getProperty(
      'amdwiki.page.provider',
      defaultProvider
    );

    // Normalize provider name to PascalCase for class loading
    this.providerClass = this.#normalizeProviderName(providerName);

    logger.info(`📄 Loading page provider: ${providerName} (${this.providerClass})`);

    // Load and initialize provider
    try {
      const ProviderClass = require(`../providers/${this.providerClass}`);
      this.provider = new ProviderClass(this.engine);
      await this.provider.initialize();

      const info = this.provider.getProviderInfo();
      logger.info(`📄 PageManager initialized with ${info.name} v${info.version}`);
      if (info.features && info.features.length > 0) {
        logger.info(`📄 Provider features: ${info.features.join(', ')}`);
      }
    } catch (error) {
      logger.error(`📄 Failed to initialize page provider: ${this.providerClass}`, error);
      throw error;
    }
  }

  /**
   * Normalize provider name from configuration (lowercase) to class name (PascalCase)
   * @param {string} providerName - Provider name from configuration (e.g., 'filesystemprovider')
   * @returns {string} Normalized class name (e.g., 'FileSystemProvider')
   * @private
   */
  #normalizeProviderName(providerName) {
    if (!providerName) {
      throw new Error('Provider name cannot be empty');
    }

    const lower = providerName.toLowerCase();

    // Handle special cases for known provider names
    const knownProviders = {
      'filesystemprovider': 'FileSystemProvider',
      'databaseprovider': 'DatabaseProvider',
      'databasepageprovider': 'DatabasePageProvider',
      's3provider': 'S3Provider',
      's3pageprovider': 'S3PageProvider',
      'cloudstorageprovider': 'CloudStorageProvider'
    };

    if (knownProviders[lower]) {
      return knownProviders[lower];
    }

    // Fallback: Split on common separators and capitalize each word
    const words = lower.split(/[-_]/);
    const pascalCase = words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    return pascalCase;
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

  /**
   * Backup all pages through the provider
   *
   * Delegates to the provider's backup() method to serialize all page data.
   * The backup includes all page content, metadata, and directory structure.
   *
   * @returns {Promise<Object>} Backup data from provider
   */
  async backup() {
    logger.info('[PageManager] Starting backup...');

    if (!this.provider) {
      logger.warn('[PageManager] No provider available for backup');
      return {
        managerName: 'PageManager',
        timestamp: new Date().toISOString(),
        providerClass: null,
        data: null,
        note: 'No provider initialized'
      };
    }

    try {
      const providerBackup = await this.provider.backup();

      return {
        managerName: 'PageManager',
        timestamp: new Date().toISOString(),
        providerClass: this.providerClass,
        providerBackup: providerBackup
      };
    } catch (error) {
      logger.error('[PageManager] Backup failed:', error);
      throw error;
    }
  }

  /**
   * Restore pages from backup data
   *
   * Delegates to the provider's restore() method to recreate all pages
   * from the backup data.
   *
   * @param {Object} backupData - Backup data from backup() method
   * @returns {Promise<void>}
   */
  async restore(backupData) {
    logger.info('[PageManager] Starting restore...');

    if (!backupData) {
      throw new Error('PageManager: No backup data provided for restore');
    }

    if (!this.provider) {
      throw new Error('PageManager: No provider available for restore');
    }

    // Check for provider mismatch
    if (backupData.providerClass && backupData.providerClass !== this.providerClass) {
      logger.warn(`[PageManager] Provider mismatch: backup has ${backupData.providerClass}, current is ${this.providerClass}`);
    }

    try {
      if (backupData.providerBackup) {
        await this.provider.restore(backupData.providerBackup);
        logger.info('[PageManager] Restore completed successfully');
      } else {
        logger.warn('[PageManager] No provider backup data found in backup');
      }
    } catch (error) {
      logger.error('[PageManager] Restore failed:', error);
      throw error;
    }
  }
}

module.exports = PageManager;
