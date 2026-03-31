/**
 * AddonsManager - Core Add-on Management System
 *
 * Handles discovery, registration, lifecycle management, and dependencies
 * for optional ngdpbase add-ons. This enables optional business modules
 * (person-contacts, financial-ledger, etc.) without modifying ngdpbase core.
 *
 * @class AddonsManager
 * @extends BaseManager
 *
 * @see {@link https://github.com/jwilleke/ngdpbase/issues/158}
 */

import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import BaseManager from './BaseManager';
import type { BackupData } from './BaseManager';
import type { WikiEngine } from '../types/WikiEngine';
import type ConfigurationManager from './ConfigurationManager';
import logger from '../utils/logger';

/**
 * Standard interface that all add-ons must implement
 */
export interface AddonModule {
  /** Unique identifier for the add-on */
  name: string;

  /** Semantic version string */
  version: string;

  /** Human-readable description */
  description?: string;

  /** Author name or organization */
  author?: string;

  /** List of add-on names this add-on depends on */
  dependencies?: string[];

  /**
   * Called during app startup if add-on is enabled.
   * Use this to register routes, initialize databases, etc.
   */
  register(
    engine: WikiEngine,
    config: Record<string, unknown>
  ): Promise<void> | void;

  /**
   * Optional health check returning add-on status details.
   */
  status?(): Promise<AddonStatusDetails> | AddonStatusDetails;

  /**
   * Optional cleanup on app shutdown.
   */
  shutdown?(): Promise<void> | void;
}

/**
 * Details returned by add-on's status() method
 */
export interface AddonStatusDetails {
  healthy: boolean;
  database?: string;
  records?: number;
  message?: string;
  [key: string]: unknown;
}

/**
 * Internal tracking for each discovered add-on
 */
interface AddonEntry {
  /** Filesystem path to the add-on */
  path: string;

  /** Loaded add-on module */
  module: AddonModule;

  /** Whether add-on is enabled in configuration */
  enabled: boolean;

  /** Whether add-on has been successfully loaded */
  loaded: boolean;

  /** Error message if loading failed */
  error: string | null;
}

/**
 * Status information returned by getStatus()
 */
export interface AddonStatus {
  name: string;
  version: string;
  description: string;
  author: string;
  enabled: boolean;
  loaded: boolean;
  dependencies: string[];
  error: string | null;
  details?: AddonStatusDetails;
  statusError?: string;
}

/**
 * AddonsManager - Manages optional add-on modules
 */
class AddonsManager extends BaseManager {
  /** Map of discovered add-ons by name */
  private addons: Map<string, AddonEntry>;

  /** Configured path to addons directory */
  private addonsPath: string;

  /** Resolved absolute path to addons directory */
  private resolvedAddonsPath: string | null;

  /** Stylesheets registered by add-ons via registerStylesheet() */
  private registeredStylesheets: Array<{ url: string; addonName: string }>;

  constructor(engine: WikiEngine) {
    super(engine);
    this.addons = new Map();
    this.addonsPath = './addons';
    this.resolvedAddonsPath = null;
    this.registeredStylesheets = [];
  }

  /**
   * Initialize the AddonsManager
   *
   * Reads configuration, discovers add-ons, and loads enabled ones
   * in dependency order.
   */
  async initialize(config: Record<string, unknown> = {}): Promise<void> {
    await super.initialize(config);

    const configManager = this.engine.getManager<ConfigurationManager>(
      'ConfigurationManager'
    );

    if (!configManager) {
      logger.warn('ConfigurationManager not available, using defaults');
    } else {
      // Check if AddonsManager is enabled
      const enabled = configManager.getProperty(
        'ngdpbase.managers.addons-manager.enabled',
        true
      ) as boolean;

      if (!enabled) {
        logger.info('AddonsManager disabled in configuration');
        return;
      }

      // Get configured addons path
      this.addonsPath = configManager.getProperty(
        'ngdpbase.managers.addons-manager.addons-path',
        './addons'
      ) as string;
    }

    // Resolve to absolute path
    this.resolvedAddonsPath = path.resolve(this.addonsPath);

    // Discover and load add-ons
    await this.discoverAddons();
    await this.loadAddons();

    logger.info(
      `Initialized with ${this.addons.size} add-on(s) discovered, ` +
        `${this.getLoadedCount()} loaded`
    );
  }

