/**
 * Type guards tests
 *
 * @jest-environment node
 */
import {
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
} from '../guards';

// ─── isPageFrontmatter ──────────────────────────────────────────────────────

describe('isPageFrontmatter', () => {
  const valid = { title: 'My Page', uuid: 'abc-123', lastModified: '2025-01-01' };

  test('returns true for valid minimal object', () => {
    expect(isPageFrontmatter(valid)).toBe(true);
  });

  test('returns false for null', () => {
    expect(isPageFrontmatter(null)).toBe(false);
  });

  test('returns false for non-object', () => {
    expect(isPageFrontmatter('string')).toBe(false);
  });

  test('returns false when title is missing', () => {
    expect(isPageFrontmatter({ uuid: 'abc', lastModified: '2025-01-01' })).toBe(false);
  });

  test('returns false when title is empty', () => {
    expect(isPageFrontmatter({ title: '', uuid: 'abc', lastModified: '2025-01-01' })).toBe(false);
  });

  test('returns false when uuid is missing', () => {
    expect(isPageFrontmatter({ title: 'T', lastModified: '2025-01-01' })).toBe(false);
  });

  test('returns false when lastModified is missing', () => {
    expect(isPageFrontmatter({ title: 'T', uuid: 'abc' })).toBe(false);
  });

  test('returns false when system-category is not a string', () => {
    expect(isPageFrontmatter({ ...valid, 'system-category': 123 })).toBe(false);
  });

  test('returns true when system-category is a string', () => {
    expect(isPageFrontmatter({ ...valid, 'system-category': 'General' })).toBe(true);
  });

  test('returns false when category is not a string', () => {
    expect(isPageFrontmatter({ ...valid, category: 42 })).toBe(false);
  });

  test('returns false when user-keywords is not an array', () => {
    expect(isPageFrontmatter({ ...valid, 'user-keywords': 'tag' })).toBe(false);
  });

  test('returns true when user-keywords is an array', () => {
    expect(isPageFrontmatter({ ...valid, 'user-keywords': ['tag1'] })).toBe(true);
  });
});

// ─── isWikiPage ─────────────────────────────────────────────────────────────

const validFrontmatter = { title: 'My Page', uuid: 'abc-123', lastModified: '2025-01-01' };
const validWikiPage = {
  title: 'My Page',
  uuid: 'abc-123',
  content: 'Hello world',
  metadata: validFrontmatter,
  filePath: '/pages/abc-123.md'
};

describe('isWikiPage', () => {
  test('returns true for valid wiki page', () => {
    expect(isWikiPage(validWikiPage)).toBe(true);
  });

  test('returns false for null', () => {
    expect(isWikiPage(null)).toBe(false);
  });

  test('returns false when title is missing', () => {
    const { title: _t, ...rest } = validWikiPage;
    expect(isWikiPage(rest)).toBe(false);
  });

  test('returns false when content is not a string', () => {
    expect(isWikiPage({ ...validWikiPage, content: null })).toBe(false);
  });

  test('returns false when metadata is invalid', () => {
    expect(isWikiPage({ ...validWikiPage, metadata: {} })).toBe(false);
  });

  test('returns false when filePath is missing', () => {
    const { filePath: _f, ...rest } = validWikiPage;
    expect(isWikiPage(rest)).toBe(false);
  });
});

// ─── isPageInfo ─────────────────────────────────────────────────────────────

describe('isPageInfo', () => {
  const validPageInfo = {
    title: 'My Page',
    uuid: 'abc-123',
    filePath: '/pages/abc-123.md',
    metadata: validFrontmatter
  };

  test('returns true for valid page info', () => {
    expect(isPageInfo(validPageInfo)).toBe(true);
  });

  test('returns false for null', () => {
    expect(isPageInfo(null)).toBe(false);
  });

  test('returns false when title is missing', () => {
    const { title: _t, ...rest } = validPageInfo;
    expect(isPageInfo(rest)).toBe(false);
  });

  test('returns false when uuid is missing', () => {
    expect(isPageInfo({ ...validPageInfo, uuid: '' })).toBe(false);
  });

  test('returns false when filePath is missing', () => {
    expect(isPageInfo({ ...validPageInfo, filePath: '' })).toBe(false);
  });

  test('returns false when metadata is invalid', () => {
    expect(isPageInfo({ ...validPageInfo, metadata: null })).toBe(false);
  });
});

// ─── isVersionMetadata ──────────────────────────────────────────────────────

const validVersionMeta = {
  version: 1,
  author: 'alice',
  timestamp: '2025-01-01T00:00:00Z',
  changeType: 'create',
  contentHash: 'abc123',
  contentSize: 100,
  compressed: false,
  isDelta: false
};

