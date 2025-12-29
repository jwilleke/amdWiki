/**
 * Type guards for runtime type checking
 *
 * This module provides type guard functions that can be used to validate
 * data structures at runtime and provide TypeScript type narrowing.
 */

import { WikiPage, PageFrontmatter, PageInfo } from './Page';
import { VersionMetadata, VersionManifest } from './Version';
import { User, UserSession } from './User';
import { AttachmentMetadata, AuditEvent } from './Provider';

/**
 * Check if value is a valid PageFrontmatter object
 */
export function isPageFrontmatter(value: unknown): value is PageFrontmatter {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;

  // Required fields
  if (typeof obj.title !== 'string' || !obj.title) {
    return false;
  }

  if (typeof obj.uuid !== 'string' || !obj.uuid) {
    return false;
  }

  if (typeof obj.lastModified !== 'string' || !obj.lastModified) {
    return false;
  }

  // Optional fields with type checks
  if (obj['system-category'] !== undefined && typeof obj['system-category'] !== 'string') {
    return false;
  }

  if (obj.category !== undefined && typeof obj.category !== 'string') {
    return false;
  }

  if (obj['user-keywords'] !== undefined && !Array.isArray(obj['user-keywords'])) {
    return false;
  }

  return true;
}

/**
 * Check if value is a valid WikiPage object
 */
export function isWikiPage(value: unknown): value is WikiPage {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;

  if (typeof obj.title !== 'string' || !obj.title) {
    return false;
  }

  if (typeof obj.uuid !== 'string' || !obj.uuid) {
    return false;
  }

  if (typeof obj.content !== 'string') {
    return false;
  }

  if (!isPageFrontmatter(obj.metadata)) {
    return false;
  }

  if (typeof obj.filePath !== 'string' || !obj.filePath) {
    return false;
  }

  return true;
}

/**
 * Check if value is a valid PageInfo object
 */
export function isPageInfo(value: unknown): value is PageInfo {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;

  if (typeof obj.title !== 'string' || !obj.title) {
    return false;
  }

  if (typeof obj.uuid !== 'string' || !obj.uuid) {
    return false;
  }

  if (typeof obj.filePath !== 'string' || !obj.filePath) {
    return false;
  }

  if (!isPageFrontmatter(obj.metadata)) {
    return false;
  }

  return true;
}

/**
 * Check if value is a valid VersionMetadata object
 */
export function isVersionMetadata(value: unknown): value is VersionMetadata {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;

  if (typeof obj.version !== 'number' || obj.version < 1) {
    return false;
  }

  if (typeof obj.author !== 'string' || !obj.author) {
    return false;
  }

  if (typeof obj.timestamp !== 'string' || !obj.timestamp) {
    return false;
  }

  const validChangeTypes = ['create', 'update', 'minor', 'major'];
  if (typeof obj.changeType !== 'string' || !validChangeTypes.includes(obj.changeType)) {
    return false;
  }

  if (typeof obj.contentHash !== 'string' || !obj.contentHash) {
    return false;
  }

  if (typeof obj.contentSize !== 'number' || obj.contentSize < 0) {
    return false;
  }

  if (typeof obj.compressed !== 'boolean') {
    return false;
  }

  if (typeof obj.isDelta !== 'boolean') {
    return false;
  }

  return true;
}

/**
 * Check if value is a valid VersionManifest object
 */
export function isVersionManifest(value: unknown): value is VersionManifest {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;

  if (typeof obj.pageUuid !== 'string' || !obj.pageUuid) {
    return false;
  }

  if (typeof obj.pageTitle !== 'string' || !obj.pageTitle) {
    return false;
  }

  if (typeof obj.totalVersions !== 'number' || obj.totalVersions < 0) {
    return false;
  }

  if (typeof obj.currentVersion !== 'number' || obj.currentVersion < 1) {
    return false;
  }

  if (!Array.isArray(obj.versions)) {
    return false;
  }

  // Validate each version metadata
  for (const version of obj.versions) {
    if (!isVersionMetadata(version)) {
      return false;
    }
  }

  if (typeof obj.createdAt !== 'string' || !obj.createdAt) {
    return false;
  }

  if (typeof obj.updatedAt !== 'string' || !obj.updatedAt) {
    return false;
  }

  return true;
}

/**
 * Check if value is a valid User object
 */
