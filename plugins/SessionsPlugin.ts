/**
 * SessionsPlugin - JSPWiki-style sessions plugin
 * Returns the number of active sessions
 */

import type { SimplePlugin, PluginContext, PluginParams } from './types';

interface ConfigManager {
  getProperty(key: string, defaultValue: string | number): string | number;
}

interface SessionData {
  sessionCount?: number;
  distinctUsers?: number;
}

interface FetchResponse {
  ok: boolean;
  json(): Promise<unknown>;
}

type FetchFunction = (url: string, init?: { method: string }) => Promise<FetchResponse>;

const SessionsPlugin: SimplePlugin = {
  name: 'SessionsPlugin',
  description: 'Shows the number of active sessions',
  author: 'amdWiki',
  version: '1.0.0',

  /**
   * Execute the plugin
   * @param context - Wiki context
   * @param params - Plugin parameters (property='users' or 'distinctUsers')
   * @returns HTML output
   */
  async execute(context: PluginContext, params: PluginParams = {}): Promise<string> {
    try {
      let host = 'localhost';
      let port = 3000;

      // Try to get config, but use defaults if anything fails
      try {
        // Prefer ConfigurationManager keys
        const cfgMgr = (
          context.engine?.getManager?.('ConfigurationManager') ||
          context.engine?.getManager?.('ConfigManager')
        ) as ConfigManager | undefined;

        if (cfgMgr?.getProperty) {
          host = cfgMgr.getProperty('amdwiki.server.host', host) as string;
          port = cfgMgr.getProperty('amdwiki.server.port', port) as number;
        } else if (typeof context.engine?.getConfig === 'function') {
          const config = context.engine.getConfig() as { get?: (key: string, defaultValue: unknown) => unknown } | undefined;
          if (config?.get) {
            host = config.get('amdwiki.server.host', host) as string;
            port = config.get('amdwiki.server.port', port) as number;
          }
        }
      } catch {
        // Silently use defaults if config is not available
      }

      const baseUrl = `http://${host}:${port}`;

      // Use global fetch (available in Node.js 18+ and browsers)
      const fetchFn: FetchFunction = fetch as FetchFunction;

      // Determine which property to return
      const property = (String(params.property || 'users')).toLowerCase();

      const resp = await fetchFn(`${baseUrl}/api/session-count`, { method: 'GET' });
      if (!resp?.ok) return '0';

      let data: SessionData;
      try {
        data = await resp.json() as SessionData;
      } catch {
        data = { sessionCount: 0, distinctUsers: 0 };
      }

      // Return based on property parameter
      if (property === 'distinctusers') {
        return String(data.distinctUsers ?? data.sessionCount ?? 0);
      } else {
        // Default: property='users'
        return String(data.sessionCount ?? 0);
      }
    } catch (e) {
      // Suppress config initialization errors - use defaults instead
      const error = e as Error;
      if (error.message && error.message.includes('Config instance is invalid')) {
        return '0';
      }
      const logger = context?.engine?.logger;
      if (logger?.error) {
        logger.error(`SessionsPlugin error: ${error.message}`);
      }
      return '0';
    }
  }
};

module.exports = SessionsPlugin;
