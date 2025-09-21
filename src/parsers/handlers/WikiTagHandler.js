const { BaseSyntaxHandler } = require('./BaseSyntaxHandler');

/**
 * WikiTagHandler - JSP-like tag processing for conditional content and page inclusion
 * 
 * Supports JSPWiki WikiTags:
 * - <wiki:If test="condition">content</wiki:If> - Conditional display
 * - <wiki:Include page="PageName" /> - Page inclusion
 * - <wiki:UserCheck status="authenticated">content</wiki:UserCheck> - User validation
 * 
 * Related Issue: #59 - WikiTag Handler (If, Include, UserCheck)
 * Epic: #41 - Implement JSPWikiMarkupParser for Complete Enhancement Support
 */
class WikiTagHandler extends BaseSyntaxHandler {
  constructor(engine = null) {
    super(
      /<wiki:(\w+)([^>]*?)(?:\/>|>(.*?)<\/wiki:\1>)/gs, // Pattern: <wiki:TagName attributes>content</wiki:TagName>
      95, // Very high priority - process before other handlers
      {
        description: 'JSPWiki-style WikiTag handler for conditional content and page inclusion',
        version: '1.0.0',
        dependencies: ['UserManager', 'PolicyManager', 'PageManager'],
        timeout: 8000,
        cacheEnabled: true
      }
    );
    this.handlerId = 'WikiTagHandler';
    this.engine = engine;
    this.config = null;
    
    // Supported WikiTags
    this.supportedTags = new Set(['If', 'Include', 'UserCheck']);
  }

  /**
   * Initialize handler with configuration
   * @param {Object} context - Initialization context
   */
  async onInitialize(context) {
    this.engine = context.engine;
    
    // Load handler-specific configuration
    const markupParser = context.engine?.getManager('MarkupParser');
    if (markupParser) {
      this.config = markupParser.getHandlerConfig('wikitag');
      
      if (this.config.priority && this.config.priority !== this.priority) {
        this.priority = this.config.priority;
        console.log(`🔧 WikiTagHandler priority set to ${this.priority} from configuration`);
      }
    }
  }

  /**
   * Process content by finding and executing all WikiTag instances
   * @param {string} content - Content to process
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Content with WikiTags processed
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
        tagName: match[1],
        attributeString: match[2] || '',
        tagContent: match[3] || null, // null for self-closing tags
        index: match.index,
        length: match[0].length,
        selfClosing: !match[3] // true if no content between tags
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
        console.error(`❌ WikiTag execution error for ${matchInfo.tagName}:`, error.message);
        
        // Leave original tag on error for debugging
        const errorPlaceholder = `<!-- WikiTag Error: ${matchInfo.tagName} - ${error.message} -->`;
        processedContent = 
          processedContent.slice(0, matchInfo.index) +
          errorPlaceholder +
          processedContent.slice(matchInfo.index + matchInfo.length);
      }
    }

    return processedContent;
  }

  /**
   * Handle a specific WikiTag match
   * @param {Object} matchInfo - WikiTag match information
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Tag output HTML
   */
  async handle(matchInfo, context) {
    const { tagName, attributeString, tagContent, selfClosing } = matchInfo;
    
    // Validate tag is supported
    if (!this.supportedTags.has(tagName)) {
      throw new Error(`Unsupported WikiTag: ${tagName}`);
    }

    // Parse tag attributes
    const attributes = this.parseTagAttributes(attributeString);
    
    // Check cache for tag result if caching enabled
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

    // Route to specific tag handler
    let result;
    switch (tagName) {
      case 'If':
        result = await this.handleIfTag(attributes, tagContent, context);
        break;
      case 'Include':
        result = await this.handleIncludeTag(attributes, context);
        break;
      case 'UserCheck':
        result = await this.handleUserCheckTag(attributes, tagContent, context);
        break;
      default:
        throw new Error(`No handler implemented for WikiTag: ${tagName}`);
    }

    // Cache the result if caching enabled
    if (this.options.cacheEnabled && result) {
      const markupParser = this.engine?.getManager('MarkupParser');
      if (markupParser) {
        await markupParser.cacheHandlerResult(this.handlerId, contentHash, contextHash, result);
      }
    }
    
    return result || '';
  }

