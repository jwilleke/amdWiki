const fs = require('fs-extra');
const path = require('path');
const logger = require('./logger');
const VersionCompression = require('./VersionCompression');

/**
 * VersioningMaintenance - Automated maintenance utilities for VersioningFileProvider
 *
 * Provides batch operations for:
 * - Version cleanup (purging old versions)
 * - Version compression (gzip old versions)
 * - Storage analytics (usage statistics)
 * - Automated maintenance scheduling
 *
 * @example
 * const maintenance = new VersioningMaintenance({
 *   provider: versioningProvider,
 *   dryRun: false
 * });
 *
 * const report = await maintenance.cleanupAllPages({
 *   keepLatest: 20,
 *   retentionDays: 90
 * });
 */
class VersioningMaintenance {
  /**
   * Create a new VersioningMaintenance instance
   * @param {object} options - Maintenance options
   * @param {object} options.provider - VersioningFileProvider instance
   * @param {boolean} options.dryRun - Preview mode without making changes (default: false)
   * @param {boolean} options.verbose - Enable verbose logging (default: false)
   * @param {Function} options.progressCallback - Optional progress callback
   */
  constructor(options) {
    if (!options.provider) {
      throw new Error('VersioningMaintenance requires a provider instance');
    }

    this.provider = options.provider;
    this.dryRun = options.dryRun || false;
    this.verbose = options.verbose || false;
    this.progressCallback = options.progressCallback || null;

    // Statistics
    this.stats = {
      pagesProcessed: 0,
      versionsRemoved: 0,
      spaceFreed: 0,
      versionsCompressed: 0,
      compressionSaved: 0,
      errors: []
    };
  }

  /**
   * Clean up old versions for all pages
   *
   * Performs batch purge operation across all pages with version history.
   *
   * @param {object} options - Cleanup options
   * @param {number} options.keepLatest - Minimum versions to keep (default: 10)
   * @param {number} options.retentionDays - Keep versions newer than this (default: 365)
   * @param {boolean} options.keepMilestones - Keep milestone versions (default: true)
   * @returns {Promise<object>} Cleanup report
   */
  async cleanupAllPages(options = {}) {
    this._log('info', 'Starting cleanup for all pages');

    const startTime = Date.now();
    const pageIndex = this.provider.pageIndex;

    if (!pageIndex || !pageIndex.pages) {
      throw new Error('Page index not available');
    }

    const pages = Object.values(pageIndex.pages).filter(p => p.hasVersions);
    this._log('info', `Found ${pages.length} pages with versions`);

    this.stats = {
      pagesProcessed: 0,
      versionsRemoved: 0,
      spaceFreed: 0,
      versionsCompressed: 0,
      compressionSaved: 0,
      errors: []
    };

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      this._reportProgress(i + 1, pages.length, page.title);

      try {
        const result = await this.provider.purgeOldVersions(page.uuid, {
          ...options,
          dryRun: this.dryRun
        });

        this.stats.pagesProcessed++;
        this.stats.versionsRemoved += result.versionsRemoved;
        this.stats.spaceFreed += result.spaceFreed;

        this._log('verbose', `Cleaned ${page.title}: removed ${result.versionsRemoved} versions`);
      } catch (error) {
        this._log('error', `Failed to cleanup ${page.title}: ${error.message}`);
        this.stats.errors.push({
          page: page.title,
          uuid: page.uuid,
          error: error.message
        });
      }
    }

    const duration = Date.now() - startTime;

