const BaseManager = require('./BaseManager');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

/**
 * ACLManager - Handles Access Control Lists and context-aware permissions.
 */
class ACLManager extends BaseManager {
  constructor(engine) {
    super(engine);
    this.accessPolicies = new Map();
    this.policyEvaluator = null; // Initialize as null
  }

  /**
   * Initializes the ACLManager by loading policies and configurations
   * from the ConfigurationManager.
   */
  async initialize() {
    const configManager = this.engine.getManager('ConfigurationManager');
    const policies = configManager.getProperty('amdwiki.access.policies', []);
    this.accessPolicies = new Map(policies.map(p => [p.id, p]));
    logger.info(`📋 Loaded ${this.accessPolicies.size} access policies from ConfigurationManager`);

    // CRITICAL FIX: Get the PolicyEvaluator instance from the engine.
    this.policyEvaluator = this.engine.getManager('PolicyEvaluator');
    if (!this.policyEvaluator) {
      logger.warn('[ACL] PolicyEvaluator manager not found. Global policies will not be evaluated.');
    }
  }

  /**
   * Initialize audit logging system based on configuration.
   */
  async initializeAuditLogging() {
    const configManager = this.engine.getManager('ConfigurationManager');
    const auditConfig = configManager.getProperty('amdwiki.access.audit', {});

    if (auditConfig.enabled) {
      const logFile = auditConfig.logFile || './users/access-log.json';
      const logDir = path.dirname(logFile);
      try {
        await fs.mkdir(logDir, { recursive: true });
        logger.info('📋 Audit logging initialized');
      } catch (error) {
        logger.warn('Warning: Could not create audit log directory:', { error: error.message });
      }
    }
  }

  /**
   * Load access policies from ConfigurationManager.
   */
  async loadAccessPolicies() {
    const configManager = this.engine.getManager('ConfigurationManager');
    const policies = configManager.getProperty('amdwiki.access.policies', []);

    this.accessPolicies.clear();
    for (const policy of policies) {
      if (policy && policy.id) {
        this.accessPolicies.set(policy.id, policy);
      }
    }
    logger.info(`📋 Loaded ${this.accessPolicies.size} access policies from ConfigurationManager`);
  }

  /**
   * Parses JSPWiki-style ACL markup from page content.
   * Example: [{ALLOW view All,Admin}]
   * @param {string} content The page's raw markdown content.
   * @returns {Map<string, Set<string>>} A map of actions to a set of allowed principals.
   */
  parsePageACL(content) {
    const acl = new Map();
    if (!content) return acl;

    // Regex to match [{ALLOW action principals}]
    const aclRegex = /\[\{\s*ALLOW\s+([a-z, ]+)\s+([^}]+)\s*\}\]/gi;
    let match;

