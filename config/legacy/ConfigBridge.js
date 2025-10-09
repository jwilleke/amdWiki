/**
 * Configuration Bridge - Provides Config.js API with ConfigurationManager backend
 * This allows old code to continue working while using the new JSPWiki-compatible configuration system
 */

const path = require('path');

/**
 * Mapping from old Config.js paths to new ConfigurationManager properties
 */
const CONFIG_MAPPING = {
  // Application settings
  'applicationName': 'amdwiki.applicationName',
  'version': 'amdwiki.version',

  // Server settings
  'server.port': 'amdwiki.server.port',
  'server.host': 'amdwiki.server.host',

  // Wiki settings
  'wiki.pagesDir': 'amdwiki.directories.pages',
  'wiki.templatesDir': 'amdwiki.directories.templates',
  'wiki.resourcesDir': 'amdwiki.directories.resources',
  'wiki.dataDir': 'amdwiki.directories.data',
  'wiki.workDir': 'amdwiki.directories.work',
  'wiki.encoding': 'amdwiki.encoding',
  'wiki.frontPage': 'amdwiki.frontPage',

  // Manager settings
  'managers.pageManager.enabled': 'amdwiki.managers.pageManager.enabled',
  'managers.pluginManager.enabled': 'amdwiki.managers.pluginManager.enabled',
  'managers.pluginManager.searchPaths': 'amdwiki.managers.pluginManager.searchPaths',
  'managers.renderingManager.enabled': 'amdwiki.managers.renderingManager.enabled',
  'managers.searchManager.enabled': 'amdwiki.managers.searchManager.enabled',
  'managers.templateManager.enabled': 'amdwiki.managers.templateManager.enabled',

  // Plugin settings
  'plugins.searchPath': 'amdwiki.plugins.searchPath',
  'plugins.enabled': 'amdwiki.plugins.enabled',

  // Features
  'features.export.html': 'amdwiki.features.export.html',
  'features.export.pdf': 'amdwiki.features.export.pdf',
  'features.export.odt': 'amdwiki.features.export.odt',
  'features.llm.enabled': 'amdwiki.features.llm.enabled',
  'features.llm.endpoint': 'amdwiki.features.llm.endpoint',
  'features.llm.model': 'amdwiki.features.llm.model',
  'features.attachments.enabled': 'amdwiki.features.attachments.enabled',
  'features.attachments.maxSize': 'amdwiki.features.attachments.maxSize',
  'features.attachments.allowedTypes': 'amdwiki.features.attachments.allowedTypes',
  'features.images.enabled': 'amdwiki.features.images.enabled',
  'features.images.maxSize': 'amdwiki.features.images.maxSize',
  'features.images.allowedTypes': 'amdwiki.features.images.allowedTypes',
  'features.images.uploadDir': 'amdwiki.features.images.uploadDir',
  'features.images.defaultAlt': 'amdwiki.features.images.defaultAlt',
  'features.images.defaultClass': 'amdwiki.features.images.defaultClass',
  'features.maintenance.enabled': 'amdwiki.features.maintenance.enabled',
  'features.maintenance.message': 'amdwiki.features.maintenance.message',
  'features.maintenance.allowAdmins': 'amdwiki.features.maintenance.allowAdmins',
  'features.maintenance.estimatedDuration': 'amdwiki.features.maintenance.estimatedDuration',

  // Search settings
  'search.indexDir': 'amdwiki.search.indexDir',
  'search.enabled': 'amdwiki.search.enabled',

  // Logging
  'logging.level': 'amdwiki.logging.level',
  'logging.dir': 'amdwiki.logging.dir',
  'logging.maxSize': 'amdwiki.logging.maxSize',
  'logging.maxFiles': 'amdwiki.logging.maxFiles',

  // Access Control
  'accessControl.contextAware.enabled': 'amdwiki.accessControl.contextAware.enabled',
  'accessControl.contextAware.timeZone': 'amdwiki.accessControl.contextAware.timeZone',
  'accessControl.businessHours.enabled': 'amdwiki.accessControl.businessHours.enabled',
  'accessControl.businessHours.start': 'amdwiki.accessControl.businessHours.start',
  'accessControl.businessHours.end': 'amdwiki.accessControl.businessHours.end',
  'accessControl.businessHours.days': 'amdwiki.accessControl.businessHours.days',
  'accessControl.customSchedules.enabled': 'amdwiki.accessControl.customSchedules.enabled',
  'accessControl.customSchedules.schedules': 'amdwiki.accessControl.customSchedules.schedules',
  'accessControl.holidays.enabled': 'amdwiki.accessControl.holidays.enabled',
  'accessControl.holidays.calendar': 'amdwiki.accessControl.holidays.calendar',

  // Audit
  'accessControl.audit.enabled': 'amdwiki.audit.enabled',
  'accessControl.audit.logFile': 'amdwiki.audit.logFile',
  'accessControl.audit.retention.maxFiles': 'amdwiki.audit.retention.maxFiles',
  'accessControl.audit.retention.maxAge': 'amdwiki.audit.retention.maxAge',
  'accessControl.audit.includeContext.ip': 'amdwiki.audit.includeContext.ip',
  'accessControl.audit.includeContext.userAgent': 'amdwiki.audit.includeContext.userAgent',
  'accessControl.audit.includeContext.timestamp': 'amdwiki.audit.includeContext.timestamp',
  'accessControl.audit.includeContext.decision': 'amdwiki.audit.includeContext.decision',
  'accessControl.audit.includeContext.reason': 'amdwiki.audit.includeContext.reason',

  // Policies
  'accessControl.policies.enabled': 'amdwiki.policies.enabled',
  'accessControl.policies.configFile': 'amdwiki.policies.configFile',
  'accessControl.policies.defaultPolicy': 'amdwiki.policies.defaultPolicy',

  // Storage Location
  'accessControl.storageLocation.enabled': 'amdwiki.storageLocation.enabled',
  'accessControl.storageLocation.aclBasedStorage': 'amdwiki.storageLocation.aclBasedStorage'
};

