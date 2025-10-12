const BaseManager = require('./BaseManager');
const logger = require('../utils/logger');

/**
 * AttachmentManager - Manages file attachments for wiki pages
 *
 * Following JSPWiki's AttachmentManager pattern, this manager:
 * - Delegates storage to pluggable attachment providers
 * - Enforces permissions via PolicyManager
 * - Tracks attachment-page relationships
 * - Provides high-level attachment operations
 *
 * Based on:
 * https://github.com/apache/jspwiki/blob/master/jspwiki-main/src/main/java/org/apache/wiki/attachment/AttachmentManager.java
 */
class AttachmentManager extends BaseManager {
  constructor(engine) {
    super(engine);
    this.attachmentProvider = null;
    this.providerClass = null;
  }

  /**
   * Initialize AttachmentManager
   * @param {Object} config - Configuration object
   */
  async initialize(config = {}) {
    await super.initialize(config);

    const configManager = this.engine.getManager('ConfigurationManager');
    if (!configManager) {
      throw new Error('AttachmentManager requires ConfigurationManager');
    }

    // Check if attachments are enabled (ALL LOWERCASE)
    const attachmentsEnabled = configManager.getProperty('amdwiki.attachment.enabled', true);
    if (!attachmentsEnabled) {
      logger.info('📎 AttachmentManager: Attachments disabled by configuration');
      return;
    }

    // Load provider with fallback (ALL LOWERCASE)
    const defaultProvider = configManager.getProperty(
      'amdwiki.attachment.provider.default',
      'basicattachmentprovider'
    );
    const providerName = configManager.getProperty(
      'amdwiki.attachment.provider',
      defaultProvider
    );

    // Normalize provider name to PascalCase for class loading
    // basicattachmentprovider -> BasicAttachmentProvider
    this.providerClass = this.#normalizeProviderName(providerName);

    // Load shared attachment settings
    this.maxSize = configManager.getProperty('amdwiki.attachment.maxsize', 10485760);
    this.allowedTypes = configManager.getProperty('amdwiki.attachment.allowedtypes', 'image/*,text/*,application/pdf');
    this.forceDownload = configManager.getProperty('amdwiki.attachment.forcedownload', false);

    logger.info(`📎 Loading attachment provider: ${providerName} (${this.providerClass})`);

    // Load and initialize provider
    try {
      const ProviderClass = require(`../providers/${this.providerClass}`);
      this.attachmentProvider = new ProviderClass(this.engine);
      await this.attachmentProvider.initialize();

      logger.info(`📎 AttachmentManager initialized with ${this.providerClass}`);
      logger.info(`📎 Max attachment size: ${this.#formatSize(this.maxSize)}`);
      logger.info(`📎 Allowed types: ${this.allowedTypes}`);

      const providerInfo = this.attachmentProvider.getProviderInfo();
      logger.info(`📎 Provider features: ${providerInfo.features.join(', ')}`);
    } catch (error) {
      logger.error(`📎 Failed to initialize attachment provider: ${this.providerClass}`, error);
      throw error;
    }
  }

  /**
   * Get current attachment provider
   * @returns {BaseAttachmentProvider} Current provider instance
   */
  getCurrentAttachmentProvider() {
    return this.attachmentProvider;
  }

  /**
   * Check permission for attachment operation
   * Any authenticated user can upload/delete attachments
   * @param {string} action - Action to check (attachment:upload, attachment:delete)
   * @param {object} userContext - User context with username and roles
   * @returns {Promise<boolean>} True if allowed
   * @private
   */
  async #checkPermission(action, userContext) {
    // Check if user is authenticated
    if (!userContext || !userContext.isAuthenticated) {
      logger.warn(`📎 Permission denied for ${action}: User not authenticated`);
      return false;
    }

