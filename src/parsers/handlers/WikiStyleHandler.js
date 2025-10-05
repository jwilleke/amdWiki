const { BaseSyntaxHandler } = require('./BaseSyntaxHandler');

/**
 * WikiStyleHandler - CSS class assignment and inline styling for wiki content
 * 
 * Supports JSPWiki WikiStyle syntax:
 * - %%class-name text content /% - CSS class assignment
 * - %%class1 class2 text content /% - Multiple CSS classes
 * - %%(color:red) inline styled text/% - Inline CSS (configurable security)
 * - %%text-center centered content /% - Bootstrap integration
 * 
 * Related Issue: WikiStyle Handler (Phase 3)
 * Epic: #41 - Implement JSPWikiMarkupParser for Complete Enhancement Support
 */
class WikiStyleHandler extends BaseSyntaxHandler {
  constructor(engine = null) {
    super(
      /%%([^%]+?)\s+([\s\S]*?)\s*\/%/g, // Pattern: %%style-info content /% - [\s\S]*? matches across newlines
      70, // Medium priority - process after most content handlers
      {
        description: 'JSPWiki-style CSS class and inline styling handler with security validation',
        version: '1.0.0',
        dependencies: ['ConfigurationManager'],
        timeout: 3000,
        cacheEnabled: true
      }
    );
    this.handlerId = 'WikiStyleHandler';
    this.engine = engine;
    this.config = null;
    this.styleConfig = null;
    this.predefinedClasses = new Set();
    this.allowedCSSProperties = new Set();
  }

  /**
   * Initialize handler with modular configuration system
   * @param {Object} context - Initialization context
   */
  async onInitialize(context) {
    this.engine = context.engine;
    
    // Load modular configuration from multiple sources
    await this.loadModularStyleConfiguration();
    
    console.log(`🎨 WikiStyleHandler initialized with modular configuration:`);
    console.log(`   🎨 Custom classes: ${this.styleConfig.customClasses ? 'enabled' : 'disabled'}`);
    console.log(`   🅱️  Bootstrap: ${this.styleConfig.bootstrap ? 'enabled' : 'disabled'}`);
    console.log(`   🔒 Inline CSS: ${this.styleConfig.allowInlineCSS ? 'enabled' : 'disabled'}`);
    console.log(`   📝 Predefined classes: ${this.predefinedClasses.size} loaded`);
  }

  /**
   * Load modular style configuration from app-default-config.json and app-custom-config.json
   * Demonstrates complete configuration modularity and reusability
   */
  async loadModularStyleConfiguration() {
    const configManager = this.engine?.getManager('ConfigurationManager');
    const markupParser = this.engine?.getManager('MarkupParser');
    
    // Get base handler configuration
    if (markupParser) {
      this.config = markupParser.getHandlerConfig('style');
      
      if (this.config.priority && this.config.priority !== this.priority) {
        this.priority = this.config.priority;
        console.log(`🔧 WikiStyleHandler priority set to ${this.priority} from configuration`);
      }
    }

    // Load detailed style configuration with modular approach
    this.styleConfig = {
      // Default configuration (base values)
      customClasses: true,
      bootstrap: true,
      allowInlineCSS: false, // Security default
      securityValidation: true,
      cacheStyles: true
    };

    // Load from app-default-config.json and allow app-custom-config.json overrides
    if (configManager) {
      try {
        // Main style configuration (modular)
        this.styleConfig.customClasses = configManager.getProperty('amdwiki.style.customClasses.enabled', this.styleConfig.customClasses);
        this.styleConfig.bootstrap = configManager.getProperty('amdwiki.style.bootstrap.integration', this.styleConfig.bootstrap);
        this.styleConfig.allowInlineCSS = configManager.getProperty('amdwiki.style.security.allowInlineCSS', this.styleConfig.allowInlineCSS);
        
        // Load predefined class sets (modular class definitions)
        await this.loadPredefinedClasses(configManager);
        
        // Load allowed CSS properties for security (modular security configuration)
        await this.loadAllowedCSSProperties(configManager);
        
      } catch (error) {
        console.warn('⚠️  Failed to load WikiStyleHandler configuration, using defaults:', error.message);
        this.loadDefaultConfiguration();
      }
    } else {
      this.loadDefaultConfiguration();
    }
  }

