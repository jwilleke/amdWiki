const BaseManager = require('./BaseManager');

/**
 * ACLManager - Access Control List Manager
 * Parses and evaluates page-level access control using JSPWiki-style syntax
 * Integrates with permissions from UserManager
 */
class ACLManager extends BaseManager {
  constructor(engine) {
    super(engine);
    this.aclCache = new Map(); // pageName -> parsed ACL
  }

  async initialize(config = {}) {
    await super.initialize(config);
    console.log('🔒 ACLManager initialized');
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
   * Check page permission with default read access policy
   * @param {string} pageName - Name of the page
   * @param {string} action - Action to check (view, edit, delete, rename, upload)
   * @param {Object} user - User object (null for anonymous)
   * @param {string} pageContent - Page content to parse ACL from
   * @returns {boolean} True if permission granted
   */
  async checkPagePermission(pageName, action, user, pageContent) {
    const userManager = this.engine.getManager('UserManager');
    if (!userManager) {
      throw new Error('UserManager not available');
    }

    // If user has admin:system permission, always allow
    if (user && userManager.hasPermission(user.username, 'admin:system')) {
      return true;
    }

    // Parse ACL from page content
    const acl = this.parseACL(pageContent);
    
    // If ACL exists, use ACL rules
    if (acl) {
      const allowedPrincipals = acl[action.toLowerCase()] || [];
      
      // If specific ACL for this action exists, check it
      if (allowedPrincipals.length > 0) {
        return this.userMatchesPrincipals(user, allowedPrincipals);
      }
    }

    // Default policy: Allow read access to all pages unless it's a system/admin page
    if (action.toLowerCase() === 'view') {
      // Check if this is a system/admin page that should be restricted
      if (this.isSystemOrAdminPage(pageName)) {
        // System/admin pages require proper permissions
        return this.checkDefaultPermission(action, user);
      }
      // Regular pages are readable by everyone (including anonymous)
      return true;
    }
    
    // For non-view actions (edit, delete, etc.), check role-based permissions
    return this.checkDefaultPermission(action, user);
  }

  /**
   * Check if a page is a system or admin page that should have restricted access
   * @param {string} pageName - Name of the page
   * @returns {boolean} True if this is a system/admin page
   */
  isSystemOrAdminPage(pageName) {
    if (!pageName) return false;
    
    const systemPages = [
      'admin', 'users', 'roles', 'permissions', 'system', 'config', 'settings',
      'user-manager', 'role-manager', 'permission-manager', 'acl-manager'
    ];
    
    const pageNameLower = pageName.toLowerCase();
    
    // Check if page name starts with admin/ or system/
    if (pageNameLower.startsWith('admin/') || pageNameLower.startsWith('system/')) {
      return true;
    }
    
    // Check if page name is in system pages list
    return systemPages.some(sysPage => 
      pageNameLower === sysPage || 
      pageNameLower.includes(sysPage)
    );
  }

  /**
   * Check default role-based permission when no ACL exists
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
