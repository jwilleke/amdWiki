import BaseAuditProvider, { WikiEngine, AuditFilters, AuditSearchResults, AuditStats, AuditBackupData } from './BaseAuditProvider';
import * as path from 'path';
import * as fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';
import { AuditEvent } from '../types';

/**
 * Extended audit event with additional fields used by FileAuditProvider
 */
interface ExtendedAuditEvent {
  id: string;
  timestamp: string;
  level?: string;
  eventType: string;
  user?: string;
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
  context?: Record<string, any>;
  metadata?: Record<string, any>;
  duration?: number;
  severity?: string;
}

/**
 * Configuration for FileAuditProvider
 */
interface FileAuditConfig {
  logLevel: string;
  maxQueueSize: number;
  flushInterval: number;
  retentionDays: number;
  logDirectory: string;
  auditFileName: string;
  archiveFileName: string;
  maxFileSize: string;
  maxFiles: number;
}

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
  private auditLogs: ExtendedAuditEvent[];
  private auditQueue: ExtendedAuditEvent[];
  private isProcessing: boolean;
  private flushTimer: NodeJS.Timeout | null;
  private config: FileAuditConfig | null;

  constructor(engine: WikiEngine) {
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
  async initialize(): Promise<void> {
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
   * @param {AuditEvent} auditEvent - Audit event data
   * @returns {Promise<string>} Event ID
   */
  async logAuditEvent(auditEvent: AuditEvent): Promise<string> {
    const event: ExtendedAuditEvent = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      level: (auditEvent as any).level || 'info',
      eventType: (auditEvent as any).eventType || auditEvent.type,
      user: (auditEvent as any).user || auditEvent.actor || 'anonymous',
      userId: (auditEvent as any).userId,
      sessionId: (auditEvent as any).sessionId,
      ipAddress: auditEvent.ipAddress,
      userAgent: auditEvent.userAgent,
      resource: (auditEvent as any).resource || auditEvent.target,
      resourceType: (auditEvent as any).resourceType,
      action: auditEvent.action,
      result: (auditEvent as any).result || (auditEvent.result === 'success' ? 'allow' : 'deny'),
      reason: (auditEvent as any).reason || auditEvent.error,
      policyId: (auditEvent as any).policyId,
      policyName: (auditEvent as any).policyName,
      context: (auditEvent as any).context || {},
      metadata: (auditEvent as any).metadata || auditEvent.data || {},
      duration: (auditEvent as any).duration,
      severity: (auditEvent as any).severity || 'low'
    };

    // Add to in-memory queue
    this.auditQueue.push(event);

    // Flush if queue is getting large
    if (this.config && this.auditQueue.length >= this.config.maxQueueSize) {
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
   * @param {AuditFilters} filters - Search filters
   * @param {Record<string, any>} options - Search options
   * @returns {Promise<AuditSearchResults>} Search results
   */
  async searchAuditLogs(filters: AuditFilters = {}, options: Record<string, any> = {}): Promise<AuditSearchResults> {
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
      const aVal = (a as any)[sortBy];
      const bVal = (b as any)[sortBy];
      const order = sortOrder === 'desc' ? -1 : 1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * order;
      }
      return ((aVal as number) - (bVal as number)) * order;
    });

    // Paginate
    const total = filteredLogs.length;
    const results = filteredLogs.slice(offset, offset + limit);

    return {
      results: results as any, // Cast to AuditEvent[] for interface compliance
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    };
  }

  /**
   * Get audit statistics
   * @param {AuditFilters} filters - Optional filters
   * @returns {Promise<AuditStats>} Audit statistics
   */
  async getAuditStats(filters: AuditFilters = {}): Promise<AuditStats> {
    const logs = await this.searchAuditLogs(filters, { limit: 10000 });

    const stats: AuditStats = {
      totalEvents: logs.total,
      eventsByType: {},
      eventsByResult: {},
      eventsBySeverity: {},
      eventsByUser: {},
      recentActivity: [],
      securityIncidents: 0
    };

    logs.results.forEach((log: any) => {
      // Count by type
      const eventType = log.eventType || log.type;
      if (eventType) {
        stats.eventsByType[eventType] = (stats.eventsByType[eventType] || 0) + 1;
      }

      // Count by result
      if (log.result) {
        stats.eventsByResult[log.result] = (stats.eventsByResult[log.result] || 0) + 1;
      }

      // Count by severity
      const severity = log.severity || 'low';
      stats.eventsBySeverity[severity] = (stats.eventsBySeverity[severity] || 0) + 1;

      // Count by user
      const user = log.user || log.actor;
      if (user) {
        stats.eventsByUser[user] = (stats.eventsByUser[user] || 0) + 1;
      }

      // Track security incidents
      if (severity === 'high' || severity === 'critical') {
        stats.securityIncidents = (stats.securityIncidents || 0) + 1;
      }
    });

    // Get recent activity (last 10 events)
    stats.recentActivity = logs.results.slice(0, 10);

    return stats;
  }

  /**
   * Export audit logs
   * @param {AuditFilters} filters - Export filters
   * @param {string} format - Export format ('json', 'csv')
   * @returns {Promise<string>} Exported data
   */
  async exportAuditLogs(filters: AuditFilters = {}, format: 'json' | 'csv' = 'json'): Promise<string> {
    const logs = await this.searchAuditLogs(filters, { limit: 10000 });

    if (format === 'csv') {
      const csvHeader = 'timestamp,eventType,user,resource,action,result,severity,reason\n';
      const csvRows = logs.results.map((log: any) =>
        `"${log.timestamp}","${log.eventType || log.type}","${log.user || log.actor}","${log.resource || log.target}","${log.action}","${log.result}","${log.severity || 'low'}","${log.reason || log.error || ''}"`
      ).join('\n');

      return csvHeader + csvRows;
    }

    return JSON.stringify(logs.results, null, 2);
  }

  /**
   * Flush pending audit events to storage
   * @returns {Promise<void>}
   */
  async flush(): Promise<void> {
    if (this.auditQueue.length === 0 || this.isProcessing || !this.config) {
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
      this.auditQueue.unshift(...this.auditQueue);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Load existing audit logs from disk
   * @private
   * @returns {Promise<void>}
   */
  private async loadExistingLogs(): Promise<void> {
    if (!this.config) return;

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
              return JSON.parse(line) as ExtendedAuditEvent;
            } catch (e) {
              return null;
            }
          })
          .filter((log): log is ExtendedAuditEvent => log !== null);

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
  async cleanup(): Promise<void> {
    if (!this.config) return;

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
  async isHealthy(): Promise<boolean> {
    if (!this.config) return false;

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
  async close(): Promise<void> {
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
   * @returns {Promise<AuditBackupData>} Backup data
   */
  async backup(): Promise<AuditBackupData> {
    const baseBackup = await super.backup();
    return {
      ...baseBackup,
      config: this.config ? { ...this.config } : {},
      eventCount: this.auditLogs.length,
      queueSize: this.auditQueue.length
    };
  }
}

export default FileAuditProvider;
