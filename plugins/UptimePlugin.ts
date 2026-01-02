/**
 * UptimePlugin - JSPWiki-style uptime plugin
 * Returns the server uptime in human-readable format
 */

import type { SimplePlugin, PluginContext } from './types';

const UptimePlugin: SimplePlugin = {
  name: 'UptimePlugin',
  description: 'Shows the server uptime',
  author: 'amdWiki',
  version: '1.0.0',

  /**
   * Execute the plugin
   * @param context - Wiki context
   * @param params - Plugin parameters
   * @returns HTML output
   */
  execute(context: PluginContext): string {
    const engine = context.engine;
    if (!engine || !engine.startTime) {
      return 'Unknown';
    }

    const uptimeSeconds = Math.floor((Date.now() - engine.startTime) / 1000);
    return formatUptime(uptimeSeconds);
  }
};

/**
 * Format uptime in human-readable format
 * @param seconds - Uptime in seconds
 * @returns Formatted uptime
 */
function formatUptime(seconds: number): string {
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

module.exports = UptimePlugin;
