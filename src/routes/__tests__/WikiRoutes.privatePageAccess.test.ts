/**
 * Unit tests for WikiRoutes — private attachment access control (#122)
 *
 * Tests that serveAttachment() enforces a 403 guard when an attachment
 * belongs to a private page, allowing access only to the page creator
 * and admins.
 *
 * Covers:
 * - Anonymous user → 403
 * - Authenticated non-creator non-admin → 403
 * - Page creator → 200 (attachment served)
 * - Admin user → 200 (attachment served)
 * - Public attachment (isPrivate not set) → 200 without access check
 * - pageName derived from meta.mentions when present
 * - pageName derived from meta.pageName fallback
 */

import WikiRoutes from '../WikiRoutes';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAGE_UUID = 'uuid-private-abc123';
const PAGE_CREATOR = 'alice';
const PAGE_NAME = 'AlicePrivatePage';

// ---------------------------------------------------------------------------
// Mock factories
// ---------------------------------------------------------------------------

/** Provider stub with a pageIndex for checkPrivatePageAccess */
function makeProvider(location = 'private', creator = PAGE_CREATOR) {
  return {
    pageIndex: {
      pages: {
        [PAGE_UUID]: { location, creator }
      }
    }
  };
}

/** PageManager stub */
function makePageManager(uuid = PAGE_UUID, location = 'private', creator = PAGE_CREATOR) {
  return {
    getPageMetadata: jest.fn().mockResolvedValue({ uuid }),
    getCurrentPageProvider: jest.fn().mockReturnValue(makeProvider(location, creator))
  };
}

/** AttachmentManager stub */
function makeAttachmentManager({ isPrivate = false, pageName = PAGE_NAME } = {}) {
  return {
    getAttachmentMetadata: jest.fn().mockResolvedValue(
      isPrivate
        ? { isPrivate: true, mentions: [{ name: pageName }] }
        : null
    ),
    getAttachment: jest.fn().mockResolvedValue({
      buffer: Buffer.from('file-bytes'),
      metadata: { name: 'photo.jpg', encodingFormat: 'image/jpeg', contentSize: 10 }
    }),
    uploadAttachment: jest.fn(),
    deleteAttachment: jest.fn()
  };
}

/** Engine stub */
function makeEngine(pageManager, attachmentManager) {
  return {
    getManager: jest.fn((name) => {
      if (name === 'PageManager')      return pageManager;
      if (name === 'AttachmentManager') return attachmentManager;
      return null;
    })
  };
}

function createReq(userContext = null, params = {}) {
  return {
    params,
    session: {},
    path: '/test',
    userContext,
    headers: {}
  };
}

function createRes() {
  const res = {
    status:     jest.fn().mockReturnThis(),
    json:       jest.fn().mockReturnThis(),
    send:       jest.fn().mockReturnThis(),
    render:     jest.fn().mockReturnThis(),
    redirect:   jest.fn().mockReturnThis(),
    setHeader:  jest.fn().mockReturnThis()
  };
  return res;
}

// ---------------------------------------------------------------------------
// Private attachment tests
// ---------------------------------------------------------------------------

describe('WikiRoutes — private attachment access (#122)', () => {
  let attachmentManager;
  let pageManager;
  let wikiRoutes;

  beforeEach(() => {
    attachmentManager = makeAttachmentManager({ isPrivate: true, pageName: PAGE_NAME });
    pageManager = makePageManager();
    const engine = makeEngine(pageManager, attachmentManager);
    wikiRoutes = new WikiRoutes(engine);
  });

  test('anonymous user receives 403 for private attachment', async () => {
    const req = createReq(null, { attachmentId: 'att-001' });
    const res = createRes();

    await wikiRoutes.serveAttachment(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.render).toHaveBeenCalledWith('error', expect.objectContaining({ code: 403 }));
  });

  test('non-creator non-admin user receives 403 for private attachment', async () => {
    const req = createReq(
      { username: 'bob', roles: ['user'], authenticated: true },
      { attachmentId: 'att-001' }
    );
    const res = createRes();

    await wikiRoutes.serveAttachment(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('page creator receives the attachment', async () => {
    const req = createReq(
      { username: PAGE_CREATOR, roles: ['user'], authenticated: true },
      { attachmentId: 'att-001' }
    );
    const res = createRes();

    await wikiRoutes.serveAttachment(req, res);

    expect(res.status).not.toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalled();
  });

  test('admin user receives the attachment regardless of creator', async () => {
    const req = createReq(
      { username: 'admin', roles: ['admin'], authenticated: true },
      { attachmentId: 'att-001' }
    );
    const res = createRes();

    await wikiRoutes.serveAttachment(req, res);

    expect(res.status).not.toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Public attachment — no access check
// ---------------------------------------------------------------------------

describe('WikiRoutes — public attachment access (#122)', () => {
  test('public attachment is served to anonymous users without access check', async () => {
    const attachmentManager = makeAttachmentManager({ isPrivate: false });
    const pageManager = makePageManager();
    const engine = makeEngine(pageManager, attachmentManager);
    const wikiRoutes = new WikiRoutes(engine);

    const req = createReq(null, { attachmentId: 'att-public' });
    const res = createRes();

    await wikiRoutes.serveAttachment(req, res);

    expect(res.status).not.toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalled();
    // PageManager should NOT be consulted for public attachments
    expect(pageManager.getPageMetadata).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// pageName fallback from meta.pageName
// ---------------------------------------------------------------------------

describe('WikiRoutes — private attachment — pageName resolution (#122)', () => {
  test('uses meta.pageName when mentions array is absent', async () => {
    const attachmentManager = makeAttachmentManager({ isPrivate: false });
    attachmentManager.getAttachmentMetadata.mockResolvedValue({
      isPrivate: true,
      pageName: PAGE_NAME
      // no mentions field
    });
    const pageManager = makePageManager();
    const engine = makeEngine(pageManager, attachmentManager);
    const wikiRoutes = new WikiRoutes(engine);

    // Anonymous — should be denied
    const req = createReq(null, { attachmentId: 'att-002' });
    const res = createRes();

    await wikiRoutes.serveAttachment(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    // Verify it used the pageName from meta (not an empty string)
    expect(pageManager.getPageMetadata).toHaveBeenCalledWith(PAGE_NAME);
  });

  test('uses empty string pageName when neither mentions nor pageName present', async () => {
    const attachmentManager = makeAttachmentManager({ isPrivate: false });
    attachmentManager.getAttachmentMetadata.mockResolvedValue({
      isPrivate: true
      // no mentions, no pageName
    });
    const pageManager = makePageManager();
    // empty pageName → getPageMetadata('') → uuid null → allow (conservative)
    pageManager.getPageMetadata.mockResolvedValue(null);
    const engine = makeEngine(pageManager, attachmentManager);
    const wikiRoutes = new WikiRoutes(engine);

    const req = createReq(null, { attachmentId: 'att-003' });
    const res = createRes();

    await wikiRoutes.serveAttachment(req, res);

    // No UUID → conservative allow → attachment is served (or 404 if getAttachment returns null)
    expect(res.status).not.toHaveBeenCalledWith(403);
  });
});