export function isUser(value: unknown): value is User {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;

  if (typeof obj.username !== 'string' || !obj.username) {
    return false;
  }

  if (typeof obj.email !== 'string' || !obj.email) {
    return false;
  }

  if (typeof obj.displayName !== 'string' || !obj.displayName) {
    return false;
  }

  if (typeof obj.password !== 'string' || !obj.password) {
    return false;
  }

  if (!Array.isArray(obj.roles)) {
    return false;
  }

  if (typeof obj.isActive !== 'boolean') {
    return false;
  }

  if (typeof obj.isSystem !== 'boolean') {
    return false;
  }

  if (typeof obj.isExternal !== 'boolean') {
    return false;
  }

  if (typeof obj.createdAt !== 'string' || !obj.createdAt) {
    return false;
  }

  if (typeof obj.loginCount !== 'number' || obj.loginCount < 0) {
    return false;
  }

  if (!obj.preferences || typeof obj.preferences !== 'object') {
    return false;
  }

  return true;
}

/**
 * Check if value is a valid UserSession object
 */
export function isUserSession(value: unknown): value is UserSession {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;

  if (typeof obj.sessionId !== 'string' || !obj.sessionId) {
    return false;
  }

  if (typeof obj.username !== 'string' || !obj.username) {
    return false;
  }

  if (typeof obj.userId !== 'string' || !obj.userId) {
    return false;
  }

  if (typeof obj.createdAt !== 'string' || !obj.createdAt) {
    return false;
  }

  if (typeof obj.expiresAt !== 'string' || !obj.expiresAt) {
    return false;
  }

  if (typeof obj.lastActivity !== 'string' || !obj.lastActivity) {
    return false;
  }

  return true;
}

/**
 * Check if value is a valid AttachmentMetadata object
 */
export function isAttachmentMetadata(value: unknown): value is AttachmentMetadata {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;

  if (typeof obj.id !== 'string' || !obj.id) {
    return false;
  }

  if (typeof obj.filename !== 'string' || !obj.filename) {
    return false;
  }

  if (typeof obj.pageUuid !== 'string' || !obj.pageUuid) {
    return false;
  }

  if (typeof obj.mimeType !== 'string' || !obj.mimeType) {
    return false;
  }

  if (typeof obj.size !== 'number' || obj.size < 0) {
    return false;
  }

  if (typeof obj.uploadedAt !== 'string' || !obj.uploadedAt) {
    return false;
  }

  if (typeof obj.uploadedBy !== 'string' || !obj.uploadedBy) {
    return false;
  }

  if (typeof obj.filePath !== 'string' || !obj.filePath) {
    return false;
  }

  return true;
}

/**
 * Check if value is a valid AuditEvent object
 */
export function isAuditEvent(value: unknown): value is AuditEvent {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;

  if (typeof obj.id !== 'string' || !obj.id) {
    return false;
  }

  if (typeof obj.type !== 'string' || !obj.type) {
    return false;
  }

  if (typeof obj.actor !== 'string' || !obj.actor) {
    return false;
  }

  if (typeof obj.target !== 'string' || !obj.target) {
    return false;
  }

  if (typeof obj.action !== 'string' || !obj.action) {
    return false;
  }

  if (typeof obj.timestamp !== 'string' || !obj.timestamp) {
    return false;
  }

  const validResults = ['success', 'failure'];
  if (typeof obj.result !== 'string' || !validResults.includes(obj.result)) {
    return false;
  }

  return true;
}

/**
 * Check if value is a valid UUID (v4 format)
 */
export function isUuid(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Check if value is a valid ISO 8601 timestamp
 */
export function isIsoTimestamp(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }

  try {
    const date = new Date(value);
    return date.toISOString() === value;
  } catch {
    return false;
  }
}

/**
 * Check if value is a valid email address
 */
export function isEmail(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * Validate and assert PageFrontmatter
 * @throws {TypeError} if validation fails
 */
export function assertPageFrontmatter(value: unknown): asserts value is PageFrontmatter {
  if (!isPageFrontmatter(value)) {
    throw new TypeError('Invalid PageFrontmatter object');
  }
}

/**
 * Validate and assert WikiPage
 * @throws {TypeError} if validation fails
 */
export function assertWikiPage(value: unknown): asserts value is WikiPage {
  if (!isWikiPage(value)) {
    throw new TypeError('Invalid WikiPage object');
  }
}

/**
 * Validate and assert VersionMetadata
 * @throws {TypeError} if validation fails
 */
export function assertVersionMetadata(value: unknown): asserts value is VersionMetadata {
  if (!isVersionMetadata(value)) {
    throw new TypeError('Invalid VersionMetadata object');
  }
}

/**
 * Validate and assert User
 * @throws {TypeError} if validation fails
 */
export function assertUser(value: unknown): asserts value is User {
  if (!isUser(value)) {
    throw new TypeError('Invalid User object');
  }
}
