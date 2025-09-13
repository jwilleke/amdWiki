const BaseManager = require('./BaseManager');
const StorageLocationPermissionConfig = require('../../config/StorageLocationPermissionConfig');

/**
 * ACLManager - Access Control List Manager
 * Parses and evaluates page-level access control using JSPWiki-style syntax
 * Integrates with permissions from UserManager and storage location policies
 */
class ACLManager extends BaseManager {
  constructor(engine) {
    super(engine);
    this.aclCache = new Map(); // pageName -> parsed ACL
    this.permissionCache = new Map(); // Cache for permission decisions
    this.storageConfig = StorageLocationPermissionConfig;
  }

  async initialize(config = {}) {
    await super.initialize(config);
    
    // Initialize permission caching if enabled
    if (this.storageConfig.performance.enablePermissionCache) {
      this.setupPermissionCache();
    }
    
    console.log('🔒 ACLManager initialized with storage location permission integration');
  }

  /**
   * Setup permission caching system
   */
  setupPermissionCache() {
    // Clear cache periodically to prevent stale data
    // Use unref() to prevent the timer from keeping the process alive during tests
    this.cacheCleanupInterval = setInterval(() => {
      if (this.permissionCache) {
        this.permissionCache.clear();
      }
    }, this.storageConfig.performance.permissionCacheTTL);
    
    // Don't keep the process alive for this timer (important for tests)
    this.cacheCleanupInterval.unref();
  }

  /**
   * Cleanup method for tests
   */
  cleanup() {
    if (this.cacheCleanupInterval) {
      clearInterval(this.cacheCleanupInterval);
      this.cacheCleanupInterval = null;
    }
    if (this.permissionCache) {
      this.permissionCache.clear();
    }
  }

  /**
   * Parse ACL from page content
   * Supports JSPWiki-style syntax: [{ALLOW action user,role,group}]
   * @param {string} content - Page content
   * @returns {Object} Parsed ACL rules
   */
  parseACL(content) {
    if (!content) return null;

    const aclRules = {
      view: [],
      edit: [],
      delete: [],
      rename: [],
      upload: []
    };

    // Regex to match [{ALLOW action principals}] or [{DENY action principals}]
    const aclRegex = /\[\{(ALLOW|DENY)\s+(view|edit|delete|rename|upload)\s+([^}]+)\}\]/gi;
    
    let match;
    while ((match = aclRegex.exec(content)) !== null) {
      const [fullMatch, permission, action, principals] = match;
      
      // Parse principals (comma-separated list)
      const principalList = principals.split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      if (permission.toUpperCase() === 'ALLOW') {
        aclRules[action.toLowerCase()] = principalList;
      }
      // Note: We don't implement DENY to keep security model simple
      // (following JSPWiki's philosophy of "deny by default")
    }

