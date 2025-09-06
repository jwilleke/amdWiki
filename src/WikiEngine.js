const Engine = require('./core/Engine');
const { Config } = require('../config/Config');

// Managers
const PageManager = require('./managers/PageManager');
const PluginManager = require('./managers/PluginManager');

/**
 * WikiEngine - Main engine implementation
 * Follows JSPWiki's architecture patterns
 */
class WikiEngine extends Engine {
  constructor() {
    super();
    this.config = null;
  }

  /**
   * Initialize the wiki engine with configuration
   * @param {Object|Config} config - Configuration object or Config instance
   */
  async initialize(config = {}) {
    console.log('🔧 WikiEngine.initialize() starting...');
    
    // Handle Config instance or plain object
    if (config instanceof Config) {
      this.config = config;
      console.log('✅ Using provided Config instance');
    } else {
      this.config = new Config(config);
      console.log('✅ Created new Config instance from object');
    }

    // Defensive check #1: Verify config instance
    if (!this.config || typeof this.config.get !== 'function') {
      throw new Error('Config instance is invalid - missing get() method');
    }
    console.log('✅ Config instance verified before super.initialize()');

    // Validate configuration
    const errors = this.config.validate();
    if (errors.length > 0) {
      throw new Error(`Configuration errors: ${errors.join(', ')}`);
    }
    console.log('✅ Configuration validated successfully');

    // Store the config instance before calling super.initialize()
    const configInstance = this.config;
    
    // Initialize base engine with plain object to avoid overwriting
    await super.initialize(this.config.getAll());
    
    // Defensive check #2: Restore config instance if it was overwritten
    if (!this.config || typeof this.config.get !== 'function') {
      console.warn('⚠️  Config instance was overwritten by super.initialize(), restoring...');
      this.config = configInstance;
    }
    console.log('✅ Config instance verified after super.initialize()');

    // Initialize and register managers
    await this.initializeManagers();

    console.log(`✅ ${this.getApplicationName()} initialized successfully`);
  }

  /**
   * Initialize all managers based on configuration
   */
  async initializeManagers() {
    console.log('🔧 Initializing managers...');
    
    // Defensive check #3: Verify config before using it
    if (!this.config || typeof this.config.get !== 'function') {
      throw new Error('Config instance is invalid in initializeManagers()');
    }

    const managersConfig = this.config.get('managers', {});
    console.log(`📋 Managers config: ${Object.keys(managersConfig).join(', ')}`);

    // Initialize PageManager
    if (managersConfig.pageManager?.enabled) {
      console.log('📄 Initializing PageManager...');
      const pageManager = new PageManager(this);
      await pageManager.initialize({
        pagesDir: this.config.get('wiki.pagesDir')
      });
      this.registerManager('PageManager', pageManager);
      console.log('✅ PageManager initialized');
    }

    // Initialize PluginManager
    if (managersConfig.pluginManager?.enabled) {
      console.log('🔌 Initializing PluginManager...');
      const pluginManager = new PluginManager(this);
      await pluginManager.initialize({
        searchPaths: managersConfig.pluginManager.searchPaths || ['./plugins']
      });
      this.registerManager('PluginManager', pluginManager);
      console.log('✅ PluginManager initialized');
    }

    // TODO: Initialize other managers as they are created
    // - RenderingManager
    // - SearchManager
    // - TemplateManager
    // - AttachmentManager
    
    console.log('✅ All managers initialized successfully');
  }

  /**
   * Create a new WikiEngine instance from configuration file
   * @param {string} configPath - Path to configuration file
   * @returns {WikiEngine} Initialized WikiEngine instance
   */
  static async createFromConfig(configPath) {
    const config = await Config.loadFromFile(configPath);
    const engine = new WikiEngine();
    await engine.initialize(config);
    return engine;
  }

  /**
   * Create a new WikiEngine with default configuration
   * @param {Object} overrides - Configuration overrides
   * @returns {WikiEngine} Initialized WikiEngine instance
   */
  static async createDefault(overrides = {}) {
    const engine = new WikiEngine();
    await engine.initialize(overrides);
    return engine;
  }

  /**
   * Get application name from configuration
   * @returns {string} Application name
   */
  getApplicationName() {
    // Defensive check: Handle case where config might be invalid
    if (!this.config || typeof this.config.get !== 'function') {
      console.warn('⚠️  Config invalid in getApplicationName(), using fallback');
      return 'amdWiki';
    }
    return this.config.get('applicationName', 'amdWiki');
  }

  /**
   * Get configuration instance
   * @returns {Config} Configuration instance
   */
  getConfig() {
    if (!this.config || typeof this.config.get !== 'function') {
      throw new Error('Config instance is invalid - call initialize() first');
    }
    return this.config;
  }

  /**
   * Convenience method to get PageManager
   * @returns {PageManager} PageManager instance
   */
  getPageManager() {
    return this.getManager('PageManager');
  }

  /**
   * Convenience method to get PluginManager
   * @returns {PluginManager} PluginManager instance
   */
  getPluginManager() {
    return this.getManager('PluginManager');
  }
}

module.exports = WikiEngine;
