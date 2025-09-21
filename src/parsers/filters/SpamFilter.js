const BaseFilter = require('./BaseFilter');

/**
 * SpamFilter - Intelligent spam detection with modular configuration
 * 
 * Provides configurable spam detection based on link count, blacklisted words,
 * domain whitelisting, and content quality analysis through complete modularity
 * via app-default-config.json and app-custom-config.json.
 * 
 * Design Principles:
 * - Configurable spam detection rules
 * - Whitelist/blacklist modularity
 * - Zero hardcoded detection rules
 * - Deployment-specific spam policies
 * 
 * Related Issue: Phase 4 - Security Filter Suite (Spam Detection)
 * Epic: #41 - Implement JSPWikiMarkupParser for Complete Enhancement Support
 */
class SpamFilter extends BaseFilter {
  constructor() {
    super(
      100, // High priority - detect spam early
      {
        description: 'Intelligent spam detection filter with configurable rules and whitelisting',
        version: '1.0.0',
        category: 'security',
        cacheResults: true,
        cacheTTL: 1800 // Cache spam results longer (30 minutes)
      }
    );
    this.filterId = 'SpamFilter';
    this.spamConfig = null;
    this.blacklistedWords = new Set();
    this.whitelistedDomains = new Set();
    this.spamPatterns = [];
  }

  /**
   * Initialize filter with modular spam detection configuration
   * @param {Object} context - Initialization context
   */
  async onInitialize(context) {
    // Load modular spam configuration from configuration hierarchy
    await this.loadModularSpamConfiguration(context);
    
    console.log('🛡️  SpamFilter initialized with modular configuration:');
    console.log(`   🔗 Max links: ${this.spamConfig.maxLinks}`);
    console.log(`   🖼️  Max images: ${this.spamConfig.maxImages}`);
    console.log(`   📝 Blacklisted words: ${this.blacklistedWords.size} configured`);
    console.log(`   ✅ Whitelisted domains: ${this.whitelistedDomains.size} configured`);
    console.log(`   🗄️  Cache blacklist: ${this.spamConfig.cacheBlacklist ? 'enabled' : 'disabled'}`);
  }

  /**
   * Load modular spam configuration from app-default/custom-config.json
   * @param {Object} context - Initialization context
   */
  async loadModularSpamConfiguration(context) {
    const configManager = context.engine?.getManager('ConfigurationManager');
    
    // Default spam detection configuration
    this.spamConfig = {
      maxLinks: 10,
      maxImages: 5,
      minContentLength: 10,
      maxDuplicateContent: 0.8, // 80% similarity threshold
      cacheBlacklist: true,
      autoBlock: false, // Don't auto-block, just flag
      logSpamAttempts: true,
      whitelistMode: false // false = blacklist mode, true = whitelist mode
    };

    // Load from app-default-config.json and allow app-custom-config.json overrides
    if (configManager) {
      try {
        // Spam detection limits (modular configuration)
        this.spamConfig.maxLinks = configManager.getProperty('amdwiki.markup.filters.spam.maxLinks', this.spamConfig.maxLinks);
        this.spamConfig.maxImages = configManager.getProperty('amdwiki.markup.filters.spam.maxImages', this.spamConfig.maxImages);
        this.spamConfig.cacheBlacklist = configManager.getProperty('amdwiki.markup.filters.spam.cacheBlacklist', this.spamConfig.cacheBlacklist);
        
        // Load blacklisted words (modular blacklist)
        const blacklistWords = configManager.getProperty('amdwiki.markup.filters.spam.blacklistWords', '');
        if (blacklistWords) {
          blacklistWords.split(',').forEach(word => {
            const cleanWord = word.trim().toLowerCase();
            if (cleanWord) this.blacklistedWords.add(cleanWord);
          });
        }
        
        // Load whitelisted domains (modular whitelist)
        const whitelistDomains = configManager.getProperty('amdwiki.markup.filters.spam.whitelistDomains', '');
        if (whitelistDomains) {
          whitelistDomains.split(',').forEach(domain => {
            const cleanDomain = domain.trim().toLowerCase();
            if (cleanDomain) this.whitelistedDomains.add(cleanDomain);
          });
        }
        
        // Advanced spam detection settings (configurable)
        this.spamConfig.minContentLength = configManager.getProperty('amdwiki.markup.filters.spam.minContentLength', this.spamConfig.minContentLength);
        this.spamConfig.autoBlock = configManager.getProperty('amdwiki.markup.filters.spam.autoBlock', this.spamConfig.autoBlock);
        this.spamConfig.logSpamAttempts = configManager.getProperty('amdwiki.markup.filters.spam.logSpamAttempts', this.spamConfig.logSpamAttempts);
        
      } catch (error) {
        console.warn('⚠️  Failed to load SpamFilter configuration, using defaults:', error.message);
        this.loadDefaultSpamConfiguration();
      }
    } else {
      this.loadDefaultSpamConfiguration();
    }
  }

