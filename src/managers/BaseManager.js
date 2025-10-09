/**
 * Base Manager class - All managers should extend this
 * Following JSPWiki's modular manager pattern
 */
class BaseManager {
  constructor(engine) {
    this.engine = engine;
    this.initialized = false;
  }

  /**
   * Initialize the manager
   * @param {Object} config - Configuration object
   */
  async initialize(config = {}) {
    this.config = config;
    this.initialized = true;
  }

  /**
   * Check if manager is initialized
   * @returns {boolean} True if initialized
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * Get engine instance
   * @returns {Engine} Engine instance
   */
  getEngine() {
    return this.engine;
  }

  /**
   * Shutdown the manager
   */
  async shutdown() {
    this.initialized = false;
  }

  /**
   * Backup manager data
   * MUST be implemented by all managers that manage persistent data
   *
   * @returns {Promise<Object>} Backup data object containing all manager state
   * @throws {Error} If backup operation fails
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
   * MUST be implemented by all managers that manage persistent data
   *
   * @param {Object} backupData - Backup data object from backup() method
   * @returns {Promise<void>}
   * @throws {Error} If restore operation fails
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
