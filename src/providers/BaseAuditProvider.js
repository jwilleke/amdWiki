/**
 * BaseAuditProvider - Base class for all audit providers
 *
 * Provides the interface that all audit providers must implement.
 * Follows the provider pattern established in CacheManager, AttachmentManager, and PageManager.
 *
 * Audit providers implement different storage backends (file, database, cloud logging)
 */

/**
 * Audit event structure
 * @typedef {Object} AuditEvent
 * @property {string} id - Unique event ID
 * @property {string} timestamp - ISO timestamp
 * @property {string} level - Log level (info, warn, error)
 * @property {string} eventType - Type of event
 * @property {string} user - Username
 * @property {string} userId - User ID
 * @property {string} sessionId - Session ID
 * @property {string} ipAddress - Client IP address
 * @property {string} userAgent - Client user agent
 * @property {string} resource - Resource being accessed
 * @property {string} resourceType - Type of resource
 * @property {string} action - Action being performed
 * @property {string} result - Result (allow, deny, error)
 * @property {string} reason - Reason for result
 * @property {string} policyId - Policy ID that made decision
 * @property {string} policyName - Policy name
 * @property {Object} context - Additional context data
 * @property {Object} metadata - Additional metadata
 * @property {number} duration - Operation duration in ms
 * @property {string} severity - Severity level (low, medium, high, critical)
 */

/**
 * Audit search filters
 * @typedef {Object} AuditFilters
 * @property {string} user - Filter by username
 * @property {string} eventType - Filter by event type
 * @property {string} result - Filter by result
 * @property {string} severity - Filter by severity
 * @property {Date} startDate - Start date filter
 * @property {Date} endDate - End date filter
 * @property {string} resource - Filter by resource
 * @property {string} action - Filter by action
 * @property {number} limit - Maximum results
 * @property {number} offset - Results offset
 * @property {string} sortBy - Sort field
 * @property {string} sortOrder - Sort order (asc/desc)
 */

/**
 * Audit search results
 * @typedef {Object} AuditSearchResults
 * @property {AuditEvent[]} results - Array of audit events
 * @property {number} total - Total matching events
 * @property {number} limit - Result limit
 * @property {number} offset - Result offset
 * @property {boolean} hasMore - Whether more results available
 */

class BaseAuditProvider {
  constructor(engine) {
    this.engine = engine;
    this.initialized = false;
  }

  /**
   * Initialize the audit provider
   * Implementations should load configuration from ConfigurationManager
   * @returns {Promise<void>}
   */
  async initialize() {
    throw new Error('BaseAuditProvider.initialize() must be implemented by subclass');
  }

  /**
   * Get provider information
   * @returns {Object} Provider metadata
   */
  getProviderInfo() {
    return {
      name: 'BaseAuditProvider',
      version: '1.0.0',
      description: 'Base audit provider interface',
      features: []
    };
  }

  /**
   * Log an audit event
   * @param {AuditEvent} auditEvent - Audit event data
   * @returns {Promise<string>} Event ID
   */
  async logAuditEvent(auditEvent) {
    throw new Error('BaseAuditProvider.logAuditEvent() must be implemented by subclass');
  }

  /**
   * Search audit logs
   * @param {AuditFilters} filters - Search filters
   * @param {Object} options - Search options
   * @returns {Promise<AuditSearchResults>} Search results
   */
  async searchAuditLogs(filters = {}, options = {}) {
    throw new Error('BaseAuditProvider.searchAuditLogs() must be implemented by subclass');
  }

  /**
   * Get audit statistics
   * @param {AuditFilters} filters - Optional filters
   * @returns {Promise<Object>} Audit statistics
   */
  async getAuditStats(filters = {}) {
    throw new Error('BaseAuditProvider.getAuditStats() must be implemented by subclass');
  }

  /**
   * Export audit logs
   * @param {AuditFilters} filters - Export filters
   * @param {string} format - Export format ('json', 'csv')
   * @returns {Promise<string>} Exported data
   */
  async exportAuditLogs(filters = {}, format = 'json') {
    throw new Error('BaseAuditProvider.exportAuditLogs() must be implemented by subclass');
  }

  /**
   * Flush pending audit events to storage
   * @returns {Promise<void>}
   */
  async flush() {
    throw new Error('BaseAuditProvider.flush() must be implemented by subclass');
  }

  /**
   * Clean up old audit logs based on retention policy
   * @returns {Promise<void>}
   */
  async cleanup() {
    throw new Error('BaseAuditProvider.cleanup() must be implemented by subclass');
  }

  /**
   * Check if the audit provider is healthy
   * @returns {Promise<boolean>} True if healthy
   */
  async isHealthy() {
    throw new Error('BaseAuditProvider.isHealthy() must be implemented by subclass');
  }

  /**
   * Close/cleanup the audit provider
   * @returns {Promise<void>}
   */
  async close() {
    throw new Error('BaseAuditProvider.close() must be implemented by subclass');
  }

  /**
   * Backup audit configuration and state (optional)
   * @returns {Promise<Object>} Backup data
   */
  async backup() {
    return {
      provider: this.constructor.name,
      initialized: this.initialized,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Restore audit from backup (optional)
   * @param {Object} backupData - Backup data
   * @returns {Promise<void>}
   */
  async restore(backupData) {
    // Default implementation does nothing
    // Subclasses can override if they support restore
  }
}

module.exports = BaseAuditProvider;
