const BaseAuditProvider = require('./BaseAuditProvider');

/**
 * NullAuditProvider - No-op audit provider
 *
 * Used when auditing is disabled or for testing.
 * All audit operations are no-ops that return immediately.
 */
class NullAuditProvider extends BaseAuditProvider {
  constructor(engine) {
    super(engine);
  }

  /**
   * Initialize the null audit provider (no-op)
   * @returns {Promise<void>}
   */
  async initialize() {
    this.initialized = true;
  }

  /**
   * Get provider information
   * @returns {Object} Provider metadata
   */
  getProviderInfo() {
    return {
      name: 'NullAuditProvider',
      version: '1.0.0',
      description: 'No-op audit provider (auditing disabled)',
      features: []
    };
  }

  /**
   * Log an audit event (no-op)
   * @param {Object} auditEvent - Audit event data
   * @returns {Promise<string>} Dummy event ID
   */
  async logAuditEvent(auditEvent) {
    return 'null-event-id';
  }

  /**
   * Search audit logs (returns empty results)
   * @param {Object} filters - Search filters
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Empty search results
   */
  async searchAuditLogs(filters = {}, options = {}) {
    return {
      results: [],
      total: 0,
      limit: options.limit || 100,
      offset: options.offset || 0,
      hasMore: false
    };
  }

  /**
   * Get audit statistics (returns zeros)
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} Empty statistics
   */
  async getAuditStats(filters = {}) {
    return {
      totalEvents: 0,
      eventsByType: {},
      eventsByResult: {},
      eventsBySeverity: {},
      eventsByUser: {},
      recentActivity: [],
      securityIncidents: 0
    };
  }

  /**
   * Export audit logs (returns empty data)
   * @param {Object} filters - Export filters
   * @param {string} format - Export format ('json', 'csv')
   * @returns {Promise<string>} Empty export data
   */
  async exportAuditLogs(filters = {}, format = 'json') {
    if (format === 'csv') {
      return 'timestamp,eventType,user,resource,action,result,severity,reason\n';
    }
    return '[]';
  }

  /**
   * Flush pending audit events (no-op)
   * @returns {Promise<void>}
   */
  async flush() {
    // No-op
  }

  /**
   * Clean up old audit logs (no-op)
   * @returns {Promise<void>}
   */
  async cleanup() {
    // No-op
  }

  /**
   * Check if the audit provider is healthy (always true)
   * @returns {Promise<boolean>} Always true
   */
  async isHealthy() {
    return true;
  }

  /**
   * Close/cleanup the audit provider (no-op)
   * @returns {Promise<void>}
   */
  async close() {
    this.initialized = false;
  }
}

module.exports = NullAuditProvider;
