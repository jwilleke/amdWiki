/**
 * Provider type definitions for amdWiki
 *
 * This module defines interfaces for all provider types (page, user, attachment,
 * search, cache, audit) following JSPWiki's provider pattern for pluggable backends.
 */

import { WikiPage, PageFrontmatter, PageInfo, PageSaveOptions, PageSearchResult, PageListOptions } from './Page';
import { VersionManifest, VersionContent, VersionDiff, VersionHistoryEntry } from './Version';
import { User, UserCreateData, UserUpdateData, UserSession } from './User';
import { WikiEngine } from './WikiEngine';

/**
 * Base provider interface
 *
 * All providers must implement this interface.
 */
export interface BaseProvider {
  /** Reference to WikiEngine */
  engine: WikiEngine;

  /** Whether provider has been initialized */
  initialized: boolean;

  /**
   * Initialize the provider
   * @returns Promise that resolves when initialization is complete
   */
  initialize(): Promise<void>;

  /**
   * Shutdown the provider (optional)
   * @returns Promise that resolves when shutdown is complete
   */
  shutdown?(): Promise<void>;
}

/**
 * Page provider interface
 *
 * Defines the contract for page storage backends (filesystem, database, etc.).
 */
export interface PageProvider extends BaseProvider {
  /**
   * Get complete page with content and metadata
   * @param identifier - Page UUID, title, or slug
   * @returns Page object or null if not found
   */
  getPage(identifier: string): Promise<WikiPage | null>;

  /**
   * Get only page content (without metadata)
   * @param identifier - Page UUID, title, or slug
   * @returns Markdown content
   */
  getPageContent(identifier: string): Promise<string>;

  /**
   * Get only page metadata (without content)
   * @param identifier - Page UUID, title, or slug
   * @returns Metadata object or null if not found
   */
  getPageMetadata(identifier: string): Promise<PageFrontmatter | null>;

  /**
   * Save page content and metadata
   * @param pageName - Page title
   * @param content - Markdown content
   * @param metadata - Frontmatter metadata
   * @param options - Save options
   * @returns Promise that resolves when save is complete
   */
  savePage(pageName: string, content: string, metadata?: Partial<PageFrontmatter>, options?: PageSaveOptions): Promise<void>;

  /**
   * Delete a page
   * @param identifier - Page UUID or title
   * @returns True if deleted, false if not found
   */
  deletePage(identifier: string): Promise<boolean>;

  /**
   * Check if page exists
   * @param identifier - Page UUID or title
   * @returns True if page exists
   */
  pageExists(identifier: string): boolean;

  /**
   * Get all page titles
   * @returns Sorted array of page titles
   */
  getAllPages(): Promise<string[]>;

  /**
   * Get all page info objects
   * @param options - List options
   * @returns Array of page info objects
   */
  getAllPageInfo(options?: PageListOptions): Promise<PageInfo[]>;

  /**
   * Find page by various identifiers
   * @param identifier - UUID, title, or slug
   * @returns Canonical page title or null
   */
  findPage(identifier: string): string | null;

  /**
   * Refresh page cache
   * @returns Promise that resolves when refresh is complete
   */
  refreshPageList(): Promise<void>;
}

/**
 * Versioning page provider interface
 *
 * Extended page provider with version history capabilities.
 */
export interface VersioningPageProvider extends PageProvider {
  /**
   * Get version history for a page
   * @param identifier - Page UUID or title
   * @param limit - Maximum number of versions to return
   * @returns Array of version history entries
   */
  getVersionHistory(identifier: string, limit?: number): Promise<VersionHistoryEntry[]>;

  /**
   * Get specific version content
   * @param identifier - Page UUID or title
   * @param version - Version number
   * @returns Version content object
   */
  getVersion(identifier: string, version: number): Promise<VersionContent | null>;

  /**
   * Get version manifest
   * @param identifier - Page UUID or title
   * @returns Version manifest object
   */
  getVersionManifest(identifier: string): Promise<VersionManifest | null>;

  /**
   * Compare two versions
   * @param identifier - Page UUID or title
   * @param fromVersion - Old version number
   * @param toVersion - New version number
   * @returns Version diff object
   */
  compareVersions(identifier: string, fromVersion: number, toVersion: number): Promise<VersionDiff | null>;

