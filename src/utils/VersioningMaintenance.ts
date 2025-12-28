/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import fs from 'fs-extra';
import path from 'path';
import logger from './logger';
import VersionCompression from './VersionCompression';

/**
 * Page information from page index
 */
interface PageInfo {
  title: string;
  uuid: string;
  hasVersions: boolean;
  location: string;
}

/**
 * Page index structure
 */
interface PageIndex {
  pages: Record<string, PageInfo>;
}

/**
 * Versioning provider interface
 */
interface VersioningProvider {
  pageIndex: PageIndex;
  purgeOldVersions(uuid: string, options: PurgeOptions): Promise<PurgeResult>;
  _getVersionDirectory(uuid: string, location: string): string;
}

/**
 * Purge options
 */
interface PurgeOptions {
  keepLatest?: number;
  retentionDays?: number;
  keepMilestones?: boolean;
  dryRun?: boolean;
}

/**
 * Purge result
 */
interface PurgeResult {
  versionsRemoved: number;
  spaceFreed: number;
}

/**
 * Error record
 */
interface ErrorRecord {
  page: string;
  uuid: string;
  error: string;
}

/**
 * Maintenance statistics
 */
interface MaintenanceStats {
  pagesProcessed: number;
  versionsRemoved: number;
  spaceFreed: number;
  versionsCompressed: number;
  compressionSaved: number;
  errors: ErrorRecord[];
}

/**
 * Progress callback data
 */
interface ProgressData {
  current: number;
  total: number;
  percentage: string;
  itemName: string;
}

/**
 * Version metadata from manifest
 */
interface VersionMetadata {
  version: number;
  dateCreated: string;
  compressed?: boolean;
}

/**
 * Version manifest structure
 */
interface VersionManifest {
  versions: VersionMetadata[];
}

/**
 * Maintenance constructor options
 */
interface MaintenanceOptions {
  provider: VersioningProvider;
  dryRun?: boolean;
  verbose?: boolean;
  progressCallback?: ((data: ProgressData) => void) | null;
}

/**
 * Cleanup options
 */
interface CleanupOptions {
  keepLatest?: number;
  retentionDays?: number;
  keepMilestones?: boolean;
}

/**
 * Cleanup report
 */
interface CleanupReport {
  success: boolean;
  dryRun: boolean;
  duration: number;
  durationSeconds: string;
  pagesProcessed: number;
  versionsRemoved: number;
  spaceFreed: number;
  spaceFreedMB: string;
  errors: ErrorRecord[];
}

/**
 * Compression options
 */
interface CompressionOptions {
  ageThresholdDays?: number;
  compressionLevel?: number;
  skipAlreadyCompressed?: boolean;
}

/**
 * Compression result for a page
 */
interface PageCompressionResult {
  versionsCompressed: number;
  spaceFreed: number;
}

/**
 * File compression result
 */
interface FileCompressionResult {
  compressed: number;
  spaceFreed: number;
}

/**
 * Compression report
 */
interface CompressionReport {
  success: boolean;
  dryRun: boolean;
  duration: number;
  durationSeconds: string;
  pagesProcessed: number;
  versionsCompressed: number;
  spaceFreed: number;
  spaceFreedMB: string;
  errors: ErrorRecord[];
}

/**
 * Full maintenance options
 */
interface FullMaintenanceOptions {
  cleanup?: CleanupOptions;
  compression?: CompressionOptions;
}

/**
 * Partial report for failed operations
 */
interface PartialReport {
  success: boolean;
  error?: string;
  spaceFreed?: number;
}

/**
 * Full maintenance report
 */