describe('isVersionMetadata', () => {
  test('returns true for valid version metadata', () => {
    expect(isVersionMetadata(validVersionMeta)).toBe(true);
  });

  test('returns false for null', () => {
    expect(isVersionMetadata(null)).toBe(false);
  });

  test('returns false for version < 1', () => {
    expect(isVersionMetadata({ ...validVersionMeta, version: 0 })).toBe(false);
  });

  test('returns false when author is empty', () => {
    expect(isVersionMetadata({ ...validVersionMeta, author: '' })).toBe(false);
  });

  test('returns false when timestamp is missing', () => {
    expect(isVersionMetadata({ ...validVersionMeta, timestamp: '' })).toBe(false);
  });

  test('returns false when changeType is invalid', () => {
    expect(isVersionMetadata({ ...validVersionMeta, changeType: 'unknown' })).toBe(false);
  });

  test('accepts all valid changeTypes', () => {
    for (const ct of ['create', 'update', 'minor', 'major']) {
      expect(isVersionMetadata({ ...validVersionMeta, changeType: ct })).toBe(true);
    }
  });

  test('returns false when contentHash is empty', () => {
    expect(isVersionMetadata({ ...validVersionMeta, contentHash: '' })).toBe(false);
  });

  test('returns false when contentSize is negative', () => {
    expect(isVersionMetadata({ ...validVersionMeta, contentSize: -1 })).toBe(false);
  });

  test('returns false when compressed is not boolean', () => {
    expect(isVersionMetadata({ ...validVersionMeta, compressed: 'yes' })).toBe(false);
  });

  test('returns false when isDelta is not boolean', () => {
    expect(isVersionMetadata({ ...validVersionMeta, isDelta: 1 })).toBe(false);
  });
});

// ─── isVersionManifest ──────────────────────────────────────────────────────

describe('isVersionManifest', () => {
  const validManifest = {
    pageUuid: 'abc-123',
    pageTitle: 'My Page',
    totalVersions: 1,
    currentVersion: 1,
    versions: [validVersionMeta],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  };

  test('returns true for valid manifest', () => {
    expect(isVersionManifest(validManifest)).toBe(true);
  });

  test('returns false for null', () => {
    expect(isVersionManifest(null)).toBe(false);
  });

  test('returns false when pageUuid is empty', () => {
    expect(isVersionManifest({ ...validManifest, pageUuid: '' })).toBe(false);
  });

  test('returns false when totalVersions is negative', () => {
    expect(isVersionManifest({ ...validManifest, totalVersions: -1 })).toBe(false);
  });

  test('returns false when currentVersion < 1', () => {
    expect(isVersionManifest({ ...validManifest, currentVersion: 0 })).toBe(false);
  });

  test('returns false when versions is not array', () => {
    expect(isVersionManifest({ ...validManifest, versions: null })).toBe(false);
  });

  test('returns false when versions contains invalid entry', () => {
    expect(isVersionManifest({ ...validManifest, versions: [{ invalid: true }] })).toBe(false);
  });

  test('returns true for manifest with empty versions array', () => {
    expect(isVersionManifest({ ...validManifest, versions: [], totalVersions: 0, currentVersion: 1 })).toBe(true);
  });
});

// ─── isUser ─────────────────────────────────────────────────────────────────

const validUser = {
  username: 'alice',
  email: 'alice@example.com',
  displayName: 'Alice',
  password: 'hashed:test-fixture',
  roles: ['user'],
  isActive: true,
  isSystem: false,
  isExternal: false,
  createdAt: '2025-01-01T00:00:00Z',
  loginCount: 0,
  preferences: {}
};

describe('isUser', () => {
  test('returns true for valid user', () => {
    expect(isUser(validUser)).toBe(true);
  });

  test('returns false for null', () => {
    expect(isUser(null)).toBe(false);
  });

  test('returns false when username is empty', () => {
    expect(isUser({ ...validUser, username: '' })).toBe(false);
  });

  test('returns false when email is missing', () => {
    expect(isUser({ ...validUser, email: '' })).toBe(false);
  });

  test('returns false when roles is not an array', () => {
    expect(isUser({ ...validUser, roles: 'admin' })).toBe(false);
  });

  test('returns false when isActive is not boolean', () => {
    expect(isUser({ ...validUser, isActive: 'yes' })).toBe(false);
  });

  test('returns false when loginCount is negative', () => {
    expect(isUser({ ...validUser, loginCount: -1 })).toBe(false);
  });

  test('returns false when preferences is null', () => {
    expect(isUser({ ...validUser, preferences: null })).toBe(false);
  });
});

// ─── isUserSession ──────────────────────────────────────────────────────────

describe('isUserSession', () => {
  const validSession = {
    sessionId: 'sess-abc',
    username: 'alice',
    userId: 'u-123',
    createdAt: '2025-01-01T00:00:00Z',
    expiresAt: '2025-01-02T00:00:00Z',
    lastActivity: '2025-01-01T12:00:00Z'
  };

  test('returns true for valid session', () => {
    expect(isUserSession(validSession)).toBe(true);
  });

  test('returns false for null', () => {
    expect(isUserSession(null)).toBe(false);
  });

  test('returns false when sessionId is empty', () => {
    expect(isUserSession({ ...validSession, sessionId: '' })).toBe(false);
  });

  test('returns false when username is missing', () => {
    expect(isUserSession({ ...validSession, username: '' })).toBe(false);
  });

  test('returns false when expiresAt is missing', () => {
    expect(isUserSession({ ...validSession, expiresAt: '' })).toBe(false);
  });
});

