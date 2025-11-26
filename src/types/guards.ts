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
export function isPageFrontmatter(value: any): value is PageFrontmatter {
  if (!value || typeof value !== 'object') {
    return false;
  }

  // Required fields
  if (typeof value.title !== 'string' || !value.title) {
    return false;
  }

  if (typeof value.uuid !== 'string' || !value.uuid) {
    return false;
  }

  if (typeof value.lastModified !== 'string' || !value.lastModified) {
    return false;
  }

  // Optional fields with type checks
  if (value['system-category'] !== undefined && typeof value['system-category'] !== 'string') {
    return false;
  }

  if (value.category !== undefined && typeof value.category !== 'string') {
    return false;
  }

  if (value['user-keywords'] !== undefined && !Array.isArray(value['user-keywords'])) {
    return false;
  }

  return true;
}

/**
 * Check if value is a valid WikiPage object
 */
export function isWikiPage(value: any): value is WikiPage {
  if (!value || typeof value !== 'object') {
    return false;
  }

  if (typeof value.title !== 'string' || !value.title) {
    return false;
  }

  if (typeof value.uuid !== 'string' || !value.uuid) {
    return false;
  }

  if (typeof value.content !== 'string') {
    return false;
  }

  if (!isPageFrontmatter(value.metadata)) {
    return false;
  }

  if (typeof value.filePath !== 'string' || !value.filePath) {
    return false;
  }

  return true;
}

/**
 * Check if value is a valid PageInfo object
 */
export function isPageInfo(value: any): value is PageInfo {
  if (!value || typeof value !== 'object') {
    return false;
  }

  if (typeof value.title !== 'string' || !value.title) {
    return false;
  }

  if (typeof value.uuid !== 'string' || !value.uuid) {
    return false;
  }

  if (typeof value.filePath !== 'string' || !value.filePath) {
    return false;
  }

  if (!isPageFrontmatter(value.metadata)) {
    return false;
  }

  return true;
}

/**
 * Check if value is a valid VersionMetadata object
 */
export function isVersionMetadata(value: any): value is VersionMetadata {
  if (!value || typeof value !== 'object') {
    return false;
  }

  if (typeof value.version !== 'number' || value.version < 1) {
    return false;
  }

  if (typeof value.author !== 'string' || !value.author) {
    return false;
  }

  if (typeof value.timestamp !== 'string' || !value.timestamp) {
    return false;
  }

  const validChangeTypes = ['create', 'update', 'minor', 'major'];
  if (!validChangeTypes.includes(value.changeType)) {
    return false;
  }

  if (typeof value.contentHash !== 'string' || !value.contentHash) {
    return false;
  }

  if (typeof value.contentSize !== 'number' || value.contentSize < 0) {
    return false;
  }

  if (typeof value.compressed !== 'boolean') {
    return false;
  }

  if (typeof value.isDelta !== 'boolean') {
    return false;
  }

  return true;
}

/**
 * Check if value is a valid VersionManifest object
 */
export function isVersionManifest(value: any): value is VersionManifest {
  if (!value || typeof value !== 'object') {
    return false;
  }

  if (typeof value.pageUuid !== 'string' || !value.pageUuid) {
    return false;
  }

  if (typeof value.pageTitle !== 'string' || !value.pageTitle) {
    return false;
  }

  if (typeof value.totalVersions !== 'number' || value.totalVersions < 0) {
    return false;
  }

  if (typeof value.currentVersion !== 'number' || value.currentVersion < 1) {
    return false;
  }

  if (!Array.isArray(value.versions)) {
    return false;
  }

  // Validate each version metadata
  for (const version of value.versions) {
    if (!isVersionMetadata(version)) {
      return false;
    }
  }

  if (typeof value.createdAt !== 'string' || !value.createdAt) {
    return false;
  }

  if (typeof value.updatedAt !== 'string' || !value.updatedAt) {
    return false;
  }

  return true;
}

/**
 * Check if value is a valid User object
 */
