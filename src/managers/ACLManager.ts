/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */

import BaseManager from './BaseManager';
import { promises as fs } from 'fs';
import logger from '../utils/logger';
import { WikiEngine } from '../types/WikiEngine';
import type ConfigurationManager from './ConfigurationManager';
import type UserManager from './UserManager';

/**
 * Minimal WikiContext interface for type safety
 * TODO: Convert WikiContext.js to TypeScript and import proper type
 */
interface WikiContext {
  pageName: string;
  content: string;
  context?: Record<string, unknown>;
  userContext?: UserContext;
}

/**
 * User context for permission checks
 */
interface UserContext {
  username?: string;
  name?: string;
  roles?: string[];
  isAuthenticated?: boolean;
}

/**
 * Access control policy definition
 */
interface AccessPolicy {
  id: string;
  effect?: string;
  [key: string]: unknown;
}

/**
 * Permission check result
 */
interface PermissionResult {
  allowed: boolean;
  reason: string;
  message?: string;
}

/**
 * Maintenance mode configuration
 */
interface MaintenanceConfig {
  enabled?: boolean;
  allowAdmins?: boolean;
  allowedRoles?: string[];
  message?: string;
}

/**
 * Business hours configuration
 */
interface BusinessHoursConfig {
  enabled?: boolean;
  days?: string[];
  start?: string;
  end?: string;
}

/**
 * Holiday configuration
 */
interface HolidayConfig {
  enabled?: boolean;
  dates?: Record<string, { name?: string; message?: string }>;
  recurring?: Record<string, { name?: string; message?: string }>;
}

/**
 * Schedules configuration
 */
interface SchedulesConfig {
  enabled?: boolean;
  timeZone?: string;
  businessHours?: BusinessHoursConfig;
  holidays?: HolidayConfig;
  customSchedules?: {
    enabled?: boolean;
    [key: string]: unknown;
  };
}

/**
 * Context configuration
 */
interface ContextConfig {
  enabled?: boolean;
  timeZone?: string;
  maintenanceMode?: MaintenanceConfig;
}

/**
 * Access decision log entry
 */
interface AccessDecisionLog {
  user?: UserContext;
  pageName?: string;
  action?: string;
  allowed?: boolean;
  reason?: string;
  context?: Record<string, unknown>;
}

/**
 * ACLManager - Handles Access Control Lists and context-aware permissions
 *
 * Implements JSPWiki-style access control with extensions for context-aware
 * permissions (time-based, location-based, etc.). Supports both page-level
 * ACLs embedded in page content and global policy-based access control.
 *
 * Key features:
 * - JSPWiki-style ACL markup parsing ([{ALLOW view Admin}])
 * - Context-aware permission evaluation
 * - Global policy-based access control
 * - Audit logging of access decisions
 * - Role-based permission checking
 * - Category-based access control
 *
 * @class ACLManager
 * @extends BaseManager
 *
 * @property {Map<string, AccessPolicy>} accessPolicies - Global access policies
 * @property {any} policyEvaluator - Policy evaluation engine
 *
 * @see {@link BaseManager} for base functionality
 * @see {@link PolicyEvaluator} for policy evaluation
 * @see {@link AuditManager} for audit logging
 *
 * @example
 * const aclManager = engine.getManager('ACLManager');
 * const canView = await aclManager.checkPermission('Main', 'view', userContext);
 * if (canView) console.log('User can view page');
 */
class ACLManager extends BaseManager {
  private accessPolicies: Map<string, AccessPolicy> = new Map();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private policyEvaluator: any = null; // Will be typed when PolicyEvaluator is converted

  /**
   * Creates a new ACLManager instance
   *
   * @constructor
   * @param {WikiEngine} engine - The wiki engine instance
   */
  constructor(engine: WikiEngine) {
    super(engine);
  }

