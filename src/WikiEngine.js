const Engine = require('./core/Engine');

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
const CacheManager = require('./managers/CacheManager');
const AuditManager = require('./managers/AuditManager');

// Parsers
const MarkupParser = require('./parsers/MarkupParser');

/**
 * WikiEngine - The core orchestrator for the wiki application
 *
 * Follows JSPWiki's architecture patterns by coordinating all managers
 * and providing a central access point for wiki functionality. This is the
 * main entry point for the application and initializes all 24+ managers
 * in the correct dependency order.
 *
 * @class WikiEngine
 * @extends Engine
 *
 * @property {WikiContext|null} context - Currently active WikiContext for request scope
 * @property {Object|null} config - Legacy configuration object (deprecated, use ConfigurationManager)
 * @property {number} startTime - Timestamp when the engine was started
 *
 * @see {@link Engine} for base functionality
 * @see {@link WikiContext} for request-scoped context
 */
class WikiEngine extends Engine {
  /**
   * Creates a new WikiEngine instance
   *
   * @constructor
   * @param {Object} [config={}] - Initial configuration object (not used in constructor)
   * @param {WikiContext|null} [context=null] - Initial WikiContext (optional)
   */
  constructor(config = {}, context = null) {
    super(config);
    this.context = context || null;
    this.startTime = Date.now(); // Track when the engine was started
  }

  /**
   * Sets the currently active WikiContext for the engine
   *
   * The WikiContext encapsulates request-specific information including
   * the current user, page, and rendering context.
   *
   * @param {WikiContext} context - The WikiContext to set as active
   * @returns {WikiEngine} The engine instance for method chaining
   *
   * @example
   * const context = new WikiContext(engine, { pageName: 'Main' });
   * engine.setContext(context).getPageManager().getPage('Main');
   */
  setContext(context) {
    this.context = context;
    return this;
  }

  /**
   * Gets the currently active WikiContext
   *
   * @returns {WikiContext|null} The active context or null if none set
   *
   * @example
   * const context = engine.getContext();
   * if (context) {
   *   console.log('Current page:', context.pageName);
   * }
   */
  getContext() {
    return this.context;
  }

  /**
   * Initialize the wiki engine with configuration
   *
   * This method initializes all 24+ managers in the correct dependency order:
   * 1. ConfigurationManager - Core configuration (no dependencies)
   * 2. CacheManager - Caching support (used by many managers)
   * 3. UserManager - User authentication/authorization (critical for security)
   * 4. NotificationManager - Notification system
   * 5. PageManager - Page storage and retrieval
   * 6. TemplateManager - Template rendering
   * 7. PolicyManager/PolicyValidator/PolicyEvaluator - Policy system
   * 8. ACLManager - Access control (depends on PolicyEvaluator)
   * 9. PluginManager - Plugin system
   * 10. MarkupParser - Markup parsing
   * 11. RenderingManager - Content rendering (depends on MarkupParser)
   * 12. SearchManager - Full-text search
   * 13. ValidationManager - Schema validation
   * 14. VariableManager - Variable expansion
   * 15. SchemaManager - Schema management
   * 16. ExportManager - Page export
   * 17. AttachmentManager - File attachments
   * 18. AuditManager - Audit logging
   * 19. BackupManager - Backup/restore (must be last)
   *
   * @async
   * @param {Object} [config={}] - Configuration object (passed to ConfigurationManager)
   * @returns {Promise<WikiEngine>} The initialized engine instance
   * @throws {Error} If any manager fails to initialize
   *
   * @example
   * const engine = new WikiEngine();
   * await engine.initialize();
   * console.log('Engine ready with', engine.getRegisteredManagers().length, 'managers');
   */
  async initialize(config = {}) {
    // NOTE: All configuration access MUST use ConfigurationManager.getProperty()
    // The config parameter is passed to ConfigurationManager for any runtime overrides

    // 1. Initialize core managers with no dependencies
    this.registerManager('ConfigurationManager', new ConfigurationManager(this));
    await this.getManager('ConfigurationManager').initialize(config);

    // 2. Initialize CacheManager early so other managers can use caching
    this.registerManager('CacheManager', new CacheManager(this));
    await this.getManager('CacheManager').initialize();

    // 3. Initialize UserManager early as it's critical for security and context
    this.registerManager('UserManager', new UserManager(this));
    await this.getManager('UserManager').initialize();

    // 4. Initialize other managers that may depend on the above
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

    // Add AuditManager for audit trail logging
    this.registerManager('AuditManager', new AuditManager(this));
    await this.getManager('AuditManager').initialize();

    // Add BackupManager to the initialization sequence (must be last)
    this.registerManager('BackupManager', new BackupManager(this));
    await this.getManager('BackupManager').initialize();

    // Mark engine as initialized (required for Engine base class contract)
    this.initialized = true;

    console.log('✅ All managers initialized');
    return this;
  }

  /**
   * Create a new WikiEngine with default configuration
   *
   * Factory method for creating and initializing a WikiEngine in one step.
   *
   * @static
   * @async
   * @param {Object} [overrides={}] - Configuration overrides to apply
   * @returns {Promise<WikiEngine>} Fully initialized WikiEngine instance
   *
   * @example
   * const engine = await WikiEngine.createDefault({
   *   applicationName: 'MyWiki',
   *   port: 3000
   * });
   */
  static async createDefault(overrides = {}) {
    const engine = new WikiEngine();
    await engine.initialize(overrides);
    return engine;
  }

  /**
   * Get application name from configuration
   *
   * Uses ConfigurationManager to retrieve the application name.
   *
   * @returns {string} Application name (defaults to 'amdWiki')
   *
   * @example
   * const name = engine.getApplicationName(); // 'amdWiki'
   */
  getApplicationName() {
    try {
      const configManager = this.getManager('ConfigurationManager');
      return configManager.getProperty('amdwiki.applicationName', 'amdWiki');
    } catch (error) {
      // ConfigurationManager not yet initialized
      return 'amdWiki';
    }
  }

  /**
   * Get configuration instance
   *
   * @deprecated Use engine.getManager('ConfigurationManager').getProperty() instead
   * @throws {Error} Always throws - use ConfigurationManager instead
   *
   * @example
   * // OLD (deprecated):
   * // const config = engine.getConfig();
   * // const value = config.get('key');
   *
   * // NEW (use this instead):
   * const configManager = engine.getManager('ConfigurationManager');
   * const value = configManager.getProperty('amdwiki.key', 'default');
   */
  getConfig() {
    throw new Error(
      'getConfig() is deprecated. Use engine.getManager("ConfigurationManager").getProperty() instead. ' +
      'See Issue #176 for migration guide.'
    );
  }

  /**
   * Convenience method to get PageManager
   *
   * @returns {PageManager} PageManager instance
   *
   * @example
   * const page = await engine.getPageManager().getPage('Main');
   */
  getPageManager() {
    return this.getManager('PageManager');
  }

  /**
   * Convenience method to get PluginManager
   *
   * @returns {PluginManager} PluginManager instance
   *
   * @example
   * const plugins = engine.getPluginManager().getAllPlugins();
   */
  getPluginManager() {
    return this.getManager('PluginManager');
  }
}

module.exports = WikiEngine;