/**
 * Convert dot-notation key to nested object value
 * @param {string} keyPath - Dot-separated path (e.g., 'accessControl.businessHours.days')
 * @param {*} value - Value to convert
 * @returns {*} Converted value with proper type
 */
function convertValue(keyPath, value) {
  // Handle comma-separated strings that should be arrays
  if (keyPath.includes('days') && typeof value === 'string') {
    return value.split(',').map(s => s.trim());
  }

  if (keyPath.includes('searchPaths') && typeof value === 'string') {
    return value.split(',').map(s => s.trim());
  }

  if (keyPath.includes('allowedTypes') && typeof value === 'string') {
    return value.split(',').map(s => s.trim());
  }

  // Handle boolean strings
  if (typeof value === 'string') {
    if (value === 'true') return true;
    if (value === 'false') return false;
  }

  // Handle numeric strings
  if (keyPath.includes('maxFiles') || keyPath.includes('port')) {
    return parseInt(value, 10);
  }

  return value;
}

class ConfigBridge {
  constructor(configurationManager) {
    this.configurationManager = configurationManager;
    this.cache = new Map();
  }

  /**
   * Get configuration value by key path with ConfigurationManager backend
   * @param {string} keyPath - Dot-separated key path (e.g., 'wiki.pagesDir')
   * @param {*} defaultValue - Default value if key not found
   * @returns {*} Configuration value
   */
  get(keyPath, defaultValue = null) {
    // Check cache first
    const cacheKey = `${keyPath}:${JSON.stringify(defaultValue)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    let result = defaultValue;

    if (this.configurationManager) {
      // Try direct mapping first
      const mappedKey = CONFIG_MAPPING[keyPath];
      if (mappedKey) {
        const value = this.configurationManager.getProperty(mappedKey, defaultValue);
        result = convertValue(keyPath, value);
      } else {
        // Try building nested object from multiple properties
        result = this.buildNestedValue(keyPath, defaultValue);
      }
    }

    // Cache the result
    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Build nested object value from multiple ConfigurationManager properties
   * @param {string} keyPath - Dot-separated key path
   * @param {*} defaultValue - Default value
   * @returns {*} Built value or default
   */
  buildNestedValue(keyPath, defaultValue) {
    // Handle special nested object cases
    if (keyPath === 'accessControl.audit') {
      return {
        enabled: this.configurationManager.getProperty('amdwiki.audit.enabled', true),
        logFile: this.configurationManager.getProperty('amdwiki.audit.logFile', './users/access-log.json'),
        retention: {
          maxFiles: parseInt(this.configurationManager.getProperty('amdwiki.audit.retention.maxFiles', '10')),
          maxAge: this.configurationManager.getProperty('amdwiki.audit.retention.maxAge', '30d')
        },
        includeContext: {
          ip: this.configurationManager.getProperty('amdwiki.audit.includeContext.ip', 'true') === 'true',
          userAgent: this.configurationManager.getProperty('amdwiki.audit.includeContext.userAgent', 'true') === 'true',
          timestamp: this.configurationManager.getProperty('amdwiki.audit.includeContext.timestamp', 'true') === 'true',
          decision: this.configurationManager.getProperty('amdwiki.audit.includeContext.decision', 'true') === 'true',
          reason: this.configurationManager.getProperty('amdwiki.audit.includeContext.reason', 'true') === 'true'
        }
      };
    }

    if (keyPath === 'accessControl.policies') {
      return {
        enabled: this.configurationManager.getProperty('amdwiki.policies.enabled', 'false') === 'true',
        configFile: this.configurationManager.getProperty('amdwiki.policies.configFile', './config/access-policies.json'),
        defaultPolicy: this.configurationManager.getProperty('amdwiki.policies.defaultPolicy', 'deny')
      };
    }

    if (keyPath === 'accessControl.storageLocation.roleBasedStorage') {
      return {
        admin: this.configurationManager.getProperty('amdwiki.storageLocation.roleBasedStorage.admin', 'required'),
        editor: this.configurationManager.getProperty('amdwiki.storageLocation.roleBasedStorage.editor', 'regular'),
        user: this.configurationManager.getProperty('amdwiki.storageLocation.roleBasedStorage.user', 'regular')
      };
    }

    if (keyPath === 'accessControl.storageLocation.categoryBasedStorage') {
      return {
        System: this.configurationManager.getProperty('amdwiki.storageLocation.categoryBasedStorage.System', 'required'),
        Admin: this.configurationManager.getProperty('amdwiki.storageLocation.categoryBasedStorage.Admin', 'required'),
        Security: this.configurationManager.getProperty('amdwiki.storageLocation.categoryBasedStorage.Security', 'required'),
        General: this.configurationManager.getProperty('amdwiki.storageLocation.categoryBasedStorage.General', 'regular'),
        Documentation: this.configurationManager.getProperty('amdwiki.storageLocation.categoryBasedStorage.Documentation', 'regular')
      };
    }

    // Try to find a property that starts with the mapped path
    const amdwikiKeyPath = keyPath.replace(/\./g, '.');
    const searchPrefix = `amdwiki.${amdwikiKeyPath}`;

    // Get all properties and find matches
    const allProps = this.configurationManager.getAllProperties();
    const matches = Object.keys(allProps).filter(key => key.startsWith(searchPrefix));

    if (matches.length > 0) {
      // Return the first match or build object if multiple
      if (matches.length === 1) {
        return convertValue(keyPath, allProps[matches[0]]);
      } else {
        // Build nested object from multiple matches
        const result = {};
        matches.forEach(key => {
          const suffix = key.replace(searchPrefix + '.', '');
          result[suffix] = convertValue(keyPath, allProps[key]);
        });
        return result;
      }
    }

    return defaultValue;
  }

  /**
   * Set configuration value (no-op for read-only bridge)
   * @param {string} keyPath - Dot-separated key path
   * @param {*} value - Value to set
   */
  set(keyPath, value) {
    // Clear cache entry
    const keysToClear = Array.from(this.cache.keys()).filter(key => key.startsWith(keyPath));
    keysToClear.forEach(key => this.cache.delete(key));

    console.warn('ConfigBridge.set() is read-only. Use ConfigurationManager.setProperty() instead.');
    console.warn(`Attempted to set ${keyPath} = ${JSON.stringify(value)}`);
  }

  /**
   * Get all configuration (build from ConfigurationManager)
   * @returns {Object} Full configuration object in old format
   */
  getAll() {
    if (!this.configurationManager) {
      return {};
    }

    const result = {
      applicationName: this.get('applicationName'),
      version: this.get('version'),
      server: {
        port: this.get('server.port'),
        host: this.get('server.host')
      },
      wiki: {
        pagesDir: this.get('wiki.pagesDir'),
        templatesDir: this.get('wiki.templatesDir'),
        resourcesDir: this.get('wiki.resourcesDir'),
        dataDir: this.get('wiki.dataDir'),
        workDir: this.get('wiki.workDir'),
        encoding: this.get('wiki.encoding'),
        frontPage: this.get('wiki.frontPage')
      },
      managers: {
        pageManager: {
          enabled: this.get('managers.pageManager.enabled'),
          class: 'PageManager'
        },
        pluginManager: {
          enabled: this.get('managers.pluginManager.enabled'),
          class: 'PluginManager',
          searchPaths: this.get('managers.pluginManager.searchPaths')
        },
        renderingManager: {
          enabled: this.get('managers.renderingManager.enabled'),
          class: 'RenderingManager'
        },
        searchManager: {
          enabled: this.get('managers.searchManager.enabled'),
          class: 'SearchManager'
        },
        templateManager: {
          enabled: this.get('managers.templateManager.enabled'),
          class: 'TemplateManager'
        }
      },
      features: {
        export: {
          html: this.get('features.export.html'),
          pdf: this.get('features.export.pdf'),
          odt: this.get('features.export.odt')
        },
        llm: {
          enabled: this.get('features.llm.enabled'),
          endpoint: this.get('features.llm.endpoint'),
          model: this.get('features.llm.model')
        },
        attachments: {
          enabled: this.get('features.attachments.enabled'),
          maxSize: this.get('features.attachments.maxSize'),
          allowedTypes: this.get('features.attachments.allowedTypes')
        },
        images: {
          enabled: this.get('features.images.enabled'),
          maxSize: this.get('features.images.maxSize'),
          allowedTypes: this.get('features.images.allowedTypes'),
          uploadDir: this.get('features.images.uploadDir'),
          defaultAlt: this.get('features.images.defaultAlt'),
          defaultClass: this.get('features.images.defaultClass')
        },
        maintenance: {
          enabled: this.get('features.maintenance.enabled'),
          message: this.get('features.maintenance.message'),
          allowAdmins: this.get('features.maintenance.allowAdmins'),
          estimatedDuration: this.get('features.maintenance.estimatedDuration')
        }
      },
      search: {
        indexDir: this.get('search.indexDir'),
        enabled: this.get('search.enabled')
      },
      logging: {
        level: this.get('logging.level'),
        dir: this.get('logging.dir'),
        maxSize: this.get('logging.maxSize'),
        maxFiles: this.get('logging.maxFiles')
      },
      accessControl: {
        contextAware: {
          enabled: this.get('accessControl.contextAware.enabled'),
          timeZone: this.get('accessControl.contextAware.timeZone'),
          businessHours: {
            enabled: this.get('accessControl.businessHours.enabled'),
            start: this.get('accessControl.businessHours.start'),
            end: this.get('accessControl.businessHours.end'),
            days: this.get('accessControl.businessHours.days')
          },
          customSchedules: {
            enabled: this.get('accessControl.customSchedules.enabled'),
            schedules: this.get('accessControl.customSchedules.schedules')
          },
          holidays: {
            enabled: this.get('accessControl.holidays.enabled'),
            calendar: this.get('accessControl.holidays.calendar')
          }
        },
        audit: {
          enabled: this.get('accessControl.audit.enabled'),
          logFile: this.get('accessControl.audit.logFile'),
          retention: {
            maxFiles: this.get('accessControl.audit.retention.maxFiles'),
            maxAge: this.get('accessControl.audit.retention.maxAge')
          },
          includeContext: {
            ip: this.get('accessControl.audit.includeContext.ip'),
            userAgent: this.get('accessControl.audit.includeContext.userAgent'),
            timestamp: this.get('accessControl.audit.includeContext.timestamp'),
            decision: this.get('accessControl.audit.includeContext.decision'),
            reason: this.get('accessControl.audit.includeContext.reason')
          }
        },
        policies: {
          enabled: this.get('accessControl.policies.enabled'),
          configFile: this.get('accessControl.policies.configFile'),
          defaultPolicy: this.get('accessControl.policies.defaultPolicy')
        },
        storageLocation: {
          enabled: this.get('accessControl.storageLocation.enabled'),
          roleBasedStorage: this.get('accessControl.storageLocation.roleBasedStorage'),
          categoryBasedStorage: this.get('accessControl.storageLocation.categoryBasedStorage'),
          aclBasedStorage: this.get('accessControl.storageLocation.aclBasedStorage')
        }
      }
    };

    return result;
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.cache.clear();
  }
}

module.exports = { ConfigBridge, CONFIG_MAPPING };