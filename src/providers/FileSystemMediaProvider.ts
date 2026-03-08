/**
 * FileSystemMediaProvider - Filesystem-based implementation of BaseMediaProvider
 *
 * Scans configured directories for media files, extracts metadata, and
 * maintains a persistent JSON index.
 *
 * STUB: Actual filesystem scanning and EXIF extraction are not yet implemented.
 * The class structure and configuration wiring are in place for Phase 4.
 *
 * Dependencies:
 * - sharp (already installed) — thumbnail generation
 * - TODO: install exiftool-vendored for EXIF/IPTC/XMP metadata extraction
 *   (do NOT install until Phase 4 — the stub compiles without it)
 *
 * @module FileSystemMediaProvider
 */

import logger from '../utils/logger';
import BaseMediaProvider, { MediaItem, ScanResult } from './BaseMediaProvider';

/**
 * Configuration for FileSystemMediaProvider.
 */
export interface FileSystemMediaProviderConfig {
  /** Absolute paths to the root media folders to scan */
  folders: string[];
  /** Directory names to skip during scan (e.g. [".dtrash", ".ts"]) */
  ignoreDirs: string[];
  /** File names that signal their containing directory should be excluded */
  ignoreFiles: string[];
  /** Maximum directory depth to recurse into (0 = unlimited) */
  maxDepth: number;
  /** Absolute path to the media-index.json file */
  indexFile: string;
  /** Absolute path to the thumbnail cache directory */
  thumbnailDir: string;
  /** Comma-separated thumbnail size specs (e.g. "300x300,150x150") */
  thumbnailSizes: string;
  /** Metadata extraction priority order (e.g. ["EXIF", "IPTC", "XMP"]) */
  metadataPriority: string[];
  /** Whether the provider may write to source media folders (always false) */
  readonly: boolean;
}

/**
 * Filesystem-based media provider.
 *
 * All public methods return null/empty results in the stub phase.
 * The real scanning implementation (Phase 4) will use exiftool-vendored
 * to extract EXIF/IPTC/XMP metadata and Sharp for thumbnail generation.
 */
class FileSystemMediaProvider extends BaseMediaProvider {
  private readonly config: FileSystemMediaProviderConfig;

  constructor(config: FileSystemMediaProviderConfig) {
    super();
    this.config = config;
  }

  /**
   * Scan configured media folders and update the index.
   *
   * STUB: Logs that scanning is not yet implemented and returns an empty result.
   * Phase 4 will use exiftool-vendored to read metadata from each file.
   */
  scan(_force?: boolean): Promise<ScanResult> {
    logger.info(
      '[FileSystemMediaProvider] scan() called — filesystem scanning is not yet implemented (stub). ' +
        `Configured folders: [${this.config.folders.join(', ')}]`
    );
    return Promise.resolve({ scanned: 0, added: 0, updated: 0, errors: 0 });
  }

  /**
   * Retrieve a single media item by id.
   * STUB: Always returns null (index is empty at stub stage).
   */
  getItem(_id: string): Promise<MediaItem | null> {
    return Promise.resolve(null);
  }

  /**
   * Retrieve all media items for a given year.
   * STUB: Always returns an empty array.
   */
  getItemsByYear(_year: number): Promise<MediaItem[]> {
    return Promise.resolve([]);
  }

  /**
   * Generate (or retrieve cached) thumbnail data.
   * STUB: Always returns null.
   *
   * Phase 4 will use Sharp (already installed) to generate thumbnails and
   * cache them in config.thumbnailDir.
   */
  getThumbnailBuffer(_id: string, _size: string): Promise<Buffer | null> {
    return Promise.resolve(null);
  }

  /**
   * Search media items by keyword.
   * STUB: Always returns an empty array.
   */
  search(_query: string): Promise<MediaItem[]> {
    return Promise.resolve([]);
  }

  /**
   * Release provider resources.
   * STUB: Nothing to release.
   */
  shutdown(): Promise<void> {
    logger.debug('[FileSystemMediaProvider] shutdown()');
    return Promise.resolve();
  }
}

export default FileSystemMediaProvider;

// CommonJS compatibility
module.exports = FileSystemMediaProvider;
