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
    this.startTime = Date.now(); // Track when the engine was started
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
    
    // Initialize base engine properties only (don't call initializeManagers twice)
    if (this.initialized) {
      throw new Error('Engine already initialized');
    }

    // Store configuration - don't overwrite this.config if it's already set
    this.properties = new Map(Object.entries(this.config.getAll()));
    
    // Defensive check #2: Restore config instance if it was overwritten
    if (!this.config || typeof this.config.get !== 'function') {
      console.warn('⚠️  Config instance was overwritten, restoring...');
      this.config = configInstance;
    }
    console.log('✅ Config instance verified after initialization');

    // Initialize and register managers (only once)
    await this.initializeManagers();
    
    this.initialized = true;

    console.log(`✅ ${this.getApplicationName()} initialized successfully`);
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
    
    try {
      console.log('✅ Registering ValidationManager...');
      this.registerManager('ValidationManager', new ValidationManager(this));
      
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
