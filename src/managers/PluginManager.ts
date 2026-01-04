import BaseManager from './BaseManager';
import fs from 'fs-extra';
import path from 'path';
import type { WikiEngine } from '../types/WikiEngine';

/**
 * Plugin object interface
 */
export interface Plugin {
  name?: string;
  description?: string;
  author?: string;
  version?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialize?: (engine: any) => Promise<void> | void;
  execute?: (context: PluginContext, params: PluginParams) => Promise<string> | string;
  (pageName: string, params: PluginParams, linkGraph: Record<string, unknown>): Promise<string> | string;
}

/**
 * Plugin context passed to plugins during execution
 */
export interface PluginContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  engine: any;
  pageName: string;
  linkGraph: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Plugin parameters (parsed from plugin syntax)
 */
export interface PluginParams {
  [key: string]: string | number | boolean;
}

/**
 * Plugin information returned by getPluginInfo
 */
export interface PluginInfo {
  name: string;
  description: string;
  author: string;
  version: string;
}

/**
 * PluginManager - Handles plugin discovery, registration, and execution
 *
 * Similar to JSPWiki's PluginManager, this manager provides a plugin system
 * for extending wiki functionality. Plugins are discovered from configured
 * search paths and executed during markup parsing.
 *
 * Key features:
 * - Dynamic plugin discovery from search paths
 * - Plugin registration and metadata management
 * - Secure plugin execution with sandboxing
 * - Configurable plugin search paths
 *
 * @class PluginManager
 * @extends BaseManager
 *
 * @property {Map<string, Plugin>} plugins - Registered plugins
 * @property {string[]} searchPaths - Directories to search for plugins
 * @property {string[]} allowedRoots - Allowed root paths for security
 *
 * @see {@link BaseManager} for base functionality
 *
 * @example
 * const pluginManager = engine.getManager('PluginManager');
 * const result = await pluginManager.execute('CurrentTimePlugin', params);
 */
class PluginManager extends BaseManager {
  private plugins: Map<string, Plugin>;
  private searchPaths: string[];
  private allowedRoots: string[];

  /**
   * Creates a new PluginManager instance
   *
   * @constructor
   * @param {any} engine - The wiki engine instance
   */
   
  constructor(engine: WikiEngine) {
     
    super(engine);
    this.plugins = new Map();
    this.searchPaths = [];
    this.allowedRoots = [];
  }

  /**
   * Initialize the PluginManager and discover plugins
   *
   * @async
   * @param {Record<string, unknown>} [config={}] - Configuration object (unused, reads from ConfigurationManager)
   * @returns {Promise<void>}
   */
  async initialize(config: Record<string, unknown> = {}): Promise<void> {
    await super.initialize(config);
    // Do NOT read search paths from config here; only ConfigurationManager controls them
    await this.registerPlugins();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this.engine.logger?.info?.('PluginManager initialized');
  }

