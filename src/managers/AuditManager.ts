/**
 * AuditManager - Comprehensive audit trail system for access control and security monitoring
 *
 * Extends BaseManager following the JSPWiki modular manager pattern with provider architecture.
 * Follows the provider pattern established in CacheManager, AttachmentManager, PageManager.
 * Supports pluggable audit storage backends (file, database, cloud logging).
 *
 * @class AuditManager
 * @extends BaseManager
 *
 * @property {BaseAuditProvider|null} provider - The active audit provider
 * @property {string|null} providerClass - The class name of the loaded provider
 *
 * @see {@link BaseManager} for base functionality
 * @see {@link FileAuditProvider} for default provider implementation
 *
 * @example
 * const auditManager = engine.getManager('AuditManager');
 * await auditManager.logAccess('admin', 'Main', 'view', 'granted');
 */
import BaseManager from './BaseManager';
import logger from '../utils/logger';
import { WikiEngine } from '../types/WikiEngine';

/**
 * Base audit event structure
 */
interface AuditEvent {
  eventType: string;
  user: string;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  resourceType?: string;
  action?: string;
  result?: string;
  reason?: string;
  policyId?: string;
  policyName?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  duration?: number;
  context?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  timestamp?: string;
}

/**
 * User information for audit events
 */
interface AuditUser {
  username?: string;
  id?: string;
  roles?: string[];
  attributes?: Record<string, unknown>;
}

/**
 * Context for access control decisions
 */
interface AccessContext {
  user?: AuditUser;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  resourceType?: string;
  action?: string;
  requestMethod?: string;
  requestPath?: string;
  timestamp?: string;
}

/**
 * Policy information
 */
interface PolicyInfo {
  id: string;
  name: string;
  priority?: number;
}

/**
 * Context for authentication events
 */
interface AuthenticationContext {
  username?: string;
  ipAddress?: string;
  userAgent?: string;
  loginMethod?: string;
  attemptedUsername?: string;
}

/**
 * Context for security events
 */
interface SecurityContext {
  user?: AuditUser;
  ipAddress?: string;
  userAgent?: string;
  [key: string]: unknown;
}

/**
 * Filters for searching audit logs
 */
interface AuditFilters {
  user?: string;
  eventType?: string;
  result?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  startDate?: string | Date;
  endDate?: string | Date;
  resource?: string;
  action?: string;
}

/**
 * Options for searching audit logs
 */
interface AuditSearchOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Search results structure
 */
