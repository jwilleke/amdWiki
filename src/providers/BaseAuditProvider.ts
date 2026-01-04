import { AuditEvent } from '../types';
import type { WikiEngine } from '../types/WikiEngine';

/**
 * Provider information
 */
interface ProviderInfo {
  name: string;
  version: string;
  description: string;
  features: string[];
}

/**
 * Audit search filters
 */
export interface AuditFilters {
  /** Filter by username */
  user?: string;

  /** Filter by event type */
  eventType?: string;

  /** Filter by result (allow, deny, error) */
  result?: string;

  /** Filter by severity level */
  severity?: string;

  /** Start date filter */
  startDate?: Date;

  /** End date filter */
  endDate?: Date;

  /** Filter by resource */
  resource?: string;

  /** Filter by action */
  action?: string;

  /** Maximum results to return */
  limit?: number;

  /** Results offset for pagination */
  offset?: number;

  /** Sort field */
  sortBy?: string;

  /** Sort order (asc/desc) */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Audit search results
 */
export interface AuditSearchResults {
  /** Array of audit events */
  results: AuditEvent[];

  /** Total matching events */
  total: number;

  /** Result limit */
  limit: number;

  /** Result offset */
  offset: number;

  /** Whether more results are available */
  hasMore: boolean;
}

/**
 * Audit statistics
 */
export interface AuditStats {
  /** Total number of events */
  totalEvents: number;

  /** Events by type */
  eventsByType?: Record<string, number>;

  /** Events by result */
  eventsByResult?: Record<string, number>;

  /** Events by severity */
  eventsBySeverity?: Record<string, number>;

  /** Events by user */
  eventsByUser?: Record<string, number>;

  /** Recent activity entries */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recentActivity?: any[];

  /** Number of security incidents (high/critical severity) */
  securityIncidents?: number;

  /** Additional statistics */
  [key: string]: unknown;
}

/**
 * Audit backup data
 */
export interface AuditBackupData {
  /** Provider name */
  provider: string;

  /** Initialization state */
  initialized: boolean;

  /** Backup timestamp */
  timestamp: string;

  /** Additional backup data */
  [key: string]: unknown;
}

/**
 * BaseAuditProvider - Abstract base class for audit providers
 *
 * Provides the interface that all audit providers must implement.
 * Follows the provider pattern established in CacheManager, AttachmentManager, and PageManager.
 *
 * Audit providers implement different storage backends (file, database, cloud logging)
 *
 * @class BaseAuditProvider
 * @abstract
 *
 * @property {WikiEngine} engine - Reference to the wiki engine
 * @property {boolean} initialized - Whether provider has been initialized
 *
 * @see {@link FileAuditProvider} for file-based implementation
 * @see {@link DatabaseAuditProvider} for database implementation
 * @see {@link AuditManager} for usage
 *
 * @example
 * class MyAuditProvider extends BaseAuditProvider {
 *   async initialize(): Promise<void> {
 *     const config = this.engine.getManager('ConfigurationManager');
 *     this.auditPath = config.getProperty('audit.path');
 *     this.initialized = true;
 *   }
 *
 *   async logAuditEvent(event: AuditEvent): Promise<string> {
 *     // Implementation
 *     return event.id;
 *   }
 * }
 */
abstract class BaseAuditProvider {
  /** Reference to the wiki engine */
  protected engine: WikiEngine;

  /** Whether provider has been initialized */
  public initialized: boolean;

  /**
   * Create a new audit provider
   *
   * @constructor
   * @param {WikiEngine} engine - The WikiEngine instance
   * @throws {Error} If engine is not provided
   */
  constructor(engine: WikiEngine) {
    if (!engine) {
      throw new Error('BaseAuditProvider requires an engine instance');
    }
    this.engine = engine;
    this.initialized = false;
  }

