const BaseAuditProvider = require('./BaseAuditProvider');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

/**
 * FileAuditProvider - File-based audit log storage
 *
 * Stores audit logs in local filesystem files with JSON line format.
 * Suitable for single-instance deployments and development.
 *
 * Configuration keys (all lowercase):
 * - amdwiki.audit.provider.file.logdirectory - Directory for audit log files
 * - amdwiki.audit.provider.file.auditfilename - Main audit log filename
 * - amdwiki.audit.provider.file.archivefilename - Archive log filename
 * - amdwiki.audit.provider.file.maxfilesize - Maximum file size
 * - amdwiki.audit.provider.file.maxfiles - Maximum number of archived files
 */
class FileAuditProvider extends BaseAuditProvider {
  constructor(engine) {
    super(engine);
    this.auditLogs = [];
    this.auditQueue = [];
    this.isProcessing = false;
    this.flushTimer = null;
    this.config = null;
  }

  /**
   * Initialize the file audit provider
   * @returns {Promise<void>}
   */
  async initialize() {
    const configManager = this.engine.getManager('ConfigurationManager');
    if (!configManager) {
      throw new Error('FileAuditProvider requires ConfigurationManager');
    }

    // Load shared audit settings (ALL LOWERCASE)
    const logLevel = configManager.getProperty('amdwiki.audit.loglevel', 'info');
    const maxQueueSize = configManager.getProperty('amdwiki.audit.maxqueuesize', 1000);
    const flushInterval = configManager.getProperty('amdwiki.audit.flushinterval', 30000);
    const retentionDays = configManager.getProperty('amdwiki.audit.retentiondays', 90);

    // Load provider-specific settings (ALL LOWERCASE)
    const logDirectory = configManager.getProperty(
      'amdwiki.audit.provider.file.logdirectory',
      './logs'
    );
    const auditFileName = configManager.getProperty(
      'amdwiki.audit.provider.file.auditfilename',
      'audit.log'
    );
    const archiveFileName = configManager.getProperty(
      'amdwiki.audit.provider.file.archivefilename',
      'audit-archive.log'
    );
    const maxFileSize = configManager.getProperty(
      'amdwiki.audit.provider.file.maxfilesize',
      '10MB'
    );
    const maxFiles = configManager.getProperty(
      'amdwiki.audit.provider.file.maxfiles',
      10
    );

    // Ensure logDirectory is absolute
    this.config = {
      logLevel,
      maxQueueSize,
      flushInterval,
      retentionDays,
      logDirectory: path.isAbsolute(logDirectory)
        ? logDirectory
        : path.join(process.cwd(), logDirectory),
      auditFileName,
      archiveFileName,
      maxFileSize,
      maxFiles
    };

    // Ensure log directory exists
    await fs.ensureDir(this.config.logDirectory);

    // Set up periodic flush
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);

    // Load existing audit logs
    await this.loadExistingLogs();

    // Clean up old logs
    await this.cleanup();

    this.initialized = true;

    logger.info(`[FileAuditProvider] Initialized - directory: ${this.config.logDirectory}`);
    logger.info(`[FileAuditProvider] Retention: ${this.config.retentionDays} days, Max files: ${this.config.maxFiles}`);
  }

  /**
   * Get provider information
   * @returns {Object} Provider metadata
   */
  getProviderInfo() {
    return {
      name: 'FileAuditProvider',
      version: '1.0.0',
      description: 'File-based audit log storage',
      features: ['search', 'export', 'retention', 'archiving', 'local-storage']
    };
  }

  /**
   * Log an audit event
   * @param {Object} auditEvent - Audit event data
   * @returns {Promise<string>} Event ID
   */
  async logAuditEvent(auditEvent) {
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
      result: auditEvent.result,
      reason: auditEvent.reason,
      policyId: auditEvent.policyId,
      policyName: auditEvent.policyName,
      context: auditEvent.context || {},
      metadata: auditEvent.metadata || {},
      duration: auditEvent.duration,
      severity: auditEvent.severity || 'low'
    };

    // Add to in-memory queue
    this.auditQueue.push(event);

    // Flush if queue is getting large
    if (this.auditQueue.length >= this.config.maxQueueSize) {
      await this.flush();
    }

    // Log critical events immediately
    if (event.severity === 'critical' || event.level === 'error') {
      logger.error(`[FileAuditProvider] CRITICAL: ${event.eventType} - ${event.result}`, {
        user: event.user,
        resource: event.resource,
        reason: event.reason
      });
    }

    return event.id;
  }

  /**
   * Search audit logs
   * @param {Object} filters - Search filters
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results
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
   * @returns {Promise<Object>} Audit statistics
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
   * Export audit logs
   * @param {Object} filters - Export filters
   * @param {string} format - Export format ('json', 'csv')
   * @returns {Promise<string>} Exported data
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
   * Flush pending audit events to storage
   * @returns {Promise<void>}
   */
  async flush() {
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

      logger.debug(`[FileAuditProvider] Flushed ${eventsToFlush.length} audit events to disk`);

    } catch (error) {
      logger.error('[FileAuditProvider] Failed to flush audit queue:', error);
      // Re-queue failed events
      this.auditQueue.unshift(...eventsToFlush);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Load existing audit logs from disk
   * @private
   * @returns {Promise<void>}
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

        logger.info(`[FileAuditProvider] Loaded ${this.auditLogs.length} recent audit logs`);
      }
    } catch (error) {
      logger.error('[FileAuditProvider] Failed to load existing audit logs:', error);
    }
  }

  /**
   * Clean up old audit logs based on retention policy
   * @returns {Promise<void>}
   */
  async cleanup() {
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
          logger.info('[FileAuditProvider] Archived old audit log file');
        }
      }
    } catch (error) {
      logger.error('[FileAuditProvider] Failed to cleanup old audit logs:', error);
    }
  }

  /**
   * Check if the audit provider is healthy
   * @returns {Promise<boolean>} True if healthy
   */
  async isHealthy() {
    try {
      // Test write access to log directory
      const testFile = path.join(this.config.logDirectory, '.health_check');
      await fs.writeFile(testFile, 'test');
      await fs.unlink(testFile);
      return true;
    } catch (error) {
      logger.error('[FileAuditProvider] Health check failed:', error);
      return false;
    }
  }

  /**
   * Close/cleanup the audit provider
   * @returns {Promise<void>}
   */
  async close() {
    // Flush any remaining events
    await this.flush();

    // Clear flush timer
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    this.initialized = false;
    logger.info('[FileAuditProvider] Closed successfully');
  }

  /**
   * Backup audit configuration and statistics
   * @returns {Promise<Object>} Backup data
   */
  async backup() {
    const baseBackup = await super.backup();
    return {
      ...baseBackup,
      config: { ...this.config },
      eventCount: this.auditLogs.length,
      queueSize: this.auditQueue.length
    };
  }
}

module.exports = FileAuditProvider;
