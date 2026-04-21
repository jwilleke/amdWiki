import type { SimplePlugin, PluginContext } from './types';

/**
 * TabPlugin — defines a single tab within a [{Tabs}] body block.
 *
 * TabsPlugin parses [{Tab name='...'}]content[{/Tab}] blocks directly
 * from its body content, so this plugin is a no-op when used inside
 * [{Tabs}]. It returns empty string to avoid double-rendering.
 *
 * Standalone use outside [{Tabs}] also returns empty string intentionally.
 */
const TabPlugin: SimplePlugin = {
  name: 'TabPlugin',
  description: 'Defines a tab within [{Tabs}]; rendering is handled by TabsPlugin',
  author: 'ngdpbase',
  version: '1.0.0',

  async execute(_context: PluginContext): Promise<string> {
    return '';
  }
};

export default TabPlugin;
