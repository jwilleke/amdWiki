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
  async initialize(config = {}) {
    await super.initialize(config);

    // Strict: require ConfigurationManager for holidays if feature enabled
    const cfg = this.engine?.getManager?.('ConfigurationManager');
    if (!cfg?.getProperty) {
      await this.#notify('ConfigurationManager not available for ACLManager', 'error');
      throw new Error('ACLManager: ConfigurationManager is required');
    }

    const holidaysEnabled = cfg.getProperty('amdwiki.holidays.enabled', false);
    if (holidaysEnabled) {
      const dates = cfg.getProperty('amdwiki.holidays.dates', null);
      const recurring = cfg.getProperty('amdwiki.holidays.recurring', null);
      if (!dates || typeof dates !== 'object') {
        await this.#notify('Holidays enabled but amdwiki.holidays.dates is missing/invalid', 'error');
        throw new Error('ACLManager: holiday dates configuration missing');
      }
      if (!recurring || typeof recurring !== 'object') {
        await this.#notify('Holidays enabled but amdwiki.holidays.recurring is missing/invalid', 'error');
        throw new Error('ACLManager: holiday recurring configuration missing');
      }
    }

    // Initialize audit logging
    await this.initializeAuditLogging();
    
    // Load access policies if enabled
    if (this.engine.getConfig().get('accessControl.policies.enabled', false)) {
      await this.loadAccessPolicies();
    }

    // Get reference to PolicyEvaluator for policy-based access control
    this.policyEvaluator = this.engine.getManager('PolicyEvaluator');
    if (this.policyEvaluator) {
      console.log('📋 ACLManager integrated with PolicyEvaluator');
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
   * Now includes policy-based access control integration
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
      // Check policy-based access control first (if enabled)
      const policiesEnabled = this.engine.getConfig().get('accessControl.policies.enabled', false);
      if (policiesEnabled && this.policyEvaluator) {
        const policyContext = this.createPolicyContext(pageName, action, user, context);
        const policyResult = await this.policyEvaluator.evaluateAccess(policyContext);
        
        if (policyResult.hasDecision) {
          decision = policyResult.allowed;
          reason = policyResult.reason;
          
          // Log policy-based decision
          await this.logAccessDecision({
            pageName,
            action,
            user: user ? user.username : 'anonymous',
            decision,
            reason: `policy:${reason}`,
            context,
            policyId: policyResult.policyName,
            timestamp: new Date().toISOString(),
            processingTime: Date.now() - startTime
          });
          
          return decision;
        }
        // If no policy decision, fall back to traditional ACL
      }

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
        const result = this.checkDefaultPermission(action, user);
        return result;
      }
      // Regular pages are readable by everyone (including anonymous)
      return true;
    }
    
    // For non-view actions (edit, delete, etc.), check role-based permissions
    const result = this.checkDefaultPermission(action, user);
    return result;
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
    
    const result = userManager.hasPermission(username, permission);
    
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
    const config = this.engine.getConfig();
    const timeConfig = config.get('accessControl.contextAware', {});

    // Check if enhanced time features are enabled
    if (!timeConfig.customSchedules?.enabled && !timeConfig.holidays?.enabled) {
      // Fall back to basic business hours check
      return this.checkBusinessHours(timeConfig.businessHours, timeConfig.timeZone);
    }

    try {
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
      const currentTime = now.toLocaleTimeString('en-US', {
        timeZone: timeConfig.timeZone || 'UTC',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      });

      // Check holidays first (they override all other schedules)
      if (timeConfig.holidays?.enabled) {
        const holidayCheck = await this.checkHolidayRestrictions(currentDate, timeConfig.holidays);
        if (!holidayCheck.allowed) {
          return holidayCheck;
        }
      }

      // Check custom schedules if enabled
      if (timeConfig.customSchedules?.enabled) {
        const scheduleCheck = await this.checkCustomSchedule(user, context, currentDate, currentTime, timeConfig);
        if (scheduleCheck.allowed !== undefined) {
          return scheduleCheck;
        }
      }

      // Fall back to basic business hours
      return this.checkBusinessHours(timeConfig.businessHours, timeConfig.timeZone);

    } catch (error) {
      console.warn('Error in enhanced time restrictions:', error.message);
      return { allowed: true, reason: 'time_check_error' };
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
        logger?.[level === 'error' ? 'error' : 'warn']?.(message);
      }
    } catch {
      logger?.warn?.(message);
    }
  }
}

module.exports = ACLManager;
