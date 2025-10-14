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

    // Read current content from previous version file (not from pageInfo)
    // This ensures we're comparing the exact content we saved, not parsed content
    let currentContent;
    try {
      const currentVersion = manifest.currentVersion;
      if (currentVersion === 1) {
        // Read from v1/content.md
        const v1Path = path.join(versionDir, 'v1', 'content.md');
        currentContent = await fs.readFile(v1Path, 'utf8');
      } else {
        // Reconstruct from v1 + diffs
        currentContent = await this._reconstructVersion(uuid, location, currentVersion);
      }
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
   * Reconstruct content for a specific version by applying diffs
   * @param {string} uuid - Page UUID
   * @param {string} location - 'pages' or 'required-pages'
   * @param {number} targetVersion - Version to reconstruct
   * @returns {Promise<string>} Reconstructed content
   * @private
   */
  async _reconstructVersion(uuid, location, targetVersion) {
    const versionDir = this._getVersionDirectory(uuid, location);

    // Read v1 (base content)
    const v1Path = path.join(versionDir, 'v1', 'content.md');
    if (!await fs.pathExists(v1Path)) {
      throw new Error(`Base version (v1) not found: ${v1Path}`);
    }
    let content = await fs.readFile(v1Path, 'utf8');

    // If target is v1, we're done
    if (targetVersion === 1) {
      return content;
    }

    // Apply diffs sequentially from v2 to target version
    for (let v = 2; v <= targetVersion; v++) {
      const diffPath = path.join(versionDir, `v${v}`, 'content.diff');
      if (!await fs.pathExists(diffPath)) {
        throw new Error(`Diff file not found for v${v}: ${diffPath}`);
      }

      const diffData = await fs.readFile(diffPath, 'utf8');
      const diff = JSON.parse(diffData);
      content = DeltaStorage.applyDiff(content, diff);
    }

    return content;
  }

  // ============================================================================
  // Version Retrieval Methods
  // ============================================================================

  /**
   * Resolve identifier (UUID or title) to UUID and location
   * @param {string} identifier - Page UUID or title
   * @returns {Promise<{uuid: string, location: string}|null>} UUID and location, or null if not found
   * @private
   */
  async _resolveIdentifier(identifier) {
    // Check if identifier is already a UUID (in page index)
    if (this.pageIndex.pages[identifier]) {
      return {
        uuid: identifier,
        location: this.pageIndex.pages[identifier].location || 'pages'
      };
    }

    // Try to find by title using pageExists and getPage
    if (this.pageExists(identifier)) {
      try {
        const pageInfo = await this.getPage(identifier);
        if (pageInfo && pageInfo.uuid) {
          // Determine location from page index or default to 'pages'
          const location = this.pageIndex.pages[pageInfo.uuid]?.location || 'pages';
          return {
            uuid: pageInfo.uuid,
            location: location
          };
        }
      } catch (error) {
        logger.warn(`[VersioningFileProvider] Failed to resolve identifier '${identifier}':`, error.message);
      }
    }

    return null;
  }

  /**
   * Get version history for a page
   *
   * Returns an array of version metadata sorted by version number (newest first).
   * Each entry includes: version, dateCreated, author, changeType, comment, contentHash, contentSize.
   *
   * @param {string} identifier - Page UUID or title
   * @returns {Promise<Array<object>>} Array of version metadata (empty array if no versions)
   * @throws {Error} If page not found
   * @example
   * const history = await provider.getVersionHistory('Main');
   * // [
   * //   { version: 3, dateCreated: '2024-01-03T...', author: 'john', ... },
   * //   { version: 2, dateCreated: '2024-01-02T...', author: 'jane', ... },
   * //   { version: 1, dateCreated: '2024-01-01T...', author: 'admin', ... }
   * // ]
   */
  async getVersionHistory(identifier) {
    // Resolve identifier to UUID and location
    const resolved = await this._resolveIdentifier(identifier);
    if (!resolved) {
      throw new Error(`Page not found: ${identifier}`);
    }

    const { uuid, location } = resolved;

    // Load manifest
    const manifest = await this._loadManifest(uuid, location);
    if (!manifest || !manifest.versions || manifest.versions.length === 0) {
      return [];
    }

    // Return versions in reverse order (newest first)
    return [...manifest.versions].reverse();
  }

  /**
   * Get specific version content for a page
   *
   * Reconstructs the content for a specific version by:
   * 1. Reading v1 (full content)
   * 2. If version > 1 and delta storage enabled: apply diffs sequentially
   * 3. If version > 1 and delta storage disabled: read full content directly
   *
   * @param {string} identifier - Page UUID or title
   * @param {number} version - Version number to retrieve
   * @returns {Promise<{content: string, metadata: object}>} Version content and metadata
   * @throws {Error} If page/version not found or reconstruction fails
   * @example
   * const { content, metadata } = await provider.getPageVersion('Main', 2);
   * console.log(content); // Content at version 2
   * console.log(metadata.author); // Author of version 2
   */
  async getPageVersion(identifier, version) {
    if (typeof version !== 'number' || version < 1) {
      throw new Error(`Invalid version number: ${version}`);
    }

    // Resolve identifier to UUID and location
    const resolved = await this._resolveIdentifier(identifier);
    if (!resolved) {
      throw new Error(`Page not found: ${identifier}`);
    }

    const { uuid, location } = resolved;

    // Load manifest
    const manifest = await this._loadManifest(uuid, location);
    if (!manifest) {
      throw new Error(`No version history found for: ${identifier}`);
    }

    if (version > manifest.currentVersion) {
      throw new Error(`Version ${version} does not exist (current: ${manifest.currentVersion})`);
    }

    // Get version metadata
    const versionMetadata = manifest.versions.find(v => v.version === version);
    if (!versionMetadata) {
      throw new Error(`Version ${version} metadata not found in manifest`);
    }

    const versionDir = this._getVersionDirectory(uuid, location);

    // Reconstruct content based on delta storage setting
    let content;
    if (this.deltaStorageEnabled) {
      // Use delta reconstruction (works for all versions including v1)
      content = await this._reconstructVersion(uuid, location, version);
    } else {
      // Delta storage disabled: read full content directly
      const vPath = path.join(versionDir, `v${version}`, 'content.md');
      if (!await fs.pathExists(vPath)) {
        throw new Error(`Version ${version} content file not found: ${vPath}`);
      }
      content = await fs.readFile(vPath, 'utf8');
    }

    return { content, metadata: versionMetadata };
  }

  /**
   * Restore page to a specific version
   *
   * Creates a new version with the content from the specified version.
   * This does NOT delete newer versions - it creates a new version with old content.
   *
   * @param {string} identifier - Page UUID or title
   * @param {number} version - Version number to restore to
   * @param {object} options - Restore options
   * @param {string} options.author - Author of the restore action (default: 'system')
   * @param {string} options.comment - Comment for the restore action (default: 'Restored from v{version}')
   * @returns {Promise<number>} New version number created by restore
   * @throws {Error} If page/version not found or restore fails
   * @example
   * const newVersion = await provider.restoreVersion('Main', 5, {
   *   author: 'admin',
   *   comment: 'Reverted spam edit'
   * });
   * console.log(`Restored to v5, created v${newVersion}`);
   */
  async restoreVersion(identifier, version, options = {}) {
    // Get the content from the target version
    const { content, metadata: versionMetadata } = await this.getPageVersion(identifier, version);

    // Resolve identifier to get current page info
    const resolved = await this._resolveIdentifier(identifier);
    if (!resolved) {
      throw new Error(`Page not found: ${identifier}`);
    }

    const { uuid } = resolved;

    // Get current page to get title
    const currentPage = await this.getPage(identifier);
    const pageName = currentPage.title || identifier;

    // Save as new version with restore metadata
    const author = options.author || 'system';
    const comment = options.comment || `Restored from v${version}`;

    await this.savePage(pageName, content, {
      uuid: uuid,
      author: author,
      comment: comment,
      changeType: 'restored'
    });

    // Return the new version number
    const location = this.pageIndex.pages[uuid]?.location || 'pages';
    const newVersion = await this._getCurrentVersion(uuid, location);

    logger.info(`[VersioningFileProvider] Restored page '${pageName}' to v${version}, created v${newVersion}`);
    return newVersion;
  }

  /**
   * Compare two versions of a page
   *
   * Returns a diff showing changes between two versions.
   * Uses DeltaStorage to compute the diff.
   *
   * @param {string} identifier - Page UUID or title
   * @param {number} version1 - First version number
   * @param {number} version2 - Second version number
   * @returns {Promise<object>} Comparison result with diff and stats
   * @throws {Error} If page/versions not found
   * @example
   * const comparison = await provider.compareVersions('Main', 2, 5);
   * console.log(comparison.stats); // { additions: 10, deletions: 3, unchanged: 100 }
   * console.log(comparison.diff); // Array of diff operations
   */
  async compareVersions(identifier, version1, version2) {
    if (typeof version1 !== 'number' || typeof version2 !== 'number') {
      throw new Error('Version numbers must be integers');
    }

    if (version1 < 1 || version2 < 1) {
      throw new Error('Version numbers must be >= 1');
    }

    // Get content for both versions
    const { content: content1, metadata: meta1 } = await this.getPageVersion(identifier, version1);
    const { content: content2, metadata: meta2 } = await this.getPageVersion(identifier, version2);

    // Calculate diff from version1 to version2
    const diff = DeltaStorage.createDiff(content1, content2);
    const stats = DeltaStorage.getDiffStats(diff);

    return {
      version1: {
        version: version1,
        ...meta1
      },
      version2: {
        version: version2,
        ...meta2
      },
      diff: diff,
      stats: stats
    };
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
