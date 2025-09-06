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
}

module.exports = BaseManager;
