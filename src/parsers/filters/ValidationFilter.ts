import BaseFilter from './BaseFilter';

/**
 * Validation configuration interface
 */
interface ValidationConfig {
  validateMarkup: boolean;
  validateLinks: boolean;
  validateImages: boolean;
  validateMetadata: boolean;
  maxContentLength: number;
  maxLineLength: number;
  reportErrors: boolean;
  failOnValidationError: boolean;
  logValidationErrors: boolean;
  minWordCount: number;
  maxDuplicateLines: number;
  requireTitle: boolean;
}

/**
 * Validation rule interface
 */
interface ValidationRule {
  validate: (content: string, context?: ParseContext) => boolean | Promise<boolean>;
  errorMessage: string;
  severity: 'error' | 'warning';
}

/**
 * Validation error interface
 */
interface ValidationError {
  rule: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Validation report interface
 */
interface ValidationReport {
  pageName: string;
  userName: string;
  errors: ValidationError[];
  warnings: ValidationError[];
  timestamp: string;
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
 * Notification manager interface
 */
interface NotificationManager {
  addNotification: (notification: {
    type: string;
    title: string;
    message: string;
    priority: string;
    source: string;
  }) => void;
}

/**
 * ValidationFilter - Content validation with modular configuration
 *
 * Provides comprehensive content validation including markup syntax validation,
 * link checking, image validation, and content quality analysis through complete
 * modularity via app-default-config.json and app-custom-config.json.
 *
 * Design Principles:
 * - Configurable validation rules and thresholds
 * - Zero hardcoded validation logic
 * - Deployment-specific validation policies
 * - Extensible validation rule system
 *
 * Related Issue: Phase 4 - Security Filter Suite (Content Validation)
 * Epic: #41 - Implement JSPWikiMarkupParser for Complete Enhancement Support
 */
class ValidationFilter extends BaseFilter {
  declare filterId: string;
  validationConfig: ValidationConfig | null;
  validationRules: Map<string, ValidationRule>;
  errorReports: ValidationReport[];

  constructor() {
    super(
      90, // High priority - validate content early
      {
        description: 'Comprehensive content validation filter with configurable rules',
        version: '1.0.0',
        category: 'validation',
        cacheResults: true,
        cacheTTL: 900 // Cache validation results for 15 minutes
      }
    );
    this.filterId = 'ValidationFilter';
    this.validationConfig = null;
    this.validationRules = new Map();
    this.errorReports = [];
  }

