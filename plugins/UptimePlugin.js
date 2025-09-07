/**
 * UptimePlugin - JSPWiki-style uptime plugin
 * Returns the server uptime in human-readable format
 */

const UptimePlugin = {
  name: 'UptimePlugin',
  description: 'Shows the server uptime',
  author: 'amdWiki',
  version: '1.0.0',

  /**
   * Execute the plugin
   * @param {Object} context - Wiki context
   * @param {Object} params - Plugin parameters
   * @returns {string} HTML output
   */
  execute(context, params) {
    const engine = context.engine;
    if (!engine || !engine.startTime) {
      return 'Unknown';
    }

    const uptimeSeconds = Math.floor((Date.now() - engine.startTime) / 1000);
    return this.formatUptime(uptimeSeconds);
  },

  /**
   * Format uptime in human-readable format
   * @param {number} seconds - Uptime in seconds
   * @returns {string} Formatted uptime
   */
  formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }
};

module.exports = UptimePlugin;
