/**
 * Unit tests for FileSystemMediaProvider.extractYear()
 *
 * Imported directly from source (not dist/) so no build step is required.
 * Uses jest.unmock() to bypass the global provider mock in jest.setup.js,
 * then mocks heavy dependencies (exiftool-vendored, sharp, fs-extra) to
 * prevent spawning child processes during the test run.
 */

jest.unmock('../FileSystemMediaProvider');

jest.mock('exiftool-vendored', () => ({
  ExifTool: class MockExifTool {
    async read() { return {}; }
    async end() {}
  },
  ExifDateTime: class ExifDateTime {
    constructor(year) { this.year = year; }
  }
}));

jest.mock('sharp', () => () => ({}));

jest.mock('fs-extra', () => ({
  pathExists: jest.fn().mockResolvedValue(false),
  readJson: jest.fn(),
  writeJson: jest.fn(),
  ensureDir: jest.fn(),
  stat: jest.fn()
}));

import FileSystemMediaProvider from '../FileSystemMediaProvider';
import { ExifDateTime } from 'exiftool-vendored';

// Helper to construct the mocked ExifDateTime (which only takes year) without TS errors
const MockExifDateTime = ExifDateTime as unknown as new (year: number) => ExifDateTime;

const minimalConfig = {
  folders: [],
  ignoreDirs: [],
  maxDepth: 0,
  indexFile: '/tmp/test-media-index.json',
  thumbnailDir: '/tmp/test-thumbs',
  thumbnailSizes: '300x300',
  metadataPriority: ['EXIF', 'IPTC', 'XMP'],
  readonly: true,
  extensions: new Set(['jpg', 'png'])
};

describe('FileSystemMediaProvider.extractYear()', () => {
  let provider;
  const mtime2026 = new Date('2026-03-12T00:00:00Z');

  beforeEach(() => {
    provider = new FileSystemMediaProvider(minimalConfig);
  });

  describe('tier 1 — EXIF date fields', () => {
    it('returns year from DateTimeOriginal ExifDateTime instance', () => {
      const tags = { DateTimeOriginal: new MockExifDateTime(2019) };
      expect(provider['extractYear'](tags, '/photos/img.jpg', mtime2026)).toBe(2019);
    });

    it('falls through to CreateDate when DateTimeOriginal is absent', () => {
      const tags = { CreateDate: new MockExifDateTime(2021) };
      expect(provider['extractYear'](tags, '/photos/img.jpg', mtime2026)).toBe(2021);
    });

    it('falls through to MediaCreateDate when DateTimeOriginal and CreateDate are absent', () => {
      const tags = { MediaCreateDate: new MockExifDateTime(2022) };
      expect(provider['extractYear'](tags, '/photos/img.jpg', mtime2026)).toBe(2022);
    });

    it('returns year from a duck-typed object (no instanceof) — guards against cross-module class mismatch', () => {
      // Plain object with .year — not an instanceof ExifDateTime.
      // This simulates the case where exiftool-vendored is loaded twice (e.g. after
      // a package update) and instanceof silently fails, causing mtime fallback.
      const plainDateLike = { year: 2024 };
      expect(provider['extractYear']({ DateTimeOriginal: plainDateLike }, '/photos/img.jpg', mtime2026)).toBe(2024);
    });

    it('accepts EXIF year 1800 (lower boundary)', () => {
      const tags = { DateTimeOriginal: new MockExifDateTime(1800) };
      expect(provider['extractYear'](tags, '/photos/img.jpg', mtime2026)).toBe(1800);
    });

    it('accepts EXIF year 2100 (upper boundary)', () => {
      const tags = { DateTimeOriginal: new MockExifDateTime(2100) };
      expect(provider['extractYear'](tags, '/photos/img.jpg', mtime2026)).toBe(2100);
    });

    it('ignores EXIF year outside valid range', () => {
      const tags = { DateTimeOriginal: new MockExifDateTime(1799) };
      // Should fall through to mtime
      expect(provider['extractYear'](tags, '/photos/img.jpg', mtime2026)).toBe(2026);
    });

    it('ignores null EXIF field', () => {
      const tags = { DateTimeOriginal: null };
      expect(provider['extractYear'](tags, '/photos/img.jpg', mtime2026)).toBe(2026);
    });
  });

  describe('tier 2 — filename prefix', () => {
    it('extracts year from YYYY- prefix', () => {
      expect(provider['extractYear']({}, '/photos/2024-06-05-birthday.jpg', mtime2026)).toBe(2024);
    });

    it('extracts year from YYYY_ prefix', () => {
      expect(provider['extractYear']({}, '/photos/2019_vacation.jpg', mtime2026)).toBe(2019);
    });

    it('ignores filename without YYYY prefix', () => {
      expect(provider['extractYear']({}, '/photos/birthday-2024.jpg', mtime2026)).toBe(2026);
    });
  });

  describe('tier 3 — directory path component', () => {
    it('extracts year from a 4-digit path segment', () => {
      expect(provider['extractYear']({}, '/media/photos/2020s/2023/01/img.jpg', mtime2026)).toBe(2023);
    });

    it('uses the deepest matching 4-digit segment', () => {
      // /media/2018/events/2022/img.jpg → should pick 2022 (deeper)
      expect(provider['extractYear']({}, '/media/2018/events/2022/img.jpg', mtime2026)).toBe(2022);
    });

    it('ignores 4-digit path segments outside valid year range', () => {
      expect(provider['extractYear']({}, '/media/1799/img.jpg', mtime2026)).toBe(2026);
    });
  });

  describe('tier 4 — mtime fallback', () => {
    it('returns mtime year when no other source is available', () => {
      expect(provider['extractYear']({}, '/photos/img.jpg', mtime2026)).toBe(2026);
    });

    it('returns correct mtime year from a different date', () => {
      const mtime2015 = new Date('2015-07-04T12:00:00Z');
      expect(provider['extractYear']({}, '/photos/img.jpg', mtime2015)).toBe(2015);
    });
  });

  describe('priority ordering', () => {
    it('EXIF takes priority over filename prefix', () => {
      const tags = { DateTimeOriginal: new MockExifDateTime(2019) };
      expect(provider['extractYear'](tags, '/photos/2024-img.jpg', mtime2026)).toBe(2019);
    });

    it('filename prefix takes priority over path component', () => {
      expect(provider['extractYear']({}, '/media/2018/2024-img.jpg', mtime2026)).toBe(2024);
    });

    it('path component takes priority over mtime', () => {
      expect(provider['extractYear']({}, '/media/2017/img.jpg', mtime2026)).toBe(2017);
    });
  });
});
