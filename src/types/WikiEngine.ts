/**
 * WikiEngine type definitions
 *
 * Defines the core WikiEngine interface and manager registry types.
 * WikiEngine is the central orchestrator that manages all subsystems.
 */

import { WikiConfig } from './Config';
import type { Logger } from 'winston';

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
 * Note: Uses 'any' for backwards compatibility with existing code
 */
export interface ManagerRegistry {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Dynamic manager types
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
  // so they can't be declared here. They're accessible via index signature.

  /** Logger instance (winston Logger) */
  logger?: Logger;

  /** Engine start time */
  startTime?: number;

  /** Current context (request-scoped) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- WikiContext type varies by request
  context?: any;

  /**
   * Initialize the wiki engine
   * @param config - Wiki configuration
   * @returns The initialized engine or void
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Returns WikiEngine or void
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Dynamic type
  getManager<T = any>(managerName: string): T | undefined;

  /**
   * Register a manager
   * @param managerName - Name of the manager
   * @param manager - Manager instance
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Dynamic type
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Dynamic type
  [key: string]: any;
}