  /**
   * Handle wiki:If tag - conditional content display
   * @param {Object} attributes - Tag attributes
   * @param {string} content - Tag content
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Conditional content or empty string
   */
  async handleIfTag(attributes, content, context) {
    if (!content) {
      return ''; // No content to conditionally display
    }

    const condition = attributes.test;
    if (!condition) {
      throw new Error('wiki:If tag requires "test" attribute');
    }

    // Evaluate the condition
    const conditionResult = await this.evaluateCondition(condition, context);
    
    if (conditionResult) {
      // Recursively process the content through MarkupParser
      const markupParser = this.engine?.getManager('MarkupParser');
      if (markupParser) {
        return await markupParser.parse(content, {
          pageName: context.pageName,
          userName: context.userName,
          userContext: context.userContext
        });
      }
      return content;
    }
    
    return ''; // Condition failed, return empty content
  }

  /**
   * Handle wiki:Include tag - page inclusion
   * @param {Object} attributes - Tag attributes
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Included page content
   */
  async handleIncludeTag(attributes, context) {
    const pageName = attributes.page;
    if (!pageName) {
      throw new Error('wiki:Include tag requires "page" attribute');
    }

    // Security check - validate user can access the included page
    const hasPermission = await this.checkIncludePermission(pageName, context);
    if (!hasPermission) {
      throw new Error(`Access denied to include page: ${pageName}`);
    }

    // Prevent recursive inclusion
    if (this.isRecursiveInclusion(pageName, context)) {
      throw new Error(`Recursive inclusion detected for page: ${pageName}`);
    }

    // Get PageManager
    const pageManager = context.getManager('PageManager');
    if (!pageManager) {
      throw new Error('PageManager not available');
    }

    try {
      // Load the page content
      const pageData = await pageManager.getPage(pageName);
      if (!pageData) {
        return `<!-- Page not found: ${pageName} -->`;
      }

      let includeContent = pageData.content;
      
      // Handle section inclusion if specified
      if (attributes.section) {
        includeContent = this.extractSection(includeContent, attributes.section);
      }

      // Create inclusion context to track recursive includes
      const inclusionContext = context.clone({
        pageName: pageName,
        inclusionStack: [...(context.getMetadata('inclusionStack') || []), context.pageName]
      });
      inclusionContext.setMetadata('inclusionStack', inclusionContext.pageContext.inclusionStack);

      // Recursively process the included content
      const markupParser = this.engine?.getManager('MarkupParser');
      if (markupParser) {
        return await markupParser.parse(includeContent, inclusionContext.pageContext);
      }
      
      return includeContent;

    } catch (error) {
      throw new Error(`Failed to include page ${pageName}: ${error.message}`);
    }
  }

  /**
   * Handle wiki:UserCheck tag - user authentication and authorization checks
   * @param {Object} attributes - Tag attributes
   * @param {string} content - Tag content
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Content if user check passes, empty otherwise
   */
  async handleUserCheckTag(attributes, content, context) {
    if (!content) {
      return ''; // No content to conditionally display
    }

    const status = attributes.status;
    const role = attributes.role;
    const group = attributes.group;
    const user = attributes.user;

    // Evaluate user check conditions
    let checkPassed = false;

    if (status) {
      if (status === 'authenticated') {
        checkPassed = context.isAuthenticated();
      } else if (status === 'anonymous') {
        checkPassed = !context.isAuthenticated();
      }
    }

    if (role && context.isAuthenticated()) {
      checkPassed = context.hasRole(role);
    }

    if (group && context.isAuthenticated()) {
      // Check group membership (groups are treated as roles in our system)
      checkPassed = context.hasRole(group);
    }

    if (user && context.isAuthenticated()) {
      checkPassed = context.userName === user;
    }

    if (checkPassed) {
      // Recursively process the content
      const markupParser = this.engine?.getManager('MarkupParser');
      if (markupParser) {
        return await markupParser.parse(content, {
          pageName: context.pageName,
          userName: context.userName,
          userContext: context.userContext
        });
      }
      return content;
    }
    
    return ''; // User check failed
  }

