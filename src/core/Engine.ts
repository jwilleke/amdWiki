import type { WikiConfig } from '../types/Config';
import type BaseManager from '../managers/BaseManager';

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
 * @property {Map<string, unknown>} properties - Map of configuration properties
 * @property {boolean} initialized - Flag indicating if engine has been initialized
 * @property {WikiConfig} config - Configuration object passed during initialization
 */
class Engine {
  /** Map of registered manager instances */
  protected managers: Map<string, BaseManager>;

  /** Map of configuration properties */
  protected properties: Map<string, unknown>;

  /** Flag indicating if engine has been initialized */
  protected initialized: boolean;

  /** Configuration object */
  public config?: WikiConfig;

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
   * @param {WikiConfig} config - Configuration object containing engine settings
   * @returns {Promise<void>}
   * @throws {Error} If engine is already initialized
   */
  async initialize(config: WikiConfig = {} as WikiConfig): Promise<void> {
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
   * To be implemented by subclasses.
   * Subclasses can make this async if needed.
   *
   * @protected
   * @returns {Promise<void>}
   */
  protected initializeManagers(): Promise<void> {
    // To be implemented - managers will be registered here
    // Subclasses override this method
    return Promise.resolve();
  }

  /**
   * Get a manager instance by class/name
   *
   * @param {string} managerName - Name of the manager to retrieve
   * @returns {T|undefined} Manager instance or undefined if not found
   *
   * @example
   * const pageManager = engine.getManager<PageManager>('PageManager');
   */
  getManager<T = BaseManager>(managerName: string): T | undefined {
    return this.managers.get(managerName) as T | undefined;
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
  registerManager(name: string, manager: BaseManager): void {
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
  getRegisteredManagers(): string[] {
    return Array.from(this.managers.keys());
  }

  /**
   * Get configuration property value
   *
   * @param {string} key - Configuration property key
   * @param {T} [defaultValue=null] - Default value if property not found
   * @returns {T} Property value or default value
   *
   * @example
   * const appName = engine.getProperty('applicationName', 'MyWiki');
   */
  getProperty<T = unknown>(key: string, defaultValue: T | null = null): T | null {
    const value = this.properties.get(key);
    return (value !== undefined ? value : defaultValue) as T | null;
  }

  /**
   * Get all configuration properties
   *
   * @returns {Map<string, unknown>} Map of all configuration properties
   */
  getProperties(): Map<string, unknown> {
    return this.properties;
  }

  /**
   * Check if engine has been initialized
   *
   * @returns {boolean} True if engine is initialized and configured
   */
  isConfigured(): boolean {
    return this.initialized;
  }

  /**
   * Get application name from configuration
   *
   * @returns {string} Application name (defaults to 'amdWiki')
   */
  getApplicationName(): string {
    return this.getProperty<string>('applicationName', 'amdWiki') || 'amdWiki';
  }

  /**
   * Get working directory path from configuration
   *
   * @returns {string} Working directory path (defaults to './')
   */
  getWorkDir(): string {
    return this.getProperty<string>('workDir', './') || './';
  }

  /**
   * Get configuration object
   *
   * @returns {WikiConfig} Configuration object
   */
  getConfig(): WikiConfig {
    return this.config || {} as WikiConfig;
  }

  /**
   * Shutdown the engine and cleanup all managers
   *
   * @async
   * @returns {Promise<void>}
   */
  async shutdown(): Promise<void> {
    // Cleanup managers
    for (const [, manager] of this.managers) {
      if (manager.shutdown) {
        await manager.shutdown();
      }
    }
    this.initialized = false;
  }
}

export default Engine;

// CommonJS compatibility
module.exports = Engine;
