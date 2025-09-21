const { BaseSyntaxHandler } = require('./BaseSyntaxHandler');
const fs = require('fs').promises;
const path = require('path');

/**
 * InterWikiLinkHandler - External wiki linking support
 * 
 * Supports JSPWiki InterWiki syntax:
 * - [Wikipedia:Article] - Simple InterWiki link
 * - [Wikipedia:Article|Custom Display Text] - InterWiki with custom text
 * - [MeatBall:WikiWikiWeb] - Multiple InterWiki sites
 * 
 * Related Issue: #61 - InterWiki Link Handler
 * Epic: #41 - Implement JSPWikiMarkupParser for Complete Enhancement Support
 */
class InterWikiLinkHandler extends BaseSyntaxHandler {
  constructor(engine = null) {
    super(
      /\[([A-Za-z0-9]+):([^|\]]+)(?:\|([^\]]+))?\]/g, // Pattern: [WikiName:PageName|DisplayText]
      80, // Medium priority - process after most syntax handlers
      {
        description: 'JSPWiki-style InterWiki link handler for external wiki linking',
        version: '1.0.0',
        dependencies: ['ConfigurationManager'],
        timeout: 3000,
        cacheEnabled: true
      }
    );
    this.handlerId = 'InterWikiLinkHandler';
    this.engine = engine;
    this.config = null;
    this.interWikiSites = new Map();
    this.interWikiConfig = null;
  }

  /**
   * Initialize handler with configuration and InterWiki sites
   * @param {Object} context - Initialization context
   */
  async onInitialize(context) {
    this.engine = context.engine;
    
    // Load handler-specific configuration
    const markupParser = context.engine?.getManager('MarkupParser');
    if (markupParser) {
      this.config = markupParser.getHandlerConfig('interwiki');
      
      if (this.config.priority && this.config.priority !== this.priority) {
        this.priority = this.config.priority;
        console.log(`🔧 InterWikiLinkHandler priority set to ${this.priority} from configuration`);
      }
    }

    // Load InterWiki site definitions
    await this.loadInterWikiSites();
  }

  /**
   * Load InterWiki site definitions from configuration
   */
  async loadInterWikiSites() {
    try {
      // Try to load from config/interwiki.json first
      const interWikiPath = path.join(process.cwd(), 'config', 'interwiki.json');
      
      try {
        const configContent = await fs.readFile(interWikiPath, 'utf8');
        this.interWikiConfig = JSON.parse(configContent);
        
        // Load sites from dedicated config file
        if (this.interWikiConfig.interwiki) {
          for (const [siteName, siteConfig] of Object.entries(this.interWikiConfig.interwiki)) {
            if (siteConfig.enabled !== false) {
              this.interWikiSites.set(siteName, siteConfig);
            }
          }
        }
        
        console.log(`🌐 Loaded ${this.interWikiSites.size} InterWiki sites from config/interwiki.json`);
        
      } catch (fileError) {
        // Fall back to loading from main configuration
        await this.loadFromMainConfiguration();
      }
      
    } catch (error) {
      console.warn('⚠️  Failed to load InterWiki configuration:', error.message);
      // Load default sites
      this.loadDefaultSites();
    }
  }

  /**
   * Load InterWiki sites from main configuration
   */
  async loadFromMainConfiguration() {
    const configManager = this.engine?.getManager('ConfigurationManager');
    if (!configManager) {
      this.loadDefaultSites();
      return;
    }

    // Load from app-default-config.json format
    const sites = {
      'Wikipedia': configManager.getProperty('amdwiki.interwiki.sites.Wikipedia'),
      'JSPWiki': configManager.getProperty('amdwiki.interwiki.sites.JSPWiki'),
      'MeatBall': configManager.getProperty('amdwiki.interwiki.sites.MeatBall'),
      'C2': configManager.getProperty('amdwiki.interwiki.sites.C2')
    };

    for (const [siteName, url] of Object.entries(sites)) {
      if (url) {
        this.interWikiSites.set(siteName, {
          url: url,
          description: `${siteName} Wiki`,
          enabled: true,
          openInNewWindow: configManager.getProperty('amdwiki.interwiki.openInNewWindow', true)
        });
      }
    }

    console.log(`🌐 Loaded ${this.interWikiSites.size} InterWiki sites from main configuration`);
  }

  /**
   * Load default InterWiki sites
   */
  loadDefaultSites() {
    const defaultSites = {
      'Wikipedia': {
        url: 'https://en.wikipedia.org/wiki/%s',
        description: 'Wikipedia, the free encyclopedia',
        enabled: true,
        openInNewWindow: true
      },
      'JSPWiki': {
        url: 'https://jspwiki-wiki.apache.org/Wiki.jsp?page=%s',
        description: 'Apache JSPWiki Documentation',
        enabled: true,
        openInNewWindow: true
      },
      'MeatBall': {
        url: 'http://www.usemod.com/cgi-bin/mb.pl?%s',
        description: 'MeatBall Wiki',
        enabled: true,
        openInNewWindow: true
      }
    };

    for (const [siteName, siteConfig] of Object.entries(defaultSites)) {
      this.interWikiSites.set(siteName, siteConfig);
    }

    console.log(`🌐 Loaded ${this.interWikiSites.size} default InterWiki sites`);
  }

  /**
   * Process content by finding and converting InterWiki links
   * @param {string} content - Content to process
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Content with InterWiki links processed
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
        wikiName: match[1],
        pageName: match[2],
        displayText: match[3] || null, // Custom display text
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
        console.error(`❌ InterWiki link error for ${matchInfo.wikiName}:${matchInfo.pageName}:`, error.message);
        
        // Leave original link on error
        const errorPlaceholder = `<!-- InterWiki Error: ${matchInfo.wikiName} - ${error.message} -->`;
        processedContent = 
          processedContent.slice(0, matchInfo.index) +
          errorPlaceholder +
          processedContent.slice(matchInfo.index + matchInfo.length);
      }
    }

    return processedContent;
  }

  /**
   * Handle a specific InterWiki link match
   * @param {Object} matchInfo - InterWiki link match information
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - InterWiki link HTML
   */
  async handle(matchInfo, context) {
    const { wikiName, pageName, displayText } = matchInfo;
    
    // Check cache for link result if caching enabled
    let cachedResult = null;
    const contentHash = this.generateContentHash(matchInfo.fullMatch);
    const contextHash = this.generateContextHash(context);
    
    if (this.options.cacheEnabled) {
      const markupParser = this.engine?.getManager('MarkupParser');
      if (markupParser) {
        cachedResult = await markupParser.getCachedHandlerResult(this.handlerId, contentHash, contextHash);
        if (cachedResult) {
          return cachedResult;
        }
      }
    }

    // Find the InterWiki site configuration
    const siteConfig = this.findInterWikiSite(wikiName);
    if (!siteConfig) {
      throw new Error(`Unknown InterWiki site: ${wikiName}`);
    }

    // Generate the external URL
    const externalUrl = this.generateInterWikiUrl(siteConfig.url, pageName);
    
    // Validate URL security
    if (!this.isUrlSafe(externalUrl)) {
      throw new Error(`Unsafe InterWiki URL generated: ${externalUrl}`);
    }

    // Generate link HTML
    const linkHtml = this.generateLinkHtml(externalUrl, displayText || `${wikiName}:${pageName}`, siteConfig, wikiName);
    
    // Cache the result if caching enabled
    if (this.options.cacheEnabled && linkHtml) {
      const markupParser = this.engine?.getManager('MarkupParser');
      if (markupParser) {
        await markupParser.cacheHandlerResult(this.handlerId, contentHash, contextHash, linkHtml);
      }
    }
    
    return linkHtml;
  }

  /**
   * Find InterWiki site configuration (case-insensitive)
   * @param {string} wikiName - Wiki site name
   * @returns {Object|null} - Site configuration or null
   */
  findInterWikiSite(wikiName) {
    // Try exact match first
    if (this.interWikiSites.has(wikiName)) {
      return this.interWikiSites.get(wikiName);
    }

    // Try case-insensitive match
    const lowerWikiName = wikiName.toLowerCase();
    for (const [siteName, siteConfig] of this.interWikiSites) {
      if (siteName.toLowerCase() === lowerWikiName) {
        return siteConfig;
      }
    }

    return null;
  }

  /**
   * Generate InterWiki URL from template
   * @param {string} urlTemplate - URL template with %s placeholder
   * @param {string} pageName - Page name to substitute
   * @returns {string} - Generated URL
   */
  generateInterWikiUrl(urlTemplate, pageName) {
    // URL encode the page name
    const encodedPageName = encodeURIComponent(pageName);
    
    // Replace %s placeholder with encoded page name
    return urlTemplate.replace(/%s/g, encodedPageName);
  }

  /**
   * Validate URL safety to prevent injection attacks
   * @param {string} url - URL to validate
   * @returns {boolean} - True if URL is safe
   */
  isUrlSafe(url) {
    try {
      const urlObj = new URL(url);
      
      // Allow only http and https protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return false;
      }
      
      // Basic domain validation (prevent suspicious patterns)
      if (urlObj.hostname.includes('..') || urlObj.hostname.includes('localhost')) {
        return false;
      }
      
      return true;
      
    } catch (error) {
      return false; // Invalid URL format
    }
  }

  /**
   * Generate link HTML with appropriate attributes
   * @param {string} url - External URL
   * @param {string} displayText - Link display text
   * @param {Object} siteConfig - Site configuration
   * @param {string} wikiName - Wiki site name
   * @returns {string} - Link HTML
   */
  generateLinkHtml(url, displayText, siteConfig, wikiName) {
    const openInNewWindow = siteConfig.openInNewWindow !== false;
    const showIcon = this.interWikiConfig?.options?.addIconIndicator !== false;
    
    let linkHtml = `<a href="${this.escapeHtml(url)}" class="interwiki-link interwiki-${wikiName.toLowerCase()}"`;
    
    // Add target and rel attributes for external links
    if (openInNewWindow) {
      linkHtml += ` target="_blank" rel="noopener noreferrer"`;
    }
    
    // Add title attribute
    if (siteConfig.description) {
      linkHtml += ` title="${this.escapeHtml(siteConfig.description)}: ${this.escapeHtml(displayText)}"`;
    }
    
    linkHtml += `>`;
    
    // Add icon if configured
    if (showIcon && siteConfig.icon) {
      linkHtml += `<img src="/icons/${siteConfig.icon}" alt="${this.escapeHtml(wikiName)}" class="interwiki-icon"> `;
    }
    
    linkHtml += this.escapeHtml(displayText);
    linkHtml += `</a>`;
    
    return linkHtml;
  }

  /**
   * Generate content hash for caching
   * @param {string} content - Content to hash
   * @returns {string} - Content hash
   */
  generateContentHash(content) {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(content).digest('hex');
  }

  /**
   * Generate context hash for caching
   * @param {ParseContext} context - Parse context
   * @returns {string} - Context hash
   */
  generateContextHash(context) {
    const crypto = require('crypto');
    const contextData = {
      pageName: context.pageName,
      userName: context.userName,
      // InterWiki links are generally context-independent, so minimal hash
      timeBucket: Math.floor(Date.now() / 3600000) // 1-hour buckets
    };
    
    return crypto.createHash('md5').update(JSON.stringify(contextData)).digest('hex');
  }

  /**
   * Escape HTML characters to prevent XSS
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
   * Get available InterWiki sites
   * @returns {Array<Object>} - Array of available sites
   */
  getAvailableSites() {
    return Array.from(this.interWikiSites.entries()).map(([name, config]) => ({
      name,
      url: config.url,
      description: config.description,
      enabled: config.enabled !== false
    }));
  }

  /**
   * Add new InterWiki site (for dynamic configuration)
   * @param {string} name - Site name
   * @param {Object} config - Site configuration
   * @returns {boolean} - True if added successfully
   */
  addInterWikiSite(name, config) {
    if (!name || !config.url) {
      return false;
    }

    // Validate URL template
    if (!config.url.includes('%s')) {
      console.warn(`⚠️  InterWiki site ${name} URL should contain %s placeholder`);
    }

    // Validate URL safety
    const testUrl = this.generateInterWikiUrl(config.url, 'Test');
    if (!this.isUrlSafe(testUrl)) {
      console.warn(`⚠️  InterWiki site ${name} generates unsafe URLs`);
      return false;
    }

    this.interWikiSites.set(name, {
      url: config.url,
      description: config.description || `${name} Wiki`,
      enabled: config.enabled !== false,
      openInNewWindow: config.openInNewWindow !== false,
      icon: config.icon || null
    });

    console.log(`🌐 Added InterWiki site: ${name}`);
    return true;
  }

  /**
   * Remove InterWiki site
   * @param {string} name - Site name to remove
   * @returns {boolean} - True if removed successfully
   */
  removeInterWikiSite(name) {
    if (this.interWikiSites.has(name)) {
      this.interWikiSites.delete(name);
      console.log(`🗑️  Removed InterWiki site: ${name}`);
      return true;
    }
    return false;
  }

  /**
   * Reload InterWiki configuration (hot reload support)
   */
  async reloadConfiguration() {
    this.interWikiSites.clear();
    await this.loadInterWikiSites();
  }

  /**
   * Get supported InterWiki patterns
   * @returns {Array<string>} - Array of supported patterns
   */
  getSupportedPatterns() {
    return [
      '[Wikipedia:Article]',
      '[Wikipedia:Article|Custom Display Text]',
      '[JSPWiki:PluginDevelopment]',
      '[MeatBall:WikiWikiWeb]',
      '[C2:ExtremeProgramming|XP on C2]'
    ];
  }

  /**
   * Get handler information for debugging and documentation
   * @returns {Object} - Handler information
   */
  getInfo() {
    return {
      ...super.getMetadata(),
      supportedPatterns: this.getSupportedPatterns(),
      availableSites: this.getAvailableSites(),
      features: [
        'External wiki linking',
        'Case-insensitive wiki names',
        'Custom display text support',
        'URL encoding and validation',
        'Security protection (protocol validation)',
        'Configurable site definitions',
        'Icon support for visual indicators',
        'New window/tab control',
        'Hot-reload configuration',
        'Performance caching'
      ],
      configuration: {
        sitesLoaded: this.interWikiSites.size,
        configSource: this.interWikiConfig ? 'config/interwiki.json' : 'main configuration',
        cacheEnabled: this.options.cacheEnabled
      }
    };
  }
}

module.exports = InterWikiLinkHandler;
