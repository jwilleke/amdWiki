import fs from 'fs-extra';
import path from 'path';
import { WikiConfig } from '../types/Config';
import logger from '../utils/logger';
import BaseManager, { BackupData } from './BaseManager';
import type { WikiEngine } from '../types/WikiEngine';

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
 * @property {WikiConfig|null} defaultConfig - Default configuration (required)
 * @property {Partial<WikiConfig>|null} environmentConfig - Environment-specific configuration (optional)
 * @property {Partial<WikiConfig>|null} customConfig - Custom local overrides (optional)
 * @property {WikiConfig|null} mergedConfig - Final merged configuration
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
class ConfigurationManager extends BaseManager {
  private defaultConfig: WikiConfig | null;
  private environmentConfig: Partial<WikiConfig> | null;
  private customConfig: Partial<WikiConfig> | null;
  private mergedConfig: WikiConfig | null;
  private environment: string;
  private defaultConfigPath: string;
  private environmentConfigPath: string;
  private customConfigPath: string;

  /**
   * Creates a new ConfigurationManager instance
   *
   * @constructor
   * @param {any} engine - The wiki engine instance
   */

  constructor(engine: WikiEngine) {
    super(engine);
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
  async initialize(config: Record<string, unknown> = {}): Promise<void> {
    await super.initialize(config);
    try {
      await this.loadConfigurations();
      logger.info(`ConfigurationManager initialized for environment: ${this.environment}`);
      logger.info(`Loaded configs: default + ${this.environmentConfig ? 'environment' : 'no environment'} + ${this.customConfig && Object.keys(this.customConfig).length > 0 ? 'custom' : 'no custom'}`);
    } catch (error) {
      logger.error('Failed to initialize ConfigurationManager:', error);
      throw error;
    }
  }

  /**
   * Reload configuration from disk
   *
   * @returns {Promise<void>}
   */
  async reload(): Promise<void> {
    await this.loadConfigurations();
    logger.info('ConfigurationManager reloaded');
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
  private async loadConfigurations(): Promise<void> {
    // 1. Load default configuration (required)
    if (await fs.pathExists(this.defaultConfigPath)) {
      this.defaultConfig = (await fs.readJson(this.defaultConfigPath)) as WikiConfig;
    } else {
      throw new Error(`Default configuration file not found: ${this.defaultConfigPath}`);
    }

    // 2. Load environment-specific configuration (optional)
    this.environmentConfig = {};
    if (await fs.pathExists(this.environmentConfigPath)) {
      const envData = (await fs.readJson(this.environmentConfigPath)) as Record<string, unknown>;
      // Filter out comment fields starting with _
      for (const [key, value] of Object.entries(envData)) {
        if (!key.startsWith('_')) {
          this.environmentConfig[key] = value;
        }
      }
      logger.info(`Loaded environment config: ${this.environmentConfigPath}`);
    }

    // 3. Load custom configuration (optional, for local overrides)
    this.customConfig = {};
    if (await fs.pathExists(this.customConfigPath)) {
      const customData = (await fs.readJson(this.customConfigPath)) as Record<string, unknown>;
      // Filter out comment fields starting with _
      for (const [key, value] of Object.entries(customData)) {
        if (!key.startsWith('_')) {
          this.customConfig[key] = value;
        }
      }
      logger.info(`Loaded custom config: ${this.customConfigPath}`);
    }

    // Merge configurations (later configs override earlier ones)
    this.mergedConfig = {
      ...this.defaultConfig,
      ...this.environmentConfig,
      ...this.customConfig
    } as WikiConfig;
  }

  /**
   * Get a configuration property value
   *
   * Retrieves a property from the merged configuration with optional default value.
   * Checks environment variables first for specific keys (Docker/Traefik support).
   *
   * Priority order:
   * 1. Environment variables (for Docker/Traefik deployments)
   * 2. Merged configuration (from config files)
   * 3. Default value parameter
   *
   * @param {string} key - Configuration property key
   * @param {*} [defaultValue=null] - Default value if property not found
   * @returns {*} Configuration value or default
   *
   * @example
   * const appName = configManager.getProperty('amdwiki.applicationName', 'MyWiki');
   */
  getProperty(key: string, defaultValue: unknown = null): unknown {
    // Check environment variables for Docker/Traefik deployments
    // Allows dynamic configuration without editing config files
    const envOverrides: { [key: string]: string | undefined } = {
      'amdwiki.baseURL': process.env.AMDWIKI_BASE_URL,
      'amdwiki.hostname': process.env.AMDWIKI_HOSTNAME,
      'amdwiki.server.host': process.env.AMDWIKI_HOST,
      'amdwiki.server.port': process.env.AMDWIKI_PORT
    };

    if (envOverrides[key]) {
      return envOverrides[key];
    }

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
  async setProperty(key: string, value: unknown): Promise<void> {
    if (!this.customConfig) {
      this.customConfig = {};
    }

    this.customConfig[key] = value;
    if (this.mergedConfig) {
      this.mergedConfig[key] = value;
    }

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
  private async saveCustomConfiguration(): Promise<void> {
    const configToSave = {
      _comment: 'This file overrides values from app-default-config.json',
      ...this.customConfig
    };

    await fs.writeJson(this.customConfigPath, configToSave, { spaces: 2 });
  }

  /**
   * Get all configuration properties
   *
   * Returns a copy of the entire merged configuration object.
   *
   * @returns {WikiConfig} All merged configuration properties
   *
   * @example
   * const allConfig = configManager.getAllProperties();
   * console.log(JSON.stringify(allConfig, null, 2));
   */
  getAllProperties(): WikiConfig {
    return { ...this.mergedConfig } as WikiConfig;
  }

  /**
   * Get application name
   *
   * @returns {string} Application name (defaults to 'amdWiki')
   *
   * @example
   * const name = configManager.getApplicationName(); // 'amdWiki'
   */
  getApplicationName(): string {
    return this.getProperty('amdwiki.applicationName', 'amdWiki') as string;
  }

  /**
   * Get base URL for the wiki
   *
   * @returns {string} Base URL (defaults to 'http://localhost:3000')
   */
  getBaseURL(): string {
    return this.getProperty('amdwiki.baseURL', 'http://localhost:3000') as string;
  }

  /**
   * Get front page name
   *
   * @returns {string} Front page name (defaults to 'Welcome')
   */
  getFrontPage(): string {
    return this.getProperty('amdwiki.frontPage', 'Welcome') as string;
  }

  /**
   * Get encoding
   * @returns {string} Encoding
   */
  getEncoding(): string {
    return this.getProperty('amdwiki.encoding', 'UTF-8') as string;
  }

  /**
   * Get server port
   * @returns {number} Server port
   */
  getServerPort(): number {
    return parseInt(this.getProperty('amdwiki.server.port', '3000') as string);
  }

  /**
   * Get server host
   * @returns {string} Server host
   */
  getServerHost(): string {
    return this.getProperty('amdwiki.server.host', 'localhost') as string;
  }

  /**
   * Get session secret
   * @returns {string} Session secret
   */
  getSessionSecret(): string {
    return this.getProperty('amdwiki.session.secret', 'amdwiki-session-secret-change-in-production') as string;
  }

  /**
   * Get session max age in milliseconds
   * @returns {number} Session max age
   */
  getSessionMaxAge(): number {
    return parseInt(this.getProperty('amdwiki.session.maxAge', '86400000') as string);
  }

  /**
   * Get session secure flag
   * @returns {boolean} Session secure flag
   */
  getSessionSecure(): boolean {
    return this.getProperty('amdwiki.session.secure', 'false') === 'true';
  }

  /**
   * Get session httpOnly flag
   * @returns {boolean} Session httpOnly flag
   */
  getSessionHttpOnly(): boolean {
    return this.getProperty('amdwiki.session.httpOnly', 'true') === 'true';
  }

  /**
   * Get directory paths
   * @returns {Object} Directory configuration
   */
  getDirectories(): {
    pages: unknown;
    templates: unknown;
    resources: unknown;
    data: unknown;
    work: unknown;
    } {
    return {
      pages: this.getProperty('amdwiki.directories.pages'),
      templates: this.getProperty('amdwiki.directories.templates'),
      resources: this.getProperty('amdwiki.directories.resources'),
      data: this.getProperty('amdwiki.directories.data'),
      work: this.getProperty('amdwiki.directories.work')
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
  getManagerConfig(managerName: string): { enabled: boolean; [key: string]: unknown } {
    const enabled = this.getProperty(`amdwiki.managers.${managerName}.enabled`, true) as boolean;
    const config: { enabled: boolean; [key: string]: unknown } = { enabled };

    // Get manager-specific settings
    const allProps = this.mergedConfig || {};
    const keys = Object.keys(allProps).filter((key) => key.startsWith(`amdwiki.managers.${managerName}.`) && !key.endsWith('.enabled'));

    keys.forEach((key) => {
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
  getFeatureConfig(featureName: string): { enabled: boolean; [key: string]: unknown } {
    const enabled = this.getProperty(`amdwiki.features.${featureName}.enabled`, false) as boolean;
    const config: { enabled: boolean; [key: string]: unknown } = { enabled };

    // Get feature-specific settings
    const allProps = this.mergedConfig || {};
    const keys = Object.keys(allProps).filter((key) => key.startsWith(`amdwiki.features.${featureName}.`) && !key.endsWith('.enabled'));

    keys.forEach((key) => {
      const settingName = key.replace(`amdwiki.features.${featureName}.`, '');
      config[settingName] = this.getProperty(key);
    });

    return config;
  }

  /**
   * Get logging configuration
   * @returns {Object} Logging configuration
   */
  getLoggingConfig(): {
    level: unknown;
    dir: unknown;
    maxSize: unknown;
    maxFiles: number;
    } {
    return {
      level: this.getProperty('amdwiki.logging.level'),
      dir: this.getProperty('amdwiki.logging.dir'),
      maxSize: this.getProperty('amdwiki.logging.maxSize'),
      maxFiles: parseInt(this.getProperty('amdwiki.logging.maxFiles') as string)
    };
  }

  /**
   * Get search configuration
   * @returns {Object} Search configuration
   */
  getSearchConfig(): {
    indexDir: unknown;
    enabled: boolean;
    } {
    return {
      indexDir: this.getProperty('amdwiki.search.provider.lunr.indexdir'),
      enabled: this.getProperty('amdwiki.search.enabled') === true
    };
  }

  /**
   * Get access control configuration
   * @returns {Object} Access control configuration
   */
  getAccessControlConfig(): {
    contextAware: {
      enabled: boolean;
      timeZone: unknown;
    };
    businessHours: {
      enabled: boolean;
      start: unknown;
      end: unknown;
      days: unknown;
    };
    } {
    const days = this.getProperty('amdwiki.accessControl.businessHours.days');
    return {
      contextAware: {
        enabled: this.getProperty('amdwiki.accessControl.contextAware.enabled') === true,
        timeZone: this.getProperty('amdwiki.accessControl.contextAware.timeZone')
      },
      businessHours: {
        enabled: this.getProperty('amdwiki.accessControl.businessHours.enabled') === true,
        start: this.getProperty('amdwiki.accessControl.businessHours.start'),
        end: this.getProperty('amdwiki.accessControl.businessHours.end'),
        days: typeof days === 'string' ? days.split(',') : days
      }
    };
  }

  /**
   * Get audit configuration
   * @returns {Object} Audit configuration
   */
  getAuditConfig(): {
    enabled: boolean;
    logDirectory: unknown;
    logFile: unknown;
    retention: {
      maxFiles: number;
      maxAge: unknown;
    };
    includeContext: {
      ip: boolean;
      userAgent: boolean;
      timestamp: boolean;
      decision: boolean;
      reason: boolean;
    };
    } {
    return {
      enabled: this.getProperty('amdwiki.audit.enabled') === true,
      logDirectory: this.getProperty('amdwiki.audit.provider.file.logdirectory'),
      logFile: this.getProperty('amdwiki.audit.provider.file.auditfilename'),
      retention: {
        maxFiles: parseInt(this.getProperty('amdwiki.audit.provider.file.maxfiles') as string),
        maxAge: this.getProperty('amdwiki.audit.retentiondays')
      },
      includeContext: {
        ip: this.getProperty('amdwiki.audit.includeContext.ip') === true,
        userAgent: this.getProperty('amdwiki.audit.includeContext.userAgent') === true,
        timestamp: this.getProperty('amdwiki.audit.includeContext.timestamp') === true,
        decision: this.getProperty('amdwiki.audit.includeContext.decision') === true,
        reason: this.getProperty('amdwiki.audit.includeContext.reason') === true
      }
    };
  }

  /**
   * Get RSS settings
   * @returns {Object} RSS configuration
   */
  getRSSConfig(): {
    generate: unknown;
    fileName: unknown;
    interval: unknown;
    channelTitle: unknown;
    channelDescription: unknown;
    } {
    return {
      generate: this.getProperty('amdwiki.rss.generate', true),
      fileName: this.getProperty('amdwiki.rss.fileName', 'rss.xml'),
      interval: this.getProperty('amdwiki.rss.interval', 3600),
      channelTitle: this.getProperty('amdwiki.rss.channelTitle', 'amdWiki RSS Feed'),
      channelDescription: this.getProperty('amdwiki.rss.channelDescription', 'RSS feed for amdWiki updates')
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
  async resetToDefaults(): Promise<void> {
    this.customConfig = {};
    this.mergedConfig = { ...this.defaultConfig } as WikiConfig;
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
  getCustomProperties(): Partial<WikiConfig> {
    return { ...this.customConfig } as Partial<WikiConfig>;
  }

  /**
   * Get default configuration for comparison
   *
   * Returns the base default configuration, useful for comparison
   * with current settings or resetting individual properties.
   *
   * @returns {WikiConfig} Default configuration properties
   */
  getDefaultProperties(): WikiConfig {
    return { ...this.defaultConfig } as WikiConfig;
  }

  /**
   * Backup configuration data
   *
   * Backs up the custom configuration (user overrides) which can be restored
   * to recreate the user's configuration settings. We don't backup default or
   * environment configs as those are part of the codebase.
   *
   * @returns {Promise<BackupData>} Backup data containing custom configuration
   */
  // eslint-disable-next-line @typescript-eslint/require-await -- Implements async interface from BaseManager
  async backup(): Promise<BackupData> {
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
   * @param {BackupData} backupData - Backup data from backup() method
   * @returns {Promise<void>}
   */
  async restore(backupData: BackupData): Promise<void> {
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

        logger.info(`[ConfigurationManager] Restored ${Object.keys(this.customConfig ?? {}).length} custom properties`);
      } else {
        logger.warn('[ConfigurationManager] No custom config in backup, resetting to empty');
        this.customConfig = {};
        await this.saveCustomConfiguration();
      }

      // Reload all configurations to rebuild merged config
      await this.loadConfigurations();

      logger.info('[ConfigurationManager] Restore completed successfully');
      logger.info(`[ConfigurationManager] Total merged properties: ${this.mergedConfig ? Object.keys(this.mergedConfig).length : 0}`);
    } catch (error) {
      logger.error('[ConfigurationManager] Restore failed:', error);
      throw error;
    }
  }
}

export default ConfigurationManager;

// CommonJS compatibility
module.exports = ConfigurationManager;
