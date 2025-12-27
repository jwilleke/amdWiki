/**
 * amdWiki Type Definitions
 *
 * Central export point for all TypeScript type definitions used throughout
 * the amdWiki application. Import types from this module to ensure consistency.
 *
 * @example
 * import { WikiPage, PageFrontmatter, User } from '../types';
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
} from './Page';

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
} from './Version';

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
} from './User';

// Configuration types
export {
  WikiConfig,
  VersioningConfig,
  SearchProviderConfig,
  InstallConfig,
  ConfigPropertyDescriptor,
  ConfigChangeEvent,
  ConfigValidationResult
} from './Config';

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
} from './Provider';

// WikiEngine types
export {
  WikiEngine,
  ManagerRegistry
} from './WikiEngine';

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
} from './guards';

// Note: Individual type exports are handled by the named exports above
// Manager and context types are defined in their respective implementation files
