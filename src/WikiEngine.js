const Engine = require('./core/Engine');
const { Config } = require('../config/Config'); // TODO: Remove after migrating WikiRoutes.getConfig() usage

// Managers
const ConfigurationManager = require('./managers/ConfigurationManager');
const NotificationManager = require('./managers/NotificationManager');
const PageManager = require('./managers/PageManager');
const PluginManager = require('./managers/PluginManager');
const RenderingManager = require('./managers/RenderingManager');
const SearchManager = require('./managers/SearchManager');
const UserManager = require('./managers/UserManager');
const ACLManager = require('./managers/ACLManager');
const SchemaManager = require('./managers/SchemaManager');
const VariableManager = require('./managers/VariableManager');
const ValidationManager = require('./managers/ValidationManager');
const PolicyManager = require('./managers/PolicyManager');
const PolicyValidator = require('./managers/PolicyValidator');
const PolicyEvaluator = require('./managers/PolicyEvaluator');
const ExportManager = require('./managers/ExportManager');
const TemplateManager = require('./managers/TemplateManager');
const AttachmentManager = require('./managers/AttachmentManager');
const BackupManager = require('./managers/BackupManager');

// Parsers
const MarkupParser = require('./parsers/MarkupParser');

/**
 * WikiEngine - The core orchestrator for the wiki application
 * Follows JSPWiki's architecture patterns
 */
class WikiEngine extends Engine {
  constructor(config = {}, context = null) {
    super(config);
    this.context = context || null;
    this.config = null;
    this.startTime = Date.now(); // Track when the engine was started
  }

  /**
   * Sets the currently active WikiContext for the engine.
   * @param {WikiContext} context The context to set.
   * @returns {WikiEngine} The engine instance for chaining.
   */
  setContext(context) {
    this.context = context;
    return this;
  }

  /**
   * Gets the currently active WikiContext.
   * @returns {WikiContext|null} The active context.
   */
  getContext() {
    return this.context;
  }

  /**
   * Initialize the wiki engine with configuration
   * @param {Object|Config} config - Configuration object or Config instance
   */
  async initialize(config) {
    this.config = config;

    // 1. Initialize core managers with no dependencies
    this.registerManager('ConfigurationManager', new ConfigurationManager(this));
    await this.getManager('ConfigurationManager').initialize(config);

    // 2. Initialize UserManager early as it's critical for security and context
    this.registerManager('UserManager', new UserManager(this));
    await this.getManager('UserManager').initialize(this.config);

    // 3. Initialize other managers that may depend on the above
    this.registerManager('NotificationManager', new NotificationManager(this));
    await this.getManager('NotificationManager').initialize();

    this.registerManager('PageManager', new PageManager(this));
    await this.getManager('PageManager').initialize();

    this.registerManager('TemplateManager', new TemplateManager(this));
    await this.getManager('TemplateManager').initialize();

    // Initialize PolicyManager and PolicyEvaluator BEFORE ACLManager
    // because ACLManager depends on PolicyEvaluator
    this.registerManager('PolicyManager', new PolicyManager(this));
    await this.getManager('PolicyManager').initialize();

    this.registerManager('PolicyValidator', new PolicyValidator(this));
    await this.getManager('PolicyValidator').initialize();

    this.registerManager('PolicyEvaluator', new PolicyEvaluator(this));
    await this.getManager('PolicyEvaluator').initialize();

    this.registerManager('ACLManager', new ACLManager(this));
    await this.getManager('ACLManager').initialize();

    this.registerManager('PluginManager', new PluginManager(this));
    await this.getManager('PluginManager').initialize();

    // Initialize MarkupParser before RenderingManager (RenderingManager depends on it)
    this.registerManager('MarkupParser', new MarkupParser(this));
    await this.getManager('MarkupParser').initialize();

    this.registerManager('RenderingManager', new RenderingManager(this));
    await this.getManager('RenderingManager').initialize();

    this.registerManager('SearchManager', new SearchManager(this));
    await this.getManager('SearchManager').initialize();

    this.registerManager('ValidationManager', new ValidationManager(this));
    await this.getManager('ValidationManager').initialize();

    // Add VariableManager to the initialization sequence
    this.registerManager('VariableManager', new VariableManager(this));
    await this.getManager('VariableManager').initialize();

    this.registerManager('SchemaManager', new SchemaManager(this));
    await this.getManager('SchemaManager').initialize();

    // Add the missing ExportManager to the initialization sequence
    this.registerManager('ExportManager', new ExportManager(this));
    await this.getManager('ExportManager').initialize();

    // Add AttachmentManager to the initialization sequence
    this.registerManager('AttachmentManager', new AttachmentManager(this));
    await this.getManager('AttachmentManager').initialize();

    // Add BackupManager to the initialization sequence (must be last)
    this.registerManager('BackupManager', new BackupManager(this));
    await this.getManager('BackupManager').initialize();

    console.log('✅ All managers initialized');
    return this;
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
