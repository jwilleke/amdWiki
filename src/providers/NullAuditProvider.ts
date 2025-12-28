import BaseAuditProvider, { WikiEngine, AuditFilters, AuditSearchResults, AuditStats } from './BaseAuditProvider';
import { AuditEvent } from '../types';

/**
 * NullAuditProvider - No-op audit provider
 *
 * Used when auditing is disabled or for testing.
 * All audit operations are no-ops that return immediately.
 */
class NullAuditProvider extends BaseAuditProvider {
  constructor(engine: WikiEngine) {
    super(engine);
  }

  /**
   * Initialize the null audit provider (no-op)
   * @returns {Promise<void>}
   */
  async initialize(): Promise<void> {
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
   * @param {AuditEvent} _auditEvent - Audit event data
   * @returns {Promise<string>} Dummy event ID
   */
  logAuditEvent(_auditEvent: AuditEvent): Promise<string> {
    return Promise.resolve('null-event-id');
  }

  /**
   * Search audit logs (returns empty results)
   * @param {AuditFilters} _filters - Search filters
   * @param {Record<string, any>} options - Search options
   * @returns {Promise<AuditSearchResults>} Empty search results
   */
  searchAuditLogs(_filters: AuditFilters = {}, options: Record<string, any> = {}): Promise<AuditSearchResults> {
    return Promise.resolve({
      results: [],
      total: 0,
      limit: options.limit || 100,
      offset: options.offset || 0,
      hasMore: false
    });
  }

  /**
   * Get audit statistics (returns zeros)
   * @param {AuditFilters} _filters - Optional filters
   * @returns {Promise<AuditStats>} Empty statistics
   */
  getAuditStats(_filters: AuditFilters = {}): Promise<AuditStats> {
    return Promise.resolve({
      totalEvents: 0,
      eventsByType: {},
      eventsByResult: {},
      eventsBySeverity: {},
      eventsByUser: {},
      recentActivity: [],
      securityIncidents: 0
    });
  }

  /**
   * Export audit logs (returns empty data)
   * @param {AuditFilters} _filters - Export filters
   * @param {string} format - Export format ('json', 'csv')
   * @returns {Promise<string>} Empty export data
   */
  exportAuditLogs(_filters: AuditFilters = {}, format: 'json' | 'csv' = 'json'): Promise<string> {
    if (format === 'csv') {
      return Promise.resolve('timestamp,eventType,user,resource,action,result,severity,reason\n');
    }
    return Promise.resolve('[]');
  }

  /**
   * Flush pending audit events (no-op)
   * @returns {Promise<void>}
   */
  flush(): Promise<void> {
    // No-op
    return Promise.resolve();
  }

  /**
   * Clean up old audit logs (no-op)
   * @returns {Promise<void>}
   */
  cleanup(): Promise<void> {
    // No-op
    return Promise.resolve();
  }

  /**
   * Check if the audit provider is healthy (always true)
   * @returns {Promise<boolean>} Always true
   */
  isHealthy(): Promise<boolean> {
    return Promise.resolve(true);
  }

  /**
   * Close/cleanup the audit provider (no-op)
   * @returns {Promise<void>}
   */
  close(): Promise<void> {
    this.initialized = false;
    return Promise.resolve();
  }
}

export default NullAuditProvider;

// CommonJS compatibility
module.exports = NullAuditProvider;
