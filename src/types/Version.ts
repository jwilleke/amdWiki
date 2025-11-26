/**
 * Version type definitions for amdWiki
 *
 * This module defines types for page versioning, including version metadata,
 * manifests, and version history structures used by VersioningFileProvider.
 */

import { DiffTuple } from '../utils/DeltaStorage';

/**
 * Version metadata
 *
 * Metadata for a single page version. Stored in manifest.json as the single
 * source of truth for all version information.
 */
export interface VersionMetadata {
  /** Version number (1-based) */
  version: number;

  /** Author user ID or 'system' */
  author: string;

  /** Timestamp (ISO 8601 format) */
  timestamp: string;

  /** Change type */
  changeType: 'create' | 'update' | 'minor' | 'major';

  /** Change description/commit message */
  message?: string;

  /** SHA-256 hash of content for integrity verification */
  contentHash: string;

  /** Content size in bytes */
  contentSize: number;

  /** Whether content is compressed (.gz) */
  compressed: boolean;

  /** Whether stored as diff (true) or full content (false) */
  isDelta: boolean;

  /** If delta, the base version number */
  baseVersion?: number;

  /** Compression ratio (0-100) if compressed */
  compressionRatio?: number;
}

/**
 * Version manifest
 *
 * Single source of truth for all versions of a page. Stored as manifest.json
 * in the page's version directory.
 */
export interface VersionManifest {
  /** Page UUID */
  pageUuid: string;

  /** Page title (for reference) */
  pageTitle: string;

  /** Total number of versions */
  totalVersions: number;

  /** Current version number */
  currentVersion: number;

  /** Array of version metadata (sorted by version number) */
  versions: VersionMetadata[];

  /** Manifest creation timestamp */
  createdAt: string;

  /** Last manifest update timestamp */
  updatedAt: string;

  /** Versioning configuration at time of creation */
  config?: {
    deltaStorageEnabled: boolean;
    compressionEnabled: boolean;
    checkpointInterval: number;
  };
}

/**
 * Version content
 *
 * Full content for a specific version, reconstructed from deltas if necessary.
 */
export interface VersionContent {
  /** Version number */
  version: number;

  /** Full page content (markdown) */
  content: string;

  /** Version metadata */
  metadata: VersionMetadata;
}

/**
 * Version diff result
 *
 * Result of comparing two versions.
 */
export interface VersionDiff {
  /** Old version number */
  fromVersion: number;

  /** New version number */
  toVersion: number;

  /** Diff operations (from fast-diff) */
  diff: DiffTuple[];

  /** Diff statistics */
  stats: {
    additions: number;
    deletions: number;
    unchanged: number;
  };

  /** Old version metadata */
  fromMetadata: VersionMetadata;

  /** New version metadata */
  toMetadata: VersionMetadata;
}

/**
 * Version history entry
 *
 * Simplified version info for history listings.
 */
export interface VersionHistoryEntry {
  /** Version number */
  version: number;

  /** Author user ID or 'system' */
  author: string;

  /** Timestamp (ISO 8601 format) */
  timestamp: string;

  /** Change type */
  changeType: 'create' | 'update' | 'minor' | 'major';

  /** Change description */
  message?: string;

  /** Content size in bytes */
  contentSize: number;

  /** Whether compressed */
  compressed: boolean;
}

/**
 * Version storage info
 *
 * Information about version storage and disk usage.
 */
export interface VersionStorageInfo {
  /** Page UUID */
  pageUuid: string;

  /** Total number of versions */
  totalVersions: number;

  /** Total storage size in bytes (all versions) */
  totalSize: number;

  /** Storage size with compression/deltas in bytes */
  storageSize: number;

  /** Space saved (0-100) */
  spaceSavings: number;

  /** Average version size */
  avgVersionSize: number;

  /** Number of compressed versions */
  compressedVersions: number;

  /** Number of delta versions */
  deltaVersions: number;

  /** Oldest version timestamp */
  oldestVersion: string;

  /** Newest version timestamp */
  newestVersion: string;
}

/**
 * Version retention policy
 *
 * Configuration for version retention and cleanup.
 */
export interface VersionRetentionPolicy {
  /** Maximum number of versions to keep (0 = unlimited) */
  maxVersions: number;

  /** Number of days to retain versions (0 = unlimited) */
  retentionDays: number;

  /** Always keep version 1 (baseline) */
  keepBaseline: boolean;

  /** Always keep current version */
  keepCurrent: boolean;

  /** Checkpoint interval for full snapshots */
  checkpointInterval: number;

  /** Keep all checkpoint versions */
  keepCheckpoints: boolean;
}

/**
 * Version cleanup result
 *
 * Result of running version cleanup/maintenance.
 */
export interface VersionCleanupResult {
  /** Page UUID */
  pageUuid: string;

  /** Number of versions before cleanup */
  versionsBefore: number;

  /** Number of versions after cleanup */
  versionsAfter: number;

  /** Number of versions deleted */
  versionsDeleted: number;

  /** Space freed in bytes */
  spaceFreed: number;

  /** Deleted version numbers */
  deletedVersions: number[];

  /** Errors encountered */
  errors?: string[];
}