  /**
   * Register all plugins from search paths obtained ONLY from
   * ConfigurationManager at key: amdwiki.managers.pluginManager.searchPaths
   */
  async registerPlugins(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const cfgMgr =
      this.engine.getManager('ConfigurationManager') ||
      this.engine.getManager('ConfigManager');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!cfgMgr || typeof cfgMgr.getProperty !== 'function') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      this.engine.logger?.warn?.('PluginManager: ConfigurationManager not available; no plugins will be loaded.');
      return;
    }

    // MUST come only from config; no fallbacks
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const raw = cfgMgr.getProperty('amdwiki.managers.pluginManager.searchPaths');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this.engine.logger?.debug?.(
      `PluginManager: raw searchPaths type=${typeof raw} value=${JSON.stringify(raw)}`
    );
    // Accept array or comma-separated string
    let configured: string[] = [];
    if (Array.isArray(raw)) configured = raw as string[];
    else if (typeof raw === 'string') configured = raw.split(',').map(s => s.trim()).filter(Boolean);
    if (!Array.isArray(configured) || configured.length === 0) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      this.engine.logger?.info?.('PluginManager: No plugin search paths configured; skipping plugin load.');
      return;
    }

    // Resolve and validate configured roots
    const roots: string[] = [];
    for (const p of configured) {
      try {
        const abs = path.resolve(process.cwd(), String(p));
         
        if (!(await fs.pathExists(abs))) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          this.engine.logger?.debug?.(`PluginManager: configured path does not exist: ${abs}`);
          continue;
        }
         
        const st = await fs.lstat(abs);
         
        if (!st.isDirectory()) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          this.engine.logger?.warn?.(`PluginManager: configured path is not a directory: ${abs}`);
          continue;
        }
        // Use realpath to collapse symlinks for later prefix checks
         
        const real = await fs.realpath(abs);
         
        roots.push(real);
      } catch (e) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        this.engine.logger?.warn?.(`PluginManager: failed to validate configured path "${p}": ${(e as Error).message}`);
      }
    }

    this.allowedRoots = roots;
    if (this.allowedRoots.length === 0) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      this.engine.logger?.info?.('PluginManager: No valid plugin roots after validation; skipping plugin load.');
      return;
    }

    // Enumerate .js and .ts files in allowed roots only
    for (const root of this.allowedRoots) {
      try {

        const entries = await fs.readdir(root, { withFileTypes: true });

        for (const entry of entries) {

          if (!entry.isFile()) continue;

          // Skip test files and non-plugin files
          const isJsPlugin = entry.name.endsWith('.js') && !entry.name.endsWith('.test.js');
          const isTsPlugin = entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts') && !entry.name.endsWith('.d.ts');
          if (!isJsPlugin && !isTsPlugin) continue;

           
          const candidate = path.join(root, entry.name);
          await this.loadPlugin(candidate); // loadPlugin re-validates path is under an allowed root
        }
      } catch (err) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        this.engine.logger?.warn?.(`PluginManager: Failed to load plugins from ${root}: ${(err as Error).message}`);
      }
    }
  }

  /**
   * Load a single plugin from a validated, allowed root
   * @param {string} pluginPath - Path to the plugin file
   */
  async loadPlugin(pluginPath: string): Promise<void> {
    try {
      // Resolve and validate canonical path
       
      const realFile = await fs.realpath(path.resolve(pluginPath));
      const isAllowed = this.allowedRoots.some(
         
        (root) => realFile === root || realFile.startsWith(root + path.sep)
      );
      if (!isAllowed) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        this.engine.logger?.warn?.(`PluginManager: blocked plugin outside allowed roots: ${realFile}`);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
      const mod = require(realFile);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const plugin = mod?.default || mod;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const pluginName = plugin?.name || path.parse(realFile).name;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!plugin || (typeof plugin !== 'function' && typeof plugin.execute !== 'function')) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        this.engine.logger?.warn?.(`PluginManager: "${pluginName}" is not an executable plugin; skipping.`);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (typeof plugin.initialize === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        await plugin.initialize(this.engine);
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.plugins.set(pluginName, plugin as Plugin);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      this.engine.logger?.info?.(`PluginManager: Loaded plugin "${pluginName}" from ${realFile}`);
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      this.engine.logger?.error?.(`PluginManager: Failed to load plugin ${pluginPath}: ${(err as Error).message}`);
    }
  }

  /**
   * Find plugin by name (case-insensitive)
   * Supports JSPWiki-style plugin naming where you can use either:
   * - "Search" or "SearchPlugin"
   * - "Index" or "IndexPlugin"
   *
   * @param {string} pluginName - Name of the plugin to find
   * @returns {Plugin|null} Plugin object or null if not found
   */
  findPlugin(pluginName: string): Plugin | null {
    // Try exact match first (for performance)
    if (this.plugins.has(pluginName)) {
      return this.plugins.get(pluginName) ?? null;
    }

    // Try case-insensitive match
    const lowerName = pluginName.toLowerCase();
    for (const [key, plugin] of this.plugins) {
      if (key.toLowerCase() === lowerName) {
        return plugin;
      }
    }

    // JSPWiki compatibility: Try with "Plugin" suffix if not already present
    if (!pluginName.toLowerCase().endsWith('plugin')) {
      const withSuffix = pluginName + 'Plugin';
      if (this.plugins.has(withSuffix)) {
        return this.plugins.get(withSuffix) ?? null;
      }

      // Try case-insensitive with suffix
      const lowerWithSuffix = withSuffix.toLowerCase();
      for (const [key, plugin] of this.plugins) {
        if (key.toLowerCase() === lowerWithSuffix) {
          return plugin;
        }
      }
    }

    // Try without "Plugin" suffix if it's present
    if (pluginName.toLowerCase().endsWith('plugin')) {
      const withoutSuffix = pluginName.slice(0, -6); // Remove "Plugin"
      if (this.plugins.has(withoutSuffix)) {
        return this.plugins.get(withoutSuffix) ?? null;
      }

      // Try case-insensitive without suffix
      const lowerWithoutSuffix = withoutSuffix.toLowerCase();
      for (const [key, plugin] of this.plugins) {
        if (key.toLowerCase() === lowerWithoutSuffix) {
          return plugin;
        }
      }
    }

    return null;
  }

  /**
   * Execute a plugin
   * @param {string} pluginName - Name of the plugin
   * @param {string} pageName - Current page name
   * @param {PluginParams} params - Plugin parameters (parsed object)
   * @param {Record<string, unknown>} context - Additional context
   * @returns {Promise<string>} Plugin output
   */
  async execute(pluginName: string, pageName: string, params: PluginParams, context: Record<string, unknown> = {}): Promise<string> {
    const plugin = this.findPlugin(pluginName);
    if (!plugin) {
      return `Plugin '${pluginName}' not found`;
    }

    try {
      // Pass the full context through to plugins
      // Plugins expect the full ParseContext/WikiContext with all properties
      const pluginContext: PluginContext = {
        ...context, // Spread all context properties
         
        engine: context.engine || this.engine,
        pageName: pageName,
        linkGraph: (context.linkGraph as Record<string, unknown>) || {}
      };

      // Check if it's a new-style plugin with execute method
      if (plugin.execute && typeof plugin.execute === 'function') {
        const result = await plugin.execute(pluginContext, params);
        return result;
      }

      // Check if it's an old-style function plugin
      if (typeof plugin === 'function') {
        const result = await plugin(pageName, params, (context.linkGraph as Record<string, unknown>) || {});
        return result;
      }

      return `Plugin '${pluginName}' is not executable`;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`Plugin '${pluginName}' execution failed:`, err);
      return `Plugin '${pluginName}' error: ${(err as Error).message}`;
    }
  }

  /**
   * Get list of all registered plugins
   * @returns {string[]} Array of plugin names
   */
  getPluginNames(): string[] {
    return Array.from(this.plugins.keys());
  }

  /**
   * Get plugin info
   * @param {string} pluginName - Name of the plugin
   * @returns {PluginInfo | null} Plugin information
   */
  getPluginInfo(pluginName: string): PluginInfo | null {
    const plugin = this.findPlugin(pluginName);
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
  hasPlugin(pluginName: string): boolean {
    return this.findPlugin(pluginName) !== null;
  }
}

export default PluginManager;

// CommonJS compatibility
module.exports = PluginManager;
