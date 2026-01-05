import BaseFilter from './BaseFilter';
import logger from '../../utils/logger';

/**
 * Spam configuration interface
 */
interface SpamConfig {
  maxLinks: number;
  maxImages: number;
  minContentLength: number;
  maxDuplicateContent: number;
  cacheBlacklist: boolean;
  autoBlock: boolean;
  logSpamAttempts: boolean;
  whitelistMode: boolean;
}

/**
 * Spam analysis result interface
 */
interface SpamAnalysis {
  isSpam: boolean;
  spamScore: number;
  threshold: number;
  reasons: string[];
  analysis: {
    linkCount: number;
    imageCount: number;
    blacklistMatches: number;
    suspiciousDomains: number;
    contentLength: number;
  };
}

/**
 * Spam event interface
 */
interface SpamEvent {
  type: string;
  pageName: string;
  userName: string;
  spamScore: number;
  reasons: string[];
  analysis: SpamAnalysis['analysis'];
  timestamp: string;
  severity: string;
}

/**
 * Parse context interface
 */
interface ParseContext {
  pageName?: string;
  userName?: string;
  engine?: {
    getManager: (name: string) => unknown;
  };
}

/**
 * Initialization context interface
 */
interface InitContext {
  engine?: {
    getManager: (name: string) => unknown;
  };
}

/**
 * Configuration manager interface
 */
interface ConfigManager {
  getProperty: (key: string, defaultValue: unknown) => unknown;
}

/**
 * Audit manager interface
 */