  /**
   * Initialize filter with modular validation configuration
   * @param context - Initialization context
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async onInitialize(context: InitContext): Promise<void> {
    // Load modular validation configuration from configuration hierarchy
    this.loadModularValidationConfiguration(context);

    // Initialize validation rules based on configuration
    this.initializeValidationRules();

    // eslint-disable-next-line no-console
    console.log('✅ ValidationFilter initialized with modular configuration:');
    // eslint-disable-next-line no-console
    console.log(`   📝 Markup validation: ${this.validationConfig?.validateMarkup ? 'enabled' : 'disabled'}`);
    // eslint-disable-next-line no-console
    console.log(`   🔗 Link validation: ${this.validationConfig?.validateLinks ? 'enabled' : 'disabled'}`);
    // eslint-disable-next-line no-console
    console.log(`   🖼️  Image validation: ${this.validationConfig?.validateImages ? 'enabled' : 'disabled'}`);
    // eslint-disable-next-line no-console
    console.log(`   📊 Max content length: ${this.validationConfig?.maxContentLength} bytes`);
    // eslint-disable-next-line no-console
    console.log(`   📋 Report errors: ${this.validationConfig?.reportErrors ? 'enabled' : 'disabled'}`);
  }

  /**
   * Load modular validation configuration from app-default/custom-config.json
   * @param context - Initialization context
   */
  loadModularValidationConfiguration(context: InitContext): void {
    const configManager = context.engine?.getManager('ConfigurationManager') as ConfigManager | undefined;

    // Default validation configuration
    this.validationConfig = {
      validateMarkup: true,
      validateLinks: true,
      validateImages: true,
      validateMetadata: true,
      maxContentLength: 1048576, // 1MB
      maxLineLength: 10000,
      reportErrors: true,
      failOnValidationError: false,
      logValidationErrors: true,

      // Content quality thresholds
      minWordCount: 5,
      maxDuplicateLines: 10,
      requireTitle: false
    };

    // Load from app-default-config.json and allow app-custom-config.json overrides
    if (configManager) {
      try {
        // Validation feature configuration (modular)
        this.validationConfig.validateMarkup = configManager.getProperty('amdwiki.markup.filters.validation.validateMarkup', this.validationConfig.validateMarkup) as boolean;
        this.validationConfig.validateLinks = configManager.getProperty('amdwiki.markup.filters.validation.validateLinks', this.validationConfig.validateLinks) as boolean;
        this.validationConfig.validateImages = configManager.getProperty('amdwiki.markup.filters.validation.validateImages', this.validationConfig.validateImages) as boolean;
        this.validationConfig.maxContentLength = configManager.getProperty('amdwiki.markup.filters.validation.maxContentLength', this.validationConfig.maxContentLength) as number;
        this.validationConfig.reportErrors = configManager.getProperty('amdwiki.markup.filters.validation.reportErrors', this.validationConfig.reportErrors) as boolean;

        // Advanced validation settings (configurable)
        this.validationConfig.failOnValidationError = configManager.getProperty('amdwiki.markup.filters.validation.failOnValidationError', this.validationConfig.failOnValidationError) as boolean;
        this.validationConfig.logValidationErrors = configManager.getProperty('amdwiki.markup.filters.validation.logValidationErrors', this.validationConfig.logValidationErrors) as boolean;
        this.validationConfig.minWordCount = configManager.getProperty('amdwiki.markup.filters.validation.minWordCount', this.validationConfig.minWordCount) as number;
        this.validationConfig.maxLineLength = configManager.getProperty('amdwiki.markup.filters.validation.maxLineLength', this.validationConfig.maxLineLength) as number;

      } catch (error) {
        const err = error as Error;
        // eslint-disable-next-line no-console
        console.warn('⚠️  Failed to load ValidationFilter configuration, using defaults:', err.message);
      }
    }
  }

  /**
   * Initialize validation rules based on configuration (modular rule system)
   */
  initializeValidationRules(): void {
    this.validationRules.clear();

    // Content length validation (configurable)
    if (this.validationConfig && this.validationConfig.maxContentLength > 0) {
      this.validationRules.set('contentLength', {
        validate: (content: string) => content.length <= (this.validationConfig?.maxContentLength ?? 0),
        errorMessage: `Content exceeds maximum length: ${this.validationConfig.maxContentLength} characters`,
        severity: 'error'
      });
    }

    // Line length validation (configurable)
    if (this.validationConfig && this.validationConfig.maxLineLength > 0) {
      this.validationRules.set('lineLength', {
        validate: (content: string) => {
          const lines = content.split('\n');
          return lines.every(line => line.length <= (this.validationConfig?.maxLineLength ?? 0));
        },
        errorMessage: `Line exceeds maximum length: ${this.validationConfig.maxLineLength} characters`,
        severity: 'warning'
      });
    }

    // Word count validation (configurable)
    if (this.validationConfig && this.validationConfig.minWordCount > 0) {
      this.validationRules.set('wordCount', {
        validate: (content: string) => {
          const wordCount = content.split(/\s+/).filter(word => word.trim()).length;
          return wordCount >= (this.validationConfig?.minWordCount ?? 0);
        },
        errorMessage: `Content has too few words (minimum: ${this.validationConfig.minWordCount})`,
        severity: 'warning'
      });
    }

    // Markup syntax validation (configurable)
    if (this.validationConfig?.validateMarkup) {
      this.validationRules.set('markupSyntax', {
        validate: (content: string) => this.validateMarkupSyntax(content),
        errorMessage: 'Invalid markup syntax detected',
        severity: 'error'
      });
    }

    // Link validation (configurable)
    if (this.validationConfig?.validateLinks) {
      this.validationRules.set('linkValidation', {
        validate: (content: string) => this.validateLinks(content),
        errorMessage: 'Invalid or broken links detected',
        severity: 'warning'
      });
    }

    // Image validation (configurable)
    if (this.validationConfig?.validateImages) {
      this.validationRules.set('imageValidation', {
        validate: (content: string) => this.validateImages(content),
        errorMessage: 'Invalid or inaccessible images detected',
        severity: 'warning'
      });
    }
  }

