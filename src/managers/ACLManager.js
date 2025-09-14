const BaseManager = require('./BaseManager');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

/**
 * ACLManager - Access Control List Manager
 * Parses and evaluates page-level access control using JSPWiki-style syntax
 * Integrates with permissions from UserManager
 * Enhanced with context-aware permissions and audit logging
 */
class ACLManager extends BaseManager {
  constructor(engine) {
    super(engine);
    this.aclCache = new Map(); // pageName -> parsed ACL
    this.auditLog = []; // In-memory audit log
    this.accessPolicies = new Map(); // policy name -> policy definition
  }

  async initialize(config = {}) {
    await super.initialize(config);
    
    // Initialize audit logging
    await this.initializeAuditLogging();
    
    // Load access policies if enabled
    if (this.engine.getConfig().get('accessControl.policies.enabled', false)) {
      await this.loadAccessPolicies();
    }
    
    console.log('🔒 ACLManager initialized with context-aware permissions');
  }

  /**
   * Initialize audit logging system
   */
  async initializeAuditLogging() {
    const auditConfig = this.engine.getConfig().get('accessControl.audit', {});
    
    if (auditConfig.enabled) {
      const logDir = path.dirname(auditConfig.logFile || './users/access-log.json');
      try {
        await fs.mkdir(logDir, { recursive: true });
        console.log('📋 Audit logging initialized');
      } catch (error) {
        console.warn('Warning: Could not create audit log directory:', error.message);
      }
    }
  }

