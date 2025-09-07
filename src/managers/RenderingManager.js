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

    // Step 1: Protect code blocks and escaped syntax
    const protectedAreas = [];
    let protectionIndex = 0;

    // Protect code blocks (```code```)
    expandedContent = expandedContent.replace(/```[\s\S]*?```/g, (match) => {
      const placeholder = `__PROTECTED_${protectionIndex++}__`;
      protectedAreas[placeholder] = match;
      return placeholder;
    });

    // Protect inline code (`code`)
    expandedContent = expandedContent.replace(/`[^`]*`/g, (match) => {
      const placeholder = `__PROTECTED_${protectionIndex++}__`;
      protectedAreas[placeholder] = match;
      return placeholder;
    });

    // Protect escaped plugins/variables ([[{...}])
    expandedContent = expandedContent.replace(/\[\[\{([^}]+)\}\]/g, (match, content) => {
      const placeholder = `__PROTECTED_${protectionIndex++}__`;
      protectedAreas[placeholder] = `[{${content}}]`; // Remove one set of brackets
      return placeholder;
    });

    // Step 2: Expand JSPWiki-style plugins and system variables using PluginManager
    const pluginManager = this.engine.getManager('PluginManager');
    if (pluginManager) {
      // Handle system variables (${variable}) and plugins ({PluginName params})
      expandedContent = expandedContent.replace(/\[\{([^}]+)\}\]/g, (match, content) => {
        try {
          // Check if it's a system variable (starts with $)
          if (content.startsWith('$')) {
            return this.expandSystemVariable(content, pageName);
          }
          
          // Parse plugin call: PluginName param1=value1 param2=value2
          const parts = content.trim().split(/\s+/);
          const pluginName = parts[0];
          const params = {};
          
          // Parse parameters
          for (let i = 1; i < parts.length; i++) {
            const param = parts[i];
            const equalIndex = param.indexOf('=');
            if (equalIndex > 0) {
              const key = param.substring(0, equalIndex);
              const value = param.substring(equalIndex + 1);
              params[key] = value;
            }
          }
          
          // Execute plugin
          return pluginManager.execute(pluginName, pageName, params, { 
            linkGraph: this.linkGraph,
            engine: this.engine,
            pageName: pageName
          });
        } catch (err) {
          console.error(`Macro expansion failed for ${content}:`, err);
          return `[Error: ${content}]`;
        }
      });
    } else {
      // Fallback: just handle system variables directly
      expandedContent = this.expandSystemVariables(expandedContent);
    }

    // Step 3: Restore protected areas
    for (const [placeholder, originalContent] of Object.entries(protectedAreas)) {
      expandedContent = expandedContent.replace(placeholder, originalContent);
    }

    return expandedContent;
  }

  /**
   * Expand a single JSPWiki-style system variable
   * @param {string} variable - The variable name (including $)
   * @param {string} pageName - Current page name
   * @returns {string} Expanded value
   */
  expandSystemVariable(variable, pageName) {
    try {
      switch (variable) {
        case '$pagename':
          return pageName;
        case '$totalpages':
          return this.getTotalPagesCount().toString();
        case '$uptime':
          return this.formatUptime(this.getUptime());
        case '$applicationname':
          return 'amdWiki';
        case '$version':
          return this.getApplicationVersion();
        case '$baseurl':
          return this.getBaseUrl();
        case '$timestamp':
          return new Date().toISOString();
        case '$date':
          return new Date().toLocaleDateString();
        case '$time':
          return new Date().toLocaleTimeString();
        case '$year':
          return new Date().getFullYear().toString();
        default:
          console.warn(`Unknown system variable: ${variable}`);
          return `[{${variable}}]`; // Return unchanged if unknown
      }
    } catch (err) {
      console.error(`Error expanding system variable ${variable}:`, err);
      return `[Error: ${variable}]`;
    }
  }

  /**
   * Get total pages count
   * @returns {number} Number of pages
   */
  getTotalPagesCount() {
    try {
      const pageManager = this.engine.getManager('PageManager');
      if (pageManager && pageManager.getAllPages) {
        const pages = pageManager.getAllPages();
        return Array.isArray(pages) ? pages.length : 0;
      }
      return 0;
    } catch (err) {
      console.warn('Could not get total pages count:', err);
      return 0;
    }
  }

  /**
  /**
   * Get server uptime in seconds
   * @returns {number} Uptime in seconds
   */
  getUptime() {
    const startTime = this.engine.startTime || Date.now();
    return Math.floor((Date.now() - startTime) / 1000);
  }

  /**
   * Get application version from package.json
   * @returns {string} Application version
   */
  getApplicationVersion() {
    try {
      const fs = require('fs');
      const path = require('path');
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        return packageJson.version || '1.0.0';
      }
      
      return '1.0.0';
    } catch (err) {
      console.warn('Could not read version from package.json:', err);
      return '1.0.0';
    }
  }

  /**
   * Expand JSPWiki-style system variables (legacy method for compatibility)
   * @param {string} content - Content with system variables
   * @returns {string} Content with expanded system variables
   */
  expandSystemVariables(content) {
    try {
      const pageManager = this.engine.getManager('PageManager');
      
      // Get system information
      const startTime = this.engine.startTime || Date.now();
      const uptime = Math.floor((Date.now() - startTime) / 1000);
      const uptimeFormatted = this.formatUptime(uptime);
      
      // Get total pages count
      let totalPages = 0;
      if (pageManager) {
        try {
          const pages = pageManager.getAllPages ? pageManager.getAllPages() : [];
          totalPages = Array.isArray(pages) ? pages.length : 0;
        } catch (err) {
          console.warn('Could not get total pages count:', err);
        }
      }
      
      // Replace system variables
      let expandedContent = content;
      expandedContent = expandedContent.replace(/\[\{\$totalpages\}\]/g, totalPages.toString());
      expandedContent = expandedContent.replace(/\[\{\$uptime\}\]/g, uptimeFormatted);
      expandedContent = expandedContent.replace(/\[\{\$applicationname\}\]/g, 'amdWiki');
      expandedContent = expandedContent.replace(/\[\{\$baseurl\}\]/g, this.getBaseUrl());
      expandedContent = expandedContent.replace(/\[\{\$timestamp\}\]/g, new Date().toISOString());
      expandedContent = expandedContent.replace(/\[\{\$date\}\]/g, new Date().toLocaleDateString());
      expandedContent = expandedContent.replace(/\[\{\$time\}\]/g, new Date().toLocaleTimeString());
      
      // Sessions plugin (simplified)
      expandedContent = expandedContent.replace(/\[\{SessionsPlugin\}\]/g, '1');
      
      return expandedContent;
      
    } catch (err) {
      console.error('System variable expansion failed:', err);
      return content;
    }
  }

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

  /**
   * Get the base URL for the application
   * @returns {string} Base URL
   */
  getBaseUrl() {
    // This could be made configurable
    return 'http://localhost:3000';
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
      
      // Process wiki links with extended pipe syntax [DisplayText|Target|Parameters] and simple links [PageName]
      return content.replace(/\[([a-zA-Z0-9_\- ]+)(?:\|([a-zA-Z0-9_\-\/ .:?=&]+))?(?:\|([^|\]]+))?\]/g, (match, displayText, target, params) => {
        // Parse parameters if provided
        let linkAttributes = '';
        if (params) {
          // Parse target='_blank' and other attributes
          const targetMatch = params.match(/target=['"]([^'"]+)['"]/);
          if (targetMatch) {
            linkAttributes += ` target="${targetMatch[1]}"`;
            // Add rel="noopener noreferrer" for security when opening in new tab
            if (targetMatch[1] === '_blank') {
              linkAttributes += ' rel="noopener noreferrer"';
            }
          }
          
          // Parse other potential attributes (class, title, etc.)
          const classMatch = params.match(/class=['"]([^'"]+)['"]/);
          if (classMatch) {
            linkAttributes += ` class="${classMatch[1]}"`;
          }
          
          const titleMatch = params.match(/title=['"]([^'"]+)['"]/);
          if (titleMatch) {
            linkAttributes += ` title="${titleMatch[1]}"`;
          }
        }
        
        // If no target specified, it's a simple wiki link
        if (!target) {
          const pageName = displayText;
          if (pageNames.includes(pageName)) {
            return `<a href="/wiki/${encodeURIComponent(pageName)}" class="wikipage"${linkAttributes}>${pageName}</a>`;
          }
          // Red link for non-existent pages
          return `<a href="/edit/${encodeURIComponent(pageName)}" style="color: red;" class="redlink"${linkAttributes}>${pageName}</a>`;
        }
        
        // Handle pipe syntax [DisplayText|Target|Parameters]
        // Check if target is a URL (contains :// or starts with /)
        if (target.includes('://') || target.startsWith('/')) {
          // External URL or absolute path
          const baseClass = linkAttributes.includes('class=') ? '' : ' class="external-link"';
          return `<a href="${target}"${baseClass}${linkAttributes}>${displayText}</a>`;
        } else if (target.toLowerCase() === 'search') {
          // Special case for Search functionality
          return `<a href="/search" class="nav-link"${linkAttributes}>${displayText}</a>`;
        } else {
          // Wiki page target
          if (pageNames.includes(target)) {
            return `<a href="/wiki/${encodeURIComponent(target)}" class="wikipage"${linkAttributes}>${displayText}</a>`;
          }
          // Red link for non-existent page target
          return `<a href="/edit/${encodeURIComponent(target)}" style="color: red;" class="redlink"${linkAttributes}>${displayText}</a>`;
        }
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

        // Find wiki-style links including extended pipe syntax
        const simpleLinkRegex = /\[([a-zA-Z0-9\s_-]+)(?:\|([a-zA-Z0-9\s_\-\/ .:?=&]+))?(?:\|([^|\]]+))?\]/g;
        while ((match = simpleLinkRegex.exec(content)) !== null) {
          // For pipe syntax [DisplayText|Target|Parameters], use the target; otherwise use the display text
          const linkedPage = match[2] || match[1];
          
          // Only add to link graph if it's a wiki page (not external URLs or special pages)
          if (!linkedPage.includes('://') && !linkedPage.startsWith('/') && linkedPage.toLowerCase() !== 'search') {
            if (!newLinkGraph[linkedPage]) {
              newLinkGraph[linkedPage] = [];
            }
            if (!newLinkGraph[linkedPage].includes(pageName)) {
              newLinkGraph[linkedPage].push(pageName);
            }
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
