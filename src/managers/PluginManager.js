const BaseManager = require('./BaseManager');

/**
 * PluginManager - Handles plugin registration and execution
 * Similar to JSPWiki's PluginManager
 */
class PluginManager extends BaseManager {
  constructor(engine) {
    super(engine);
    this.plugins = new Map();
    this.searchPaths = [];
  }

  async initialize(config = {}) {
    await super.initialize(config);
    this.searchPaths = config.searchPaths || ['./plugins'];
    await this.registerPlugins();
  }

  /**
   * Register all plugins from search paths
   */
  async registerPlugins() {
    const fs = require('fs-extra');
    const path = require('path');

    for (const searchPath of this.searchPaths) {
      try {
        if (await fs.pathExists(searchPath)) {
          const files = await fs.readdir(searchPath);
          for (const file of files) {
            if (file.endsWith('.js')) {
              await this.loadPlugin(path.join(searchPath, file));
            }
          }
        }
      } catch (err) {
        console.warn(`Failed to load plugins from ${searchPath}:`, err.message);
      }
    }
  }

  /**
   * Load a single plugin
   * @param {string} pluginPath - Path to the plugin file
   */
  async loadPlugin(pluginPath) {
    try {
      const plugin = require(pluginPath);
      const pluginName = plugin.name || path.parse(pluginPath).name;
      
      // Initialize plugin if it has an initialize method
      if (typeof plugin.initialize === 'function') {
        await plugin.initialize(this.engine);
      }

      this.plugins.set(pluginName, plugin);
      console.log(`Loaded plugin: ${pluginName}`);
    } catch (err) {
      console.error(`Failed to load plugin ${pluginPath}:`, err);
    }
  }

  /**
   * Execute a plugin
   * @param {string} pluginName - Name of the plugin
   * @param {string} pageName - Current page name
   * @param {string} params - Plugin parameters
   * @param {Object} context - Additional context
   * @returns {string} Plugin output
   */
  execute(pluginName, pageName, params, context = {}) {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      return `Plugin '${pluginName}' not found`;
    }

    if (typeof plugin !== 'function') {
      return `Plugin '${pluginName}' is not executable`;
    }

    try {
      return plugin(pageName, params, context.linkGraph || {});
    } catch (err) {
      console.error(`Plugin '${pluginName}' execution failed:`, err);
      return `Plugin '${pluginName}' error: ${err.message}`;
    }
  }

  /**
   * Get list of all registered plugins
   * @returns {Array<string>} Array of plugin names
   */
  getPluginNames() {
    return Array.from(this.plugins.keys());
  }

  /**
   * Get plugin info
   * @param {string} pluginName - Name of the plugin
   * @returns {Object} Plugin information
   */
  getPluginInfo(pluginName) {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      return null;
    }

    return {
      name: pluginName,
      description: plugin.description || 'No description available',
      author: plugin.author || 'Unknown',
      version: plugin.version || '1.0.0'
    };
  }

  /**
   * Check if plugin exists
   * @param {string} pluginName - Name of the plugin
   * @returns {boolean} True if plugin exists
   */
  hasPlugin(pluginName) {
    return this.plugins.has(pluginName);
  }
}

module.exports = PluginManager;