  /**
   * Initializes the ACLManager by loading policies and configurations
   *
   * Loads access policies from configuration and initializes the policy
   * evaluator for context-aware permission evaluation.
   *
   * @async
   * @returns {Promise<void>}
   *
   * @example
   * await aclManager.initialize();
   * console.log('ACL system ready');
   */
  async initialize(): Promise<void> {
    const configManager = this.engine.getManager<ConfigurationManager>('ConfigurationManager');
    if (!configManager) {
      throw new Error('ACLManager requires ConfigurationManager');
    }

    const policies = configManager.getProperty('amdwiki.access.policies', []) as AccessPolicy[];
    this.accessPolicies = new Map(policies.map((p) => [p.id, p]));
    logger.info(`📋 Loaded ${this.accessPolicies.size} access policies from ConfigurationManager`);

    // Get the PolicyEvaluator instance from the engine

    this.policyEvaluator = this.engine.getManager('PolicyEvaluator');
    if (!this.policyEvaluator) {
      logger.warn('[ACL] PolicyEvaluator manager not found. Global policies will not be evaluated.');
    }
  }

  /**
   * Initialize audit logging system based on configuration.
   */
  async initializeAuditLogging(): Promise<void> {
    const configManager = this.engine.getManager<ConfigurationManager>('ConfigurationManager');
    if (!configManager) {
      return;
    }

    const auditEnabled = configManager.getProperty('amdwiki.audit.enabled', true) as boolean;

    if (auditEnabled) {
      const logDir = configManager.getProperty('amdwiki.audit.provider.file.logdirectory') as string;
      try {
        await fs.mkdir(logDir, { recursive: true });
        logger.info('📋 Audit logging initialized');
      } catch (error) {
        logger.warn('Warning: Could not create audit log directory:', { error: error instanceof Error ? error.message : String(error) });
      }
    }
  }

  /**
   * Load access policies from ConfigurationManager.
   */
  async loadAccessPolicies(): Promise<void> {
    const configManager = this.engine.getManager<ConfigurationManager>('ConfigurationManager');
    if (!configManager) {
      return;
    }

    const policies = configManager.getProperty('amdwiki.access.policies', []) as AccessPolicy[];

    this.accessPolicies.clear();
    for (const policy of policies) {
      if (policy && policy.id) {
        this.accessPolicies.set(policy.id, policy);
      }
    }
    logger.info(`📋 Loaded ${this.accessPolicies.size} access policies from ConfigurationManager`);
  }

  /**
   * Parses JSPWiki-style ACL markup from page content
   *
   * Extracts ACL directives from page content in the format [{ALLOW action principals}].
   * Multiple actions and principals can be comma-separated.
   *
   * @param {string} content - The page's raw markdown content
   * @returns {Map<string, Set<string>>} Map of actions to sets of allowed principals
   *
   * @example
   * const acl = aclManager.parsePageACL('[{ALLOW view All}] [{ALLOW edit Admin}]');
   * // acl.get('view') => Set(['All'])
   * // acl.get('edit') => Set(['Admin'])
   */
  parsePageACL(content: string): Map<string, Set<string>> {
    const acl = new Map<string, Set<string>>();
    if (!content) return acl;

    // Regex to match [{ALLOW action principals}]
    const aclRegex = /\[\{\s*ALLOW\s+([a-z, ]+)\s+([^}]+)\s*\}\]/gi;
    let match;

