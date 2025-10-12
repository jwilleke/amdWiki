const BaseAttachmentProvider = require('./BaseAttachmentProvider');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const logger = require('../utils/logger');

/**
 * BasicAttachmentProvider - Filesystem-based attachment storage
 *
 * Implements attachment storage using filesystem with Schema.org CreativeWork metadata.
 * Attachments are stored in a shared directory structure, not tied to individual pages.
 * Page references are tracked via the "mentions" array in metadata.
 *
 * Based on JSPWiki's BasicAttachmentProvider:
 * https://github.com/apache/jspwiki/blob/master/jspwiki-main/src/main/java/org/apache/wiki/providers/BasicAttachmentProvider.java
 *
 * Features:
 * - Filesystem storage with SHA-256 content hashing
 * - Schema.org CreativeWork metadata format
 * - Shared storage model with page mentions tracking
 * - Automatic metadata persistence
 * - Backup/restore support
 */
class BasicAttachmentProvider extends BaseAttachmentProvider {
  constructor(engine) {
    super(engine);
    this.storageDirectory = null;
    this.metadataFile = null;
    this.attachmentMetadata = new Map(); // attachmentId -> Schema.org CreativeWork
    this.maxFileSize = 10 * 1024 * 1024; // 10MB default
    this.allowedMimeTypes = []; // Empty = allow all
  }

  /**
   * Initialize the provider
   * All configuration access via ConfigurationManager
   */
  async initialize() {
    const configManager = this.engine.getManager('ConfigurationManager');
    if (!configManager) {
      throw new Error('BasicAttachmentProvider requires ConfigurationManager');
    }

    // Get storage directory configuration (ALL LOWERCASE)
    const storagePath = configManager.getProperty(
      'amdwiki.attachment.provider.basic.storagedir',
      './data/attachments'
    );
    this.storageDirectory = path.isAbsolute(storagePath)
      ? storagePath
      : path.join(process.cwd(), storagePath);

    // Get metadata file location (ALL LOWERCASE)
    const metadataPath = configManager.getProperty(
      'amdwiki.attachment.metadatafile',
      './data/attachments/metadata.json'
    );
    this.metadataFile = path.isAbsolute(metadataPath)
      ? metadataPath
      : path.join(process.cwd(), metadataPath);

    // Get size limits and allowed types from shared config (ALL LOWERCASE)
    const maxSizeBytes = configManager.getProperty(
      'amdwiki.attachment.maxsize',
      10485760
    );
    this.maxFileSize = maxSizeBytes;

    const allowedTypesStr = configManager.getProperty(
      'amdwiki.attachment.allowedtypes',
      ''
    );
    this.allowedMimeTypes = allowedTypesStr
      ? allowedTypesStr.split(',').map(t => t.trim())
      : [];

    // Get provider-specific settings (ALL LOWERCASE)
    this.hashContent = configManager.getProperty(
      'amdwiki.attachment.provider.basic.hashcontent',
      true
    );
    this.hashMethod = configManager.getProperty(
      'amdwiki.attachment.provider.basic.hashmethod',
      'sha256'
    );

    // Ensure directories exist
    await fs.ensureDir(this.storageDirectory);
    await fs.ensureDir(path.dirname(this.metadataFile));

    logger.info(`[BasicAttachmentProvider] Storage directory: ${this.storageDirectory}`);
    logger.info(`[BasicAttachmentProvider] Metadata file: ${this.metadataFile}`);
    logger.info(`[BasicAttachmentProvider] Max file size: ${this.#formatSize(this.maxFileSize)}`);
    logger.info(`[BasicAttachmentProvider] Hash method: ${this.hashMethod}`);

    // Load metadata
    await this.#loadMetadata();

    this.initialized = true;
    logger.info(`[BasicAttachmentProvider] Initialized with ${this.attachmentMetadata.size} attachments.`);
  }

