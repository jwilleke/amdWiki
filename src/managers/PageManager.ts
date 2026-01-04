/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import BaseManager, { BackupData } from './BaseManager';
import logger from '../utils/logger';
import { WikiEngine } from '../types/WikiEngine';
import { PageProvider } from '../types/Provider';
import { WikiPage, PageFrontmatter } from '../types/Page';
import type ConfigurationManager from './ConfigurationManager';

/**
 * Minimal WikiContext interface for type safety
 * TODO: Convert WikiContext.js to TypeScript and import proper type
 */
interface WikiContext {
  pageName: string;
  content: string;
  userContext?: {
    username?: string;
  };
}

/**
 * Provider information returned by getProviderInfo()
 */
interface ProviderInfo {
  name: string;
  version: string;
  features?: string[];
}

/**
 * Provider constructor type for dynamic loading
 */
interface ProviderConstructor {
  new (engine: WikiEngine): any;
}

/**
 * PageManager - Manages wiki page operations through a pluggable provider system
 *
 * Follows JSPWiki's provider pattern where the actual storage implementation
 * is abstracted behind a provider interface. This allows for different storage
 * backends (filesystem, database, cloud, etc.) to be swapped via configuration.
 *
 * The PageManager acts as a thin coordinator that:
 * - Loads the configured provider (via "amdwiki.page.provider")
 * - Proxies all page operations to the provider
 * - Maintains the public API for backward compatibility
 *
 * @class PageManager
 * @extends BaseManager
 *
 * @property {PageProvider|null} provider - The active page storage provider
 * @property {string} providerClass - The class name of the loaded provider
 *
 * @see {@link BaseManager} for base functionality
 * @see {@link FileSystemProvider} for default provider implementation
 *
 * @example
 * const pageManager = engine.getManager('PageManager');
 * const page = await pageManager.getPage('Main');
 * console.log(page.content);
 */
class PageManager extends BaseManager {
  private provider: PageProvider | null = null;
  private providerClass?: string;

  /**
   * Creates a new PageManager instance
   *
   * @constructor
   * @param {WikiEngine} engine - The wiki engine instance
   */
  constructor(engine: WikiEngine) {
    super(engine);
  }

