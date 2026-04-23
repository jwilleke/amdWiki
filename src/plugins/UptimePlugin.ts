import type { SimplePlugin, PluginContext } from './types.js';
import { formatDuration } from '../utils/pluginFormatters.js';

const UptimePlugin: SimplePlugin = {
  name: 'UptimePlugin',
  description: 'Shows the server uptime',
  author: 'ngdpbase',
  version: '1.0.0',

  execute(context: PluginContext): string {
    const engine = context.engine;
    if (!engine || !engine.startTime) {
      return 'Unknown';
    }
    const uptimeSeconds = Math.floor((Date.now() - engine.startTime) / 1000);
    return formatDuration(uptimeSeconds);
  }
};

export default UptimePlugin;
