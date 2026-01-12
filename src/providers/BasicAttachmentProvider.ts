import BaseAttachmentProvider, { FileInfo, User, AttachmentResult } from './BaseAttachmentProvider';
import { AttachmentMetadata } from '../types';
import fs from 'fs-extra';
import * as path from 'path';
import * as crypto from 'crypto';
import logger from '../utils/logger';
import type { WikiEngine } from '../types/WikiEngine';
import type ConfigurationManager from '../managers/ConfigurationManager';

/**
 * Schema.org Person metadata
 */
interface SchemaPerson {
  '@type': 'Person';
  name: string;
  email?: string;
}

/**
 * Schema.org mention reference
 */
interface SchemaMention {
  '@type'?: 'Thing';
  name?: string;
  url?: string;
}

/**
 * Schema.org CreativeWork metadata for attachments
 */
interface SchemaCreativeWork {
  '@context': 'https://schema.org';
  '@type': 'CreativeWork';
  identifier: string;
  name: string;
  description?: string;
  author?: SchemaPerson;
  editor?: SchemaPerson;
  dateCreated: string;
  dateModified: string;
  encodingFormat: string;
  contentSize: number;
  url: string;
  storageLocation: string;
  isFamilyFriendly?: boolean;
  isBasedOn?: string;
  mentions: SchemaMention[];
}

/**
 * Metadata file structure
 */
interface MetadataFile {
  '@context': 'https://schema.org';
  '@type': 'ItemList';
  name: string;
  description: string;
  attachments: SchemaCreativeWork[];
}

/**
 * Backup data structure
 */
interface BackupData extends Record<string, unknown> {
  providerName: string;
  timestamp: string;
  metadataFile: string;
  storageDirectory: string;
  attachments: Array<[string, SchemaCreativeWork]>;
}

/**
 * Provider information
 */
