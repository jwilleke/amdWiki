const fs = require('fs-extra');
const path = require('path');

/**
 * ConfigurationManager - Handles JSPWiki-compatible configuration management
 *
 * Implements a hierarchical configuration system that merges multiple configuration
 * sources in priority order. This allows for flexible deployment configurations while
 * maintaining sensible defaults.
 *
 * Configuration merge order (later overrides earlier):
 * 1. app-default-config.json (base defaults - required)
 * 2. app-{environment}-config.json (environment-specific - optional)
 * 3. app-custom-config.json (local overrides - optional)
 *
 * Environment is determined by NODE_ENV environment variable (default: 'development')
 *
 * @class ConfigurationManager
 *
 * @property {WikiEngine} engine - Reference to the wiki engine
 * @property {Object|null} defaultConfig - Default configuration (required)
 * @property {Object|null} environmentConfig - Environment-specific configuration (optional)
 * @property {Object|null} customConfig - Custom local overrides (optional)
 * @property {Object|null} mergedConfig - Final merged configuration
 * @property {string} environment - Current environment (from NODE_ENV)
 * @property {string} defaultConfigPath - Path to default config file
 * @property {string} environmentConfigPath - Path to environment config file
 * @property {string} customConfigPath - Path to custom config file
 *
 * @see {@link BaseManager} for base functionality
 *
 * @example
 * const configManager = engine.getManager('ConfigurationManager');
 * const appName = configManager.getApplicationName();
 * const port = configManager.getServerPort();
 */
class ConfigurationManager {
  /**
   * Creates a new ConfigurationManager instance
   *
   * @constructor
   * @param {WikiEngine} engine - The wiki engine instance
   */
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
   *
   * Loads and merges all configuration files in the correct priority order.
   *
   * @async
   * @returns {Promise<void>}
   * @throws {Error} If default configuration file is not found
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
   * Load and merge configurations from all sources
   *
   * Loads configurations in priority order and merges them into a single
   * configuration object. Fields starting with '_' are treated as comments
   * and excluded from the final configuration.
   *
   * Priority: default < environment < custom (highest)
   *
   * @async
   * @private
   * @returns {Promise<void>}
   * @throws {Error} If default configuration file cannot be loaded
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
   * Get a configuration property value
   *
   * Retrieves a property from the merged configuration with optional default value.
   *
   * @param {string} key - Configuration property key
   * @param {*} [defaultValue=null] - Default value if property not found
   * @returns {*} Configuration value or default
   *
   * @example
   * const appName = configManager.getProperty('amdwiki.applicationName', 'MyWiki');
   */
  getProperty(key, defaultValue = null) {
    return this.mergedConfig?.[key] ?? defaultValue;
  }

  /**
   * Set a configuration property (updates custom config)
   *
   * Sets a property value and persists it to the custom configuration file.
   * This allows runtime configuration changes that survive restarts.
   *
   * @async
   * @param {string} key - Configuration property key
   * @param {*} value - Configuration value to set
   * @returns {Promise<void>}
   *
   * @example
   * await configManager.setProperty('amdwiki.applicationName', 'My Custom Wiki');
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
   *
   * Persists the current custom configuration to disk with proper formatting.
   *
   * @async
   * @private
   * @returns {Promise<void>}
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
   *
   * Returns a copy of the entire merged configuration object.
   *
   * @returns {Object} All merged configuration properties
   *
   * @example
   * const allConfig = configManager.getAllProperties();
   * console.log(JSON.stringify(allConfig, null, 2));
   */
  getAllProperties() {
    return { ...this.mergedConfig };
  }

  /**
   * Get application name
   *
   * @returns {string} Application name (defaults to 'amdWiki')
   *
   * @example
   * const name = configManager.getApplicationName(); // 'amdWiki'
   */
  getApplicationName() {
    return this.getProperty('amdwiki.applicationName', 'amdWiki');
  }

  /**
   * Get base URL for the wiki
   *
   * @returns {string} Base URL (defaults to 'http://localhost:3000')
   */
  getBaseURL() {
    return this.getProperty('amdwiki.baseURL', 'http://localhost:3000');
  }