    return {
      success: this.stats.errors.length === 0,
      dryRun: this.dryRun,
      duration: duration,
      durationSeconds: (duration / 1000).toFixed(2),
      pagesProcessed: this.stats.pagesProcessed,
      versionsRemoved: this.stats.versionsRemoved,
      spaceFreed: this.stats.spaceFreed,
      spaceFreedMB: (this.stats.spaceFreed / (1024 * 1024)).toFixed(2),
      errors: this.stats.errors
    };
  }

  /**
   * Compress old versions for all pages
   *
   * Applies gzip compression to versions older than specified threshold.
   * Significantly reduces storage usage for old versions.
   *
   * @param {object} options - Compression options
   * @param {number} options.ageThresholdDays - Compress versions older than this (default: 30)
   * @param {number} options.compressionLevel - Gzip compression level 1-9 (default: 6)
   * @param {boolean} options.skipAlreadyCompressed - Skip already compressed files (default: true)
   * @returns {Promise<object>} Compression report
   */
  async compressAllVersions(options = {}) {
    this._log('info', 'Starting compression for all old versions');

    const startTime = Date.now();
    const ageThresholdDays = options.ageThresholdDays || 30;
    const compressionLevel = options.compressionLevel || 6;
    const skipAlreadyCompressed = options.skipAlreadyCompressed !== false;

    const pageIndex = this.provider.pageIndex;
    if (!pageIndex || !pageIndex.pages) {
      throw new Error('Page index not available');
    }

    const pages = Object.values(pageIndex.pages).filter(p => p.hasVersions);
    this._log('info', `Found ${pages.length} pages with versions`);

    this.stats.versionsCompressed = 0;
    this.stats.compressionSaved = 0;
    this.stats.errors = [];

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      this._reportProgress(i + 1, pages.length, page.title);

      try {
        const result = await this._compressPageVersions(page, {
          ageThresholdDays,
          compressionLevel,
          skipAlreadyCompressed
        });

        this.stats.versionsCompressed += result.versionsCompressed;
        this.stats.compressionSaved += result.spaceFreed;

        this._log('verbose', `Compressed ${page.title}: ${result.versionsCompressed} versions`);
      } catch (error) {
        this._log('error', `Failed to compress ${page.title}: ${error.message}`);
        this.stats.errors.push({
          page: page.title,
          uuid: page.uuid,
          error: error.message
        });
      }
    }

    const duration = Date.now() - startTime;

    return {
      success: this.stats.errors.length === 0,
      dryRun: this.dryRun,
      duration: duration,
      durationSeconds: (duration / 1000).toFixed(2),
      pagesProcessed: pages.length,
      versionsCompressed: this.stats.versionsCompressed,
      spaceFreed: this.stats.compressionSaved,
      spaceFreedMB: (this.stats.compressionSaved / (1024 * 1024)).toFixed(2),
      errors: this.stats.errors
    };
  }

  /**
   * Compress old versions for a single page
   * @param {object} page - Page info from index
   * @param {object} options - Compression options
   * @returns {Promise<object>} Compression result
   * @private
   */
  async _compressPageVersions(page, options) {
    const { ageThresholdDays, compressionLevel, skipAlreadyCompressed } = options;

    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - ageThresholdDays);

    // Get version directory
    const versionDir = this.provider._getVersionDirectory(page.uuid, page.location);

    // Load manifest
    const manifestPath = path.join(versionDir, 'manifest.json');
    if (!await fs.pathExists(manifestPath)) {
      return { versionsCompressed: 0, spaceFreed: 0 };
    }

    const manifest = await fs.readJson(manifestPath);
    let versionsCompressed = 0;
    let spaceFreed = 0;

    for (const versionMeta of manifest.versions) {
      // Skip if too recent
      const versionDate = new Date(versionMeta.dateCreated);
      if (versionDate >= cutoffDate) {
        continue;
      }

      // Skip if already compressed (if option set)
      if (skipAlreadyCompressed && versionMeta.compressed) {
        continue;
      }

      // Compress version files
      const vPath = path.join(versionDir, `v${versionMeta.version}`);
      if (await fs.pathExists(vPath)) {
        try {
          const result = await this._compressVersionFiles(vPath, compressionLevel);
          if (result.compressed > 0) {
            versionsCompressed++;
            spaceFreed += result.spaceFreed;

            // Update metadata
            versionMeta.compressed = true;
            if (!this.dryRun) {
              await fs.writeJson(manifestPath, manifest, { spaces: 2 });
            }
          }
        } catch (error) {
          this._log('verbose', `Failed to compress v${versionMeta.version}: ${error.message}`);
        }
      }
    }

    return { versionsCompressed, spaceFreed };
  }

  /**
   * Compress files in a version directory
   * @param {string} versionPath - Path to version directory
   * @param {number} compressionLevel - Compression level
   * @returns {Promise<object>} Compression result
   * @private
   */
  async _compressVersionFiles(versionPath, compressionLevel) {
    let compressed = 0;
    let spaceFreed = 0;

    const contentPath = path.join(versionPath, 'content.md');
    const diffPath = path.join(versionPath, 'content.diff');

    // Compress content.md if exists and not already compressed
    if (await fs.pathExists(contentPath) && !await fs.pathExists(`${contentPath}.gz`)) {
      if (!this.dryRun) {
        const result = await VersionCompression.compressFile(contentPath, {
          level: compressionLevel,
          keepOriginal: false
        });
        spaceFreed += (result.originalSize - result.compressedSize);
      }
      compressed++;
    }

    // Compress content.diff if exists and not already compressed
    if (await fs.pathExists(diffPath) && !await fs.pathExists(`${diffPath}.gz`)) {
      if (!this.dryRun) {
        const result = await VersionCompression.compressFile(diffPath, {
          level: compressionLevel,
          keepOriginal: false
        });
        spaceFreed += (result.originalSize - result.compressedSize);
      }
      compressed++;
    }

    return { compressed, spaceFreed };
  }

  /**
   * Run full maintenance (cleanup + compression)
   *
   * Performs both cleanup and compression in a single operation.
   *
   * @param {object} options - Maintenance options
   * @param {object} options.cleanup - Cleanup options (passed to cleanupAllPages)
   * @param {object} options.compression - Compression options (passed to compressAllVersions)
   * @returns {Promise<object>} Combined maintenance report
   */
  async runFullMaintenance(options = {}) {
    this._log('info', 'Running full maintenance cycle');

    const cleanupOptions = options.cleanup || {};
    const compressionOptions = options.compression || {};

    const reports = {};

    // Run cleanup
    try {
      this._log('info', 'Phase 1: Cleanup old versions');
      reports.cleanup = await this.cleanupAllPages(cleanupOptions);
      this._log('info', `Cleanup complete: removed ${reports.cleanup.versionsRemoved} versions`);
    } catch (error) {
      this._log('error', `Cleanup failed: ${error.message}`);
      reports.cleanup = { success: false, error: error.message };
    }

    // Run compression
    try {
      this._log('info', 'Phase 2: Compress old versions');
      reports.compression = await this.compressAllVersions(compressionOptions);
      this._log('info', `Compression complete: compressed ${reports.compression.versionsCompressed} versions`);
    } catch (error) {
      this._log('error', `Compression failed: ${error.message}`);
      reports.compression = { success: false, error: error.message };
    }

    return {
      success: reports.cleanup.success && reports.compression.success,
      dryRun: this.dryRun,
      cleanup: reports.cleanup,
      compression: reports.compression,
      totalSpaceFreed: (reports.cleanup.spaceFreed || 0) + (reports.compression.spaceFreed || 0),
      totalSpaceFreedMB: ((reports.cleanup.spaceFreed || 0) + (reports.compression.spaceFreed || 0)) / (1024 * 1024).toFixed(2)
    };
  }

  /**
   * Report progress to callback
   * @param {number} current - Current item number
   * @param {number} total - Total items
   * @param {string} itemName - Current item name
   * @private
   */
  _reportProgress(current, total, itemName) {
    const percentage = ((current / total) * 100).toFixed(1);
    if (this.progressCallback) {
      this.progressCallback({
        current,
        total,
        percentage,
        itemName
      });
    }
  }

  /**
   * Log message based on level
   * @param {string} level - Log level (info, verbose, error)
   * @param {string} message - Message to log
   * @private
   */
  _log(level, message) {
    if (level === 'verbose' && !this.verbose) {
      return;
    }

    switch (level) {
      case 'info':
        logger.info(`[VersioningMaintenance] ${message}`);
        break;
      case 'verbose':
        logger.info(`[VersioningMaintenance] ${message}`);
        break;
      case 'error':
        logger.error(`[VersioningMaintenance] ${message}`);
        break;
    }
  }
}

module.exports = VersioningMaintenance;
