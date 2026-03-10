/**
 * FileSystemMediaProvider - Filesystem-based implementation of BaseMediaProvider
 *
 * Scans configured directories for media files, extracts EXIF/IPTC/XMP metadata
 * via exiftool-vendored, generates thumbnails via Sharp, and maintains a
 * persistent JSON index.
 *
 * Dependencies:
 * - exiftool-vendored — EXIF/IPTC/XMP metadata extraction
 * - sharp — thumbnail generation (already installed)
 * - fs-extra — filesystem helpers
 *
 * @module FileSystemMediaProvider
 */

import crypto from 'crypto';
import path from 'path';
import fs from 'fs-extra';
import sharp from 'sharp';
import { ExifTool, ExifDateTime } from 'exiftool-vendored';
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

/** Supported media file extensions */
const MEDIA_EXTENSIONS = new Set([
  // Images
  'jpg', 'jpeg', 'png', 'gif', 'heic', 'heif', 'tiff', 'tif',
  'webp', 'raw', 'orf', 'cr2', 'nef', 'arw', 'dng', 'bmp',
  // Videos
  'mp4', 'mov', 'avi', 'mkv', 'm4v', 'wmv', '3gp'
]);

/** MIME type lookup by extension */
const MIME_MAP: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  heic: 'image/heic',
  heif: 'image/heif',
  tiff: 'image/tiff',
  tif: 'image/tiff',
  webp: 'image/webp',
  raw: 'image/x-raw',
  orf: 'image/x-olympus-orf',
  cr2: 'image/x-canon-cr2',
  nef: 'image/x-nikon-nef',
  arw: 'image/x-sony-arw',
  dng: 'image/dng',
  bmp: 'image/bmp',
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  avi: 'video/x-msvideo',
  mkv: 'video/x-matroska',
  m4v: 'video/x-m4v',
  wmv: 'video/x-ms-wmv',
  '3gp': 'video/3gpp'
};

/**
 * Internal index entry — extends MediaItem with the mtime used for
 * change detection during incremental scans.
 */
interface MediaIndexEntry extends MediaItem {
  /** File mtime in milliseconds (from stat.mtimeMs) */
  mtime: number;
}

/** Shape of the persisted media-index.json file */
interface MediaIndexFile {
  version: number;
  updatedAt: string;
  items: Record<string, MediaIndexEntry>;
}

/** Accumulated scan counters threaded through recursive walk */
interface ScanCounters {
  scanned: number;
  added: number;
  updated: number;
  errors: number;
}

/**
 * Filesystem-based media provider.
 *
 * Scans configured folders, extracts metadata with ExifTool, and maintains a
 * persistent JSON index. Thumbnails are generated on demand via Sharp and cached
 * to thumbnailDir.
 */
class FileSystemMediaProvider extends BaseMediaProvider {
  private readonly config: FileSystemMediaProviderConfig;
  /** In-memory index: id → MediaIndexEntry */
  private index: Record<string, MediaIndexEntry> = {};
  /** Single ExifTool worker process reused across all reads */
  private readonly exiftoolInstance: ExifTool;

