/* eslint-disable @typescript-eslint/require-await */

import BaseManager, { BackupData as BaseBackupData } from './BaseManager';
import fs from 'fs-extra';
import path from 'path';
import zlib from 'zlib';
import { promisify } from 'util';
import logger from '../utils/logger';
import type { WikiEngine } from '../types/WikiEngine';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

/**
 * Backup options
 */
export interface BackupOptions {
  filename?: string;
  compress?: boolean;
}

/**
 * Restore options
 */
export interface RestoreOptions {
  skipValidation?: boolean;
  managerFilter?: string[];
}

/**
 * Backup data structure
 */
export interface BackupData {
  version: string;
  timestamp: string;
  application: string;
  managers: Record<string, unknown>;
}

/**
 * Restore results
 */
export interface RestoreResults {
  success: string[];
  failed: Array<{ manager: string; error: string }>;
  skipped: string[];
}

/**
 * Backup file information
 */
export interface BackupFileInfo {
  filename: string;
  path: string;
  size: number;
  created: Date;
  modified: Date;
}

/**
 * BackupManager - Coordinates backup and restore operations across all managers
 *
 * Orchestrates system-wide backup and restore by calling backup()/restore()
 * on all registered managers and aggregating their data into compressed archives.
 *
 * Responsibilities:
 * - Call backup() on all registered managers
 * - Aggregate backup data into a single .gz file
 * - Restore from .gz backup file
 * - Call restore() on all registered managers
 *
 * Architecture:
 * - Each manager implements backup() to return its state
 * - BackupManager collects all states into one object
 * - Serializes to JSON and compresses with gzip
 * - Stores as single .gz file
 *
 * @class BackupManager
 * @extends BaseManager
 *
 * @property {string|null} backupDirectory - Directory for backup files
 * @property {number} maxBackups - Maximum number of backups to retain
 *
 * @see {@link BaseManager} for base functionality and backup() pattern
 *
 * @example
 * const backupManager = engine.getManager('BackupManager');
 * const backupPath = await backupManager.createBackup();
 * console.log('Backup created:', backupPath);
 */
class BackupManager extends BaseManager {
  private backupDirectory: string | null;
  private maxBackups: number;

  /**
   * Creates a new BackupManager instance
   *
   * @constructor
   * @param {any} engine - The wiki engine instance
   */
   
  constructor(engine: WikiEngine) {
     
    super(engine);
    this.backupDirectory = null;
    this.maxBackups = 10; // Keep last 10 backups
  }