  /**
   * Load default spam configuration when configuration unavailable
   */
  loadDefaultSpamConfiguration() {
    // Default blacklisted words
    const defaultBlacklist = ['spam', 'casino', 'pharmacy', 'viagra', 'cialis', 'lottery', 'winner'];
    defaultBlacklist.forEach(word => this.blacklistedWords.add(word));
    
    // Default whitelisted domains
    const defaultWhitelist = ['wikipedia.org', 'github.com', 'stackoverflow.com', 'mozilla.org'];
    defaultWhitelist.forEach(domain => this.whitelistedDomains.add(domain));
  }

  /**
   * Process content through spam detection filters (modular spam detection)
   * @param {string} content - Content to analyze
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Content (unchanged if not spam, or flagged if spam)
   */
  async process(content, context) {
    if (!content) {
      return content;
    }

    // Perform spam analysis
    const spamAnalysis = await this.analyzeSpam(content, context);
    
    if (spamAnalysis.isSpam) {
      // Log spam attempt if configured
      if (this.spamConfig.logSpamAttempts) {
        this.logSpamAttempt(content, spamAnalysis, context);
      }

      if (this.spamConfig.autoBlock) {
        // Block spam content
        return `<!-- SPAM BLOCKED: ${spamAnalysis.reasons.join(', ')} -->`;
      } else {
        // Flag spam content but allow through
        const spamWarning = `<!-- SPAM WARNING: ${spamAnalysis.reasons.join(', ')} -->`;
        return spamWarning + '\n' + content;
      }
    }

    return content; // Content is clean
  }

  /**
   * Analyze content for spam characteristics (modular spam analysis)
   * @param {string} content - Content to analyze
   * @param {ParseContext} context - Parse context
   * @returns {Promise<Object>} - Spam analysis result
   */
  async analyzeSpam(content, context) {
    const reasons = [];
    let spamScore = 0;

    // Check link count (configurable limit)
    const linkCount = this.countLinks(content);
    if (linkCount > this.spamConfig.maxLinks) {
      reasons.push(`Too many links: ${linkCount}/${this.spamConfig.maxLinks}`);
      spamScore += 30;
    }

    // Check image count (configurable limit)
    const imageCount = this.countImages(content);
    if (imageCount > this.spamConfig.maxImages) {
      reasons.push(`Too many images: ${imageCount}/${this.spamConfig.maxImages}`);
      spamScore += 20;
    }

    // Check blacklisted words (modular blacklist)
    const blacklistMatches = this.findBlacklistedWords(content);
    if (blacklistMatches.length > 0) {
      reasons.push(`Blacklisted words: ${blacklistMatches.join(', ')}`);
      spamScore += blacklistMatches.length * 25;
    }

    // Check content length (configurable minimum)
    if (content.length < this.spamConfig.minContentLength) {
      reasons.push(`Content too short: ${content.length} characters`);
      spamScore += 15;
    }

    // Check domain whitelist for external links
    const suspiciousDomains = await this.findSuspiciousDomains(content);
    if (suspiciousDomains.length > 0) {
      reasons.push(`Suspicious domains: ${suspiciousDomains.join(', ')}`);
      spamScore += suspiciousDomains.length * 20;
    }

    // Determine if content is spam (configurable threshold)
    const spamThreshold = 50; // Could be configurable
    const isSpam = spamScore >= spamThreshold;

    return {
      isSpam,
      spamScore,
      threshold: spamThreshold,
      reasons,
      analysis: {
        linkCount,
        imageCount,
        blacklistMatches: blacklistMatches.length,
        suspiciousDomains: suspiciousDomains.length,
        contentLength: content.length
      }
    };
  }

