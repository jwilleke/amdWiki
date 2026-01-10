/**
 * WikiEngine type definitions
 *
 * Defines the core WikiEngine interface and manager registry types.
 * WikiEngine is the central orchestrator that manages all subsystems.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { WikiConfig } from './Config';

/**
 * All known manager names as a union type
 * Use with getManager() for type-safe access when combined with explicit type parameter
 */
export type ManagerName =
  | 'ConfigurationManager'
  | 'PageManager'
  | 'UserManager'
  | 'ACLManager'
  | 'PluginManager'
  | 'RenderingManager'
  | 'SearchManager'
  | 'VariableManager'
  | 'ValidationManager'
  | 'SchemaManager'
  | 'PolicyManager'
  | 'PolicyValidator'
  | 'PolicyEvaluator'
  | 'ExportManager'
  | 'TemplateManager'
  | 'AttachmentManager'
  | 'BackupManager'
  | 'CacheManager'
  | 'AuditManager'
  | 'NotificationManager';

/**
 * Manager registry - maps manager names to manager instances
 */
export interface ManagerRegistry {
  [managerName: string]: any;
}

/**
 * WikiEngine interface
 *
 * The core engine that orchestrates all wiki functionality.
 * Manages initialization, configuration, and provides access to all managers.
 */
export interface WikiEngine {
  /** Wiki configuration */
  config?: WikiConfig;

  // Note: `managers` and `initialized` are protected in the class implementation,
  // so they can't be declared here. They're accessible via [key: string]: any.

  /** Logger instance */
  logger?: any;

  /** Engine start time */
  startTime?: number;

  /** Current context (request-scoped) */
  context?: any;

  /**
   * Initialize the wiki engine
   * @param config - Wiki configuration
   * @returns The initialized engine or void
   */
  initialize(config?: WikiConfig): Promise<any>;

  /**
   * Get a manager by name
   * @param managerName - Name of the manager
   * @returns Manager instance or undefined
   *
   * @example
   * // Type-safe usage with explicit type parameter:
   * const pageManager = engine.getManager<PageManager>('PageManager');
   */
  getManager<T = any>(managerName: string): T | undefined;

  /**
   * Register a manager
   * @param managerName - Name of the manager
   * @param manager - Manager instance
   */
  registerManager(managerName: string, manager: any): void;

  /**
   * Get wiki configuration
   * @returns Wiki configuration object
   */
  getConfig(): WikiConfig;

  /**
   * Shutdown the wiki engine
   */
  shutdown(): Promise<void>;

  /**
   * Get all registered manager names
   * @returns Array of manager names
   */
  getRegisteredManagers(): string[];

  /** Allow additional properties for extensibility */
  [key: string]: any;
}