interface AuditManager {
  logSecurityEvent: (event: SpamEvent) => void;
}

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
  declare filterId: string;
  spamConfig: SpamConfig | null;
  blacklistedWords: Set<string>;
  whitelistedDomains: Set<string>;
  spamPatterns: RegExp[];

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
   * @param context - Initialization context
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async onInitialize(context: InitContext): Promise<void> {
    // Load modular spam configuration from configuration hierarchy
    this.loadModularSpamConfiguration(context);

    logger.debug('🛡️  SpamFilter initialized with modular configuration:');
    logger.debug(`   🔗 Max links: ${this.spamConfig?.maxLinks}`);
    logger.debug(`   🖼️  Max images: ${this.spamConfig?.maxImages}`);
    logger.debug(`   📝 Blacklisted words: ${this.blacklistedWords.size} configured`);
    logger.debug(`   ✅ Whitelisted domains: ${this.whitelistedDomains.size} configured`);
    logger.debug(`   🗄️  Cache blacklist: ${this.spamConfig?.cacheBlacklist ? 'enabled' : 'disabled'}`);
  }

  /**
   * Load modular spam configuration from app-default/custom-config.json
   * @param context - Initialization context
   */
  loadModularSpamConfiguration(context: InitContext): void {
    const configManager = context.engine?.getManager('ConfigurationManager') as ConfigManager | undefined;

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
        this.spamConfig.maxLinks = configManager.getProperty('amdwiki.markup.filters.spam.maxLinks', this.spamConfig.maxLinks) as number;
        this.spamConfig.maxImages = configManager.getProperty('amdwiki.markup.filters.spam.maxImages', this.spamConfig.maxImages) as number;
        this.spamConfig.cacheBlacklist = configManager.getProperty('amdwiki.markup.filters.spam.cacheBlacklist', this.spamConfig.cacheBlacklist) as boolean;

        // Load blacklisted words (modular blacklist)
        const blacklistWords = configManager.getProperty('amdwiki.markup.filters.spam.blacklistWords', '') as string;
        if (blacklistWords) {
          blacklistWords.split(',').forEach(word => {
            const cleanWord = word.trim().toLowerCase();
            if (cleanWord) this.blacklistedWords.add(cleanWord);
          });
        }

        // Load whitelisted domains (modular whitelist)
        const whitelistDomains = configManager.getProperty('amdwiki.markup.filters.spam.whitelistDomains', '') as string;
        if (whitelistDomains) {
          whitelistDomains.split(',').forEach(domain => {
            const cleanDomain = domain.trim().toLowerCase();
            if (cleanDomain) this.whitelistedDomains.add(cleanDomain);
          });
        }

        // Advanced spam detection settings (configurable)
        this.spamConfig.minContentLength = configManager.getProperty('amdwiki.markup.filters.spam.minContentLength', this.spamConfig.minContentLength) as number;
        this.spamConfig.autoBlock = configManager.getProperty('amdwiki.markup.filters.spam.autoBlock', this.spamConfig.autoBlock) as boolean;
        this.spamConfig.logSpamAttempts = configManager.getProperty('amdwiki.markup.filters.spam.logSpamAttempts', this.spamConfig.logSpamAttempts) as boolean;

      } catch (error) {
        const err = error as Error;
        logger.warn('⚠️  Failed to load SpamFilter configuration, using defaults:', err.message);
        this.loadDefaultSpamConfiguration();
      }
    } else {
      this.loadDefaultSpamConfiguration();
    }
  }

  /**
   * Load default spam configuration when configuration unavailable
   */
  loadDefaultSpamConfiguration(): void {
    // Default blacklisted words
    const defaultBlacklist = ['spam', 'casino', 'pharmacy', 'viagra', 'cialis', 'lottery', 'winner'];
    defaultBlacklist.forEach(word => this.blacklistedWords.add(word));

    // Default whitelisted domains
    const defaultWhitelist = ['wikipedia.org', 'github.com', 'stackoverflow.com', 'mozilla.org'];
    defaultWhitelist.forEach(domain => this.whitelistedDomains.add(domain));
  }

  /**
   * Process content through spam detection filters (modular spam detection)
   * @param content - Content to analyze
   * @param context - Parse context
   * @returns Content (unchanged if not spam, or flagged if spam)
   */
  async process(content: string, context: ParseContext): Promise<string> {
    if (!content) {
      return content;
    }

    // Perform spam analysis
    const spamAnalysis = await this.analyzeSpam(content, context);

    if (spamAnalysis.isSpam) {
      // Log spam attempt if configured
      if (this.spamConfig?.logSpamAttempts) {
        this.logSpamAttempt(content, spamAnalysis, context);
      }

      if (this.spamConfig?.autoBlock) {
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
   * @param content - Content to analyze
   * @param _context - Parse context
   * @returns Spam analysis result
   */
  async analyzeSpam(content: string, _context: ParseContext): Promise<SpamAnalysis> {
    const reasons: string[] = [];
    let spamScore = 0;

    // Check link count (configurable limit)
    const linkCount = this.countLinks(content);
    if (this.spamConfig && linkCount > this.spamConfig.maxLinks) {
      reasons.push(`Too many links: ${linkCount}/${this.spamConfig.maxLinks}`);
      spamScore += 30;
    }

    // Check image count (configurable limit)
    const imageCount = this.countImages(content);
    if (this.spamConfig && imageCount > this.spamConfig.maxImages) {
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
    if (this.spamConfig && content.length < this.spamConfig.minContentLength) {
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
   * @param content - Content to analyze
   * @returns Number of links found
   */
  countLinks(content: string): number {
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
   * @param content - Content to analyze
   * @returns Number of images found
   */
  countImages(content: string): number {
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
   * @param content - Content to check
   * @returns Found blacklisted words
   */
  findBlacklistedWords(content: string): string[] {
    const found: string[] = [];
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
   * @param content - Content to analyze
   * @returns Suspicious domains found
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async findSuspiciousDomains(content: string): Promise<string[]> {
    const urlRegex = /https?:\/\/([^/\s]+)/g;
    const domains = new Set<string>();
    let match: RegExpExecArray | null;

    while ((match = urlRegex.exec(content)) !== null) {
      domains.add((match[1] ?? '').toLowerCase());
    }

    const suspicious: string[] = [];
    for (const domain of domains) {
      if (!this.whitelistedDomains.has(domain)) {
        suspicious.push(domain);
      }
    }

    return suspicious;
  }

  /**
   * Log spam attempt for monitoring (modular logging)
   * @param _content - Original content
   * @param analysis - Spam analysis result
   * @param context - Parse context
   */
  logSpamAttempt(_content: string, analysis: SpamAnalysis, context: ParseContext): void {
    const spamEvent: SpamEvent = {
      type: 'SPAM_ATTEMPT',
      pageName: context.pageName || '',
      userName: context.userName || '',
      spamScore: analysis.spamScore,
      reasons: analysis.reasons,
      analysis: analysis.analysis,
      timestamp: new Date().toISOString(),
      severity: analysis.spamScore > 100 ? 'high' : 'medium'
    };

    logger.warn('🛡️  Spam attempt detected:', spamEvent);

    // Send to audit system if available
    const auditManager = context.engine?.getManager('AuditManager') as AuditManager | undefined;
    if (auditManager) {
      auditManager.logSecurityEvent(spamEvent);
    }
  }

  /**
   * Add word to blacklist (modular blacklist management)
   * @param word - Word to blacklist
   * @returns True if added
   */
  addBlacklistedWord(word: string): boolean {
    const cleanWord = word.trim().toLowerCase();
    if (cleanWord && !this.blacklistedWords.has(cleanWord)) {
      this.blacklistedWords.add(cleanWord);
      logger.debug(`🚫 Added blacklisted word: ${cleanWord}`);
      return true;
    }
    return false;
  }

  /**
   * Remove word from blacklist (modular blacklist management)
   * @param word - Word to remove
   * @returns True if removed
   */
  removeBlacklistedWord(word: string): boolean {
    const cleanWord = word.trim().toLowerCase();
    if (this.blacklistedWords.has(cleanWord)) {
      this.blacklistedWords.delete(cleanWord);
      logger.debug(`✅ Removed blacklisted word: ${cleanWord}`);
      return true;
    }
    return false;
  }

  /**
   * Add domain to whitelist (modular whitelist management)
   * @param domain - Domain to whitelist
   * @returns True if added
   */
  addWhitelistedDomain(domain: string): boolean {
    const cleanDomain = domain.trim().toLowerCase();
    if (cleanDomain && !this.whitelistedDomains.has(cleanDomain)) {
      this.whitelistedDomains.add(cleanDomain);
      logger.debug(`✅ Added whitelisted domain: ${cleanDomain}`);
      return true;
    }
    return false;
  }

  /**
   * Remove domain from whitelist (modular whitelist management)
   * @param domain - Domain to remove
   * @returns True if removed
   */
  removeWhitelistedDomain(domain: string): boolean {
    const cleanDomain = domain.trim().toLowerCase();
    if (this.whitelistedDomains.has(cleanDomain)) {
      this.whitelistedDomains.delete(cleanDomain);
      logger.debug(`🚫 Removed whitelisted domain: ${cleanDomain}`);
      return true;
    }
    return false;
  }

  /**
   * Get spam configuration summary (modular introspection)
   * @returns Spam configuration summary
   */
  getSpamConfiguration(): Record<string, unknown> {
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
   * @returns Filter information
   */
  getInfo(): Record<string, unknown> {
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

export default SpamFilter;

// CommonJS compatibility
module.exports = SpamFilter;