  constructor(config: FileSystemMediaProviderConfig) {
    super();
    this.config = config;
    this.exiftoolInstance = new ExifTool({ taskTimeoutMillis: 15000 });
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  /**
   * Load the persisted index from disk so queries work immediately
   * (before the first background scan).
   */
  override async initialize(): Promise<void> {
    await this.loadIndex();
    logger.info(
      `[FileSystemMediaProvider] Initialized — ${Object.keys(this.index).length} items loaded from index`
    );
  }

  /**
   * Release the ExifTool worker process.
   */
  shutdown(): Promise<void> {
    logger.debug('[FileSystemMediaProvider] shutdown() — ending ExifTool worker');
    return this.exiftoolInstance.end();
  }

  // ---------------------------------------------------------------------------
  // Scanning
  // ---------------------------------------------------------------------------

  /**
   * Scan all configured folders, extract metadata for new/changed files,
   * save the updated index, and return a summary.
   *
   * @param force - Re-process every file even if mtime is unchanged.
   */
  async scan(force = false): Promise<ScanResult> {
    if (this.config.folders.length === 0) {
      logger.warn('[FileSystemMediaProvider] scan() called but no folders configured');
      return { scanned: 0, added: 0, updated: 0, errors: 0 };
    }

    const counters: ScanCounters = { scanned: 0, added: 0, updated: 0, errors: 0 };
    const startMs = Date.now();
    logger.info(
      `[FileSystemMediaProvider] Starting scan (force=${force}) — folders: [${this.config.folders.join(', ')}]`
    );

    for (const folder of this.config.folders) {
      if (!(await fs.pathExists(folder))) {
        logger.warn(`[FileSystemMediaProvider] Folder not found, skipping: ${folder}`);
        continue;
      }
      await this.walkDirectory(folder, 0, counters, force, true);
    }

    await this.saveIndex();
    const elapsedMs = Date.now() - startMs;
    const msPerFile = counters.scanned > 0 ? (elapsedMs / counters.scanned).toFixed(0) : 'n/a';
    logger.info(
      `[FileSystemMediaProvider] Scan complete in ${elapsedMs}ms — ` +
        `scanned=${counters.scanned} added=${counters.added} updated=${counters.updated} errors=${counters.errors} ` +
        `(~${msPerFile}ms/file)`
    );
    return { ...counters, elapsedMs };
  }

  // ---------------------------------------------------------------------------
  // Query methods
  // ---------------------------------------------------------------------------

  /**
   * Return the list of years that have at least one item, sorted descending.
   */
  getYears(): Promise<number[]> {
    const years = new Set<number>();
    for (const item of Object.values(this.index)) {
      if (item.year !== undefined && item.year !== null) {
        years.add(item.year);
      }
    }
    const sorted = Array.from(years).sort((a, b) => b - a);
    return Promise.resolve(sorted);
  }

  /**
   * Retrieve a single item by id.
   */
  getItem(id: string): Promise<MediaItem | null> {
    return Promise.resolve(this.index[id] ?? null);
  }

  /**
   * Return all items for a given year, sorted by filename.
   */
  getItemsByYear(year: number): Promise<MediaItem[]> {
    const items = Object.values(this.index)
      .filter(item => item.year === year)
      .sort((a, b) => a.filename.localeCompare(b.filename));
    return Promise.resolve(items);
  }

  /**
   * Retrieve all items linked to a specific wiki page.
   */
  getItemsByPage(pageName: string): Promise<MediaItem[]> {
    const items = Object.values(this.index)
      .filter(item => item.linkedPageName === pageName)
      .sort((a, b) => a.filename.localeCompare(b.filename));
    return Promise.resolve(items);
  }

  /**
   * Full-text keyword search across filename, eventName, year, title,
   * description, and keywords fields.
   *
   * All query tokens must match (AND semantics).
   */
  search(query: string): Promise<MediaItem[]> {
    const lower = query.toLowerCase().trim();
    if (!lower) return Promise.resolve([]);
    const tokens = lower.split(/\s+/).filter(Boolean);

    const toStr = (v: unknown): string => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '');

    const results = Object.values(this.index).filter(item => {
      const keywords = item.metadata?.keywords;
      const keywordStr = Array.isArray(keywords)
        ? (keywords as string[]).join(' ')
        : toStr(keywords);
      const haystack = [
        item.filename,
        item.eventName ?? '',
        item.year !== undefined ? String(item.year) : '',
        toStr(item.metadata?.title),
        toStr(item.metadata?.description),
        keywordStr
      ]
        .join(' ')
        .toLowerCase();
      return tokens.every(token => haystack.includes(token));
    });

    return Promise.resolve(results as MediaItem[]);
  }

