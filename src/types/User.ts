/**
 * User type definitions for amdWiki
 *
 * This module defines types for users, authentication, roles, and permissions
 * used by UserManager and authorization systems.
 */

/**
 * User preferences
 *
 * User-specific settings and preferences.
 */
export interface UserPreferences {
  /** Editor smart pairs (auto-close brackets, quotes) */
  'editor.plain.smartpairs'?: boolean;

  /** Editor auto-indent */
  'editor.autoindent'?: boolean;

  /** Show line numbers in editor */
  'editor.linenumbers'?: boolean;

  /** Editor theme (light, dark, etc.) */
  'editor.theme'?: string;

  /** Display page size for lists */
  'display.pagesize'?: string;

  /** Show tooltips */
  'display.tooltips'?: boolean;

  /** Reader mode enabled */
  'display.readermode'?: boolean;

  /** Date format (iso, us, eu, etc.) */
  'display.dateformat'?: string;

  /** Timezone */
  timezone?: string;

  /** Language/locale */
  locale?: string;

  /** Additional custom preferences */
  [key: string]: unknown;
}

/**
 * User object
 *
 * Complete user record stored in the user provider.
 */
export interface User {
  /** Username (unique identifier for login) */
  username: string;

  /** Email address */
  email: string;

  /** Display name (full name) */
  displayName: string;

  /** Hashed password (SHA-256 or bcrypt) */
  password: string;

  /** User roles (admin, editor, viewer, etc.) */
  roles: string[];

  /** Whether user account is active */
  isActive: boolean;

  /** Whether user is system user */
  isSystem: boolean;

  /** Whether user is external (LDAP, OAuth) */
  isExternal: boolean;

  /** Account creation timestamp (ISO 8601) */
  createdAt: string;

  /** Last login timestamp (ISO 8601) */
  lastLogin?: string;

  /** Total login count */
  loginCount: number;

  /** User preferences */
  preferences: UserPreferences;

  /** Profile picture URL or data */
  avatar?: string;

  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * User creation data
 *
 * Data required to create a new user (no password hash yet).
 */
export interface UserCreateData {
  /** Username (unique) */
  username: string;

  /** Email address */
  email: string;

  /** Display name */
  displayName: string;

  /** Plain text password (will be hashed) */
  password: string;

  /** Initial roles */
  roles?: string[];

  /** Whether account starts active */
  isActive?: boolean;

  /** User preferences */
  preferences?: Partial<UserPreferences>;
}

/**
 * User update data
 *
 * Partial user data for updates (all fields optional).
 */
export interface UserUpdateData {
  /** Email address */
  email?: string;

  /** Display name */
  displayName?: string;

  /** New plain text password (will be hashed) */
  password?: string;

  /** Updated roles */
  roles?: string[];

  /** Active status */
  isActive?: boolean;

  /** Updated preferences */
  preferences?: Partial<UserPreferences>;

  /** Avatar */
  avatar?: string;

  /** Metadata */
  metadata?: Record<string, unknown>;
}

/**
 * User session data
 *
 * Active session information stored by session manager.
 */
export interface UserSession {
  /** Session ID (unique) */
  sessionId: string;

  /** Username */
  username: string;

  /** User ID (username or external ID) */
  userId: string;

  /** Session creation timestamp (ISO 8601) */
  createdAt: string;

  /** Session expiration timestamp (ISO 8601) */
  expiresAt: string;

  /** Last activity timestamp (ISO 8601) */
  lastActivity: string;

  /** Client IP address */
  ipAddress?: string;

  /** User agent string */
  userAgent?: string;

  /** Additional session data */
  data?: Record<string, unknown>;
}

/**
 * User authentication result
 *
 * Result of authentication attempt.
 */
export interface AuthResult {
  /** Whether authentication succeeded */
  success: boolean;

  /** User object if successful */
  user?: User;

  /** Session ID if successful */
  sessionId?: string;

  /** Error message if failed */
  error?: string;

  /** Error code (invalid_credentials, account_disabled, etc.) */
  errorCode?: string;
}

/**
 * User role definition
 *
 * Defines a role and its permissions.
 */
export interface Role {
  /** Role name (unique identifier) */
  name: string;

  /** Display name */
  displayName: string;

  /** Role description */
  description?: string;

  /** Permissions granted by this role */
  permissions: string[];

  /** Whether this is a system role (cannot be deleted) */
  isSystem: boolean;

  /** Parent roles (inheritance) */
  inherits?: string[];
}

/**
 * User permission
 *
 * Defines a specific permission.
 */
export interface Permission {
  /** Permission name (unique identifier) */
  name: string;

  /** Display name */
  displayName: string;

  /** Permission description */
  description?: string;

  /** Resource this permission applies to */
  resource: string;

  /** Action allowed (view, edit, delete, etc.) */
  action: string;

  /** Whether this is a system permission */
  isSystem: boolean;
}

/**
 * User profile
 *
 * Public user profile (safe to expose to other users).
 */
export interface UserProfile {
  /** Username */
  username: string;

  /** Display name */
  displayName: string;

  /** Email (may be hidden based on privacy settings) */
  email?: string;

  /** Avatar */
  avatar?: string;

  /** Roles (may be filtered based on permissions) */
  roles?: string[];

  /** Whether user is active */
  isActive: boolean;

  /** Account creation date */
  createdAt: string;

  /** Last login (may be hidden) */
  lastLogin?: string;
}
