/* eslint-disable no-console */

import Engine from './core/Engine';
import type { WikiConfig } from './types/Config';
import type WikiContext from './context/WikiContext';
import type { WikiEngine as IWikiEngine } from './types/WikiEngine';

// Managers
import ConfigurationManager from './managers/ConfigurationManager';
import NotificationManager from './managers/NotificationManager';
import PageManager from './managers/PageManager';
import PluginManager from './managers/PluginManager';
import RenderingManager from './managers/RenderingManager';
import SearchManager from './managers/SearchManager';
import UserManager from './managers/UserManager';
import ACLManager from './managers/ACLManager';
import SchemaManager from './managers/SchemaManager';
import VariableManager from './managers/VariableManager';
import ValidationManager from './managers/ValidationManager';
import PolicyManager from './managers/PolicyManager';
import PolicyValidator from './managers/PolicyValidator';
import PolicyEvaluator from './managers/PolicyEvaluator';
import ExportManager from './managers/ExportManager';
import TemplateManager from './managers/TemplateManager';
import AttachmentManager from './managers/AttachmentManager';
import BackupManager from './managers/BackupManager';
import CacheManager from './managers/CacheManager';
import AuditManager from './managers/AuditManager';

// Parsers
import MarkupParser from './parsers/MarkupParser';

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
 * @implements IWikiEngine
 *
 * @property {WikiContext|null} context - Currently active WikiContext for request scope
 * @property {WikiConfig|null} config - Configuration object (inherited from Engine)
 * @property {number} startTime - Timestamp when the engine was started
 *
 * @see {@link Engine} for base functionality
 * @see {@link WikiContext} for request-scoped context
 */
class WikiEngine extends Engine implements IWikiEngine {
  /** Currently active WikiContext for request scope */
  public context: WikiContext | null;

  /** Timestamp when the engine was started */
  public readonly startTime: number;

