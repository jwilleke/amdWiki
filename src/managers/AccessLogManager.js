const BaseManager = require('./BaseManager');
const fs = require('fs').promises;
const path = require('path');

/**
 * AccessLogManager - Handles comprehensive audit trail and access logging
 * Logs all access decisions with context for security and compliance
 */
class AccessLogManager extends BaseManager {
  constructor(engine) {
    super(engine);
    this.logFile = './users/access-log.json';
    this.logs = [];
    this.maxLogEntries = 10000; // Default max entries
    this.retentionDays = 90; // Default retention period
  }

  async initialize(config = {}) {
    await super.initialize(config);
    
    // Configuration from engine config with defaults
    const auditConfig = this.engine.getConfig().get('auditTrail', {});
    this.logFile = auditConfig.logFile || config.logFile || './users/access-log.json';
    this.maxLogEntries = auditConfig.maxLogEntries || config.maxLogEntries || 10000;
    this.retentionDays = auditConfig.retentionDays || config.retentionDays || 90;
    this.consoleLogging = auditConfig.consoleLogging !== false; // default true
    
    // Create users directory if it doesn't exist
    const logDir = path.dirname(this.logFile);
    await fs.mkdir(logDir, { recursive: true });
    
    // Load existing logs
    await this.loadLogs();
    
    // Clean up old logs on startup
    await this.cleanOldLogs();
    
    console.log(`🔍 AccessLogManager initialized - ${this.logs.length} existing entries`);
  }

  /**
   * Load existing access logs from file
   */
  async loadLogs() {
    try {
      const logsData = await fs.readFile(this.logFile, 'utf8');
      this.logs = JSON.parse(logsData);
      console.log(`🔍 Loaded ${this.logs.length} access log entries`);
    } catch (err) {
      // Log file doesn't exist yet
      this.logs = [];
    }
  }

  /**
   * Save access logs to file with rotation if needed
   */
  async saveLogs() {
    try {
      // Check if we need to rotate logs (exceed max entries)
      if (this.logs.length > this.maxLogEntries) {
        await this.rotateLogs();
      }
      
      await fs.writeFile(this.logFile, JSON.stringify(this.logs, null, 2));
    } catch (err) {
      console.error('Error saving access logs:', err);
    }
  }

  /**
   * Rotate logs when they exceed max entries
   */
  async rotateLogs() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const archiveFile = this.logFile.replace('.json', `-archive-${timestamp}.json`);
      
      // Keep only the newest entries, archive the rest
      const keepCount = Math.floor(this.maxLogEntries * 0.7); // Keep 70% of max
      const toArchive = this.logs.slice(0, -keepCount);
      
