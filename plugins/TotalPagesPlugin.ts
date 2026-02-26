/**
 * TotalPagesPlugin - JSPWiki-style total pages plugin
 * Returns the total number of pages in the wiki
 */

import type { SimplePlugin, PluginContext, PluginParams } from './types';

interface PageManager {
  getAllPages(): Promise<unknown[]>;
}

const TotalPagesPlugin: SimplePlugin = {
  name: 'TotalPagesPlugin',
  description: 'Shows the total number of pages',
  author: 'amdWiki',
  version: '1.0.0',

  /**
   * Execute the plugin
   * @param context - Wiki context
   * @param params - Plugin parameters
   * @returns HTML output
   */
  async execute(context: PluginContext, _params: PluginParams): Promise<string> {
    const engine = context.engine;
    if (!engine) {
      return '0';
    }

    try {
      const pageManager = engine.getManager('PageManager') as PageManager | undefined;
      if (pageManager && pageManager.getAllPages) {
        const pages = await pageManager.getAllPages();
        return Array.isArray(pages) ? pages.length.toLocaleString('en-US') : '0';
      }
      return '0';
    } catch (err) {
      const logger = context.engine?.logger;
      if (logger?.error) {
        logger.error('TotalPagesPlugin error:', err);
      }
      return '0';
    }
  }
};

module.exports = TotalPagesPlugin;
