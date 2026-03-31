/**
 * Asset type definitions for the unified AssetManager (Epic #405).
 *
 * Phase 1: AssetProvider interface + AssetRecord type.
 * BasicAttachmentProvider and BaseMediaProvider implement AssetProvider
 * while AttachmentManager / MediaManager remain thin wrappers.
 */

/**
 * Capabilities that an AssetProvider may declare.
 * Used to advertise which optional operations the provider supports.
 */
export type ProviderCapability = 'upload' | 'search' | 'thumbnail' | 'stream';

/**
 * Image / video dimensions.
 */
export interface AssetDimensions {
  /** Width in pixels */
  width?: number;
  /** Height in pixels */
  height?: number;
  /** Resolution in dots per inch */
  dpi?: number;
}

/**
 * Licensing and rights information for an asset.
 */
export interface AssetUsageRights {
  /** License name or identifier (e.g. "CC BY 4.0", "All Rights Reserved") */
  license?: string;
  /** Free-text restrictions or attribution requirements */
  restrictions?: string;
  /** ISO 8601 date when the license expires */
  expiresAt?: string;
}

/**
 * Usage statistics for an asset.
 */
export interface AssetUsageStats {
  /** Total number of times the asset has been downloaded or served */
  downloadCount?: number;
  /** ISO 8601 timestamp of the most recent download */
  lastDownloadedAt?: string;
}

/**
 * Unified asset record returned by all AssetProviders.
 *
 * Covers all DAM core attribute categories:
 *   Identification  — id, providerId, filename, title
 *   Descriptive     — description, tags
 *   Technical       — mimeType, size, dimensions, url, thumbUrl
 *   Administrative  — uploadedAt, uploadedBy, updatedAt
 *   Rights & Usage  — usageRights, usageStats
 *   Linkage         — usedOnPages, isPrivate
 *   Open metadata   — metadata (EXIF, IPTC, custom fields)
 *   Editor helper   — insertSnippet
 */
export interface AssetRecord {
  // --- Identification ---
  /** Store-internal unique identifier */
  id: string;
  /** Which provider owns this record (e.g. 'local', 'media-library') */
  providerId: string;
  /** Original filename (basename) */
  filename: string;
  /** Human-readable title; distinct from filename (e.g. from EXIF Title or user input) */
  title?: string;

  // --- Descriptive ---
  /** Detailed description or caption; used for searchability */
  description?: string;
  /** Controlled-vocabulary tags / keywords for categorisation */
  tags: string[];

  // --- Technical ---
  /** MIME type (e.g. "image/jpeg") */
  mimeType: string;
  /** File size in bytes */
  size?: number;
  /** Image or video dimensions */
  dimensions?: AssetDimensions;
  /** Browsable / embeddable URL */
  url: string;
  /** Thumbnail URL (if available) */
  thumbUrl?: string;

  // --- Administrative ---
  /** ISO 8601 timestamp when the asset was first ingested / uploaded */
  uploadedAt?: string;
  /** Username of the uploader or content creator / owner */
  uploadedBy?: string;
  /** ISO 8601 timestamp of the last metadata or file modification */
  updatedAt?: string;

  // --- Rights & Usage ---
  /** Licensing and rights information */
  usageRights?: AssetUsageRights;
  /** Download counts and access statistics */
  usageStats?: AssetUsageStats;

  // --- Linkage ---
  /** Wiki pages this asset appears on */
  usedOnPages: string[];
  /** Whether the asset is gated by a private wiki page */
  isPrivate?: boolean;

  // --- Open metadata ---
  /** Provider-specific metadata (EXIF, IPTC, XMP, custom fields) */
  metadata: Record<string, unknown>;

  // --- Editor helper ---
  /** Wiki markup snippet ready to paste into the editor */
  insertSnippet: string;
}

/**
 * Query parameters for AssetProvider.search().
 */
export interface AssetQuery {
  /** Free-text query — case-insensitive substring / keyword match */
  query?: string;
  /** Filter media results to a specific year */
  year?: number;
  /** Filter results to a MIME category */
  mimeCategory?: 'image' | 'document' | 'other';
  /** Number of results per page (default 48) */
  pageSize?: number;
  /** Zero-based offset into the full result set (default 0) */
  offset?: number;
  /** Sort field */
  sort?: 'date' | 'caption';
  /** Sort direction */
  order?: 'asc' | 'desc';
}

/**
 * Paginated result returned by AssetProvider.search().
 */
export interface AssetPage {
  /** Current page of results */
  results: AssetRecord[];
  /** Total number of matching items */
  total: number;
  /** True when there are more results beyond this page */
  hasMore: boolean;
}

/**
 * Input descriptor for AssetProvider.store().
 */
export interface AssetInput {
  /** Original filename */
  originalName: string;
  /** MIME type */
  mimeType: string;
  /** File size in bytes */
  size: number;
  /** Wiki page to link the asset to (optional) */
  pageName?: string;
  /** Human-readable description */
  description?: string;
  /** Username of uploader */
  uploadedBy?: string;
}

/**
 * AssetProvider — the single interface that all asset backends implement.
 *
 * Required methods: search, getById.
 * Optional (capability-gated) methods: store, delete, getThumbnail, stream.
 *
 * @see BasicAttachmentProvider  implements 'upload' | 'search' | 'stream'
 * @see BaseMediaProvider        implements 'search' | 'thumbnail'
 */
export interface AssetProvider {
  /** Stable provider identifier (e.g. 'local', 'media-library', 's3') */
  readonly id: string;
  /** Human-readable display name */
  readonly displayName: string;
  /** Capabilities this provider supports */
  readonly capabilities: ProviderCapability[];

  /**
   * Search assets with optional filtering and pagination.
   * All providers must implement this.
   */
  search(query: AssetQuery): Promise<AssetPage>;

  /**
   * Retrieve a single asset by its provider-internal ID.
   * Returns null if not found.
   */
  getById(id: string): Promise<AssetRecord | null>;

  /**
   * Store a new asset. Only available when 'upload' is in capabilities.
   * @param buffer - Raw file data
   * @param info   - File information and linkage hints
   */
  store?(buffer: Buffer, info: AssetInput): Promise<AssetRecord>;

  /**
   * Delete an asset by its provider-internal ID.
   * Returns true if deleted, false if not found.
   */
  delete?(id: string): Promise<boolean>;

  /**
   * Generate (or retrieve cached) thumbnail data.
   * Only available when 'thumbnail' is in capabilities.
   * @param id   - Asset identifier
   * @param size - Requested size string (e.g. "300x300")
   */
  getThumbnail?(id: string, size: string): Promise<Buffer | null>;

  /**
   * Stream the asset file contents.
   * Only available when 'stream' is in capabilities.
   */
  stream?(id: string): Promise<NodeJS.ReadableStream | null>;
}
