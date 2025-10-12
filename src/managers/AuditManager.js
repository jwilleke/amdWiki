/**
 * AuditManager - Comprehensive audit trail system for access control and security monitoring
 * Extends BaseManager following the JSPWiki modular manager pattern with provider architecture
 *
 * Follows the provider pattern established in CacheManager, AttachmentManager, PageManager.
 * Supports pluggable audit storage backends (file, database, cloud logging).
 */
const BaseManager = require('./BaseManager');
const logger = require('../utils/logger');

class AuditManager extends BaseManager {
  constructor(engine) {
    super(engine);
    this.provider = null;
    this.providerClass = null;
  }

  /**
   * Initialize the audit manager
   * @param {Object} config - Configuration object
   */
  async initialize(config = {}) {
    await super.initialize(config);

    const configManager = this.engine.getManager('ConfigurationManager');
    if (!configManager) {
      throw new Error('AuditManager requires ConfigurationManager');
    }

    // Check if audit is enabled (ALL LOWERCASE)
    const auditEnabled = configManager.getProperty('amdwiki.audit.enabled', true);
    if (!auditEnabled) {
      logger.info('📋 AuditManager: Auditing disabled by configuration');
      // Load NullAuditProvider when disabled
      this.providerClass = 'NullAuditProvider';
      await this.#loadProvider();
      return;
    }

    // Load provider with fallback (ALL LOWERCASE)
    const defaultProvider = configManager.getProperty(
      'amdwiki.audit.provider.default',
      'fileauditprovider'
    );
    const providerName = configManager.getProperty(
      'amdwiki.audit.provider',
      defaultProvider
    );

    // Normalize provider name to PascalCase for class loading
    // fileauditprovider -> FileAuditProvider
    this.providerClass = this.#normalizeProviderName(providerName);

    logger.info(`📋 Loading audit provider: ${providerName} (${this.providerClass})`);

    // Load and initialize provider
    await this.#loadProvider();

    logger.info(`📋 AuditManager initialized with ${this.providerClass}`);

    const providerInfo = this.provider.getProviderInfo();
    if (providerInfo.features && providerInfo.features.length > 0) {
      logger.info(`📋 Provider features: ${providerInfo.features.join(', ')}`);
    }
  }