    // Return null if no ACL rules found
    const hasRules = Object.values(aclRules).some(rules => rules.length > 0);
    return hasRules ? aclRules : null;
  }

  /**
   * Check page permission with storage location awareness
   * @param {string} pageName - Name of the page
   * @param {string} action - Action to check (view, edit, delete, rename, upload)
   * @param {Object} user - User object (null for anonymous)
   * @param {string} pageContent - Page content to parse ACL from
   * @param {Object} pageMetadata - Page metadata (optional, for storage location detection)
   * @returns {boolean} True if permission granted
   */
  async checkPagePermission(pageName, action, user, pageContent, pageMetadata = null) {
    const userManager = this.engine.getManager('UserManager');
    if (!userManager) {
      throw new Error('UserManager not available');
    }

    // Check permission cache if enabled
    const cacheKey = this.generatePermissionCacheKey(pageName, action, user);
    if (this.storageConfig.performance.enablePermissionCache && this.permissionCache.has(cacheKey)) {
      return this.permissionCache.get(cacheKey);
    }

    let result;

    // If user has admin:system permission, always allow
    if (user && userManager.hasPermission(user.username, 'admin:system')) {
      result = true;
    } else {
      result = await this.checkPagePermissionInternal(pageName, action, user, pageContent, pageMetadata);
    }

    // Cache the result if caching is enabled
    if (this.storageConfig.performance.enablePermissionCache) {
      if (this.permissionCache.size >= this.storageConfig.performance.maxCacheEntries) {
        // Clear oldest entries if cache is full
        const oldestKey = this.permissionCache.keys().next().value;
        this.permissionCache.delete(oldestKey);
      }
      this.permissionCache.set(cacheKey, result);
    }

    // Log audit trail if enabled
    if (this.storageConfig.security.enableAuditLog) {
      this.logPermissionDecision(pageName, action, user, result, pageMetadata);
    }

    return result;
  }

  /**
   * Internal permission checking logic with storage location integration
   * @param {string} pageName - Name of the page
   * @param {string} action - Action to check
   * @param {Object} user - User object
   * @param {string} pageContent - Page content
   * @param {Object} pageMetadata - Page metadata
   * @returns {boolean} Permission decision
   */
  async checkPagePermissionInternal(pageName, action, user, pageContent, pageMetadata) {
    // Provide fallback for backward compatibility when metadata is not provided
    if (!pageMetadata) {
      // Still check ACL markup even without metadata for backward compatibility
      const acl = this.parseACL(pageContent);
      if (acl) {
        const allowedPrincipals = acl[action.toLowerCase()] || [];
        if (allowedPrincipals.length > 0) {
          return this.userMatchesPrincipals(user, allowedPrincipals);
        }
      }

      // Try the old system/admin page detection for backward compatibility
      if (action.toLowerCase() === 'view') {
        if (this.isSystemOrAdminPage(pageName)) {
          return this.checkDefaultPermission(action, user);
        }
        return true; // Default: regular pages are readable by everyone
      }
      // For non-view actions, check role-based permissions
      return this.checkDefaultPermission(action, user);
    }

    // Get storage location for this page
    const storageLocation = await this.getPageStorageLocation(pageName, pageMetadata);
    const storageConfig = this.storageConfig.storageLocationPolicies[storageLocation];

    // Check for always restricted pages
    if (this.isAlwaysRestrictedPage(pageName)) {
      return this.checkAdminOnlyPermission(user);
    }

    // Check ACL markup (if allowed by storage configuration)
    if (storageConfig && storageConfig.allowACLOverride) {
      const acl = this.parseACL(pageContent);
      if (acl) {
        const allowedPrincipals = acl[action.toLowerCase()] || [];
        if (allowedPrincipals.length > 0) {
          return this.userMatchesPrincipals(user, allowedPrincipals);
        }
      }
    } else {
      // Even if ACL override is disabled, still check ACL for non-system pages
      // This maintains some backward compatibility
      if (!this.isSystemOrAdminPage(pageName)) {
        const acl = this.parseACL(pageContent);
        if (acl) {
          const allowedPrincipals = acl[action.toLowerCase()] || [];
          if (allowedPrincipals.length > 0) {
            return this.userMatchesPrincipals(user, allowedPrincipals);
          }
        }
      }
    }

    // Check storage location-based default permissions
    if (storageConfig) {
      return this.checkStorageLocationPermission(storageLocation, action, user, pageName);
    }

    // Final fallback to legacy behavior
    return this.checkDefaultPermission(action, user);
  }

  /**
   * Get storage location for a page based on metadata or PageManager logic
   * @param {string} pageName - Name of the page
   * @param {Object} pageMetadata - Page metadata (optional)
   * @returns {string} Storage location ('pages', 'required-pages', or 'docs')
   */
  async getPageStorageLocation(pageName, pageMetadata = null) {
    // If metadata is provided, use it to determine storage location
    if (pageMetadata && pageMetadata['system-category']) {
      const category = pageMetadata['system-category'];
      return this.storageConfig.categoryToStorageMapping[category] || 'pages';
    }

    // Try to get metadata from PageManager
    const pageManager = this.engine.getManager('PageManager');
    if (pageManager) {
      try {
        // Check if it's a required page using PageManager logic
        const isRequired = await pageManager.isRequiredPage(pageName, pageMetadata);
        return isRequired ? 'required-pages' : 'pages';
      } catch (err) {
        // If PageManager fails, fall back to default
        console.warn(`Could not determine storage location for page ${pageName}:`, err.message);
      }
    }

    // Default to pages directory
    return 'pages';
  }

  /**
   * Check storage location-based default permissions
   * @param {string} storageLocation - Storage location
   * @param {string} action - Action to check
   * @param {Object} user - User object
   * @param {string} pageName - Page name (for pattern matching)
   * @returns {boolean} Permission granted
   */
  checkStorageLocationPermission(storageLocation, action, user, pageName) {
    const storageConfig = this.storageConfig.storageLocationPolicies[storageLocation];
    if (!storageConfig) {
      // If no storage config found, fall back to legacy behavior
      return this.checkDefaultPermission(action, user);
    }

    // Check if page matches restricted patterns
    if (this.matchesRestrictedPattern(pageName, storageConfig.restrictedPatterns)) {
      // For restricted patterns, use more restrictive permissions
      return this.checkRestrictedPatternPermission(action, user);
    }

    // Check default permissions for this storage location
    const allowedRoles = storageConfig.defaultPermissions[action.toLowerCase()] || [];
    return this.userMatchesPrincipals(user, allowedRoles);
  }

  /**
   * Check if page name matches any restricted patterns
   * @param {string} pageName - Page name to check
   * @param {Array} patterns - Array of glob-like patterns
   * @returns {boolean} True if matches any pattern
   */
  matchesRestrictedPattern(pageName, patterns) {
    if (!patterns || patterns.length === 0) {
      return false;
    }

    const pageNameLower = pageName.toLowerCase();
    return patterns.some(pattern => {
      const patternLower = pattern.toLowerCase();
      if (patternLower.endsWith('*')) {
        return pageNameLower.startsWith(patternLower.slice(0, -1));
      }
      return pageNameLower === patternLower;
    });
  }

  /**
   * Check permissions for restricted pattern pages
   * @param {string} action - Action to check
   * @param {Object} user - User object
   * @returns {boolean} Permission granted
   */
  checkRestrictedPatternPermission(action, user) {
    // Restricted pattern pages require admin access for most actions
    const userManager = this.engine.getManager('UserManager');
    if (!userManager) return false;

    // View permission might be allowed for authenticated users
    if (action.toLowerCase() === 'view') {
      return userManager.hasPermission(user?.username, 'page:read') ||
             userManager.hasRole(user?.username, 'admin');
    }

    // All other actions require admin
    return userManager.hasRole(user?.username, 'admin');
  }

  /**
   * Check if a page is always restricted regardless of other settings
   * @param {string} pageName - Name of the page
   * @returns {boolean} True if always restricted
   */
  isAlwaysRestrictedPage(pageName) {
    if (!pageName) return false;
    
    const pageNameLower = pageName.toLowerCase();
    return this.storageConfig.security.alwaysRestrictedPages.some(restrictedPage => 
      pageNameLower === restrictedPage.toLowerCase() ||
      pageNameLower.includes(restrictedPage.toLowerCase())
    );
  }

  /**
   * Check admin-only permission
   * @param {Object} user - User object
   * @returns {boolean} True if user is admin
   */
  checkAdminOnlyPermission(user) {
    const userManager = this.engine.getManager('UserManager');
    if (!userManager) return false;

    return userManager.hasRole(user?.username, 'admin') ||
           userManager.hasPermission(user?.username, 'admin:system');
  }

  /**
   * Generate cache key for permission decisions
   * @param {string} pageName - Page name
   * @param {string} action - Action
   * @param {Object} user - User object
   * @returns {string} Cache key
   */
  generatePermissionCacheKey(pageName, action, user) {
    const username = user?.username || 'anonymous';
    const userRoles = user?.roles?.join(',') || '';
    return `${pageName}:${action}:${username}:${userRoles}`;
  }

  /**
   * Log permission decision for audit trail
   * @param {string} pageName - Page name
   * @param {string} action - Action
   * @param {Object} user - User object
   * @param {boolean} granted - Permission result
   * @param {Object} pageMetadata - Page metadata
   */
  logPermissionDecision(pageName, action, user, granted, pageMetadata) {
    // Simple console logging for now - could be enhanced with proper log files
    const username = user?.username || 'anonymous';
    const storageLocation = pageMetadata?.['system-category'] || 'unknown';
    const timestamp = new Date().toISOString();
    
    console.log(`[AUDIT] ${timestamp} - Page: ${pageName}, Action: ${action}, User: ${username}, Storage: ${storageLocation}, Granted: ${granted}`);
  }

  /**
   * Get storage location permission configuration
   * @param {string} storageLocation - Storage location to get config for
   * @returns {Object|null} Storage location config or null
   */
  getStorageLocationConfig(storageLocation) {
    return this.storageConfig.storageLocationPolicies[storageLocation] || null;
  }

  /**
   * Get all storage location configurations
   * @returns {Object} All storage location policies
   */
  getAllStorageLocationConfigs() {
    return { ...this.storageConfig.storageLocationPolicies };
  }

  /**
   * DEPRECATED: Legacy method for backward compatibility
   * Direct permission checking via UserManager
   * @param {string} username - Username (null for anonymous)
   * @param {string} permission - Permission to check
   * @returns {boolean} True if permission granted
   */
  async checkPermission(username, permission) {
    const userManager = this.engine.getManager('UserManager');
    if (!userManager) return false;
    
    return userManager.hasPermission(username, permission);
  }

  /**
   * DEPRECATED: Legacy method for backward compatibility
   * Check if a page is a system or admin page that should have restricted access
   * @param {string} pageName - Name of the page
   * @returns {boolean} True if this is a system/admin page
   */
  isSystemOrAdminPage(pageName) {
    if (!pageName) return false;
    
    const systemPages = [
      'admin', 'users', 'roles', 'permissions', 'system', 'config', 'settings',
      'user-manager', 'role-manager', 'permission-manager', 'acl-manager',
      'pageindex', 'categories', 'user keywords', 'system variables',
      'password management', 'user management', 'admin settings'
    ];
    
    const pageNameLower = pageName.toLowerCase();
    
    // Check if page name starts with admin/ or system/
    if (pageNameLower.startsWith('admin/') || pageNameLower.startsWith('system/')) {
      return true;
    }
    
    // Check if page name is in system pages list (exact match or contains)
    return systemPages.some(sysPage => 
      pageNameLower === sysPage || 
      pageNameLower.includes(sysPage) ||
      sysPage.includes(pageNameLower)
    );
  }

  /**
   * Check default role-based permission (backward compatibility)
   * @param {string} action - Action to check
   * @param {Object} user - User object
   * @returns {boolean} True if permission granted by default policy
   */
  checkDefaultPermission(action, user) {
    const userManager = this.engine.getManager('UserManager');
    if (!userManager) return false;

    // Map actions to permissions
    const actionToPermission = {
      'view': 'page:read',
      'edit': 'page:edit',
      'delete': 'page:delete',
      'rename': 'page:rename',
      'upload': 'attachment:upload'
    };

    const permission = actionToPermission[action.toLowerCase()];
    if (!permission) return false;

    // Check if user has the required permission
    if (!user) {
      // Anonymous user - check if anonymous role has permission
      return userManager.hasPermission(null, permission);
    }

    return userManager.hasPermission(user.username, permission);
  }

  /**
   * Check if user matches any of the specified principals
   * @param {Object} user - User object
   * @param {Array} principals - List of allowed principals (usernames, roles)
   * @returns {boolean} True if user matches any principal
   */
  userMatchesPrincipals(user, principals) {
    const userManager = this.engine.getManager('UserManager');
    if (!userManager) return false;

    for (const principal of principals) {
      const p = principal.toLowerCase();

      // Check built-in roles
      if (p === 'all') {
        return true; // Everyone allowed
      }
      
      // Anonymous user (no session cookie)
      if (p === 'anonymous' && (!user || user.username === 'anonymous')) {
        return true; 
      }
      
      // Asserted user (has session cookie but not authenticated)
      if (p === 'asserted' && user && user.username === 'asserted') {
        return true;
      }
      
      // Authenticated user (valid session)
      if (p === 'authenticated' && user && user.isAuthenticated) {
        return true; 
      }

      // If user is not available or not authenticated, can only match anonymous/asserted
      if (!user || !user.isAuthenticated) {
        // Check role membership for asserted users
        if (user && user.roles && user.roles.includes(principal)) {
          return true;
        }
        continue;
      }

      // Check username match (exact or wiki name)
      if (user.username.toLowerCase() === p || 
          user.fullName?.toLowerCase() === p ||
          user.wikiName?.toLowerCase() === p) {
        return true;
      }

      // Check role membership for authenticated users
      if (userManager.hasRole(user.username, principal)) {
        return true;
      }

      // Check role hierarchy - if user has a higher role, they inherit lower role permissions
      if (this.userHasRoleViaHierarchy(user, principal)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if user has role via role hierarchy
   * @param {Object} user - User object
   * @param {string} requiredRole - Required role
   * @returns {boolean} True if user has role via hierarchy
   */
  userHasRoleViaHierarchy(user, requiredRole) {
    if (!user || !user.roles) return false;

    const userManager = this.engine.getManager('UserManager');
    if (!userManager) return false;

    // Check each of the user's roles to see if any inherit the required role
    for (const userRole of user.roles) {
      const inheritedRoles = this.storageConfig.roleHierarchy[userRole.toLowerCase()] || [];
      if (inheritedRoles.includes(requiredRole.toLowerCase())) {
        return true;
      }
    }

    return false;
  }

  /**
   * Remove ACL markup from page content for display
   * @param {string} content - Page content with ACL markup
   * @returns {string} Content with ACL markup removed
   */
  removeACLMarkup(content) {
    // Handle null, undefined, or non-string content
    if (!content || typeof content !== 'string') {
      return '';
    }
    
    // Remove ACL markup but preserve other content
    const aclRegex = /\[\{(ALLOW|DENY)\s+(view|edit|delete|rename|upload)\s+([^}]+)\}\]\s*/gi;
    return content.replace(aclRegex, '').trim();
  }

  /**
   * Get ACL summary for a page (for admin/debugging)
   * @param {string} pageContent - Page content
   * @returns {Object} ACL summary
   */
  getACLSummary(pageContent) {
    const acl = this.parseACL(pageContent);
    if (!acl) {
      return { hasACL: false, message: 'No ACL defined - using default permissions' };
    }

    const summary = { hasACL: true, rules: {} };
    
    for (const [action, principals] of Object.entries(acl)) {
      if (principals.length > 0) {
        summary.rules[action] = principals;
      }
    }

    return summary;
  }
}

module.exports = ACLManager;
