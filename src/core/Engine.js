/**
 * Engine interface - Main wiki engine following JSPWiki architecture
 * 
 * Provides Wiki services to the application. There's basically only a single Engine 
 * for each web application instance.
 */
class Engine {
  constructor() {
    this.managers = new Map();
    this.properties = new Map();
    this.initialized = false;
  }

  /**
   * Initialize the engine with configuration
   * @param {Object} config - Configuration object
   */
  async initialize(config = {}) {
    if (this.initialized) {
      throw new Error('Engine already initialized');
    }

    // Store configuration
    this.config = config;
    this.properties = new Map(Object.entries(config));
    
    // Initialize managers in order
    await this.initializeManagers();
    
    this.initialized = true;
  }

  /**
   * Initialize all managers
   */
  async initializeManagers() {
    // To be implemented - managers will be registered here
    console.log('Initializing managers...');
  }

  /**
   * Get a manager instance by class/name
   * @param {string} managerName - Name of the manager
   * @returns {Object} Manager instance
   */
  getManager(managerName) {
    return this.managers.get(managerName);
  }

  /**
   * Register a manager
   * @param {string} name - Manager name
   * @param {Object} manager - Manager instance
   */
  registerManager(name, manager) {
    this.managers.set(name, manager);
  }

  /**
   * Get configuration property
   * @param {string} key - Property key
   * @param {*} defaultValue - Default value if not found
   * @returns {*} Property value
   */
  getProperty(key, defaultValue = null) {
    return this.properties.get(key) || defaultValue;
  }

  /**
   * Get all properties
   * @returns {Map} All properties
   */
  getProperties() {
    return this.properties;
  }

  /**
   * Check if engine is configured
   * @returns {boolean} True if configured
   */
  isConfigured() {
    return this.initialized;
  }

  /**
   * Get application name
   * @returns {string} Application name
   */
  getApplicationName() {
    return this.getProperty('applicationName', 'amdWiki');
  }

  /**
   * Get working directory
   * @returns {string} Working directory path
   */
  getWorkDir() {
    return this.getProperty('workDir', './');
  }

  /**
   * Shutdown the engine
   */
  async shutdown() {
    // Cleanup managers
    for (const [name, manager] of this.managers) {
      if (manager.shutdown) {
        await manager.shutdown();
      }
    }
    this.initialized = false;
  }
}

module.exports = Engine;
