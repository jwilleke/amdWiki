/**
 * WikiEngine type definitions
 *
 * Defines the core WikiEngine interface and manager registry types.
 * WikiEngine is the central orchestrator that manages all subsystems.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { WikiConfig } from './Config';

/**
 * Manager registry - maps manager names to manager instances
 */
export interface ManagerRegistry {
  [managerName: string]: any; // Will be typed properly as managers are converted
}

/**
 * WikiEngine interface
 *
 * The core engine that orchestrates all wiki functionality.
 * Manages initialization, configuration, and provides access to all managers.
 */
export interface WikiEngine {
  /** Wiki configuration */
  config: WikiConfig;

  /** Manager registry */
  managers: ManagerRegistry;

  /** Whether engine is initialized */
  initialized: boolean;

  /** Logger instance */
  logger?: any;

  /** Engine start time */
  startTime?: number;

  /**
   * Initialize the wiki engine
   * @param config - Wiki configuration
   */
  initialize(config: WikiConfig): Promise<void>;

  /**
   * Get a manager by name
   * @param managerName - Name of the manager
   * @returns Manager instance or undefined
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
}