  /**
   * Load predefined CSS classes from configuration (modular class system)
   * @param {Object} configManager - Configuration manager
   */
  async loadPredefinedClasses(configManager) {
    // Load text styling classes
    const textClasses = configManager.getProperty('amdwiki.style.predefined.text', '').split(',');
    textClasses.forEach(cls => cls.trim() && this.predefinedClasses.add(cls.trim()));
    
    // Load background classes
    const backgroundClasses = configManager.getProperty('amdwiki.style.predefined.background', '').split(',');
    backgroundClasses.forEach(cls => cls.trim() && this.predefinedClasses.add(cls.trim()));
    
    // Load layout classes
    const layoutClasses = configManager.getProperty('amdwiki.style.predefined.layout', '').split(',');
    layoutClasses.forEach(cls => cls.trim() && this.predefinedClasses.add(cls.trim()));
    
    // Load any custom predefined classes
    const customClasses = configManager.getProperty('amdwiki.style.predefined.custom', '').split(',');
    customClasses.forEach(cls => cls.trim() && this.predefinedClasses.add(cls.trim()));
  }

  /**
   * Load allowed CSS properties for security (modular security configuration)
   * @param {Object} configManager - Configuration manager
   */
  async loadAllowedCSSProperties(configManager) {
    const allowedProps = configManager.getProperty('amdwiki.style.security.allowedProperties', '').split(',');
    allowedProps.forEach(prop => prop.trim() && this.allowedCSSProperties.add(prop.trim()));
    
    // Add default safe properties if none configured
    if (this.allowedCSSProperties.size === 0) {
      ['color', 'background-color', 'font-weight', 'font-style', 'text-align'].forEach(prop => {
        this.allowedCSSProperties.add(prop);
      });
    }
  }

  /**
   * Load default configuration when ConfigurationManager unavailable (modular fallback)
   */
  loadDefaultConfiguration() {
    // Default predefined classes (Bootstrap-compatible + JSPWiki table styles)
    const defaultClasses = [
      // Text styling
      'text-primary', 'text-secondary', 'text-success', 'text-danger', 'text-warning', 'text-info',
      'text-muted', 'text-white', 'text-dark',

      // Background styling
      'bg-primary', 'bg-secondary', 'bg-success', 'bg-danger', 'bg-warning', 'bg-info',
      'bg-light', 'bg-dark', 'bg-white',

      // Layout and alignment
      'text-center', 'text-left', 'text-right', 'text-justify',
      'float-left', 'float-right', 'clearfix',

      // Typography
      'fw-bold', 'fw-normal', 'fw-light', 'fst-italic', 'fst-normal',
      'text-decoration-underline', 'text-decoration-line-through',

      // JSPWiki table classes
      'sortable', 'table-filter', 'zebra-table', 'table-striped', 'table-hover',
      'table-fit', 'table-bordered', 'table-sm', 'table-responsive',

      // JSPWiki block classes
      'collapse', 'collapsebox', 'columns', 'quote', 'information', 'warning', 'error',
      'commentbox', 'ltr', 'rtl', 'small', 'sub', 'sup', 'strike', 'center'
    ];

    defaultClasses.forEach(cls => this.predefinedClasses.add(cls));

    // Default allowed CSS properties
    ['color', 'background-color', 'font-weight', 'font-style', 'text-align', 'text-decoration'].forEach(prop => {
      this.allowedCSSProperties.add(prop);
    });
  }

