const BaseManager = require('./BaseManager');
const showdown = require('showdown');

/**
 * RenderingManager - Handles markdown rendering and macro expansion
 * Similar to JSPWiki's RenderingManager
 */
class RenderingManager extends BaseManager {
  constructor(engine) {
    super(engine);
    this.converter = null;
    this.linkGraph = {};
  }

  async initialize(config = {}) {
    await super.initialize(config);
    
    // Initialize Showdown converter
    this.converter = new showdown.Converter();
    
    // Build initial link graph
    await this.buildLinkGraph();
    
    console.log('✅ RenderingManager initialized');
  }

  /**
   * Render markdown content to HTML
   * @param {string} content - Markdown content
   * @param {string} pageName - Current page name
   * @returns {string} Rendered HTML
   */
  renderMarkdown(content, pageName) {
    if (!content) return '';

    // Step 1: Expand macros
    let expandedContent = this.expandMacros(content, pageName);
    
    // Step 2: Process wiki-style links
    expandedContent = this.processWikiLinks(expandedContent);
    
    // Step 3: Convert to HTML
    const html = this.converter.makeHtml(expandedContent);
    
    return html;
  }

  /**
   * Expand macros in content
   * @param {string} content - Content with macros
   * @param {string} pageName - Current page name
   * @returns {string} Content with expanded macros
   */
  expandMacros(content, pageName) {
    let expandedContent = content;

    // Expand [{$pagename}] to the current page title
    expandedContent = expandedContent.replace(/\[\{\$pagename\}\]/g, pageName);

    // Expand plugin macros using PluginManager
    const pluginManager = this.engine.getManager('PluginManager');
    if (pluginManager) {
      expandedContent = expandedContent.replace(/\[\{(\w+)([^}]*)\}\]/g, (match, pluginName, params) => {
        try {
          return pluginManager.execute(pluginName, pageName, params, { linkGraph: this.linkGraph });
        } catch (err) {
          console.error(`Macro expansion failed for ${pluginName}:`, err);
          return `[Error: ${pluginName}]`;
        }
      });
    }

    return expandedContent;
  }

  /**
   * Process wiki-style links [PageName]
   * @param {string} content - Content with wiki links
   * @returns {string} Content with processed links
   */
  processWikiLinks(content) {
    try {
      const pageManager = this.engine.getManager('PageManager');
      if (!pageManager) {
        return content;
      }

      // Get all existing page names (this should be cached in practice)
      const pageNames = this.cachedPageNames || [];
      
      return content.replace(/\[([a-zA-Z0-9_\- ]+)\]/g, (match, pageName) => {
        if (pageNames.includes(pageName)) {
          return `<a href="/wiki/${pageName}" class="wikipage">${pageName}</a>`;
        }
        return match; // Return unchanged if page doesn't exist
      });
    } catch (err) {
      console.error('Wiki link processing failed:', err);
      return content;
    }
  }

  /**
   * Build link graph for referring pages
   */
  async buildLinkGraph() {
    const pageManager = this.engine.getManager('PageManager');
    if (!pageManager) {
      console.warn('PageManager not available for link graph building');
      return;
    }

    try {
      const pages = await pageManager.getAllPages();
      const newLinkGraph = {};
      
      // Cache page names for wiki link processing
      this.cachedPageNames = pages.map(page => page.name);

      for (const page of pages) {
        const pageName = page.name;
        const content = page.content;

        if (!newLinkGraph[pageName]) {
          newLinkGraph[pageName] = [];
        }

        // Find markdown links
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        let match;
        while ((match = linkRegex.exec(content)) !== null) {
          const linkedPage = match[2];
          if (!newLinkGraph[linkedPage]) {
            newLinkGraph[linkedPage] = [];
          }
          if (!newLinkGraph[linkedPage].includes(pageName)) {
            newLinkGraph[linkedPage].push(pageName);
          }
        }

        // Find wiki-style links
        const simpleLinkRegex = /\[([a-zA-Z0-9\s_-]+)\]/g;
        while ((match = simpleLinkRegex.exec(content)) !== null) {
          const linkedPage = match[1];
          if (!newLinkGraph[linkedPage]) {
            newLinkGraph[linkedPage] = [];
          }
          if (!newLinkGraph[linkedPage].includes(pageName)) {
            newLinkGraph[linkedPage].push(pageName);
          }
        }
      }

      this.linkGraph = newLinkGraph;
      console.log(`📊 Link graph built with ${Object.keys(this.linkGraph).length} entries`);
    } catch (err) {
      console.error('Failed to build link graph:', err);
    }
  }

  /**
   * Get link graph
   * @returns {Object} Link graph object
   */
  getLinkGraph() {
    return this.linkGraph;
  }

  /**
   * Rebuild link graph (called after page changes)
   */
  async rebuildLinkGraph() {
    await this.buildLinkGraph();
  }

  /**
   * Get pages that refer to a specific page
   * @param {string} pageName - Target page name
   * @returns {Array<string>} Array of referring page names
   */
  getReferringPages(pageName) {
    return this.linkGraph[pageName] || [];
  }

  /**
   * Render page preview
   * @param {string} content - Markdown content
   * @param {string} pageName - Page name for context
   * @returns {string} Rendered HTML preview
   */
  renderPreview(content, pageName) {
    return this.renderMarkdown(content, pageName);
  }
}

module.exports = RenderingManager;
