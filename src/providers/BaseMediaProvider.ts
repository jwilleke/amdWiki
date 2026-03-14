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
  /** Total elapsed time in milliseconds */
  elapsedMs?: number;
  /** Folder paths that were configured but not found on disk */
  missingFolders?: string[];
}

/**
 * Abstract base class for media providers.
 *
 * Implement this class to add support for a new media storage backend
 * (filesystem, S3, etc.). MediaManager always interacts through this interface.
 */
abstract class BaseMediaProvider {
  /**
   * Lifecycle method called once after construction to load persisted state.
   * Default implementation is a no-op; override to load an index from disk.
   */
  initialize(): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Scan configured media folders and update the in-memory/persisted index.
   *
   * @param force - When true, re-scan all files even if mtime is unchanged.
   * @returns Summary of what was scanned/added/updated/errored.
   */
  abstract scan(force?: boolean): Promise<ScanResult>;

  /**
   * Return the list of years that have at least one media item, sorted
   * descending (most recent first).
   *
   * @returns Array of four-digit years.
   */
  abstract getYears(): Promise<number[]>;

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
   * Retrieve all media items linked to a specific wiki page.
   *
   * @param pageName - The wiki page name to match against `linkedPageName`.
   * @returns Array of matching MediaItem objects (may be empty).
   */
  getItemsByPage(_pageName: string): Promise<MediaItem[]> {
    return Promise.resolve([]);
  }

  /**
   * Retrieve all media items whose EXIF/XMP keyword list contains the given keyword.
   *
   * Performs an exact, case-sensitive match against each entry in
   * `metadata.keywords` (string or string[]). Items with no keywords are excluded.
   *
   * @param keyword - The keyword to match (e.g. "Molly's Cooking").
   * @returns Array of matching MediaItem objects (may be empty).
   */
  getItemsByKeyword(_keyword: string): Promise<MediaItem[]> {
    return Promise.resolve([]);
  }

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