  /**
   * Discover available add-ons by scanning the addons directory
   */
  async discoverAddons(): Promise<void> {
    if (!this.resolvedAddonsPath) {
      return;
    }

    // Check if addons directory exists
    if (!fs.existsSync(this.resolvedAddonsPath)) {
      logger.debug(
        `Addons directory not found: ${this.resolvedAddonsPath} (this is normal if no add-ons installed)`
      );
      return;
    }

    // Verify it's a directory
    const stat = fs.statSync(this.resolvedAddonsPath);
    if (!stat.isDirectory()) {
      logger.warn(`Addons path is not a directory: ${this.resolvedAddonsPath}`);
      return;
    }

    // Scan for add-on directories
    const entries = fs.readdirSync(this.resolvedAddonsPath, {
      withFileTypes: true
    });

    for (const entry of entries) {
      // Skip hidden files/folders and non-directories
      if (!entry.isDirectory() || entry.name.startsWith('.')) {
        continue;
      }

      // Skip 'shared' folder (reserved for shared utilities)
      if (entry.name === 'shared') {
        continue;
      }

      const addonPath = path.join(this.resolvedAddonsPath, entry.name);
      const indexPath = path.join(addonPath, 'index.js');
      const indexTsPath = path.join(addonPath, 'index.ts');

      // Check for index file
      const hasIndex = fs.existsSync(indexPath) || fs.existsSync(indexTsPath);
      if (!hasIndex) {
        logger.warn(
          `Add-on ${entry.name} missing index.js/index.ts, skipping`
        );
        continue;
      }

      try {
        // Load the add-on module using dynamic import
        const modulePath = fs.existsSync(indexPath) ? indexPath : indexTsPath;
        const rawModule = (await import(modulePath)) as
          | AddonModule
          | { default: AddonModule };
        const addonModule: AddonModule =
          'default' in rawModule ? rawModule.default : rawModule;

        // Validate required fields
        if (!addonModule.name) {
          logger.warn(
            `Add-on in ${entry.name} missing 'name' field, using folder name`
          );
          addonModule.name = entry.name;
        }

        if (typeof addonModule.register !== 'function') {
          logger.error(
            `Add-on ${addonModule.name} missing required register() function, skipping`
          );
          continue;
        }

        // Check if enabled in configuration
        const enabled = this.isEnabled(addonModule.name);

        // Store the add-on entry
        this.addons.set(addonModule.name, {
          path: addonPath,
          module: addonModule,
          enabled,
          loaded: false,
          error: null
        });

        logger.info(
          `📦 Discovered add-on: ${addonModule.name} v${addonModule.version || 'unknown'} ` +
            `[${enabled ? 'enabled' : 'disabled'}]`
        );
      } catch (err) {
        logger.error(`Failed to load add-on from ${entry.name}:`, err);
      }
    }
  }

  /**
   * Check if an add-on is enabled in configuration
   */
  isEnabled(addonName: string): boolean {
    const configManager = this.engine.getManager<ConfigurationManager>(
      'ConfigurationManager'
    );

    if (!configManager) {
      return false; // Default to disabled if no config
    }

    return configManager.getProperty(
      `ngdpbase.addons.${addonName}.enabled`,
      false
    ) as boolean;
  }

  /**
   * Get add-on specific configuration
   */
  getAddonConfig(addonName: string): Record<string, unknown> {
    const configManager = this.engine.getManager<ConfigurationManager>(
      'ConfigurationManager'
    );

    if (!configManager) {
      return {};
    }

    // Get addon-specific properties from config.
    // Config is stored as flat dot-notation keys, e.g.:
    //   "ngdpbase.addons.my-addon.dataPath": "./data/my-addon"
    // Strip the prefix and expose short keys to the addon:
    //   config.dataPath === "./data/my-addon"
    const config: Record<string, unknown> = {};
    const prefix = `ngdpbase.addons.${addonName}.`;
    const allProps = configManager.getAllProperties();

    for (const [key, value] of Object.entries(allProps)) {
      if (key.startsWith(prefix)) {
        config[key.slice(prefix.length)] = value;
      }
    }

    return config;
  }

