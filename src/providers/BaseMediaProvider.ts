/**
 * BaseMediaProvider - Abstract base class for media providers
 *
 * Defines the interface that all media providers must implement.
 * MediaManager uses this interface to interact with the underlying
 * media storage / scanning implementation.
 *
 * @module BaseMediaProvider
 */

/**
 * Represents a single media item in the index.
 */
export interface MediaItem {
  /** Unique identifier for this item (e.g. SHA-256 of file path) */
  id: string;
  /** Absolute path to the source file on disk */
  filePath: string;
  /** Original filename (basename) */
  filename: string;
  /** MIME type (e.g. "image/jpeg") */
  mimeType: string;
  /** Year extracted from EXIF DateTimeOriginal or path/filename fallback */
  year?: number;
  /** Source directory path (for display purposes) */
  dirPath?: string;
  /** Event name parsed from catalog-export filenames (YYYY-MM-DD-EventName-…); null when absent */
  eventName?: string | null;
  /** Wiki page name this item is linked to (when the item appears in a page context) */
  linkedPageName?: string;
  /** Whether this item is associated with a private wiki page */
  isPrivate?: boolean;
  /** Username of the content creator */
  creator?: string;
  /** Additional provider-specific metadata (EXIF fields, etc.) */
  metadata?: Record<string, unknown>;
}

/**
 * Summary of a scan operation.
 */
export interface ScanResult {
  /** Total number of files examined */
  scanned: number;
  /** Number of new items added to the index */
  added: number;
  /** Number of existing items updated in the index */
  updated: number;
  /** Number of files that could not be processed */
  errors: number;
}

/**
 * Abstract base class for media providers.
 *
 * Implement this class to add support for a new media storage backend
 * (filesystem, S3, etc.). MediaManager always interacts through this interface.
 */
abstract class BaseMediaProvider {
  /**
   * Scan configured media folders and update the in-memory/persisted index.
   *
   * @param force - When true, re-scan all files even if mtime is unchanged.
   * @returns Summary of what was scanned/added/updated/errored.
   */
  abstract scan(force?: boolean): Promise<ScanResult>;

  /**
   * Retrieve a single media item by its unique identifier.
   *
   * @param id - The item identifier.
   * @returns The MediaItem, or null if not found.
   */
  abstract getItem(id: string): Promise<MediaItem | null>;

  /**
   * Retrieve all media items for a given year.
   *
   * @param year - Four-digit year (e.g. 2024).
   * @returns Array of matching MediaItem objects (may be empty).
   */
  abstract getItemsByYear(year: number): Promise<MediaItem[]>;

  /**
   * Generate (or retrieve cached) thumbnail data for an item.
   *
   * @param id   - The item identifier.
   * @param size - Requested size string (e.g. "300x300").
   * @returns JPEG buffer, or null if thumbnail cannot be generated.
   */
  abstract getThumbnailBuffer(id: string, size: string): Promise<Buffer | null>;

  /**
   * Full-text / keyword search across the media index.
   *
   * @param query - Search query string.
   * @returns Array of matching MediaItem objects (may be empty).
   */
  abstract search(query: string): Promise<MediaItem[]>;

  /**
   * Release any resources held by the provider (open file handles, worker
   * processes, etc.).
   */
  abstract shutdown(): Promise<void>;
}

export default BaseMediaProvider;

// CommonJS compatibility
module.exports = BaseMediaProvider;