  /**
   * Delete old versions based on retention policy
   * @param identifier - Page UUID or title
   * @returns Number of versions deleted
   */
  cleanupVersions(identifier: string): Promise<number>;

  /**
   * Compress old versions
   * @param identifier - Page UUID or title
   * @param olderThanDays - Compress versions older than N days
   * @returns Number of versions compressed
   */
  compressVersions(identifier: string, olderThanDays?: number): Promise<number>;
}

/**
 * User provider interface
 *
 * Defines the contract for user storage backends.
 */
export interface UserProvider extends BaseProvider {
  /**
   * Get user by username
   * @param username - Username
   * @returns User object or null if not found
   */
  getUser(username: string): Promise<User | null>;

  /**
   * Get user by email
   * @param email - Email address
   * @returns User object or null if not found
   */
  getUserByEmail(email: string): Promise<User | null>;

  /**
   * Get all users
   * @returns Map of username to user objects
   */
  getAllUsers(): Promise<Map<string, User>>;

  /**
   * Create new user
   * @param userData - User creation data
   * @returns Created user object
   */
  createUser(userData: UserCreateData): Promise<User>;

  /**
   * Update user
   * @param username - Username
   * @param updates - Partial user data to update
   * @returns Updated user object
   */
  updateUser(username: string, updates: UserUpdateData): Promise<User>;

  /**
   * Delete user
   * @param username - Username
   * @returns True if deleted, false if not found
   */
  deleteUser(username: string): Promise<boolean>;

  /**
   * Validate user credentials
   * @param username - Username
   * @param password - Plain text password
   * @returns User object if valid, null if invalid
   */
  validateCredentials(username: string, password: string): Promise<User | null>;

  /**
   * Create session
   * @param sessionId - Session ID
   * @param sessionData - Session data object
   * @returns Promise that resolves when session is created
   */
  createSession(sessionId: string, sessionData: UserSession): Promise<void>;

  /**
   * Get session
   * @param sessionId - Session ID
   * @returns Session object or null if not found/expired
   */
  getSession(sessionId: string): Promise<UserSession | null>;

  /**
   * Delete session
   * @param sessionId - Session ID
   * @returns True if deleted, false if not found
   */
  deleteSession(sessionId: string): Promise<boolean>;

  /**
   * Clean up expired sessions
   * @returns Number of sessions deleted
   */
  cleanupExpiredSessions(): Promise<number>;

  /**
   * Check if user exists
   * @param username - Username to check
   * @returns True if user exists
   */
  userExists(username: string): Promise<boolean>;

  /**
   * Get all usernames
   * @returns Array of usernames
   */
  getAllUsernames(): Promise<string[]>;

  /**
   * Get all active sessions
   * @returns Map of session ID to session data
   */
  getAllSessions(): Promise<Map<string, UserSession>>;
}

/**
 * Attachment metadata
 */
export interface AttachmentMetadata {
  /** Attachment ID (UUID) */
  id: string;

  /** Filename */
  filename: string;

  /** Page UUID this attachment belongs to */
  pageUuid: string;

  /** MIME type */
  mimeType: string;

  /** File size in bytes */
  size: number;

  /** Upload timestamp (ISO 8601) */
  uploadedAt: string;

  /** Uploader user ID */
  uploadedBy: string;

  /** File path */
  filePath: string;

  /** Description */
  description?: string;

  /** Additional metadata */
  [key: string]: unknown;
}

/**
 * Attachment provider interface
 *
 * Defines the contract for attachment storage backends.
 */
export interface AttachmentProvider extends BaseProvider {
  /**
   * Save attachment
   * @param pageUuid - Page UUID
   * @param filename - Filename
   * @param buffer - File buffer
   * @param metadata - Additional metadata
   * @returns Attachment metadata
   */
  saveAttachment(pageUuid: string, filename: string, buffer: Buffer, metadata?: Record<string, unknown>): Promise<AttachmentMetadata>;

  /**
   * Get attachment
   * @param attachmentId - Attachment ID
   * @returns File buffer and metadata
   */
  getAttachment(attachmentId: string): Promise<{ buffer: Buffer; metadata: AttachmentMetadata } | null>;

