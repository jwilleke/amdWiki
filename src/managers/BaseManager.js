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
 * @property {Object} config - Configuration object passed during initialization
 *
 * @see {@link WikiEngine} for the main engine
 */
class BaseManager {
  /**
   * Creates a new BaseManager instance
   *
   * @constructor
   * @param {WikiEngine} engine - The wiki engine instance
   *
   * @example
   * class MyManager extends BaseManager {
   *   constructor(engine) {
   *     super(engine);
   *     this.myData = new Map();
   *   }
   * }
   */
  constructor(engine) {
    this.engine = engine;
    this.initialized = false;
  }

  /**
   * Initialize the manager with configuration
   *
   * Override this method in subclasses to perform initialization logic.
   * Always call super.initialize() first in overridden implementations.
   *
   * @async
   * @param {Object} [config={}] - Configuration object
   * @returns {Promise<void>}
   *
   * @example
   * async initialize(config = {}) {
   *   await super.initialize(config);
   *   // Your initialization logic here
   *   console.log('MyManager initialized');
   * }
   */
  async initialize(config = {}) {
    this.config = config;
    this.initialized = true;
  }

  /**
   * Check if manager has been initialized
   *
   * @returns {boolean} True if manager is initialized
   *
   * @example
   * if (manager.isInitialized()) {
   *   // Safe to use manager
   * }
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * Get the wiki engine instance
   *
   * @returns {WikiEngine} The wiki engine instance
   *
   * @example
   * const config = this.getEngine().getConfig();
   */
  getEngine() {
    return this.engine;
  }

  /**
   * Shutdown the manager and cleanup resources
   *
   * Override this method in subclasses to perform cleanup logic.
   * Always call super.shutdown() at the end of overridden implementations.
   *
   * @async
   * @returns {Promise<void>}
   *
   * @example
   * async shutdown() {
   *   // Your cleanup logic here
   *   await this.closeConnections();
   *   await super.shutdown();
   * }
   */
  async shutdown() {
    this.initialized = false;
  }

  /**
   * Backup manager data
   *
   * MUST be overridden by all managers that manage persistent data.
   * Default implementation returns an empty backup object.
   *
   * @async
   * @returns {Promise<Object>} Backup data object containing all manager state
   * @returns {string} backupData.managerName - Name of the manager
   * @returns {string} backupData.timestamp - ISO timestamp of backup
   * @returns {*} backupData.data - Manager-specific backup data
   * @throws {Error} If backup operation fails
   *
   * @example
   * async backup() {
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
  async backup() {
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
   * @async
   * @param {Object} backupData - Backup data object from backup() method
   * @param {string} backupData.managerName - Name of the manager
   * @param {string} backupData.timestamp - ISO timestamp of backup
   * @param {*} backupData.data - Manager-specific backup data
   * @returns {Promise<void>}
   * @throws {Error} If restore operation fails or backup data is missing
   *
   * @example
   * async restore(backupData) {
   *   if (!backupData || !backupData.data) {
   *     throw new Error('Invalid backup data');
   *   }
   *   this.users = new Map(backupData.data.users.map(u => [u.id, u]));
   *   this.settings = backupData.data.settings;
   * }
   */
  async restore(backupData) {
    // Default implementation does nothing
    // Managers with data MUST override this method
    if (!backupData) {
      throw new Error(`${this.constructor.name}: No backup data provided for restore`);
    }
  }
}

module.exports = BaseManager;