  /**
   * Process content by finding and applying WikiStyle syntax
   * Handles nested blocks by processing them recursively from innermost to outermost
   * @param {string} content - Content to process
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Content with styles applied
   */
  async process(content, context) {
    if (!content) {
      return content;
    }

    // Process nested blocks recursively by finding innermost blocks first
    let processedContent = content;
    let hasChanges = true;
    let iterations = 0;
    const maxIterations = 20; // Prevent infinite loops

    while (hasChanges && iterations < maxIterations) {
      hasChanges = false;
      iterations++;

      const matches = [];
      let match;

      // Reset regex state
      this.pattern.lastIndex = 0;

      while ((match = this.pattern.exec(processedContent)) !== null) {
        matches.push({
          fullMatch: match[0],
          styleInfo: match[1].trim(), // CSS classes or inline styles
          textContent: match[2].trim(), // Content to style
          index: match.index,
          length: match[0].length
        });
      }

      if (matches.length === 0) {
        break;
      }

      // Process matches in reverse order to maintain string positions
      for (let i = matches.length - 1; i >= 0; i--) {
        const matchInfo = matches[i];

        try {
          const replacement = await this.handle(matchInfo, context);

          // Only replace if the content changed
          if (replacement !== matchInfo.fullMatch) {
            processedContent =
              processedContent.slice(0, matchInfo.index) +
              replacement +
              processedContent.slice(matchInfo.index + matchInfo.length);
            hasChanges = true;
          }

        } catch (error) {
          console.error(`❌ WikiStyle processing error:`, error.message);

          // Leave original content on error for debugging
          const errorPlaceholder = `<!-- WikiStyle Error: ${error.message} -->`;
          processedContent =
            processedContent.slice(0, matchInfo.index) +
            errorPlaceholder + matchInfo.textContent +
            processedContent.slice(matchInfo.index + matchInfo.length);
          hasChanges = true;
        }
      }
    }

    if (iterations >= maxIterations) {
      console.warn('⚠️  WikiStyleHandler: Max iterations reached, possible infinite loop');
    }

    return processedContent;
  }

  /**
   * Handle a specific WikiStyle match with modular processing
   * @param {Object} matchInfo - Style match information
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Styled content HTML
   */
  async handle(matchInfo, context) {
    const { styleInfo, textContent } = matchInfo;
    
    // Check cache for style result if caching enabled
    if (this.options.cacheEnabled) {
      const cachedResult = await this.getCachedStyleResult(matchInfo, context);
      if (cachedResult) {
        return cachedResult;
      }
    }

    let styledHtml;
    
    // Determine if styleInfo contains CSS classes or inline styles
    if (styleInfo.includes(':')) {
      // Inline CSS style: %%(color:red; font-weight:bold) content /%
      styledHtml = await this.processInlineStyle(styleInfo, textContent, context);
    } else {
      // CSS class assignment: %%class1 class2 content /%
      styledHtml = await this.processCSSClasses(styleInfo, textContent, context);
    }

    // Cache the result if caching enabled
    if (this.options.cacheEnabled && styledHtml) {
      await this.cacheStyleResult(matchInfo, context, styledHtml);
    }
    
    return styledHtml;
  }

  /**
   * Process CSS class assignment (modular class handling)
   * @param {string} classInfo - CSS class information
   * @param {string} content - Content to style
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Styled HTML
   */
  async processCSSClasses(classInfo, content, context) {
    const classNames = classInfo.split(/\s+/).filter(cls => cls.trim());
    const validClasses = [];

    // Validate each class (modular security)
    for (const className of classNames) {
      if (this.isValidCSSClass(className)) {
        validClasses.push(className);
      } else {
        console.warn(`⚠️  Invalid or unsafe CSS class rejected: ${className}`);
      }
    }

    if (validClasses.length === 0) {
      // No valid classes, return content without styling
      return content;
    }

    const classAttribute = validClasses.join(' ');

    // Table-specific classes that need to be applied to <table> elements
    const tableClasses = ['sortable', 'table-filter', 'zebra-table', 'table-striped',
                          'table-hover', 'table-fit', 'table-bordered', 'table-sm',
                          'table-responsive'];

    const hasTableClass = validClasses.some(cls => tableClasses.includes(cls));

    // Check if content contains JSPWiki table syntax or HTML table
    // Also check deeper in content for tables nested inside other %% blocks
    const hasTableSyntax = /(\|\||<table)/i.test(content) || /%%TABLE_CLASSES\{/.test(content);

    if (hasTableClass && hasTableSyntax) {
      // For table content, inject classes using a special marker that will be processed
      // by the table handler later in the pipeline

      // Check if content already has table class markers (from nested blocks)
      // Look for markers anywhere in the content, not just at the start
      const existingMarkerMatch = content.match(/%%TABLE_CLASSES\{([^}]+)\}%%/);
      if (existingMarkerMatch) {
        // Extract existing classes and merge them
        const mergedClasses = `${classAttribute} ${existingMarkerMatch[1]}`;
        // Replace the existing marker with merged classes
        return content.replace(/%%TABLE_CLASSES\{[^}]+\}%%/, `%%TABLE_CLASSES{${this.escapeHtml(mergedClasses)}}%%`);
      }

      // No existing marker, add new one at the beginning
      return `%%TABLE_CLASSES{${this.escapeHtml(classAttribute)}}%%${content}`;
    }

