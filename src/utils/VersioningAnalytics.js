const fs = require('fs-extra');
const path = require('path');
const logger = require('./logger');

/**
 * VersioningAnalytics - Storage analytics and reporting for VersioningFileProvider
 *
 * Provides detailed insights into:
 * - Storage usage (total, per-page, by location)
 * - Version distribution (counts, ages)
 * - Compression effectiveness
 * - Growth trends
 * - Optimization recommendations
 *
 * @example
 * const analytics = new VersioningAnalytics({
 *   provider: versioningProvider
 * });
 *
 * const report = await analytics.generateStorageReport();
 * console.log(`Total storage: ${report.totalStorageMB} MB`);
 */
class VersioningAnalytics {
  /**
   * Create a new VersioningAnalytics instance
   * @param {object} options - Analytics options
   * @param {object} options.provider - VersioningFileProvider instance
   * @param {boolean} options.verbose - Enable verbose logging (default: false)
   */
  constructor(options) {
    if (!options.provider) {
      throw new Error('VersioningAnalytics requires a provider instance');
    }

    this.provider = options.provider;
    this.verbose = options.verbose || false;
  }

  /**
   * Generate comprehensive storage report
   *
   * Analyzes all pages and versions to provide detailed storage statistics.
   *
   * @returns {Promise<object>} Storage report
   */
  async generateStorageReport() {
    this._log('info', 'Generating storage report');

    const startTime = Date.now();
    const pageIndex = this.provider.pageIndex;

    if (!pageIndex || !pageIndex.pages) {
      throw new Error('Page index not available');
    }

    const pages = Object.values(pageIndex.pages);
    const pagesWithVersions = pages.filter(p => p.hasVersions);

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalPages: pages.length,
        pagesWithVersions: pagesWithVersions.length,
        totalVersions: 0,
        averageVersionsPerPage: 0,
        totalStorage: 0,
        totalStorageMB: 0,
        versionStorage: 0,
        versionStorageMB: 0,
        compressionRatio: 0
      },
      byLocation: {
        pages: {
          count: 0,
          storage: 0,
          versions: 0
        },
        'required-pages': {
          count: 0,
          storage: 0,
          versions: 0
        }
      },
      topPages: [],
      versionDistribution: {},
      compressionStats: {
        compressedVersions: 0,
        uncompressedVersions: 0,
        spacesSaved: 0,
        potentialSavings: 0
      },
      recommendations: []
    };

    // Analyze each page
    for (const page of pagesWithVersions) {
      try {
        const pageStats = await this._analyzePageStorage(page);

        // Update summary
        report.summary.totalVersions += pageStats.versionCount;
        report.summary.versionStorage += pageStats.totalSize;

        // Update by location
        const loc = page.location || 'pages';
        report.byLocation[loc].count++;
        report.byLocation[loc].storage += pageStats.totalSize;
        report.byLocation[loc].versions += pageStats.versionCount;

        // Update compression stats
        report.compressionStats.compressedVersions += pageStats.compressedVersions;
        report.compressionStats.uncompressedVersions += pageStats.uncompressedVersions;
        report.compressionStats.spacesSaved += pageStats.compressionSaved;

        // Add to top pages
        report.topPages.push({
          title: page.title,
          uuid: page.uuid,
          versionCount: pageStats.versionCount,
          storage: pageStats.totalSize,
          storageMB: (pageStats.totalSize / (1024 * 1024)).toFixed(2),
          compressed: pageStats.compressedVersions,
          averageVersionSize: (pageStats.totalSize / pageStats.versionCount).toFixed(0)
        });

        // Update version distribution
        const bucket = this._getVersionBucket(pageStats.versionCount);
        report.versionDistribution[bucket] = (report.versionDistribution[bucket] || 0) + 1;

        this._log('verbose', `Analyzed ${page.title}: ${pageStats.versionCount} versions, ${(pageStats.totalSize / 1024).toFixed(0)} KB`);
      } catch (error) {
        this._log('error', `Failed to analyze ${page.title}: ${error.message}`);
      }
    }

    // Calculate derived metrics
    report.summary.averageVersionsPerPage = (report.summary.totalVersions / pagesWithVersions.length).toFixed(2);
    report.summary.totalStorage = report.summary.versionStorage;
    report.summary.totalStorageMB = (report.summary.totalStorage / (1024 * 1024)).toFixed(2);
    report.summary.versionStorageMB = (report.summary.versionStorage / (1024 * 1024)).toFixed(2);

    // Sort top pages by storage
    report.topPages.sort((a, b) => b.storage - a.storage);
    report.topPages = report.topPages.slice(0, 20); // Keep top 20

    // Generate recommendations
    report.recommendations = this._generateRecommendations(report);

    const duration = Date.now() - startTime;
    report.generationTime = duration;
    report.generationTimeSeconds = (duration / 1000).toFixed(2);

    this._log('info', `Report generated in ${report.generationTimeSeconds}s`);

    return report;
  }

  /**
   * Analyze storage for a single page
   * @param {object} page - Page info from index
   * @returns {Promise<object>} Page storage statistics
   * @private
   */
  async _analyzePageStorage(page) {
    const versionDir = this.provider._getVersionDirectory(page.uuid, page.location);

    // Load manifest
    const manifestPath = path.join(versionDir, 'manifest.json');
    if (!await fs.pathExists(manifestPath)) {
      return {
        versionCount: 0,
        totalSize: 0,
        compressedVersions: 0,
        uncompressedVersions: 0,
        compressionSaved: 0
      };
    }

    const manifest = await fs.readJson(manifestPath);

    let totalSize = 0;
    let compressedVersions = 0;
    let uncompressedVersions = 0;
    let compressionSaved = 0;

    for (const versionMeta of manifest.versions) {
      const vPath = path.join(versionDir, `v${versionMeta.version}`);

      if (await fs.pathExists(vPath)) {
        const versionSize = await this._getDirectorySize(vPath);
        totalSize += versionSize;

        if (versionMeta.compressed) {
          compressedVersions++;
        } else {
          uncompressedVersions++;
        }
      }
    }

    return {
      versionCount: manifest.versions.length,
      totalSize,
      compressedVersions,
      uncompressedVersions,
      compressionSaved
    };
  }

  /**
   * Get total size of a directory recursively
   * @param {string} dirPath - Directory path
   * @returns {Promise<number>} Total size in bytes
   * @private
   */
  async _getDirectorySize(dirPath) {
    let totalSize = 0;

    if (!await fs.pathExists(dirPath)) {
      return 0;
    }

    const items = await fs.readdir(dirPath);
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = await fs.stat(itemPath);

      if (stats.isDirectory()) {
        totalSize += await this._getDirectorySize(itemPath);
      } else {
        totalSize += stats.size;
      }
    }

    return totalSize;
  }

  /**
   * Get version count bucket for distribution
   * @param {number} count - Version count
   * @returns {string} Bucket label
   * @private
   */
  _getVersionBucket(count) {
    if (count === 1) return '1';
    if (count <= 5) return '2-5';
    if (count <= 10) return '6-10';
    if (count <= 20) return '11-20';
    if (count <= 50) return '21-50';
    return '50+';
  }

  /**
   * Generate optimization recommendations
   * @param {object} report - Storage report
   * @returns {Array<object>} Recommendations
   * @private
   */
  _generateRecommendations(report) {
    const recommendations = [];

    // Check for pages with many versions
    const highVersionPages = report.topPages.filter(p => p.versionCount > 50);
    if (highVersionPages.length > 0) {
      recommendations.push({
        type: 'cleanup',
        priority: 'high',
        message: `${highVersionPages.length} pages have more than 50 versions`,
        action: 'Run cleanup to purge old versions',
        command: 'npm run maintain:versioning -- --cleanup --keep-latest 50'
      });
    }

    // Check for uncompressed versions
    const uncompressedRatio = report.compressionStats.uncompressedVersions /
      (report.compressionStats.compressedVersions + report.compressionStats.uncompressedVersions);

    if (uncompressedRatio > 0.5) {
      recommendations.push({
        type: 'compression',
        priority: 'medium',
        message: `${(uncompressedRatio * 100).toFixed(0)}% of versions are uncompressed`,
        action: 'Run compression to reduce storage usage',
        command: 'npm run maintain:versioning -- --compress',
        estimatedSavings: `~${((report.summary.versionStorage * 0.6) / (1024 * 1024)).toFixed(0)} MB`
      });
    }

    // Check for large individual pages
    const largePages = report.topPages.filter(p => parseFloat(p.storageMB) > 10);
    if (largePages.length > 0) {
      recommendations.push({
        type: 'review',
        priority: 'medium',
        message: `${largePages.length} pages use more than 10 MB each`,
        action: 'Review these pages for cleanup opportunities',
        pages: largePages.slice(0, 5).map(p => p.title)
      });
    }

    // Check version distribution
    const manyVersionsCount = (report.versionDistribution['21-50'] || 0) + (report.versionDistribution['50+'] || 0);
    if (manyVersionsCount > report.summary.pagesWithVersions * 0.3) {
      recommendations.push({
        type: 'policy',
        priority: 'low',
        message: `${manyVersionsCount} pages have 20+ versions`,
        action: 'Consider adjusting retention policy',
        suggestion: 'Reduce maxVersions or retentionDays in configuration'
      });
    }

    return recommendations;
  }

  /**
   * Get storage usage for a specific page
   *
   * @param {string} identifier - Page UUID or title
   * @returns {Promise<object>} Page storage details
   */
  async getPageStorageDetails(identifier) {
    // Resolve identifier
    const resolved = await this.provider._resolveIdentifier(identifier);
    if (!resolved) {
      throw new Error(`Page not found: ${identifier}`);
    }

    const { uuid, location } = resolved;
    const pageInfo = this.provider.pageIndex.pages[uuid];

    const stats = await this._analyzePageStorage(pageInfo);

    // Get manifest for version details
    const versionDir = this.provider._getVersionDirectory(uuid, location);
    const manifestPath = path.join(versionDir, 'manifest.json');
    const manifest = await fs.readJson(manifestPath);

    const versionDetails = [];
    for (const versionMeta of manifest.versions) {
      const vPath = path.join(versionDir, `v${versionMeta.version}`);
      if (await fs.pathExists(vPath)) {
        const size = await this._getDirectorySize(vPath);
        versionDetails.push({
          version: versionMeta.version,
          date: versionMeta.dateCreated,
          author: versionMeta.author,
          size: size,
          sizeKB: (size / 1024).toFixed(2),
          compressed: versionMeta.compressed || false,
          isDelta: versionMeta.isDelta || false
        });
      }
    }

    return {
      page: {
        title: pageInfo.title,
        uuid: uuid,
        location: location
      },
      summary: {
        versionCount: stats.versionCount,
        totalSize: stats.totalSize,
        totalSizeMB: (stats.totalSize / (1024 * 1024)).toFixed(2),
        averageVersionSize: (stats.totalSize / stats.versionCount / 1024).toFixed(2),
        compressedVersions: stats.compressedVersions,
        uncompressedVersions: stats.uncompressedVersions
      },
      versions: versionDetails,
      storageByType: {
        fullContent: versionDetails.filter(v => !v.isDelta).reduce((sum, v) => sum + v.size, 0),
        deltas: versionDetails.filter(v => v.isDelta).reduce((sum, v) => sum + v.size, 0),
        metadata: stats.totalSize - versionDetails.reduce((sum, v) => sum + v.size, 0)
      }
    };
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
        logger.info(`[VersioningAnalytics] ${message}`);
        break;
      case 'verbose':
        logger.info(`[VersioningAnalytics] ${message}`);
        break;
      case 'error':
        logger.error(`[VersioningAnalytics] ${message}`);
        break;
    }
  }
}

module.exports = VersioningAnalytics;