export function isUser(value: any): value is User {
  if (!value || typeof value !== 'object') {
    return false;
  }

  if (typeof value.username !== 'string' || !value.username) {
    return false;
  }

  if (typeof value.email !== 'string' || !value.email) {
    return false;
  }

  if (typeof value.displayName !== 'string' || !value.displayName) {
    return false;
  }

  if (typeof value.password !== 'string' || !value.password) {
    return false;
  }

  if (!Array.isArray(value.roles)) {
    return false;
  }

  if (typeof value.isActive !== 'boolean') {
    return false;
  }

  if (typeof value.isSystem !== 'boolean') {
    return false;
  }

  if (typeof value.isExternal !== 'boolean') {
    return false;
  }

  if (typeof value.createdAt !== 'string' || !value.createdAt) {
    return false;
  }

  if (typeof value.loginCount !== 'number' || value.loginCount < 0) {
    return false;
  }

  if (!value.preferences || typeof value.preferences !== 'object') {
    return false;
  }

  return true;
}

/**
 * Check if value is a valid UserSession object
 */
export function isUserSession(value: any): value is UserSession {
  if (!value || typeof value !== 'object') {
    return false;
  }

  if (typeof value.sessionId !== 'string' || !value.sessionId) {
    return false;
  }

  if (typeof value.username !== 'string' || !value.username) {
    return false;
  }

  if (typeof value.userId !== 'string' || !value.userId) {
    return false;
  }

  if (typeof value.createdAt !== 'string' || !value.createdAt) {
    return false;
  }

  if (typeof value.expiresAt !== 'string' || !value.expiresAt) {
    return false;
  }

  if (typeof value.lastActivity !== 'string' || !value.lastActivity) {
    return false;
  }

  return true;
}

/**
 * Check if value is a valid AttachmentMetadata object
 */
export function isAttachmentMetadata(value: any): value is AttachmentMetadata {
  if (!value || typeof value !== 'object') {
    return false;
  }

  if (typeof value.id !== 'string' || !value.id) {
    return false;
  }

  if (typeof value.filename !== 'string' || !value.filename) {
    return false;
  }

  if (typeof value.pageUuid !== 'string' || !value.pageUuid) {
    return false;
  }

  if (typeof value.mimeType !== 'string' || !value.mimeType) {
    return false;
  }

  if (typeof value.size !== 'number' || value.size < 0) {
    return false;
  }

  if (typeof value.uploadedAt !== 'string' || !value.uploadedAt) {
    return false;
  }

  if (typeof value.uploadedBy !== 'string' || !value.uploadedBy) {
    return false;
  }

  if (typeof value.filePath !== 'string' || !value.filePath) {
    return false;
  }

  return true;
}

/**
 * Check if value is a valid AuditEvent object
 */
export function isAuditEvent(value: any): value is AuditEvent {
  if (!value || typeof value !== 'object') {
    return false;
  }

  if (typeof value.id !== 'string' || !value.id) {
    return false;
  }

  if (typeof value.type !== 'string' || !value.type) {
    return false;
  }

  if (typeof value.actor !== 'string' || !value.actor) {
    return false;
  }

  if (typeof value.target !== 'string' || !value.target) {
    return false;
  }

  if (typeof value.action !== 'string' || !value.action) {
    return false;
  }

  if (typeof value.timestamp !== 'string' || !value.timestamp) {
    return false;
  }

  const validResults = ['success', 'failure'];
  if (!validResults.includes(value.result)) {
    return false;
  }

  return true;
}

/**
 * Check if value is a valid UUID (v4 format)
 */
export function isUuid(value: any): value is string {
  if (typeof value !== 'string') {
    return false;
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Check if value is a valid ISO 8601 timestamp
 */
export function isIsoTimestamp(value: any): value is string {
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
export function isEmail(value: any): value is string {
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
export function assertPageFrontmatter(value: any): asserts value is PageFrontmatter {
  if (!isPageFrontmatter(value)) {
    throw new TypeError('Invalid PageFrontmatter object');
  }
}

/**
 * Validate and assert WikiPage
 * @throws {TypeError} if validation fails
 */
export function assertWikiPage(value: any): asserts value is WikiPage {
  if (!isWikiPage(value)) {
    throw new TypeError('Invalid WikiPage object');
  }
}

/**
 * Validate and assert VersionMetadata
 * @throws {TypeError} if validation fails
 */
export function assertVersionMetadata(value: any): asserts value is VersionMetadata {
  if (!isVersionMetadata(value)) {
    throw new TypeError('Invalid VersionMetadata object');
  }
}

/**
 * Validate and assert User
 * @throws {TypeError} if validation fails
 */
export function assertUser(value: any): asserts value is User {
  if (!isUser(value)) {
    throw new TypeError('Invalid User object');
  }
}