    // Check if content already has HTML tags (is already processed)
    if (/<[a-z][\s\S]*>/i.test(content)) {
      // Try to apply class to existing HTML element
      const existingTable = content.match(/<table([^>]*)>/i);
      if (existingTable && hasTableClass) {
        // Add classes to existing table tag
        const existingClasses = existingTable[1].match(/class=["']([^"']*)["']/);
        if (existingClasses) {
          const mergedClasses = `${existingClasses[1]} ${classAttribute}`;
          return content.replace(/<table([^>]*)>/i,
            `<table${existingTable[1].replace(/class=["'][^"']*["']/, `class="${this.escapeHtml(mergedClasses)}"`)}>`);
        } else {
          return content.replace(/<table([^>]*)>/i,
            `<table${existingTable[1]} class="${this.escapeHtml(classAttribute)}">`);
        }
      }
      // Wrap other HTML content in div
      return `<div class="${this.escapeHtml(classAttribute)}">${content}</div>`;
    }

    // For non-table content or inline content without HTML, use div for block classes
    const blockClasses = ['information', 'warning', 'error', 'quote', 'commentbox',
                          'center', 'columns', 'collapse', 'collapsebox'];
    const hasBlockClass = validClasses.some(cls => blockClasses.includes(cls));

    if (hasBlockClass || content.includes('\n')) {
      return `<div class="${this.escapeHtml(classAttribute)}">${content}</div>`;
    }