    while ((match = aclRegex.exec(content)) !== null) {
      const actions = match[1].split(',').map(s => s.trim().toLowerCase());
      const principals = match[2].split(',').map(s => s.trim());

      for (const action of actions) {
        if (!acl.has(action)) {
          acl.set(action, new Set());
        }
        const principalSet = acl.get(action);
        principals.forEach(p => principalSet.add(p));
      }
    }
    return acl;
  }

  /**
   * Check page permission with context-aware and audit logging
   * Now includes policy-based access control integration
   * @param {string} pageName - Name of the page
   * @param {string} action - Action to check (view, edit, delete, rename, upload)
   * @param {Object} userContext - User context object (null for anonymous)
   * @param {string} pageContent - Page content to parse ACL from
   * @returns {boolean} True if permission granted
   */
  async checkPagePermission(pageName, action, userContext, pageContent) {
    const roles = (userContext?.roles || []).join('|');
    logger.info(`[ACL] checkPagePermission page=${pageName} action=${action} user=${userContext?.username} roles=${roles}`);

    // Map legacy action names to policy action names
    const actionMap = {
      'view': 'page:read',
      'edit': 'page:edit',
      'delete': 'page:delete',
      'create': 'page:create',
      'rename': 'page:rename',
      'upload': 'attachment:upload'
    };
    const policyAction = actionMap[action.toLowerCase()] || action;

    // 1. Evaluate Global Policies first
    if (this.policyEvaluator) {
      try {
        const policyContext = { pageName, action: policyAction, userContext };
        const policyResult = await this.policyEvaluator.evaluateAccess(policyContext);
        logger.info(`[ACL] PolicyEvaluator decision hasDecision=${policyResult.hasDecision} allowed=${policyResult.allowed} policy=${policyResult.policyName}`);
        if (policyResult.hasDecision) {
          return policyResult.allowed;
        }
      } catch (e) {
        logger.warn('[ACL] PolicyEvaluator error', { error: e.message, stack: e.stack });
      }
    }

    // 2. Evaluate Page-Level ACLs if no global policy decided
    if (pageContent && typeof pageContent === 'string') {
      const pageAcl = this.parsePageACL(pageContent);
      const principals = pageAcl.get(action.toLowerCase());
      logger.info(`[ACL] Page ACL for action=${action}: ${principals ? Array.from(principals).join('|') : 'none'}`);

      if (principals) {
        if (principals.has('All')) return true;
        if (userContext?.roles) {
          for (const r of userContext.roles) {
            if (principals.has(r)) return true;
          }
        }
        if (userContext?.username && principals.has(userContext.username)) return true;
      }
    }

    logger.info(`[ACL] Default deny for page=${pageName} (no policy/ACL matched)`);
    return false;
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
    if (user && await userManager.hasPermission(user.username, 'admin:system')) {
      return true;
    }

    // Parse ACL from page content
    const acl = this.parseACL(pageContent);
    
    // If ACL exists, use ACL rules
    if (acl) {
      const allowedPrincipals = acl[action.toLowerCase()] || [];
      
      // If specific ACL for this action exists, check it
      if (allowedPrincipals.length > 0) {
        const result = this.userMatchesPrincipals(user, allowedPrincipals);
        return result;
      }
    }

    // Default policy: Allow read access to all pages unless it's a system/admin page
    if (action.toLowerCase() === 'view') {
      // Check if this is a system/admin page that should be restricted
      const isSystemPage = this.isSystemOrAdminPage(pageName);
      
      if (isSystemPage) {
        // System/admin pages require proper permissions
        const result = await this.checkDefaultPermission(action, user);
        return result;
      }
      // Regular pages are readable by everyone (including anonymous)
      return true;
    }

    // For non-view actions (edit, delete, etc.), check role-based permissions
    const result = await this.checkDefaultPermission(action, user);
    return result;
  }

  /**
   * Check default permissions for actions using UserManager
   * @param {string} action - Action to check (view, edit, delete, etc.)
   * @param {Object} user - User object or null for anonymous
   * @returns {Promise<boolean>} True if user has permission, false otherwise
   */
  async checkDefaultPermission(action, user) {
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

    const result = await userManager.hasPermission(username, permission);

    return result;
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

    // Skip context restrictions for anonymous users on public wiki
    if (!user || user.username === 'anonymous' || user.username === 'asserted') {
      return { allowed: true, reason: 'anonymous_user' };
    }

    // Check maintenance mode
    const maintenanceCheck = this.checkMaintenanceMode(user, contextConfig.maintenanceMode);
    if (!maintenanceCheck.allowed) {
      return maintenanceCheck;
    }

    // Check time-based restrictions (enhanced)
    const timeCheck = await this.checkEnhancedTimeRestrictions(user, context);
    if (!timeCheck.allowed) {
      return timeCheck;
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
   * Enhanced time-based permission checking with custom schedules and holidays
   * @param {Object} user - User object
   * @param {Object} context - Access context
   * @returns {Object} { allowed: boolean, reason: string, message: string }
   */
  async checkEnhancedTimeRestrictions(user, context) {
    try {
      const cfg = this.engine?.getManager?.('ConfigurationManager');
      const enabled = cfg?.getProperty?.('amdwiki.schedules.enabled', true);
      if (!enabled) {
        return { allowed: true, reason: 'schedules_disabled' };
      }

      const schedules = cfg.getProperty('amdwiki.schedules', null);
      if (!schedules || typeof schedules !== 'object' || Object.keys(schedules).length === 0) {
        await this.#notify('ACLManager: amdwiki.schedules missing during check', 'error');
        throw new Error('Schedules configuration missing');
      }

      const now = new Date();
      const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
      const currentTime = now.toLocaleTimeString('en-US', {
        timeZone: cfg.getProperty('amdwiki.timeZone', 'UTC'),
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      });

      // Check holidays first (they override all other schedules)
      if (schedules.holidays?.enabled) {
        const holidayCheck = await this.checkHolidayRestrictions(currentDate, schedules.holidays);
        if (!holidayCheck.allowed) {
          return holidayCheck;
        }
      }

      // Check custom schedules if enabled
      if (schedules.customSchedules?.enabled) {
        const scheduleCheck = await this.checkCustomSchedule(user, context, currentDate, currentTime, schedules);
        if (scheduleCheck.allowed !== undefined) {
          return scheduleCheck;
        }
      }

      // Fall back to basic business hours
      return this.checkBusinessHours(schedules.businessHours, schedules.timeZone);

    } catch (error) {
      await this.#notify(`Error in enhanced time restrictions: ${error.message}`, 'error');
      return { allowed: false, reason: 'schedule_check_error', message: error.message };
    }
  }

  /**
   * Check holiday restrictions
   * @param {string} currentDate - Current date in YYYY-MM-DD format
   * @param {Object} holidaysConfig - Holiday configuration
   * @returns {Object} { allowed: boolean, reason: string, message: string }
   */
  async checkHolidayRestrictions(currentDate, holidaysConfig) {
    try {
      // Require holidays from ConfigurationManager only (no file fallback)
      const cfg = this.engine?.getManager?.('ConfigurationManager');
      if (!cfg?.getProperty) {
        await this.#notify('ConfigurationManager not available for holiday checks', 'error');
        throw new Error('Holiday checks require ConfigurationManager');
      }

      const enabled = cfg.getProperty('amdwiki.holidays.enabled', false);
      if (!enabled) {
        return { allowed: true, reason: 'holidays_disabled' };
      }

      const dates = cfg.getProperty('amdwiki.holidays.dates', null);
      const recurring = cfg.getProperty('amdwiki.holidays.recurring', null);
      if (!dates || typeof dates !== 'object' || !recurring || typeof recurring !== 'object') {
        await this.#notify('Holiday configuration missing: amdwiki.holidays.dates/recurring', 'error');
        throw new Error('Holiday configuration missing');
      }

      // Exact date match
      if (dates[currentDate]) {
        const holiday = dates[currentDate] || {};
        return {
          allowed: false,
          reason: 'holiday_restriction',
          message: holiday.message || `Access restricted on ${holiday.name || 'holiday'}`
        };
      }

      // Recurring holiday match (*-MM-DD)
      const [, month, day] = currentDate.split('-');
      const recurringKey = `*-${month}-${day}`;
      if (recurring[recurringKey]) {
        const holiday = recurring[recurringKey] || {};
        return {
          allowed: false,
          reason: 'recurring_holiday_restriction',
          message: holiday.message || `Access restricted on ${holiday.name || 'holiday'}`
        };
      }

      return { allowed: true, reason: 'not_a_holiday' };
    } catch (error) {
      await this.#notify(`Error checking holiday restrictions: ${error.message}`, 'error');
      // Treat as a hard failure to satisfy "no fallback"
      return { allowed: false, reason: 'holiday_check_error', message: error.message };
    }
  }

  async #notify(message, level = 'warn') {
    const nm = this.engine?.getManager?.('NotificationManager');
    try {
      if (nm?.addNotification) {
        await nm.addNotification({ level, message, source: 'ACLManager', timestamp: new Date().toISOString() });
      } else {
        console?.[level === 'error' ? 'error' : 'warn']?.(message);
      }
    } catch {
      console?.warn?.(message);
    }
  }

  /**
   * Record/audit an access decision.
   * Accepts either a single object or positional args for backward compatibility.
   */
  logAccessDecision(userOrObj, pageName, action, allowed, reason, context = {}) {
    let user = userOrObj;
    if (arguments.length === 1 && userOrObj && typeof userOrObj === 'object') {
      user = userOrObj.user;
      pageName = userOrObj.pageName;
      action = userOrObj.action;
      allowed = userOrObj.allowed;
      reason = userOrObj.reason;
      context = userOrObj.context || {};
    }
    const username = user?.username || user?.name || 'anonymous';
    const msg = `ACL decision: user=${username} page=${pageName} action=${action} allowed=${!!allowed} reason=${reason || 'n/a'}`;
    if (allowed) {
      this.engine?.logger?.info?.(msg);
    } else {
      this.engine?.logger?.warn?.(msg);
    }
    // Optional: forward to NotificationManager for UI surfacing
    const nm = this.engine?.getManager?.('NotificationManager');
    if (nm?.addNotification) {
      nm.addNotification({
        level: allowed ? 'info' : 'warn',
        message: msg,
        source: 'ACLManager',
        context,
        timestamp: new Date().toISOString()
      }).catch(() => {});
    }
  }

  /**
   * Strip ACL markup from page content before rendering menus/partials.
   * Supports common patterns: [{ALLOW ...}], [{DENY ...}], %%acl ... %%, (:acl ... :)
   */
  removeACLMarkup(content) {
    if (typeof content !== 'string' || !content) return content;
    const pluginPattern = /\[\{\s*(ALLOW|DENY)\b[^}]*\}\]/gmi;
    const percentBlock = /%%acl[\s\S]*?%%/gmi;
    const directiveParen = /\(:\s*acl\b[^:]*:\)/gmi;
    return content
      .replace(pluginPattern, '')
      .replace(percentBlock, '')
      .replace(directiveParen, '');
  }

  // Alias for compatibility if other code calls stripACLMarkup
  stripACLMarkup(content) {
    return this.removeACLMarkup(content);
  }

  // NOTE: ACLManager does not need backup/restore methods because:
  // - All policies are loaded from ConfigurationManager (backed up by ConfigurationManager)
  // - Per-page ACLs are embedded in page content (backed up by PageManager)
  // - The accessPolicies Map is just a runtime cache that can be rebuilt from config
}

module.exports = ACLManager;