  /**
   * Seed wiki pages shipped with an add-on.
   *
   * If the add-on directory contains a `pages/` subdirectory, any `.md` files
   * found there are copied to the instance pages directory — but only if a file
   * with the same name does not already exist (user edits are never overwritten).
   *
   * This mirrors how `required-pages/` seeds core pages at install time.
   *
   * @param addonName  Name of the add-on (for logging)
   * @param addonPath  Filesystem path to the add-on directory
   */
  private async seedAddonPages(addonName: string, addonPath: string): Promise<void> {
    const addonPagesDir = path.join(addonPath, 'pages');

    try {
      await fs.promises.access(addonPagesDir);
    } catch {
      return; // No pages/ directory — nothing to seed
    }

    const configManager = this.engine.getManager<ConfigurationManager>('ConfigurationManager');
    const pagesDir = (configManager?.getProperty(
      'ngdpbase.page.provider.filesystem.storagedir',
      './data/pages'
    ) as string);

    await fs.promises.mkdir(pagesDir, { recursive: true });

    const files = (await fs.promises.readdir(addonPagesDir)).filter(f => f.endsWith('.md'));
    let seeded = 0;

    for (const file of files) {
      const dest = path.join(pagesDir, file);
      const src = path.join(addonPagesDir, file);
      try {
        await fs.promises.access(dest);
        // File exists — check if it was seeded by a different addon
        const existing = await fs.promises.readFile(dest, 'utf8');
        const parsed = matter(existing);
        if (parsed.data.addon && parsed.data.addon !== addonName) {
          logger.warn(
            `[AddonsManager] Page conflict: ${addonName}/pages/${file} skipped — ` +
            `already seeded by addon '${parsed.data.addon}' (${dest})`
          );
        }
        // else: user-created page or same addon reloading — silent skip
      } catch {
        // dest does not exist — seed it, stamping addon provenance in front-matter
        const raw = await fs.promises.readFile(src, 'utf8');
        const parsed = matter(raw);
        parsed.data.addon = addonName;
        if (!parsed.data['system-category']) {
          parsed.data['system-category'] = 'addon';
        }
        await fs.promises.writeFile(dest, matter.stringify(parsed.content, parsed.data), 'utf8');
        seeded++;
      }
    }

    if (seeded > 0) {
      logger.info(`[AddonsManager] Seeded ${seeded} page(s) from ${addonName}/pages/`);
    } else {
      logger.debug(`[AddonsManager] No new pages to seed for ${addonName}`);
    }
  }

  /**
   * Load all enabled add-ons in dependency order
   */
  private async loadAddons(): Promise<void> {
    try {
      const loadOrder = this.resolveLoadOrder();

      if (loadOrder.length === 0) {
        logger.debug('No enabled add-ons to load');
        return;
      }

      logger.info(`📋 Add-on load order: ${loadOrder.join(' → ')}`);

      for (const addonName of loadOrder) {
        await this.loadAddon(addonName);
      }
    } catch (err) {
      logger.error('Failed to resolve add-on load order:', err);
    }
  }

  /**
   * Resolve dependency order using topological sort
   *
   * @returns Array of add-on names in load order
   * @throws Error if circular dependency detected
   */
  resolveLoadOrder(): string[] {
    const order: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (name: string): void => {
      if (visited.has(name)) return;

      if (visiting.has(name)) {
        throw new Error(`Circular dependency detected involving: ${name}`);
      }

      const addon = this.addons.get(name);
      if (!addon || !addon.enabled) {
        return;
      }

      visiting.add(name);

      // Visit dependencies first
      const deps = addon.module.dependencies || [];
      for (const dep of deps) {
        if (!this.addons.has(dep)) {
          throw new Error(
            `Add-on ${name} requires ${dep} but it's not installed`
          );
        }
        if (!this.isEnabled(dep)) {
          throw new Error(
            `Add-on ${name} requires ${dep} to be enabled`
          );
        }
        visit(dep);
      }

      order.push(name);
      visiting.delete(name);
      visited.add(name);
    };

    // Visit all enabled add-ons
    for (const [name, addon] of this.addons) {
      if (addon.enabled) {
        visit(name);
      }
    }

    return order;
  }

