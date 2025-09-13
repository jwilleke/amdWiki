/**
 * Configuration management following JSPWiki patterns
 */
const path = require('path');

const defaultConfig = {
  // Application settings
  applicationName: 'amdWiki',
  version: '1.0.0',
  
  // Server settings
  server: {
    port: 3000,
    host: 'localhost'
  },

  // Wiki settings
  wiki: {
    pagesDir: './pages',
    templatesDir: './wiki.conf/templates',
    resourcesDir: './resources',
    workDir: './',
    encoding: 'UTF-8',
    frontPage: 'Welcome'
  },

  // Manager settings
  managers: {
    pageManager: {
      enabled: true,
      class: 'PageManager'
    },
    pluginManager: {
      enabled: true,
      class: 'PluginManager',
      searchPaths: ['./plugins', './src/plugins']
    },
    renderingManager: {
      enabled: true,
      class: 'RenderingManager'
    },
    searchManager: {
      enabled: true,
      class: 'SearchManager'
    },
    templateManager: {
      enabled: true,
      class: 'TemplateManager'
    }
  },

  // Plugin settings
  plugins: {
    searchPath: './plugins',
    enabled: true
  },

  // Features
  features: {
    export: {
      html: true,
      pdf: false,
      odt: false
    },
    llm: {
      enabled: false,
      endpoint: 'http://localhost:11434',
      model: 'llama2'
    },
    attachments: {
      enabled: true,
      maxSize: '10MB',
      allowedTypes: ['image/*', 'text/*', 'application/pdf']
    },
    images: {
      enabled: true,
      maxSize: '5MB',
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      uploadDir: './public/images',
      defaultAlt: 'Uploaded image',
      defaultClass: 'wiki-image'
    }
  },

  // Search settings
  search: {
    indexDir: './search-index',
    enabled: true
  },

  // Logging
  logging: {
    level: 'info',
    dir: './logs',
    maxSize: '1MB',
    maxFiles: 5
  },

  // Audit trail and access logging
  auditTrail: {
    enabled: true,
    logFile: './users/access-log.json',
    maxLogEntries: 10000,
    retentionDays: 90,
    consoleLogging: true,
    logAnonymousAccess: true,
    logSuccessfulAccess: true,
    logFailedAccess: true
  }
};

class Config {
  constructor(customConfig = {}) {
    this.config = this.mergeConfig(defaultConfig, customConfig);
  }

  /**
   * Deep merge configuration objects
   * @param {Object} target - Target configuration
   * @param {Object} source - Source configuration to merge
   * @returns {Object} Merged configuration
   */
  mergeConfig(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.mergeConfig(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  /**
   * Get configuration value by key path
   * @param {string} keyPath - Dot-separated key path (e.g., 'wiki.pagesDir')
   * @param {*} defaultValue - Default value if key not found
   * @returns {*} Configuration value
   */
  get(keyPath, defaultValue = null) {
    const keys = keyPath.split('.');
    let value = this.config;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue;
      }
    }
    
    return value;
  }

  /**
   * Set configuration value by key path
   * @param {string} keyPath - Dot-separated key path
   * @param {*} value - Value to set
   */
  set(keyPath, value) {
    const keys = keyPath.split('.');
    let current = this.config;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
  }

  /**
   * Get all configuration
   * @returns {Object} Full configuration object
   */
  getAll() {
    return { ...this.config };
  }

  /**
   * Load configuration from file
   * @param {string} configPath - Path to configuration file
   */
  static async loadFromFile(configPath) {
    const fs = require('fs-extra');
    
    if (await fs.pathExists(configPath)) {
      const fileContent = await fs.readFile(configPath, 'utf-8');
      const customConfig = JSON.parse(fileContent);
      return new Config(customConfig);
    }
    
    return new Config();
  }

  /**
   * Save configuration to file
   * @param {string} configPath - Path to save configuration
   */
  async saveToFile(configPath) {
    const fs = require('fs-extra');
    await fs.ensureDir(path.dirname(configPath));
    await fs.writeFile(configPath, JSON.stringify(this.config, null, 2));
  }

  /**
   * Validate configuration
   * @returns {Array<string>} Array of validation errors
   */
  validate() {
    const errors = [];
    
    // Check required paths exist
    const requiredPaths = [
      'wiki.pagesDir',
      'wiki.templatesDir'
    ];
    
    for (const requiredPath of requiredPaths) {
      if (!this.get(requiredPath)) {
        errors.push(`Missing required configuration: ${requiredPath}`);
      }
    }
    
    return errors;
  }
}

module.exports = { Config, defaultConfig };
