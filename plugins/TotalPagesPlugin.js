/**
 * TotalPagesPlugin - JSPWiki-style total pages plugin
 * Returns the total number of pages in the wiki
 */

const TotalPagesPlugin = {
  name: 'TotalPagesPlugin',
  description: 'Shows the total number of pages',
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
    if (!engine) {
      return '0';
    }

    try {
      const pageManager = engine.getManager('PageManager');
      if (pageManager && pageManager.getAllPages) {
        const pages = pageManager.getAllPages();
        return Array.isArray(pages) ? pages.length.toString() : '0';
      }
      return '0';
    } catch (err) {
      console.error('TotalPagesPlugin error:', err);
      return '0';
    }
  }
};

module.exports = TotalPagesPlugin;