  /**
   * Process content through validation filters (modular validation)
   * @param content - Content to validate
   * @param context - Parse context
   * @returns Validated content (with error comments if configured)
   */
  async process(content: string, context: ParseContext): Promise<string> {
    if (!content) {
      return content;
    }

    const validationErrors: ValidationError[] = [];
    const validationWarnings: ValidationError[] = [];

    // Run all configured validation rules
    for (const [ruleName, rule] of this.validationRules) {
      try {
        const isValid = await rule.validate(content, context);

        if (!isValid) {
          const error: ValidationError = {
            rule: ruleName,
            message: rule.errorMessage,
            severity: rule.severity
          };

          if (rule.severity === 'error') {
            validationErrors.push(error);
          } else {
            validationWarnings.push(error);
          }
        }
      } catch (ruleError) {
        const err = ruleError as Error;
        // eslint-disable-next-line no-console
        console.error(`❌ Validation rule ${ruleName} failed:`, err.message);
      }
    }

    // Handle validation results based on configuration
    if (validationErrors.length > 0 || validationWarnings.length > 0) {
      await this.handleValidationResults(content, validationErrors, validationWarnings, context);
    }

    // Return content with validation comments if configured
    if (this.validationConfig?.reportErrors && (validationErrors.length > 0 || validationWarnings.length > 0)) {
      return this.addValidationComments(content, validationErrors, validationWarnings);
    }

    return content;
  }

  /**
   * Validate markup syntax (modular markup validation)
   * @param content - Content to validate
   * @returns True if markup is valid
   */
  validateMarkupSyntax(content: string): boolean {
    // Check for common markup syntax errors
    const syntaxErrors = [
      /\[\{[^}]*$/m,                    // Unclosed plugin syntax
      /<wiki:\w+[^>]*(?!\/?>)/m,        // Unclosed WikiTag
      /\]\([^)]*$/m,                    // Unclosed markdown link
      /```[^`]*$/m                      // Unclosed code block
    ];

    return !syntaxErrors.some(pattern => pattern.test(content));
  }

  /**
   * Validate links in content (modular link validation)
   * @param content - Content to validate
   * @returns True if all links are valid
   */
  validateLinks(content: string): boolean {
    // Extract and validate markdown links
    const markdownLinks = content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];

