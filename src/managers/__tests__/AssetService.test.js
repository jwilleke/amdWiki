/**
 * Unit tests for AssetService
 *
 * Covers search() fan-out across AttachmentManager and MediaManager,
 * result normalisation, insertSnippet generation, type filtering,
 * pagination, and graceful degradation when managers are unavailable.
 */

const AssetService = require('../AssetService');

// --- mock factories ---

function makeAttachment(overrides = {}) {
  return {
    identifier: 'att-1',
    name: 'photo.jpg',
    encodingFormat: 'image/jpeg',
    url: '/attachments/att-1',
    mentions: [{ name: 'SomePage' }],
    ...overrides,
  };
}

function makeMediaItem(overrides = {}) {
  return {
    id: 'media-1',
    filename: 'sunset.jpg',
    mimeType: 'image/jpeg',
    year: 2023,
    linkedPageName: 'HolidayPage',
    isPrivate: false,
    ...overrides,
  };
}

function makeEngine({ attachments = [], mediaItems = [], noAttach = false, noMedia = false } = {}) {
  const mockAttachmentManager = noAttach ? undefined : {
    getAllAttachments: jest.fn().mockResolvedValue(attachments),
  };
  const mockMediaManager = noMedia ? undefined : {
    search: jest.fn().mockResolvedValue(mediaItems),
    listByYear: jest.fn().mockResolvedValue(mediaItems),
  };

  return {
    getManager: jest.fn((name) => {
      if (name === 'AttachmentManager') return mockAttachmentManager;
      if (name === 'MediaManager') return mockMediaManager;
      return undefined;
    }),
    _mockAttachmentManager: mockAttachmentManager,
    _mockMediaManager: mockMediaManager,
  };
}

// --- helpers ---

function makeService(engineOpts = {}) {
  const engine = makeEngine(engineOpts);
  const service = new AssetService(engine);
  service.initialized = true;
  return { service, engine };
}

// -------------------------------------------------------------------------