interface AuditSearchResults {
  results: AuditEvent[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Audit statistics structure
 */
interface AuditStats {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsByResult: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  eventsByUser: Record<string, number>;
  recentActivity: AuditEvent[];
  securityIncidents: number;
}

/**
 * Provider information
 */
interface ProviderInfo {
  name: string;
  version?: string;
  features?: string[];
  [key: string]: unknown;
}

/**
 * Base audit provider interface
 */
interface BaseAuditProvider {
  initialize(): Promise<void>;
  logAuditEvent(event: AuditEvent): Promise<string>;
  searchAuditLogs(filters: AuditFilters, options: AuditSearchOptions): Promise<AuditSearchResults>;
  getAuditStats(filters: AuditFilters): Promise<AuditStats>;
  exportAuditLogs(filters: AuditFilters, format: string): Promise<string>;
  flush(): Promise<void>;
  cleanup(): Promise<void>;
  close(): Promise<void>;
  isHealthy(): Promise<boolean>;
  getProviderInfo(): ProviderInfo;
}

class AuditManager extends BaseManager {
  private provider: BaseAuditProvider | null;
  private providerClass: string | null;

  /**
   * Creates a new AuditManager instance
   *
   * @constructor
   * @param {WikiEngine} engine - The wiki engine instance
   */
  constructor(engine: WikiEngine) {
    super(engine);
    this.provider = null;
    this.providerClass = null;
  }

  /**
   * Initialize the AuditManager and load the configured provider
   *
   * @async
   * @param {Record<string, unknown>} [config={}] - Configuration object (unused, reads from ConfigurationManager)
   * @returns {Promise<void>}
   * @throws {Error} If ConfigurationManager is not available or provider fails to load
   */
  async initialize(config: Record<string, unknown> = {}): Promise<void> {
    await super.initialize(config);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const configManager = this.engine.getManager('ConfigurationManager');
    if (!configManager) {
      throw new Error('AuditManager requires ConfigurationManager');
    }

    // Check if audit is enabled (ALL LOWERCASE)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const auditEnabled = configManager.getProperty('amdwiki.audit.enabled', true) as boolean;
    if (!auditEnabled) {
      logger.info('📋 AuditManager: Auditing disabled by configuration');
      // Load NullAuditProvider when disabled
      this.providerClass = 'NullAuditProvider';
      await this.loadProvider();
      return;
    }

    // Load provider with fallback (ALL LOWERCASE)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const defaultProvider = configManager.getProperty(
      'amdwiki.audit.provider.default',
      'fileauditprovider'
    ) as string;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const providerName = configManager.getProperty(
      'amdwiki.audit.provider',
      defaultProvider
    ) as string;

    // Normalize provider name to PascalCase for class loading
    // fileauditprovider -> FileAuditProvider
    this.providerClass = this.normalizeProviderName(providerName);

    logger.info(`📋 Loading audit provider: ${providerName} (${this.providerClass})`);

    // Load and initialize provider
    await this.loadProvider();

    logger.info(`📋 AuditManager initialized with ${this.providerClass}`);

    const providerInfo = this.provider.getProviderInfo();
    if (providerInfo.features && providerInfo.features.length > 0) {
      logger.info(`📋 Provider features: ${providerInfo.features.join(', ')}`);
    }
  }

  /**
   * Load the audit provider dynamically
   *
   * @private
   * @returns {Promise<void>}
   */
  private async loadProvider(): Promise<void> {
    try {
      // Try to load provider class
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
      const ProviderClass = require(`../providers/${this.providerClass}`);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      this.provider = new ProviderClass(this.engine);
      await this.provider.initialize();

      // Test provider health
      const isHealthy = await this.provider.isHealthy();
      if (!isHealthy) {
        logger.warn(`Audit provider ${this.providerClass} health check failed, switching to NullAuditProvider`);
        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
        const NullAuditProvider = require('../providers/NullAuditProvider');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        this.provider = new NullAuditProvider(this.engine);
        await this.provider.initialize();
      }
    } catch (error) {
      logger.error(`Failed to load audit provider: ${this.providerClass}`, error);
      // Fall back to NullAuditProvider on any error
      logger.warn('Falling back to NullAuditProvider due to provider load error');
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
      const NullAuditProvider = require('../providers/NullAuditProvider');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      this.provider = new NullAuditProvider(this.engine);
      await this.provider.initialize();
    }
  }

  /**
   * Normalize provider name to PascalCase class name
   *
   * @param {string} providerName - Lowercase provider name (e.g., 'fileauditprovider')
   * @returns {string} PascalCase class name (e.g., 'FileAuditProvider')
   * @private
   */
  private normalizeProviderName(providerName: string): string {
    if (!providerName) {
      throw new Error('Provider name cannot be empty');
    }

    // Convert to lowercase first to ensure consistency
    const lower = providerName.toLowerCase();

    // Handle special cases for known provider names
    const knownProviders: Record<string, string> = {
      'fileauditprovider': 'FileAuditProvider',
      'databaseauditprovider': 'DatabaseAuditProvider',
      'cloudauditprovider': 'CloudAuditProvider',
      'nullauditprovider': 'NullAuditProvider',
      'null': 'NullAuditProvider',
      'disabled': 'NullAuditProvider'
    };

    if (knownProviders[lower]) {
      return knownProviders[lower];
    }

    // Fallback: Split on common separators and capitalize each word
    const words = lower.split(/[-_]/);
    const pascalCase = words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    return pascalCase;
  }

  /**
   * Log an audit event
   *
   * @param {AuditEvent} auditEvent - Audit event data
   * @returns {Promise<string>} Event ID
   */
  async logAuditEvent(auditEvent: AuditEvent): Promise<string> {
    return await this.provider.logAuditEvent(auditEvent);
  }

  /**
   * Log access control decision
   *
   * @param {AccessContext} context - Access context
   * @param {string} result - 'allow', 'deny', 'error'
   * @param {string} reason - Reason for the decision
   * @param {PolicyInfo | null} policy - Policy that made the decision
   * @returns {Promise<string>} Event ID
   */
  async logAccessDecision(
    context: AccessContext,
    result: string,
    reason: string,
    policy: PolicyInfo | null = null
  ): Promise<string> {
    const auditEvent: AuditEvent = {
      eventType: 'access_decision',
      user: context.user?.username || 'anonymous',
      userId: context.user?.id,
      sessionId: context.sessionId,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      resource: context.resource,
      resourceType: context.resourceType || 'unknown',
      action: context.action,
      result: result,
      reason: reason,
      policyId: policy?.id,
      policyName: policy?.name,
      context: {
        userRoles: context.user?.roles,
        userAttributes: context.user?.attributes,
        requestMethod: context.requestMethod,
        requestPath: context.requestPath,
        timestamp: context.timestamp
      },
      severity: result === 'deny' ? 'medium' : 'low'
    };

    return await this.logAuditEvent(auditEvent);
  }

  /**
   * Log policy evaluation
   *
   * @param {AccessContext} context - Evaluation context
   * @param {PolicyInfo[]} policies - Policies evaluated
   * @param {string} finalResult - Final result
   * @param {number} duration - Evaluation duration in ms
   * @returns {Promise<string>} Event ID
   */
  async logPolicyEvaluation(
    context: AccessContext,
    policies: PolicyInfo[],
    finalResult: string,
    duration: number
  ): Promise<string> {
    const auditEvent: AuditEvent = {
      eventType: 'policy_evaluation',
      user: context.user?.username || 'anonymous',
      resource: context.resource,
      action: context.action,
      result: finalResult,
      reason: `Evaluated ${policies.length} policies`,
      context: {
        policyCount: policies.length,
        policies: policies.map(p => ({ id: p.id, name: p.name, priority: p.priority })),
        evaluationTime: duration
      },
      duration: duration,
      severity: duration > 1000 ? 'medium' : 'low' // Flag slow evaluations
    };

    return await this.logAuditEvent(auditEvent);
  }

  /**
   * Log authentication event
   *
   * @param {AuthenticationContext} context - Authentication context
   * @param {string} result - 'success', 'failure', 'logout'
   * @param {string} reason - Reason for result
   * @returns {Promise<string>} Event ID
   */
  async logAuthentication(
    context: AuthenticationContext,
    result: string,
    reason: string
  ): Promise<string> {
    const auditEvent: AuditEvent = {
      eventType: 'authentication',
      user: context.username || 'unknown',
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      result: result,
      reason: reason,
      severity: result === 'failure' ? 'high' : 'low',
      context: {
        loginMethod: context.loginMethod,
        attemptedUsername: context.attemptedUsername
      }
    };

    return await this.logAuditEvent(auditEvent);
  }

  /**
   * Log security event
   *
   * @param {SecurityContext} context - Security context
   * @param {string} eventType - Type of security event
   * @param {string} severity - 'low', 'medium', 'high', 'critical'
   * @param {string} description - Event description
   * @returns {Promise<string>} Event ID
   */
  async logSecurityEvent(
    context: SecurityContext,
    eventType: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    description: string
  ): Promise<string> {
    const auditEvent: AuditEvent = {
      eventType: 'security_event',
      user: context.user?.username || 'system',
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      severity: severity,
      reason: description,
      context: context,
      metadata: {
        securityEventType: eventType,
        timestamp: new Date().toISOString()
      }
    };

    return await this.logAuditEvent(auditEvent);
  }

  /**
   * Search audit logs
   *
   * @param {AuditFilters} filters - Search filters
   * @param {AuditSearchOptions} options - Search options
   * @returns {Promise<AuditSearchResults>} Search results
   */
  async searchAuditLogs(
    filters: AuditFilters = {},
    options: AuditSearchOptions = {}
  ): Promise<AuditSearchResults> {
    return await this.provider.searchAuditLogs(filters, options);
  }

  /**
   * Get audit statistics
   *
   * @param {AuditFilters} filters - Optional filters
   * @returns {Promise<AuditStats>} Audit statistics
   */
  async getAuditStats(filters: AuditFilters = {}): Promise<AuditStats> {
    return await this.provider.getAuditStats(filters);
  }

  /**
   * Export audit logs
   *
   * @param {AuditFilters} filters - Export filters
   * @param {string} format - Export format ('json', 'csv')
   * @returns {Promise<string>} Exported data
   */
  async exportAuditLogs(filters: AuditFilters = {}, format = 'json'): Promise<string> {
    return await this.provider.exportAuditLogs(filters, format);
  }

  /**
   * Flush audit queue to disk
   *
   * @returns {Promise<void>}
   */
  async flushAuditQueue(): Promise<void> {
    return await this.provider.flush();
  }

  /**
   * Clean up old audit logs based on retention policy
   *
   * @returns {Promise<void>}
   */
  async cleanupOldLogs(): Promise<void> {
    return await this.provider.cleanup();
  }

  /**
   * Shutdown the audit manager
   *
   * @returns {Promise<void>}
   */
  async shutdown(): Promise<void> {
    logger.info('📋 AuditManager shutting down...');

    if (this.provider) {
      await this.provider.close();
      this.provider = null;
    }

    await super.shutdown();
    logger.info('📋 AuditManager shut down successfully');
  }
}

export = AuditManager;
