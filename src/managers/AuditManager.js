/**
 * AuditManager - Comprehensive audit trail system for access control and security monitoring
 * Extends BaseManager following the JSPWiki modular manager pattern
 */
const BaseManager = require('./BaseManager');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');

class AuditManager extends BaseManager {
  constructor(engine) {
    super(engine);
    this.auditLogs = [];
    this.auditQueue = [];
    this.isProcessing = false;
  }

  /**
   * Initialize the audit manager
   * @param {Object} config - Configuration object
   */
  async initialize(config = {}) {
    this.config = {
      enabled: true,
      logLevel: 'info',
      maxQueueSize: 1000,
      flushInterval: 30000, // 30 seconds
      retentionDays: 90,
      logDirectory: path.join(__dirname, '../../logs'),
      auditFileName: 'audit.log',
      archiveFileName: 'audit-archive.log',
      maxFileSize: '10MB',
      maxFiles: 10,
      ...config
    };

    // Ensure logDirectory is an absolute path
    if (this.config.logDirectory && !path.isAbsolute(this.config.logDirectory)) {
      this.config.logDirectory = path.resolve(__dirname, '../../', this.config.logDirectory);
    }

    // Ensure log directory exists
    await fs.ensureDir(this.config.logDirectory);

    // Set up periodic flush
    this.flushTimer = setInterval(() => {
      this.flushAuditQueue();
    }, this.config.flushInterval);

    // Load existing audit logs if any
    await this.loadExistingLogs();

    // Clean up old logs
    await this.cleanupOldLogs();

    await super.initialize(config);

    console.log('📋 AuditManager initialized successfully');
  }

  /**
   * Log an audit event
   * @param {Object} auditEvent - Audit event data
   */
  async logAuditEvent(auditEvent) {
    if (!this.config.enabled) {
      return;
    }

    const event = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      level: auditEvent.level || 'info',
      eventType: auditEvent.eventType,
      user: auditEvent.user || 'anonymous',
      userId: auditEvent.userId,
      sessionId: auditEvent.sessionId,
      ipAddress: auditEvent.ipAddress,
      userAgent: auditEvent.userAgent,
      resource: auditEvent.resource,
      resourceType: auditEvent.resourceType,
      action: auditEvent.action,
      result: auditEvent.result, // 'allow', 'deny', 'error'
      reason: auditEvent.reason,
      policyId: auditEvent.policyId,
      policyName: auditEvent.policyName,
      context: auditEvent.context || {},
      metadata: auditEvent.metadata || {},
      duration: auditEvent.duration, // in milliseconds
      severity: auditEvent.severity || 'low' // 'low', 'medium', 'high', 'critical'
    };

    // Add to in-memory queue
    this.auditQueue.push(event);

    // Flush if queue is getting large
    if (this.auditQueue.length >= this.config.maxQueueSize) {
      await this.flushAuditQueue();
    }

    // Log critical events immediately
    if (event.severity === 'critical' || event.level === 'error') {
      console.error(`AUDIT CRITICAL: ${event.eventType} - ${event.result}`, {
        user: event.user,
        resource: event.resource,
        reason: event.reason
      });
    }

    return event.id;
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
   */
  async searchAuditLogs(filters = {}, options = {}) {
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
   */
  async getAuditStats(filters = {}) {
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
   * Flush audit queue to disk
   */
  async flushAuditQueue() {
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
   */
  async cleanupOldLogs() {
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
   * Export audit logs
   * @param {Object} filters - Export filters
   * @param {string} format - Export format ('json', 'csv')
   */
  async exportAuditLogs(filters = {}, format = 'json') {
    const logs = await this.searchAuditLogs(filters, { limit: 10000 });

    if (format === 'csv') {
      const csvHeader = 'timestamp,eventType,user,resource,action,result,severity,reason\n';
      const csvRows = logs.results.map(log =>
        `"${log.timestamp}","${log.eventType}","${log.user}","${log.resource}","${log.action}","${log.result}","${log.severity}","${log.reason}"`
      ).join('\n');

      return csvHeader + csvRows;
    }

    return JSON.stringify(logs.results, null, 2);
  }

  /**
   * Shutdown the audit manager
   */
  async shutdown() {
    // Flush any remaining events
    await this.flushAuditQueue();

    // Clear flush timer
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    await super.shutdown();
    console.log('AuditManager shut down successfully');
  }
}

module.exports = AuditManager;