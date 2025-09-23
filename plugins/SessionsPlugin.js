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
      // Build base URL from config
      const config = context.engine.getConfig();
      const host = config.get('server.host', 'localhost');
      const port = config.get('server.port', 3000);
      const baseUrl = `http://${host}:${port}`;

      // Use global fetch if available; otherwise lazy-load node-fetch (ESM)
      const fetchFn = typeof fetch === 'function' ? fetch : (await import('node-fetch')).default;

      const resp = await fetchFn(`${baseUrl}/api/session-count`, { method: 'GET' });
      if (!resp.ok) return '0';
      const data = await resp.json().catch(() => ({ sessionCount: 0 }));
      return String(data.sessionCount ?? 0);
    } catch {
      return '0';
    }
  }
};

module.exports = SessionsPlugin;
