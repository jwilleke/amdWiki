const fs = require('fs-extra');
const path = require('path');

/**
 * ConfigurationManager - Handles JSPWiki-compatible configuration
 * Merges configurations in order:
 * 1. app-default-config.json (base defaults)
 * 2. app-{environment}-config.json (environment-specific, optional)
 * 3. app-custom-config.json (local overrides, optional)
 *
 * Environment is determined by NODE_ENV (default: 'development')
 */
class ConfigurationManager {
  constructor(engine) {
    this.engine = engine;
    this.defaultConfig = null;
    this.environmentConfig = null;
    this.customConfig = null;
    this.mergedConfig = null;
    this.environment = process.env.NODE_ENV || 'development';

    const configDir = path.join(process.cwd(), 'config');
    this.defaultConfigPath = path.join(configDir, 'app-default-config.json');
    this.environmentConfigPath = path.join(configDir, `app-${this.environment}-config.json`);
    this.customConfigPath = path.join(configDir, 'app-custom-config.json');
  }

  /**
   * Initialize the configuration manager
   */
  async initialize() {
    try {
      await this.loadConfigurations();
      console.log(`📋 ConfigurationManager initialized for environment: ${this.environment}`);
      console.log(`📋 Loaded configs: default + ${this.environmentConfig ? 'environment' : 'no environment'} + ${this.customConfig && Object.keys(this.customConfig).length > 0 ? 'custom' : 'no custom'}`);
    } catch (error) {
      console.error('Failed to initialize ConfigurationManager:', error);
      throw error;
    }
  }

  /**
   * Load and merge configurations
   * Priority: default < environment < custom (highest)
   */
  async loadConfigurations() {
    // 1. Load default configuration (required)
    if (await fs.pathExists(this.defaultConfigPath)) {
      this.defaultConfig = await fs.readJson(this.defaultConfigPath);
    } else {
      throw new Error(`Default configuration file not found: ${this.defaultConfigPath}`);
    }

    // 2. Load environment-specific configuration (optional)
    this.environmentConfig = {};
    if (await fs.pathExists(this.environmentConfigPath)) {
      const envData = await fs.readJson(this.environmentConfigPath);
      // Filter out comment fields starting with _
      for (const [key, value] of Object.entries(envData)) {
        if (!key.startsWith('_')) {
          this.environmentConfig[key] = value;
        }
      }
      console.log(`📋 Loaded environment config: ${this.environmentConfigPath}`);
    }

    // 3. Load custom configuration (optional, for local overrides)
    this.customConfig = {};
    if (await fs.pathExists(this.customConfigPath)) {
      const customData = await fs.readJson(this.customConfigPath);
      // Filter out comment fields starting with _
      for (const [key, value] of Object.entries(customData)) {
        if (!key.startsWith('_')) {
          this.customConfig[key] = value;
        }
      }
      console.log(`📋 Loaded custom config: ${this.customConfigPath}`);
    }

    // Merge configurations (later configs override earlier ones)
    this.mergedConfig = {
      ...this.defaultConfig,
      ...this.environmentConfig,
      ...this.customConfig
    };
  }

  /**
   * Get a configuration property
   * @param {string} key - Configuration property key
   * @param {*} defaultValue - Default value if property not found
   * @returns {*} Configuration value
   */
  getProperty(key, defaultValue = null) {
    return this.mergedConfig?.[key] ?? defaultValue;
  }

  /**
   * Set a configuration property (updates custom config)
   * @param {string} key - Configuration property key
   * @param {*} value - Configuration value
   */
  async setProperty(key, value) {
    if (!this.customConfig) {
      this.customConfig = {};
    }

    this.customConfig[key] = value;
    this.mergedConfig[key] = value;

    // Save to custom config file
    await this.saveCustomConfiguration();
  }

  /**
   * Save custom configuration to file
   */
  async saveCustomConfiguration() {
    const configToSave = {
      "_comment": "This file overrides values from app-default-config.json",
      ...this.customConfig
    };

    await fs.writeJson(this.customConfigPath, configToSave, { spaces: 2 });
  }

