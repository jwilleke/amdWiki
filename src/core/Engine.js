/**
 * Engine interface - Main wiki engine following JSPWiki architecture
 *
 * Provides Wiki services to the application. There's basically only a single Engine
 * for each web application instance. This is the base class that WikiEngine extends.
 *
 * @class Engine
 * @abstract
 *
 * @property {Map<string, BaseManager>} managers - Map of registered manager instances keyed by name
 * @property {Map<string, *>} properties - Map of configuration properties
 * @property {boolean} initialized - Flag indicating if engine has been initialized
 * @property {Object} config - Configuration object passed during initialization
 */
class Engine {
  /**
   * Creates a new Engine instance
   *
   * @constructor
   */
  constructor() {
    this.managers = new Map();
    this.properties = new Map();
    this.initialized = false;
  }

  /**
   * Initialize the engine with configuration
   *
   * @async
   * @param {Object} config - Configuration object containing engine settings
   * @returns {Promise<void>}
   * @throws {Error} If engine is already initialized
   */
  async initialize(config = {}) {
    if (this.initialized) {
      throw new Error('Engine already initialized');
    }

    // Store configuration - DON'T overwrite this.config if it's already set
    if (!this.config) {
      this.config = config;
    }
    this.properties = new Map(Object.entries(config));
    
    // Initialize managers in order
    await this.initializeManagers();
    
    this.initialized = true;
  }

  /**
   * Initialize all managers
   *
   * @async
   * @protected
   * @returns {Promise<void>}
   */
  async initializeManagers() {
    // To be implemented - managers will be registered here
    console.log('Initializing managers...');
  }

  /**
   * Get a manager instance by class/name
   *
   * @param {string} managerName - Name of the manager to retrieve
   * @returns {BaseManager|null} Manager instance or null if not found
   *
   * @example
   * const pageManager = engine.getManager('PageManager');
   */
  getManager(managerName) {
    return this.managers.get(managerName);
  }

  /**
   * Register a manager with the engine
   *
   * @param {string} name - Unique name for the manager
   * @param {BaseManager} manager - Manager instance to register
   * @returns {void}
   *
   * @example
   * engine.registerManager('PageManager', new PageManager(engine));
   */
  registerManager(name, manager) {
    this.managers.set(name, manager);
  }

  /**
   * Get all registered manager names
   *
   * @returns {string[]} Array of registered manager names
   *
   * @example
   * const managers = engine.getRegisteredManagers();
   * // ['ConfigurationManager', 'PageManager', 'UserManager', ...]
   */
  getRegisteredManagers() {
    return Array.from(this.managers.keys());
  }

  /**
   * Get configuration property value
   *
   * @param {string} key - Configuration property key
   * @param {*} [defaultValue=null] - Default value if property not found
   * @returns {*} Property value or default value
   *
   * @example
   * const appName = engine.getProperty('applicationName', 'MyWiki');
   */
  getProperty(key, defaultValue = null) {
    return this.properties.get(key) || defaultValue;
  }

  /**
   * Get all configuration properties
   *
   * @returns {Map<string, *>} Map of all configuration properties
   */
  getProperties() {
    return this.properties;
  }

  /**
   * Check if engine has been initialized
   *
   * @returns {boolean} True if engine is initialized and configured
   */
  isConfigured() {
    return this.initialized;
  }

  /**
   * Get application name from configuration
   *
   * @returns {string} Application name (defaults to 'amdWiki')
   */
  getApplicationName() {
    return this.getProperty('applicationName', 'amdWiki');
  }

  /**
   * Get working directory path from configuration
   *
   * @returns {string} Working directory path (defaults to './')
   */
  getWorkDir() {
    return this.getProperty('workDir', './');
  }

  /**
   * Shutdown the engine and cleanup all managers
   *
   * @async
   * @returns {Promise<void>}
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