  /**
   * Load a single add-on
   */
  async loadAddon(addonName: string): Promise<void> {
    const addon = this.addons.get(addonName);

    if (!addon) {
      throw new Error(`Add-on ${addonName} not found`);
    }

    if (!addon.enabled) {
      logger.debug(`Skipping disabled add-on: ${addonName}`);
      return;
    }

    if (addon.loaded) {
      return; // Already loaded
    }

    try {
      // Get add-on specific configuration
      const addonConfig = this.getAddonConfig(addonName);

      // Call the add-on's register function
      await addon.module.register(this.engine, addonConfig);

      // Seed any pages shipped with the add-on (pages/ subdir)
      await this.seedAddonPages(addonName, addon.path);

      addon.loaded = true;
      addon.error = null;

      logger.info(
        `✅ Add-on loaded: ${addonName} v${addon.module.version || 'unknown'}`
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : String(err);
      addon.error = errorMessage;
      addon.loaded = false;

      logger.error(`Failed to load add-on ${addonName}: ${errorMessage}`);
      // Don't throw - allow other add-ons to load
    }
  }

  /**
   * Get status of all discovered add-ons
   */
  async getStatus(): Promise<AddonStatus[]> {
    const status: AddonStatus[] = [];

    for (const [name, addon] of this.addons) {
      const info: AddonStatus = {
        name,
        version: addon.module.version || 'unknown',
        description: addon.module.description || '',
        author: addon.module.author || '',
        enabled: addon.enabled,
        loaded: addon.loaded,
        dependencies: addon.module.dependencies || [],
        error: addon.error
      };

      // Call add-on's status() if available and loaded
      if (addon.loaded && typeof addon.module.status === 'function') {
        try {
          info.details = await addon.module.status();
        } catch (err) {
          info.statusError =
            err instanceof Error ? err.message : String(err);
        }
      }

      status.push(info);
    }

    return status;
  }

  /**
   * Get count of loaded add-ons
   */
  private getLoadedCount(): number {
    let count = 0;
    for (const addon of this.addons.values()) {
      if (addon.loaded) count++;
    }
    return count;
  }

  /**
   * Register a stylesheet URL to be injected into every page's <head>.
   *
   * Call this from your add-on's register() function:
   * ```js
   * const addonsManager = engine.getManager('AddonsManager');
   * addonsManager.registerStylesheet('/addons/my-addon/css/style.css');
   * ```
   *
   * The URL must be publicly accessible (served via Express static or a CDN).
   * Add-on CSS files under `addons/<name>/public/` are automatically served at
   * `/addons/<name>/public/` when the server starts.
   *
   * @param url    Public URL of the stylesheet (e.g. '/addons/my-addon/css/style.css')
   * @param addonName  Optional: name of the registering add-on (for logging)
   */
  registerStylesheet(url: string, addonName: string = 'unknown'): void {
    if (!url || typeof url !== 'string') {
      logger.warn(`[AddonsManager] registerStylesheet called with invalid url by ${addonName}`);
      return;
    }
    this.registeredStylesheets.push({ url, addonName });
    logger.debug(`[AddonsManager] Stylesheet registered by ${addonName}: ${url}`);
  }

  /**
   * Return the ordered list of stylesheet URLs registered by all add-ons.
   * Called by the template layer to inject <link> tags into <head>.
   */
  getRegisteredStylesheets(): string[] {
    return this.registeredStylesheets.map(s => s.url);
  }

  /**
   * Get list of all discovered add-on names
   */
  getAddonNames(): string[] {
    return Array.from(this.addons.keys());
  }

  /**
   * Check if an add-on exists (discovered)
   */
  hasAddon(addonName: string): boolean {
    return this.addons.has(addonName);
  }

  /**
   * Check if an add-on is loaded
   */
  isLoaded(addonName: string): boolean {
    const addon = this.addons.get(addonName);
    return addon?.loaded ?? false;
  }

  /**
   * Graceful shutdown of all loaded add-ons
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down add-ons...');

    // Shutdown in reverse load order
    const loadedAddons = Array.from(this.addons.entries())
      .filter(([, addon]) => addon.loaded)
      .reverse();

    for (const [name, addon] of loadedAddons) {
      if (typeof addon.module.shutdown === 'function') {
        try {
          await addon.module.shutdown();
          logger.debug(`Shutdown add-on: ${name}`);
        } catch (err) {
          logger.error(`Error shutting down ${name}:`, err);
        }
      }
    }

    await super.shutdown();
  }

  /**
   * Backup add-on manager state
   */
  backup(): Promise<BackupData> {
    const addonStates: Record<string, { enabled: boolean; loaded: boolean }> =
      {};

    for (const [name, addon] of this.addons) {
      addonStates[name] = {
        enabled: addon.enabled,
        loaded: addon.loaded
      };
    }

    return Promise.resolve({
      managerName: 'AddonsManager',
      timestamp: new Date().toISOString(),
      data: {
        addonsPath: this.addonsPath,
        addonStates
      }
    });
  }

  /**
   * Restore is not supported for AddonsManager
   * (add-ons are discovered at startup)
   */
  restore(backupData: BackupData): Promise<void> {
    if (!backupData) {
      return Promise.reject(
        new Error('AddonsManager: No backup data provided for restore')
      );
    }
    // Add-on state is determined by configuration and discovery
    // Restore is a no-op
    logger.info('AddonsManager restore called (no-op - state determined by config)');
    return Promise.resolve();
  }
}

export default AddonsManager;

// CommonJS compatibility
module.exports = AddonsManager;
