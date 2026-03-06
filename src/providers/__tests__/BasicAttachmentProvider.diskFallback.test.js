/**
 * Tests for BasicAttachmentProvider.getAttachment() disk-scan fallback.
 *
 * When an attachment file exists on disk but has no metadata record (orphaned
 * file), getAttachment() should scan the storage directory, serve the file,
 * and infer the MIME type from the extension.
 */

// Unmock BasicAttachmentProvider — the global jest.setup.js mocks it, but
// these tests need the real implementation.
jest.unmock('../BasicAttachmentProvider');

const path = require('path');
const fs = require('fs-extra');
const os = require('os');

const BasicAttachmentProvider = require('../BasicAttachmentProvider');

function makeEngine(storageDir) {
  const configManager = {
    getProperty: jest.fn().mockImplementation((key, defaultValue) => {
      if (key === 'amdwiki.attachment.maxsize') return 10485760;
      if (key === 'amdwiki.attachment.allowedtypes') return '';
      if (key === 'amdwiki.attachment.provider.basic.hashmethod') return 'sha256';
      return defaultValue;
    }),
    getResolvedDataPath: jest.fn().mockImplementation((key, defaultValue) => {
      if (key === 'amdwiki.attachment.provider.basic.storagedir') return storageDir;
      if (key === 'amdwiki.attachment.metadatafile') return path.join(storageDir, 'attachment-metadata.json');
      return defaultValue;
    }),
  };

  return {
    getManager: jest.fn().mockImplementation((name) => {
      if (name === 'ConfigurationManager') return configManager;
      return null;
    }),
  };
}

describe('BasicAttachmentProvider — getAttachment() disk-scan fallback', () => {
  let storageDir;
  let provider;

  beforeEach(async () => {
    storageDir = await fs.mkdtemp(path.join(os.tmpdir(), 'attach-test-'));
    provider = new BasicAttachmentProvider(makeEngine(storageDir));
    await provider.initialize();
  });

  afterEach(async () => {
    await fs.remove(storageDir);
  });

  it('file {id}.webp exists, no metadata → returns buffer and image/webp', async () => {
    const attachmentId = 'c92808abcdef1234'.padEnd(64, '0');
    const filePath = path.join(storageDir, `${attachmentId}.webp`);
    await fs.writeFile(filePath, Buffer.from('fake-webp-data'));

    const result = await provider.getAttachment(attachmentId);

    expect(result).not.toBeNull();
    expect(result.buffer.toString()).toBe('fake-webp-data');
    expect(result.metadata.mimeType).toBe('image/webp');
    expect(result.metadata.id).toBe(attachmentId);
    expect(result.metadata.filename).toBe(`${attachmentId}.webp`);
  });

  it('file {id}.png exists, no metadata → returns buffer and image/png', async () => {
    const attachmentId = 'deadbeef1234abcd'.padEnd(64, '0');
    const filePath = path.join(storageDir, `${attachmentId}.png`);
    await fs.writeFile(filePath, Buffer.from('fake-png-data'));

    const result = await provider.getAttachment(attachmentId);

    expect(result).not.toBeNull();
    expect(result.metadata.mimeType).toBe('image/png');
  });

  it('file {id}.pdf exists, no metadata → returns buffer and application/pdf', async () => {
    const attachmentId = 'abcdef1234567890'.padEnd(64, '0');
    const filePath = path.join(storageDir, `${attachmentId}.pdf`);
    await fs.writeFile(filePath, Buffer.from('fake-pdf-data'));

    const result = await provider.getAttachment(attachmentId);

    expect(result).not.toBeNull();
    expect(result.metadata.mimeType).toBe('application/pdf');
  });

  it('unknown extension → returns application/octet-stream', async () => {
    const attachmentId = 'ffff1234abcd5678'.padEnd(64, '0');
    const filePath = path.join(storageDir, `${attachmentId}.xyz`);
    await fs.writeFile(filePath, Buffer.from('some-data'));

    const result = await provider.getAttachment(attachmentId);

    expect(result).not.toBeNull();
    expect(result.metadata.mimeType).toBe('application/octet-stream');
  });

  it('neither metadata nor file → returns null', async () => {
    const result = await provider.getAttachment('nonexistent' + '0'.repeat(53));

    expect(result).toBeNull();
  });

  it('logs warning when serving orphaned file', async () => {
    const attachmentId = 'orphan1234abcdef'.padEnd(64, '0');
    await fs.writeFile(path.join(storageDir, `${attachmentId}.webp`), Buffer.from('data'));

    // logger is globally mocked in jest.setup.js
    const logger = require('../../utils/logger');
    logger.warn.mockClear();

    await provider.getAttachment(attachmentId);

    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('orphaned')
    );
  });
});
