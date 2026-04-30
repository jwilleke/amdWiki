/**
 * Base Manager class - All managers should extend this
 *
 * Following JSPWiki's modular manager pattern, this abstract base class
 * provides common functionality for all managers including initialization,
 * lifecycle management, and backup/restore operations.
 *
 * @class BaseManager
 * @abstract
 *
 * @property {WikiEngine} engine - Reference to the wiki engine
 * @property {boolean} initialized - Flag indicating initialization status
 * @property {Record<string, unknown>} config - Configuration object passed during initialization
 *
 * @see {@link WikiEngine} for the main engine
 */

import logger from '../utils/logger.js';
import { checkConfiguredPath, type PathPreflightResult } from '../utils/PathPreflight.js';
import type { WikiEngine } from '../types/WikiEngine.js';
import type { ManagerFetchOptions } from '../utils/managerUtils.js';

/**
 * Backup data structure returned by backup() method
 */
export interface BackupData {
  /** Name of the manager that created this backup */
  managerName: string;

  /** ISO timestamp when backup was created */
  timestamp: string;

  /** Manager-specific backup data */
  data?: unknown;

  /** Provider class name (for managers with providers) */
  providerClass?: string | null;

  /** Provider-specific backup data */
  providerBackup?: unknown;

  /** Optional note about the backup */
  note?: string;

  /** Allow additional properties */
  [key: string]: unknown;
}

/**
 * Base class for all managers
 *
 * Provides common functionality for initialization, lifecycle management,
 * and backup/restore operations.
 */
abstract class BaseManager {
  /** Reference to the wiki engine */
  protected engine: WikiEngine;

  /** Initialization status flag */
  protected initialized: boolean;

  /** Configuration passed during initialization */
  protected config?: Record<string, unknown>;

  /**
   * Short description of what this manager does.
   * Used by admin UIs, addon registries, and introspection tools.
   * Override in subclasses to provide a human-readable description.
   */
  readonly description?: string;

  /**
   * Creates a new BaseManager instance
   *
   * @param engine - The wiki engine instance
   *
   * @example
   * class MyManager extends BaseManager {
   *   constructor(engine: WikiEngine) {
   *     super(engine);
   *     this.myData = new Map();
   *   }
   * }
   */
  constructor(engine: WikiEngine) {
    this.engine = engine;
    this.initialized = false;
  }

  /**
   * Initialize the manager with configuration
   *
   * Override this method in subclasses to perform initialization logic.
   * Always call super.initialize() first in overridden implementations.
   *
   * @param config - Configuration object
   *
   * @example
   * async initialize(config: Record<string, any> = {}): Promise<void> {
   *   await super.initialize(config);
   *   // Your initialization logic here
   *   console.log('MyManager initialized');
   * }
   */

  async initialize(config: Record<string, unknown> = {}): Promise<void> {
    this.config = config;
    this.initialized = true;
  }

  /**
   * Check if manager has been initialized
   *
   * @returns True if manager is initialized
   *
   * @example
   * if (manager.isInitialized()) {
   *   // Safe to use manager
   * }
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get the wiki engine instance
   *
   * @returns The wiki engine instance
   *
   * @example
   * const config = this.getEngine().getConfig();
   */
  getEngine(): WikiEngine {
    return this.engine;
  }

  protected invalidateHandlerCache(pageUuid: string): void {
    const pm = this.engine.getManager<{ invalidatePageCache(id: string): void }>('PageManager');
    if (pm) {
      pm.invalidatePageCache(pageUuid);
    }
  }