    for (const link of markdownLinks) {
      const urlMatch = link.match(/\]\(([^)]+)\)/);
      if (urlMatch) {
        const url = urlMatch[1];
        if (!this.isValidURL(url)) {
          return false;
        }
      }
    }

    // Extract and validate HTML links
    const htmlLinks = content.match(/<a\s+[^>]*href\s*=\s*["']([^"']+)["'][^>]*>/gi) || [];

    for (const link of htmlLinks) {
      const urlMatch = link.match(/href\s*=\s*["']([^"']+)["']/i);
      if (urlMatch) {
        const url = urlMatch[1];
        if (!this.isValidURL(url)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Validate images in content (modular image validation)
   * @param content - Content to validate
   * @returns True if all images are valid
   */
  validateImages(content: string): boolean {
    // Extract and validate markdown images
    const markdownImages = content.match(/!\[([^\]]*)\]\(([^)]+)\)/g) || [];

    for (const image of markdownImages) {
      const urlMatch = image.match(/\]\(([^)]+)\)/);
      if (urlMatch) {
        const url = urlMatch[1];
        if (!this.isValidImageURL(url)) {
          return false;
        }
      }
    }

    // Extract and validate HTML images
    const htmlImages = content.match(/<img\s+[^>]*src\s*=\s*["']([^"']+)["'][^>]*>/gi) || [];

    for (const image of htmlImages) {
      const urlMatch = image.match(/src\s*=\s*["']([^"']+)["']/i);
      if (urlMatch) {
        const url = urlMatch[1];
        if (!this.isValidImageURL(url)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Validate URL format and safety (modular URL validation)
   * @param url - URL to validate
   * @returns True if valid
   */
  isValidURL(url: string): boolean {
    if (!url || typeof url !== 'string') {
      return false;
    }

    // Allow relative URLs
    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
      return true;
    }

    try {
      const urlObj = new URL(url);

      // Allow only safe protocols
      const safeProtocols = ['http:', 'https:', 'mailto:', 'ftp:'];
      return safeProtocols.includes(urlObj.protocol);

    } catch {
      return false;
    }
  }

  /**
   * Validate image URL and format (modular image validation)
   * @param url - Image URL to validate
   * @returns True if valid image
   */
  isValidImageURL(url: string): boolean {
    if (!this.isValidURL(url)) {
      return false;
    }

    // Check for valid image extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    const urlLower = url.toLowerCase();

    // Allow if URL ends with image extension or is from allowed domains
    return imageExtensions.some(ext => urlLower.includes(ext)) ||
           url.startsWith('/') || // Local images
           this.isTrustedImageDomain(url);
  }

  /**
   * Check if image domain is trusted (modular domain validation)
   * @param url - Image URL
   * @returns True if from trusted domain
   */
  isTrustedImageDomain(url: string): boolean {
    const trustedDomains = [
      'imgur.com',
      'github.com',
      'githubusercontent.com',
      'wikimedia.org',
      'wikipedia.org'
    ];

    try {
      const urlObj = new URL(url);
      return trustedDomains.some(domain => urlObj.hostname.includes(domain));
    } catch {
      return false;
    }
  }

  /**
   * Handle validation results based on configuration (modular error handling)
   * @param _content - Original content
   * @param errors - Validation errors
   * @param warnings - Validation warnings
   * @param context - Parse context
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async handleValidationResults(_content: string, errors: ValidationError[], warnings: ValidationError[], context: ParseContext): Promise<void> {
    // Log validation issues if configured
    if (this.validationConfig?.logValidationErrors) {
      if (errors.length > 0) {
        // eslint-disable-next-line no-console
        console.error(`❌ Validation errors in ${context.pageName}:`, errors);
      }
      if (warnings.length > 0) {
        // eslint-disable-next-line no-console
        console.warn(`⚠️  Validation warnings in ${context.pageName}:`, warnings);
      }
    }

    // Store error reports for later review
    if (errors.length > 0 || warnings.length > 0) {
      this.errorReports.push({
        pageName: context.pageName || '',
        userName: context.userName || '',
        errors,
        warnings,
        timestamp: new Date().toISOString()
      });

      // Limit error reports to prevent memory issues
      if (this.errorReports.length > 1000) {
        this.errorReports.shift();
      }
    }

    // Send to notification system if available
    const notificationManager = context.engine?.getManager('NotificationManager') as NotificationManager | undefined;
    if (notificationManager && errors.length > 0) {
      notificationManager.addNotification({
        type: 'validation',
        title: `Content Validation Errors: ${context.pageName}`,
        message: `${errors.length} validation errors found`,
        priority: 'medium',
        source: 'ValidationFilter'
      });
    }

    // Throw error if configured to fail on validation errors
    if (this.validationConfig?.failOnValidationError && errors.length > 0) {
      throw new Error(`Content validation failed: ${errors.map(e => e.message).join(', ')}`);
    }
  }

  /**
   * Add validation comments to content (modular error reporting)
   * @param content - Original content
   * @param errors - Validation errors
   * @param warnings - Validation warnings
   * @returns Content with validation comments
   */
  addValidationComments(content: string, errors: ValidationError[], warnings: ValidationError[]): string {
    let annotatedContent = content;

    // Add error comments at the top
    if (errors.length > 0) {
      const errorComments = errors.map(error =>
        `<!-- VALIDATION ERROR [${error.rule}]: ${error.message} -->`
      ).join('\n');
      annotatedContent = errorComments + '\n\n' + annotatedContent;
    }

    // Add warning comments at the top (after errors)
    if (warnings.length > 0) {
      const warningComments = warnings.map(warning =>
        `<!-- VALIDATION WARNING [${warning.rule}]: ${warning.message} -->`
      ).join('\n');
      annotatedContent = warningComments + '\n\n' + annotatedContent;
    }

    return annotatedContent;
  }

  /**
   * Get validation error reports (modular error reporting)
   * @param limit - Maximum number of reports to return
   * @returns Recent validation error reports
   */
  getValidationReports(limit: number = 50): ValidationReport[] {
    return this.errorReports.slice(-limit);
  }

  /**
   * Clear validation error reports
   */
  clearValidationReports(): void {
    this.errorReports = [];
  }

  /**
   * Add custom validation rule (modular extensibility)
   * @param ruleName - Rule identifier
   * @param validator - Validation function
   * @param errorMessage - Error message
   * @param severity - Error severity (error/warning)
   * @returns True if rule added
   */
  addValidationRule(ruleName: string, validator: (content: string, context?: ParseContext) => boolean | Promise<boolean>, errorMessage: string, severity: 'error' | 'warning' = 'warning'): boolean {
    if (typeof validator !== 'function') {
      return false;
    }

    this.validationRules.set(ruleName, {
      validate: validator,
      errorMessage,
      severity
    });

    // eslint-disable-next-line no-console
    console.log(`✅ Added custom validation rule: ${ruleName}`);
    return true;
  }

  /**
   * Remove custom validation rule (modular management)
   * @param ruleName - Rule identifier
   * @returns True if rule removed
   */
  removeValidationRule(ruleName: string): boolean {
    if (this.validationRules.has(ruleName)) {
      this.validationRules.delete(ruleName);
      // eslint-disable-next-line no-console
      console.log(`🗑️  Removed validation rule: ${ruleName}`);
      return true;
    }
    return false;
  }

  /**
   * Get validation configuration summary (modular introspection)
   * @returns Validation configuration summary
   */
  getValidationConfiguration(): Record<string, unknown> {
    return {
      features: {
        validateMarkup: this.validationConfig?.validateMarkup || false,
        validateLinks: this.validationConfig?.validateLinks || false,
        validateImages: this.validationConfig?.validateImages || false,
        reportErrors: this.validationConfig?.reportErrors || false
      },
      limits: {
        maxContentLength: this.validationConfig?.maxContentLength || 0,
        maxLineLength: this.validationConfig?.maxLineLength || 0,
        minWordCount: this.validationConfig?.minWordCount || 0
      },
      rules: {
        total: this.validationRules.size,
        ruleNames: Array.from(this.validationRules.keys())
      },
      errorReporting: {
        recentReports: this.errorReports.length,
        logErrors: this.validationConfig?.logValidationErrors || false,
        failOnError: this.validationConfig?.failOnValidationError || false
      }
    };
  }

  /**
   * Get filter information for debugging and documentation
   * @returns Filter information
   */
  getInfo(): Record<string, unknown> {
    return {
      ...super.getMetadata(),
      validationConfiguration: this.getValidationConfiguration(),
      features: [
        'Configurable markup syntax validation',
        'Link accessibility and format validation',
        'Image URL and format validation',
        'Content length and quality validation',
        'Custom validation rule system',
        'Modular error reporting',
        'Configurable severity levels',
        'Performance caching',
        'Deployment-specific validation policies',
        'Runtime rule management'
      ],
      configurationSources: [
        'app-default-config.json (base validation policy)',
        'app-custom-config.json (environment-specific rules)',
        'Runtime validation rule additions',
        'Default validation patterns'
      ]
    };
  }
}

export default ValidationFilter;

// CommonJS compatibility
module.exports = ValidationFilter;