  /**
   * Initialize BackupManager
   *
   * @async
   * @param {Record<string, unknown>} [config={}] - Configuration object (unused, reads from ConfigurationManager)
   * @returns {Promise<void>}
   * @throws {Error} If ConfigurationManager is not available
   */
  async initialize(config: Record<string, unknown> = {}): Promise<void> {
    await super.initialize(config);

    // Get backup directory from ConfigurationManager
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const configManager = this.engine.getManager('ConfigurationManager');
    if (!configManager) {
      throw new Error('BackupManager requires ConfigurationManager to be initialized.');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const backupDir = configManager.getProperty('amdwiki.backup.directory');
    this.backupDirectory = path.isAbsolute(backupDir as string) ? backupDir as string : path.join(process.cwd(), backupDir as string);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this.maxBackups = configManager.getProperty('amdwiki.backup.maxBackups') as number;

    // Ensure backup directory exists
     
    await fs.ensureDir(this.backupDirectory);

    logger.info('✅ BackupManager initialized');
    logger.info(`📁 Backup directory: ${this.backupDirectory}`);
    logger.info(`📊 Max backups to retain: ${this.maxBackups}`);
  }

  /**
   * Backup BackupManager's own state (conforms to BaseManager interface)
   *
   * @returns {Promise<BaseBackupData>} Backup data for this manager
   */
  async backup(): Promise<BaseBackupData> {
    return {
      managerName: 'BackupManager',
      timestamp: new Date().toISOString(),
      data: {
        backupDirectory: this.backupDirectory,
        maxBackups: this.maxBackups
      }
    };
  }

  /**
   * Restore BackupManager's own state (conforms to BaseManager interface)
   *
   * @param {BaseBackupData} backupData - Backup data from backup()
   * @returns {Promise<void>}
   */
  async restoreState(backupData: BaseBackupData): Promise<void> {
    if (backupData?.data) {
      // BackupManager state is read from config, so nothing to restore
      logger.info('[BackupManager] State restore not needed (config-driven)');
    }
  }

  /**
   * Perform a complete backup of all managers to a file
   *
   * Process:
   * 1. Get all registered managers from engine
   * 2. Call backup() on each manager
   * 3. Aggregate all backup data
   * 4. Compress to .gz file
   * 5. Save with timestamp
   * 6. Clean up old backups
   *
   * @param {BackupOptions} options - Backup options
   * @param {string} options.filename - Custom filename (optional)
   * @param {boolean} options.compress - Whether to compress (default: true)
   * @returns {Promise<string>} Path to created backup file
   */
  async createBackup(options: BackupOptions = {}): Promise<string> {
    const startTime = Date.now();
    logger.info('🔄 Starting backup operation...');

    try {
      if (!this.backupDirectory) {
        throw new Error('Backup directory not initialized');
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = options.filename || `amdwiki-backup-${timestamp}.json.gz`;
      const backupPath = path.join(this.backupDirectory, filename);

      // Collect backup data from all managers
      const backupData: BackupData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        application: 'amdWiki',
        managers: {}
      };

      // Get all manager names from engine
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const managerNames = this.engine.getRegisteredManagers();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      logger.info(`📋 Found ${managerNames.length} registered managers`);

      // Call backup() on each manager
       
      for (const managerName of managerNames) {
        // Skip BackupManager itself
        if (managerName === 'BackupManager') {
          continue;
        }

        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
          const manager = this.engine.getManager(managerName);
          if (!manager) {
            logger.warn(`⚠️  Manager not found: ${managerName}`);
            continue;
          }

          logger.info(`📦 Backing up ${managerName}...`);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          const managerBackup = await manager.backup();

          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          backupData.managers[managerName] = managerBackup;
          logger.info(`✅ ${managerName} backed up successfully`);

        } catch (error) {
          logger.error(`❌ Failed to backup ${managerName}:`, error);
          // Continue with other managers even if one fails
          backupData.managers[managerName as string] = {
            error: (error as Error).message,
            timestamp: new Date().toISOString()
          };
        }
      }

      // Serialize to JSON
      const jsonData = JSON.stringify(backupData, null, 2);
      logger.info(`📊 Backup data size: ${(jsonData.length / 1024).toFixed(2)} KB`);

      // Compress with gzip
      let finalData: string | Buffer = jsonData;
      if (options.compress !== false) {
        const compressed = await gzip(jsonData);
        finalData = compressed;
        logger.info(`🗜️  Compressed size: ${(compressed.length / 1024).toFixed(2)} KB (${((compressed.length / jsonData.length) * 100).toFixed(1)}% of original)`);
      }

      // Write to file
       
      await fs.writeFile(backupPath, finalData);

      const duration = Date.now() - startTime;
      logger.info(`✅ Backup completed successfully in ${duration}ms`);
      logger.info(`📁 Backup saved to: ${backupPath}`);

      // Clean up old backups
      await this.cleanupOldBackups();

      return backupPath;

    } catch (error) {
      logger.error('❌ Backup operation failed:', error);
      throw error;
    }
  }

