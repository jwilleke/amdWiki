const BaseManager = require('./BaseManager');

/**
 * VariableManager - Manages system and user variables for amdWiki
 * Similar to JSPWiki's DefaultVariableManager
 *
 * Handles variable expansion for [{$variable}] patterns in content
 * Supports both system variables and context-aware user variables
 */
class VariableManager extends BaseManager {
  constructor(engine) {
    super(engine);
    this.variables = new Map();
    this.contextualVariables = new Map();
  }

  /**
   * Initialize the VariableManager
   */
  async initialize() {
    console.log('🔧 Initializing VariableManager...');

    // Register core system variables
    this.registerSystemVariables();

    // Register contextual variables (require user/page context)
    this.registerContextualVariables();

    console.log(`✅ VariableManager initialized with ${this.variables.size} system variables and ${this.contextualVariables.size} contextual variables`);
  }

  /**
   * Register system variables that don't require context
   */
  registerSystemVariables() {
    const configManager = this.engine.getManager('ConfigurationManager');

    // Application information variables
    this.variables.set('applicationname', () => {
      return configManager ? configManager.getApplicationName() : 'amdWiki';
    });

    this.variables.set('baseurl', () => {
      return configManager ? configManager.getBaseURL() : 'http://localhost:3000';
    });

    this.variables.set('encoding', () => {
      return configManager ? configManager.getEncoding() : 'UTF-8';
    });

    this.variables.set('frontpage', () => {
      return configManager ? configManager.getFrontPage() : 'Welcome';
    });

    this.variables.set('amdwikiversion', () => {
      return configManager ? configManager.getProperty('amdwiki.version', '1.3.2') : '1.3.2';
    });

    this.variables.set('version', () => {
      return configManager ? configManager.getProperty('amdwiki.version', '1.3.2') : '1.3.2';
    });

    // System configuration variables
    this.variables.set('pageprovider', () => {
      return configManager ? configManager.getProperty('amdwiki.pageProvider', 'FileSystemProvider') : 'FileSystemProvider';
    });

    this.variables.set('pageproviderdescription', () => {
      return 'amdWiki File System Provider';
    });

    this.variables.set('requestcontext', () => {
      return 'view'; // Default context
    });

    this.variables.set('interwikilinks', () => {
      return configManager ? configManager.getProperty('amdwiki.interWikiRef.count', '3') : '3';
    });

    this.variables.set('inlinedimages', () => {
      return configManager ? configManager.getProperty('amdwiki.translatorReader.inlineImages', 'true') : 'true';
    });

    // Runtime system variables
    this.variables.set('totalpages', () => {
      try {
        const pageManager = this.engine.getManager('PageManager');
        if (pageManager) {
          return pageManager.getTotalPagesCount().toString();
        } else {
          // Fallback: try RenderingManager's method
          const renderingManager = this.engine.getManager('RenderingManager');
          if (renderingManager && renderingManager.getTotalPagesCount) {
            return renderingManager.getTotalPagesCount().toString();
          }
        }
        return '0';
      } catch (err) {
        console.error('Error getting total pages count:', err);
        return '0';
      }
    });

    this.variables.set('uptime', () => {
      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      return `${hours}h ${minutes}m ${seconds}s`;
    });

    // Date and time variables
    this.variables.set('timestamp', () => {
      return new Date().toISOString();
    });

    this.variables.set('date', () => {
      return new Date().toLocaleDateString();
    });

    this.variables.set('time', () => {
      return new Date().toLocaleTimeString();
    });

    this.variables.set('year', () => {
      return new Date().getFullYear().toString();
    });

    // Plugin-related variables
    this.variables.set('sessionsplugin', () => {
      // Simple implementation - could be enhanced to return actual session count
      return '1';
    });
  }