interface FullMaintenanceReport {
  success: boolean;
  dryRun: boolean;
  cleanup: CleanupReport | PartialReport;
  compression: CompressionReport | PartialReport;
  totalSpaceFreed: number;
  totalSpaceFreedMB: number;
}

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
  private provider: VersioningProvider;
  private dryRun: boolean;
  private verbose: boolean;
  private progressCallback: ((data: ProgressData) => void) | null;
  private stats: MaintenanceStats;

  /**
   * Create a new VersioningMaintenance instance
   * @param options - Maintenance options
   */
  constructor(options: MaintenanceOptions) {
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
   * @param options - Cleanup options
   * @returns Cleanup report
   */
  async cleanupAllPages(options: CleanupOptions = {}): Promise<CleanupReport> {
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
        const errorMessage = error instanceof Error ? error.message : String(error);
        this._log('error', `Failed to cleanup ${page.title}: ${errorMessage}`);
        this.stats.errors.push({
          page: page.title,
          uuid: page.uuid,
          error: errorMessage
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
   * @param options - Compression options
   * @returns Compression report
   */
  async compressAllVersions(options: CompressionOptions = {}): Promise<CompressionReport> {
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
        const errorMessage = error instanceof Error ? error.message : String(error);
        this._log('error', `Failed to compress ${page.title}: ${errorMessage}`);
        this.stats.errors.push({
          page: page.title,
          uuid: page.uuid,
          error: errorMessage
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
   * @param page - Page info from index
   * @param options - Compression options
   * @returns Compression result
   */
  private async _compressPageVersions(page: PageInfo, options: Required<Pick<CompressionOptions, 'ageThresholdDays' | 'compressionLevel' | 'skipAlreadyCompressed'>>): Promise<PageCompressionResult> {
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

    const manifest: VersionManifest = await fs.readJson(manifestPath);
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
          const errorMessage = error instanceof Error ? error.message : String(error);
          this._log('verbose', `Failed to compress v${versionMeta.version}: ${errorMessage}`);
        }
      }
    }

    return { versionsCompressed, spaceFreed };
  }

  /**
   * Compress files in a version directory
   * @param versionPath - Path to version directory
   * @param compressionLevel - Compression level
   * @returns Compression result
   */
  private async _compressVersionFiles(versionPath: string, compressionLevel: number): Promise<FileCompressionResult> {
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
   * @param options - Maintenance options
   * @returns Combined maintenance report
   */
  async runFullMaintenance(options: FullMaintenanceOptions = {}): Promise<FullMaintenanceReport> {
    this._log('info', 'Running full maintenance cycle');

    const cleanupOptions = options.cleanup || {};
    const compressionOptions = options.compression || {};

    const reports: {
      cleanup: CleanupReport | PartialReport;
      compression: CompressionReport | PartialReport;
    } = {
      cleanup: { success: false, error: 'Not run' },
      compression: { success: false, error: 'Not run' }
    };

    // Run cleanup
    try {
      this._log('info', 'Phase 1: Cleanup old versions');
      reports.cleanup = await this.cleanupAllPages(cleanupOptions);
      this._log('info', `Cleanup complete: removed ${(reports.cleanup as CleanupReport).versionsRemoved} versions`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this._log('error', `Cleanup failed: ${errorMessage}`);
      reports.cleanup = { success: false, error: errorMessage };
    }

    // Run compression
    try {
      this._log('info', 'Phase 2: Compress old versions');
      reports.compression = await this.compressAllVersions(compressionOptions);
      this._log('info', `Compression complete: compressed ${(reports.compression as CompressionReport).versionsCompressed} versions`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this._log('error', `Compression failed: ${errorMessage}`);
      reports.compression = { success: false, error: errorMessage };
    }

    const cleanupSpaceFreed = (reports.cleanup as CleanupReport).spaceFreed || 0;
    const compressionSpaceFreed = (reports.compression as CompressionReport).spaceFreed || 0;
    const totalSpaceFreed = cleanupSpaceFreed + compressionSpaceFreed;

    return {
      success: reports.cleanup.success && reports.compression.success,
      dryRun: this.dryRun,
      cleanup: reports.cleanup,
      compression: reports.compression,
      totalSpaceFreed,
      totalSpaceFreedMB: totalSpaceFreed / (1024 * 1024)
    };
  }

  /**
   * Report progress to callback
   * @param current - Current item number
   * @param total - Total items
   * @param itemName - Current item name
   */
  private _reportProgress(current: number, total: number, itemName: string): void {
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
   * @param level - Log level (info, verbose, error)
   * @param message - Message to log
   */
  private _log(level: 'info' | 'verbose' | 'error', message: string): void {
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

export default VersioningMaintenance;

// CommonJS compatibility
module.exports = VersioningMaintenance;
