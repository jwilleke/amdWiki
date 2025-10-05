/**
 * SessionsPlugin - JSPWiki-style sessions plugin
 * Returns the number of active sessions
 */

const SessionsPlugin = {
  name: 'SessionsPlugin',
  description: 'Shows the number of active sessions',
  author: 'amdWiki',
  version: '1.0.0',

  /**
   * Execute the plugin
   * @param {Object} context - Wiki context
   * @param {Object} params - Plugin parameters (property='users' or 'distinctUsers')
   * @returns {string} HTML output
   */
  async execute(context, params = {}) {
    try {
      let host = 'localhost';
      let port = 3000;

      // Try to get config, but use defaults if anything fails
      try {
        // Prefer ConfigurationManager keys
        const cfgMgr =
          context.engine?.getManager?.('ConfigurationManager') ||
          context.engine?.getManager?.('ConfigManager');

        if (cfgMgr?.getProperty) {
          host = cfgMgr.getProperty('amdwiki.server.host', host);
          port = cfgMgr.getProperty('amdwiki.server.port', port);
        } else if (typeof context.engine?.getConfig === 'function') {
          const config = context.engine.getConfig();
          if (config?.get) {
            host = config.get('amdwiki.server.host', host);
            port = config.get('amdwiki.server.port', port);
          }
        }
      } catch (configError) {
        // Silently use defaults if config is not available
      }

      const baseUrl = `http://${host}:${port}`;

      // Use global fetch if available; otherwise lazy-load node-fetch (ESM)
      const fetchFn = typeof fetch === 'function' ? fetch : (await import('node-fetch')).default;

      // Determine which property to return
      const property = (params.property || 'users').toLowerCase();

      const resp = await fetchFn(`${baseUrl}/api/session-count`, { method: 'GET' });
      if (!resp?.ok) return '0';
      const data = await resp.json().catch(() => ({ sessionCount: 0, distinctUsers: 0 }));

      // Return based on property parameter
      if (property === 'distinctusers') {
        return String(data.distinctUsers ?? data.sessionCount ?? 0);
      } else {
        // Default: property='users'
        return String(data.sessionCount ?? 0);
      }
    } catch (e) {
      // Suppress config initialization errors - use defaults instead
      if (e.message && e.message.includes('Config instance is invalid')) {
        return '0';
      }
      const log = context?.engine?.logger?.error || console.error;
      log(`SessionsPlugin error: ${e.message}`);
      return '0';
    }
  }
};

module.exports = SessionsPlugin;
