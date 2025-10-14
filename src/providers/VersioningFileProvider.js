const FileSystemProvider = require('./FileSystemProvider');
const fs = require('fs-extra');
const path = require('path');
const logger = require('../utils/logger');
const DeltaStorage = require('../utils/DeltaStorage');
const VersionCompression = require('../utils/VersionCompression');

/**
 * VersioningFileProvider - File-based storage with version history
 *
 * Extends FileSystemProvider to add git-style page versioning with delta storage.
 * Maintains backward compatibility - can be swapped with FileSystemProvider.
 *
 * Features:
 * - Per-page version history with delta storage (v1 = full, v2+ = diffs)
 * - Compression of old versions (gzip)
 * - Centralized page index for fast lookups (./data/page-index.json)
 * - Version metadata tracking (author, date, change type, content hash)
 * - Retention policies (maxVersions, retentionDays)
 *
 * Directory Structure:
 * ```
 * ./data/page-index.json
 * ./pages/{uuid}.md
 * ./pages/versions/{uuid}/
 *   ├── manifest.json
 *   ├── v1/content.md (full)
 *   ├── v2/content.diff (delta)
 *   └── v3/content.diff (delta)
 * ./required-pages/{uuid}.md
 * ./required-pages/versions/{uuid}/...
 * ```
 *
 * @extends FileSystemProvider
 */
class VersioningFileProvider extends FileSystemProvider {
  /**
   * Create a new VersioningFileProvider
   * @param {object} engine - The WikiEngine instance
   */
  constructor(engine) {
    super(engine);

    // Versioning configuration
    this.pageIndexPath = null;           // Path to centralized page index
    this.maxVersions = 50;                // Maximum versions to keep per page
    this.retentionDays = 365;             // Days to retain versions
    this.compressionEnabled = true;       // Enable gzip compression
    this.deltaStorageEnabled = true;      // Enable delta storage (v1=full, v2+=diff)

    // Version directories (created during initialize)
    this.pagesVersionsDir = null;         // ./pages/versions/
    this.requiredPagesVersionsDir = null; // ./required-pages/versions/

    // In-memory page index cache
    this.pageIndex = null;
  }

  /**
   * Initialize the versioning provider
   *
   * 1. Calls parent FileSystemProvider.initialize()
   * 2. Loads versioning configuration
   * 3. Creates version directories
   * 4. Loads or creates page-index.json
   *
   * @returns {Promise<void>}
   */
  async initialize() {
    // Call parent initialization (sets up pages directories, caching, etc.)
    await super.initialize();

    const configManager = this.engine.getManager('ConfigurationManager');
    if (!configManager) {
      throw new Error('VersioningFileProvider requires ConfigurationManager');
    }

    // Load versioning configuration (ALL LOWERCASE)
    await this._loadVersioningConfig(configManager);

    // Create version directories
    await this._createVersionDirectories();

    // Load or create page index
    await this._loadOrCreatePageIndex();

    logger.info('[VersioningFileProvider] Initialized with versioning enabled');
    logger.info(`[VersioningFileProvider] Delta storage: ${this.deltaStorageEnabled ? 'enabled' : 'disabled'}`);
    logger.info(`[VersioningFileProvider] Compression: ${this.compressionEnabled ? 'enabled' : 'disabled'}`);
    logger.info(`[VersioningFileProvider] Max versions: ${this.maxVersions}, Retention: ${this.retentionDays} days`);
  }

  /**
   * Load versioning configuration from ConfigurationManager
   * @param {object} configManager - ConfigurationManager instance
   * @private
   */
  async _loadVersioningConfig(configManager) {
    // Page index location
    const indexPath = configManager.getProperty(
      'amdwiki.page.provider.versioning.indexfile',
      './data/page-index.json'
    );
    this.pageIndexPath = path.isAbsolute(indexPath) ? indexPath : path.join(process.cwd(), indexPath);

    // Version retention settings
    this.maxVersions = configManager.getProperty(
      'amdwiki.page.provider.versioning.maxversions',
      50
    );

    this.retentionDays = configManager.getProperty(
      'amdwiki.page.provider.versioning.retentiondays',
      365
    );

    // Storage optimization settings
    const compressionSetting = configManager.getProperty(
      'amdwiki.page.provider.versioning.compression',
      'gzip'
    );
    this.compressionEnabled = compressionSetting === 'gzip';

    this.deltaStorageEnabled = configManager.getProperty(
      'amdwiki.page.provider.versioning.deltastorage',
      true
    );

    // Validate configuration
    if (this.maxVersions < 1) {
      logger.warn('[VersioningFileProvider] Invalid maxVersions, using default: 50');
      this.maxVersions = 50;
    }

    if (this.retentionDays < 1) {
      logger.warn('[VersioningFileProvider] Invalid retentionDays, using default: 365');
      this.retentionDays = 365;
    }
  }

