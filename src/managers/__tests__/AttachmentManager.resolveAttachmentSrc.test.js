/**
 * Unit tests for AttachmentManager.resolveAttachmentSrc()
 *
 * Tests the canonical resolution method used by all plugins to turn a raw
 * src value into { url, mimeType } or null.
 *
 * Resolution order:
 *   1. External URL (http:// / https://) → passthrough, mimeType: ''
 *   2. Absolute path (/) → passthrough, mimeType: ''
 *   3. Current-page filename lookup → { url, mimeType } from metadata
 *   4. Global filename search → { url, mimeType } from metadata
 *   5. null — not found
 */

const AttachmentManager = require('../AttachmentManager');

const mockEngine = {
  getManager: jest.fn().mockReturnValue(null),
};

function makeManager(providerMethods = {}) {
  const manager = new AttachmentManager(mockEngine);
  // Bypass initialize() — inject a mock provider directly
  manager['attachmentProvider'] = {
    getAttachmentsForPage: jest.fn().mockResolvedValue([]),
    getAttachmentByFilename: jest.fn().mockResolvedValue(null),
    ...providerMethods,
  };
  return manager;
}

describe('AttachmentManager.resolveAttachmentSrc', () => {
  describe('step 1 & 2: passthrough for URLs and absolute paths', () => {
    it('external https:// URL → { url, mimeType: "" }, no provider calls', async () => {
      const manager = makeManager();
      const result = await manager.resolveAttachmentSrc('https://example.com/img.jpg', 'MyPage');

      expect(result).toEqual({ url: 'https://example.com/img.jpg', mimeType: '' });
      expect(manager['attachmentProvider'].getAttachmentsForPage).not.toHaveBeenCalled();
      expect(manager['attachmentProvider'].getAttachmentByFilename).not.toHaveBeenCalled();
    });

    it('external http:// URL → passthrough', async () => {
      const manager = makeManager();
      const result = await manager.resolveAttachmentSrc('http://example.com/img.png', 'MyPage');

      expect(result).toEqual({ url: 'http://example.com/img.png', mimeType: '' });
    });

    it('absolute path /attachments/hash → { url, mimeType: "" }, no provider calls', async () => {
      const manager = makeManager();
      const result = await manager.resolveAttachmentSrc('/attachments/abc123', 'MyPage');

      expect(result).toEqual({ url: '/attachments/abc123', mimeType: '' });
      expect(manager['attachmentProvider'].getAttachmentsForPage).not.toHaveBeenCalled();
    });

    it('absolute path /images/foo.jpg → passthrough', async () => {
      const manager = makeManager();
      const result = await manager.resolveAttachmentSrc('/images/foo.jpg', 'MyPage');

      expect(result).toEqual({ url: '/images/foo.jpg', mimeType: '' });
    });
  });

  describe('step 3: current-page attachment lookup', () => {
    it('filename found on current page → { url, mimeType } from metadata', async () => {
      const manager = makeManager({
        getAttachmentsForPage: jest.fn().mockResolvedValue([
          { name: 'photo.jpg', url: '/attachments/abc123', encodingFormat: 'image/jpeg', identifier: 'abc123' },
        ]),
        getAttachmentByFilename: jest.fn().mockResolvedValue(null),
      });

      const result = await manager.resolveAttachmentSrc('photo.jpg', 'MyPage');

      expect(result).toEqual({ url: '/attachments/abc123', mimeType: 'image/jpeg' });
      expect(manager['attachmentProvider'].getAttachmentsForPage).toHaveBeenCalledWith('MyPage');
      expect(manager['attachmentProvider'].getAttachmentByFilename).not.toHaveBeenCalled();
    });

    it('multiple page attachments — matches by exact filename', async () => {
      const manager = makeManager({
        getAttachmentsForPage: jest.fn().mockResolvedValue([
          { name: 'other.png', url: '/attachments/other', encodingFormat: 'image/png', identifier: 'other' },
          { name: 'photo.jpg', url: '/attachments/abc123', encodingFormat: 'image/jpeg', identifier: 'abc123' },
        ]),
      });

      const result = await manager.resolveAttachmentSrc('photo.jpg', 'MyPage');

      expect(result).toEqual({ url: '/attachments/abc123', mimeType: 'image/jpeg' });
    });
  });

  describe('step 4: global filename search', () => {
    it('filename not on page but found globally → { url, mimeType }', async () => {
      const manager = makeManager({
        getAttachmentsForPage: jest.fn().mockResolvedValue([]),
        getAttachmentByFilename: jest.fn().mockResolvedValue({
          name: 'global.png',
          url: '/attachments/global123',
          encodingFormat: 'image/png',
          identifier: 'global123',
        }),
      });

      const result = await manager.resolveAttachmentSrc('global.png', 'MyPage');

      expect(result).toEqual({ url: '/attachments/global123', mimeType: 'image/png' });
      expect(manager['attachmentProvider'].getAttachmentByFilename).toHaveBeenCalledWith('global.png');
    });
  });

  describe('step 5: not found → null', () => {
    it('filename not found anywhere → null', async () => {
      const manager = makeManager({
        getAttachmentsForPage: jest.fn().mockResolvedValue([]),
        getAttachmentByFilename: jest.fn().mockResolvedValue(null),
      });

      const result = await manager.resolveAttachmentSrc('missing.jpg', 'MyPage');

      expect(result).toBeNull();
    });

    it('no attachment provider → null for filenames', async () => {
      const manager = new AttachmentManager(mockEngine);
      // Leave attachmentProvider as null (not initialized)

      const result = await manager.resolveAttachmentSrc('photo.jpg', 'MyPage');

      expect(result).toBeNull();
    });
  });

  describe('no attachment provider — URLs/paths still passthrough', () => {
    it('external URL with no provider → still returns { url, mimeType: "" }', async () => {
      const manager = new AttachmentManager(mockEngine);

      const result = await manager.resolveAttachmentSrc('https://example.com/img.jpg', 'MyPage');

      expect(result).toEqual({ url: 'https://example.com/img.jpg', mimeType: '' });
    });
  });

  describe('empty/null src', () => {
    it('empty string → null', async () => {
      const manager = makeManager();
      const result = await manager.resolveAttachmentSrc('', 'MyPage');

      expect(result).toBeNull();
    });
  });

  describe('provider errors are swallowed (resilience)', () => {
    it('getAttachmentsForPage throws → falls through to global search', async () => {
      const manager = makeManager({
        getAttachmentsForPage: jest.fn().mockRejectedValue(new Error('DB error')),
        getAttachmentByFilename: jest.fn().mockResolvedValue({
          name: 'photo.jpg',
          url: '/attachments/fallback',
          encodingFormat: 'image/jpeg',
          identifier: 'fallback',
        }),
      });

      const result = await manager.resolveAttachmentSrc('photo.jpg', 'MyPage');

      expect(result).toEqual({ url: '/attachments/fallback', mimeType: 'image/jpeg' });
    });

    it('both lookups throw → null', async () => {
      const manager = makeManager({
        getAttachmentsForPage: jest.fn().mockRejectedValue(new Error('error')),
        getAttachmentByFilename: jest.fn().mockRejectedValue(new Error('error')),
      });

      const result = await manager.resolveAttachmentSrc('photo.jpg', 'MyPage');

      expect(result).toBeNull();
    });
  });
});