  /**
   * Parse size string like "10MB" to bytes
   * @param {string} sizeStr - Size string (e.g., "10MB", "5GB")
   * @returns {number} Size in bytes
   * @private
   */
  #parseSize(sizeStr) {
    const units = { B: 1, KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 };
    const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*([KMGT]?B)$/i);
    if (!match) return 10 * 1024 * 1024; // Default 10MB
    const [, num, unit] = match;
    return parseFloat(num) * (units[unit.toUpperCase()] || 1);
  }

  /**
   * Format bytes to human-readable size
   * @param {number} bytes - Size in bytes
   * @returns {string} Formatted size
   * @private
   */
  #formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }

  /**
   * Load metadata from JSON file
   * @private
   */
  async #loadMetadata() {
    try {
      if (!await fs.pathExists(this.metadataFile)) {
        this.attachmentMetadata = new Map();
        logger.info('[BasicAttachmentProvider] No existing metadata file, starting fresh');
        return;
      }

      const data = await fs.readFile(this.metadataFile, 'utf8');
      const json = JSON.parse(data);

      // Validate Schema.org format
      if (!json['@context'] || json['@context'] !== 'https://schema.org') {
        throw new Error('Invalid metadata file: missing or incorrect @context');
      }

      if (!json.attachments || !Array.isArray(json.attachments)) {
        throw new Error('Invalid metadata file: missing or invalid attachments array');
      }

      // Load into Map
      this.attachmentMetadata.clear();
      for (const attachment of json.attachments) {
        if (attachment.identifier) {
          this.attachmentMetadata.set(attachment.identifier, attachment);
        }
      }

      logger.info(`[BasicAttachmentProvider] Loaded ${this.attachmentMetadata.size} attachment metadata entries`);
    } catch (error) {
      logger.error('[BasicAttachmentProvider] Failed to load metadata:', error);
      this.attachmentMetadata = new Map();
    }
  }

  /**
   * Save metadata to JSON file
   * @private
   */
  async #saveMetadata() {
    try {
      const json = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        'name': 'amdWiki Attachments',
        'description': 'Metadata for all attachments in the wiki',
        'attachments': Array.from(this.attachmentMetadata.values())
      };

      await fs.writeFile(this.metadataFile, JSON.stringify(json, null, 2), 'utf8');
      logger.info('[BasicAttachmentProvider] Metadata saved successfully');
    } catch (error) {
      logger.error('[BasicAttachmentProvider] Failed to save metadata:', error);
      throw error;
    }
  }

  /**
   * Generate unique attachment ID using SHA-256 hash of content
   * @param {Buffer} buffer - File data
   * @returns {string} Attachment ID (hash)
   * @private
   */
  #generateAttachmentId(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Validate file against constraints
   * @param {object} fileInfo - File information
   * @private
   */
  #validateFile(fileInfo) {
    if (!fileInfo.size || fileInfo.size === 0) {
      throw new Error('File is empty');
    }

    if (fileInfo.size > this.maxFileSize) {
      throw new Error(`File too large. Maximum size: ${this.#formatSize(this.maxFileSize)}`);
    }

    // Check MIME type if restrictions are configured
    if (this.allowedMimeTypes.length > 0) {
      const isAllowed = this.allowedMimeTypes.some(pattern => {
        if (pattern.endsWith('/*')) {
          const prefix = pattern.slice(0, -2);
          return fileInfo.mimeType.startsWith(prefix);
        }
        return fileInfo.mimeType === pattern;
      });

      if (!isAllowed) {
        throw new Error(`File type '${fileInfo.mimeType}' not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`);
      }
    }
  }

  /**
   * Store an attachment with metadata
   * @param {Buffer} fileBuffer - File data
   * @param {object} fileInfo - { originalName, mimeType, size }
   * @param {object} metadata - Schema.org CreativeWork metadata
   * @param {object} user - User object { name, email }
   * @returns {Promise<object>} Complete attachment metadata
   */
  async storeAttachment(fileBuffer, fileInfo, metadata = {}, user = null) {
    // Validate file
    this.#validateFile(fileInfo);

    // Generate content-based ID
    const attachmentId = this.#generateAttachmentId(fileBuffer);

    // Check if attachment already exists (deduplication)
    const existing = this.attachmentMetadata.get(attachmentId);
    if (existing) {
      logger.info(`[BasicAttachmentProvider] Attachment already exists: ${attachmentId} (${fileInfo.originalName})`);
      return existing;
    }

    // Determine file extension from original name
    const ext = path.extname(fileInfo.originalName) || '';
    const fileName = `${attachmentId}${ext}`;
    const filePath = path.join(this.storageDirectory, fileName);

    // Write file to storage
    await fs.writeFile(filePath, fileBuffer);

    // Create Schema.org CreativeWork metadata
    const now = new Date().toISOString();
    const author = user ? {
      '@type': 'Person',
      'name': user.name || 'Unknown',
      'email': user.email || undefined
    } : undefined;

    const attachmentMetadata = {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      'identifier': attachmentId,
      'name': fileInfo.originalName,
      'description': metadata.description || '',
      'author': author,
      'editor': author, // Initially same as author
      'dateCreated': now,
      'dateModified': now,
      'encodingFormat': fileInfo.mimeType,
      'contentSize': fileInfo.size,
      'url': `/attachments/${attachmentId}`,
      'storageLocation': filePath,
      'isFamilyFriendly': metadata.isFamilyFriendly !== undefined ? metadata.isFamilyFriendly : true,
      'isBasedOn': metadata.isBasedOn || undefined,
      'mentions': [] // Array of pages using this attachment
    };

    // Store metadata
    this.attachmentMetadata.set(attachmentId, attachmentMetadata);
    await this.#saveMetadata();

    logger.info(`[BasicAttachmentProvider] Stored attachment: ${fileInfo.originalName} (${attachmentId})`);
    return attachmentMetadata;
  }

  /**
   * Get attachment file and metadata
   * @param {string} attachmentId - Attachment identifier
   * @returns {Promise<{buffer: Buffer, metadata: object}|null>}
   */
  async getAttachment(attachmentId) {
    const metadata = this.attachmentMetadata.get(attachmentId);
    if (!metadata) {
      logger.warn(`[BasicAttachmentProvider] Attachment not found: ${attachmentId}`);
      return null;
    }

    try {
      const buffer = await fs.readFile(metadata.storageLocation);
      return { buffer, metadata };
    } catch (error) {
      logger.error(`[BasicAttachmentProvider] Failed to read attachment file: ${attachmentId}`, error);
      return null;
    }
  }

  /**
   * Get attachment metadata only
   * @param {string} attachmentId - Attachment identifier
   * @returns {Promise<object|null>}
   */
  async getAttachmentMetadata(attachmentId) {
    return this.attachmentMetadata.get(attachmentId) || null;
  }

  /**
   * Update attachment metadata
   * @param {string} attachmentId - Attachment identifier
   * @param {object} updates - Metadata updates
   * @returns {Promise<boolean>}
   */
  async updateAttachmentMetadata(attachmentId, updates) {
    const metadata = this.attachmentMetadata.get(attachmentId);
    if (!metadata) {
      logger.warn(`[BasicAttachmentProvider] Cannot update - attachment not found: ${attachmentId}`);
      return false;
    }

    // Update metadata
    Object.assign(metadata, updates);
    metadata.dateModified = new Date().toISOString();

    this.attachmentMetadata.set(attachmentId, metadata);
    await this.#saveMetadata();

    logger.info(`[BasicAttachmentProvider] Updated metadata for: ${attachmentId}`);
    return true;
  }

  /**
   * Delete an attachment
   * @param {string} attachmentId - Attachment identifier
   * @returns {Promise<boolean>}
   */
  async deleteAttachment(attachmentId) {
    const metadata = this.attachmentMetadata.get(attachmentId);
    if (!metadata) {
      logger.warn(`[BasicAttachmentProvider] Cannot delete - attachment not found: ${attachmentId}`);
      return false;
    }

    try {
      // Delete file
      await fs.unlink(metadata.storageLocation);

      // Remove metadata
      this.attachmentMetadata.delete(attachmentId);
      await this.#saveMetadata();

      logger.info(`[BasicAttachmentProvider] Deleted attachment: ${attachmentId} (${metadata.name})`);
      return true;
    } catch (error) {
      logger.error(`[BasicAttachmentProvider] Failed to delete attachment: ${attachmentId}`, error);
      return false;
    }
  }

  /**
   * Check if attachment exists
   * @param {string} attachmentId - Attachment identifier
   * @returns {Promise<boolean>}
   */
  async attachmentExists(attachmentId) {
    return this.attachmentMetadata.has(attachmentId);
  }

  /**
   * Get all attachments metadata
   * @returns {Promise<Array<object>>}
   */
  async getAllAttachments() {
    return Array.from(this.attachmentMetadata.values())
      .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
  }

  /**
   * Get attachments used by a specific page
   * @param {string} pageName - Page name/title
   * @returns {Promise<Array<object>>}
   */
  async getAttachmentsForPage(pageName) {
    const attachments = [];
    for (const metadata of this.attachmentMetadata.values()) {
      if (metadata.mentions && Array.isArray(metadata.mentions)) {
        const hasPage = metadata.mentions.some(mention =>
          mention.name === pageName || mention.url?.includes(pageName)
        );
        if (hasPage) {
          attachments.push(metadata);
        }
      }
    }
    return attachments.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
  }

  /**
   * Refresh attachment list (rescan storage)
   * @returns {Promise<void>}
   */
  async refreshAttachmentList() {
    await this.#loadMetadata();
    logger.info(`[BasicAttachmentProvider] Refreshed attachment list`);
  }

  /**
   * Get provider information
   * @returns {object}
   */
  getProviderInfo() {
    return {
      name: 'BasicAttachmentProvider',
      version: '1.0.0',
      description: 'Filesystem storage with Schema.org metadata',
      features: [
        'content-deduplication',
        'schema-org-metadata',
        'shared-storage',
        'page-mentions-tracking',
        'mime-type-filtering',
        'size-limits'
      ]
    };
  }

  /**
   * Backup provider data
   * @returns {Promise<object>}
   */
  async backup() {
    return {
      providerName: 'BasicAttachmentProvider',
      timestamp: new Date().toISOString(),
      metadataFile: this.metadataFile,
      storageDirectory: this.storageDirectory,
      attachments: Array.from(this.attachmentMetadata.entries())
    };
  }

  /**
   * Restore provider data from backup
   * @param {object} backupData - Backup data
   * @returns {Promise<void>}
   */
  async restore(backupData) {
    if (!backupData || !backupData.attachments) {
      throw new Error('Invalid backup data for BasicAttachmentProvider');
    }

    logger.info(`[BasicAttachmentProvider] Restoring ${backupData.attachments.length} attachments from backup`);

    // Restore metadata Map
    this.attachmentMetadata.clear();
    for (const [id, metadata] of backupData.attachments) {
      this.attachmentMetadata.set(id, metadata);
    }

    // Save to file
    await this.#saveMetadata();

    logger.info('[BasicAttachmentProvider] Restore completed successfully');
  }
}

module.exports = BasicAttachmentProvider;