    while ((match = aclRegex.exec(content)) !== null) {
      const actions = match[1].split(',').map((s) => s.trim().toLowerCase());
      const principals = match[2].split(',').map((s) => s.trim());

      for (const action of actions) {
        if (!acl.has(action)) {
          acl.set(action, new Set());
        }
        const principalSet = acl.get(action);
        if (principalSet) {
          principals.forEach((p) => principalSet.add(p));
        }
      }
    }
    return acl;
  }

  /**
   * Check page permission using WikiContext
   *
   * Checks if the user in WikiContext has permission to perform an action on a page.
   * Uses WikiContext as the single source of truth for page name, content, and user info.
   * Includes policy-based and page-level ACL evaluation with audit logging.
   *
   * @async
   * @param {WikiContext} wikiContext - The wiki context containing page and user info
   * @param {string} action - Action to check (view, edit, delete, rename, upload)
   * @returns {Promise<boolean>} True if permission granted
   *
   * @example
   * const canEdit = await aclManager.checkPagePermissionWithContext(wikiContext, 'edit');
   * if (canEdit) console.log('User can edit page');
   */
  async checkPagePermissionWithContext(wikiContext: WikiContext, action: string): Promise<boolean> {
    if (!wikiContext) {
      throw new Error('ACLManager.checkPagePermissionWithContext requires a WikiContext');
    }

    const pageName = wikiContext.pageName;
    const userContext = wikiContext.userContext;
    const pageContent = wikiContext.content;

    const roles = (userContext?.roles || []).join('|');
    logger.info(`[ACL] checkPagePermissionWithContext page=${pageName} action=${action} user=${userContext?.username} roles=${roles}`);

    // Map legacy action names to policy action names
    const actionMap: Record<string, string> = {
      view: 'page:read',
      edit: 'page:edit',
      delete: 'page:delete',
      create: 'page:create',
      rename: 'page:rename',
      upload: 'attachment:upload'
    };
    const policyAction = actionMap[action.toLowerCase()] || action;

    // 1. Evaluate Global Policies first
    if (this.policyEvaluator) {
      try {
        const policyContext = { pageName, action: policyAction, userContext };

        const policyResult = await this.policyEvaluator.evaluateAccess(policyContext);

        logger.info(`[ACL] PolicyEvaluator decision hasDecision=${policyResult.hasDecision} allowed=${policyResult.allowed} policy=${policyResult.policyName}`);

        if (policyResult.hasDecision) {
          // Log access decision for audit
          this.logAccessDecision({
            user: userContext,
            pageName,
            action,

            allowed: policyResult.allowed,

            reason: policyResult.policyName || 'global_policy',
            context: { wikiContext: wikiContext.context }
          });

          return policyResult.allowed;
        }
      } catch (e) {
        logger.warn('[ACL] PolicyEvaluator error', { error: e instanceof Error ? e.message : String(e), stack: e instanceof Error ? e.stack : undefined });
      }
    }

    // 2. Evaluate Page-Level ACLs if no global policy decided
    if (pageContent && typeof pageContent === 'string') {
      const pageAcl = this.parsePageACL(pageContent);
      const principals = pageAcl.get(action.toLowerCase());
      logger.info(`[ACL] Page ACL for action=${action}: ${principals ? Array.from(principals).join('|') : 'none'}`);

      if (principals) {
        if (principals.has('All')) {
          this.logAccessDecision({
            user: userContext,
            pageName,
            action,
            allowed: true,
            reason: 'page_acl_all',
            context: { wikiContext: wikiContext.context }
          });
          return true;
        }
        if (userContext?.roles) {
          for (const r of userContext.roles) {
            if (principals.has(r)) {
              this.logAccessDecision({
                user: userContext,
                pageName,
                action,
                allowed: true,
                reason: `page_acl_role_${r}`,
                context: { wikiContext: wikiContext.context }
              });
              return true;
            }
          }
        }
        if (userContext?.username && principals.has(userContext.username)) {
          this.logAccessDecision({
            user: userContext,
            pageName,
            action,
            allowed: true,
            reason: 'page_acl_user',
            context: { wikiContext: wikiContext.context }
          });
          return true;
        }
      }
    }

    logger.info(`[ACL] Default deny for page=${pageName} (no policy/ACL matched)`);
    this.logAccessDecision({
      user: userContext,
      pageName,
      action,
      allowed: false,
      reason: 'default_deny',
      context: { wikiContext: wikiContext.context }
    });
    return false;
  }

  /**
   * Check page permission with context-aware and audit logging
   * Now includes policy-based access control integration
   * @param {string} pageName - Name of the page
   * @param {string} action - Action to check (view, edit, delete, rename, upload)
   * @param {UserContext} userContext - User context object (null for anonymous)
   * @param {string} pageContent - Page content to parse ACL from
   * @returns {Promise<boolean>} True if permission granted
   * @deprecated Use checkPagePermissionWithContext() with WikiContext instead
   */
  async checkPagePermission(pageName: string, action: string, userContext: UserContext | null, pageContent: string): Promise<boolean> {
    const roles = (userContext?.roles || []).join('|');
    logger.info(`[ACL] checkPagePermission page=${pageName} action=${action} user=${userContext?.username} roles=${roles}`);

    // Map legacy action names to policy action names
    const actionMap: Record<string, string> = {
      view: 'page:read',
      edit: 'page:edit',
      delete: 'page:delete',
      create: 'page:create',
      rename: 'page:rename',
      upload: 'attachment:upload'
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
        logger.warn('[ACL] PolicyEvaluator error', { error: e instanceof Error ? e.message : String(e), stack: e instanceof Error ? e.stack : undefined });
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
   * @param {UserContext | null} user - User object
   * @param {string} pageContent - Page content
   * @returns {Promise<boolean>} True if permission granted
   */
  async performStandardACLCheck(pageName: string, action: string, user: UserContext | null, pageContent: string): Promise<boolean> {
    const userManager = this.engine.getManager<UserManager>('UserManager');
    if (!userManager) {
      throw new Error('UserManager not available');
    }

    // If user has admin:system permission, always allow
    if (user?.username && (await userManager.hasPermission(user.username, 'admin:system'))) {
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
   * Parse ACL from page content (legacy format)
   * @private
   */
  private parseACL(pageContent: string): Record<string, string[]> | null {
    // This is a simplified implementation for backwards compatibility
    const acl = this.parsePageACL(pageContent);
    if (acl.size === 0) return null;

    const result: Record<string, string[]> = {};
    for (const [action, principals] of acl.entries()) {
      result[action] = Array.from(principals);
    }
    return result;
  }

  /**
   * Check if user matches principals
   * @private
   */
  private userMatchesPrincipals(user: UserContext | null, principals: string[]): boolean {
    if (principals.includes('All')) return true;
    if (!user) return false;

    if (user.roles) {
      for (const role of user.roles) {
        if (principals.includes(role)) return true;
      }
    }

    if (user.username && principals.includes(user.username)) return true;
    return false;
  }

  /**
   * Check if page is system or admin page
   * @private
   */
  private isSystemOrAdminPage(pageName: string): boolean {
    const systemPages = ['admin', 'system', 'config', 'settings'];
    const lowerName = pageName.toLowerCase();
    return systemPages.some((prefix) => lowerName.startsWith(prefix));
  }

  /**
   * Check default permissions for actions using UserManager
   * @param {string} action - Action to check (view, edit, delete, etc.)
   * @param {UserContext | null} user - User object or null for anonymous
   * @returns {Promise<boolean>} True if user has permission, false otherwise
   */
  async checkDefaultPermission(action: string, user: UserContext | null): Promise<boolean> {
    const userManager = this.engine.getManager<UserManager>('UserManager');
    if (!userManager) {
      logger.warn('UserManager not available for permission check');
      return false;
    }

    // Map actions to permission strings
    const permissionMap: Record<string, string> = {
      view: 'page:read',
      edit: 'page:edit',
      delete: 'page:delete',
      create: 'page:create'
    };

    const permission = permissionMap[action.toLowerCase()] || `page:${action.toLowerCase()}`;
    const username = user?.username ?? 'anonymous';

    const result = await userManager.hasPermission(username, permission);

    return result;
  }

  /**
   * Check context-aware restrictions (time-based, maintenance mode)
   * @param {UserContext | null} user - User object
   * @param {Record<string, unknown>} context - Request context
   * @returns {Promise<PermissionResult>} Permission result with reason
   */
  async checkContextRestrictions(user: UserContext | null, context: Record<string, unknown>): Promise<PermissionResult> {
    const configManager = this.engine.getManager<ConfigurationManager>('ConfigurationManager');
    if (!configManager) {
      return { allowed: true, reason: 'no_config' };
    }

    const contextAwareEnabled = configManager.getProperty('amdwiki.accessControl.contextAware.enabled', true) as boolean;

    if (!contextAwareEnabled) {
      return { allowed: true, reason: 'context_disabled' };
    }

    // Build context config object from ConfigurationManager properties
    const contextConfig: ContextConfig = {
      enabled: contextAwareEnabled,
      timeZone: configManager.getProperty('amdwiki.accessControl.contextAware.timeZone', 'UTC') as string,
      maintenanceMode: {
        enabled: configManager.getProperty('amdwiki.features.maintenance.enabled', false) as boolean,
        allowAdmins: configManager.getProperty('amdwiki.features.maintenance.allowAdmins', true) as boolean
      }
    };

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
   * @param {UserContext} user - User object
   * @param {MaintenanceConfig} maintenanceConfig - Maintenance mode configuration
   * @returns {PermissionResult} Permission result
   */
  checkMaintenanceMode(user: UserContext, maintenanceConfig: MaintenanceConfig = {}): PermissionResult {
    if (!maintenanceConfig.enabled) {
      return { allowed: true, reason: 'maintenance_disabled' };
    }

    // Check if user has allowed role during maintenance
    if (user && user.roles) {
      const allowedRoles = maintenanceConfig.allowedRoles || ['admin'];
      const hasAllowedRole = user.roles.some((role) => allowedRoles.includes(role));

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
   * @param {BusinessHoursConfig} businessHoursConfig - Business hours configuration
   * @param {string} timeZone - Time zone for business hours
   * @returns {PermissionResult} Permission result
   */
  checkBusinessHours(businessHoursConfig: BusinessHoursConfig = {}, timeZone: string = 'UTC'): PermissionResult {
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

      const currentDay = now
        .toLocaleDateString('en-US', {
          timeZone,
          weekday: 'long'
        })
        .toLowerCase();

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
      logger.warn('Error checking business hours:', error instanceof Error ? error.message : String(error));
      return { allowed: true, reason: 'business_hours_error' };
    }
  }

  /**
   * Enhanced time-based permission checking with custom schedules and holidays
   * @param {UserContext} user - User object
   * @param {Record<string, unknown>} context - Access context
   * @returns {Promise<PermissionResult>} Permission result
   */
  async checkEnhancedTimeRestrictions(user: UserContext, context: Record<string, unknown>): Promise<PermissionResult> {
    try {
      const cfg = this.engine?.getManager?.('ConfigurationManager');

      const enabled = cfg?.getProperty?.('amdwiki.schedules.enabled', true);
      if (!enabled) {
        return { allowed: true, reason: 'schedules_disabled' };
      }

      const schedulesRaw: unknown = cfg.getProperty('amdwiki.schedules', null);
      if (!schedulesRaw || typeof schedulesRaw !== 'object' || Object.keys(schedulesRaw).length === 0) {
        await this.notify('ACLManager: amdwiki.schedules missing during check', 'error');
        throw new Error('Schedules configuration missing');
      }
      const schedules = schedulesRaw as SchedulesConfig;

      const now = new Date();
      const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format

      const timeZone = String(cfg.getProperty('amdwiki.timeZone', 'UTC'));
      const currentTime = now.toLocaleTimeString('en-US', {
        timeZone,
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
          return scheduleCheck as PermissionResult;
        }
      }

      // Fall back to basic business hours

      return this.checkBusinessHours(schedules.businessHours, schedules.timeZone);
    } catch (error) {
      await this.notify(`Error in enhanced time restrictions: ${error instanceof Error ? error.message : String(error)}`, 'error');
      return { allowed: false, reason: 'schedule_check_error', message: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Check custom schedule
   * @private
   */
  private async checkCustomSchedule(_user: UserContext, _context: Record<string, unknown>, _currentDate: string, _currentTime: string, _schedules: SchedulesConfig): Promise<Partial<PermissionResult>> {
    // Placeholder for custom schedule logic
    return {};
  }

  /**
   * Check holiday restrictions
   * @param {string} currentDate - Current date in YYYY-MM-DD format
   * @param {HolidayConfig} holidaysConfig - Holiday configuration
   * @returns {Promise<PermissionResult>} Permission result
   */
  async checkHolidayRestrictions(currentDate: string, _holidaysConfig: HolidayConfig): Promise<PermissionResult> {
    try {
      // Require holidays from ConfigurationManager only (no file fallback)

      const cfg = this.engine?.getManager?.('ConfigurationManager');

      if (!cfg?.getProperty) {
        await this.notify('ConfigurationManager not available for holiday checks', 'error');
        throw new Error('Holiday checks require ConfigurationManager');
      }

      const enabled = cfg.getProperty('amdwiki.holidays.enabled', false);
      if (!enabled) {
        return { allowed: true, reason: 'holidays_disabled' };
      }

      const dates = cfg.getProperty('amdwiki.holidays.dates', null);

      const recurring = cfg.getProperty('amdwiki.holidays.recurring', null);
      if (!dates || typeof dates !== 'object' || !recurring || typeof recurring !== 'object') {
        await this.notify('Holiday configuration missing: amdwiki.holidays.dates/recurring', 'error');
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
      await this.notify(`Error checking holiday restrictions: ${error instanceof Error ? error.message : String(error)}`, 'error');
      // Treat as a hard failure to satisfy "no fallback"
      return { allowed: false, reason: 'holiday_check_error', message: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Send notification to NotificationManager
   * @private
   */
  private async notify(message: string, level: 'warn' | 'error' = 'warn'): Promise<void> {
    const nm = this.engine?.getManager?.('NotificationManager');
    try {
      if (nm?.addNotification) {
        await nm.addNotification({ level, message, source: 'ACLManager', timestamp: new Date().toISOString() });
      } else {
        if (level === 'error') {
          logger.error(message);
        } else {
          logger.warn(message);
        }
      }
    } catch {
      logger.warn(message);
    }
  }

  /**
   * Record/audit an access decision.
   * Accepts either a single object or positional args for backward compatibility.
   */
  logAccessDecision(userOrObj: UserContext | AccessDecisionLog, pageName?: string, action?: string, allowed?: boolean, reason?: string, context: Record<string, unknown> = {}): void {
    let user: UserContext | undefined = userOrObj as UserContext;
    if (arguments.length === 1 && userOrObj && typeof userOrObj === 'object') {
      const obj = userOrObj as AccessDecisionLog;
      user = obj.user;
      pageName = obj.pageName;
      action = obj.action;
      allowed = obj.allowed;
      reason = obj.reason;
      context = obj.context || {};
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
      }).catch(() => {
        // Ignore notification errors
      });
    }
  }

  /**
   * Strip ACL markup from page content before rendering menus/partials.
   * Supports common patterns: [{ALLOW ...}], [{DENY ...}], %%acl ... %%, (:acl ... :)
   */
  removeACLMarkup(content: string): string {
    if (typeof content !== 'string' || !content) return content;
    const pluginPattern = /\[\{\s*(ALLOW|DENY)\b[^}]*\}\]/gim;
    const percentBlock = /%%acl[\s\S]*?%%/gim;
    const directiveParen = /\(:\s*acl\b[^:]*:\)/gim;
    return content.replace(pluginPattern, '').replace(percentBlock, '').replace(directiveParen, '');
  }

  // Alias for compatibility if other code calls stripACLMarkup
  stripACLMarkup(content: string): string {
    return this.removeACLMarkup(content);
  }

  // NOTE: ACLManager does not need backup/restore methods because:
  // - All policies are loaded from ConfigurationManager (backed up by ConfigurationManager)
  // - Per-page ACLs are embedded in page content (backed up by PageManager)
  // - The accessPolicies Map is just a runtime cache that can be rebuilt from config
}

export = ACLManager;
