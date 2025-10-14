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

  // ============================================================================
  // Versioning Methods (Optional - only for providers that support versioning)
  // ============================================================================

  /**
   * Get version history for a page
   *
   * Returns an array of version metadata entries for the specified page.
   * Providers that don't support versioning should not implement this method.
   *
   * @param {string} identifier - Page UUID or title
   * @returns {Promise<Array<object>>} Array of version metadata objects
   * @example
   * // Returns:
   * [
   *   {
   *     version: 1,
   *     dateCreated: "2025-01-01T00:00:00.000Z",
   *     author: "user@example.com",
   *     changeType: "created",
   *     comment: "Initial version",
   *     contentHash: "sha256...",
   *     contentSize: 1234
   *   },
   *   {
   *     version: 2,
   *     dateCreated: "2025-01-02T10:30:00.000Z",
   *     author: "editor@example.com",
   *     changeType: "updated",
   *     comment: "Added section",
   *     contentHash: "sha256...",
   *     contentSize: 567,
   *     isDelta: true
   *   }
   * ]
   */
  async getVersionHistory(identifier) {
    throw new Error('getVersionHistory() must be implemented by versioning providers');
  }

  /**
   * Get a specific version of a page
   *
   * Retrieves the content and metadata for a specific version number.
   * For delta-based storage, this reconstructs the content by applying diffs.
   *
   * @param {string} identifier - Page UUID or title
   * @param {number} version - Version number to retrieve
   * @returns {Promise<{content: string, metadata: object}>} Version content and metadata
   * @throws {Error} If version does not exist
   */
  async getPageVersion(identifier, version) {
    throw new Error('getPageVersion() must be implemented by versioning providers');
  }

  /**
   * Restore a page to a specific version
   *
   * Creates a new version by restoring content from an older version.
   * The restoration itself becomes a new version in the history.
   *
   * @param {string} identifier - Page UUID or title
   * @param {number} version - Version number to restore to
   * @returns {Promise<void>}
   * @throws {Error} If version does not exist or restoration fails
   */
  async restoreVersion(identifier, version) {
    throw new Error('restoreVersion() must be implemented by versioning providers');
  }

  /**
   * Compare two versions of a page
   *
   * Generates a diff between two versions showing what changed.
   * Returns structured diff data suitable for rendering.
   *
   * @param {string} identifier - Page UUID or title
   * @param {number} v1 - First version number (older)
   * @param {number} v2 - Second version number (newer)
   * @returns {Promise<object>} Diff data structure
   * @example
   * // Returns:
   * {
   *   v1: { version: 1, dateCreated: "...", author: "..." },
   *   v2: { version: 2, dateCreated: "...", author: "..." },
   *   diff: [
   *     { operation: "delete", line: 5, content: "old text" },
   *     { operation: "insert", line: 5, content: "new text" }
   *   ],
   *   stats: { additions: 10, deletions: 5, changes: 3 }
   * }
   */
  async compareVersions(identifier, v1, v2) {
    throw new Error('compareVersions() must be implemented by versioning providers');
  }

  /**
   * Purge old versions based on retention policy
   *
   * Removes old versions according to configuration settings (maxVersions, retentionDays).
   * Always preserves v1 (needed for delta reconstruction) and recent versions.
   *
   * @param {string} identifier - Page UUID or title
   * @param {number} keepLatest - Minimum number of recent versions to keep
   * @returns {Promise<number>} Number of versions purged
   */
  async purgeOldVersions(identifier, keepLatest) {
    throw new Error('purgeOldVersions() must be implemented by versioning providers');
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
