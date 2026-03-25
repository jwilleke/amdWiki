import BaseManager, { BackupData } from './BaseManager';
import logger from '../utils/logger';
import type { WikiEngine } from '../types/WikiEngine';
import type ConfigurationManager from './ConfigurationManager';
import type PageManager from './PageManager';

/**
 * Minimal interface for MediaManager — avoids a circular import.
 * Only the method used by resolveAttachmentSrc() is declared here.
 */
interface MediaManagerInterface {
  findByFilename(filename: string): Promise<{ id: string; mimeType: string } | null>;
}

/**
 * Base attachment provider interface
 */
interface BaseAttachmentProvider {
  initialize(): Promise<void>;
  storeAttachment(fileBuffer: Buffer, fileInfo: FileInfo, metadata: AttachmentMetadataInput, user: User | null): Promise<AttachmentMetadata>;
  getAttachment(attachmentId: string): Promise<{ buffer: Buffer; metadata: AttachmentMetadata } | null>;
  getAttachmentMetadata(attachmentId: string): Promise<AttachmentMetadata | null>;
  getAttachmentsForPage(pageName: string): Promise<AttachmentMetadata[]>;
  getAttachmentByFilename(filename: string): Promise<AttachmentMetadata | null>;
  getAllAttachments(): Promise<AttachmentMetadata[]>;
  deleteAttachment(attachmentId: string): Promise<boolean>;
  updateAttachmentMetadata(attachmentId: string, updates: Partial<AttachmentMetadata>): Promise<boolean>;
  attachmentExists(attachmentId: string): Promise<boolean>;
  refreshAttachmentList(): Promise<void>;
  backup(): Promise<unknown>;
  restore(backupData: unknown): Promise<void>;
  shutdown(): Promise<void>;
  getProviderInfo(): { features: string[] };
}

/**
 * File information interface
 */
export interface FileInfo {
  originalName: string;
  mimeType: string;
  size: number;
}

/**
 * Upload options interface
 */
export interface UploadOptions {
  pageName?: string;
  description?: string;
  context?: UserContext;
  /** WikiContext for the current request — used to resolve page privacy */
  wikiContext?: import('../context/WikiContext').default;
}

/**
 * User context for permission checks
 */
export interface UserContext {
  username?: string;
  name?: string;
  email?: string;
  isAuthenticated?: boolean;
  roles?: string[];
  user?: User;
}

/**
 * User object interface
 */
export interface User {
  name: string;
  email?: string;
}

/**
 * Mention object (WebPage reference)
 */
export interface Mention {
  '@type': string;
  name: string;
  url: string;
}

/**
 * Attachment metadata interface
 */
export interface AttachmentMetadata {
  identifier: string;
  name?: string;
  url?: string;
  encodingFormat?: string;
  description?: string;
  isFamilyFriendly?: boolean;
  mentions?: Mention[];
  editor?: {
    '@type': string;
    name: string;
    email?: string;
  };
  [key: string]: unknown;
}

/**
 * Attachment metadata input (for new uploads)
 */
export interface AttachmentMetadataInput {
  description: string;
  isFamilyFriendly: boolean;
}

/**
 * Attachment backup data
 */
export interface AttachmentBackupData extends BackupData {
  providerClass: string | null;
  providerBackup?: unknown;
  data?: null;
}

/**
 * AttachmentManager - Manages file attachments for wiki pages
 *
 * Following JSPWiki's AttachmentManager pattern, this manager:
 * - Delegates storage to pluggable attachment providers
 * - Enforces permissions via PolicyManager
 * - Tracks attachment-page relationships
 * - Provides high-level attachment operations
 *
 * @class AttachmentManager
 * @extends BaseManager
 *
 * @property {BaseAttachmentProvider|null} attachmentProvider - The active attachment provider
 * @property {string|null} providerClass - The class name of the loaded provider
 *
 * @see {@link BaseManager} for base functionality
 * @see {@link BasicAttachmentProvider} for default provider implementation
 *
 * @example
 * const attachmentManager = engine.getManager('AttachmentManager');
 * await attachmentManager.attachFile('Main', fileBuffer, 'document.pdf');
 *
 * Based on:
 * https://github.com/apache/jspwiki/blob/master/jspwiki-main/src/main/java/org/apache/wiki/attachment/AttachmentManager.java
 */