  /**
   * Create version directories if they don't exist
   * @private
   */
  async _createVersionDirectories() {
    // Create versions subdirectory under pages
    this.pagesVersionsDir = path.join(this.pagesDirectory, 'versions');
    await fs.ensureDir(this.pagesVersionsDir);

    // Create versions subdirectory under required-pages
    this.requiredPagesVersionsDir = path.join(this.requiredPagesDirectory, 'versions');
    await fs.ensureDir(this.requiredPagesVersionsDir);

    // Create data directory for page index
    const dataDir = path.dirname(this.pageIndexPath);
    await fs.ensureDir(dataDir);

    logger.info(`[VersioningFileProvider] Version directories created`);
    logger.info(`[VersioningFileProvider]   - ${this.pagesVersionsDir}`);
    logger.info(`[VersioningFileProvider]   - ${this.requiredPagesVersionsDir}`);
  }

  /**
   * Load existing page index or create new one
   * @private
   */
  async _loadOrCreatePageIndex() {
    if (await fs.pathExists(this.pageIndexPath)) {
      try {
        const indexData = await fs.readFile(this.pageIndexPath, 'utf8');
        this.pageIndex = JSON.parse(indexData);
        logger.info(`[VersioningFileProvider] Loaded page index: ${this.pageIndex.pageCount} pages`);
      } catch (error) {
        logger.error('[VersioningFileProvider] Failed to load page index, creating new:', error.message);
        await this._createEmptyPageIndex();
      }
    } else {
      logger.info('[VersioningFileProvider] No page index found, creating new');
      await this._createEmptyPageIndex();
    }
  }

  /**
   * Create empty page index structure
   * @private
   */
  async _createEmptyPageIndex() {
    this.pageIndex = {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      pageCount: 0,
      pages: {}
    };
    await this._savePageIndex();
  }

