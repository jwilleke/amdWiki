const logger = require('../utils/logger');

/**
 * BaseAttachmentProvider - Abstract interface for attachment storage providers
 *
 * All attachment storage providers must extend this class and implement its methods.
 * Providers handle the actual storage and retrieval of wiki attachments (files, images, etc.),
 * whether from filesystem, database, cloud storage, or other backends.
 *
 * Following JSPWiki's attachment provider pattern.
 *
 * @abstract
 */
class BaseAttachmentProvider {
  /**
   * Create a new attachment provider
   * @param {object} engine - The WikiEngine instance
   */
  constructor(engine) {
    if (!engine) {
      throw new Error('BaseAttachmentProvider requires an engine instance');
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
   * Upload/store an attachment with metadata
   * @param {Buffer} fileBuffer - File data
   * @param {object} fileInfo - File information (originalName, mimeType, size)
   * @param {object} metadata - Schema.org CreativeWork metadata
   * @param {object} user - User uploading the attachment
   * @returns {Promise<object>} Attachment metadata with ID
   */
  async storeAttachment(fileBuffer, fileInfo, metadata, user) {
    throw new Error('storeAttachment() must be implemented by provider');
  }

  /**
   * Get attachment file data
   * @param {string} attachmentId - Attachment identifier
   * @returns {Promise<{buffer: Buffer, metadata: object}|null>} File buffer and metadata
   */
  async getAttachment(attachmentId) {
    throw new Error('getAttachment() must be implemented by provider');
  }

  /**
   * Get attachment metadata only (no file data)
   * @param {string} attachmentId - Attachment identifier
   * @returns {Promise<object|null>} Schema.org CreativeWork metadata
   */
  async getAttachmentMetadata(attachmentId) {
    throw new Error('getAttachmentMetadata() must be implemented by provider');
  }

  /**
   * Update attachment metadata (e.g., add page reference)
   * @param {string} attachmentId - Attachment identifier
   * @param {object} metadata - Updated metadata
   * @returns {Promise<boolean>} Success status
   */
  async updateAttachmentMetadata(attachmentId, metadata) {
    throw new Error('updateAttachmentMetadata() must be implemented by provider');
  }

  /**
   * Delete an attachment
   * @param {string} attachmentId - Attachment identifier
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deleteAttachment(attachmentId) {
    throw new Error('deleteAttachment() must be implemented by provider');
  }

  /**
   * Check if attachment exists
   * @param {string} attachmentId - Attachment identifier
   * @returns {Promise<boolean>}
   */
  async attachmentExists(attachmentId) {
    throw new Error('attachmentExists() must be implemented by provider');
  }

  /**
   * Get all attachments metadata (without file data)
   * @returns {Promise<Array<object>>} Array of attachment metadata
   */
  async getAllAttachments() {
    throw new Error('getAllAttachments() must be implemented by provider');
  }

  /**
   * Get attachments used by a specific page
   * @param {string} pageName - Page name/title
   * @returns {Promise<Array<object>>} Array of attachment metadata
   */
  async getAttachmentsForPage(pageName) {
    throw new Error('getAttachmentsForPage() must be implemented by provider');
  }

  /**
   * Refresh internal cache/index
   * Re-scans storage and rebuilds indexes
   * @returns {Promise<void>}
   */
  async refreshAttachmentList() {
    throw new Error('refreshAttachmentList() must be implemented by provider');
  }

  /**
   * Get provider information
   * @returns {object} Provider metadata
   */
  getProviderInfo() {
    return {
      name: 'BaseAttachmentProvider',
      version: '1.0.0',
      description: 'Abstract base attachment provider',
      features: []
    };
  }

  /**
   * Backup provider data
   * Returns all metadata needed to restore attachments
   * @returns {Promise<object>} Backup data
   */
  async backup() {
    throw new Error('backup() must be implemented by provider');
  }

  /**
   * Restore provider data from backup
   * @param {object} backupData - Backup data from backup()
   * @returns {Promise<void>}
   */
  async restore(backupData) {
    throw new Error('restore() must be implemented by provider');
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

module.exports = BaseAttachmentProvider;
