const { BaseSyntaxHandler } = require('./BaseSyntaxHandler');

/**
 * WikiLinkHandler - Internal wiki link processing (CRITICAL for basic functionality)
 * 
 * Supports JSPWiki/amdWiki link syntax:
 * - [PageName] - Simple internal links
 * - [DisplayText|TargetPage] - Links with custom display text
 * - [DisplayText|TargetPage|target=_blank] - Links with parameters
 * 
 * This handler is ESSENTIAL for basic wiki functionality and was missing from our MarkupParser,
 * causing link processing failures on page load.
 */
class WikiLinkHandler extends BaseSyntaxHandler {
  constructor(engine = null) {
    super(
      /\[([a-zA-Z0-9_\- ]+)(?:\|([a-zA-Z0-9_\-\/ .:?=&]+))?(?:\|([^|\]]+))?\]/g, // Wiki link pattern
      50, // Lower priority - process after other handlers but before markdown
      {
        description: 'Internal wiki link processor (essential for basic wiki functionality)',
        version: '1.0.0',
        dependencies: ['PageManager'],
        timeout: 3000,
        cacheEnabled: true
      }
    );
    this.handlerId = 'WikiLinkHandler';
    this.engine = engine;
    this.config = null;
    this.cachedPageNames = [];
  }

  /**
   * Initialize handler
   * @param {Object} context - Initialization context
   */
  async onInitialize(context) {
    this.engine = context.engine;
    
    // Load page names for link validation
    await this.loadPageNames();
    
    console.log(`🔗 WikiLinkHandler initialized with ${this.cachedPageNames.length} known pages`);
  }

  /**
   * Load page names for link processing
   */
  async loadPageNames() {
    try {
      const pageManager = this.engine?.getManager('PageManager');
      if (pageManager) {
        const pages = await pageManager.getAllPages();
        this.cachedPageNames = pages.map(page => page.name);
      }
    } catch (error) {
      console.warn('⚠️  Could not load page names for WikiLinkHandler:', error.message);
    }
  }

  /**
   * Process content by converting wiki links to HTML
   * @param {string} content - Content to process
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Content with wiki links converted
   */
  async process(content, context) {
    if (!content) {
      return content;
    }

    const matches = [];
    let match;
    
    // Reset regex state
    this.pattern.lastIndex = 0;
    
    while ((match = this.pattern.exec(content)) !== null) {
      matches.push({
        fullMatch: match[0],
        displayText: match[1],
        target: match[2] || null,
        parameters: match[3] || null,
        index: match.index,
        length: match[0].length
      });
    }

    // Process matches in reverse order to maintain string positions
    let processedContent = content;
    
    for (let i = matches.length - 1; i >= 0; i--) {
      const matchInfo = matches[i];
      
      try {
        const replacement = await this.handle(matchInfo, context);
        
        processedContent = 
          processedContent.slice(0, matchInfo.index) +
          replacement +
          processedContent.slice(matchInfo.index + matchInfo.length);
          
      } catch (error) {
        console.error(`❌ Wiki link processing error:`, error.message);
        // Leave original link on error
      }
    }

    return processedContent;
  }

  /**
   * Handle a specific wiki link match
   * @param {Object} matchInfo - Wiki link match information
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - HTML link
   */
  async handle(matchInfo, context) {
    const { displayText, target, parameters } = matchInfo;
    
    // Determine target page (use target if provided, otherwise displayText)
    const targetPage = target || displayText;
    const linkText = displayText;
    
    // Parse parameters if provided
    let linkAttributes = '';
    if (parameters) {
      linkAttributes = this.parseParameters(parameters);
    }
    
    // Check if target page exists (default to normal links if page list unavailable)
    const pageExists = this.cachedPageNames.length > 0 ? this.cachedPageNames.includes(targetPage) : true;
    
    if (pageExists || this.cachedPageNames.length === 0) {
      // Create link to existing page (or assume exists if page list unavailable)
      const encodedTarget = encodeURIComponent(targetPage);
      return `<a href="/wiki/${encodedTarget}"${linkAttributes}>${this.escapeHtml(linkText)}</a>`;
    } else {
      // Create red link for non-existent page
      const encodedTarget = encodeURIComponent(targetPage);
      return `<a href="/edit/${encodedTarget}" class="red-link" title="Create page: ${this.escapeHtml(targetPage)}"${linkAttributes}>${this.escapeHtml(linkText)}</a>`;
    }
  }

  /**
   * Parse link parameters
   * @param {string} paramString - Parameter string
   * @returns {string} - HTML attributes
   */
  parseParameters(paramString) {
    let attributes = '';
    
    // Parse target attribute
    const targetMatch = paramString.match(/target=['"]([^'"]+)['"]/);
    if (targetMatch) {
      attributes += ` target="${targetMatch[1]}"`;
      if (targetMatch[1] === '_blank') {
        attributes += ' rel="noopener noreferrer"';
      }
    }
    
    // Parse class attribute
    const classMatch = paramString.match(/class=['"]([^'"]+)['"]/);
    if (classMatch) {
      attributes += ` class="${classMatch[1]}"`;
    }
    
    // Parse title attribute
    const titleMatch = paramString.match(/title=['"]([^'"]+)['"]/);
    if (titleMatch) {
      attributes += ` title="${titleMatch[1]}"`;
    }
    
    return attributes;
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} - Escaped text
   */
  escapeHtml(text) {
    if (typeof text !== 'string') {
      return text;
    }
    
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Get handler information
   * @returns {Object} - Handler information
   */
  getInfo() {
    return {
      ...super.getMetadata(),
      features: [
        'Internal wiki link processing',
        'Red link creation for non-existent pages',
        'Link parameter parsing',
        'Page existence validation',
        'XSS prevention',
        'Essential for basic wiki functionality'
      ],
      supportedPatterns: [
        '[PageName]',
        '[Display Text|TargetPage]',
        '[Display Text|TargetPage|target=_blank]',
        '[Display Text|TargetPage|class=special]'
      ]
    };
  }
}

module.exports = WikiLinkHandler;
