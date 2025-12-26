/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-unsafe-return */
import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import logger from './logger';
import DeltaStorage from './DeltaStorage';

/**
 * VersioningMigration - Utility for migrating FileSystemProvider to VersioningFileProvider
 *
 * Provides safe migration of existing amdWiki pages to versioned format with:
 * - Full data preservation and validation
 * - Rollback capability
 * - Progress tracking
 * - Detailed reporting
 *
 * @example
 * const migration = new VersioningMigration({
 *   pagesDir: './pages',
 *   requiredPagesDir: './required-pages',
 *   dataDir: './data',
 *   dryRun: false
 * });
 *
 * const report = await migration.migrateFromFileSystemProvider();
 * console.log(`Migrated ${report.pagesProcessed} pages`);
 */
class VersioningMigration {
  /**
   * Create a new VersioningMigration instance
   * @param {object} options - Migration options
   * @param {string} options.pagesDir - Path to pages directory
   * @param {string} options.requiredPagesDir - Path to required-pages directory
   * @param {string} options.dataDir - Path to data directory
   * @param {boolean} options.dryRun - If true, don't write any files (default: false)
   * @param {boolean} options.verbose - Enable verbose logging (default: false)
   * @param {Function} options.progressCallback - Optional callback for progress updates
   */
  constructor(options) {
    this.pagesDir = options.pagesDir;
    this.requiredPagesDir = options.requiredPagesDir;
    this.dataDir = options.dataDir;
    this.dryRun = options.dryRun || false;
    this.verbose = options.verbose || false;
    this.progressCallback = options.progressCallback || null;

    // Migration state
    this.migrationLog = [];
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Migrate existing pages from FileSystemProvider to VersioningFileProvider
   *
   * Algorithm:
   * 1. Scan all existing .md files in pages/ and required-pages/
   * 2. For each page:
   *    a. Read and parse content + frontmatter
   *    b. Create version directory structure
   *    c. Create v1 with full content
   *    d. Create manifest.json
   *    e. Add entry to page-index.json
   * 3. Validate migration integrity
   * 4. Generate detailed report
   *
   * @returns {Promise<object>} Migration report with statistics
   * @throws {Error} If migration fails critically
   */
  async migrateFromFileSystemProvider() {
    const startTime = Date.now();
    this._log('info', 'Starting migration from FileSystemProvider to VersioningFileProvider');

    try {
      // Phase 1: Discovery - find all existing pages
      this._log('info', 'Phase 1: Discovering existing pages');
      const pages = await this._discoverPages();
      this._log('info', `Found ${pages.length} pages to migrate`);

      if (pages.length === 0) {
        return this._generateReport(startTime, 0, 0, 0);
      }

      // Phase 2: Pre-migration validation
      this._log('info', 'Phase 2: Pre-migration validation');
      await this._validatePreMigration(pages);

      // Phase 3: Create directory structure
      if (!this.dryRun) {
        this._log('info', 'Phase 3: Creating directory structure');
        await this._createDirectoryStructure();
      }

      // Phase 4: Migrate each page
      this._log('info', `Phase 4: Migrating ${pages.length} pages`);
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        this._reportProgress(i + 1, pages.length, page.filename);

        try {
          await this._migratePage(page);
          successCount++;
          this._log('verbose', `✓ Migrated: ${page.title} (${page.uuid})`);
        } catch (error) {
          errorCount++;
          this._logError(`Failed to migrate ${page.filename}: ${error.message}`);
        }
      }

      // Phase 5: Build page index
      if (!this.dryRun) {
        this._log('info', 'Phase 5: Building page index');
        await this._buildPageIndex(pages.filter((_, i) => i < successCount));
      }

      // Phase 6: Post-migration validation
      if (!this.dryRun) {
        this._log('info', 'Phase 6: Post-migration validation');
        const validationResult = await this.validateMigration();
        if (!validationResult.valid) {
          this._logWarning(`Validation found ${validationResult.errors.length} issues`);
        }
      }

      // Generate final report
      const duration = Date.now() - startTime;
      this._log('info', `Migration completed in ${(duration / 1000).toFixed(2)}s`);

      return this._generateReport(startTime, pages.length, successCount, errorCount);
    } catch (error) {
      this._logError(`Migration failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Discover all existing pages in pages/ and required-pages/
   * @returns {Promise<Array>} Array of page info objects
   * @private
   */
  async _discoverPages() {
    const pages = [];

    // Scan pages directory
    if (await fs.pathExists(this.pagesDir)) {
      const files = await fs.readdir(this.pagesDir);
      for (const file of files) {
        if (file.endsWith('.md')) {
          const pageInfo = await this._readPageFile(path.join(this.pagesDir, file), 'pages');
          if (pageInfo) {
            pages.push(pageInfo);
          }
        }
      }
    }

    // Scan required-pages directory
    if (await fs.pathExists(this.requiredPagesDir)) {
      const files = await fs.readdir(this.requiredPagesDir);
      for (const file of files) {
        if (file.endsWith('.md')) {
          const pageInfo = await this._readPageFile(path.join(this.requiredPagesDir, file), 'required-pages');
          if (pageInfo) {
            pages.push(pageInfo);
          }
        }
      }
    }

    return pages;
  }

  /**
   * Read and parse a page file
   * @param {string} filePath - Path to page file
   * @param {string} location - 'pages' or 'required-pages'
   * @returns {Promise<object|null>} Page info or null if invalid
   * @private
   */
  async _readPageFile(filePath, location) {
    try {
      const fileContent = await fs.readFile(filePath, 'utf8');
      const { data: frontmatter, content } = matter(fileContent);

      // Validate required fields
      if (!frontmatter.uuid) {
        this._logWarning(`Page ${filePath} missing UUID, skipping`);
        return null;
      }

      if (!frontmatter.title) {
        this._logWarning(`Page ${filePath} missing title, skipping`);
        return null;
      }

      return {
        filePath,
        filename: path.basename(filePath),
        uuid: frontmatter.uuid,
        title: frontmatter.title,
        content: content,
        frontmatter: frontmatter,
        location: location
      };
    } catch (error) {
      this._logError(`Failed to read ${filePath}: ${error.message}`);
      return null;
    }
  }

  /**
   * Validate pages before migration
   * @param {Array} pages - Pages to validate
   * @private
   */
  async _validatePreMigration(pages) {
    // Check for duplicate UUIDs
    const uuids = new Set();
    for (const page of pages) {
      if (uuids.has(page.uuid)) {
        throw new Error(`Duplicate UUID found: ${page.uuid}`);
      }
      uuids.add(page.uuid);
    }

    // Check for existing version directories (already migrated?)
    for (const page of pages) {
      const versionDir = this._getVersionDirectory(page.uuid, page.location);
      if (await fs.pathExists(versionDir)) {
        this._logWarning(`Version directory already exists for ${page.title} (${page.uuid})`);
      }
    }
  }

  /**
   * Create directory structure for versioning
   * @private
   */
  async _createDirectoryStructure() {
    // Create version directories
    const pagesVersionsDir = path.join(this.pagesDir, 'versions');
    const requiredPagesVersionsDir = path.join(this.requiredPagesDir, 'versions');

    await fs.ensureDir(pagesVersionsDir);
    await fs.ensureDir(requiredPagesVersionsDir);

    // Create data directory
    await fs.ensureDir(this.dataDir);

    this._log('verbose', 'Created directory structure');
  }

  /**
   * Migrate a single page
   * @param {object} page - Page info
   * @private
   */
  async _migratePage(page) {
    const versionDir = this._getVersionDirectory(page.uuid, page.location);
    const v1Dir = path.join(versionDir, 'v1');

    if (this.dryRun) {
      this._log('verbose', `[DRY RUN] Would create: ${versionDir}`);
      return;
    }

    // Create v1 directory
    await fs.ensureDir(v1Dir);

    // Write v1 content
    const contentPath = path.join(v1Dir, 'content.md');
    await fs.writeFile(contentPath, page.content, 'utf8');

    // Create v1 metadata
    const metadata = {
      dateCreated: page.frontmatter.lastModified || new Date().toISOString(),
      author: page.frontmatter.author || 'system',
      changeType: 'created',
      comment: 'Initial version (migrated from FileSystemProvider)',
      contentHash: DeltaStorage.calculateHash(page.content),
      contentSize: Buffer.byteLength(page.content, 'utf8'),
      compressed: false,
      isDelta: false
    };

    const metaPath = path.join(v1Dir, 'meta.json');
    await fs.writeFile(metaPath, JSON.stringify(metadata, null, 2), 'utf8');

    // Create manifest
    const manifest = {
      pageId: page.uuid,
      pageName: page.title,
      currentVersion: 1,
      versions: [
        {
          version: 1,
          ...metadata
        }
      ]
    };

    const manifestPath = path.join(versionDir, 'manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

    this.migrationLog.push({
      uuid: page.uuid,
      title: page.title,
      location: page.location,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Build centralized page index
   * @param {Array} pages - Successfully migrated pages
   * @private
   */
  async _buildPageIndex(pages) {
    const pageIndex = {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      pageCount: pages.length,
      pages: {}
    };

    for (const page of pages) {
      pageIndex.pages[page.uuid] = {
        uuid: page.uuid,
        title: page.title,
        currentVersion: 1,
        location: page.location,
        lastModified: page.frontmatter.lastModified || new Date().toISOString(),
        author: page.frontmatter.author || 'system',
        hasVersions: true
      };
    }

    const indexPath = path.join(this.dataDir, 'page-index.json');
    await fs.writeFile(indexPath, JSON.stringify(pageIndex, null, 2), 'utf8');

    this._log('verbose', `Created page index with ${pages.length} entries`);
  }

  /**
   * Get version directory for a page
   * @param {string} uuid - Page UUID
   * @param {string} location - 'pages' or 'required-pages'
   * @returns {string} Version directory path
   * @private
   */
  _getVersionDirectory(uuid, location) {
    const baseDir = location === 'required-pages' ? this.requiredPagesDir : this.pagesDir;
    return path.join(baseDir, 'versions', uuid);
  }

  /**
   * Validate migration integrity
   *
   * Checks:
   * - All pages have version directories
   * - manifest.json files are valid
   * - Content hashes match
   * - page-index.json is accurate
   *
   * @returns {Promise<object>} Validation result
   */
  async validateMigration() {
    const errors = [];
    const warnings = [];

    this._log('info', 'Validating migration integrity');

    // Check page index exists
    const indexPath = path.join(this.dataDir, 'page-index.json');
    if (!await fs.pathExists(indexPath)) {
      errors.push('page-index.json not found');
      return { valid: false, errors, warnings };
    }

    // Load page index
    let pageIndex;
    try {
      const indexData = await fs.readFile(indexPath, 'utf8');
      pageIndex = JSON.parse(indexData);
    } catch (error) {
      errors.push(`Failed to read page-index.json: ${error.message}`);
      return { valid: false, errors, warnings };
    }

    // Validate each page in index
    for (const [uuid, pageInfo] of Object.entries(pageIndex.pages)) {
      // Check version directory exists
      const versionDir = this._getVersionDirectory(uuid, pageInfo.location);
      if (!await fs.pathExists(versionDir)) {
        errors.push(`Version directory not found for ${uuid}`);
        continue;
      }

      // Check manifest exists
      const manifestPath = path.join(versionDir, 'manifest.json');
      if (!await fs.pathExists(manifestPath)) {
        errors.push(`manifest.json not found for ${uuid}`);
        continue;
      }

      // Validate manifest structure
      try {
        const manifestData = await fs.readFile(manifestPath, 'utf8');
        const manifest = JSON.parse(manifestData);

        if (manifest.pageId !== uuid) {
          errors.push(`Manifest pageId mismatch for ${uuid}`);
        }

        if (manifest.currentVersion !== 1) {
          warnings.push(`Page ${uuid} has version ${manifest.currentVersion} (expected 1 for fresh migration)`);
        }

        if (!Array.isArray(manifest.versions) || manifest.versions.length === 0) {
          errors.push(`Manifest versions invalid for ${uuid}`);
        }
      } catch (error) {
        errors.push(`Failed to validate manifest for ${uuid}: ${error.message}`);
        continue;
      }

      // Check v1 content exists
      const v1ContentPath = path.join(versionDir, 'v1', 'content.md');
      if (!await fs.pathExists(v1ContentPath)) {
        errors.push(`v1 content not found for ${uuid}`);
        continue;
      }

      // Validate content hash
      try {
        const content = await fs.readFile(v1ContentPath, 'utf8');
        const actualHash = DeltaStorage.calculateHash(content);

        const metaPath = path.join(versionDir, 'v1', 'meta.json');
        const metaData = await fs.readFile(metaPath, 'utf8');
        const meta = JSON.parse(metaData);

        if (meta.contentHash !== actualHash) {
          errors.push(`Content hash mismatch for ${uuid}`);
        }
      } catch (error) {
        errors.push(`Failed to validate content hash for ${uuid}: ${error.message}`);
      }
    }

    const valid = errors.length === 0;
    this._log('info', `Validation complete: ${valid ? 'PASSED' : 'FAILED'}`);
    if (errors.length > 0) {
      this._log('info', `Errors: ${errors.length}`);
    }
    if (warnings.length > 0) {
      this._log('info', `Warnings: ${warnings.length}`);
    }

    return { valid, errors, warnings };
  }

  /**
   * Rollback migration (remove all versioning artifacts)
   *
   * WARNING: This removes version directories and page-index.json.
   * Original page files are NOT affected.
   *
   * @returns {Promise<object>} Rollback report
   */
  async rollbackMigration() {
    this._log('info', 'Starting migration rollback');

    const removed = {
      versionDirectories: 0,
      pageIndex: false
    };

    try {
      // Remove version directories
      const pagesVersionsDir = path.join(this.pagesDir, 'versions');
      if (await fs.pathExists(pagesVersionsDir)) {
        const uuids = await fs.readdir(pagesVersionsDir);
        for (const uuid of uuids) {
          const versionDir = path.join(pagesVersionsDir, uuid);
          if ((await fs.stat(versionDir)).isDirectory()) {
            await fs.remove(versionDir);
            removed.versionDirectories++;
          }
        }
        // Remove versions directory itself if empty
        const remaining = await fs.readdir(pagesVersionsDir);
        if (remaining.length === 0) {
          await fs.remove(pagesVersionsDir);
        }
      }

      const requiredPagesVersionsDir = path.join(this.requiredPagesDir, 'versions');
      if (await fs.pathExists(requiredPagesVersionsDir)) {
        const uuids = await fs.readdir(requiredPagesVersionsDir);
        for (const uuid of uuids) {
          const versionDir = path.join(requiredPagesVersionsDir, uuid);
          if ((await fs.stat(versionDir)).isDirectory()) {
            await fs.remove(versionDir);
            removed.versionDirectories++;
          }
        }
        // Remove versions directory itself if empty
        const remaining = await fs.readdir(requiredPagesVersionsDir);
        if (remaining.length === 0) {
          await fs.remove(requiredPagesVersionsDir);
        }
      }

      // Remove page index
      const indexPath = path.join(this.dataDir, 'page-index.json');
      if (await fs.pathExists(indexPath)) {
        await fs.remove(indexPath);
        removed.pageIndex = true;
      }

      this._log('info', `Rollback complete: removed ${removed.versionDirectories} version directories`);
      return removed;
    } catch (error) {
      this._logError(`Rollback failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate migration report
   * @param {number} startTime - Migration start timestamp
   * @param {number} totalPages - Total pages found
   * @param {number} successCount - Successfully migrated
   * @param {number} errorCount - Failed migrations
   * @returns {object} Migration report
   * @private
   */
  _generateReport(startTime, totalPages, successCount, errorCount) {
    const duration = Date.now() - startTime;

    return {
      success: errorCount === 0,
      dryRun: this.dryRun,
      duration: duration,
      durationSeconds: (duration / 1000).toFixed(2),
      pagesDiscovered: totalPages,
      pagesProcessed: successCount,
      pagesFailed: errorCount,
      errors: this.errors,
      warnings: this.warnings,
      migrationLog: this.migrationLog,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Report progress to callback
   * @param {number} current - Current page number
   * @param {number} total - Total pages
   * @param {string} pageName - Current page name
   * @private
   */
  _reportProgress(current, total, pageName) {
    const percentage = ((current / total) * 100).toFixed(1);
    if (this.progressCallback) {
      this.progressCallback({
        current,
        total,
        percentage,
        pageName
      });
    }
  }

  /**
   * Log message based on level
   * @param {string} level - Log level (info, verbose, error, warning)
   * @param {string} message - Message to log
   * @private
   */
  _log(level, message) {
    if (level === 'verbose' && !this.verbose) {
      return;
    }

    switch (level) {
    case 'info':
      logger.info(`[VersioningMigration] ${message}`);
      break;
    case 'verbose':
      logger.info(`[VersioningMigration] ${message}`);
      break;
    case 'error':
      logger.error(`[VersioningMigration] ${message}`);
      break;
    case 'warning':
      logger.warn(`[VersioningMigration] ${message}`);
      break;
    }
  }

  /**
   * Log error message
   * @param {string} message - Error message
   * @private
   */
  _logError(message) {
    this.errors.push(message);
    this._log('error', message);
  }

  /**
   * Log warning message
   * @param {string} message - Warning message
   * @private
   */
  _logWarning(message) {
    this.warnings.push(message);
    this._log('warning', message);
  }
}

export default VersioningMigration;