  /**
   * Get attachment metadata
   * @param attachmentId - Attachment ID
   * @returns Attachment metadata or null
   */
  getAttachmentMetadata(attachmentId: string): Promise<AttachmentMetadata | null>;

  /**
   * List attachments for a page
   * @param pageUuid - Page UUID
   * @returns Array of attachment metadata
   */
  listAttachments(pageUuid: string): Promise<AttachmentMetadata[]>;

  /**
   * Delete attachment
   * @param attachmentId - Attachment ID
   * @returns True if deleted, false if not found
   */
  deleteAttachment(attachmentId: string): Promise<boolean>;

  /**
   * Delete all attachments for a page
   * @param pageUuid - Page UUID
   * @returns Number of attachments deleted
   */
  deletePageAttachments(pageUuid: string): Promise<number>;
}

/**
 * Search provider interface
 *
 * Defines the contract for search backends (Lunr, Elasticsearch, etc.).
 */
export interface SearchProvider extends BaseProvider {
  /**
   * Index a page
   * @param page - Page to index
   * @returns Promise that resolves when indexing is complete
   */
  indexPage(page: WikiPage): Promise<void>;

  /**
   * Remove page from index
   * @param identifier - Page UUID or title
   * @returns Promise that resolves when removal is complete
   */
  removePage(identifier: string): Promise<void>;

  /**
   * Search pages
   * @param query - Search query
   * @param options - Search options
   * @returns Array of search results
   */
  search(query: string, options?: { limit?: number; offset?: number }): Promise<PageSearchResult[]>;

  /**
   * Get search suggestions
   * @param query - Partial search query
   * @param limit - Maximum suggestions to return
   * @returns Array of suggestions
   */
  getSuggestions(query: string, limit?: number): Promise<string[]>;

  /**
   * Rebuild entire search index
   * @returns Promise that resolves when rebuild is complete
   */
  rebuildIndex(): Promise<void>;
}

/**
 * Cache provider interface
 *
 * Defines the contract for caching backends (in-memory, Redis, etc.).
 */
export interface CacheProvider extends BaseProvider {
  /**
   * Get value from cache
   * @param key - Cache key
   * @returns Cached value or null if not found/expired
   */
  get<T = unknown>(key: string): Promise<T | null>;

  /**
   * Set value in cache
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in seconds (optional)
   * @returns Promise that resolves when value is cached
   */
  set<T = unknown>(key: string, value: T, ttl?: number): Promise<void>;

  /**
   * Delete value from cache
   * @param key - Cache key
   * @returns True if deleted, false if not found
   */
  delete(key: string): Promise<boolean>;

  /**
   * Clear all cached values
   * @returns Promise that resolves when cache is cleared
   */
  clear(): Promise<void>;

  /**
   * Check if key exists in cache
   * @param key - Cache key
   * @returns True if key exists and not expired
   */
  has(key: string): Promise<boolean>;
}

/**
 * Audit event
 */
export interface AuditEvent {
  /** Event ID (UUID) */
  id: string;

  /** Event type */
  type: string;

  /** Actor (user ID or 'system') */
  actor: string;

  /** Target resource */
  target: string;

  /** Action performed */
  action: string;

  /** Event timestamp (ISO 8601) */
  timestamp: string;

  /** IP address */
  ipAddress?: string;

  /** User agent */
  userAgent?: string;

  /** Additional event data */
  data?: Record<string, unknown>;

  /** Event result (success, failure) */
  result: 'success' | 'failure';

  /** Error message if failed */
  error?: string;
}

/**
 * Audit provider interface
 *
 * Defines the contract for audit logging backends.
 */
export interface AuditProvider extends BaseProvider {
  /**
   * Log audit event
   * @param event - Audit event
   * @returns Promise that resolves when event is logged
   */
  logEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void>;

  /**
   * Query audit events
   * @param filters - Filter criteria
   * @returns Array of audit events
   */
  queryEvents(filters: {
    type?: string;
    actor?: string;
    target?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<AuditEvent[]>;

  /**
   * Delete old audit events
   * @param olderThanDays - Delete events older than N days
   * @returns Number of events deleted
   */
  cleanupOldEvents(olderThanDays: number): Promise<number>;
}