    // Default: use span for inline content
    return `<span class="${this.escapeHtml(classAttribute)}">${content}</span>`;
  }

  /**
   * Process inline CSS styles (modular security validation)
   * @param {string} styleInfo - Inline style information  
   * @param {string} content - Content to style
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Styled HTML
   */
  async processInlineStyle(styleInfo, content, context) {
    if (!this.styleConfig.allowInlineCSS) {
      console.warn('⚠️  Inline CSS disabled by security configuration');
      return content; // Return unstyled content
    }

    // Parse CSS properties from parentheses: (color:red; font-weight:bold)
    const cssMatch = styleInfo.match(/^\((.+)\)$/);
    if (!cssMatch) {
      throw new Error('Invalid inline style format, expected: (property:value)');
    }
    
    const cssDeclarations = cssMatch[1];
    const validStyles = this.validateInlineCSS(cssDeclarations);
    
    if (validStyles.length === 0) {
      console.warn('⚠️  No valid CSS properties found in inline style');
      return content;
    }
    
    const styleAttribute = validStyles.join('; ');
    return `<span style="${this.escapeHtml(styleAttribute)}">${content}</span>`;
  }

  /**
   * Validate CSS class name (modular validation system)
   * @param {string} className - CSS class name to validate
   * @returns {boolean} - True if valid and safe
   */
  isValidCSSClass(className) {
    // Security validation - prevent dangerous class names
    if (this.containsDangerousContent(className)) {
      return false;
    }
    
    // Check against predefined classes (most secure)
    if (this.predefinedClasses.has(className)) {
      return true;
    }
    
    // Allow custom classes if enabled and they follow naming conventions
    if (this.styleConfig.customClasses) {
      // Valid CSS class name pattern
      const validClassPattern = /^[a-zA-Z][\w-]*$/;
      return validClassPattern.test(className);
    }
    
    return false;
  }

  /**
   * Validate inline CSS declarations (modular security system)
   * @param {string} cssDeclarations - CSS declarations string
   * @returns {Array<string>} - Array of valid CSS declarations
   */
  validateInlineCSS(cssDeclarations) {
    const validDeclarations = [];
    const declarations = cssDeclarations.split(';').map(decl => decl.trim()).filter(decl => decl);
    
    for (const declaration of declarations) {
      const [property, value] = declaration.split(':').map(part => part.trim());
      
      if (!property || !value) {
        continue;
      }
      
      // Validate CSS property (modular security)
      if (!this.isAllowedCSSProperty(property)) {
        console.warn(`⚠️  CSS property '${property}' not allowed by security configuration`);
        continue;
      }
      
      // Validate CSS value (modular security)
      if (!this.isValidCSSValue(value)) {
        console.warn(`⚠️  CSS value '${value}' contains potentially unsafe content`);
        continue;
      }
      
      validDeclarations.push(`${property}: ${value}`);
    }
    
    return validDeclarations;
  }

  /**
   * Check if CSS property is allowed (modular security configuration)
   * @param {string} property - CSS property name
   * @returns {boolean} - True if allowed
   */
  isAllowedCSSProperty(property) {
    return this.allowedCSSProperties.has(property.toLowerCase());
  }

  /**
   * Validate CSS value for security (modular security validation)
   * @param {string} value - CSS value to validate
   * @returns {boolean} - True if safe
   */
  isValidCSSValue(value) {
    // Prevent dangerous CSS values
    const dangerousPatterns = [
      /javascript:/i,
      /expression\s*\(/i,
      /url\s*\(/i,
      /@import/i,
      /behavior\s*:/i,
      /-moz-binding/i
    ];
    
    return !dangerousPatterns.some(pattern => pattern.test(value));
  }

  /**
   * Check for dangerous content in class names (modular security)
   * @param {string} content - Content to check
   * @returns {boolean} - True if dangerous content found
   */
  containsDangerousContent(content) {
    const dangerousPatterns = [
      /[<>]/,           // HTML tags
      /javascript:/i,   // JavaScript URLs
      /on\w+=/i,        // Event handlers
      /style\s*=/i,     // Inline style attributes
      /expression/i     // CSS expressions
    ];
    
    return dangerousPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Get cached style result
   * @param {Object} matchInfo - Style match information
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string|null>} - Cached result or null
   */
  async getCachedStyleResult(matchInfo, context) {
    const markupParser = this.engine?.getManager('MarkupParser');
    if (!markupParser) {
      return null;
    }
    
    const contentHash = this.generateContentHash(matchInfo.fullMatch);
    const contextHash = this.generateContextHash(context);
    
    return await markupParser.getCachedHandlerResult(this.handlerId, contentHash, contextHash);
  }

  /**
   * Cache style result
   * @param {Object} matchInfo - Style match information
   * @param {ParseContext} context - Parse context
   * @param {string} result - HTML result to cache
   */
  async cacheStyleResult(matchInfo, context, result) {
    const markupParser = this.engine?.getManager('MarkupParser');
    if (!markupParser) {
      return;
    }
    
    const contentHash = this.generateContentHash(matchInfo.fullMatch);
    const contextHash = this.generateContextHash(context);
    
    await markupParser.cacheHandlerResult(this.handlerId, contentHash, contextHash, result);
  }

  /**
   * Generate content hash for caching (modular caching)
   * @param {string} content - Content to hash
   * @returns {string} - Content hash
   */
  generateContentHash(content) {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(content).digest('hex');
  }

  /**
   * Generate context hash for caching (modular caching)
   * @param {ParseContext} context - Parse context
   * @returns {string} - Context hash
   */
  generateContextHash(context) {
    const crypto = require('crypto');
    const contextData = {
      // Style processing is generally context-independent
      // But include basic context for cache variation
      timeBucket: Math.floor(Date.now() / 3600000) // 1-hour buckets
    };
    
    return crypto.createHash('md5').update(JSON.stringify(contextData)).digest('hex');
  }

  /**
   * Escape HTML to prevent XSS (modular security)
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
   * Get configuration summary for debugging (modular introspection)
   * @returns {Object} - Configuration summary
   */
  getConfigurationSummary() {
    return {
      handler: {
        enabled: this.config?.enabled || false,
        priority: this.priority,
        cacheEnabled: this.options.cacheEnabled
      },
      features: {
        customClasses: this.styleConfig?.customClasses || false,
        bootstrap: this.styleConfig?.bootstrap || false,
        allowInlineCSS: this.styleConfig?.allowInlineCSS || false,
        securityValidation: this.styleConfig?.securityValidation || true
      },
      security: {
        predefinedClassCount: this.predefinedClasses.size,
        allowedCSSPropertyCount: this.allowedCSSProperties.size,
        inlineCSSAllowed: this.styleConfig?.allowInlineCSS || false
      },
      classes: {
        predefined: Array.from(this.predefinedClasses).slice(0, 10), // Show first 10
        total: this.predefinedClasses.size
      }
    };
  }

  /**
   * Get supported style patterns (modular documentation)
   * @returns {Array<string>} - Array of supported patterns
   */
  getSupportedPatterns() {
    return [
      '%%text-primary Important text /%',
      '%%bg-warning text-center Warning message /%',
      '%%fw-bold Custom bold text /%',
      '%%(color:red) Red text /% (if inline CSS enabled)',
      '%%(color:blue; font-weight:bold) Blue bold text /% (if inline CSS enabled)'
    ];
  }

  /**
   * Get predefined CSS classes organized by category (modular organization)
   * @returns {Object} - Categorized predefined classes
   */
  getPredefinedClassesByCategory() {
    const categories = {
      text: [],
      background: [],
      layout: [],
      typography: [],
      other: []
    };
    
    for (const className of this.predefinedClasses) {
      if (className.startsWith('text-')) {
        categories.text.push(className);
      } else if (className.startsWith('bg-')) {
        categories.background.push(className);
      } else if (className.includes('center') || className.includes('left') || className.includes('right') || className.includes('float')) {
        categories.layout.push(className);
      } else if (className.includes('fw-') || className.includes('fst-') || className.includes('decoration')) {
        categories.typography.push(className);
      } else {
        categories.other.push(className);
      }
    }
    
    return categories;
  }

  /**
   * Add custom CSS class (modular extensibility)
   * @param {string} className - Class name to add
   * @returns {boolean} - True if added successfully
   */
  addCustomClass(className) {
    if (this.isValidCSSClass(className) && !this.predefinedClasses.has(className)) {
      this.predefinedClasses.add(className);
      console.log(`🎨 Added custom CSS class: ${className}`);
      return true;
    }
    return false;
  }

  /**
   * Remove custom CSS class (modular management)
   * @param {string} className - Class name to remove
   * @returns {boolean} - True if removed successfully
   */
  removeCustomClass(className) {
    if (this.predefinedClasses.has(className)) {
      this.predefinedClasses.delete(className);
      console.log(`🗑️  Removed custom CSS class: ${className}`);
      return true;
    }
    return false;
  }

  /**
   * Get handler information for debugging and documentation (modular introspection)
   * @returns {Object} - Handler information
   */
  getInfo() {
    return {
      ...super.getMetadata(),
      supportedPatterns: this.getSupportedPatterns(),
      configuration: this.getConfigurationSummary(),
      predefinedClasses: this.getPredefinedClassesByCategory(),
      features: [
        'CSS class assignment',
        'Bootstrap integration',
        'Inline CSS support (security-controlled)',
        'Predefined class library',
        'Custom class support',
        'Security validation',
        'XSS prevention',
        'Modular configuration system',
        'Hot-reload configuration',
        'Performance caching'
      ],
      security: [
        'CSS injection prevention',
        'Property whitelist validation',
        'Class name validation',
        'Dangerous content filtering',
        'Configurable security levels'
      ],
      configurationSources: [
        'app-default-config.json (base configuration)',
        'app-custom-config.json (user overrides)',
        'MarkupParser handler configuration',
        'Runtime class additions'
      ]
    };
  }
}

module.exports = WikiStyleHandler;
