const Engine = require('./core/Engine');
const { Config } = require('../config/Config'); // DEPRECATED

// Managers
const PageManager = require('./managers/PageManager');
const PluginManager = require('./managers/PluginManager');
const RenderingManager = require('./managers/RenderingManager');
const SearchManager = require('./managers/SearchManager');
const TemplateManager = require('./managers/TemplateManager');
const AttachmentManager = require('./managers/AttachmentManager');
const ExportManager = require('./managers/ExportManager');
const UserManager = require('./managers/UserManager');
const ACLManager = require('./managers/ACLManager');
const SchemaManager = require('./managers/SchemaManager');
const ValidationManager = require('./managers/ValidationManager');
const NotificationManager = require('./managers/NotificationManager');
const ConfigurationManager = require('./managers/ConfigurationManager');
const VariableManager = require('./managers/VariableManager');
const CacheManager = require('./managers/CacheManager');
const MarkupParser = require('./parsers/MarkupParser');

/**
 * WikiEngine - Main engine implementation
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

    // 1. Initialize Core Managers first (Config, Notifications)
    this.registerManager('ConfigurationManager', new ConfigurationManager(this));
    await this.getManager('ConfigurationManager').initialize(config);

    this.registerManager('NotificationManager', new NotificationManager(this));
    await this.getManager('NotificationManager').initialize();

    // 2. Initialize PageManager, which is fundamental for content
    this.registerManager('PageManager', new PageManager(this));
    await this.getManager('PageManager').initialize();

    // 3. Initialize other managers that may depend on the above
    this.registerManager('UserManager', new UserManager(this));
    await this.getManager('UserManager').initialize();

    this.registerManager('ACLManager', new ACLManager(this));
    await this.getManager('ACLManager').initialize();

    this.registerManager('PluginManager', new PluginManager(this));
    await this.getManager('PluginManager').initialize();

    this.registerManager('RenderingManager', new RenderingManager(this));
    await this.getManager('RenderingManager').initialize();

    this.registerManager('SearchManager', new SearchManager(this));
    await this.getManager('SearchManager').initialize();

    this.registerManager('SchemaManager', new SchemaManager(this));
    await this.getManager('SchemaManager').initialize();

    this.registerManager('PolicyManager', new PolicyManager(this));
    await this.getManager('PolicyManager').initialize();

    this.registerManager('PolicyValidator', new PolicyValidator(this));
    await this.getManager('PolicyValidator').initialize();

    this.registerManager('PolicyEvaluator', new PolicyEvaluator(this));
    await this.getManager('PolicyEvaluator').initialize();

    console.log('✅ All managers initialized');
    return this;
  }

  /**
   * Initialize all managers based on configuration
   */
  async initializeManagers() {
    console.log('🔧 Starting manager initialization...');
    
    // Register and initialize managers in dependency order
    const PageManager = require('./managers/PageManager');
    const PluginManager = require('./managers/PluginManager');
    const RenderingManager = require('./managers/RenderingManager');
    const SearchManager = require('./managers/SearchManager');
    const TemplateManager = require('./managers/TemplateManager');
    const AttachmentManager = require('./managers/AttachmentManager');
    const ExportManager = require('./managers/ExportManager');
    const UserManager = require('./managers/UserManager');
    const ACLManager = require('./managers/ACLManager');
    const SchemaManager = require('./managers/SchemaManager');
    const ValidationManager = require('./managers/ValidationManager');
    const NotificationManager = require('./managers/NotificationManager');
    const ConfigurationManager = require('./managers/ConfigurationManager');
    const VariableManager = require('./managers/VariableManager');
    const CacheManager = require('./managers/CacheManager');
    const MarkupParser = require('./parsers/MarkupParser');

    try {
      console.log('✅ Registering ValidationManager...');
      this.registerManager('ValidationManager', new ValidationManager(this));

      console.log('📋 Registering ConfigurationManager...');
      this.registerManager('ConfigurationManager', new ConfigurationManager(this));

      console.log('🗄️  Registering CacheManager...');
      this.registerManager('CacheManager', new CacheManager(this));

      console.log('🔧 Registering VariableManager...');
      this.registerManager('VariableManager', new VariableManager(this));

      console.log('📝 Registering MarkupParser...');
      this.registerManager('MarkupParser', new MarkupParser(this));

      console.log('📄 Registering PageManager...');
      this.registerManager('PageManager', new PageManager(this));
      
      console.log('🔌 Registering PluginManager...');
      this.registerManager('PluginManager', new PluginManager(this));
      
      console.log('🎨 Registering RenderingManager...');
      this.registerManager('RenderingManager', new RenderingManager(this));
      
      console.log('🔍 Registering SearchManager...');
      this.registerManager('SearchManager', new SearchManager(this));
      
      console.log('📋 Registering TemplateManager...');
      this.registerManager('TemplateManager', new TemplateManager(this));
      
      console.log('📎 Registering AttachmentManager...');
      this.registerManager('AttachmentManager', new AttachmentManager(this));
      
      console.log('📦 Registering ExportManager...');
      this.registerManager('ExportManager', new ExportManager(this));
      
      console.log('👤 Registering UserManager...');
      this.registerManager('UserManager', new UserManager(this));
      
      console.log('🔒 Registering ACLManager...');
      this.registerManager('ACLManager', new ACLManager(this));
      
      // Policy-based access control managers
      const PolicyManager = require('./managers/PolicyManager');
      const PolicyEvaluator = require('./managers/PolicyEvaluator');
      const PolicyValidator = require('./managers/PolicyValidator');
      
      console.log('📋 Registering PolicyManager...');
      this.registerManager('PolicyManager', new PolicyManager(this));
      
      console.log('📋 Registering PolicyEvaluator...');
      this.registerManager('PolicyEvaluator', new PolicyEvaluator(this));
      
      console.log('📋 Registering PolicyValidator...');
      this.registerManager('PolicyValidator', new PolicyValidator(this));
      
      console.log('� Registering AuditManager...');
      const AuditManager = require('./managers/AuditManager');
      this.registerManager('AuditManager', new AuditManager(this));
      
      console.log('�🔔 Registering NotificationManager...');
      this.registerManager('NotificationManager', new NotificationManager(this));
      
      console.log('🏢 Registering SchemaManager...');
      this.registerManager('SchemaManager', new SchemaManager(this));
      
      // Initialize in dependency order - ValidationManager first
      console.log('🚀 Initializing ValidationManager...');
      await this.getManager('ValidationManager').initialize();

      console.log('🚀 Initializing ConfigurationManager...');
      await this.getManager('ConfigurationManager').initialize();

      // Establish bridge between Config.js and ConfigurationManager
      if (this.config && typeof this.config.setConfigurationManager === 'function') {
        this.config.setConfigurationManager(this.getManager('ConfigurationManager'));
      }

      console.log('🚀 Initializing CacheManager...');
      await this.getManager('CacheManager').initialize();

      console.log('🚀 Initializing VariableManager...');
      await this.getManager('VariableManager').initialize();

      console.log('🚀 Initializing MarkupParser...');
      await this.getManager('MarkupParser').initialize();

      console.log('🚀 Initializing PageManager...');
      await this.getManager('PageManager').initialize();
      
      console.log('🚀 Initializing PluginManager...');
      await this.getManager('PluginManager').initialize();
      
      console.log('🚀 Initializing RenderingManager...');
      await this.getManager('RenderingManager').initialize();
      
      console.log('🚀 Initializing SearchManager...');
      await this.getManager('SearchManager').initialize();
      
      console.log('🚀 Initializing TemplateManager...');
      await this.getManager('TemplateManager').initialize();
      
      console.log('🚀 Initializing AttachmentManager...');
      await this.getManager('AttachmentManager').initialize();
      
      console.log('🚀 Initializing ExportManager...');
      await this.getManager('ExportManager').initialize();
      
      console.log('🚀 Initializing UserManager...');
      await this.getManager('UserManager').initialize();
      
      console.log('🚀 Initializing ACLManager...');
      await this.getManager('ACLManager').initialize();
      
      console.log('🚀 Initializing PolicyManager...');
      await this.getManager('PolicyManager').initialize();
      
      console.log('🚀 Initializing PolicyEvaluator...');
      await this.getManager('PolicyEvaluator').initialize();
      
      console.log('🚀 Initializing PolicyValidator...');
      await this.getManager('PolicyValidator').initialize();
      
      console.log('🚀 Initializing AuditManager...');
      // Load audit configuration
      const auditConfig = await this.loadAuditConfig();
      await this.getManager('AuditManager').initialize(auditConfig);
      
      console.log('🚀 Initializing NotificationManager...');
      await this.getManager('NotificationManager').initialize();
      
      console.log('🚀 Initializing SchemaManager...');
      await this.getManager('SchemaManager').initialize();
      
      console.log('✅ All managers initialized successfully');
    } catch (err) {
      console.error('❌ Manager initialization failed:', err);
      throw err;
    }
  }

  /**
   * Load audit configuration from audit-config.json
   * @returns {Object} Audit configuration
   */
  async loadAuditConfig() {
    const fs = require('fs-extra');
    const path = require('path');
    
    const auditConfigPath = path.join(__dirname, '../config/audit/audit-config.json');
    
    try {
      if (await fs.pathExists(auditConfigPath)) {
        const auditConfigContent = await fs.readFile(auditConfigPath, 'utf-8');
        const auditConfig = JSON.parse(auditConfigContent);
        console.log('📋 Loaded audit configuration from file');
        return auditConfig.audit || auditConfig;
      }
    } catch (error) {
      console.warn('⚠️ Failed to load audit configuration, using defaults:', error.message);
    }
    
    // Return default audit configuration
    return {
      enabled: true,
      logLevel: 'info',
      maxQueueSize: 1000,
      flushInterval: 30000,
      retentionDays: 90,
      logDirectory: path.join(__dirname, '../logs'),
      auditFileName: 'audit.log',
      archiveFileName: 'audit-archive.log',
      maxFileSize: '10MB',
      maxFiles: 10
    };
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