  /**
   * Register contextual variables that require user/page context
   */
  registerContextualVariables() {
    // User-related variables
    this.contextualVariables.set('username', (context) => {
      return this.getUserName(context ? context.userContext : null);
    });

    this.contextualVariables.set('loginstatus', (context) => {
      return this.getLoginStatus(context ? context.userContext : null);
    });

    this.contextualVariables.set('displayname', (context) => {
      if (!context || !context.userContext) {
        return 'Anonymous';
      }

      const userContext = context.userContext;
      return userContext.displayName || userContext.username || 'Anonymous';
    });

    // Browser and network variables
    this.contextualVariables.set('useragent', (context) => {
      if (!context || !context.requestInfo) {
        return 'Unknown';
      }
      return context.requestInfo.userAgent || 'Unknown';
    });

    this.contextualVariables.set('browser', (context) => {
      if (!context || !context.requestInfo) {
        return 'Unknown';
      }
      return this.getBrowserInfo(context.requestInfo.userAgent);
    });

    this.contextualVariables.set('clientip', (context) => {
      if (!context || !context.requestInfo) {
        return 'Unknown';
      }
      return context.requestInfo.clientIp || 'Unknown';
    });

    this.contextualVariables.set('referer', (context) => {
      if (!context || !context.requestInfo) {
        return 'Direct';
      }
      return context.requestInfo.referer || 'Direct';
    });

    this.contextualVariables.set('sessionid', (context) => {
      if (!context || !context.requestInfo) {
        return 'None';
      }
      return context.requestInfo.sessionId || 'None';
    });

    this.contextualVariables.set('acceptlanguage', (context) => {
      if (!context || !context.requestInfo) {
        return 'Unknown';
      }
      return context.requestInfo.acceptLanguage || 'Unknown';
    });

    // Page-related variables
    this.contextualVariables.set('pagename', (context) => {
      if (!context || !context.pageName) {
        return 'Unknown';
      }

      const pageName = context.pageName;
      if (typeof pageName === 'string') {
        return pageName;
      }

      if (typeof pageName === 'object' && pageName) {
        // Handle edge cases where pageName might be an object
        if (pageName.username || pageName.email) {
          console.warn('VariableManager: pageName appears to be a user object');
          return 'Unknown';
        }
        return pageName.toString();
      }

      return 'Unknown';
    });
  }

  /**
   * Get the value of a variable
   * @param {string} variableName - Name of the variable
   * @param {object} context - Context object containing userContext and pageName
   * @returns {string} Variable value or error message
   */
  getVariable(variableName, context = {}) {
    const normalizedName = variableName.toLowerCase().trim();

    // Check contextual variables first
    if (this.contextualVariables.has(normalizedName)) {
      try {
        const variableFunction = this.contextualVariables.get(normalizedName);
        return variableFunction(context);
      } catch (err) {
        console.error(`Error expanding contextual variable ${variableName}:`, err);
        return `[Error: ${variableName}]`;
      }
    }

    // Check system variables
    if (this.variables.has(normalizedName)) {
      try {
        const variableFunction = this.variables.get(normalizedName);
        return variableFunction();
      } catch (err) {
        console.error(`Error expanding system variable ${variableName}:`, err);
        return `[Error: ${variableName}]`;
      }
    }

    // Variable not found
    console.warn(`Unknown variable: ${variableName}`);
    return `[Unknown: ${variableName}]`;
  }

  /**
   * Check if a variable exists
   * @param {string} variableName - Name of the variable
   * @returns {boolean} True if variable exists
   */
  hasVariable(variableName) {
    const normalizedName = variableName.toLowerCase().trim();
    return this.variables.has(normalizedName) || this.contextualVariables.has(normalizedName);
  }

  /**
   * Get all available variable names
   * @returns {Array<string>} Array of variable names
   */
  getAvailableVariables() {
    const systemVars = Array.from(this.variables.keys());
    const contextualVars = Array.from(this.contextualVariables.keys());
    return [...systemVars, ...contextualVars].sort();
  }

  /**
   * Register a custom variable
   * @param {string} name - Variable name
   * @param {Function} valueFunction - Function that returns the variable value
   * @param {boolean} isContextual - Whether the variable requires context
   */
  registerVariable(name, valueFunction, isContextual = false) {
    const normalizedName = name.toLowerCase().trim();

    if (isContextual) {
      this.contextualVariables.set(normalizedName, valueFunction);
    } else {
      this.variables.set(normalizedName, valueFunction);
    }

    console.log(`Registered ${isContextual ? 'contextual' : 'system'} variable: ${normalizedName}`);
  }

  /**
   * Unregister a variable
   * @param {string} name - Variable name
   */
  unregisterVariable(name) {
    const normalizedName = name.toLowerCase().trim();

    const removedSystem = this.variables.delete(normalizedName);
    const removedContextual = this.contextualVariables.delete(normalizedName);

    if (removedSystem || removedContextual) {
      console.log(`Unregistered variable: ${normalizedName}`);
    } else {
      console.warn(`Variable not found for unregistration: ${normalizedName}`);
    }
  }