  /**
   * Get front page name
   *
   * @returns {string} Front page name (defaults to 'Welcome')
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
   * Get manager-specific configuration
   *
   * Retrieves all configuration properties for a specific manager,
   * including enabled status and manager-specific settings.
   *
   * @param {string} managerName - Name of the manager
   * @returns {Object} Manager configuration object with enabled flag and settings
   * @returns {boolean} config.enabled - Whether the manager is enabled
   *
   * @example
   * const searchConfig = configManager.getManagerConfig('SearchManager');
   * if (searchConfig.enabled) {
   *   // Use search manager
   * }
   */
  getManagerConfig(managerName) {
    const enabled = this.getProperty(`amdwiki.managers.${managerName}.enabled`, true);
    const config = { enabled };

    // Get manager-specific settings
    const allProps = this.mergedConfig || {};
    const keys = Object.keys(allProps).filter(key =>
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
    const allProps = this.mergedConfig || {};
    const keys = Object.keys(allProps).filter(key =>
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
   *
   * Clears all custom configuration and resets to default values.
   * This operation persists the empty custom configuration to disk.
   *
   * @async
   * @returns {Promise<void>}
   *
   * @example
   * await configManager.resetToDefaults();
   * console.log('Configuration reset to defaults');
   */
  async resetToDefaults() {
    this.customConfig = {};
    this.mergedConfig = { ...this.defaultConfig };
    await this.saveCustomConfiguration();
  }

  /**
   * Get custom configuration for admin UI
   *
   * Returns only the custom overrides, useful for displaying
   * which settings have been customized.
   *
   * @returns {Object} Custom configuration properties only
   *
   * @example
   * const customSettings = configManager.getCustomProperties();
   * console.log('Customized settings:', Object.keys(customSettings));
   */
  getCustomProperties() {
    return { ...this.customConfig };
  }

  /**
   * Get default configuration for comparison
   *
   * Returns the base default configuration, useful for comparison
   * with current settings or resetting individual properties.
   *
   * @returns {Object} Default configuration properties
   */
  getDefaultProperties() {
    return { ...this.defaultConfig };
  }

  /**
   * Backup configuration data
   *
   * Backs up the custom configuration (user overrides) which can be restored
   * to recreate the user's configuration settings. We don't backup default or
   * environment configs as those are part of the codebase.
   *
   * @returns {Promise<Object>} Backup data containing custom configuration
   */
  async backup() {
    const logger = require('../utils/logger');
    logger.info('[ConfigurationManager] Starting backup...');

    try {
      // Count total properties in each config layer
      const defaultPropsCount = this.defaultConfig ? Object.keys(this.defaultConfig).length : 0;
      const envPropsCount = this.environmentConfig ? Object.keys(this.environmentConfig).length : 0;
      const customPropsCount = this.customConfig ? Object.keys(this.customConfig).length : 0;
      const mergedPropsCount = this.mergedConfig ? Object.keys(this.mergedConfig).length : 0;

      const backupData = {
        managerName: 'ConfigurationManager',
        timestamp: new Date().toISOString(),
        environment: this.environment,

        // Backup all config layers for reference
        defaultConfig: this.defaultConfig ? { ...this.defaultConfig } : null,
        environmentConfig: this.environmentConfig ? { ...this.environmentConfig } : null,
        customConfig: this.customConfig ? { ...this.customConfig } : null,
        mergedConfig: this.mergedConfig ? { ...this.mergedConfig } : null,

        // Config file paths for reference
        paths: {
          defaultConfigPath: this.defaultConfigPath,
          environmentConfigPath: this.environmentConfigPath,
          customConfigPath: this.customConfigPath
        },

        // Statistics
        statistics: {
          defaultPropertiesCount: defaultPropsCount,
          environmentPropertiesCount: envPropsCount,
          customPropertiesCount: customPropsCount,
          mergedPropertiesCount: mergedPropsCount
        }
      };

      logger.info(`[ConfigurationManager] Backed up ${customPropsCount} custom properties`);
      logger.info(`[ConfigurationManager] Total merged properties: ${mergedPropsCount}`);

      return backupData;
    } catch (error) {
      logger.error('[ConfigurationManager] Backup failed:', error);
      throw error;
    }
  }

  /**
   * Restore configuration from backup data
   *
   * Restores the custom configuration (user overrides) from backup data.
   * This will overwrite the current custom configuration file and reload
   * all configurations to rebuild the merged config.
   *
   * @param {Object} backupData - Backup data from backup() method
   * @returns {Promise<void>}
   */
  async restore(backupData) {
    const logger = require('../utils/logger');
    logger.info('[ConfigurationManager] Starting restore...');

    if (!backupData) {
      throw new Error('ConfigurationManager: No backup data provided for restore');
    }

    try {
      // Restore custom configuration (user overrides)
      if (backupData.customConfig) {
        this.customConfig = { ...backupData.customConfig };

        // Save custom config to disk
        await this.saveCustomConfiguration();

        logger.info(`[ConfigurationManager] Restored ${Object.keys(this.customConfig).length} custom properties`);
      } else {
        logger.warn('[ConfigurationManager] No custom config in backup, resetting to empty');
        this.customConfig = {};
        await this.saveCustomConfiguration();
      }

      // Reload all configurations to rebuild merged config
      await this.loadConfigurations();

      logger.info('[ConfigurationManager] Restore completed successfully');
      logger.info(`[ConfigurationManager] Total merged properties: ${Object.keys(this.mergedConfig).length}`);
    } catch (error) {
      logger.error('[ConfigurationManager] Restore failed:', error);
      throw error;
    }
  }
}

module.exports = ConfigurationManager;