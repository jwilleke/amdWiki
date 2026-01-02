/**
 * Plugin types for amdWiki plugins
 *
 * These types provide proper TypeScript definitions for plugins
 * that use the object-with-execute pattern.
 */

/**
 * Wiki engine interface for plugins
 */
export interface WikiEngine {
  getManager(name: string): unknown;
  startTime?: number;
  logger?: {
    error: (...args: unknown[]) => void;
  };
  getConfig?(): { get?: (key: string, defaultValue: unknown) => unknown };
}

/**
 * Plugin context passed to plugins during execution
 */
export interface PluginContext {
  engine?: WikiEngine;
  pageName: string;
  linkGraph: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Plugin parameters (parsed from plugin syntax)
 */
export interface PluginParams {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Simple plugin interface for plugins that use the execute method pattern
 * (does not require the callable function signature)
 */
export interface SimplePlugin {
  name?: string;
  description?: string;
  author?: string;
  version?: string;
  initialize?: (engine: unknown) => Promise<void> | void;
  execute?: (context: PluginContext, params: PluginParams) => Promise<string> | string;
}

/**
 * Callable plugin type for plugins that can be called directly
 * (like referringPagesPlugin)
 */
export type CallablePlugin = ((
  pageName: string,
  params: PluginParams,
  linkGraph: Record<string, string[]>
) => string | Promise<string>) & {
  name: string;
  description: string;
  author: string;
  version: string;
  initialize?: (engine: unknown) => void;
};