  /**
   * Save page index to disk (atomic write)
   * @private
   */
  async _savePageIndex() {
    this.pageIndex.lastUpdated = new Date().toISOString();

    // Atomic write: write to temp file, then rename
    const tempPath = `${this.pageIndexPath}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(this.pageIndex, null, 2), 'utf8');
    await fs.rename(tempPath, this.pageIndexPath);
  }

  /**
   * Update a single page entry in the index
   * @param {string} uuid - Page UUID
   * @param {object} data - Page data to update
   * @private
   */
  async _updatePageInIndex(uuid, data) {
    if (!this.pageIndex.pages[uuid]) {
      this.pageIndex.pageCount++;
    }

    this.pageIndex.pages[uuid] = {
      ...this.pageIndex.pages[uuid],
      ...data,
      uuid: uuid
    };

    await this._savePageIndex();
  }

  /**
   * Get version directory for a page
   * @param {string} uuid - Page UUID
   * @param {string} location - 'pages' or 'required-pages'
   * @returns {string} Version directory path
   * @private
   */
  _getVersionDirectory(uuid, location) {
    const baseDir = location === 'required-pages'
      ? this.requiredPagesVersionsDir
      : this.pagesVersionsDir;

    return path.join(baseDir, uuid);
  }

  // ============================================================================
  // Manifest.json Management
  // ============================================================================

  /**
   * Load manifest for a page
   * @param {string} uuid - Page UUID
   * @param {string} location - 'pages' or 'required-pages'
   * @returns {Promise<object|null>} Manifest data or null if doesn't exist
   * @private
   */
  async _loadManifest(uuid, location) {
    const versionDir = this._getVersionDirectory(uuid, location);
    const manifestPath = path.join(versionDir, 'manifest.json');

    if (!await fs.pathExists(manifestPath)) {
      return null;
    }

    try {
      const manifestData = await fs.readFile(manifestPath, 'utf8');
      return JSON.parse(manifestData);
    } catch (error) {
      logger.error(`[VersioningFileProvider] Failed to load manifest for ${uuid}:`, error.message);
      return null;
    }
  }

  /**
   * Save manifest for a page (atomic write)
   * @param {string} uuid - Page UUID
   * @param {string} location - 'pages' or 'required-pages'
   * @param {object} manifest - Manifest data
   * @private
   */
  async _saveManifest(uuid, location, manifest) {
    const versionDir = this._getVersionDirectory(uuid, location);
    await fs.ensureDir(versionDir);

    const manifestPath = path.join(versionDir, 'manifest.json');

    // Atomic write
    const tempPath = `${manifestPath}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(manifest, null, 2), 'utf8');
    await fs.rename(tempPath, manifestPath);
  }

  /**
   * Create initial manifest for a new page
   * @param {string} uuid - Page UUID
   * @param {string} pageName - Page title
   * @returns {object} Initial manifest
   * @private
   */
  _createInitialManifest(uuid, pageName) {
    return {
      pageId: uuid,
      pageName: pageName,
      currentVersion: 0,
      versions: []
    };
  }

  /**
   * Add version entry to manifest
   * @param {object} manifest - Manifest object
   * @param {object} versionData - Version metadata
   * @private
   */
  _addVersionToManifest(manifest, versionData) {
    manifest.currentVersion++;
    manifest.versions.push({
      version: manifest.currentVersion,
      ...versionData
    });
  }

  // ============================================================================
  // Version Creation
  // ============================================================================

  /**
   * Override savePage to create versions
   *
   * Algorithm:
   * 1. Check if page exists (new vs update)
   * 2. If update: create diff and new version
   * 3. If new: create initial version (v1 with full content)
   * 4. Update manifest.json
   * 5. Call parent savePage() for current content
   * 6. Update page-index.json
   *
   * @param {string} pageName - Page title
   * @param {string} content - New content
   * @param {object} metadata - Page metadata
   * @returns {Promise<void>}
   */
  async savePage(pageName, content, metadata = {}) {
    // Check if page exists using public method
    const pageExists = this.pageExists(pageName);

    // Get existing page info if it exists
    let pageInfo = null;
    if (pageExists) {
      try {
        pageInfo = await this.getPage(pageName);
      } catch (error) {
        // Page might exist but not be readable, treat as new
        pageInfo = null;
      }
    }

    // Determine UUID (existing or new)
    const uuid = pageInfo?.uuid || metadata.uuid || require('uuid').v4();

    // Determine location based on system-category
    const systemCategory = metadata['system-category'] || metadata.systemCategory || 'General';
    const configManager = this.engine.getManager('ConfigurationManager');
    const systemCategoriesConfig = configManager?.getProperty('amdwiki.systemCategories', null);

    let location = 'pages';
    if (systemCategoriesConfig) {
      for (const [key, config] of Object.entries(systemCategoriesConfig)) {
        if (config.label.toLowerCase() === systemCategory.toLowerCase()) {
          location = config.storageLocation === 'required' ? 'required-pages' : 'pages';
          break;
        }
      }
    }

    try {
      if (pageInfo) {
        // Existing page: create new version with diff
        await this._createNewVersion(uuid, pageName, content, metadata, location, pageInfo);
      } else {
        // New page: create initial version
        await this._createInitialVersion(uuid, pageName, content, metadata, location);
      }
    } catch (error) {
      logger.error(`[VersioningFileProvider] Failed to create version for ${pageName}:`, error.message);
      // Continue with parent savePage even if versioning fails
    }

    // Call parent to save current content
    await super.savePage(pageName, content, { ...metadata, uuid });

    // Update page index
    await this._updatePageInIndex(uuid, {
      title: pageName,
      uuid: uuid,
      currentVersion: await this._getCurrentVersion(uuid, location),
      location: location,
      lastModified: new Date().toISOString(),
      author: metadata.author || 'unknown',
      hasVersions: true
    });

    logger.info(`[VersioningFileProvider] Saved page '${pageName}' with versioning`);
  }

  /**
   * Create initial version (v1) for a new page
   * @param {string} uuid - Page UUID
   * @param {string} pageName - Page title
   * @param {string} content - Page content
   * @param {object} metadata - Page metadata
   * @param {string} location - 'pages' or 'required-pages'
   * @private
   */
  async _createInitialVersion(uuid, pageName, content, metadata, location) {
    const versionDir = this._getVersionDirectory(uuid, location);
    const v1Dir = path.join(versionDir, 'v1');
    await fs.ensureDir(v1Dir);

    // Write full content for v1
    await fs.writeFile(path.join(v1Dir, 'content.md'), content, 'utf8');

    // Write metadata
    const versionMetadata = {
      dateCreated: new Date().toISOString(),
      author: metadata.author || 'unknown',
      changeType: 'created',
      comment: metadata.comment || 'Initial version',
      contentHash: DeltaStorage.calculateHash(content),
      contentSize: Buffer.byteLength(content, 'utf8'),
      compressed: false,
      isDelta: false
    };
    await fs.writeFile(path.join(v1Dir, 'meta.json'), JSON.stringify(versionMetadata, null, 2), 'utf8');

    // Create and save manifest
    const manifest = this._createInitialManifest(uuid, pageName);
    this._addVersionToManifest(manifest, versionMetadata);
    await this._saveManifest(uuid, location, manifest);

    logger.info(`[VersioningFileProvider] Created v1 for page ${pageName} (${uuid})`);
  }

  /**
   * Create new version for existing page
   * @param {string} uuid - Page UUID
   * @param {string} pageName - Page title
   * @param {string} newContent - New content
   * @param {object} metadata - Page metadata
   * @param {string} location - 'pages' or 'required-pages'
   * @param {object} pageInfo - Current page info
   * @private
   */
  async _createNewVersion(uuid, pageName, newContent, metadata, location, pageInfo) {
    // Load manifest
    let manifest = await this._loadManifest(uuid, location);
    if (!manifest) {
      logger.warn(`[VersioningFileProvider] No manifest found for ${pageName}, creating new`);
      manifest = this._createInitialManifest(uuid, pageName);
    }

    const nextVersion = manifest.currentVersion + 1;
    const versionDir = this._getVersionDirectory(uuid, location);
    const vNextDir = path.join(versionDir, `v${nextVersion}`);
    await fs.ensureDir(vNextDir);

    // Read current content to create diff
    let currentContent;
    try {
      // pageInfo already has the content parsed
      currentContent = pageInfo.content || '';
    } catch (error) {
      logger.error(`[VersioningFileProvider] Failed to read current content:`, error.message);
      currentContent = '';
    }

    // Create version based on delta storage setting
    let versionMetadata;
    if (this.deltaStorageEnabled && nextVersion > 1) {
      // Create and save diff
      const diff = DeltaStorage.createDiff(currentContent, newContent);
      await fs.writeFile(
        path.join(vNextDir, 'content.diff'),
        JSON.stringify(diff),
        'utf8'
      );

      versionMetadata = {
        dateCreated: new Date().toISOString(),
        author: metadata.author || 'unknown',
        changeType: metadata.changeType || 'updated',
        comment: metadata.comment || `Update to version ${nextVersion}`,
        contentHash: DeltaStorage.calculateHash(newContent),
        contentSize: Buffer.byteLength(JSON.stringify(diff), 'utf8'),
        compressed: false,
        isDelta: true
      };
    } else {
      // Store full content
      await fs.writeFile(path.join(vNextDir, 'content.md'), newContent, 'utf8');

      versionMetadata = {
        dateCreated: new Date().toISOString(),
        author: metadata.author || 'unknown',
        changeType: metadata.changeType || 'updated',
        comment: metadata.comment || `Update to version ${nextVersion}`,
        contentHash: DeltaStorage.calculateHash(newContent),
        contentSize: Buffer.byteLength(newContent, 'utf8'),
        compressed: false,
        isDelta: false
      };
    }

    // Save metadata
    await fs.writeFile(path.join(vNextDir, 'meta.json'), JSON.stringify(versionMetadata, null, 2), 'utf8');

    // Update manifest
    this._addVersionToManifest(manifest, versionMetadata);
    await this._saveManifest(uuid, location, manifest);

    logger.info(`[VersioningFileProvider] Created v${nextVersion} for page ${pageName} (${uuid})`);
  }

  /**
   * Get current version number for a page
   * @param {string} uuid - Page UUID
   * @param {string} location - 'pages' or 'required-pages'
   * @returns {Promise<number>} Current version number (0 if no versions)
   * @private
   */
  async _getCurrentVersion(uuid, location) {
    const manifest = await this._loadManifest(uuid, location);
    return manifest ? manifest.currentVersion : 0;
  }

  /**
   * Get provider information
   * @returns {object} Provider metadata
   */
  getProviderInfo() {
    return {
      name: 'VersioningFileProvider',
      version: '1.0.0',
      description: 'File storage with version history and delta storage',
      features: [
        'uuid-indexing',
        'title-indexing',
        'plural-matching',
        'dual-storage',
        'case-insensitive-lookup',
        'version-history',
        'delta-storage',
        'compression',
        'page-index'
      ]
    };
  }
}

module.exports = VersioningFileProvider;