describe('AssetService.search()', () => {
  describe('return shape (AssetSearchPage)', () => {
    it('returns { results, total, hasMore } object', async () => {
      const { service } = makeService({ attachments: [makeAttachment()], noMedia: true });

      const page = await service.search({ types: ['attachment'] });

      expect(page).toHaveProperty('results');
      expect(page).toHaveProperty('total');
      expect(page).toHaveProperty('hasMore');
      expect(Array.isArray(page.results)).toBe(true);
    });

    it('total equals full match count', async () => {
      const attachments = Array.from({ length: 5 }, (_, i) =>
        makeAttachment({ identifier: `a${i}`, name: `file${i}.jpg` })
      );
      const { service } = makeService({ attachments, noMedia: true });

      const page = await service.search({ types: ['attachment'] });

      expect(page.total).toBe(5);
    });

    it('hasMore is false when all results fit on one page', async () => {
      const { service } = makeService({ attachments: [makeAttachment()], noMedia: true });

      const page = await service.search({ types: ['attachment'] });

      expect(page.hasMore).toBe(false);
    });

    it('hasMore is true when total exceeds pageSize', async () => {
      const attachments = Array.from({ length: 10 }, (_, i) =>
        makeAttachment({ identifier: `a${i}`, name: `f${i}.jpg` })
      );
      const { service } = makeService({ attachments, noMedia: true });

      const page = await service.search({ types: ['attachment'], pageSize: 3 });

      expect(page.hasMore).toBe(true);
      expect(page.results.length).toBe(3);
      expect(page.total).toBe(10);
    });
  });

  describe('result shape', () => {
    it('attachment result has correct fields and insertSnippet for image', async () => {
      const { service } = makeService({ attachments: [makeAttachment()] });

      const { results } = await service.search({ types: ['attachment'] });

      expect(results).toHaveLength(1);
      const r = results[0];
      expect(r.assetType).toBe('attachment');
      expect(r.id).toBe('att-1');
      expect(r.filename).toBe('photo.jpg');
      expect(r.mimeType).toBe('image/jpeg');
      expect(r.url).toBe('/attachments/att-1');
      expect(r.linkedPageName).toBe('SomePage');
      expect(r.insertSnippet).toBe("[{Image src='photo.jpg'}]");
    });

    it('attachment insertSnippet uses ATTACH for non-image mimeType', async () => {
      const { service } = makeService({
        attachments: [makeAttachment({ name: 'doc.pdf', encodingFormat: 'application/pdf' })],
      });

      const { results } = await service.search({ types: ['attachment'] });

      expect(results[0].insertSnippet).toBe("[{ATTACH src='doc.pdf'}]");
    });

    it('media result has correct fields and insertSnippet', async () => {
      const { service } = makeService({ mediaItems: [makeMediaItem()] });

      const { results } = await service.search({ types: ['media'] });

      expect(results).toHaveLength(1);
      const r = results[0];
      expect(r.assetType).toBe('media');
      expect(r.id).toBe('media-1');
      expect(r.filename).toBe('sunset.jpg');
      expect(r.mimeType).toBe('image/jpeg');
      expect(r.url).toBe('/media/file/media-1');
      expect(r.thumbUrl).toBe('/media/thumb/media-1?size=150x150');
      expect(r.year).toBe(2023);
      expect(r.linkedPageName).toBe('HolidayPage');
      expect(r.insertSnippet).toBe("[{Image src='media://sunset.jpg'}]");
    });

    it('media insertSnippet uses ATTACH for video mimeType', async () => {
      const { service } = makeService({
        mediaItems: [makeMediaItem({ filename: 'clip.mp4', mimeType: 'video/mp4' })],
      });

      const { results } = await service.search({ types: ['media'] });

      expect(results[0].insertSnippet).toBe("[{ATTACH src='media://clip.mp4'}]");
    });
  });

  describe('fan-out behaviour', () => {
    it('returns both attachment and media results by default', async () => {
      const { service } = makeService({
        attachments: [makeAttachment()],
        mediaItems: [makeMediaItem()],
      });

      const { results } = await service.search();

      const types = results.map(r => r.assetType);
      expect(types).toContain('attachment');
      expect(types).toContain('media');
    });

    it('types=["attachment"] skips media search', async () => {
      const { service, engine } = makeService({
        attachments: [makeAttachment()],
        mediaItems: [makeMediaItem()],
      });

      const { results } = await service.search({ types: ['attachment'] });

      expect(results.every(r => r.assetType === 'attachment')).toBe(true);
      expect(engine._mockMediaManager.search).not.toHaveBeenCalled();
    });

    it('types=["media"] skips attachment search', async () => {
      const { service, engine } = makeService({
        attachments: [makeAttachment()],
        mediaItems: [makeMediaItem()],
      });

      const { results } = await service.search({ types: ['media'] });

      expect(results.every(r => r.assetType === 'media')).toBe(true);
      expect(engine._mockAttachmentManager.getAllAttachments).not.toHaveBeenCalled();
    });
  });

  describe('query filtering', () => {
    it('query filters attachments by filename substring (case-insensitive)', async () => {
      const { service } = makeService({
        attachments: [
          makeAttachment({ identifier: 'a1', name: 'beach.jpg' }),
          makeAttachment({ identifier: 'a2', name: 'mountain.jpg' }),
        ],
        noMedia: true,
      });

      const { results } = await service.search({ query: 'BEACH', types: ['attachment'] });

      expect(results).toHaveLength(1);
      expect(results[0].filename).toBe('beach.jpg');
    });

    it('empty query returns all attachments', async () => {
      const { service } = makeService({
        attachments: [
          makeAttachment({ identifier: 'a1', name: 'a.jpg' }),
          makeAttachment({ identifier: 'a2', name: 'b.jpg' }),
        ],
        noMedia: true,
      });

      const { results } = await service.search({ query: '', types: ['attachment'] });

      expect(results).toHaveLength(2);
    });

    it('passes query to MediaManager.search()', async () => {
      const { service, engine } = makeService({ mediaItems: [] });

      await service.search({ query: 'sunset', types: ['media'] });

      expect(engine._mockMediaManager.search).toHaveBeenCalledWith('sunset', undefined);
    });
  });

  describe('year filter', () => {
    it('year with no query uses listByYear', async () => {
      const { service, engine } = makeService({ mediaItems: [makeMediaItem()] });

      await service.search({ year: 2023, types: ['media'] });

      expect(engine._mockMediaManager.listByYear).toHaveBeenCalledWith(2023, undefined);
      expect(engine._mockMediaManager.search).not.toHaveBeenCalled();
    });

    it('year with query uses search() then filters by year', async () => {
      const { service, engine } = makeService({
        mediaItems: [
          makeMediaItem({ id: 'm1', year: 2023 }),
          makeMediaItem({ id: 'm2', year: 2022 }),
        ],
      });

      const { results } = await service.search({ query: 'sunset', year: 2023, types: ['media'] });

      expect(engine._mockMediaManager.search).toHaveBeenCalled();
      expect(results.every(r => r.year === 2023)).toBe(true);
    });
  });

  describe('pagination', () => {
    it('pageSize limits results returned', async () => {
      const attachments = Array.from({ length: 20 }, (_, i) =>
        makeAttachment({ identifier: `a${i}`, name: `file${i}.jpg` })
      );
      const { service } = makeService({ attachments, noMedia: true });

      const { results } = await service.search({ types: ['attachment'], pageSize: 5 });

      expect(results.length).toBe(5);
    });

    it('offset skips earlier results', async () => {
      const attachments = Array.from({ length: 10 }, (_, i) =>
        makeAttachment({ identifier: `a${i}`, name: `file${i}.jpg` })
      );
      const { service } = makeService({ attachments, noMedia: true });

      const page1 = await service.search({ types: ['attachment'], pageSize: 3, offset: 0 });
      const page2 = await service.search({ types: ['attachment'], pageSize: 3, offset: 3 });

      expect(page1.results[0].filename).toBe('file0.jpg');
      expect(page2.results[0].filename).toBe('file3.jpg');
    });

    it('total always reflects full match count regardless of page', async () => {
      const attachments = Array.from({ length: 15 }, (_, i) =>
        makeAttachment({ identifier: `a${i}`, name: `file${i}.jpg` })
      );
      const { service } = makeService({ attachments, noMedia: true });

      const page = await service.search({ types: ['attachment'], pageSize: 5, offset: 10 });

      expect(page.total).toBe(15);
      expect(page.results.length).toBe(5);
    });

    it('default pageSize is 48', async () => {
      const attachments = Array.from({ length: 60 }, (_, i) =>
        makeAttachment({ identifier: `a${i}`, name: `file${i}.jpg` })
      );
      const { service } = makeService({ attachments, noMedia: true });

      const { results } = await service.search({ types: ['attachment'] });

      expect(results.length).toBe(48);
    });
  });

  describe('graceful degradation', () => {
    it('AttachmentManager unavailable → returns only media results', async () => {
      const { service } = makeService({ noAttach: true, mediaItems: [makeMediaItem()] });

      const { results } = await service.search();

      expect(results.every(r => r.assetType === 'media')).toBe(true);
    });

    it('MediaManager unavailable → returns only attachment results', async () => {
      const { service } = makeService({ noMedia: true, attachments: [makeAttachment()] });

      const { results } = await service.search();

      expect(results.every(r => r.assetType === 'attachment')).toBe(true);
    });

    it('both managers unavailable → returns empty results', async () => {
      const { service } = makeService({ noAttach: true, noMedia: true });

      const page = await service.search();

      expect(page.results).toEqual([]);
      expect(page.total).toBe(0);
      expect(page.hasMore).toBe(false);
    });

    it('attachment search throws → returns media results without crashing', async () => {
      const engine = makeEngine({ mediaItems: [makeMediaItem()] });
      engine._mockAttachmentManager.getAllAttachments.mockRejectedValue(new Error('disk error'));
      const service = new AssetService(engine);

      const { results } = await service.search();

      expect(results.some(r => r.assetType === 'media')).toBe(true);
    });

    it('media search throws → returns attachment results without crashing', async () => {
      const engine = makeEngine({ attachments: [makeAttachment()] });
      engine._mockMediaManager.search.mockRejectedValue(new Error('index error'));
      const service = new AssetService(engine);

      const { results } = await service.search();

      expect(results.some(r => r.assetType === 'attachment')).toBe(true);
    });
  });
});