  /**
   * Preflight a configured filesystem path before any mkdir/write happens.
   *
   * Wraps `checkConfiguredPath()` with a standardized warning log that names
   * the manager (`this.constructor.name`) and the originating config key.
   * Useful for paths that may live on volumes the OS has unmounted (notably
   * macOS `/Volumes/<X>/...`), where `fs.ensureDir` would otherwise crash
   * the engine with an opaque `EACCES`.
   *
   * The caller decides what to do on failure (degrade, fall back to a
   * default, or treat as fatal).
   *
   * @param configKey  The config key that supplied this path — included in
   *                   the warning so operators know what to fix.
   * @param path       The resolved path to check.
   * @returns          The preflight result. `result.ok === true` means safe
   *                   to proceed.
   *
   * @example
   * const preflight = this.preflightConfiguredPath(
   *   'ngdpbase.backup.directory',
   *   this.backupDirectory
   * );
   * if (!preflight.ok) {
   *   // degrade — disable feature, fall back to default, etc.
   *   return;
   * }
   */
  protected preflightConfiguredPath(
    configKey: string,
    path: string | null | undefined
  ): PathPreflightResult {
    const result = checkConfiguredPath(path);
    if (!result.ok) {
      logger.warn(
        `⚠️  ${this.constructor.name}: ${result.message} ` +
        `(config key: ${configKey}).`
      );
    }
    return result;
  }

  /**
   * Shutdown the manager and cleanup resources
   *
   * Override this method in subclasses to perform cleanup logic.
   * Always call super.shutdown() at the end of overridden implementations.
   *
   * @example
   * async shutdown(): Promise<void> {
   *   // Your cleanup logic here
   *   await this.closeConnections();
   *   await super.shutdown();
   * }
   */
  async shutdown(): Promise<void> {
    this.initialized = false;
  }

  /**
   * Backup manager data
   *
   * MUST be overridden by all managers that manage persistent data.
   * Default implementation returns an empty backup object.
   *
   * @returns Backup data object containing all manager state
   * @throws {Error} If backup operation fails
   *
   * @example
   * async backup(): Promise<BackupData> {
   *   return {
   *     managerName: this.constructor.name,
   *     timestamp: new Date().toISOString(),
   *     data: {
   *       users: Array.from(this.users.values()),
   *       settings: this.settings
   *     }
   *   };
   * }
   */
  async backup(): Promise<BackupData> {
    // Default implementation returns empty object
    // Managers with data MUST override this method
    return {
      managerName: this.constructor.name,
      timestamp: new Date().toISOString(),
      data: null
    };
  }

  /**
   * Restore manager data from backup
   *
   * MUST be overridden by all managers that manage persistent data.
   * Default implementation only validates that backup data is provided.
   *
   * @param backupData - Backup data object from backup() method
   * @throws {Error} If restore operation fails or backup data is missing
   *
   * @example
   * async restore(backupData: BackupData): Promise<void> {
   *   if (!backupData || !backupData.data) {
   *     throw new Error('Invalid backup data');
   *   }
   *   this.users = new Map(backupData.data.users.map(u => [u.id, u]));
   *   this.settings = backupData.data.settings;
   * }
   */
  async restore(backupData: BackupData): Promise<void> {
    // Default implementation does nothing
    // Managers with data MUST override this method
    if (!backupData) {
      throw new Error(`${this.constructor.name}: No backup data provided for restore`);
    }
  }

  /**
   * Return a plain-text string suitable for use as MarqueePlugin banner text.
   *
   * Override in subclasses to expose live manager data as a scrolling banner:
   *
   *   [{MarqueePlugin fetch='PageManager.toMarqueeText()'}]
   *   [{MarqueePlugin fetch='PageManager.toMarqueeText(limit=5,sort=date-desc)'}]
   *
   * The default returns '' (no output). Subclasses should return a concise,
   * single-line summary. Common options (limit, sortBy, sortOrder, since, before)
   * are available via ManagerFetchOptions; domain-specific keys are read directly
   * from the raw options object passed by the caller.
   *
   * @param _options  Parsed fetch args from the plugin invocation.
   * @returns Plain text, or '' if this manager has nothing to display.
   *
   * @example
   * async toMarqueeText(options: ManagerFetchOptions = {}): Promise<string> {
   *   const pages = await this.getRecentChanges(options.limit ?? 5);
   *   return 'Recent: ' + pages.map(p => p.name).join('  •  ');
   * }
   */
  async toMarqueeText(_options: ManagerFetchOptions = {}): Promise<string> {
    return '';
  }
}

export default BaseManager;