      if (toArchive.length > 0) {
        await fs.writeFile(archiveFile, JSON.stringify(toArchive, null, 2));
        console.log(`🔄 Archived ${toArchive.length} log entries to ${archiveFile}`);
        
        // Keep only recent entries
        this.logs = this.logs.slice(-keepCount);
      }
    } catch (err) {
      console.error('Error rotating logs:', err);
    }
  }

  /**
   * Clean up old log entries based on retention policy
   */
  async cleanOldLogs() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);
    
    const originalCount = this.logs.length;
    this.logs = this.logs.filter(log => new Date(log.timestamp) > cutoffDate);
    
    const removedCount = originalCount - this.logs.length;
    if (removedCount > 0) {
      console.log(`🧹 Cleaned up ${removedCount} old log entries (older than ${this.retentionDays} days)`);
      await this.saveLogs();
    }
  }

  /**
   * Log an access decision with full context
   * @param {Object} context - Access context information
   */
  async logAccess(context) {
    const logEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      action: context.action,
      resource: context.resource,
      user: {
        username: context.user?.username || 'anonymous',
        displayName: context.user?.displayName || 'Anonymous User',
        roles: context.user?.roles || ['anonymous'],
        isAuthenticated: context.user?.isAuthenticated || false
      },
      request: {
        ip: context.ip,
        userAgent: context.userAgent,
        method: context.method,
        url: context.url,
        referrer: context.referrer
      },
      decision: {
        allowed: context.allowed,
        reason: context.reason,
        source: context.source || 'ACLManager',
        aclRules: context.aclRules || null,
        defaultPolicy: context.defaultPolicy || false
      },
      session: {
        sessionId: context.sessionId,
        hasSessionCookie: context.hasSessionCookie || false
      },
      metadata: {
        duration: context.duration || null,
        pageCategory: context.pageCategory || null,
        isSystemPage: context.isSystemPage || false,
        ...context.additionalMetadata
      }
    };

    // Add to logs
    this.logs.push(logEntry);
    
    // Save asynchronously to avoid blocking the request
    setImmediate(() => this.saveLogs());
    
    // Log to console for immediate visibility (configurable)
    if (this.shouldLogToConsole(logEntry)) {
      this.logToConsole(logEntry);
    }
    
    return logEntry.id;
  }

  /**
   * Generate unique log ID
   */
  generateLogId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}`;
  }

  /**
   * Determine if log entry should be shown in console
   */
  shouldLogToConsole(logEntry) {
    // Only log if console logging is enabled
    if (!this.consoleLogging) {
      return false;
    }
    
    // Log denied access attempts and system page access
    return !logEntry.decision.allowed || 
           logEntry.metadata.isSystemPage ||
           logEntry.user.username === 'anonymous';
  }

  /**
   * Log entry to console with appropriate formatting
   */
  logToConsole(logEntry) {
    const status = logEntry.decision.allowed ? '✅' : '❌';
    const user = logEntry.user.username;
    const action = logEntry.action;
    const resource = logEntry.resource;
    const reason = logEntry.decision.reason;
    const ip = logEntry.request.ip;
    
    console.log(`${status} Access ${action} ${resource} by ${user} from ${ip} - ${reason}`);
  }

  /**
   * Get access logs with filtering and pagination
   * @param {Object} options - Query options
   */
  async getAccessLogs(options = {}) {
    let filteredLogs = [...this.logs];
    
    // Filter by user
    if (options.username) {
      filteredLogs = filteredLogs.filter(log => 
        log.user.username.toLowerCase().includes(options.username.toLowerCase())
      );
    }
    
    // Filter by action
    if (options.action) {
      filteredLogs = filteredLogs.filter(log => 
        log.action === options.action
      );
    }
    
    // Filter by resource/page
    if (options.resource) {
      filteredLogs = filteredLogs.filter(log => 
        log.resource.toLowerCase().includes(options.resource.toLowerCase())
      );
    }
    
    // Filter by decision (allowed/denied)
    if (options.allowed !== undefined) {
      filteredLogs = filteredLogs.filter(log => 
        log.decision.allowed === options.allowed
      );
    }
    
    // Filter by date range
    if (options.startDate) {
      const startDate = new Date(options.startDate);
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) >= startDate
      );
    }
    
    if (options.endDate) {
      const endDate = new Date(options.endDate);
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) <= endDate
      );
    }
    
    // Filter by IP address
    if (options.ip) {
      filteredLogs = filteredLogs.filter(log => 
        log.request.ip === options.ip
      );
    }
    
    // Sort by timestamp (newest first by default)
    filteredLogs.sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return options.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    // Pagination
    const page = options.page || 1;
    const limit = options.limit || 100;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
    
    return {
      logs: paginatedLogs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredLogs.length / limit),
        totalCount: filteredLogs.length,
        hasNext: endIndex < filteredLogs.length,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Get access statistics for reporting
   */
  async getAccessStatistics(options = {}) {
    const period = options.period || 24; // hours
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - period);
    
    const recentLogs = this.logs.filter(log => 
      new Date(log.timestamp) > cutoffDate
    );
    
    const stats = {
      period: `${period} hours`,
      totalAccess: recentLogs.length,
      allowedAccess: recentLogs.filter(log => log.decision.allowed).length,
      deniedAccess: recentLogs.filter(log => !log.decision.allowed).length,
      uniqueUsers: new Set(recentLogs.map(log => log.user.username)).size,
      uniqueIPs: new Set(recentLogs.map(log => log.request.ip)).size,
      topActions: this.getTopItems(recentLogs, 'action', 5),
      topResources: this.getTopItems(recentLogs, 'resource', 10),
      topUsers: this.getTopItems(recentLogs, log => log.user.username, 10),
      topIPs: this.getTopItems(recentLogs, log => log.request.ip, 10),
      deniedByReason: this.getTopItems(
        recentLogs.filter(log => !log.decision.allowed), 
        log => log.decision.reason, 
        5
      )
    };
    
    return stats;
  }

  /**
   * Helper to get top items from logs
   */
  getTopItems(logs, field, limit = 10) {
    const counts = {};
    
    logs.forEach(log => {
      const value = typeof field === 'function' ? field(log) : log[field];
      counts[value] = (counts[value] || 0) + 1;
    });
    
    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([item, count]) => ({ item, count }));
  }

  /**
   * Export logs to different formats
   * @param {string} format - Export format (json, csv)
   * @param {Object} options - Filter options
   */
  async exportLogs(format = 'json', options = {}) {
    const { logs } = await this.getAccessLogs(options);
    
    switch (format.toLowerCase()) {
      case 'csv':
        return this.exportToCsv(logs);
      case 'json':
      default:
        return JSON.stringify(logs, null, 2);
    }
  }

  /**
   * Export logs to CSV format
   */
  exportToCsv(logs) {
    const headers = [
      'Timestamp',
      'Username',
      'Action',
      'Resource',
      'Allowed',
      'Reason',
      'IP Address',
      'User Agent',
      'Session ID'
    ];
    
    const csvRows = [headers.join(',')];
    
    logs.forEach(log => {
      const row = [
        log.timestamp,
        log.user.username,
        log.action,
        log.resource,
        log.decision.allowed ? 'Yes' : 'No',
        `"${log.decision.reason}"`,
        log.request.ip,
        `"${log.request.userAgent || ''}"`,
        log.session.sessionId || ''
      ];
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  }

  /**
   * Clear all logs (admin only)
   */
  async clearLogs() {
    this.logs = [];
    await this.saveLogs();
    console.log('🗑️  All access logs cleared');
  }

  /**
   * Get log file size and other metrics
   */
  async getLogMetrics() {
    try {
      const stats = await fs.stat(this.logFile);
      return {
        fileSize: stats.size,
        fileSizeFormatted: this.formatBytes(stats.size),
        entryCount: this.logs.length,
        oldestEntry: this.logs.length > 0 ? this.logs[0].timestamp : null,
        newestEntry: this.logs.length > 0 ? this.logs[this.logs.length - 1].timestamp : null,
        maxEntries: this.maxLogEntries,
        retentionDays: this.retentionDays
      };
    } catch (err) {
      return {
        fileSize: 0,
        fileSizeFormatted: '0 bytes',
        entryCount: 0,
        oldestEntry: null,
        newestEntry: null,
        maxEntries: this.maxLogEntries,
        retentionDays: this.retentionDays
      };
    }
  }

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 bytes';
    const k = 1024;
    const sizes = ['bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

module.exports = AccessLogManager;