  /**
   * Get all configuration properties
   * @returns {Object} All merged configuration properties
   */
  getAllProperties() {
    return { ...this.mergedConfig };
  }

  /**
   * Get application name
   * @returns {string} Application name
   */
  getApplicationName() {
    return this.getProperty('amdwiki.applicationName', 'amdWiki');
  }

  /**
   * Get base URL
   * @returns {string} Base URL
   */
  getBaseURL() {
    return this.getProperty('amdwiki.baseURL', 'http://localhost:3000');
  }

  /**
   * Get front page name
   * @returns {string} Front page name
   */
  getFrontPage() {
    return this.getProperty('amdwiki.frontPage', 'Welcome');
  }

  /**
   * Get encoding
   * @returns {string} Encoding
   */
  getEncoding() {
    return this.getProperty('amdwiki.encoding', 'UTF-8');
  }

  /**
   * Get server port
   * @returns {number} Server port
   */
  getServerPort() {
    return parseInt(this.getProperty('amdwiki.server.port', '3000'));
  }

  /**
   * Get server host
   * @returns {string} Server host
   */
  getServerHost() {
    return this.getProperty('amdwiki.server.host', 'localhost');
  }

  /**
   * Get session secret
   * @returns {string} Session secret
   */
  getSessionSecret() {
    return this.getProperty('amdwiki.session.secret', 'amdwiki-session-secret-change-in-production');
  }

  /**
   * Get session max age in milliseconds
   * @returns {number} Session max age
   */
  getSessionMaxAge() {
    return parseInt(this.getProperty('amdwiki.session.maxAge', '86400000'));
  }

  /**
   * Get session secure flag
   * @returns {boolean} Session secure flag
   */
  getSessionSecure() {
    return this.getProperty('amdwiki.session.secure', 'false') === 'true';
  }

  /**
   * Get session httpOnly flag
   * @returns {boolean} Session httpOnly flag
   */
  getSessionHttpOnly() {
    return this.getProperty('amdwiki.session.httpOnly', 'true') === 'true';
  }

  /**
   * Get directory paths
   * @returns {Object} Directory configuration
   */
  getDirectories() {
    return {
      pages: this.getProperty('amdwiki.directories.pages', './pages'),
      templates: this.getProperty('amdwiki.directories.templates', './templates'),
      resources: this.getProperty('amdwiki.directories.resources', './resources'),
      data: this.getProperty('amdwiki.directories.data', './data'),
      work: this.getProperty('amdwiki.directories.work', './')
    };
  }

  /**
   * Get manager configuration
   * @param {string} managerName - Name of manager
   * @returns {Object} Manager configuration
   */
  getManagerConfig(managerName) {
    const enabled = this.getProperty(`amdwiki.managers.${managerName}.enabled`, true);
    const config = { enabled };

    // Get manager-specific settings
    const keys = Object.keys(this.properties).filter(key =>
      key.startsWith(`amdwiki.managers.${managerName}.`) &&
      !key.endsWith('.enabled')
    );

    keys.forEach(key => {
      const settingName = key.replace(`amdwiki.managers.${managerName}.`, '');
      config[settingName] = this.getProperty(key);
    });

    return config;
  }

  /**
   * Get feature configuration
   * @param {string} featureName - Name of feature
   * @returns {Object} Feature configuration
   */
  getFeatureConfig(featureName) {
    const enabled = this.getProperty(`amdwiki.features.${featureName}.enabled`, false);
    const config = { enabled };

    // Get feature-specific settings
    const keys = Object.keys(this.properties).filter(key =>
      key.startsWith(`amdwiki.features.${featureName}.`) &&
      !key.endsWith('.enabled')
    );

    keys.forEach(key => {
      const settingName = key.replace(`amdwiki.features.${featureName}.`, '');
      config[settingName] = this.getProperty(key);
    });

    return config;
  }