  /**
   * Initialize the audit provider
   *
   * Implementations should load configuration from ConfigurationManager:
   *   const configManager = this.engine.getManager('ConfigurationManager');
   *   const value = configManager.getProperty('key', 'default');
   *
   * Do NOT read configuration files directly.
   *
   * @async
   * @abstract
   * @returns {Promise<void>}
   * @throws {Error} Always throws - must be implemented by subclass
   */
  abstract initialize(): Promise<void>;

  /**
   * Get provider information
   *
   * @returns {ProviderInfo} Provider metadata
   */
  getProviderInfo(): ProviderInfo {
    return {
      name: 'BaseAuditProvider',
      version: '1.0.0',
      description: 'Base audit provider interface',
      features: []
    };
  }

  /**
   * Log an audit event
   *
   * @async
   * @abstract
   * @param {AuditEvent} auditEvent - Audit event data
   * @returns {Promise<string>} Event ID
   * @throws {Error} Always throws - must be implemented by subclass
   */
  abstract logAuditEvent(auditEvent: AuditEvent): Promise<string>;

  /**
   * Search audit logs
   *
   * @async
   * @abstract
   * @param {AuditFilters} filters - Search filters
   * @param {Record<string, any>} options - Search options
   * @returns {Promise<AuditSearchResults>} Search results
   * @throws {Error} Always throws - must be implemented by subclass
   */
  abstract searchAuditLogs(
    filters?: AuditFilters,
    options?: Record<string, unknown>
  ): Promise<AuditSearchResults>;

  /**
   * Get audit statistics
   *
   * @async
   * @abstract
   * @param {AuditFilters} filters - Optional filters
   * @returns {Promise<AuditStats>} Audit statistics
   * @throws {Error} Always throws - must be implemented by subclass
   */
  abstract getAuditStats(filters?: AuditFilters): Promise<AuditStats>;

  /**
   * Export audit logs
   *
   * @async
   * @abstract
   * @param {AuditFilters} filters - Export filters
   * @param {string} format - Export format ('json', 'csv')
   * @returns {Promise<string>} Exported data
   * @throws {Error} Always throws - must be implemented by subclass
   */
  abstract exportAuditLogs(
    filters?: AuditFilters,
    format?: 'json' | 'csv'
  ): Promise<string>;

  /**
   * Flush pending audit events to storage
   *
   * @async
   * @abstract
   * @returns {Promise<void>}
   * @throws {Error} Always throws - must be implemented by subclass
   */
  abstract flush(): Promise<void>;

  /**
   * Clean up old audit logs based on retention policy
   *
   * @async
   * @abstract
   * @returns {Promise<void>}
   * @throws {Error} Always throws - must be implemented by subclass
   */
  abstract cleanup(): Promise<void>;

  /**
   * Check if the audit provider is healthy
   *
   * @async
   * @abstract
   * @returns {Promise<boolean>} True if healthy
   * @throws {Error} Always throws - must be implemented by subclass
   */
  abstract isHealthy(): Promise<boolean>;

  /**
   * Close/cleanup the audit provider
   *
   * @async
   * @abstract
   * @returns {Promise<void>}
   * @throws {Error} Always throws - must be implemented by subclass
   */
  abstract close(): Promise<void>;

  /**
   * Backup audit configuration and state (optional)
   *
   * Default implementation provides basic backup data.
   * Subclasses can override to include provider-specific data.
   *
   * @async
   * @returns {Promise<AuditBackupData>} Backup data
   */
  backup(): Promise<AuditBackupData> {
    return Promise.resolve({
      provider: this.constructor.name,
      initialized: this.initialized,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Restore audit from backup (optional)
   *
   * Default implementation does nothing.
   * Subclasses can override if they support restore functionality.
   *
   * @async
   * @param {AuditBackupData} _backupData - Backup data
   * @returns {Promise<void>}
   */
  async restore(_backupData: AuditBackupData): Promise<void> {
    // Default implementation does nothing
    // Subclasses can override if they support restore
  }
}

export default BaseAuditProvider;
export { WikiEngine, ProviderInfo };

// CommonJS compatibility
module.exports = BaseAuditProvider;
