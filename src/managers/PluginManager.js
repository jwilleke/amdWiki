const BaseManager = require('./BaseManager');

class PluginManager extends BaseManager {
  constructor(engine) {
    super(engine);
    this.plugins = new Map();
    this.searchPaths = [];
    this.allowedRoots = [];
  }

  async initialize(config = {}) {
    await super.initialize(config);
    // Do NOT read search paths from config here; only ConfigurationManager controls them
    await this.registerPlugins();
    this.engine.logger?.info?.('PluginManager initialized');
  }

  /**
   * Register all plugins from search paths obtained ONLY from
   * ConfigurationManager at key: amdwiki.managers.pluginManager.searchPaths
   */
  async registerPlugins() {
    const fs = require('fs-extra');
    const path = require('path');

    const cfgMgr =
      this.engine.getManager('ConfigurationManager') ||
      this.engine.getManager('ConfigManager');

    if (!cfgMgr || typeof cfgMgr.get !== 'function') {
      this.engine.logger?.warn?.('PluginManager: ConfigurationManager not available; no plugins will be loaded.');
      return;
    }

    // MUST come only from config; no fallbacks
    const configured = cfgMgr.get('amdwiki.managers.pluginManager.searchPaths');
    if (!Array.isArray(configured) || configured.length === 0) {
      this.engine.logger?.info?.('PluginManager: No plugin search paths configured; skipping plugin load.');
      return;
    }

    // Resolve and validate configured roots
    const roots = [];
    for (const p of configured) {
      try {
        const abs = path.resolve(process.cwd(), String(p));
        if (!(await fs.pathExists(abs))) {
          this.engine.logger?.debug?.(`PluginManager: configured path does not exist: ${abs}`);
          continue;
        }
        const st = await fs.lstat(abs);
        if (!st.isDirectory()) {
          this.engine.logger?.warn?.(`PluginManager: configured path is not a directory: ${abs}`);
          continue;
        }
        // Use realpath to collapse symlinks for later prefix checks
        const real = await fs.realpath(abs);
        roots.push(real);
      } catch (e) {
        this.engine.logger?.warn?.(`PluginManager: failed to validate configured path "${p}": ${e.message}`);
      }
    }

    this.allowedRoots = roots;
    if (this.allowedRoots.length === 0) {
      this.engine.logger?.info?.('PluginManager: No valid plugin roots after validation; skipping plugin load.');
      return;
    }

    // Enumerate .js files in allowed roots only
    for (const root of this.allowedRoots) {
      try {
        const entries = await fs.readdir(root, { withFileTypes: true });
        for (const entry of entries) {
          if (!entry.isFile()) continue;
          if (!entry.name.endsWith('.js') || entry.name.endsWith('.test.js')) continue;

          const candidate = require('path').join(root, entry.name);
          await this.loadPlugin(candidate); // loadPlugin re-validates path is under an allowed root
        }
      } catch (err) {
        this.engine.logger?.warn?.(`PluginManager: Failed to load plugins from ${root}: ${err.message}`);
      }
    }
  }

  /**
   * Load a single plugin from a validated, allowed root
   * @param {string} pluginPath - Path to the plugin file
   */
  async loadPlugin(pluginPath) {
    const fs = require('fs-extra');
    const path = require('path');
    try {
      // Resolve and validate canonical path
      const realFile = await fs.realpath(path.resolve(pluginPath));
      const isAllowed = this.allowedRoots.some(
        (root) => realFile === root || realFile.startsWith(root + path.sep)
      );
      if (!isAllowed) {
        this.engine.logger?.warn?.(`PluginManager: blocked plugin outside allowed roots: ${realFile}`);
        return;
      }

      const mod = require(realFile);
      const plugin = mod?.default || mod;
      const pluginName = plugin?.name || path.parse(realFile).name;

      if (!plugin || (typeof plugin !== 'function' && typeof plugin.execute !== 'function')) {
        this.engine.logger?.warn?.(`PluginManager: "${pluginName}" is not an executable plugin; skipping.`);
        return;
      }

      if (typeof plugin.initialize === 'function') {
        await plugin.initialize(this.engine);
      }

      this.plugins.set(pluginName, plugin);
      this.engine.logger?.info?.(`PluginManager: Loaded plugin "${pluginName}" from ${realFile}`);
    } catch (err) {
      this.engine.logger?.error?.(`PluginManager: Failed to load plugin ${pluginPath}: ${err.message}`);
    }
  }

  /**
   * Execute a plugin
   * @param {string} pluginName - Name of the plugin
   * @param {string} pageName - Current page name
   * @param {Object} params - Plugin parameters (parsed object)
   * @param {Object} context - Additional context
   * @returns {string} Plugin output
   */
  execute(pluginName, pageName, params, context = {}) {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      return `Plugin '${pluginName}' not found`;
    }

    try {
      // Create JSPWiki-style context object
      const wikiContext = {
        engine: context.engine || this.engine,
        pageName: pageName,
        linkGraph: context.linkGraph || {}
      };

      // Check if it's a new-style plugin with execute method
      if (plugin.execute && typeof plugin.execute === 'function') {
        return plugin.execute(wikiContext, params);
      }
      
      // Check if it's an old-style function plugin
      if (typeof plugin === 'function') {
        return plugin(pageName, params, context.linkGraph || {});
      }

      return `Plugin '${pluginName}' is not executable`;
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