  /**
   * Evaluate conditional expression for wiki:If tags
   * @param {string} condition - Condition expression to evaluate
   * @param {ParseContext} context - Parse context
   * @returns {Promise<boolean>} - True if condition passes
   */
  async evaluateCondition(condition, context) {
    // Simple condition evaluation - can be extended for complex expressions
    
    // Authentication check
    if (condition === 'authenticated') {
      return context.isAuthenticated();
    }
    
    if (condition === 'anonymous') {
      return !context.isAuthenticated();
    }

    // Permission checks: hasPermission:read, hasPermission:write
    const permissionMatch = condition.match(/^hasPermission:(\w+)$/);
    if (permissionMatch) {
      const permission = permissionMatch[1];
      return context.hasPermission(permission, context.pageName);
    }

    // Page existence checks: exists:PageName
    const existsMatch = condition.match(/^exists:(.+)$/);
    if (existsMatch) {
      const pageName = existsMatch[1];
      const pageManager = context.getManager('PageManager');
      if (pageManager) {
        try {
          const page = await pageManager.getPage(pageName);
          return !!page;
        } catch (error) {
          return false;
        }
      }
      return false;
    }

    // Variable comparisons: $user == 'admin', $pagename != 'Main'
    const variableMatch = condition.match(/^\$(\w+)\s*(==|!=)\s*['"](.+)['"]$/);
    if (variableMatch) {
      const [, varName, operator, expectedValue] = variableMatch;
      const actualValue = await this.resolveContextVariable(varName, context);
      
      if (operator === '==') {
        return actualValue === expectedValue;
      } else if (operator === '!=') {
        return actualValue !== expectedValue;
      }
    }

    // Boolean operations: authenticated && hasPermission:write
    if (condition.includes('&&') || condition.includes('||')) {
      return await this.evaluateComplexCondition(condition, context);
    }

    // Default: try to parse as boolean
    if (condition === 'true') return true;
    if (condition === 'false') return false;
    
    console.warn(`⚠️  Unknown condition in wiki:If: ${condition}`);
    return false;
  }

  /**
   * Evaluate complex boolean conditions with && and || operators
   * @param {string} condition - Complex condition expression
   * @param {ParseContext} context - Parse context
   * @returns {Promise<boolean>} - Evaluation result
   */
  async evaluateComplexCondition(condition, context) {
    // Simple implementation - can be enhanced with proper expression parsing
    
    // Handle AND operations: condition1 && condition2
    if (condition.includes('&&')) {
      const parts = condition.split('&&').map(part => part.trim());
      for (const part of parts) {
        const result = await this.evaluateCondition(part, context);
        if (!result) {
          return false; // Short-circuit on first false
        }
      }
      return true;
    }
    
    // Handle OR operations: condition1 || condition2
    if (condition.includes('||')) {
      const parts = condition.split('||').map(part => part.trim());
      for (const part of parts) {
        const result = await this.evaluateCondition(part, context);
        if (result) {
          return true; // Short-circuit on first true
        }
      }
      return false;
    }
    
    return false;
  }

  /**
   * Resolve context variable for conditions
   * @param {string} varName - Variable name
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Variable value
   */
  async resolveContextVariable(varName, context) {
    switch (varName) {
      case 'user':
      case 'username':
        return context.userName || 'anonymous';
      case 'page':
      case 'pagename':
        return context.pageName || '';
      case 'authenticated':
        return context.isAuthenticated().toString();
      default:
        // Try to resolve through VariableManager
        const variableManager = context.getManager('VariableManager');
        if (variableManager) {
          try {
            return variableManager.expandVariables(`\${${varName}}`, context.pageContext);
          } catch (error) {
            return '';
          }
        }
        return '';
    }
  }

  /**
   * Check if user has permission to include specified page
   * @param {string} pageName - Page to include
   * @param {ParseContext} context - Parse context
   * @returns {Promise<boolean>} - True if permission granted
   */
  async checkIncludePermission(pageName, context) {
    if (!context.isAuthenticated()) {
      // Check if anonymous users can read the page
      const policyManager = context.getManager('PolicyManager');
      if (policyManager) {
        return await policyManager.checkPermission(null, 'read', pageName);
      }
      return true; // Default allow for anonymous if no policy system
    }

    // Check if authenticated user has read permission
    return context.hasPermission('read', pageName);
  }

  /**
   * Check for recursive inclusion to prevent infinite loops
   * @param {string} pageName - Page being included
   * @param {ParseContext} context - Parse context
   * @returns {boolean} - True if recursive inclusion detected
   */
  isRecursiveInclusion(pageName, context) {
    const inclusionStack = context.getMetadata('inclusionStack') || [];
    return inclusionStack.includes(pageName) || context.pageName === pageName;
  }

  /**
   * Extract specific section from page content
   * @param {string} content - Full page content
   * @param {string} sectionName - Section name to extract
   * @returns {string} - Section content or full content if section not found
   */
  extractSection(content, sectionName) {
    // Look for markdown headers that match the section name
    const sectionRegex = new RegExp(`^#+\\s*${sectionName}\\s*$`, 'im');
    const lines = content.split('\n');
    
    let startIndex = -1;
    let endIndex = lines.length;
    let sectionLevel = 0;
    
    // Find section start
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const headerMatch = line.match(/^(#+)\s*(.+)\s*$/);
      
      if (headerMatch && headerMatch[2].trim().toLowerCase() === sectionName.toLowerCase()) {
        startIndex = i;
        sectionLevel = headerMatch[1].length;
        break;
      }
    }
    
    if (startIndex === -1) {
      // Section not found, return empty content with comment
      return `<!-- Section "${sectionName}" not found -->`;
    }
    
    // Find section end (next header of same or higher level)
    for (let i = startIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      const headerMatch = line.match(/^(#+)\s*(.+)\s*$/);
      
      if (headerMatch && headerMatch[1].length <= sectionLevel) {
        endIndex = i;
        break;
      }
    }
    
    return lines.slice(startIndex, endIndex).join('\n');
  }

  /**
   * Parse tag attributes from attribute string
   * @param {string} attributeString - Attribute string to parse
   * @returns {Object} - Parsed attributes
   */
  parseTagAttributes(attributeString) {
    if (!attributeString || !attributeString.trim()) {
      return {};
    }

    const attributes = {};
    // Enhanced regex to handle quoted attribute values
    const attributeRegex = /(\w+)=(?:"([^"]*)"|'([^']*)'|([^\s]+))/g;
    let match;

    while ((match = attributeRegex.exec(attributeString)) !== null) {
      const key = match[1];
      const value = match[2] || match[3] || match[4] || '';
      attributes[key] = value;
    }

    return attributes;
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
      authenticated: context.isAuthenticated(),
      roles: context.getUserRoles(),
      // Include inclusion stack in hash to handle recursive includes
      inclusionStack: context.getMetadata('inclusionStack') || [],
      timeBucket: Math.floor(Date.now() / 300000) // 5-minute buckets
    };
    
    return crypto.createHash('md5').update(JSON.stringify(contextData)).digest('hex');
  }

  /**
   * Get supported WikiTag patterns
   * @returns {Array<string>} - Array of supported patterns
   */
  getSupportedPatterns() {
    return [
      '<wiki:If test="condition">content</wiki:If>',
      '<wiki:Include page="PageName" />',
      '<wiki:Include page="PageName" section="SectionName" />',
      '<wiki:UserCheck status="authenticated">content</wiki:UserCheck>',
      '<wiki:UserCheck role="admin">content</wiki:UserCheck>',
      '<wiki:UserCheck group="editors">content</wiki:UserCheck>',
      '<wiki:UserCheck user="username">content</wiki:UserCheck>'
    ];
  }

  /**
   * Get supported conditions for wiki:If tags
   * @returns {Array<string>} - Array of supported conditions
   */
  getSupportedConditions() {
    return [
      'authenticated',
      'anonymous',
      'hasPermission:read',
      'hasPermission:write',
      'exists:PageName',
      '$user == "value"',
      '$pagename != "value"',
      'authenticated && hasPermission:write',
      'exists:PageName || hasPermission:create'
    ];
  }

  /**
   * Get handler information for debugging and documentation
   * @returns {Object} - Handler information
   */
  getInfo() {
    return {
      ...super.getMetadata(),
      supportedTags: Array.from(this.supportedTags),
      supportedPatterns: this.getSupportedPatterns(),
      supportedConditions: this.getSupportedConditions(),
      features: [
        'Conditional content display',
        'Page inclusion with security',
        'Section extraction',
        'User authentication checks',
        'Role and group validation',
        'Complex boolean conditions',
        'Recursive inclusion prevention',
        'Performance caching',
        'Security validation'
      ]
    };
  }
}

module.exports = WikiTagHandler;