  /**
   * Load access policies from configuration file
   */
  async loadAccessPolicies() {
    const policiesConfig = this.engine.getConfig().get('accessControl.policies', {});
    const configFile = policiesConfig.configFile || './config/access-policies.json';
    
    try {
      const policiesData = await fs.readFile(configFile, 'utf-8');
      const policies = JSON.parse(policiesData);
      
      for (const [name, policy] of Object.entries(policies)) {
        this.accessPolicies.set(name, policy);
      }
      
      console.log(`📋 Loaded ${this.accessPolicies.size} access policies`);
    } catch (error) {
      console.log('📋 No access policies file found, using default ACL system');
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
   * Check page permission with context-aware and audit logging
   * @param {string} pageName - Name of the page
   * @param {string} action - Action to check (view, edit, delete, rename, upload)
   * @param {Object} user - User object (null for anonymous)
   * @param {string} pageContent - Page content to parse ACL from
   * @param {Object} context - Request context (IP, userAgent, etc.)
   * @returns {boolean} True if permission granted
   */
  async checkPagePermission(pageName, action, user, pageContent, context = {}) {
    const startTime = Date.now();
    let decision = false;
    let reason = 'unknown';
    
    try {
      // Check context-aware restrictions first
      const contextCheck = await this.checkContextRestrictions(user, context);
      if (!contextCheck.allowed) {
        decision = false;
        reason = contextCheck.reason;
      } else {
        // Proceed with standard ACL check
        decision = await this.performStandardACLCheck(pageName, action, user, pageContent);
        reason = decision ? 'acl_allowed' : 'acl_denied';
      }
      
      // Log the access decision
      await this.logAccessDecision({
        pageName,
        action,
        user: user ? user.username : 'anonymous',
        decision,
        reason,
        context,
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime
      });
      
      return decision;
    } catch (error) {
      // Log the error and deny access
      reason = `error: ${error.message}`;
      await this.logAccessDecision({
        pageName,
        action,
        user: user ? user.username : 'anonymous',
        decision: false,
        reason,
        context,
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime
      });
      
      return false;
    }
  }

  /**
   * Perform standard ACL check (original logic)
   * @param {string} pageName - Name of the page
   * @param {string} action - Action to check
   * @param {Object} user - User object
   * @param {string} pageContent - Page content
   * @returns {boolean} True if permission granted
   */
  async performStandardACLCheck(pageName, action, user, pageContent) {
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
   * Check default permissions for actions using UserManager
   * @param {string} action - Action to check (view, edit, delete, etc.)
   * @param {Object} user - User object or null for anonymous
   * @returns {boolean} True if user has permission, false otherwise
   */
  checkDefaultPermission(action, user) {
    const userManager = this.engine.getManager('UserManager');
    if (!userManager) {
      console.warn('UserManager not available for permission check');
      return false;
    }

    // Map actions to permission strings
    const permissionMap = {
      'view': 'page:read',
      'edit': 'page:edit',
      'delete': 'page:delete',
      'create': 'page:create'
    };

    const permission = permissionMap[action.toLowerCase()] || `page:${action.toLowerCase()}`;
    const username = user ? user.username : null;

    return userManager.hasPermission(username, permission);
  }

  /**
   * Check context-aware restrictions (time-based, maintenance mode)
   * @param {Object} user - User object
   * @param {Object} context - Request context
   * @returns {Object} { allowed: boolean, reason: string }
   */
  async checkContextRestrictions(user, context) {
    const config = this.engine.getConfig();
    const contextConfig = config.get('accessControl.contextAware', {});
    
    if (!contextConfig.enabled) {
      return { allowed: true, reason: 'context_disabled' };
    }

    // Check maintenance mode
    const maintenanceCheck = this.checkMaintenanceMode(user, contextConfig.maintenanceMode);
    if (!maintenanceCheck.allowed) {
      return maintenanceCheck;
    }

    // Check business hours (if enabled)
    const businessHoursCheck = this.checkBusinessHours(contextConfig.businessHours, contextConfig.timeZone);
    if (!businessHoursCheck.allowed) {
      return businessHoursCheck;
    }

    return { allowed: true, reason: 'context_allowed' };
  }

  /**
   * Check maintenance mode restrictions
   * @param {Object} user - User object
   * @param {Object} maintenanceConfig - Maintenance mode configuration
   * @returns {Object} { allowed: boolean, reason: string }
   */
  checkMaintenanceMode(user, maintenanceConfig = {}) {
    if (!maintenanceConfig.enabled) {
      return { allowed: true, reason: 'maintenance_disabled' };
    }

    // Check if user has allowed role during maintenance
    if (user && user.roles) {
      const allowedRoles = maintenanceConfig.allowedRoles || ['admin'];
      const hasAllowedRole = user.roles.some(role => allowedRoles.includes(role));
      
      if (hasAllowedRole) {
        return { allowed: true, reason: 'maintenance_override' };
      }
    }

    return { 
      allowed: false, 
      reason: 'maintenance_mode',
      message: maintenanceConfig.message || 'System is under maintenance'
    };
  }

  /**
   * Check business hours restrictions
   * @param {Object} businessHoursConfig - Business hours configuration
   * @param {string} timeZone - Time zone for business hours
   * @returns {Object} { allowed: boolean, reason: string }
   */
  checkBusinessHours(businessHoursConfig = {}, timeZone = 'UTC') {
    if (!businessHoursConfig.enabled) {
      return { allowed: true, reason: 'business_hours_disabled' };
    }

    try {
      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-US', { 
        timeZone, 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      const currentDay = now.toLocaleDateString('en-US', { 
        timeZone, 
        weekday: 'long' 
      }).toLowerCase();

      const allowedDays = businessHoursConfig.days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      const startTime = businessHoursConfig.start || '09:00';
      const endTime = businessHoursConfig.end || '17:00';

      // Check if current day is allowed
      if (!allowedDays.includes(currentDay)) {
        return { 
          allowed: false, 
          reason: 'outside_business_days',
          message: `Access restricted outside business days (${allowedDays.join(', ')})`
        };
      }

      // Check if current time is within business hours
      if (currentTime < startTime || currentTime > endTime) {
        return { 
          allowed: false, 
          reason: 'outside_business_hours',
          message: `Access restricted outside business hours (${startTime}-${endTime} ${timeZone})`
        };
      }

      return { allowed: true, reason: 'within_business_hours' };
    } catch (error) {
      console.warn('Error checking business hours:', error.message);
      return { allowed: true, reason: 'business_hours_error' };
    }
  }

  /**
   * Log access decision for audit trail
   * @param {Object} logEntry - Access log entry
   */
  async logAccessDecision(logEntry) {
    const auditConfig = this.engine.getConfig().get('accessControl.audit', {});
    
    if (!auditConfig.enabled) {
      return;
    }

    // Add to in-memory log
    this.auditLog.push(logEntry);

    // Keep only recent entries in memory (last 1000)
    if (this.auditLog.length > 1000) {
      this.auditLog = this.auditLog.slice(-1000);
    }

    // Write to file if configured
    if (auditConfig.logFile) {
      try {
        const logFile = auditConfig.logFile;
        const logData = JSON.stringify(logEntry) + '\n';
        await fs.appendFile(logFile, logData);
      } catch (error) {
        console.warn('Failed to write audit log:', error.message);
      }
    }
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
   * Check if a page has System/Admin category
   * @param {string} pageName - Name of the page
   * @returns {boolean} True if page has System/Admin category
   */
  async isSystemAdminCategoryPage(pageName) {
    try {
      const pageManager = this.engine.getManager('PageManager');
      const pageData = await pageManager.getPage(pageName);
      
      if (pageData && pageData.metadata) {
        const systemCategory = pageData.metadata['system-category'] || pageData.metadata.category;
        return systemCategory === 'System/Admin' || systemCategory === 'System';
      }
      
      return false;
    } catch (error) {
      console.error('Error checking page category:', error);
      return false;
    }
  }

  /**
   * Check attachment permission based on parent page
   * @param {Object} user - User object
   * @param {string} attachmentId - Attachment ID
   * @param {string} action - Action to check (view, edit, delete)
   * @returns {boolean} True if permission granted
   */
  async checkAttachmentPermission(user, attachmentId, action) {
    const userManager = this.engine.getManager('UserManager');
    const attachmentManager = this.engine.getManager('AttachmentManager');

    // Admin users always have access
    if (user && userManager.hasPermission(user.username, 'admin:system')) {
      return true;
    }

    // Get attachment to find parent page
    const attachment = attachmentManager.getAttachment(attachmentId);
    if (!attachment) {
      return false;
    }

    const pageName = attachment.pageName;

    // Check if parent page has System/Admin category
    const isSystemAdminPage = await this.isSystemAdminCategoryPage(pageName);
    if (isSystemAdminPage) {
      // System/Admin pages require admin permissions for attachments too
      return user && userManager.hasPermission(user.username, 'admin:system') ? true : false;
    }

    // For regular pages, check standard page permissions
    // Get page content to check ACL rules
    const pageManager = this.engine.getManager('PageManager');
    const pageData = await pageManager.getPage(pageName);
    const pageContent = pageData ? pageData.content : '';

    return await this.checkPagePermission(pageName, action, user, pageContent);
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

  /**
   * Get recent access log entries (for admin interface)
   * @param {number} limit - Maximum number of entries to return
   * @param {Object} filters - Optional filters (user, action, pageName)
   * @returns {Array} Array of log entries
   */
  getAccessLog(limit = 100, filters = {}) {
    let entries = [...this.auditLog];

    // Apply filters
    if (filters.user) {
      entries = entries.filter(entry => entry.user === filters.user);
    }
    if (filters.action) {
      entries = entries.filter(entry => entry.action === filters.action);
    }
    if (filters.pageName) {
      entries = entries.filter(entry => entry.pageName === filters.pageName);
    }
    if (filters.decision !== undefined) {
      entries = entries.filter(entry => entry.decision === filters.decision);
    }

    // Sort by timestamp (most recent first) and limit
    return entries
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  /**
   * Get access control statistics
   * @returns {Object} Statistics about access control
   */
  getAccessControlStats() {
    const recent = this.auditLog.slice(-1000); // Last 1000 entries
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * oneHour;

    const stats = {
      totalChecks: recent.length,
      recentHour: recent.filter(entry => 
        now - new Date(entry.timestamp).getTime() < oneHour
      ).length,
      recentDay: recent.filter(entry => 
        now - new Date(entry.timestamp).getTime() < oneDay
      ).length,
      deniedAccess: recent.filter(entry => !entry.decision).length,
      maintenanceBlocked: recent.filter(entry => 
        entry.reason === 'maintenance_mode'
      ).length,
      businessHoursBlocked: recent.filter(entry => 
        entry.reason.includes('business_hours') || entry.reason.includes('business_days')
      ).length,
      averageProcessingTime: recent.reduce((sum, entry) => 
        sum + (entry.processingTime || 0), 0
      ) / Math.max(recent.length, 1)
    };

    return stats;
  }

  /**
   * Set maintenance mode
   * @param {boolean} enabled - Whether to enable maintenance mode
   * @param {string} message - Optional maintenance message
   * @param {Array} allowedRoles - Roles allowed during maintenance
   */
  setMaintenanceMode(enabled, message = null, allowedRoles = ['admin']) {
    const config = this.engine.getConfig();
    config.set('accessControl.contextAware.maintenanceMode.enabled', enabled);
    
    if (message) {
      config.set('accessControl.contextAware.maintenanceMode.message', message);
    }
    
    config.set('accessControl.contextAware.maintenanceMode.allowedRoles', allowedRoles);
    
    logger.info(`Maintenance mode ${enabled ? 'enabled' : 'disabled'}`, {
      action: 'maintenance_mode_set',
      enabled: enabled,
      message: message,
      allowedRoles: allowedRoles,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Check if maintenance mode is active
   * @returns {Object} Maintenance mode status
   */
  getMaintenanceStatus() {
    const config = this.engine.getConfig();
    const maintenanceConfig = config.get('accessControl.contextAware.maintenanceMode', {});
    
    return {
      enabled: maintenanceConfig.enabled || false,
      message: maintenanceConfig.message || 'System is under maintenance',
      allowedRoles: maintenanceConfig.allowedRoles || ['admin']
    };
  }

  /**
   * Check storage location permission for a page
   * Determines whether a page should be stored in regular or required pages directory
   * @param {string} pageName - Name of the page
   * @param {Object} user - User object (null for anonymous)
   * @param {Object} metadata - Page metadata
   * @param {string} content - Page content
   * @returns {Object} Storage location decision with reasoning
   */
  async checkStorageLocation(pageName, user, metadata = {}, content = '') {
    const config = this.engine.getConfig();
    const storageConfig = config.get('accessControl.storageLocation', {});
    
    // Default decision
    let location = 'regular';
    let reason = 'default';
    
    // Check if storage location policies are enabled
    if (!storageConfig.enabled) {
      return { location, reason: 'policies_disabled' };
    }
    
    // Check user role-based storage rules
    if (user && storageConfig.roleBasedStorage) {
      const userManager = this.engine.getManager('UserManager');
      if (userManager) {
        // Admin users can store in required pages
        if (userManager.hasPermission(user.username, 'admin:system')) {
          location = 'required';
          reason = 'admin_user';
        }
        
        // Check role-based rules
        for (const [role, storageType] of Object.entries(storageConfig.roleBasedStorage)) {
          if (userManager.hasRole(user.username, role)) {
            location = storageType;
            reason = `role_${role}`;
            break;
          }
        }
      }
    }
    
    // Check category-based storage rules
    if (metadata.categories && Array.isArray(metadata.categories)) {
      for (const category of metadata.categories) {
        if (storageConfig.categoryBasedStorage && storageConfig.categoryBasedStorage[category]) {
          location = storageConfig.categoryBasedStorage[category];
          reason = `category_${category}`;
          break;
        }
      }
    }
    
    // Check legacy category format
    if (metadata.category && storageConfig.categoryBasedStorage && storageConfig.categoryBasedStorage[metadata.category]) {
      location = storageConfig.categoryBasedStorage[metadata.category];
      reason = `legacy_category_${metadata.category}`;
    }
    
    // Check ACL-based storage rules (pages with restrictive ACLs go to required)
    if (content && storageConfig.aclBasedStorage) {
      const acl = this.parseACL(content);
      if (acl) {
        // If page has restrictive ACL rules, store in required pages
        const hasRestrictions = Object.values(acl).some(principals => principals.length > 0);
        if (hasRestrictions) {
          location = 'required';
          reason = 'restrictive_acl';
        }
      }
    }
    
    return { location, reason };
  }
}

module.exports = ACLManager;
