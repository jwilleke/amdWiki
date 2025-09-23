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
   * @param {Object} params - Plugin parameters
   * @returns {string} HTML output
   */
  async execute(context) {
    try {
      // Prefer ConfigurationManager keys
      const cfgMgr =
        context.engine.getManager?.('ConfigurationManager') ||
        context.engine.getManager?.('ConfigManager');

      let host = 'localhost';
      let port = 3000;

      if (cfgMgr?.get) {
        host = cfgMgr.get('amdwiki.server.host', host);
        port = cfgMgr.get('amdwiki.server.port', port);
      } else if (typeof context.engine.getConfig === 'function') {
        const config = context.engine.getConfig();
        if (config?.get) {
          host = config.get('amdwiki.server.host', host);
          port = config.get('amdwiki.server.port', port);
        }
      }

      const baseUrl = `http://${host}:${port}`;

      // Use global fetch if available; otherwise lazy-load node-fetch (ESM)
      const fetchFn = typeof fetch === 'function' ? fetch : (await import('node-fetch')).default;

      const resp = await fetchFn(`${baseUrl}/api/session-count`, { method: 'GET' });
      if (!resp?.ok) return '0';
      const data = await resp.json().catch(() => ({ sessionCount: 0 }));
      return String(data.sessionCount ?? 0);
    } catch (e) {
      console.error(`SessionsPlugin error: ${e.message}`);
      return '0';
    }
  }
};

module.exports = SessionsPlugin;