  /**
   * Expand all variables in content
   * @param {string} content - Content with [{$variable}] patterns
   * @param {object} context - Context object with userContext and pageName
   * @returns {string} Content with expanded variables
   */
  expandVariables(content, context = {}) {
    if (!content || typeof content !== 'string') {
      return content || '';
    }

    console.log('DEBUG: VariableManager.expandVariables called with pageName:',
                typeof context.pageName, context.pageName);

    let expandedContent = content;

    // Step 1: Protect escaped variables and code blocks
    const protectedParts = [];
    let partIndex = 0;

    // Protect escaped variables [[{$variable}] -> [{$variable}] (literal, not expanded)
    expandedContent = expandedContent.replace(/\[\[\{\$([^}]+)\}\]/g, (match, variableName) => {
      const placeholder = `__PROTECTED_${partIndex}__`;
      const literalForm = `[{$${variableName}}]`;
      protectedParts[partIndex] = literalForm;
      console.log(`DEBUG: VariableManager protecting escaped variable "${match}" as "${literalForm}"`);
      partIndex++;
      return placeholder;
    });

    // Protect code blocks ```...```
    expandedContent = expandedContent.replace(/```[\s\S]*?```/g, (match) => {
      const placeholder = `__PROTECTED_${partIndex}__`;
      protectedParts[partIndex] = match;
      partIndex++;
      return placeholder;
    });

    // Protect inline code `...`
    expandedContent = expandedContent.replace(/`[^`]+`/g, (match) => {
      const placeholder = `__PROTECTED_${partIndex}__`;
      protectedParts[partIndex] = match;
      partIndex++;
      return placeholder;
    });

    // Step 2: Expand [{$variable}] patterns
    expandedContent = expandedContent.replace(/\[\{\$([^}]+)\}\]/g, (match, variableName) => {
      const varName = variableName.trim();

      // Only accept lowercase variable names
      if (varName !== varName.toLowerCase()) {
        console.warn(`VariableManager: Variable must be lowercase: ${variableName}`);
        return `[Error: ${variableName} - must be lowercase]`;
      }

      return this.getVariable(varName, context);
    });

    // Step 3: Restore protected parts
    for (let i = 0; i < partIndex; i++) {
      expandedContent = expandedContent.replace(`__PROTECTED_${i}__`, protectedParts[i]);
      console.log(`DEBUG: VariableManager restored protected part ${i}: "${protectedParts[i]}"`);
    }

    return expandedContent;
  }

  /**
   * Get user name from context
   * @param {object} userContext - User context
   * @returns {string} User name
   */
  getUserName(userContext) {
    if (!userContext) return 'Anonymous';

    if (userContext.username) {
      return userContext.username;
    }

    return 'Anonymous';
  }

  /**
   * Get user login status
   * @param {object} userContext - User context
   * @returns {string} Login status
   */
  getLoginStatus(userContext) {
    if (!userContext) return 'Anonymous';

    if (userContext.isAuthenticated) {
      return 'Authenticated';
    } else if (userContext.asserted) {
      return 'Asserted';
    }

    return 'Anonymous';
  }

  /**
   * Parse browser information from user agent string
   * @param {string} userAgent - User agent string
   * @returns {string} Browser information
   */
  getBrowserInfo(userAgent) {
    if (!userAgent) return 'Unknown';

    // Simple browser detection
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      const match = userAgent.match(/Chrome\/(\d+)/);
      return match ? `Chrome ${match[1]}` : 'Chrome';
    } else if (userAgent.includes('Firefox')) {
      const match = userAgent.match(/Firefox\/(\d+)/);
      return match ? `Firefox ${match[1]}` : 'Firefox';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      const match = userAgent.match(/Version\/(\d+)/);
      return match ? `Safari ${match[1]}` : 'Safari';
    } else if (userAgent.includes('Edg')) {
      const match = userAgent.match(/Edg\/(\d+)/);
      return match ? `Edge ${match[1]}` : 'Edge';
    } else if (userAgent.includes('OPR') || userAgent.includes('Opera')) {
      const match = userAgent.match(/(?:OPR|Opera)\/(\d+)/);
      return match ? `Opera ${match[1]}` : 'Opera';
    }

    // Fallback for unknown browsers
    return 'Unknown Browser';
  }

  /**
   * Get debugging information about variables
   * @returns {object} Debug information
   */
  getDebugInfo() {
    return {
      systemVariables: Array.from(this.variables.keys()).sort(),
      contextualVariables: Array.from(this.contextualVariables.keys()).sort(),
      totalVariables: this.variables.size + this.contextualVariables.size
    };
  }
}

module.exports = VariableManager;