/**
 * Unit tests for AssetService
 *
 * Covers search() fan-out across AttachmentManager and MediaManager,
 * result normalisation, insertSnippet generation, type filtering,
 * pagination, and graceful degradation when managers are unavailable.
 *
 * Result fields use schema.org names (AssetRecord):
 *   providerId        — 'local' (attachment) or 'media-library' (media)
 *   encodingFormat    — MIME type
 *   thumbnailUrl      — thumbnail URL (media only)
 *   dateCreated       — ISO timestamp
 *   description       — caption / description text
 *   mentions          — array of page names
 */

const AssetService = require('../AssetService');

// --- mock factories ---

function makeAttachment(overrides = {}) {
  return {
    id: 'att-1',
    filename: 'photo.jpg',
    mimeType: 'image/jpeg',
    uploadedAt: '2024-01-01T00:00:00Z',
    description: '',
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
  describe('return shape (AssetPage)', () => {
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
        makeAttachment({ id: `a${i}`, filename: `file${i}.jpg` })
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
        makeAttachment({ id: `a${i}`, filename: `f${i}.jpg` })
      );
      const { service } = makeService({ attachments, noMedia: true });

      const page = await service.search({ types: ['attachment'], pageSize: 3 });

      expect(page.hasMore).toBe(true);
      expect(page.results.length).toBe(3);
      expect(page.total).toBe(10);
    });
  });

  describe('result shape (AssetRecord)', () => {
    it('attachment result has correct fields and insertSnippet for image', async () => {
      const { service } = makeService({ attachments: [makeAttachment()] });

      const { results } = await service.search({ types: ['attachment'] });

      expect(results).toHaveLength(1);
      const r = results[0];
      expect(r.providerId).toBe('local');
      expect(r.id).toBe('att-1');
      expect(r.filename).toBe('photo.jpg');
      expect(r.encodingFormat).toBe('image/jpeg');
      expect(r.url).toBe('/attachments/att-1');
      expect(r.dateCreated).toBe('2024-01-01T00:00:00Z');
      expect(r.insertSnippet).toBe("[{Image src='photo.jpg'}]");
    });

    it('attachment insertSnippet uses ATTACH for non-image mimeType', async () => {
      const { service } = makeService({
        attachments: [makeAttachment({ filename: 'doc.pdf', mimeType: 'application/pdf' })],
      });

      const { results } = await service.search({ types: ['attachment'] });

      expect(results[0].insertSnippet).toBe("[{ATTACH src='doc.pdf'}]");
    });

    it('media result has correct fields and insertSnippet', async () => {
      const { service } = makeService({ mediaItems: [makeMediaItem()] });

      const { results } = await service.search({ types: ['media'] });

      expect(results).toHaveLength(1);
      const r = results[0];
      expect(r.providerId).toBe('media-library');
      expect(r.id).toBe('media-1');
      expect(r.filename).toBe('sunset.jpg');
      expect(r.encodingFormat).toBe('image/jpeg');
      expect(r.url).toBe('/media/file/media-1');
      expect(r.thumbnailUrl).toBe('/media/thumb/media-1?size=150x150');
      expect(r.mentions).toEqual(['HolidayPage']);
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

      const providerIds = results.map(r => r.providerId);
      expect(providerIds).toContain('local');
      expect(providerIds).toContain('media-library');
    });

    it('types=["attachment"] skips media search', async () => {
      const { service, engine } = makeService({
        attachments: [makeAttachment()],
        mediaItems: [makeMediaItem()],
      });

      const { results } = await service.search({ types: ['attachment'] });

      expect(results.every(r => r.providerId === 'local')).toBe(true);
      expect(engine._mockMediaManager.search).not.toHaveBeenCalled();
    });

    it('types=["media"] skips attachment search', async () => {
      const { service, engine } = makeService({
        attachments: [makeAttachment()],
        mediaItems: [makeMediaItem()],
      });

      const { results } = await service.search({ types: ['media'] });

      expect(results.every(r => r.providerId === 'media-library')).toBe(true);
      expect(engine._mockAttachmentManager.getAllAttachments).not.toHaveBeenCalled();
    });
  });

  describe('query filtering', () => {
    it('query filters attachments by filename substring (case-insensitive)', async () => {
      const { service } = makeService({
        attachments: [
          makeAttachment({ id: 'a1', filename: 'beach.jpg' }),
          makeAttachment({ id: 'a2', filename: 'mountain.jpg' }),
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
          makeAttachment({ id: 'a1', filename: 'a.jpg' }),
          makeAttachment({ id: 'a2', filename: 'b.jpg' }),
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
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('m1');
    });
  });

  describe('pagination', () => {
    it('pageSize limits results returned', async () => {
      const attachments = Array.from({ length: 20 }, (_, i) =>
        makeAttachment({ id: `a${i}`, filename: `file${i}.jpg` })
      );
      const { service } = makeService({ attachments, noMedia: true });

      const { results } = await service.search({ types: ['attachment'], pageSize: 5 });

      expect(results.length).toBe(5);
    });

    it('offset skips earlier results', async () => {
      const attachments = Array.from({ length: 10 }, (_, i) =>
        makeAttachment({ id: `a${i}`, filename: `file${i}.jpg` })
      );
      const { service } = makeService({ attachments, noMedia: true });

      const page1 = await service.search({ types: ['attachment'], pageSize: 3, offset: 0 });
      const page2 = await service.search({ types: ['attachment'], pageSize: 3, offset: 3 });

      expect(page1.results[0].filename).toBe('file0.jpg');
      expect(page2.results[0].filename).toBe('file3.jpg');
    });

    it('total always reflects full match count regardless of page', async () => {
      const attachments = Array.from({ length: 15 }, (_, i) =>
        makeAttachment({ id: `a${i}`, filename: `file${i}.jpg` })
      );
      const { service } = makeService({ attachments, noMedia: true });

      const page = await service.search({ types: ['attachment'], pageSize: 5, offset: 10 });

      expect(page.total).toBe(15);
      expect(page.results.length).toBe(5);
    });

    it('default pageSize is 48', async () => {
      const attachments = Array.from({ length: 60 }, (_, i) =>
        makeAttachment({ id: `a${i}`, filename: `file${i}.jpg` })
      );
      const { service } = makeService({ attachments, noMedia: true });

      const { results } = await service.search({ types: ['attachment'] });

      expect(results.length).toBe(48);
    });
  });

  describe('sort', () => {
    it('sort=date asc orders media by dateCreated oldest-first', async () => {
      const items = [
        makeMediaItem({ id: 'm1', filename: 'c.jpg', metadata: { dateTimeOriginal: '2024-06-15 10:00:00' } }),
        makeMediaItem({ id: 'm2', filename: 'a.jpg', metadata: { dateTimeOriginal: '2022-01-01 00:00:00' } }),
        makeMediaItem({ id: 'm3', filename: 'b.jpg', metadata: { dateTimeOriginal: '2023-03-20 08:00:00' } }),
      ];
      const { service } = makeService({ mediaItems: items, noAttach: true });

      const { results } = await service.search({ types: ['media'], sort: 'date', order: 'asc' });

      expect(results.map(r => r.filename)).toEqual(['a.jpg', 'b.jpg', 'c.jpg']);
    });

    it('sort=date desc orders media by dateCreated newest-first', async () => {
      const items = [
        makeMediaItem({ id: 'm1', filename: 'a.jpg', metadata: { dateTimeOriginal: '2022-01-01 00:00:00' } }),
        makeMediaItem({ id: 'm2', filename: 'c.jpg', metadata: { dateTimeOriginal: '2024-06-15 10:00:00' } }),
      ];
      const { service } = makeService({ mediaItems: items, noAttach: true });

      const { results } = await service.search({ types: ['media'], sort: 'date', order: 'desc' });

      expect(results[0].filename).toBe('c.jpg');
      expect(results[1].filename).toBe('a.jpg');
    });

    it('sort=caption asc orders media by description alphabetically', async () => {
      const items = [
        makeMediaItem({ id: 'm1', filename: 'z.jpg', metadata: { caption: 'Zebra' } }),
        makeMediaItem({ id: 'm2', filename: 'a.jpg', metadata: { caption: 'Apple' } }),
        makeMediaItem({ id: 'm3', filename: 'm.jpg', metadata: { caption: 'Mango' } }),
      ];
      const { service } = makeService({ mediaItems: items, noAttach: true });

      const { results } = await service.search({ types: ['media'], sort: 'caption', order: 'asc' });

      expect(results.map(r => r.description)).toEqual(['Apple', 'Mango', 'Zebra']);
    });

    it('sort=caption falls back to filename when no description', async () => {
      const items = [
        makeMediaItem({ id: 'm1', filename: 'zebra.jpg', metadata: {} }),
        makeMediaItem({ id: 'm2', filename: 'apple.jpg', metadata: {} }),
      ];
      const { service } = makeService({ mediaItems: items, noAttach: true });

      const { results } = await service.search({ types: ['media'], sort: 'caption', order: 'asc' });

      expect(results[0].filename).toBe('apple.jpg');
      expect(results[1].filename).toBe('zebra.jpg');
    });

    it('media results expose description field from metadata.caption', async () => {
      const item = makeMediaItem({ metadata: { caption: 'A lovely sunset' } });
      const { service } = makeService({ mediaItems: [item], noAttach: true });

      const { results } = await service.search({ types: ['media'] });

      expect(results[0].description).toBe('A lovely sunset');
    });

    it('media results expose dateCreated field from metadata.dateTimeOriginal', async () => {
      const item = makeMediaItem({ metadata: { dateTimeOriginal: '2024-06-15 10:30:00' } });
      const { service } = makeService({ mediaItems: [item], noAttach: true });

      const { results } = await service.search({ types: ['media'] });

      expect(results[0].dateCreated).toBe('2024-06-15 10:30:00');
    });

    it('default sort is date asc', async () => {
      const items = [
        makeMediaItem({ id: 'm1', filename: 'c.jpg', metadata: { dateTimeOriginal: '2024-01-01 00:00:00' } }),
        makeMediaItem({ id: 'm2', filename: 'a.jpg', metadata: { dateTimeOriginal: '2022-01-01 00:00:00' } }),
      ];
      const { service } = makeService({ mediaItems: items, noAttach: true });

      const { results } = await service.search({ types: ['media'] });

      expect(results[0].filename).toBe('a.jpg');
    });
  });

  describe('graceful degradation', () => {
    it('AttachmentManager unavailable → returns only media results', async () => {
      const { service } = makeService({ noAttach: true, mediaItems: [makeMediaItem()] });

      const { results } = await service.search();

      expect(results.every(r => r.providerId === 'media-library')).toBe(true);
    });

    it('MediaManager unavailable → returns only attachment results', async () => {
      const { service } = makeService({ noMedia: true, attachments: [makeAttachment()] });

      const { results } = await service.search();

      expect(results.every(r => r.providerId === 'local')).toBe(true);
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

      expect(results.some(r => r.providerId === 'media-library')).toBe(true);
    });

    it('media search throws → returns attachment results without crashing', async () => {
      const engine = makeEngine({ attachments: [makeAttachment()] });
      engine._mockMediaManager.search.mockRejectedValue(new Error('index error'));
      const service = new AssetService(engine);

      const { results } = await service.search();

      expect(results.some(r => r.providerId === 'local')).toBe(true);
    });
  });
});