  /**
   * Return a JPEG thumbnail buffer for the given item and size.
   *
   * Thumbnails are cached on disk in config.thumbnailDir. Video items
   * return null (thumbnail generation requires ffmpeg, not yet implemented).
   *
   * @param id   - Item identifier.
   * @param size - Size string in the form "WxH" (e.g. "300x300").
   */
  async getThumbnailBuffer(id: string, size: string): Promise<Buffer | null> {
    const item = this.index[id];
    if (!item) return null;

    // Video thumbnails not supported yet
    if (!item.mimeType.startsWith('image/')) return null;

    // Include orientation in cache key so that if a file is rescanned with a
    // different orientation the old thumbnail is automatically bypassed.
    const orientation = typeof item.metadata?.orientation === 'number' ? item.metadata.orientation : 1;
    const thumbPath = path.join(this.config.thumbnailDir, `${id}-${size}-o${orientation}.jpg`);

    // Return cached thumbnail if it exists
    if (await fs.pathExists(thumbPath)) {
      return fs.readFile(thumbPath);
    }

    const parts = size.split('x');
    const w = parseInt(parts[0] ?? '300', 10);
    const h = parseInt(parts[1] ?? '300', 10);
    if (!w || !h) return null;

    try {
      const buffer = await sharp(item.filePath)
        .rotate()                          // auto-rotate using EXIF Orientation (handles mirroring too)
        .resize(w, h, { fit: 'cover' })
        .jpeg({ quality: 85 })
        .toBuffer();
      await fs.ensureDir(this.config.thumbnailDir);
      await fs.writeFile(thumbPath, buffer);
      return buffer;
    } catch (err) {
      logger.warn(
        `[FileSystemMediaProvider] Thumbnail generation failed for ${item.filePath}: ${String(err)}`
      );
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // Private helpers — directory walk
  // ---------------------------------------------------------------------------

  /**
   * Recursively walk a directory, processing media files.
   *
   * @param isConfiguredRoot - true when dirPath is one of the explicitly
   *   configured root folders; sentinel-file exclusion is skipped for roots
   *   so that a .plexignore / .photoviewignore at the top level does not
   *   accidentally block an entire configured folder.
   */
  private async walkDirectory(
    dirPath: string,
    depth: number,
    counters: ScanCounters,
    force: boolean,
    isConfiguredRoot = false
  ): Promise<void> {
    // Enforce maxDepth (0 = unlimited)
    if (this.config.maxDepth > 0 && depth > this.config.maxDepth) return;

    let entries: fs.Dirent[];
    try {
      entries = await fs.readdir(dirPath, { withFileTypes: true });
    } catch (err) {
      logger.warn(`[FileSystemMediaProvider] Cannot read dir ${dirPath}: ${String(err)}`);
      counters.errors++;
      return;
    }

    // Check for sentinel files that exclude the entire directory.
    // Skipped for explicitly-configured root folders so that a top-level
    // .plexignore/.photoviewignore does not silently block everything.
    if (!isConfiguredRoot) {
      const fileNames = new Set(entries.filter(e => e.isFile()).map(e => e.name));
      for (const sentinel of this.config.ignoreFiles) {
        if (fileNames.has(sentinel)) {
          logger.debug(`[FileSystemMediaProvider] Skipping dir ${dirPath} — found ${sentinel}`);
          return;
        }
      }
    }

    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (this.config.ignoreDirs.includes(entry.name)) continue;
        await this.walkDirectory(path.join(dirPath, entry.name), depth + 1, counters, force);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).slice(1).toLowerCase();
        if (!MEDIA_EXTENSIONS.has(ext)) continue;
        counters.scanned++;
        await this.processFile(path.join(dirPath, entry.name), counters, force);
      }
    }
  }

  /**
   * Process a single media file: stat, EXIF read, index update.
   */
  private async processFile(
    filePath: string,
    counters: ScanCounters,
    force: boolean
  ): Promise<void> {
    try {
      const stat = await fs.stat(filePath);
      const id = this.generateId(filePath);
      const existing = this.index[id];

      // Skip unchanged files unless forced
      if (!force && existing && existing.mtime === stat.mtimeMs) return;

      const tags = await this.exiftoolInstance.read(filePath);
      const year = this.extractYear(tags as Record<string, unknown>, filePath, stat.mtime);
      const eventName = this.parseEventName(filePath);
      const ext = path.extname(filePath).slice(1).toLowerCase();
      const mimeType = MIME_MAP[ext] ?? 'application/octet-stream';

      const rawTags = tags as Record<string, unknown>;
      const orientation = typeof rawTags.Orientation === 'number' ? rawTags.Orientation : 1;

      const entry: MediaIndexEntry = {
        id,
        filePath,
        filename: path.basename(filePath),
        mimeType,
        year,
        dirPath: path.dirname(filePath),
        eventName,
        mtime: stat.mtimeMs,
        metadata: {
          title: rawTags.Title ?? null,
          description: rawTags.Description ?? rawTags.ImageDescription ?? null,
          keywords: rawTags.Keywords ?? null,
          make: rawTags.Make ?? null,
          model: rawTags.Model ?? null,
          gpsLatitude: rawTags.GPSLatitude ?? null,
          gpsLongitude: rawTags.GPSLongitude ?? null,
          orientation
        }
      };

      if (existing) {
        counters.updated++;
      } else {
        counters.added++;
      }
      this.index[id] = entry;
    } catch (err) {
      logger.warn(`[FileSystemMediaProvider] Error processing ${filePath}: ${String(err)}`);
      counters.errors++;
    }
  }

  // ---------------------------------------------------------------------------
  // Private helpers — metadata / id
  // ---------------------------------------------------------------------------

  /**
   * Generate a stable 32-character hex ID from the file path.
   */
  private generateId(filePath: string): string {
    return crypto.createHash('sha256').update(filePath).digest('hex').slice(0, 32);
  }

  /**
   * Extract the four-digit year from tags, filename, path, or mtime.
   *
   * Priority:
   * 1. EXIF DateTimeOriginal / CreateDate / MediaCreateDate
   * 2. Filename prefix YYYY- or YYYY_
   * 3. Directory path component matching /^\d{4}$/
   * 4. File mtime year
   */
  private extractYear(
    tags: Record<string, unknown>,
    filePath: string,
    mtime: Date
  ): number {
    // 1. EXIF date fields
    for (const field of ['DateTimeOriginal', 'CreateDate', 'MediaCreateDate']) {
      const dt = tags[field];
      if (dt instanceof ExifDateTime && dt.year && dt.year > 1900 && dt.year < 2100) {
        return dt.year;
      }
    }

    const basename = path.basename(filePath, path.extname(filePath));

    // 2. Filename prefix YYYY-... or YYYY_...
    const fnMatch = basename.match(/^(\d{4})[-_]/);
    if (fnMatch) {
      const y = parseInt(fnMatch[1], 10);
      if (y > 1900 && y < 2100) return y;
    }

    // 3. Path components
    const parts = filePath.split(path.sep);
    for (let i = parts.length - 2; i >= 0; i--) {
      const m = parts[i]?.match(/^(\d{4})$/);
      if (m) {
        const y = parseInt(m[1], 10);
        if (y > 1900 && y < 2100) return y;
      }
    }

    // 4. File mtime
    return mtime.getFullYear();
  }

  /**
   * Parse an event name from a filename following the convention:
   *   YYYY-MM-DD-EventName[-NNN].ext
   *
   * Returns the EventName part, or null if the filename doesn't match.
   */
  private parseEventName(filePath: string): string | null {
    const basename = path.basename(filePath, path.extname(filePath));
    const m = basename.match(/^\d{4}-\d{2}-\d{2}-(.+?)(?:-\d+)?$/);
    return m ? (m[1] ?? null) : null;
  }

  // ---------------------------------------------------------------------------
  // Private helpers — index persistence
  // ---------------------------------------------------------------------------

  /**
   * Load the persisted index from disk into memory.
   */
  private async loadIndex(): Promise<void> {
    if (!this.config.indexFile) return;
    try {
      if (await fs.pathExists(this.config.indexFile)) {
        const raw = (await fs.readJson(this.config.indexFile)) as MediaIndexFile;
        if (raw.version === 1 && raw.items) {
          this.index = raw.items;
          logger.info(
            `[FileSystemMediaProvider] Loaded ${Object.keys(this.index).length} items from ${this.config.indexFile}`
          );
        }
      }
    } catch (err) {
      logger.warn(
        `[FileSystemMediaProvider] Could not load index from ${this.config.indexFile}: ${String(err)}`
      );
    }
  }

  /**
   * Save the in-memory index to disk.
   */
  private async saveIndex(): Promise<void> {
    if (!this.config.indexFile) return;
    try {
      const indexFile: MediaIndexFile = {
        version: 1,
        updatedAt: new Date().toISOString(),
        items: this.index
      };
      await fs.ensureDir(path.dirname(this.config.indexFile));
      await fs.writeJson(this.config.indexFile, indexFile, { spaces: 2 });
      logger.info(
        `[FileSystemMediaProvider] Index saved — ${Object.keys(this.index).length} items → ${this.config.indexFile}`
      );
    } catch (err) {
      logger.warn(
        `[FileSystemMediaProvider] Could not save index to ${this.config.indexFile}: ${String(err)}`
      );
    }
  }
}

export default FileSystemMediaProvider;

// CommonJS compatibility
module.exports = FileSystemMediaProvider;
