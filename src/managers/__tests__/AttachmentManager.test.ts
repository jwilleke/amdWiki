/**
 * AttachmentManager tests — uninitialized and initialized paths
 *
 * @jest-environment node
 */
import AttachmentManager from '../AttachmentManager';
import type { WikiEngine } from '../../types/WikiEngine';

function makeConfigManager(overrides: Record<string, unknown> = {}) {
  return {
    getProperty: vi.fn((key: string, dv: unknown) => overrides[key] ?? dv),
    getResolvedDataPath: vi.fn((_key: string, dv: string) => dv)
  };
}

function makeEngine(configOverrides: Record<string, unknown> = {}): WikiEngine {
  const cm = makeConfigManager(configOverrides);
  return {
    getManager: vi.fn((name: string) => {
      if (name === 'ConfigurationManager') return cm;
      return null;
    })
  } as unknown as WikiEngine;
}

describe('AttachmentManager (uninitialized — no provider)', () => {
  test('provider is null before initialize()', () => {
    const mgr = new AttachmentManager(makeEngine());
    expect(mgr.provider).toBeNull();
  });

  test('getAttachmentsForPage() returns [] when no provider', async () => {
    const mgr = new AttachmentManager(makeEngine());
    expect(await mgr.getAttachmentsForPage('TestPage')).toEqual([]);
  });

  test('getAttachmentByFilename() returns null when no provider', async () => {
    const mgr = new AttachmentManager(makeEngine());
    expect(await mgr.getAttachmentByFilename('file.txt')).toBeNull();
  });

  test('getAllAttachments() returns [] when no provider', async () => {
    const mgr = new AttachmentManager(makeEngine());
    expect(await mgr.getAllAttachments()).toEqual([]);
  });

  test('attachmentExists() returns false when no provider', async () => {
    const mgr = new AttachmentManager(makeEngine());
    expect(await mgr.attachmentExists('abc')).toBe(false);
  });

  test('getAttachmentUrl() returns URL path regardless of provider', () => {
    const mgr = new AttachmentManager(makeEngine());
    expect(mgr.getAttachmentUrl('abc-123')).toBe('/attachments/abc-123');
  });

  test('getAttachment() throws when no provider', async () => {
    const mgr = new AttachmentManager(makeEngine());
    await expect(mgr.getAttachment('abc')).rejects.toThrow('not initialized');
  });

  test('getAttachmentMetadata() throws when no provider', async () => {
    const mgr = new AttachmentManager(makeEngine());
    await expect(mgr.getAttachmentMetadata('abc')).rejects.toThrow('not initialized');
  });

  test('deleteAttachment() throws when no provider', async () => {
    const mgr = new AttachmentManager(makeEngine());
    await expect(mgr.deleteAttachment('abc')).rejects.toThrow('not initialized');
  });

  test('updateAttachmentMetadata() throws when no provider', async () => {
    const mgr = new AttachmentManager(makeEngine());
    await expect(mgr.updateAttachmentMetadata('abc', {})).rejects.toThrow('not initialized');
  });

  test('getCurrentAttachmentProvider() returns null before initialize()', () => {
    const mgr = new AttachmentManager(makeEngine());
    expect(mgr.getCurrentAttachmentProvider()).toBeNull();
  });
});

describe('AttachmentManager initialize()', () => {
  test('throws when ConfigurationManager unavailable', async () => {
    const engine = { getManager: vi.fn(() => null) } as unknown as WikiEngine;
    const mgr = new AttachmentManager(engine);
    await expect(mgr.initialize()).rejects.toThrow('ConfigurationManager');
  });

  test('initializes with attachments disabled', async () => {
    const mgr = new AttachmentManager(makeEngine({ 'ngdpbase.attachment.enabled': false }));
    await expect(mgr.initialize()).resolves.not.toThrow();
    expect(mgr.provider).toBeNull();
  });
});

describe('AttachmentManager resolveAttachmentSrc()', () => {
  test('resolves external URL as-is', async () => {
    const mgr = new AttachmentManager(makeEngine({ 'ngdpbase.attachment.enabled': false }));
    await mgr.initialize();
    const result = await mgr.resolveAttachmentSrc('https://example.com/img.jpg', 'TestPage');
    expect(result?.url).toBe('https://example.com/img.jpg');
  });

  test('resolves absolute path as-is', async () => {
    const mgr = new AttachmentManager(makeEngine({ 'ngdpbase.attachment.enabled': false }));
    await mgr.initialize();
    const result = await mgr.resolveAttachmentSrc('/static/img.png', 'TestPage');
    expect(result?.url).toBe('/static/img.png');
  });

  test('returns null for unresolvable src when no provider', async () => {
    const mgr = new AttachmentManager(makeEngine({ 'ngdpbase.attachment.enabled': false }));
    await mgr.initialize();
    const result = await mgr.resolveAttachmentSrc('unknown-file.jpg', 'TestPage');
    expect(result).toBeNull();
  });
});
