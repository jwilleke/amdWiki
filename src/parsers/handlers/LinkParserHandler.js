const { BaseSyntaxHandler } = require('./BaseSyntaxHandler');
const { LinkParser } = require('../LinkParser');

/**
 * LinkParserHandler - Unified link processing handler using LinkParser
 *
 * This handler integrates the comprehensive LinkParser into the MarkupParser
 * handler architecture, providing centralized processing for all link types:
 * - Internal wiki links: [PageName], [Display|Target]
 * - External links: [Display|http://example.com]
 * - InterWiki links: [Display|Wikipedia:Article]
 * - Email links: [Display|mailto:user@example.com]
 * - Anchor links: [Display|#section]
 * - Links with attributes: [Display|Target|class="custom" target="_blank"]
 *
 * Replaces the fragmented WikiLinkHandler and InterWikiLinkHandler approach
 * with a unified, security-focused, and comprehensive solution.
 *
 * Related Issue: #75 - Create LinkParser.js for centralized link parsing
 * Epic: #41 - Implement JSPWikiMarkupParser for Complete Enhancement Support
 */
class LinkParserHandler extends BaseSyntaxHandler {
  constructor(engine = null) {
    super(
      // Use LinkParser's regex pattern - matches all supported link types
      // Excludes markdown footnote syntax [^id] by using negative lookahead (?!\^)
      /\[(?!\^)([^\|\]]+)(?:\|([^\|\]]+))?(?:\|([^\]]+))?\](?!\()/g,
      60, // Medium-high priority - process links after most syntax but before markdown
      {
        description: 'Unified link processor using centralized LinkParser for all link types',
        version: '1.0.0',
        dependencies: ['PageManager'],
        timeout: 5000,
        cacheEnabled: true
      }
    );

    this.handlerId = 'LinkParserHandler';
    this.engine = engine;
    this.linkParser = new LinkParser();
    this.initialized = false;
  }

  /**
   * Initialize handler with LinkParser configuration
   * @param {Object} context - Initialization context
   */
  async onInitialize(context) {
    try {
      this.engine = context.engine;

      // Initialize LinkParser with page names from PageManager
      await this.initializeLinkParser();

      this.initialized = true;
      console.log(`🔗 LinkParserHandler initialized successfully with centralized link processing`);

    } catch (error) {
      console.error('❌ Failed to initialize LinkParserHandler:', error.message);
      throw error;
    }
  }

  /**
   * Initialize LinkParser with current page names and configuration
   */
  async initializeLinkParser() {
    try {
      // Load page names for link validation
      const pageManager = this.engine?.getManager('PageManager');
      if (pageManager) {
        const pageNames = await pageManager.getAllPages(); // Returns array of strings

        // Get plural matching configuration
        const configManager = this.engine?.getManager('ConfigurationManager');
        const matchEnglishPlurals = configManager ?
          configManager.getProperty('amdwiki.translatorReader.matchEnglishPlurals', true) :
          true;

        this.linkParser.setPageNames(pageNames, matchEnglishPlurals);
        console.log(`📄 LinkParserHandler loaded ${pageNames.length} page names for link validation (plural matching: ${matchEnglishPlurals ? 'enabled' : 'disabled'})`);

        // If no pages were loaded during initialization, schedule a retry
        if (pageNames.length === 0) {
          console.log('⏰ No pages loaded during LinkParserHandler initialization, scheduling retry...');
          setTimeout(() => this.refreshPageNames(), 1000);
        }
      }

      // Load InterWiki sites configuration
      await this.loadInterWikiConfiguration();

      // Log LinkParser statistics
      const stats = this.linkParser.getStats();
      console.log(`📊 LinkParser stats: ${stats.pageNamesCount} pages, ${stats.interWikiSitesCount} InterWiki sites, ${stats.allowedAttributes} allowed attributes`);

    } catch (error) {
      console.warn('⚠️  LinkParser initialization had issues:', error.message);
      // Continue with default configuration
    }
  }

  /**
   * Load InterWiki site configuration for LinkParser
   */
  async loadInterWikiConfiguration() {
    try {
      const cfg = this.engine?.getManager?.('ConfigurationManager');
      const globalEnabled = cfg?.getProperty?.('amdwiki.interwiki.enabled', true);
      if (!globalEnabled) return { enabled: false, sites: {} };

      // Prefer ConfigurationManager (object of siteName -> siteObject)
      const sitesFromCfg = cfg?.getProperty?.('amdwiki.interwiki.sites', null);

      let sites = null;
      if (sitesFromCfg && typeof sitesFromCfg === 'object') {
        sites = sitesFromCfg;
      } else {
        // Fallback to config/interwiki.json if present
        const filePath = path.resolve(process.cwd(), 'config', 'interwiki.json');
        if (await fs.pathExists(filePath)) {
          try {
            const json = await fs.readJson(filePath);
            if (json?.interwiki && typeof json.interwiki === 'object') {
              sites = json.interwiki;
            }
          } catch {
            // ignore
          }
        }
      }

      // Built-in defaults as last resort
      if (!sites) {
        sites = {
          Wikipedia: { url: 'https://en.wikipedia.org/wiki/%s', enabled: true, openInNewWindow: true },
          JSPWiki:   { url: 'https://jspwiki.apache.org/Wiki.jsp?page=%s', enabled: true, openInNewWindow: true }
        };
      }

      // Normalize and filter by per-site enabled flag (default: true)
      const normalized = {};
      for (const [name, def] of Object.entries(sites)) {
        if (!def) continue;
        const obj = typeof def === 'string' ? { url: def } : def;
        if (!obj.url) continue;
        const siteEnabled = obj.enabled !== false; // enabled unless explicitly false
        if (!siteEnabled) continue;
        normalized[name] = {
          url: String(obj.url),
          description: obj.description || '',
          icon: obj.icon || '',
          enabled: true,
          openInNewWindow: obj.openInNewWindow !== false
        };
      }

      this.linkParser.setInterWikiSites(normalized);
      console.log(`🌐 LinkParserHandler loaded ${Object.keys(normalized).length} InterWiki sites from configuration`);

    } catch (error) {
      console.warn('⚠️  Failed to load InterWiki configuration:', error.message);
      this.loadDefaultInterWikiSites();
    }
  }

  /**
   * Load default InterWiki sites
   */
  loadDefaultInterWikiSites() {
    const defaultSites = {
      'Wikipedia': {
        url: 'https://en.wikipedia.org/wiki/%s',
        description: 'Wikipedia English',
        openInNewWindow: true
      },
      'JSPWiki': {
        url: 'https://jspwiki-wiki.apache.org/Wiki.jsp?page=%s',
        description: 'JSPWiki Documentation',
        openInNewWindow: true
      }
    };

    this.linkParser.setInterWikiSites(defaultSites);
    console.log(`🌐 LinkParserHandler loaded ${Object.keys(defaultSites).length} default InterWiki sites`);
  }

  /**
   * Process content using LinkParser
   * @param {string} content - Content to process
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Content with links processed
   */
  async process(content, context) {
    if (!content) {
      return content;
    }

    if (!this.initialized) {
      console.warn('⚠️  LinkParserHandler not initialized, skipping link processing');
      return content;
    }

    try {
      // Use LinkParser for comprehensive link processing
      const processedContent = this.linkParser.parseLinks(content, {
        pageName: context.pageName || 'unknown',
        engine: this.engine,
        userContext: context.userContext || null
      });

      // Update statistics
      this.stats.processCount++;
      this.stats.totalProcessingTime += Date.now() - (context.startTime || Date.now());

      return processedContent;

    } catch (error) {
      console.error(`❌ LinkParserHandler processing error:`, error.message);

      // Update error statistics
      this.stats.errorCount++;

      // Return original content on error (fail-safe behavior)
      return content;
    }
  }

  /**
   * Handle method - not used since we override process() entirely
   * @param {Object} match - Match information
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Processed match
   */
  async handle(match, context) {
    // This method is not used since LinkParser handles all matches in process()
    // But we need to implement it to satisfy the BaseSyntaxHandler interface
    throw new Error('LinkParserHandler uses process() method directly, handle() should not be called');
  }

  /**
   * Refresh page names cache (called when pages are added/removed)
   */
  async refreshPageNames() {
    if (!this.initialized) {
      return;
    }

    try {
      const pageManager = this.engine?.getManager('PageManager');
      if (pageManager) {
        const pageNames = await pageManager.getAllPages(); // Returns array of strings
        this.linkParser.setPageNames(pageNames);
        console.log(`🔄 LinkParserHandler refreshed ${pageNames.length} page names`);

        // Debug: log some page names to see what we actually have
        const testPages = ['PageIndex', 'SystemInfo', 'Everything We Know About You', 'Wiki Documentation'];
        console.log('🔍 Debug - checking for specific pages:');
        testPages.forEach(testPage => {
          const exists = pageNames.includes(testPage);
          console.log(`   ${testPage}: ${exists ? '✓ found' : '✗ not found'}`);
        });

        // Show first few page names for debugging
        console.log(`📝 First 10 page names: ${pageNames.slice(0, 10).join(', ')}`);
      }
    } catch (error) {
      console.warn('⚠️  Failed to refresh page names:', error.message);
    }
  }

  /**
   * Get handler information including LinkParser statistics
   * @returns {Object} - Handler information
   */
  getInfo() {
    const baseInfo = super.getMetadata();
    const linkParserStats = this.linkParser ? this.linkParser.getStats() : {};

    return {
      ...baseInfo,
      features: [
        'Unified link processing for all link types',
        'Internal wiki links with red link support',
        'External link processing with security features',
        'InterWiki link support with configurable sites',
        'Email and anchor link processing',
        'Link attribute parsing and validation',
        'XSS prevention and security filtering',
        'Centralized and maintainable architecture'
      ],
      supportedPatterns: [
        '[PageName]',
        '[Display Text|TargetPage]',
        '[Display Text|http://example.com]',
        '[Display Text|Wikipedia:Article]',
        '[Display Text|mailto:user@example.com]',
        '[Display Text|#section]',
        '[Display Text|Target|class="custom" target="_blank"]'
      ],
      linkParserStats: linkParserStats,
      initialized: this.initialized
    };
  }

  /**
   * Handler-specific shutdown cleanup
   */
  async onShutdown() {
    this.initialized = false;
    console.log('🔗 LinkParserHandler shutdown complete');
  }
}

module.exports = LinkParserHandler;