interface ProviderInfo {
  name: string;
  version: string;
  description: string;
  features: string[];
}

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
  private storageDirectory: string | null;
  private metadataFile: string | null;
  private attachmentMetadata: Map<string, SchemaCreativeWork>;
  private maxFileSize: number;
  private allowedMimeTypes: string[];
  private hashMethod: string;

  constructor(engine: WikiEngine) {
    super(engine);
    this.storageDirectory = null;
    this.metadataFile = null;
    this.attachmentMetadata = new Map();
    this.maxFileSize = 10 * 1024 * 1024; // 10MB default
    this.allowedMimeTypes = []; // Empty = allow all
    this.hashMethod = 'sha256';
  }

  /**
   * Initialize the provider
   * All configuration access via ConfigurationManager
   */
  async initialize(): Promise<void> {
    const configManager = this.engine.getManager<ConfigurationManager>('ConfigurationManager');
    if (!configManager) {
      throw new Error('BasicAttachmentProvider requires ConfigurationManager');
    }

    // Get storage directory configuration (ALL LOWERCASE)
    const storagePath: string = configManager.getProperty(
      'amdwiki.attachment.provider.basic.storagedir',
      './data/attachments'
    ) as string;
    this.storageDirectory = path.isAbsolute(storagePath)
      ? storagePath
      : path.join(process.cwd(), storagePath);

    // Get metadata file location (ALL LOWERCASE)
    const metadataPath: string = configManager.getProperty(
      'amdwiki.attachment.metadatafile',
      './data/attachments/metadata.json'
    ) as string;
    this.metadataFile = path.isAbsolute(metadataPath)
      ? metadataPath
      : path.join(process.cwd(), metadataPath);

    // Get size limits and allowed types from shared config (ALL LOWERCASE)
    const maxSizeBytes: number = configManager.getProperty(
      'amdwiki.attachment.maxsize',
      10485760
    ) as number;
    this.maxFileSize = maxSizeBytes;

    const allowedTypesStr: string = configManager.getProperty(
      'amdwiki.attachment.allowedtypes',
      ''
    ) as string;
    this.allowedMimeTypes = allowedTypesStr
      ? allowedTypesStr.split(',').map((t: string) => t.trim())
      : [];

    // Get provider-specific settings (ALL LOWERCASE)
    this.hashMethod = configManager.getProperty(
      'amdwiki.attachment.provider.basic.hashmethod',
      'sha256'
    ) as string;

    // Ensure directories exist
    await fs.ensureDir(this.storageDirectory);
    await fs.ensureDir(path.dirname(this.metadataFile));

    logger.info(`[BasicAttachmentProvider] Storage directory: ${this.storageDirectory}`);
    logger.info(`[BasicAttachmentProvider] Metadata file: ${this.metadataFile}`);
    logger.info(`[BasicAttachmentProvider] Max file size: ${this.formatSize(this.maxFileSize)}`);
    logger.info(`[BasicAttachmentProvider] Hash method: ${this.hashMethod}`);

    // Load metadata
    await this.loadMetadata();

    this.initialized = true;
    logger.info(`[BasicAttachmentProvider] Initialized with ${this.attachmentMetadata.size} attachments.`);
  }


  /**
   * Format bytes to human-readable size
   * @param bytes - Size in bytes
   * @returns Formatted size
   * @private
   */
  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }

  /**
   * Load metadata from JSON file
   * @private
   */
  private async loadMetadata(): Promise<void> {
    try {
      if (!this.metadataFile) {
        throw new Error('Metadata file path not initialized');
      }

      if (!await fs.pathExists(this.metadataFile)) {
        this.attachmentMetadata = new Map();
        logger.info('[BasicAttachmentProvider] No existing metadata file, starting fresh');
        return;
      }

      const data = await fs.readFile(this.metadataFile, 'utf8' as BufferEncoding);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- JSON.parse returns any
      const json: MetadataFile = JSON.parse(data);

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
    } catch (error: unknown) {
      logger.error('[BasicAttachmentProvider] Failed to load metadata:', error);
      this.attachmentMetadata = new Map();
    }
  }

  /**
   * Save metadata to JSON file
   * @private
   */
  private async saveMetadata(): Promise<void> {
    try {
      if (!this.metadataFile) {
        throw new Error('Metadata file path not initialized');
      }

      const json: MetadataFile = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        'name': 'amdWiki Attachments',
        'description': 'Metadata for all attachments in the wiki',
        'attachments': Array.from(this.attachmentMetadata.values())
      };

      await fs.writeFile(this.metadataFile, JSON.stringify(json, null, 2), 'utf8' as BufferEncoding);
      logger.info('[BasicAttachmentProvider] Metadata saved successfully');
    } catch (error: unknown) {
      logger.error('[BasicAttachmentProvider] Failed to save metadata:', error);
      throw error;
    }
  }

  /**
   * Generate unique attachment ID using SHA-256 hash of content
   * @param buffer - File data
   * @returns Attachment ID (hash)
   * @private
   */
  private generateAttachmentId(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Validate file against constraints
   * @param fileInfo - File information
   * @private
   */
  private validateFile(fileInfo: FileInfo): void {
    if (!fileInfo.size || fileInfo.size === 0) {
      throw new Error('File is empty');
    }

    if (fileInfo.size > this.maxFileSize) {
      throw new Error(`File too large. Maximum size: ${this.formatSize(this.maxFileSize)}`);
    }

    // Check MIME type if restrictions are configured
    if (this.allowedMimeTypes.length > 0) {
      const isAllowed = this.allowedMimeTypes.some((pattern: string) => {
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
   * Store an attachment with metadata (internal method using Schema.org format)
   * @param fileBuffer - File data
   * @param fileInfo - { originalName, mimeType, size }
   * @param metadata - Schema.org CreativeWork metadata
   * @param user - User object { name, email }
   * @returns Complete attachment metadata
   * @private
   */
  private async storeAttachmentInternal(
    fileBuffer: Buffer,
    fileInfo: FileInfo,
    metadata: Partial<SchemaCreativeWork> = {},
    user: User | null = null
  ): Promise<SchemaCreativeWork> {
    // Validate file
    this.validateFile(fileInfo);

    // Generate content-based ID
    const attachmentId = this.generateAttachmentId(fileBuffer);

    // Check if attachment already exists (deduplication)
    const existing = this.attachmentMetadata.get(attachmentId);
    if (existing) {
      logger.info(`[BasicAttachmentProvider] Attachment already exists: ${attachmentId} (${fileInfo.originalName})`);
      return existing;
    }

    if (!this.storageDirectory) {
      throw new Error('Storage directory not initialized');
    }

    // Determine file extension from original name
    const ext = path.extname(fileInfo.originalName) || '';
    const fileName = `${attachmentId}${ext}`;
    const filePath = path.join(this.storageDirectory, fileName);

    // Write file to storage
    await fs.writeFile(filePath, fileBuffer);

    // Create Schema.org CreativeWork metadata
    const now = new Date().toISOString();
    const author: SchemaPerson | undefined = user ? {
      '@type': 'Person',
      'name': user.username || user.email || 'Unknown',
      'email': user.email
    } : undefined;

    const attachmentMetadata: SchemaCreativeWork = {
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
      'isBasedOn': metadata.isBasedOn,
      'mentions': [] // Array of pages using this attachment
    };

    // Store metadata
    this.attachmentMetadata.set(attachmentId, attachmentMetadata);
    await this.saveMetadata();

    logger.info(`[BasicAttachmentProvider] Stored attachment: ${fileInfo.originalName} (${attachmentId})`);
    return attachmentMetadata;
  }

  /**
   * Store an attachment with metadata (BaseAttachmentProvider interface method)
   * @param fileBuffer - File data
   * @param fileInfo - { originalName, mimeType, size }
   * @param metadata - Attachment metadata
   * @param user - User object
   * @returns Attachment metadata
   */
  async storeAttachment(
    fileBuffer: Buffer,
    fileInfo: FileInfo,
    metadata: Partial<AttachmentMetadata> = {},
    user: User | null = null
  ): Promise<AttachmentMetadata> {
    const schemaMetadata = await this.storeAttachmentInternal(fileBuffer, fileInfo, metadata as Partial<SchemaCreativeWork>, user);

    // Convert Schema.org format to AttachmentMetadata
    const attachmentMetadata: AttachmentMetadata = {
      id: schemaMetadata.identifier,
      filename: schemaMetadata.name,
      pageUuid: metadata.pageUuid || '',
      mimeType: schemaMetadata.encodingFormat,
      size: schemaMetadata.contentSize,
      uploadedAt: schemaMetadata.dateCreated,
      uploadedBy: schemaMetadata.author?.name || 'Unknown',
      filePath: schemaMetadata.storageLocation,
      description: schemaMetadata.description
    };

    // Add page mention if pageUuid is provided
    if (metadata.pageUuid) {
      const pageMention: SchemaMention = {
        '@type': 'Thing',
        name: metadata.pageUuid,
        url: `/pages/${metadata.pageUuid}`
      };

      if (!schemaMetadata.mentions.some(m => m.name === metadata.pageUuid)) {
        schemaMetadata.mentions.push(pageMention);
        await this.saveMetadata();
      }
    }

    return attachmentMetadata;
  }

  /**
   * Save attachment (AttachmentProvider interface method - alternative signature)
   * @param pageUuid - Page UUID
   * @param filename - Filename
   * @param buffer - File buffer
   * @param metadata - Additional metadata
   * @returns Attachment metadata
   */
  async saveAttachment(
    pageUuid: string,
    filename: string,
    buffer: Buffer,
    metadata: Record<string, unknown> = {}
  ): Promise<AttachmentMetadata> {
    const fileInfo: FileInfo = {
      originalName: filename,
      mimeType: (metadata.mimeType as string) || 'application/octet-stream',
      size: buffer.length
    };

    const user: User | null = metadata.uploadedBy ? {
      id: metadata.uploadedBy as string,
      username: metadata.uploadedBy as string,
      email: metadata.email as string
    } : null;

    const schemaMetadata = await this.storeAttachmentInternal(buffer, fileInfo, metadata, user);

    // Convert Schema.org format to AttachmentMetadata
    const attachmentMetadata: AttachmentMetadata = {
      id: schemaMetadata.identifier,
      filename: schemaMetadata.name,
      pageUuid: pageUuid,
      mimeType: schemaMetadata.encodingFormat,
      size: schemaMetadata.contentSize,
      uploadedAt: schemaMetadata.dateCreated,
      uploadedBy: schemaMetadata.author?.name || 'Unknown',
      filePath: schemaMetadata.storageLocation,
      description: schemaMetadata.description
    };

    // Add page mention
    const pageMention: SchemaMention = {
      '@type': 'Thing',
      name: pageUuid,
      url: `/pages/${pageUuid}`
    };

    if (!schemaMetadata.mentions.some(m => m.name === pageUuid)) {
      schemaMetadata.mentions.push(pageMention);
      await this.saveMetadata();
    }

    return attachmentMetadata;
  }

  /**
   * Get attachment file and metadata
   * @param attachmentId - Attachment identifier
   * @returns File buffer and metadata or null
   */
  async getAttachment(attachmentId: string): Promise<AttachmentResult | null> {
    const metadata = this.attachmentMetadata.get(attachmentId);
    if (!metadata) {
      logger.warn(`[BasicAttachmentProvider] Attachment not found: ${attachmentId}`);
      return null;
    }

    try {
      const buffer = await fs.readFile(metadata.storageLocation);

      // Convert to AttachmentResult with AttachmentMetadata format
      const attachmentMetadata: AttachmentMetadata = {
        id: metadata.identifier,
        filename: metadata.name,
        pageUuid: metadata.mentions[0]?.name || '',
        mimeType: metadata.encodingFormat,
        size: metadata.contentSize,
        uploadedAt: metadata.dateCreated,
        uploadedBy: metadata.author?.name || 'Unknown',
        filePath: metadata.storageLocation,
        description: metadata.description
      };

      return { buffer, metadata: attachmentMetadata };
    } catch (error: unknown) {
      logger.error(`[BasicAttachmentProvider] Failed to read attachment file: ${attachmentId}`, error);
      return null;
    }
  }

  /**
   * Get attachment metadata only
   * @param attachmentId - Attachment identifier
   * @returns Attachment metadata or null
   */
  getAttachmentMetadata(attachmentId: string): Promise<AttachmentMetadata | null> {
    const schemaMetadata = this.attachmentMetadata.get(attachmentId);
    if (!schemaMetadata) {
      return Promise.resolve(null);
    }

    // Convert to AttachmentMetadata format
    const attachmentMetadata: AttachmentMetadata = {
      id: schemaMetadata.identifier,
      filename: schemaMetadata.name,
      pageUuid: schemaMetadata.mentions[0]?.name || '',
      mimeType: schemaMetadata.encodingFormat,
      size: schemaMetadata.contentSize,
      uploadedAt: schemaMetadata.dateCreated,
      uploadedBy: schemaMetadata.author?.name || 'Unknown',
      filePath: schemaMetadata.storageLocation,
      description: schemaMetadata.description
    };

    return Promise.resolve(attachmentMetadata);
  }

  /**
   * Update attachment metadata
   * @param attachmentId - Attachment identifier
   * @param updates - Metadata updates
   * @returns Success status
   */
  async updateAttachmentMetadata(attachmentId: string, updates: Partial<AttachmentMetadata>): Promise<boolean> {
    const metadata = this.attachmentMetadata.get(attachmentId);
    if (!metadata) {
      logger.warn(`[BasicAttachmentProvider] Cannot update - attachment not found: ${attachmentId}`);
      return false;
    }

    // Update metadata
    if (updates.description !== undefined) {
      metadata.description = updates.description;
    }
    if (updates.filename !== undefined) {
      metadata.name = updates.filename;
    }
    metadata.dateModified = new Date().toISOString();

    this.attachmentMetadata.set(attachmentId, metadata);
    await this.saveMetadata();

    logger.info(`[BasicAttachmentProvider] Updated metadata for: ${attachmentId}`);
    return true;
  }

  /**
   * Delete an attachment
   * @param attachmentId - Attachment identifier
   * @returns True if deleted, false if not found
   */
  async deleteAttachment(attachmentId: string): Promise<boolean> {
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
      await this.saveMetadata();

      logger.info(`[BasicAttachmentProvider] Deleted attachment: ${attachmentId} (${metadata.name})`);
      return true;
    } catch (error: unknown) {
      logger.error(`[BasicAttachmentProvider] Failed to delete attachment: ${attachmentId}`, error);
      return false;
    }
  }

  /**
   * Check if attachment exists
   * @param attachmentId - Attachment identifier
   * @returns True if exists
   */
  attachmentExists(attachmentId: string): Promise<boolean> {
    return Promise.resolve(this.attachmentMetadata.has(attachmentId));
  }

  /**
   * Get all attachments metadata
   * @returns Array of attachment metadata
   */
  getAllAttachments(): Promise<AttachmentMetadata[]> {
    const schemaAttachments = Array.from(this.attachmentMetadata.values())
      .sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());

    return Promise.resolve(schemaAttachments.map((schema): AttachmentMetadata => ({
      id: schema.identifier,
      filename: schema.name,
      pageUuid: schema.mentions[0]?.name || '',
      mimeType: schema.encodingFormat,
      size: schema.contentSize,
      uploadedAt: schema.dateCreated,
      uploadedBy: schema.author?.name || 'Unknown',
      filePath: schema.storageLocation,
      description: schema.description
    })));
  }

  /**
   * Get attachments used by a specific page
   * @param pageName - Page name/title
   * @returns Array of attachment metadata
   */
  getAttachmentsForPage(pageName: string): Promise<AttachmentMetadata[]> {
    const attachments: SchemaCreativeWork[] = [];
    const allMetadata = Array.from(this.attachmentMetadata.values());
    for (const metadata of allMetadata) {
      if (metadata.mentions && Array.isArray(metadata.mentions)) {
        const hasPage = metadata.mentions.some((mention: SchemaMention) =>
          mention.name === pageName || mention.url?.includes(pageName)
        );
        if (hasPage) {
          attachments.push(metadata);
        }
      }
    }

    const sortedAttachments = attachments.sort(
      (a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
    );

    return Promise.resolve(sortedAttachments.map((schema): AttachmentMetadata => ({
      id: schema.identifier,
      filename: schema.name,
      pageUuid: pageName,
      mimeType: schema.encodingFormat,
      size: schema.contentSize,
      uploadedAt: schema.dateCreated,
      uploadedBy: schema.author?.name || 'Unknown',
      filePath: schema.storageLocation,
      description: schema.description
    })));
  }

  /**
   * List attachments for a page (AttachmentProvider interface method)
   * @param pageUuid - Page UUID
   * @returns Array of attachment metadata
   */
  async listAttachments(pageUuid: string): Promise<AttachmentMetadata[]> {
    return this.getAttachmentsForPage(pageUuid);
  }

  /**
   * Delete all attachments for a page
   * @param pageUuid - Page UUID
   * @returns Number of attachments deleted
   */
  async deletePageAttachments(pageUuid: string): Promise<number> {
    const attachments = await this.getAttachmentsForPage(pageUuid);
    let deleted = 0;

    for (const attachment of attachments) {
      const success = await this.deleteAttachment(attachment.id);
      if (success) {
        deleted++;
      }
    }

    return deleted;
  }

  /**
   * Refresh attachment list (rescan storage)
   * @returns Promise that resolves when complete
   */
  async refreshAttachmentList(): Promise<void> {
    await this.loadMetadata();
    logger.info('[BasicAttachmentProvider] Refreshed attachment list');
  }

  /**
   * Get provider information
   * @returns Provider metadata
   */
  getProviderInfo(): ProviderInfo {
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
   * @returns Backup data
   */
  backup(): Promise<BackupData> {
    if (!this.metadataFile || !this.storageDirectory) {
      return Promise.reject(new Error('Provider not properly initialized'));
    }

    return Promise.resolve({
      providerName: 'BasicAttachmentProvider',
      timestamp: new Date().toISOString(),
      metadataFile: this.metadataFile,
      storageDirectory: this.storageDirectory,
      attachments: Array.from(this.attachmentMetadata.entries())
    });
  }

  /**
   * Restore provider data from backup
   * @param backupData - Backup data
   * @returns Promise that resolves when complete
   */
  async restore(backupData: Record<string, unknown>): Promise<void> {
    if (!backupData || !backupData.attachments) {
      throw new Error('Invalid backup data for BasicAttachmentProvider');
    }

    const typedBackupData = backupData as BackupData;

    logger.info(`[BasicAttachmentProvider] Restoring ${typedBackupData.attachments.length} attachments from backup`);

    // Restore metadata Map
    this.attachmentMetadata.clear();
    for (const [id, metadata] of typedBackupData.attachments) {
      this.attachmentMetadata.set(id, metadata);
    }

    // Save to file
    await this.saveMetadata();

    logger.info('[BasicAttachmentProvider] Restore completed successfully');
  }
}

export default BasicAttachmentProvider;

// CommonJS compatibility
module.exports = BasicAttachmentProvider;
