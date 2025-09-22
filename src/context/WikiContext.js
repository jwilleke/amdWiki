/**
 * WikiContext - Central context for wiki rendering operations
 * 
 * Orchestrates the rendering pipeline using managers instead of inline regex.
 * Follows JSPWiki's architecture where WikiContext coordinates access to
 * managers like VariableManager, PluginManager, and RenderingManager.
 * 
 * Related Issue: #66 - Implement WikiContext and Manager refactoring
 */
class WikiContext {
  constructor(engine, options = {}) {
    this.engine = engine;
    
    // Page context
    this.pageName = options.pageName || 'unknown';
    this.content = options.content || '';
    
    // User context  
    this.userContext = options.userContext || null;
    this.requestInfo = options.requestInfo || null;
    
    // Rendering state
    this.variables = new Map();
    this.metadata = {};
    this.linkGraph = options.linkGraph || {};
    
    // Performance tracking
    this.startTime = Date.now();
    this.phaseTimings = new Map();
  }

  /**
   * Get manager instance from engine
   * @param {string} managerName - Name of manager to retrieve
   * @returns {Object|null} - Manager instance or null
   */
  getManager(managerName) {
    return this.engine.getManager(managerName);
  }

  /**
   * Main rendering method - orchestrates the full rendering pipeline
   * Follows JSPWiki's TranslatorReader pattern: variables → plugins → links → HTML
   * @param {string} content - Markdown content to render
   * @param {string} pageName - Current page name
   * @param {Object} userContext - User context for authentication variables
   * @param {Object} requestInfo - Request information for context variables
   * @returns {string} - Rendered HTML content
   */
  async renderMarkdown(content, pageName, userContext = null, requestInfo = null) {
    const startTime = Date.now();
    
    try {
      // Update context
      this.content = content;
      this.pageName = pageName;
      this.userContext = userContext;
      this.requestInfo = requestInfo;
      
      let processedContent = content;
      
      // Phase 1: Variable expansion using VariableManager
      const variableStart = Date.now();
      processedContent = await this.expandVariables(processedContent);
      this.phaseTimings.set('variables', Date.now() - variableStart);
      
      // Phase 2: Plugin execution using PluginManager
      const pluginStart = Date.now();
      processedContent = await this.expandPlugins(processedContent);
      this.phaseTimings.set('plugins', Date.now() - pluginStart);
      
      // Phase 3: Wiki link processing using RenderingManager
      const linkStart = Date.now();
      processedContent = await this.expandWikiLinks(processedContent);
      this.phaseTimings.set('links', Date.now() - linkStart);
      
      // Phase 4: Markdown to HTML conversion
      const markdownStart = Date.now();
      const finalHtml = await this.convertMarkdownToHtml(processedContent);
      this.phaseTimings.set('markdown', Date.now() - markdownStart);
      
      this.phaseTimings.set('total', Date.now() - startTime);
      
      return finalHtml;
      
    } catch (error) {
      console.error('WikiContext rendering error:', error);
      throw error;
    }
  }

  /**
   * Expand variables using VariableManager
   * @param {string} content - Content with variables
   * @returns {string} - Content with expanded variables
   */
  async expandVariables(content) {
    const variableManager = this.getManager('VariableManager');
    if (!variableManager) {
      console.warn('VariableManager not available, skipping variable expansion');
      return content;
    }

    const context = {
      userContext: this.userContext,
      pageName: this.pageName,
      requestInfo: this.requestInfo
    };

    return variableManager.expandVariables(content, context);
  }

