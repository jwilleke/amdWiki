/**
 * ngdpbase Type Definitions
 *
 * Central export point for all TypeScript type definitions used throughout
 * the ngdpbase application. Import types from this module to ensure consistency.
 *
 * @example
 * import { WikiPage, PageFrontmatter, User } from '../types/index.js';
 *
 * @module types
 */

// Page types
export {
  PageFrontmatter,
  WikiPage,
  PageInfo,
  PageSaveOptions,
  PageSearchResult,
  PageListOptions
} from './Page.js';

// Version types
export {
  VersionMetadata,
  VersionManifest,
  VersionContent,
  VersionDiff,
  VersionHistoryEntry,
  VersionStorageInfo,
  VersionRetentionPolicy,
  VersionCleanupResult
} from './Version.js';

// User types
export {
  User,
  UserPreferences,
  UserCreateData,
  UserUpdateData,
  UserSession,
  AuthResult,
  Role,
  Permission,
  UserProfile
} from './User.js';

// Configuration types
export {
  WikiConfig,
  VersioningConfig,
  SearchProviderConfig,
  InstallConfig,
  ConfigPropertyDescriptor,
  ConfigChangeEvent,
  ConfigValidationResult
} from './Config.js';

// Provider types
export {
  BaseProvider,
  PageProvider,
  VersioningPageProvider,
  UserProvider,
  AttachmentProvider,
  AttachmentMetadata,
  SearchProvider,
  CacheProvider,
  AuditProvider,
  AuditEvent
} from './Provider.js';

// WikiEngine types
export {
  WikiEngine,
  ManagerRegistry
} from './WikiEngine.js';

// Asset types (Epic #405 — unified AssetManager)
export {
  ProviderCapability,
  AssetGPS,
  AssetCamera,
  AssetMetadata,
  AssetDimensions,
  AssetUsageRights,
  AssetUsageStats,
  AssetRecord,
  AssetQuery,
  AssetPage,
  AssetInput,
  AssetProvider
} from './Asset.js';

// Type guards
export {
  isPageFrontmatter,
  isWikiPage,
  isPageInfo,
  isVersionMetadata,
  isVersionManifest,
  isUser,
  isUserSession,
  isAttachmentMetadata,
  isAuditEvent,
  isUuid,
  isIsoTimestamp,
  isEmail,
  assertPageFrontmatter,
  assertWikiPage,
  assertVersionMetadata,
  assertUser
} from './guards.js';

// Note: Individual type exports are handled by the named exports above
// Manager and context types are defined in their respective implementation files