    // Any authenticated user can upload/delete attachments
    logger.info(`📎 Permission granted for ${action}: User ${userContext.username} is authenticated`);
    return true;
  }

  /**
   * Upload an attachment
   *
   * @param {Buffer} fileBuffer - File data
   * @param {object} fileInfo - { originalName, mimeType, size }
   * @param {object} options - Upload options
   * @param {string} options.pageName - Page to attach to (optional)
   * @param {string} options.description - File description
   * @param {object} options.context - WikiContext with user information
   * @returns {Promise<object>} Attachment metadata
   */
  async uploadAttachment(fileBuffer, fileInfo, options = {}) {
    if (!this.attachmentProvider) {
      throw new Error('Attachment provider not initialized');
    }

    // Check permission
    const allowed = await this.#checkPermission('attachment:upload', options.context);
    if (!allowed) {
      throw new Error('Permission denied: You do not have permission to upload attachments');
    }

    // Extract user info from context (context is the full userContext object)
    const user = options.context ? {
      name: options.context.username || options.context.name || 'Unknown',
      email: options.context.email || undefined
    } : null;

    // Create metadata
    const metadata = {
      description: options.description || '',
      isFamilyFriendly: true
    };

    // Store attachment via provider
    const attachmentMetadata = await this.attachmentProvider.storeAttachment(
      fileBuffer,
      fileInfo,
      metadata,
      user
    );

    // If pageName provided, add to mentions
    if (options.pageName) {
      await this.attachToPage(attachmentMetadata.identifier, options.pageName);
    }

    logger.info(`📎 Uploaded attachment: ${fileInfo.originalName} (${attachmentMetadata.identifier})`);
    return attachmentMetadata;
  }

  /**
   * Attach an existing attachment to a page
   *
   * @param {string} attachmentId - Attachment identifier
   * @param {string} pageName - Page name to attach to
   * @returns {Promise<boolean>} Success status
   */
  async attachToPage(attachmentId, pageName) {
    if (!this.attachmentProvider) {
      throw new Error('Attachment provider not initialized');
    }

    const metadata = await this.attachmentProvider.getAttachmentMetadata(attachmentId);
    if (!metadata) {
      throw new Error(`Attachment not found: ${attachmentId}`);
    }

    // Check if already attached
    const mentions = metadata.mentions || [];
    const alreadyAttached = mentions.some(m => m.name === pageName);
    if (alreadyAttached) {
      logger.info(`📎 Attachment ${attachmentId} already attached to ${pageName}`);
      return true;
    }

    // Add page to mentions
    mentions.push({
      '@type': 'WebPage',
      'name': pageName,
      'url': `/wiki/${encodeURIComponent(pageName)}`
    });

    await this.attachmentProvider.updateAttachmentMetadata(attachmentId, { mentions });

    logger.info(`📎 Attached ${attachmentId} to page ${pageName}`);
    return true;
  }

  /**
   * Detach an attachment from a page
   *
   * @param {string} attachmentId - Attachment identifier
   * @param {string} pageName - Page name to detach from
   * @returns {Promise<boolean>} Success status
   */
  async detachFromPage(attachmentId, pageName) {
    if (!this.attachmentProvider) {
      throw new Error('Attachment provider not initialized');
    }

    const metadata = await this.attachmentProvider.getAttachmentMetadata(attachmentId);
    if (!metadata) {
      throw new Error(`Attachment not found: ${attachmentId}`);
    }

    // Remove page from mentions
    const mentions = (metadata.mentions || []).filter(m => m.name !== pageName);
    await this.attachmentProvider.updateAttachmentMetadata(attachmentId, { mentions });

    logger.info(`📎 Detached ${attachmentId} from page ${pageName}`);
    return true;
  }

  /**
   * Get an attachment by ID
   *
   * @param {string} attachmentId - Attachment identifier
   * @returns {Promise<{buffer: Buffer, metadata: object}|null>}
   */
  async getAttachment(attachmentId) {
    if (!this.attachmentProvider) {
      throw new Error('Attachment provider not initialized');
    }

    return await this.attachmentProvider.getAttachment(attachmentId);
  }

  /**
   * Get attachment metadata only
   *
   * @param {string} attachmentId - Attachment identifier
   * @returns {Promise<object|null>}
   */
  async getAttachmentMetadata(attachmentId) {
    if (!this.attachmentProvider) {
      throw new Error('Attachment provider not initialized');
    }

    return await this.attachmentProvider.getAttachmentMetadata(attachmentId);
  }

  /**
   * Get all attachments for a page
   *
   * @param {string} pageName - Page name
   * @returns {Promise<Array<object>>}
   */
  async getAttachmentsForPage(pageName) {
    if (!this.attachmentProvider) {
      return [];
    }

    return await this.attachmentProvider.getAttachmentsForPage(pageName);
  }

  /**
   * Get all attachments
   *
   * @returns {Promise<Array<object>>}
   */
  async getAllAttachments() {
    if (!this.attachmentProvider) {
      return [];
    }

    return await this.attachmentProvider.getAllAttachments();
  }

  /**
   * Delete an attachment
   *
   * @param {string} attachmentId - Attachment identifier
   * @param {object} context - WikiContext with user information
   * @returns {Promise<boolean>} Success status
   */
  async deleteAttachment(attachmentId, context) {
    if (!this.attachmentProvider) {
      throw new Error('Attachment provider not initialized');
    }

    // Check permission
    const allowed = await this.#checkPermission('attachment:delete', context);
    if (!allowed) {
      throw new Error('Permission denied: You do not have permission to delete attachments');
    }

    return await this.attachmentProvider.deleteAttachment(attachmentId);
  }

  /**
   * Update attachment metadata
   *
   * @param {string} attachmentId - Attachment identifier
   * @param {object} updates - Metadata updates
   * @param {object} context - WikiContext with user information
   * @returns {Promise<boolean>} Success status
   */
  async updateAttachmentMetadata(attachmentId, updates, context) {
    if (!this.attachmentProvider) {
      throw new Error('Attachment provider not initialized');
    }

    // Check permission (requires upload permission to edit metadata)
    const allowed = await this.#checkPermission('attachment:upload', context);
    if (!allowed) {
      throw new Error('Permission denied: You do not have permission to update attachment metadata');
    }

    // Update editor information
    if (context?.user) {
      updates.editor = {
        '@type': 'Person',
        'name': context.user.name || 'Unknown',
        'email': context.user.email || undefined
      };
    }

    return await this.attachmentProvider.updateAttachmentMetadata(attachmentId, updates);
  }

  /**
   * Check if an attachment exists
   *
   * @param {string} attachmentId - Attachment identifier
   * @returns {Promise<boolean>}
   */
  async attachmentExists(attachmentId) {
    if (!this.attachmentProvider) {
      return false;
    }

    return await this.attachmentProvider.attachmentExists(attachmentId);
  }

  /**
   * Get attachment URL
   *
   * @param {string} attachmentId - Attachment identifier
   * @returns {string} URL path
   */
  getAttachmentUrl(attachmentId) {
    return `/attachments/${attachmentId}`;
  }

  /**
   * Refresh attachment list (rescan storage)
   *
   * @returns {Promise<void>}
   */
  async refreshAttachmentList() {
    if (!this.attachmentProvider) {
      return;
    }

    await this.attachmentProvider.refreshAttachmentList();
    logger.info('📎 Attachment list refreshed');
  }

  /**
   * Backup manager data
   * Delegates to provider's backup method
   *
   * @returns {Promise<Object>}
   */
  async backup() {
    if (!this.attachmentProvider) {
      return {
        managerName: 'AttachmentManager',
        timestamp: new Date().toISOString(),
        data: null,
        note: 'No provider initialized'
      };
    }

    const providerBackup = await this.attachmentProvider.backup();

    return {
      managerName: 'AttachmentManager',
      timestamp: new Date().toISOString(),
      providerClass: this.providerClass,
      providerBackup: providerBackup
    };
  }

  /**
   * Restore manager data from backup
   * Delegates to provider's restore method
   *
   * @param {Object} backupData - Backup data from backup() method
   * @returns {Promise<void>}
   */
  async restore(backupData) {
    if (!backupData) {
      throw new Error('AttachmentManager: No backup data provided for restore');
    }

    if (!this.attachmentProvider) {
      throw new Error('AttachmentManager: Provider not initialized, cannot restore');
    }

    if (backupData.providerClass !== this.providerClass) {
      logger.warn(`📎 Provider mismatch: backup has ${backupData.providerClass}, current is ${this.providerClass}`);
    }

    if (backupData.providerBackup) {
      await this.attachmentProvider.restore(backupData.providerBackup);
      logger.info('📎 AttachmentManager restored from backup');
    }
  }

  /**
   * Shutdown the manager
   */
  async shutdown() {
    if (this.attachmentProvider) {
      await this.attachmentProvider.shutdown();
    }
    await super.shutdown();
    logger.info('📎 AttachmentManager shut down');
  }

  /**
   * Normalize provider name to PascalCase class name
   * @param {string} providerName - Lowercase provider name (e.g., 'basicattachmentprovider')
   * @returns {string} PascalCase class name (e.g., 'BasicAttachmentProvider')
   * @private
   */
  #normalizeProviderName(providerName) {
    if (!providerName) {
      throw new Error('Provider name cannot be empty');
    }

    // Convert to lowercase first to ensure consistency
    const lower = providerName.toLowerCase();

    // Handle special cases for known provider names
    const knownProviders = {
      'basicattachmentprovider': 'BasicAttachmentProvider',
      'databaseattachmentprovider': 'DatabaseAttachmentProvider',
      's3attachmentprovider': 'S3AttachmentProvider',
      'azureblobattachmentprovider': 'AzureBlobAttachmentProvider'
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
   * Format byte size to human-readable string
   * @param {number} bytes - Size in bytes
   * @returns {string} Formatted size (e.g., "10 MB")
   * @private
   */
  #formatSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}

module.exports = AttachmentManager;