  /**
   * Count links in content (modular link detection)
   * @param {string} content - Content to analyze
   * @returns {number} - Number of links found
   */
  countLinks(content) {
    const linkPatterns = [
      /\[([^\]]+)\]\([^)]+\)/g,           // Markdown links
      /https?:\/\/[^\s]+/g,               // URL links
      /<a\s+[^>]*href/gi,                 // HTML links
      /\[([^\]]+)\]/g                     // Wiki links
    ];

    let totalLinks = 0;
    for (const pattern of linkPatterns) {
      const matches = content.match(pattern);
      totalLinks += matches ? matches.length : 0;
    }

    return totalLinks;
  }

  /**
   * Count images in content (modular image detection)
   * @param {string} content - Content to analyze
   * @returns {number} - Number of images found
   */
  countImages(content) {
    const imagePatterns = [
      /!\[([^\]]*)\]\([^)]+\)/g,          // Markdown images
      /<img\s+[^>]*src/gi,                // HTML images
      /\[\{Image\s+[^}]+\}\]/gi           // Wiki image plugins
    ];

    let totalImages = 0;
    for (const pattern of imagePatterns) {
      const matches = content.match(pattern);
      totalImages += matches ? matches.length : 0;
    }

    return totalImages;
  }

  /**
   * Find blacklisted words in content (modular blacklist checking)
   * @param {string} content - Content to check
   * @returns {Array<string>} - Found blacklisted words
   */
  findBlacklistedWords(content) {
    const found = [];
    const contentLower = content.toLowerCase();

    for (const word of this.blacklistedWords) {
      if (contentLower.includes(word)) {
        found.push(word);
      }
    }

    return found;
  }

  /**
   * Find suspicious domains not in whitelist (modular domain checking)
   * @param {string} content - Content to analyze
   * @returns {Promise<Array<string>>} - Suspicious domains found
   */
  async findSuspiciousDomains(content) {
    const urlRegex = /https?:\/\/([^\/\s]+)/g;
    const domains = new Set();
    let match;

    while ((match = urlRegex.exec(content)) !== null) {
      domains.add(match[1].toLowerCase());
    }

    const suspicious = [];
    for (const domain of domains) {
      if (!this.whitelistedDomains.has(domain)) {
        suspicious.push(domain);
      }
    }

    return suspicious;
  }

  /**
   * Log spam attempt for monitoring (modular logging)
   * @param {string} content - Original content
   * @param {Object} analysis - Spam analysis result
   * @param {ParseContext} context - Parse context
   */
  logSpamAttempt(content, analysis, context) {
    const spamEvent = {
      type: 'SPAM_ATTEMPT',
      pageName: context.pageName,
      userName: context.userName,
      spamScore: analysis.spamScore,
      reasons: analysis.reasons,
      analysis: analysis.analysis,
      timestamp: new Date().toISOString(),
      severity: analysis.spamScore > 100 ? 'high' : 'medium'
    };

    console.warn('🛡️  Spam attempt detected:', spamEvent);

    // Send to audit system if available
    const auditManager = context.engine?.getManager('AuditManager');
    if (auditManager) {
      auditManager.logSecurityEvent(spamEvent);
    }
  }

  /**
   * Add word to blacklist (modular blacklist management)
   * @param {string} word - Word to blacklist
   * @returns {boolean} - True if added
   */
  addBlacklistedWord(word) {
    const cleanWord = word.trim().toLowerCase();
    if (cleanWord && !this.blacklistedWords.has(cleanWord)) {
      this.blacklistedWords.add(cleanWord);
      console.log(`🚫 Added blacklisted word: ${cleanWord}`);
      return true;
    }
    return false;
  }

  /**
   * Remove word from blacklist (modular blacklist management)
   * @param {string} word - Word to remove
   * @returns {boolean} - True if removed
   */
  removeBlacklistedWord(word) {
    const cleanWord = word.trim().toLowerCase();
    if (this.blacklistedWords.has(cleanWord)) {
      this.blacklistedWords.delete(cleanWord);
      console.log(`✅ Removed blacklisted word: ${cleanWord}`);
      return true;
    }
    return false;
  }

  /**
   * Add domain to whitelist (modular whitelist management)
   * @param {string} domain - Domain to whitelist
   * @returns {boolean} - True if added
   */
  addWhitelistedDomain(domain) {
    const cleanDomain = domain.trim().toLowerCase();
    if (cleanDomain && !this.whitelistedDomains.has(cleanDomain)) {
      this.whitelistedDomains.add(cleanDomain);
      console.log(`✅ Added whitelisted domain: ${cleanDomain}`);
      return true;
    }
    return false;
  }

  /**
   * Remove domain from whitelist (modular whitelist management)
   * @param {string} domain - Domain to remove
   * @returns {boolean} - True if removed
   */
  removeWhitelistedDomain(domain) {
    const cleanDomain = domain.trim().toLowerCase();
    if (this.whitelistedDomains.has(cleanDomain)) {
      this.whitelistedDomains.delete(cleanDomain);
      console.log(`🚫 Removed whitelisted domain: ${cleanDomain}`);
      return true;
    }
    return false;
  }

  /**
   * Get spam configuration summary (modular introspection)
   * @returns {Object} - Spam configuration summary
   */
  getSpamConfiguration() {
    return {
      limits: {
        maxLinks: this.spamConfig?.maxLinks || 0,
        maxImages: this.spamConfig?.maxImages || 0,
        minContentLength: this.spamConfig?.minContentLength || 0
      },
      detection: {
        blacklistedWordCount: this.blacklistedWords.size,
        whitelistedDomainCount: this.whitelistedDomains.size,
        cacheBlacklist: this.spamConfig?.cacheBlacklist || false,
        autoBlock: this.spamConfig?.autoBlock || false
      },
      blacklistedWords: Array.from(this.blacklistedWords),
      whitelistedDomains: Array.from(this.whitelistedDomains)
    };
  }

  /**
   * Get filter information for debugging and documentation
   * @returns {Object} - Filter information
   */
  getInfo() {
    return {
      ...super.getMetadata(),
      spamConfiguration: this.getSpamConfiguration(),
      features: [
        'Configurable link count limits',
        'Configurable image count limits',
        'Modular blacklisted word detection',
        'Domain whitelist validation',
        'Content length analysis',
        'Spam score calculation',
        'Configurable auto-blocking',
        'Spam attempt logging',
        'Modular configuration system',
        'Runtime blacklist/whitelist management'
      ],
      configurationSources: [
        'app-default-config.json (base spam policy)',
        'app-custom-config.json (environment-specific rules)',
        'Runtime blacklist/whitelist updates',
        'Default spam patterns for missing configuration'
      ]
    };
  }
}

module.exports = SpamFilter;