  /**
   * Get logging configuration
   * @returns {Object} Logging configuration
   */
  getLoggingConfig() {
    return {
      level: this.getProperty('amdwiki.logging.level', 'info'),
      dir: this.getProperty('amdwiki.logging.dir', './logs'),
      maxSize: this.getProperty('amdwiki.logging.maxSize', '1MB'),
      maxFiles: parseInt(this.getProperty('amdwiki.logging.maxFiles', '5'))
    };
  }

  /**
   * Get search configuration
   * @returns {Object} Search configuration
   */
  getSearchConfig() {
    return {
      indexDir: this.getProperty('amdwiki.search.indexDir', './search-index'),
      enabled: this.getProperty('amdwiki.search.enabled', 'true') === 'true'
    };
  }

  /**
   * Get access control configuration
   * @returns {Object} Access control configuration
   */
  getAccessControlConfig() {
    return {
      contextAware: {
        enabled: this.getProperty('amdwiki.accessControl.contextAware.enabled', 'true') === 'true',
        timeZone: this.getProperty('amdwiki.accessControl.contextAware.timeZone', 'UTC')
      },
      businessHours: {
        enabled: this.getProperty('amdwiki.accessControl.businessHours.enabled', 'false') === 'true',
        start: this.getProperty('amdwiki.accessControl.businessHours.start', '09:00'),
        end: this.getProperty('amdwiki.accessControl.businessHours.end', '17:00'),
        days: this.getProperty('amdwiki.accessControl.businessHours.days', 'monday,tuesday,wednesday,thursday,friday').split(',')
      }
    };
  }

  /**
   * Get audit configuration
   * @returns {Object} Audit configuration
   */
  getAuditConfig() {
    return {
      enabled: this.getProperty('amdwiki.audit.enabled', 'true') === 'true',
      logFile: this.getProperty('amdwiki.audit.logFile', './users/access-log.json'),
      retention: {
        maxFiles: parseInt(this.getProperty('amdwiki.audit.retention.maxFiles', '10')),
        maxAge: this.getProperty('amdwiki.audit.retention.maxAge', '30d')
      },
      includeContext: {
        ip: this.getProperty('amdwiki.audit.includeContext.ip', 'true') === 'true',
        userAgent: this.getProperty('amdwiki.audit.includeContext.userAgent', 'true') === 'true',
        timestamp: this.getProperty('amdwiki.audit.includeContext.timestamp', 'true') === 'true',
        decision: this.getProperty('amdwiki.audit.includeContext.decision', 'true') === 'true',
        reason: this.getProperty('amdwiki.audit.includeContext.reason', 'true') === 'true'
      }
    };
  }

  /**
   * Get RSS settings
   * @returns {Object} RSS configuration
   */
  getRSSConfig() {
    return {
      generate: this.getProperty('amdwiki.rss.generate', true),
      fileName: this.getProperty('amdwiki.rss.fileName', 'rss.xml'),
      interval: this.getProperty('amdwiki.rss.interval', 3600),
      channelTitle: this.getProperty('amdwiki.rss.channelTitle', 'amdWiki RSS Feed'),
      channelDescription: this.getProperty('amdwiki.rss.channelDescription', 'RSS feed for amdWiki updates')
    };
  }

  /**
   * Get search configuration
   * @returns {Object} Search configuration
   */
  getSearchConfig() {
    return {
      provider: this.getProperty('amdwiki.searchProvider', 'LuceneSearchProvider'),
      maxItems: this.getProperty('amdwiki.plugin.searchresult.maxItems', 50),
      showScore: this.getProperty('amdwiki.plugin.searchresult.showScore', true)
    };
  }

  /**
   * Reset configuration to defaults (admin only)
   */
  async resetToDefaults() {
    this.customConfig = {};
    this.mergedConfig = { ...this.defaultConfig };
    await this.saveCustomConfiguration();
  }

  /**
   * Get custom configuration for admin UI
   * @returns {Object} Custom configuration properties only
   */
  getCustomProperties() {
    return { ...this.customConfig };
  }

  /**
   * Get default configuration for comparison
   * @returns {Object} Default configuration properties
   */
  getDefaultProperties() {
    return { ...this.defaultConfig };
  }
}

module.exports = ConfigurationManager;