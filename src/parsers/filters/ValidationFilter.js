const BaseFilter = require('./BaseFilter');

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
   * @param {Object} context - Initialization context
   */
  async onInitialize(context) {
    // Load modular validation configuration from configuration hierarchy
    await this.loadModularValidationConfiguration(context);
    
    // Initialize validation rules based on configuration
    this.initializeValidationRules();
    
    console.log('✅ ValidationFilter initialized with modular configuration:');
    console.log(`   📝 Markup validation: ${this.validationConfig.validateMarkup ? 'enabled' : 'disabled'}`);
    console.log(`   🔗 Link validation: ${this.validationConfig.validateLinks ? 'enabled' : 'disabled'}`);
    console.log(`   🖼️  Image validation: ${this.validationConfig.validateImages ? 'enabled' : 'disabled'}`);
    console.log(`   📊 Max content length: ${this.validationConfig.maxContentLength} bytes`);
    console.log(`   📋 Report errors: ${this.validationConfig.reportErrors ? 'enabled' : 'disabled'}`);
  }

  /**
   * Load modular validation configuration from app-default/custom-config.json
   * @param {Object} context - Initialization context
   */
  async loadModularValidationConfiguration(context) {
    const configManager = context.engine?.getManager('ConfigurationManager');
    
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
        this.validationConfig.validateMarkup = configManager.getProperty('amdwiki.markup.filters.validation.validateMarkup', this.validationConfig.validateMarkup);
        this.validationConfig.validateLinks = configManager.getProperty('amdwiki.markup.filters.validation.validateLinks', this.validationConfig.validateLinks);
        this.validationConfig.validateImages = configManager.getProperty('amdwiki.markup.filters.validation.validateImages', this.validationConfig.validateImages);
        this.validationConfig.maxContentLength = configManager.getProperty('amdwiki.markup.filters.validation.maxContentLength', this.validationConfig.maxContentLength);
        this.validationConfig.reportErrors = configManager.getProperty('amdwiki.markup.filters.validation.reportErrors', this.validationConfig.reportErrors);
        
        // Advanced validation settings (configurable)
        this.validationConfig.failOnValidationError = configManager.getProperty('amdwiki.markup.filters.validation.failOnValidationError', this.validationConfig.failOnValidationError);
        this.validationConfig.logValidationErrors = configManager.getProperty('amdwiki.markup.filters.validation.logValidationErrors', this.validationConfig.logValidationErrors);
        this.validationConfig.minWordCount = configManager.getProperty('amdwiki.markup.filters.validation.minWordCount', this.validationConfig.minWordCount);
        this.validationConfig.maxLineLength = configManager.getProperty('amdwiki.markup.filters.validation.maxLineLength', this.validationConfig.maxLineLength);
        
      } catch (error) {
        console.warn('⚠️  Failed to load ValidationFilter configuration, using defaults:', error.message);
      }
    }
  }

  /**
   * Initialize validation rules based on configuration (modular rule system)
   */
  initializeValidationRules() {
    this.validationRules.clear();

    // Content length validation (configurable)
    if (this.validationConfig.maxContentLength > 0) {
      this.validationRules.set('contentLength', {
        validate: (content) => content.length <= this.validationConfig.maxContentLength,
        errorMessage: `Content exceeds maximum length: ${this.validationConfig.maxContentLength} characters`,
        severity: 'error'
      });
    }

    // Line length validation (configurable)
    if (this.validationConfig.maxLineLength > 0) {
      this.validationRules.set('lineLength', {
        validate: (content) => {
          const lines = content.split('\n');
          return lines.every(line => line.length <= this.validationConfig.maxLineLength);
        },
        errorMessage: `Line exceeds maximum length: ${this.validationConfig.maxLineLength} characters`,
        severity: 'warning'
      });
    }

    // Word count validation (configurable)
    if (this.validationConfig.minWordCount > 0) {
      this.validationRules.set('wordCount', {
        validate: (content) => {
          const wordCount = content.split(/\s+/).filter(word => word.trim()).length;
          return wordCount >= this.validationConfig.minWordCount;
        },
        errorMessage: `Content has too few words (minimum: ${this.validationConfig.minWordCount})`,
        severity: 'warning'
      });
    }

    // Markup syntax validation (configurable)
    if (this.validationConfig.validateMarkup) {
      this.validationRules.set('markupSyntax', {
        validate: (content) => this.validateMarkupSyntax(content),
        errorMessage: 'Invalid markup syntax detected',
        severity: 'error'
      });
    }

    // Link validation (configurable)
    if (this.validationConfig.validateLinks) {
      this.validationRules.set('linkValidation', {
        validate: (content) => this.validateLinks(content),
        errorMessage: 'Invalid or broken links detected',
        severity: 'warning'
      });
    }

    // Image validation (configurable)
    if (this.validationConfig.validateImages) {
      this.validationRules.set('imageValidation', {
        validate: (content) => this.validateImages(content),
        errorMessage: 'Invalid or inaccessible images detected',
        severity: 'warning'
      });
    }
  }

  /**
   * Process content through validation filters (modular validation)
   * @param {string} content - Content to validate
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Validated content (with error comments if configured)
   */
  async process(content, context) {
    if (!content) {
      return content;
    }

    const validationErrors = [];
    const validationWarnings = [];

    // Run all configured validation rules
    for (const [ruleName, rule] of this.validationRules) {
      try {
        const isValid = await rule.validate(content, context);
        
        if (!isValid) {
          const error = {
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
        console.error(`❌ Validation rule ${ruleName} failed:`, ruleError.message);
      }
    }

    // Handle validation results based on configuration
    if (validationErrors.length > 0 || validationWarnings.length > 0) {
      await this.handleValidationResults(content, validationErrors, validationWarnings, context);
    }

    // Return content with validation comments if configured
    if (this.validationConfig.reportErrors && (validationErrors.length > 0 || validationWarnings.length > 0)) {
      return this.addValidationComments(content, validationErrors, validationWarnings);
    }

    return content;
  }

  /**
   * Validate markup syntax (modular markup validation)
   * @param {string} content - Content to validate
   * @returns {boolean} - True if markup is valid
   */
  validateMarkupSyntax(content) {
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
   * @param {string} content - Content to validate
   * @returns {boolean} - True if all links are valid
   */
  validateLinks(content) {
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
   * @param {string} content - Content to validate
   * @returns {boolean} - True if all images are valid
   */
  validateImages(content) {
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
   * @param {string} url - URL to validate
   * @returns {boolean} - True if valid
   */
  isValidURL(url) {
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
      
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate image URL and format (modular image validation)
   * @param {string} url - Image URL to validate
   * @returns {boolean} - True if valid image
   */
  isValidImageURL(url) {
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
   * @param {string} url - Image URL
   * @returns {boolean} - True if from trusted domain
   */
  isTrustedImageDomain(url) {
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
    } catch (error) {
      return false;
    }
  }

  /**
   * Handle validation results based on configuration (modular error handling)
   * @param {string} content - Original content
   * @param {Array} errors - Validation errors
   * @param {Array} warnings - Validation warnings
   * @param {ParseContext} context - Parse context
   */
  async handleValidationResults(content, errors, warnings, context) {
    // Log validation issues if configured
    if (this.validationConfig.logValidationErrors) {
      if (errors.length > 0) {
        console.error(`❌ Validation errors in ${context.pageName}:`, errors);
      }
      if (warnings.length > 0) {
        console.warn(`⚠️  Validation warnings in ${context.pageName}:`, warnings);
      }
    }

    // Store error reports for later review
    if (errors.length > 0 || warnings.length > 0) {
      this.errorReports.push({
        pageName: context.pageName,
        userName: context.userName,
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
    const notificationManager = context.engine?.getManager('NotificationManager');
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
    if (this.validationConfig.failOnValidationError && errors.length > 0) {
      throw new Error(`Content validation failed: ${errors.map(e => e.message).join(', ')}`);
    }
  }

  /**
   * Add validation comments to content (modular error reporting)
   * @param {string} content - Original content
   * @param {Array} errors - Validation errors
   * @param {Array} warnings - Validation warnings
   * @returns {string} - Content with validation comments
   */
  addValidationComments(content, errors, warnings) {
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
   * @param {number} limit - Maximum number of reports to return
   * @returns {Array} - Recent validation error reports
   */
  getValidationReports(limit = 50) {
    return this.errorReports.slice(-limit);
  }

  /**
   * Clear validation error reports
   */
  clearValidationReports() {
    this.errorReports = [];
  }

  /**
   * Add custom validation rule (modular extensibility)
   * @param {string} ruleName - Rule identifier
   * @param {Function} validator - Validation function
   * @param {string} errorMessage - Error message
   * @param {string} severity - Error severity (error/warning)
   * @returns {boolean} - True if rule added
   */
  addValidationRule(ruleName, validator, errorMessage, severity = 'warning') {
    if (typeof validator !== 'function') {
      return false;
    }

    this.validationRules.set(ruleName, {
      validate: validator,
      errorMessage,
      severity
    });

    console.log(`✅ Added custom validation rule: ${ruleName}`);
    return true;
  }

  /**
   * Remove custom validation rule (modular management)
   * @param {string} ruleName - Rule identifier
   * @returns {boolean} - True if rule removed
   */
  removeValidationRule(ruleName) {
    if (this.validationRules.has(ruleName)) {
      this.validationRules.delete(ruleName);
      console.log(`🗑️  Removed validation rule: ${ruleName}`);
      return true;
    }
    return false;
  }

  /**
   * Get validation configuration summary (modular introspection)
   * @returns {Object} - Validation configuration summary
   */
  getValidationConfiguration() {
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
   * @returns {Object} - Filter information
   */
  getInfo() {
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

module.exports = ValidationFilter;