  /**
   * Creates a new WikiEngine instance
   *
   * @constructor
   * @param {WikiConfig} [config={}] - Initial configuration object (not used in constructor)
   * @param {WikiContext|null} [context=null] - Initial WikiContext (optional)
   */
  constructor(config: WikiConfig = {} as WikiConfig, context: WikiContext | null = null) {
    super();
    this.config = config;
    this.context = context;
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
  setContext(context: WikiContext): WikiEngine {
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
  getContext(): WikiContext | null {
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
   * @param {WikiConfig} [config={}] - Configuration object (passed to ConfigurationManager)
   * @returns {Promise<WikiEngine>} The initialized engine instance
   * @throws {Error} If any manager fails to initialize
   *
   * @example
   * const engine = new WikiEngine();
   * await engine.initialize();
   * console.log('Engine ready with', engine.getRegisteredManagers().length, 'managers');
   */
  async initialize(config: WikiConfig = {} as WikiConfig): Promise<WikiEngine> {
    // NOTE: All configuration access MUST use ConfigurationManager.getProperty()
    // The config parameter is passed to ConfigurationManager for any runtime overrides

    // 1. Initialize core managers with no dependencies
    const configManager = new ConfigurationManager(this);
    this.registerManager('ConfigurationManager', configManager);
    await configManager.initialize(config);

    // 2. Initialize CacheManager early so other managers can use caching
    const cacheManager = new CacheManager(this);
    this.registerManager('CacheManager', cacheManager);
    await cacheManager.initialize();

    // 3. Initialize UserManager early as it's critical for security and context
    const userManager = new UserManager(this);
    this.registerManager('UserManager', userManager);
    await userManager.initialize();

    // 4. Initialize other managers that may depend on the above
    const notificationManager = new NotificationManager(this);
    this.registerManager('NotificationManager', notificationManager);
    await notificationManager.initialize();

    const pageManager = new PageManager(this);
    this.registerManager('PageManager', pageManager);
    await pageManager.initialize();

    const templateManager = new TemplateManager(this);
    this.registerManager('TemplateManager', templateManager);
    await templateManager.initialize();

    // Initialize PolicyManager and PolicyEvaluator BEFORE ACLManager
    // because ACLManager depends on PolicyEvaluator
    const policyManager = new PolicyManager(this);
    this.registerManager('PolicyManager', policyManager);
    await policyManager.initialize();

    const policyValidator = new PolicyValidator(this);
    this.registerManager('PolicyValidator', policyValidator);
    await policyValidator.initialize();

    const policyEvaluator = new PolicyEvaluator(this);
    this.registerManager('PolicyEvaluator', policyEvaluator);
    await policyEvaluator.initialize();

    const aclManager = new ACLManager(this);
    this.registerManager('ACLManager', aclManager);
    await aclManager.initialize();

    const pluginManager = new PluginManager(this);
    this.registerManager('PluginManager', pluginManager);
    await pluginManager.initialize();

    // Initialize MarkupParser before RenderingManager (RenderingManager depends on it)
    const markupParser = new MarkupParser(this);
    this.registerManager('MarkupParser', markupParser);
    await markupParser.initialize();

    const renderingManager = new RenderingManager(this);
    this.registerManager('RenderingManager', renderingManager);
    await renderingManager.initialize();

    const searchManager = new SearchManager(this);
    this.registerManager('SearchManager', searchManager);
    await searchManager.initialize();

    const validationManager = new ValidationManager(this);
    this.registerManager('ValidationManager', validationManager);
    await validationManager.initialize();

    // Add VariableManager to the initialization sequence
    const variableManager = new VariableManager(this);
    this.registerManager('VariableManager', variableManager);
    await variableManager.initialize();

    const schemaManager = new SchemaManager(this);
    this.registerManager('SchemaManager', schemaManager);
    await schemaManager.initialize();

    // Add the missing ExportManager to the initialization sequence
    const exportManager = new ExportManager(this);
    this.registerManager('ExportManager', exportManager);
    await exportManager.initialize();

    // Add AttachmentManager to the initialization sequence
    const attachmentManager = new AttachmentManager(this);
    this.registerManager('AttachmentManager', attachmentManager);
    await attachmentManager.initialize();

    // Add AuditManager for audit trail logging
    const auditManager = new AuditManager(this);
    this.registerManager('AuditManager', auditManager);
    await auditManager.initialize();

    // Add BackupManager to the initialization sequence (must be last)
    const backupManager = new BackupManager(this);
    this.registerManager('BackupManager', backupManager);
    await backupManager.initialize();

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
   * @param {WikiConfig} [overrides={}] - Configuration overrides to apply
   * @returns {Promise<WikiEngine>} Fully initialized WikiEngine instance
   *
   * @example
   * const engine = await WikiEngine.createDefault({
   *   applicationName: 'MyWiki',
   *   port: 3000
   * });
   */
  static async createDefault(overrides: WikiConfig = {} as WikiConfig): Promise<WikiEngine> {
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
  getApplicationName(): string {
    try {
      const configManager = this.getManager<ConfigurationManager>('ConfigurationManager');
      if (configManager) {
        const name = configManager.getProperty('amdwiki.applicationName', 'amdWiki') as string;
        return name || 'amdWiki';
      }
      return 'amdWiki';
    } catch {
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
  getConfig(): never {
    throw new Error(
      'getConfig() is deprecated. Use engine.getManager("ConfigurationManager").getProperty() instead. ' +
        'See Issue #176 for migration guide.'
    );
  }

  /**
   * Convenience method to get PageManager
   *
   * @returns {PageManager | undefined} PageManager instance or undefined if not initialized
   *
   * @example
   * const page = await engine.getPageManager()?.getPage('Main');
   */
  getPageManager(): PageManager | undefined {
    return this.getManager<PageManager>('PageManager');
  }

  /**
   * Convenience method to get PluginManager
   *
   * @returns {PluginManager | undefined} PluginManager instance or undefined if not initialized
   *
   * @example
   * const plugins = engine.getPluginManager()?.getAllPlugins();
   */
  getPluginManager(): PluginManager | undefined {
    return this.getManager<PluginManager>('PluginManager');
  }
}

export default WikiEngine;