// ─── isAttachmentMetadata ───────────────────────────────────────────────────

describe('isAttachmentMetadata', () => {
  const validAttachment = {
    id: 'att-1',
    filename: 'photo.jpg',
    pageUuid: 'page-uuid',
    mimeType: 'image/jpeg',
    size: 1024,
    uploadedAt: '2025-01-01T00:00:00Z',
    uploadedBy: 'alice',
    filePath: '/data/attachments/att-1'
  };

  test('returns true for valid attachment', () => {
    expect(isAttachmentMetadata(validAttachment)).toBe(true);
  });

  test('returns false for null', () => {
    expect(isAttachmentMetadata(null)).toBe(false);
  });

  test('returns false when id is empty', () => {
    expect(isAttachmentMetadata({ ...validAttachment, id: '' })).toBe(false);
  });

  test('returns false when size is negative', () => {
    expect(isAttachmentMetadata({ ...validAttachment, size: -1 })).toBe(false);
  });

  test('returns false when filePath is missing', () => {
    expect(isAttachmentMetadata({ ...validAttachment, filePath: '' })).toBe(false);
  });
});

// ─── isAuditEvent ───────────────────────────────────────────────────────────

describe('isAuditEvent', () => {
  const validEvent = {
    id: 'evt-1',
    type: 'access',
    actor: 'alice',
    target: '/view/Page',
    action: 'view',
    timestamp: '2025-01-01T00:00:00Z',
    result: 'success'
  };

  test('returns true for valid audit event', () => {
    expect(isAuditEvent(validEvent)).toBe(true);
  });

  test('returns false for null', () => {
    expect(isAuditEvent(null)).toBe(false);
  });

  test('returns false when result is invalid', () => {
    expect(isAuditEvent({ ...validEvent, result: 'unknown' })).toBe(false);
  });

  test('returns true for result=failure', () => {
    expect(isAuditEvent({ ...validEvent, result: 'failure' })).toBe(true);
  });

  test('returns false when id is empty', () => {
    expect(isAuditEvent({ ...validEvent, id: '' })).toBe(false);
  });
});

// ─── isUuid ──────────────────────────────────────────────────────────────────

describe('isUuid', () => {
  test('returns true for valid UUIDv4', () => {
    expect(isUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(isUuid('f47ac10b-58cc-4372-a567-0e02b2c3d479')).toBe(true);
  });

  test('returns false for non-string', () => {
    expect(isUuid(123)).toBe(false);
  });

  test('returns false for invalid format', () => {
    expect(isUuid('not-a-uuid')).toBe(false);
  });

  test('returns false for empty string', () => {
    expect(isUuid('')).toBe(false);
  });
});

// ─── isIsoTimestamp ──────────────────────────────────────────────────────────

describe('isIsoTimestamp', () => {
  test('returns true for valid ISO timestamp', () => {
    expect(isIsoTimestamp('2025-01-01T00:00:00.000Z')).toBe(true);
  });

  test('returns false for non-string', () => {
    expect(isIsoTimestamp(123)).toBe(false);
  });

  test('returns false for invalid date', () => {
    expect(isIsoTimestamp('not-a-date')).toBe(false);
  });

  test('returns false for partial ISO string', () => {
    expect(isIsoTimestamp('2025-01-01')).toBe(false);
  });
});

// ─── isEmail ─────────────────────────────────────────────────────────────────

describe('isEmail', () => {
  test('returns true for valid email', () => {
    expect(isEmail('alice@example.com')).toBe(true);
  });

  test('returns false for non-string', () => {
    expect(isEmail(123)).toBe(false);
  });

  test('returns false for string without @', () => {
    expect(isEmail('notanemail')).toBe(false);
  });

  test('returns false for missing domain', () => {
    expect(isEmail('alice@')).toBe(false);
  });
});

// ─── assert helpers ──────────────────────────────────────────────────────────

describe('assertPageFrontmatter', () => {
  test('does not throw for valid value', () => {
    expect(() => assertPageFrontmatter({ title: 'T', uuid: 'u', lastModified: 'l' })).not.toThrow();
  });

  test('throws TypeError for invalid value', () => {
    expect(() => assertPageFrontmatter(null)).toThrow(TypeError);
  });
});

describe('assertWikiPage', () => {
  test('does not throw for valid page', () => {
    expect(() => assertWikiPage(validWikiPage)).not.toThrow();
  });

  test('throws TypeError for invalid value', () => {
    expect(() => assertWikiPage(null)).toThrow(TypeError);
  });
});

describe('assertVersionMetadata', () => {
  test('does not throw for valid value', () => {
    expect(() => assertVersionMetadata(validVersionMeta)).not.toThrow();
  });

  test('throws TypeError for invalid value', () => {
    expect(() => assertVersionMetadata(null)).toThrow(TypeError);
  });
});

describe('assertUser', () => {
  test('does not throw for valid user', () => {
    expect(() => assertUser(validUser)).not.toThrow();
  });

  test('throws TypeError for invalid value', () => {
    expect(() => assertUser(null)).toThrow(TypeError);
  });
});