  /**
   * Restore all managers from a backup file
   *
   * Process:
   * 1. Read and decompress backup file
   * 2. Parse JSON data
   * 3. Validate backup structure
   * 4. Call restore() on each manager with its data
   *
   * @param {string} backupPath - Path to backup file
   * @param {RestoreOptions} options - Restore options
   * @param {boolean} options.skipValidation - Skip validation (default: false)
   * @param {string[]} options.managerFilter - Only restore specific managers
   * @returns {Promise<RestoreResults>} Restore results
   */
  async restoreFromFile(backupPath: string, options: RestoreOptions = {}): Promise<RestoreResults> {
    const startTime = Date.now();
    logger.info(`🔄 Starting restore operation from: ${backupPath}`);

    try {
      // Verify backup file exists
       
      if (!await fs.pathExists(backupPath)) {
        throw new Error(`Backup file not found: ${backupPath}`);
      }

      // Read backup file
       
      const fileData = await fs.readFile(backupPath);
       
      logger.info(`📁 Read backup file: ${(fileData.length / 1024).toFixed(2)} KB`);

      // Decompress if needed (detect by extension or try decompression)
      let jsonData: string;
      if (backupPath.endsWith('.gz')) {
         
        const decompressed = await gunzip(fileData);
        jsonData = decompressed.toString('utf8');
        logger.info(`🗜️  Decompressed to: ${(jsonData.length / 1024).toFixed(2)} KB`);
      } else {
         
        jsonData = fileData.toString('utf8');
      }

      // Parse JSON
      const backupData = JSON.parse(jsonData) as BackupData;
      logger.info(`📊 Backup version: ${backupData.version}`);
      logger.info(`📅 Backup timestamp: ${backupData.timestamp}`);

      // Validate backup structure
      if (!options.skipValidation) {
        this.validateBackupData(backupData);
      }

      // Restore results
      const results: RestoreResults = {
        success: [],
        failed: [],
        skipped: []
      };

      // Get manager names from backup
      const managerNames = Object.keys(backupData.managers);
      logger.info(`📋 Found ${managerNames.length} managers in backup`);

      // Restore each manager
      for (const managerName of managerNames) {
        // Check if manager filter is applied
        if (options.managerFilter && !options.managerFilter.includes(managerName)) {
          logger.info(`⏭️  Skipping ${managerName} (filtered)`);
          results.skipped.push(managerName);
          continue;
        }

        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const manager = this.engine.getManager(managerName);
          if (!manager) {
            logger.warn(`⚠️  Manager not found: ${managerName}, skipping`);
            results.skipped.push(managerName);
            continue;
          }

          const managerBackupData = backupData.managers[managerName];

          // Skip if manager backup had an error
          if ((managerBackupData as { error?: string }).error) {
            logger.warn(`⚠️  Skipping ${managerName} (backup had error: ${(managerBackupData as { error: string }).error})`);
            results.skipped.push(managerName);
            continue;
          }

          logger.info(`📦 Restoring ${managerName}...`);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          await manager.restore(managerBackupData);

          results.success.push(managerName);
          logger.info(`✅ ${managerName} restored successfully`);

        } catch (error) {
          logger.error(`❌ Failed to restore ${managerName}:`, error);
          results.failed.push({ manager: managerName, error: (error as Error).message });
        }
      }

      const duration = Date.now() - startTime;
      logger.info(`✅ Restore completed in ${duration}ms`);
      logger.info(`✅ Success: ${results.success.length}, ❌ Failed: ${results.failed.length}, ⏭️  Skipped: ${results.skipped.length}`);

      return results;

    } catch (error) {
      logger.error('❌ Restore operation failed:', error);
      throw error;
    }
  }

  /**
   * Validate backup data structure
   * @param {BackupData} backupData - Backup data to validate
   * @throws {Error} If validation fails
   * @private
   */
  private validateBackupData(backupData: BackupData): void {
    if (!backupData.version) {
      throw new Error('Invalid backup: missing version');
    }
    if (!backupData.timestamp) {
      throw new Error('Invalid backup: missing timestamp');
    }
    if (!backupData.managers || typeof backupData.managers !== 'object') {
      throw new Error('Invalid backup: missing or invalid managers data');
    }
    logger.info('✅ Backup validation passed');
  }

  /**
   * List all available backups
   * @returns {Promise<BackupFileInfo[]>} List of backup files with metadata
   */
  async listBackups(): Promise<BackupFileInfo[]> {
    try {
      if (!this.backupDirectory) {
        return [];
      }

      const files = await fs.readdir(this.backupDirectory);

      const backupFiles = files.filter((f: string) => {
        return f.startsWith('amdwiki-backup-') && f.endsWith('.json.gz');
      });

      const backupDir = this.backupDirectory;
      const backups = await Promise.all(backupFiles.map(async (filename: string) => {
        const filePath = path.join(backupDir, filename);
        const stats = await fs.stat(filePath);

        return {
          filename,
          path: filePath,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        };
      }));

      // Sort by creation time, newest first
      backups.sort((a: BackupFileInfo, b: BackupFileInfo) => b.created.getTime() - a.created.getTime());

       
      return backups;

    } catch (error) {
      logger.error('❌ Failed to list backups:', error);
      return [];
    }
  }

  /**
   * Clean up old backups, keeping only maxBackups most recent
   * @private
   */
  private async cleanupOldBackups(): Promise<void> {
    try {
      const backups = await this.listBackups();

      if (backups.length <= this.maxBackups) {
        logger.info(`📊 ${backups.length} backups exist, no cleanup needed`);
        return;
      }

      // Delete oldest backups
      const toDelete = backups.slice(this.maxBackups);
      logger.info(`🗑️  Cleaning up ${toDelete.length} old backups`);

      for (const backup of toDelete) {
         
        await fs.remove(backup.path);
        logger.info(`🗑️  Deleted: ${backup.filename}`);
      }

    } catch (error) {
      logger.warn('⚠️  Failed to cleanup old backups:', error);
      // Don't throw - cleanup failure shouldn't fail the backup
    }
  }

  /**
   * Get the most recent backup file path
   * @returns {Promise<string | null>} Path to most recent backup, or null if none exist
   */
  async getLatestBackup(): Promise<string | null> {
    const backups = await this.listBackups();
    return backups.length > 0 ? backups[0].path : null;
  }
}

export default BackupManager;

// CommonJS compatibility
module.exports = BackupManager;
