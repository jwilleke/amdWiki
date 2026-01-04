/**
 * Page type definitions for amdWiki
 *
 * This module defines the core types for wiki pages, including frontmatter
 * metadata, page content, and page information structures used throughout
 * the application.
 */

/**
 * Page frontmatter metadata
 *
 * Metadata stored in YAML frontmatter at the top of each markdown file.
 * All pages must have at minimum: title, uuid, and lastModified.
 */
export interface PageFrontmatter {
  /** Page title (required) */
  title: string;

  /** Unique identifier (UUID v4) */
  uuid: string;

  /** Last modification timestamp (ISO 8601 format) */
  lastModified: string;

  /** System-defined category (optional) */
  'system-category'?: string;

  /** User-defined category (optional) */
  category?: string;

  /** User-defined keywords/tags */
  'user-keywords'?: string[];

  /** URL slug for pretty URLs */
  slug?: string;

  /** Page author (user ID or 'system') */
  author?: string;

  /** Last editor (user ID or 'system') */
  editor?: string;

  /** Page template to use for rendering */
  template?: string;

  /** Whether page is published/visible */
  published?: boolean;

  /** Parent page UUID for hierarchical structure */
  parent?: string;

  /** Sort order for navigation */
  order?: number;

  /** Additional custom metadata */
  [key: string]: unknown;
}

/**
 * Complete wiki page object
 *
 * Represents a full page with content and metadata. This is the primary
 * data structure returned by PageProvider.getPage().
 */
export interface WikiPage {
  /** Page title */
  title: string;

  /** Unique identifier (UUID v4) */
  uuid: string;

  /** Markdown content (without frontmatter) */
  content: string;

  /** Frontmatter metadata */
  metadata: PageFrontmatter;

  /** Absolute file path to the page file */
  filePath: string;

  /** Location type (pages or required-pages) */
  location?: 'pages' | 'required-pages';
}

/**
 * Minimal page information for listings
 *
 * Used in page indexes, search results, and navigation where full content
 * is not needed. This is stored in page-index.json.
 */
export interface PageInfo {
  /** Page title */
  title: string;

  /** Unique identifier (UUID v4) */
  uuid: string;

  /** Absolute file path to the page file */
  filePath: string;

  /** Frontmatter metadata */
  metadata: PageFrontmatter;

  /** Location type */
  location?: 'pages' | 'required-pages';

  /** Last modification timestamp (from metadata) */
  lastModified?: string;

  /** Page author (from metadata) */
  author?: string;

  /** Last editor (from metadata) */
  editor?: string;

  /** Category (from metadata) */
  category?: string;

  /** URL slug (from metadata) */
  slug?: string;
}

/**
 * Page save options
 *
 * Options passed when saving a page to control versioning, author tracking,
 * and other save behaviors.
 */
export interface PageSaveOptions {
  /** User ID performing the save */
  author?: string;

  /** Change type (create, update, minor, major) */
  changeType?: 'create' | 'update' | 'minor' | 'major';

  /** Commit message/change description */
  message?: string;

  /** Whether to create a version entry */
  createVersion?: boolean;

  /** Additional metadata to merge */
  additionalMetadata?: Partial<PageFrontmatter>;
}

/**
 * Page search result
 *
 * Extended page info with search relevance scoring and highlighting.
 */
export interface PageSearchResult extends PageInfo {
  /** Search relevance score (0-1) */
  score: number;

  /** Highlighted snippets from content */
  highlights?: string[];

  /** Matched keywords */
  matchedKeywords?: string[];
}

/**
 * Page list options
 *
 * Options for filtering and sorting page lists.
 */
export interface PageListOptions {
  /** Filter by category */
  category?: string;

  /** Filter by author */
  author?: string;

  /** Filter by keywords (AND logic) */
  keywords?: string[];

  /** Sort field */
  sortBy?: 'title' | 'lastModified' | 'author' | 'category';

  /** Sort order */
  sortOrder?: 'asc' | 'desc';

  /** Pagination: number of results per page */
  limit?: number;

  /** Pagination: page offset (0-based) */
  offset?: number;

  /** Include required-pages in results */
  includeRequired?: boolean;
}