  /**
   * Expand plugins using PluginManager
   * @param {string} content - Content with plugin syntax
   * @returns {string} - Content with rendered plugins
   */
  async expandPlugins(content) {
    const pluginManager = this.getManager('PluginManager');
    if (!pluginManager) {
      console.warn('PluginManager not available, skipping plugin expansion');
      return content;
    }

    // Process JSPWiki-style plugins [{PluginName param1='value'}]
    return content.replace(/\[\{([^}]+)\}\]/g, (match, pluginContent) => {
      try {
        // Parse plugin name and parameters
        const parts = pluginContent.trim().split(/\s+/);
        const pluginName = parts[0];
        
        // Parse parameters (simplified - could be enhanced)
        const params = {};
        for (let i = 1; i < parts.length; i++) {
          const param = parts[i];
          const eqIndex = param.indexOf('=');
          if (eqIndex > 0) {
            const key = param.substring(0, eqIndex);
            let value = param.substring(eqIndex + 1);
            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || 
                (value.startsWith("'") && value.endsWith("'"))) {
              value = value.slice(1, -1);
            }
            params[key] = value;
          }
        }

        // Execute plugin with context
        const context = {
          engine: this.engine,
          pageName: this.pageName,
          userContext: this.userContext,
          requestInfo: this.requestInfo,
          linkGraph: this.linkGraph
        };

        return pluginManager.execute(pluginName, this.pageName, params, context);
      } catch (error) {
        console.error(`Error executing plugin from ${match}:`, error);
        return `<span class="error">Plugin Error: ${error.message}</span>`;
      }
    });
  }

  /**
   * Expand wiki links using RenderingManager
   * @param {string} content - Content with wiki links
   * @returns {string} - Content with rendered links
   */
  async expandWikiLinks(content) {
    const renderingManager = this.getManager('RenderingManager');
    if (!renderingManager) {
      console.warn('RenderingManager not available, using fallback link processing');
      return this.fallbackLinkProcessing(content);
    }

    return renderingManager.renderWikiLinks(content);
  }

  /**
   * Fallback link processing if RenderingManager is not available
   * @param {string} content - Content with wiki links
   * @returns {string} - Content with processed links
   */
  fallbackLinkProcessing(content) {
    const pageManager = this.getManager('PageManager');
    if (!pageManager) {
      return content;
    }

    try {
      // Get list of existing pages
      const pages = pageManager.getPageNames ? pageManager.getPageNames() : [];
      const pageNames = Array.isArray(pages) ? pages : [];
      
      // Process wiki-style links [PageName] and [Display Text|PageName|Parameters]
      return content.replace(/\[([a-zA-Z0-9\s_-]+)(?:\|([a-zA-Z0-9\s_\-\/ .:?=&]+))?(?:\|([^|\]]+))?\]/g, 
        (match, displayText, target, params) => {
          // Parse parameters if provided
          let linkAttributes = '';
          if (params) {
            const targetMatch = params.match(/target=['"]([^'"]+)['"]/);
            if (targetMatch) {
              linkAttributes += ` target="${targetMatch[1]}"`;
              if (targetMatch[1] === '_blank') {
                linkAttributes += ' rel="noopener noreferrer"';
              }
            }
            
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
              return `<a href="/wiki/${encodeURIComponent(pageName)}"${linkAttributes}>${pageName}</a>`;
            } else {
              return `<a href="/edit/${encodeURIComponent(pageName)}" style="color: red;"${linkAttributes}>${pageName}</a>`;
            }
          }
          
          // Handle pipe syntax [DisplayText|Target|Parameters]
          if (target.includes('://') || target.startsWith('/')) {
            return `<a href="${target}"${linkAttributes}>${displayText}</a>`;
          } else if (target.toLowerCase() === 'search') {
            return `<a href="/search"${linkAttributes}>${displayText}</a>`;
          } else {
            if (pageNames.includes(target)) {
              return `<a href="/wiki/${encodeURIComponent(target)}"${linkAttributes}>${displayText}</a>`;
            } else {
              return `<a href="/edit/${encodeURIComponent(target)}" style="color: red;"${linkAttributes}>${displayText}</a>`;
            }
          }
        }
      );
    } catch (error) {
      console.error('Error in fallback link processing:', error);
      return content;
    }
  }

  /**
   * Convert processed markdown to HTML
   * @param {string} content - Processed markdown content
   * @returns {string} - HTML content
   */
  async convertMarkdownToHtml(content) {
    // Use the same showdown converter as the original
    const showdown = require('showdown');
    const converter = new showdown.Converter();
    return converter.makeHtml(content);
  }

  /**
   * Get processing performance summary
   * @returns {Object} - Performance metrics
   */
  getPerformanceSummary() {
    return {
      totalTime: this.phaseTimings.get('total') || 0,
      variableTime: this.phaseTimings.get('variables') || 0,
      pluginTime: this.phaseTimings.get('plugins') || 0,
      linkTime: this.phaseTimings.get('links') || 0,
      markdownTime: this.phaseTimings.get('markdown') || 0,
      pageName: this.pageName,
      contentLength: this.content.length
    };
  }

  /**
   * Set variable value
   * @param {string} name - Variable name
   * @param {any} value - Variable value
   */
  setVariable(name, value) {
    this.variables.set(name, value);
  }

  /**
   * Get variable value
   * @param {string} name - Variable name
   * @param {any} defaultValue - Default value if not found
   * @returns {any} - Variable value
   */
  getVariable(name, defaultValue = null) {
    return this.variables.get(name) || defaultValue;
  }

  /**
   * Set metadata value
   * @param {string} key - Metadata key
   * @param {any} value - Metadata value
   */
  setMetadata(key, value) {
    this.metadata[key] = value;
  }

  /**
   * Get metadata value
   * @param {string} key - Metadata key
   * @param {any} defaultValue - Default value if not found
   * @returns {any} - Metadata value
   */
  getMetadata(key, defaultValue = null) {
    return this.metadata[key] || defaultValue;
  }

  /**
   * Clone context for sub-processing
   * @param {Object} overrides - Properties to override
   * @returns {WikiContext} - New context instance
   */
  clone(overrides = {}) {
    const newContext = new WikiContext(this.engine, {
      pageName: this.pageName,
      content: this.content,
      userContext: this.userContext,
      requestInfo: this.requestInfo,
      linkGraph: this.linkGraph,
      ...overrides
    });

    // Copy current state
    newContext.variables = new Map(this.variables);
    newContext.metadata = { ...this.metadata };

    return newContext;
  }

  /**
   * Get context summary for logging
   * @returns {Object} - Context summary
   */
  getSummary() {
    return {
      pageName: this.pageName,
      userContext: this.userContext ? {
        isAuthenticated: this.userContext.isAuthenticated,
        roles: this.userContext.roles || []
      } : null,
      contentLength: this.content.length,
      variableCount: this.variables.size,
      performance: this.getPerformanceSummary()
    };
  }
}

module.exports = WikiContext;