  /**
   * Load the audit provider dynamically
   * @private
   * @returns {Promise<void>}
   */
  async #loadProvider() {
    try {
      // Try to load provider class
      const ProviderClass = require(`../providers/${this.providerClass}`);
      this.provider = new ProviderClass(this.engine);
      await this.provider.initialize();

      // Test provider health
      const isHealthy = await this.provider.isHealthy();
      if (!isHealthy) {
        logger.warn(`Audit provider ${this.providerClass} health check failed, switching to NullAuditProvider`);
        const NullAuditProvider = require('../providers/NullAuditProvider');
        this.provider = new NullAuditProvider(this.engine);
        await this.provider.initialize();
      }
    } catch (error) {
      logger.error(`Failed to load audit provider: ${this.providerClass}`, error);
      // Fall back to NullAuditProvider on any error
      logger.warn('Falling back to NullAuditProvider due to provider load error');
      const NullAuditProvider = require('../providers/NullAuditProvider');
      this.provider = new NullAuditProvider(this.engine);
      await this.provider.initialize();
    }
  }

  /**
   * Normalize provider name to PascalCase class name
   * @param {string} providerName - Lowercase provider name (e.g., 'fileauditprovider')
   * @returns {string} PascalCase class name (e.g., 'FileAuditProvider')
   * @private
   */
  #normalizeProviderName(providerName) {
    if (!providerName) {
      throw new Error('Provider name cannot be empty');
    }

    // Convert to lowercase first to ensure consistency
    const lower = providerName.toLowerCase();

    // Handle special cases for known provider names
    const knownProviders = {
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
   * @param {Object} auditEvent - Audit event data
   * @returns {Promise<string>} Event ID
   */
  async logAuditEvent(auditEvent) {
    return await this.provider.logAuditEvent(auditEvent);
  }

  /**
   * Log access control decision
   * @param {Object} context - Access context
   * @param {string} result - 'allow', 'deny', 'error'
   * @param {string} reason - Reason for the decision
   * @param {Object} policy - Policy that made the decision
   */
  async logAccessDecision(context, result, reason, policy = null) {
    const auditEvent = {
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
   * @param {Object} context - Evaluation context
   * @param {Array} policies - Policies evaluated
   * @param {string} finalResult - Final result
   * @param {number} duration - Evaluation duration in ms
   */
  async logPolicyEvaluation(context, policies, finalResult, duration) {
    const auditEvent = {
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
   * @param {Object} context - Authentication context
   * @param {string} result - 'success', 'failure', 'logout'
   * @param {string} reason - Reason for result
   */
  async logAuthentication(context, result, reason) {
    const auditEvent = {
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
   * @param {Object} context - Security context
   * @param {string} eventType - Type of security event
   * @param {string} severity - 'low', 'medium', 'high', 'critical'
   * @param {string} description - Event description
   */
  async logSecurityEvent(context, eventType, severity, description) {
    const auditEvent = {
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
   * @param {Object} filters - Search filters
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results
   */
  async searchAuditLogs(filters = {}, options = {}) {
    return await this.provider.searchAuditLogs(filters, options);
  }

  /**
   * Search audit logs (original implementation - keeping for backwards compatibility)
   * @private
   * @param {Object} filters - Search filters
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results
   * @deprecated Use searchAuditLogs instead
   */
  async _searchAuditLogsOld(filters = {}, options = {}) {
    const {
      user,
      eventType,
      result,
      severity,
      startDate,
      endDate,
      resource,
      action,
      limit = 100,
      offset = 0,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = { ...filters, ...options };

    let filteredLogs = [...this.auditLogs];

    // Apply filters
    if (user) {
      filteredLogs = filteredLogs.filter(log => log.user === user);
    }
    if (eventType) {
      filteredLogs = filteredLogs.filter(log => log.eventType === eventType);
    }
    if (result) {
      filteredLogs = filteredLogs.filter(log => log.result === result);
    }
    if (severity) {
      filteredLogs = filteredLogs.filter(log => log.severity === severity);
    }
    if (resource) {
      filteredLogs = filteredLogs.filter(log => log.resource === resource);
    }
    if (action) {
      filteredLogs = filteredLogs.filter(log => log.action === action);
    }
    if (startDate) {
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= new Date(startDate));
    }
    if (endDate) {
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= new Date(endDate));
    }

    // Sort
    filteredLogs.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      const order = sortOrder === 'desc' ? -1 : 1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * order;
      }
      return (aVal - bVal) * order;
    });

    // Paginate
    const total = filteredLogs.length;
    const results = filteredLogs.slice(offset, offset + limit);

    return {
      results,
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    };
  }

  /**
   * Get audit statistics
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} Audit statistics
   */
  async getAuditStats(filters = {}) {
    return await this.provider.getAuditStats(filters);
  }

  /**
   * Get audit statistics (original implementation)
   * @private
   * @deprecated Use getAuditStats instead
   */
  async _getAuditStatsOld(filters = {}) {
    const logs = await this.searchAuditLogs(filters, { limit: 10000 });

    const stats = {
      totalEvents: logs.total,
      eventsByType: {},
      eventsByResult: {},
      eventsBySeverity: {},
      eventsByUser: {},
      recentActivity: [],
      securityIncidents: 0
    };

    logs.results.forEach(log => {
      // Count by type
      stats.eventsByType[log.eventType] = (stats.eventsByType[log.eventType] || 0) + 1;

      // Count by result
      if (log.result) {
        stats.eventsByResult[log.result] = (stats.eventsByResult[log.result] || 0) + 1;
      }

      // Count by severity
      stats.eventsBySeverity[log.severity] = (stats.eventsBySeverity[log.severity] || 0) + 1;

      // Count by user
      stats.eventsByUser[log.user] = (stats.eventsByUser[log.user] || 0) + 1;

      // Track security incidents
      if (log.severity === 'high' || log.severity === 'critical') {
        stats.securityIncidents++;
      }
    });

    // Get recent activity (last 10 events)
    stats.recentActivity = logs.results.slice(0, 10);

    return stats;
  }

  /**
   * Export audit logs
   * @param {Object} filters - Export filters
   * @param {string} format - Export format ('json', 'csv')
   * @returns {Promise<string>} Exported data
   */
  async exportAuditLogs(filters = {}, format = 'json') {
    return await this.provider.exportAuditLogs(filters, format);
  }

  /**
   * Flush audit queue to disk
   * @returns {Promise<void>}
   */
  async flushAuditQueue() {
    return await this.provider.flush();
  }

  /**
   * Flush audit queue (original implementation)
   * @private
   * @deprecated
   */
  async _flushAuditQueueOld() {
    if (this.auditQueue.length === 0 || this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      const eventsToFlush = [...this.auditQueue];
      this.auditQueue = [];

      // Convert to log format
      const logLines = eventsToFlush.map(event => JSON.stringify(event)).join('\n') + '\n';

      // Append to audit log file
      const auditLogPath = path.join(this.config.logDirectory, this.config.auditFileName);
      await fs.appendFile(auditLogPath, logLines);

      // Add to in-memory logs for search
      this.auditLogs.push(...eventsToFlush);

      // Keep only recent logs in memory (last 10000)
      if (this.auditLogs.length > 10000) {
        this.auditLogs = this.auditLogs.slice(-10000);
      }

      console.debug(`Flushed ${eventsToFlush.length} audit events to disk`);

    } catch (error) {
      console.error('Failed to flush audit queue:', error);
      // Re-queue failed events
      this.auditQueue.unshift(...this.auditQueue);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Load existing audit logs from disk
   */
  async loadExistingLogs() {
    try {
      const auditLogPath = path.join(this.config.logDirectory, this.config.auditFileName);

      if (await fs.pathExists(auditLogPath)) {
        const content = await fs.readFile(auditLogPath, 'utf8');
        const lines = content.trim().split('\n');

        // Parse last 1000 lines for in-memory search
        const recentLines = lines.slice(-1000);
        this.auditLogs = recentLines
          .map(line => {
            try {
              return JSON.parse(line);
            } catch (e) {
              return null;
            }
          })
          .filter(log => log !== null);

        console.log(`Loaded ${this.auditLogs.length} recent audit logs`);
      }
    } catch (error) {
      console.error('Failed to load existing audit logs:', error);
    }
  }

  /**
   * Clean up old audit logs based on retention policy
   * @returns {Promise<void>}
   */
  async cleanupOldLogs() {
    return await this.provider.cleanup();
  }

  /**
   * Clean up old audit logs (original implementation)
   * @private
   * @deprecated
   */
  async _cleanupOldLogsOld() {
    try {
      const auditLogPath = path.join(this.config.logDirectory, this.config.auditFileName);
      const archivePath = path.join(this.config.logDirectory, this.config.archiveFileName);

      if (await fs.pathExists(auditLogPath)) {
        const stats = await fs.stat(auditLogPath);
        const fileAge = Date.now() - stats.mtime.getTime();
        const retentionMs = this.config.retentionDays * 24 * 60 * 60 * 1000;

        if (fileAge > retentionMs) {
          // Archive old log
          await fs.move(auditLogPath, archivePath, { overwrite: true });
          console.log('Archived old audit log file');
        }
      }
    } catch (error) {
      console.error('Failed to cleanup old audit logs:', error);
    }
  }

  /**
   * Shutdown the audit manager
   * @returns {Promise<void>}
   */
  async shutdown() {
    logger.info('📋 AuditManager shutting down...');

    if (this.provider) {
      await this.provider.close();
      this.provider = null;
    }

    await super.shutdown();
    logger.info('📋 AuditManager shut down successfully');
  }
}

module.exports = AuditManager;