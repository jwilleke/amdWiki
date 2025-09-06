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
    // Handle Config instance or plain object
    if (config instanceof Config) {
      this.config = config;
    } else {
      this.config = new Config(config);
    }

    // Validate configuration
    const errors = this.config.validate();
    if (errors.length > 0) {
      throw new Error(`Configuration errors: ${errors.join(', ')}`);
    }

    // Initialize base engine
    await super.initialize(this.config.getAll());

    // Initialize and register managers
    await this.initializeManagers();

    console.log(`${this.getApplicationName()} initialized successfully`);
  }

  /**
   * Initialize all managers based on configuration
   */
  async initializeManagers() {
    const managersConfig = this.config.get('managers', {});

    // Initialize PageManager
    if (managersConfig.pageManager?.enabled) {
      const pageManager = new PageManager(this);
      await pageManager.initialize({
        pagesDir: this.config.get('wiki.pagesDir')
      });
      this.registerManager('PageManager', pageManager);
    }

    // Initialize PluginManager
    if (managersConfig.pluginManager?.enabled) {
      const pluginManager = new PluginManager(this);
      await pluginManager.initialize({
        searchPaths: managersConfig.pluginManager.searchPaths || ['./plugins']
      });
      this.registerManager('PluginManager', pluginManager);
    }

    // TODO: Initialize other managers as they are created
    // - RenderingManager
    // - SearchManager
    // - TemplateManager
    // - AttachmentManager
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
    return this.config.get('applicationName', 'amdWiki');
  }

  /**
   * Get configuration instance
   * @returns {Config} Configuration instance
   */
  getConfig() {
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
