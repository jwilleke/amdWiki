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
 * @property {Record<string, any>} config - Configuration object passed during initialization
 *
 * @see {@link WikiEngine} for the main engine
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */

/**
 * Backup data structure returned by backup() method
 */
export interface BackupData {
  /** Name of the manager that created this backup */
  managerName: string;

  /** ISO timestamp when backup was created */
  timestamp: string;

  /** Manager-specific backup data */
  data?: any;

  /** Provider class name (for managers with providers) */
  providerClass?: string | null;

  /** Provider-specific backup data */
  providerBackup?: any;

  /** Optional note about the backup */
  note?: string;

  /** Allow additional properties */
  [key: string]: any;
}

/**
 * Base class for all managers
 *
 * Provides common functionality for initialization, lifecycle management,
 * and backup/restore operations.
 */
abstract class BaseManager {
  /** Reference to the wiki engine */
  protected engine: any;

  /** Initialization status flag */
  protected initialized: boolean;

  /** Configuration passed during initialization */
  protected config?: Record<string, any>;

  /**
   * Creates a new BaseManager instance
   *
   * @param engine - The wiki engine instance
   *
   * @example
   * class MyManager extends BaseManager {
   *   constructor(engine: any) {
   *     super(engine);
   *     this.myData = new Map();
   *   }
   * }
   */
  constructor(engine: any) {
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
  async initialize(config: Record<string, any> = {}): Promise<void> {
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
  getEngine(): any {
    return this.engine;
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
}

export default BaseManager;
