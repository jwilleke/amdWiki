const fs = require('fs-extra');
const path = require('path');

/**
 * ConfigurationManager - Handles JSPWiki-compatible configuration
 * Merges app-default-config.json with app-custom-config.json overrides
 */
class ConfigurationManager {
  constructor(engine) {
    this.engine = engine;
    this.defaultConfig = null;
    this.customConfig = null;
    this.mergedConfig = null;
    this.defaultConfigPath = path.join(process.cwd(), 'config', 'app-default-config.json');
    this.customConfigPath = path.join(process.cwd(), 'config', 'app-custom-config.json');
  }

  /**
   * Initialize the configuration manager
   */
  async initialize() {
    try {
      await this.loadConfigurations();
      console.log('📋 ConfigurationManager initialized with merged JSPWiki-compatible configuration');
    } catch (error) {
      console.error('Failed to initialize ConfigurationManager:', error);
      throw error;
    }
  }

  /**
   * Load and merge configurations
   */
  async loadConfigurations() {
    // Load default configuration
    if (await fs.pathExists(this.defaultConfigPath)) {
      this.defaultConfig = await fs.readJson(this.defaultConfigPath);
    } else {
      throw new Error(`Default configuration file not found: ${this.defaultConfigPath}`);
    }

    // Load custom configuration (optional)
    if (await fs.pathExists(this.customConfigPath)) {
      const customData = await fs.readJson(this.customConfigPath);
      // Filter out comment fields starting with _
      this.customConfig = {};
      for (const [key, value] of Object.entries(customData)) {
        if (!key.startsWith('_')) {
          this.customConfig[key] = value;
        }
      }
    } else {
      this.customConfig = {};
    }

    // Merge configurations (custom overrides default)
    this.mergedConfig = {
      ...this.defaultConfig,
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