class AttachmentManager extends BaseManager {
  private attachmentProvider: BaseAttachmentProvider | null;
  private providerClass: string | null;
  private maxSize!: number;
  private allowedTypes!: string;

  /**
   * Creates a new AttachmentManager instance
   *
   * @constructor
   * @param {WikiEngine} engine - The wiki engine instance
   */
  constructor(engine: WikiEngine) {
    super(engine);
    this.attachmentProvider = null;
    this.providerClass = null;
  }

  /**
   * Initialize AttachmentManager and load the configured provider
   *
   * @async
   * @param {Record<string, unknown>} [config={}] - Configuration object (unused, reads from ConfigurationManager)
   * @returns {Promise<void>}
   * @throws {Error} If ConfigurationManager is not available or provider fails to load
   */
  async initialize(config: Record<string, unknown> = {}): Promise<void> {
    await super.initialize(config);

    const configManager = this.engine.getManager<ConfigurationManager>('ConfigurationManager');
    if (!configManager) {
      throw new Error('AttachmentManager requires ConfigurationManager');
    }

    // Check if attachments are enabled (ALL LOWERCASE)
    const attachmentsEnabled = configManager.getProperty('ngdpbase.attachment.enabled', true) as boolean;
    if (!attachmentsEnabled) {
      logger.info('📎 AttachmentManager: Attachments disabled by configuration');
      return;
    }

    // Load provider with fallback (ALL LOWERCASE)
    const defaultProvider = configManager.getProperty('ngdpbase.attachment.provider.default', 'basicattachmentprovider') as string;
    const providerName = configManager.getProperty('ngdpbase.attachment.provider', defaultProvider) as string;

    // Normalize provider name to PascalCase for class loading
    // basicattachmentprovider -> BasicAttachmentProvider
    this.providerClass = this.normalizeProviderName(providerName);

    // Load shared attachment settings
    this.maxSize = configManager.getProperty('ngdpbase.attachment.maxsize', 10485760) as number;
    this.allowedTypes = configManager.getProperty('ngdpbase.attachment.allowedtypes', 'image/*,text/*,application/pdf') as string;

    logger.info(`📎 Loading attachment provider: ${providerName} (${this.providerClass})`);

    // Load and initialize provider
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment -- Dynamic provider loading
      const ProviderClass = require(`../providers/${this.providerClass}`);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- Dynamic provider instantiation
      this.attachmentProvider = new ProviderClass(this.engine) as BaseAttachmentProvider;
      await this.attachmentProvider.initialize();

      logger.info(`📎 AttachmentManager initialized with ${this.providerClass}`);
      logger.info(`📎 Max attachment size: ${this.formatSize(this.maxSize)}`);
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
   * @returns {BaseAttachmentProvider | null} Current provider instance
   */
  getCurrentAttachmentProvider(): BaseAttachmentProvider | null {
    return this.attachmentProvider;
  }

  /**
   * Check permission for attachment operation
   * Any authenticated user can upload/delete attachments
   * @param {string} action - Action to check (attachment:upload, attachment:delete)
   * @param {UserContext} userContext - User context with username and roles
   * @returns {Promise<boolean>} True if allowed
   * @private
   */
  // eslint-disable-next-line @typescript-eslint/require-await -- Implements BaseManager async interface
  private async checkPermission(action: string, userContext?: UserContext): Promise<boolean> {
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
   * @param {FileInfo} fileInfo - { originalName, mimeType, size }
   * @param {UploadOptions} options - Upload options
   * @param {string} options.pageName - Page to attach to (optional)
   * @param {string} options.description - File description
   * @param {UserContext} options.context - WikiContext with user information
   * @returns {Promise<AttachmentMetadata>} Attachment metadata
   */
  async uploadAttachment(fileBuffer: Buffer, fileInfo: FileInfo, options: UploadOptions = {}): Promise<AttachmentMetadata> {
    if (!this.attachmentProvider) {
      throw new Error('Attachment provider not initialized');
    }

    // Check permission
    const allowed = await this.checkPermission('attachment:upload', options.context);
    if (!allowed) {
      throw new Error('Permission denied: You do not have permission to upload attachments');
    }

    // Extract user info from context (context is the full userContext object)
    const user = options.context
      ? {
        name: options.context.username || options.context.name || 'Unknown',
        email: options.context.email || undefined
      }
      : null;

    // Resolve page privacy from the linked page's index entry
    const pageName = options.pageName;
    let isPrivatePage = false;
    let pageCreator: string | undefined;
    if (pageName) {
      try {
        const pageManager = this.engine.getManager<PageManager>('PageManager');
        const page = pageManager ? await pageManager.getPage(pageName) : null;
        // page metadata is dynamic
        const indexEntry = page?.metadata?.['index-entry'] as { location?: string; creator?: string } | undefined;
        if (indexEntry?.location === 'private') {
          isPrivatePage = true;
          pageCreator = indexEntry.creator;
        }
      } catch (err) {
        logger.warn(`📎 Could not resolve page privacy for "${pageName}": ${String(err)}`);
      }
    }

    // Create metadata (include privacy flags for provider)
    const metadata: AttachmentMetadataInput & { isPrivatePage?: boolean; pageCreator?: string } = {
      description: options.description || '',
      isFamilyFriendly: true,
      isPrivatePage,
      pageCreator
    };

    // Store attachment via provider
    const attachmentMetadata = await this.attachmentProvider.storeAttachment(fileBuffer, fileInfo, metadata, user);

    // If pageName provided, add to mentions
    if (options.pageName) {
      await this.attachToPage(attachmentMetadata.identifier, options.pageName);
    }

    logger.info(`📎 Uploaded attachment: ${fileInfo.originalName} (${attachmentMetadata.identifier})${isPrivatePage ? ` [private page: ${pageName ?? ''}, creator: ${pageCreator ?? 'unknown'}]` : ''}`);
    return attachmentMetadata;
  }

  /**
   * Attach an existing attachment to a page
   *
   * @param {string} attachmentId - Attachment identifier
   * @param {string} pageName - Page name to attach to
   * @returns {Promise<boolean>} Success status
   */
  async attachToPage(attachmentId: string, pageName: string): Promise<boolean> {
    if (!this.attachmentProvider) {
      throw new Error('Attachment provider not initialized');
    }

    const metadata = await this.attachmentProvider.getAttachmentMetadata(attachmentId);
    if (!metadata) {
      throw new Error(`Attachment not found: ${attachmentId}`);
    }

    // Check if already attached
    const mentions = metadata.mentions || [];
    const alreadyAttached = mentions.some((m) => m.name === pageName);
    if (alreadyAttached) {
      logger.info(`📎 Attachment ${attachmentId} already attached to ${pageName}`);
      return true;
    }

    // Add page to mentions
    mentions.push({
      '@type': 'WebPage',
      name: pageName,
      url: `/view/${encodeURIComponent(pageName)}`
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
  async detachFromPage(attachmentId: string, pageName: string): Promise<boolean> {
    if (!this.attachmentProvider) {
      throw new Error('Attachment provider not initialized');
    }

    const metadata = await this.attachmentProvider.getAttachmentMetadata(attachmentId);
    if (!metadata) {
      throw new Error(`Attachment not found: ${attachmentId}`);
    }

    // Remove page from mentions
    const mentions = (metadata.mentions || []).filter((m) => m.name !== pageName);
    await this.attachmentProvider.updateAttachmentMetadata(attachmentId, { mentions });

    logger.info(`📎 Detached ${attachmentId} from page ${pageName}`);
    return true;
  }

  /**
   * Get an attachment by ID
   *
   * @param {string} attachmentId - Attachment identifier
   * @returns {Promise<{buffer: Buffer, metadata: AttachmentMetadata}|null>}
   */
  async getAttachment(attachmentId: string): Promise<{ buffer: Buffer; metadata: AttachmentMetadata } | null> {
    if (!this.attachmentProvider) {
      throw new Error('Attachment provider not initialized');
    }

    return await this.attachmentProvider.getAttachment(attachmentId);
  }

  /**
   * Get attachment metadata only
   *
   * @param {string} attachmentId - Attachment identifier
   * @returns {Promise<AttachmentMetadata|null>}
   */
  async getAttachmentMetadata(attachmentId: string): Promise<AttachmentMetadata | null> {
    if (!this.attachmentProvider) {
      throw new Error('Attachment provider not initialized');
    }

    return await this.attachmentProvider.getAttachmentMetadata(attachmentId);
  }

  /**
   * Get all attachments for a page
   *
   * @param {string} pageName - Page name
   * @returns {Promise<AttachmentMetadata[]>}
   */
  async getAttachmentsForPage(pageName: string): Promise<AttachmentMetadata[]> {
    if (!this.attachmentProvider) {
      return [];
    }

    return await this.attachmentProvider.getAttachmentsForPage(pageName);
  }

  /**
   * Find an attachment by its original filename across all attachments
   *
   * @param {string} filename - Original filename to search for
   * @returns {Promise<AttachmentMetadata|null>}
   */
  async getAttachmentByFilename(filename: string): Promise<AttachmentMetadata | null> {
    if (!this.attachmentProvider) {
      return null;
    }

    return await this.attachmentProvider.getAttachmentByFilename(filename);
  }

  /**
   * Get all attachments
   *
   * @returns {Promise<AttachmentMetadata[]>}
   */
  async getAllAttachments(): Promise<AttachmentMetadata[]> {
    if (!this.attachmentProvider) {
      return [];
    }

    return await this.attachmentProvider.getAllAttachments();
  }

  /**
   * Delete an attachment
   *
   * @param {string} attachmentId - Attachment identifier
   * @param {UserContext} context - WikiContext with user information
   * @returns {Promise<boolean>} Success status
   */
  async deleteAttachment(attachmentId: string, context?: UserContext): Promise<boolean> {
    if (!this.attachmentProvider) {
      throw new Error('Attachment provider not initialized');
    }

    // Check permission
    const allowed = await this.checkPermission('attachment:delete', context);
    if (!allowed) {
      throw new Error('Permission denied: You do not have permission to delete attachments');
    }

    return await this.attachmentProvider.deleteAttachment(attachmentId);
  }

  /**
   * Update attachment metadata
   *
   * @param {string} attachmentId - Attachment identifier
   * @param {Partial<AttachmentMetadata>} updates - Metadata updates
   * @param {UserContext} context - WikiContext with user information
   * @returns {Promise<boolean>} Success status
   */
  async updateAttachmentMetadata(attachmentId: string, updates: Partial<AttachmentMetadata>, context?: UserContext): Promise<boolean> {
    if (!this.attachmentProvider) {
      throw new Error('Attachment provider not initialized');
    }

    // Check permission (requires upload permission to edit metadata)
    const allowed = await this.checkPermission('attachment:upload', context);
    if (!allowed) {
      throw new Error('Permission denied: You do not have permission to update attachment metadata');
    }

    // Update editor information
    if (context?.user) {
      updates.editor = {
        '@type': 'Person',
        name: context.user.name || 'Unknown',
        email: context.user.email || undefined
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
  async attachmentExists(attachmentId: string): Promise<boolean> {
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
  getAttachmentUrl(attachmentId: string): string {
    return `/attachments/${attachmentId}`;
  }

  /**
   * Resolve an attachment src value (from plugin syntax) to a serving URL and MIME type.
   *
   * This is the canonical resolution method used by all plugins (ImagePlugin,
   * AttachPlugin, and future media plugins). Centralising here means Media
   * Manager (#273), private folders (#122), and any other media source only
   * need to be wired in once.
   *
   * Resolution order:
   *   0. media:// URI — resolved via MediaManager.findByFilename(); never touches attachment store
   *   1. External URL (starts with http:// or https://) — returned as-is, mimeType: ''
   *   2. Absolute path (starts with /) — returned as-is, mimeType: ''
   *   3. Filename lookup on the current page's attachments (exact name match)
   *   4. Global filename search across all attachments
   *   5. Returns null if unresolvable (caller decides how to render the error)
   *
   * @param {string} src - The raw src value from plugin syntax
   * @param {string} pageName - Page name for step 3 context
   * @returns {Promise<{ url: string; mimeType: string } | null>} Resolved result or null
   */
  async resolveAttachmentSrc(src: string, pageName: string): Promise<{ url: string; mimeType: string } | null> {
    if (!src) return null;

    // Step 0: media:// URI scheme — route to MediaManager without touching attachment store.
    // Authors use this to reference media library photos directly, e.g.:
    //   [{Image src='media://IMG_1234.jpg'}]
    //   [{ATTACH src='media://family-trip.jpg'}]
    if (src.startsWith('media://')) {
      const filename = src.slice('media://'.length);
      const mediaManager = this.engine.getManager<MediaManagerInterface>('MediaManager');
      if (mediaManager) {
        const item = await mediaManager.findByFilename(filename).catch(() => null);
        if (item) {
          return { url: `/media/file/${item.id}`, mimeType: item.mimeType };
        }
      }
      return null;
    }

    // Steps 1 & 2: external URLs and absolute paths are already resolved
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')) {
      return { url: src, mimeType: '' };
    }

    if (!this.attachmentProvider) return null;

    // Step 3: current page attachments by exact filename
    try {
      const pageAttachments = await this.attachmentProvider.getAttachmentsForPage(pageName);
      const match = pageAttachments.find(a => a.name === src);
      if (match) {
        return {
          url: match.url || `/attachments/${match.identifier}`,
          mimeType: match.encodingFormat || ''
        };
      }
    } catch {
      // continue
    }

    // Step 4: global filename search
    try {
      const globalMatch = await this.attachmentProvider.getAttachmentByFilename(src);
      if (globalMatch) {
        // Lazily populate mentions on first render — fixes imported content automatically.
        // Both [{Image}] and [{ATTACH}] share this path so both benefit. Fire-and-forget
        // so a metadata write failure never breaks rendering. See #384.
        this.attachToPage(globalMatch.identifier, pageName).catch(() => {});
        return {
          url: globalMatch.url || `/attachments/${globalMatch.identifier}`,
          mimeType: globalMatch.encodingFormat || ''
        };
      }
    } catch {
      // continue
    }

    // Future steps (e.g. private folders #122) go here

    return null;
  }

  /**
   * Refresh attachment list (rescan storage)
   *
   * @returns {Promise<void>}
   */
  async refreshAttachmentList(): Promise<void> {
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
   * @returns {Promise<AttachmentBackupData>}
   */
  async backup(): Promise<AttachmentBackupData> {
    if (!this.attachmentProvider) {
      return {
        managerName: 'AttachmentManager',
        timestamp: new Date().toISOString(),
        providerClass: null,
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
   * @param {AttachmentBackupData} backupData - Backup data from backup() method
   * @returns {Promise<void>}
   */
  async restore(backupData: AttachmentBackupData): Promise<void> {
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
   * @returns {Promise<void>}
   */
  async shutdown(): Promise<void> {
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
  private normalizeProviderName(providerName: string): string {
    if (!providerName) {
      throw new Error('Provider name cannot be empty');
    }

    // Convert to lowercase first to ensure consistency
    const lower = providerName.toLowerCase();

    // Handle special cases for known provider names
    const knownProviders: Record<string, string> = {
      basicattachmentprovider: 'BasicAttachmentProvider',
      databaseattachmentprovider: 'DatabaseAttachmentProvider',
      s3attachmentprovider: 'S3AttachmentProvider',
      azureblobattachmentprovider: 'AzureBlobAttachmentProvider'
    };

    if (knownProviders[lower]) {
      return knownProviders[lower];
    }

    // Fallback: Split on common separators and capitalize each word
    const words = lower.split(/[-_]/);
    const pascalCase = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('');

    return pascalCase;
  }

  /**
   * Format byte size to human-readable string
   * @param {number} bytes - Size in bytes
   * @returns {string} Formatted size (e.g., "10 MB")
   * @private
   */
  private formatSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

export default AttachmentManager;

// CommonJS compatibility
module.exports = AttachmentManager;