  /**
   * Initialize the PageManager by loading and initializing the configured provider
   *
   * Reads the page provider configuration and dynamically loads the provider class.
   * The provider name is normalized from lowercase (config) to PascalCase (class name).
   *
   * @async
   * @param {Object} [config={}] - Configuration object (unused, reads from ConfigurationManager)
   * @returns {Promise<void>}
   * @throws {Error} If ConfigurationManager is not available or provider fails to load
   *
   * @example
   * await pageManager.initialize();
   * // Loads FileSystemProvider by default
   */
  async initialize(config: Record<string, unknown> = {}): Promise<void> {
    await super.initialize(config);

    const configManager = this.engine.getManager<ConfigurationManager>('ConfigurationManager');
    if (!configManager) {
      throw new Error('PageManager requires ConfigurationManager');
    }

    // Check if page storage is enabled (ALL LOWERCASE)
    const pageEnabled = configManager.getProperty('amdwiki.page.enabled', true) as boolean;
    if (!pageEnabled) {
      logger.info('📄 PageManager: Page storage disabled by configuration');
      return;
    }

    // Load provider with fallback (ALL LOWERCASE)
    const defaultProvider = configManager.getProperty('amdwiki.page.provider.default', 'filesystemprovider') as string;
    const providerName = configManager.getProperty('amdwiki.page.provider', defaultProvider) as string;

    // Normalize provider name to PascalCase for class loading
    this.providerClass = this.normalizeProviderName(providerName);

    logger.info(`📄 Loading page provider: ${providerName} (${this.providerClass})`);

    // Load and initialize provider
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const ProviderClass = require(`../providers/${this.providerClass}`) as ProviderConstructor;

      this.provider = new ProviderClass(this.engine);
      if (this.provider) {
        await this.provider.initialize();
      }

      const info = this.getProviderInfo();
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
   * Get provider information
   * @private
   */
  private getProviderInfo(): ProviderInfo {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    // Provider classes have getProviderInfo() method
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (this.provider as any).getProviderInfo();
  }

  /**
   * Normalize provider name from configuration (lowercase) to class name (PascalCase)
   * @param {string} providerName - Provider name from configuration (e.g., 'filesystemprovider')
   * @returns {string} Normalized class name (e.g., 'FileSystemProvider')
   * @private
   */
  private normalizeProviderName(providerName: string): string {
    if (!providerName) {
      throw new Error('Provider name cannot be empty');
    }

    const lower = providerName.toLowerCase();

    // Handle special cases for known provider names
    const knownProviders: Record<string, string> = {
      filesystemprovider: 'FileSystemProvider',
      versioningfileprovider: 'VersioningFileProvider',
      databaseprovider: 'DatabaseProvider',
      databasepageprovider: 'DatabasePageProvider',
      s3provider: 'S3Provider',
      s3pageprovider: 'S3PageProvider',
      cloudstorageprovider: 'CloudStorageProvider'
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
   * Get the current page provider instance
   *
   * @returns {PageProvider} The active provider instance
   *
   * @example
   * const provider = pageManager.getCurrentPageProvider();
   * const info = provider.getProviderInfo();
   * console.log('Using:', info.name);
   */
  getCurrentPageProvider(): PageProvider | null {
    return this.provider;
  }

  // ============================================================================
  // Proxy Methods - All page operations are delegated to the provider
  // ============================================================================

  /**
   * Get complete page with content and metadata
   *
   * Retrieves a page by UUID, title, or slug. Returns the full page object
   * including content, metadata, and file path information.
   *
   * @async
   * @param {string} identifier - Page UUID, title, or slug
   * @returns {Promise<WikiPage|null>} Page object or null if not found
   *
   * @example
   * const page = await pageManager.getPage('Main');
   * console.log(page.title, page.metadata.author);
   */
  async getPage(identifier: string): Promise<WikiPage | null> {
    if (!this.provider) {
      throw new Error('PageManager: Provider not initialized');
    }
    return this.provider.getPage(identifier);
  }

  /**
   * Get only page content (without metadata)
   *
   * More efficient than getPage() when only content is needed.
   *
   * @async
   * @param {string} identifier - Page UUID, title, or slug
   * @returns {Promise<string>} Markdown content
   *
   * @example
   * const content = await pageManager.getPageContent('Main');
   * console.log(content);
   */
  async getPageContent(identifier: string): Promise<string> {
    if (!this.provider) {
      throw new Error('PageManager: Provider not initialized');
    }
    return this.provider.getPageContent(identifier);
  }

  /**
   * Get only page metadata (without content)
   *
   * More efficient than getPage() when only metadata is needed.
   *
   * @async
   * @param {string} identifier - Page UUID, title, or slug
   * @returns {Promise<PageFrontmatter|null>} Metadata object or null if not found
   *
   * @example
   * const meta = await pageManager.getPageMetadata('Main');
   * console.log('Author:', meta.author);
   */
  async getPageMetadata(identifier: string): Promise<PageFrontmatter | null> {
    if (!this.provider) {
      throw new Error('PageManager: Provider not initialized');
    }
    return this.provider.getPageMetadata(identifier);
  }

  /**
   * Save page content and metadata using WikiContext
   *
   * Creates a new page or updates an existing one using WikiContext as the
   * single source of truth. Extracts page name, content, and author from context.
   *
   * @async
   * @param {WikiContext} wikiContext - The wiki context containing page and user info
   * @param {Partial<PageFrontmatter>} [metadata={}] - Additional frontmatter metadata
   * @returns {Promise<void>}
   *
   * @example
   * await pageManager.savePageWithContext(wikiContext, {
   *   tags: ['tutorial']
   * });
   */
  async savePageWithContext(wikiContext: WikiContext, metadata: Partial<PageFrontmatter> = {}): Promise<void> {
    if (!wikiContext) {
      throw new Error('PageManager.savePageWithContext requires a WikiContext');
    }

    if (!this.provider) {
      throw new Error('PageManager: Provider not initialized');
    }

    const pageName = wikiContext.pageName;
    const content = wikiContext.content;

    // Extract author from WikiContext user context
    const enrichedMetadata: Partial<PageFrontmatter> = {
      ...metadata,
      author: wikiContext.userContext?.username || metadata.author || 'anonymous'
    };

    return this.provider.savePage(pageName, content, enrichedMetadata);
  }

  /**
   * Save page content and metadata
   *
   * Creates a new page or updates an existing one. Handles UUID generation
   * for new pages and version management automatically.
   *
   * @async
   * @param {string} pageName - Page title
   * @param {string} content - Markdown content
   * @param {Partial<PageFrontmatter>} [metadata={}] - Frontmatter metadata
   * @returns {Promise<void>}
   * @deprecated Use savePageWithContext() with WikiContext instead
   *
   * @example
   * await pageManager.savePage('New Page', '# Hello World', {
   *   author: 'admin',
   *   tags: ['tutorial']
   * });
   */
  async savePage(pageName: string, content: string, metadata: Partial<PageFrontmatter> = {}): Promise<void> {
    if (!this.provider) {
      throw new Error('PageManager: Provider not initialized');
    }
    return this.provider.savePage(pageName, content, metadata);
  }

  /**
   * Delete a page using WikiContext
   *
   * Removes a page from storage using WikiContext as the single source of truth.
   * Extracts the page name from the context.
   *
   * @async
   * @param {WikiContext} wikiContext - The wiki context containing page info
   * @returns {Promise<boolean>} True if deleted, false if not found
   *
   * @example
   * const deleted = await pageManager.deletePageWithContext(wikiContext);
   * if (deleted) console.log('Page removed');
   */
  async deletePageWithContext(wikiContext: WikiContext): Promise<boolean> {
    if (!wikiContext) {
      throw new Error('PageManager.deletePageWithContext requires a WikiContext');
    }

    if (!this.provider) {
      throw new Error('PageManager: Provider not initialized');
    }

    const identifier = wikiContext.pageName;

    // Future: Could add audit logging here using wikiContext.userContext
    logger.info(`[PageManager] Deleting page: ${identifier} by user: ${wikiContext.userContext?.username || 'anonymous'}`);

    return this.provider.deletePage(identifier);
  }

  /**
   * Delete a page
   *
   * Removes a page from storage. The page can be identified by UUID, title, or slug.
   *
   * @async
   * @param {string} identifier - Page UUID, title, or slug
   * @returns {Promise<boolean>} True if deleted, false if not found
   * @deprecated Use deletePageWithContext() with WikiContext instead
   *
   * @example
   * const deleted = await pageManager.deletePage('Old Page');
   * if (deleted) console.log('Page removed');
   */
  async deletePage(identifier: string): Promise<boolean> {
    if (!this.provider) {
      throw new Error('PageManager: Provider not initialized');
    }
    return this.provider.deletePage(identifier);
  }

  /**
   * Check if page exists
   *
   * Fast existence check without loading page content.
   *
   * @param {string} identifier - Page UUID, title, or slug
   * @returns {boolean} True if page exists
   *
   * @example
   * if (pageManager.pageExists('Main')) {
   *   console.log('Main page exists');
   * }
   */
  pageExists(identifier: string): boolean {
    if (!this.provider) {
      throw new Error('PageManager: Provider not initialized');
    }
    return this.provider.pageExists(identifier);
  }

  /**
   * Get all page titles
   *
   * Returns a sorted list of all page titles in the wiki.
   *
   * @async
   * @returns {Promise<string[]>} Sorted array of page titles
   *
   * @example
   * const pages = await pageManager.getAllPages();
   * console.log('Total pages:', pages.length);
   */
  async getAllPages(): Promise<string[]> {
    if (!this.provider) {
      throw new Error('PageManager: Provider not initialized');
    }
    return this.provider.getAllPages();
  }

  /**
   * Refresh internal cache/index
   *
   * Forces the provider to rebuild its internal caches and indices.
   * Useful after external file system changes.
   *
   * @async
   * @returns {Promise<void>}
   *
   * @example
   * await pageManager.refreshPageList();
   * console.log('Page list refreshed');
   */
  async refreshPageList(): Promise<void> {
    if (!this.provider) {
      throw new Error('PageManager: Provider not initialized');
    }
    return this.provider.refreshPageList();
  }

  /**
   * Shutdown the PageManager and its provider
   *
   * Cleanly shuts down the provider, closing connections and flushing caches.
   *
   * @async
   * @returns {Promise<void>}
   */
  async shutdown(): Promise<void> {
    if (this.provider && this.provider.shutdown) {
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
   * @returns {Promise<BackupData>} Backup data from provider
   */
  async backup(): Promise<BackupData> {
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
      // Providers have backup() method

      const providerBackup = await (this.provider as any).backup();

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
   * @param {BackupData} backupData - Backup data from backup() method
   * @returns {Promise<void>}
   */
  async restore(backupData: BackupData): Promise<void> {
    logger.info('[PageManager] Starting restore...');

    if (!backupData) {
      throw new Error('PageManager: No backup data provided for restore');
    }

    if (!this.provider) {
      throw new Error('PageManager: No provider available for restore');
    }

    // Check for provider mismatch
    if (backupData.providerClass && typeof backupData.providerClass === 'string' && backupData.providerClass !== this.providerClass) {
      logger.warn(`[PageManager] Provider mismatch: backup has ${backupData.providerClass}, current is ${this.providerClass}`);
    }

    try {
      if (backupData.providerBackup) {
        // Providers have restore() method

        await (this.provider as any).restore(backupData.providerBackup);
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

export = PageManager;
