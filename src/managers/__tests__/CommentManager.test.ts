/**
 * CommentManager tests
 *
 * Covers:
 * - initialize() when enabled / disabled via config
 * - isEnabled() returns correct flag
 * - getComments() returns [] for missing directory
 * - getComments() returns non-deleted comments sorted by createdAt
 * - getComments() skips deleted and corrupt files
 * - addComment() creates file and returns comment
 * - deleteComment() marks comment deleted, returns true
 * - deleteComment() returns false for missing comment
 * - getComment() returns comment or null
 *
 * @jest-environment node
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import CommentManager from '../CommentManager';
import type { WikiEngine } from '../../types/WikiEngine';

let tmpDir: string;

const mockConfigManager = {
  getProperty: vi.fn((key: string, defaultValue: unknown) => defaultValue),
  getResolvedDataPath: vi.fn((_key: string, _default: string) => tmpDir)
};

const mockEngine = {
  getManager: vi.fn((name: string) => {
    if (name === 'ConfigurationManager') return mockConfigManager;
    return null;
  })
} as unknown as WikiEngine;

describe('CommentManager', () => {
  let cm: CommentManager;

  beforeEach(async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'comment-test-'));
    mockConfigManager.getResolvedDataPath.mockImplementation(() => tmpDir);
    mockConfigManager.getProperty.mockImplementation((key: string, defaultValue: unknown) => {
      if (key === 'ngdpbase.comments.allow') return true;
      return defaultValue;
    });
    cm = new CommentManager(mockEngine);
    await cm.initialize();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('initialize() and isEnabled()', () => {
    test('enabled by default', () => {
      expect(cm.isEnabled()).toBe(true);
    });

    test('disabled when config returns false', async () => {
      const disabledDir = fs.mkdtempSync(path.join(os.tmpdir(), 'comment-disabled-'));
      try {
        const disabledCfg = {
          getProperty: vi.fn((key: string, dv: unknown) => key === 'ngdpbase.comments.allow' ? false : dv),
          getResolvedDataPath: vi.fn(() => disabledDir)
        };
        const eng = { getManager: vi.fn(() => disabledCfg) } as unknown as WikiEngine;
        const disabledCm = new CommentManager(eng);
        await disabledCm.initialize();
        expect(disabledCm.isEnabled()).toBe(false);
      } finally {
        fs.rmSync(disabledDir, { recursive: true, force: true });
      }
    });
  });

  describe('getComments()', () => {
    test('returns empty array when page directory does not exist', async () => {
      const result = await cm.getComments('nonexistent-uuid');
      expect(result).toEqual([]);
    });

    test('returns comments sorted by createdAt', async () => {
      const uuid = 'page-001';
      const dir = path.join(tmpDir, uuid);
      fs.mkdirSync(dir, { recursive: true });

      const c1 = { id: 'c1', pageUuid: uuid, author: 'alice', authorDisplayName: 'Alice', content: 'First', createdAt: '2026-01-01T10:00:00Z' };
      const c2 = { id: 'c2', pageUuid: uuid, author: 'bob', authorDisplayName: 'Bob', content: 'Second', createdAt: '2026-01-02T10:00:00Z' };
      fs.writeFileSync(path.join(dir, 'c2.json'), JSON.stringify(c2));
      fs.writeFileSync(path.join(dir, 'c1.json'), JSON.stringify(c1));

      const result = await cm.getComments(uuid);
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe('c1');
      expect(result[1]?.id).toBe('c2');
    });

    test('excludes deleted comments', async () => {
      const uuid = 'page-002';
      const dir = path.join(tmpDir, uuid);
      fs.mkdirSync(dir, { recursive: true });

      const deleted = { id: 'c1', pageUuid: uuid, author: 'a', authorDisplayName: 'A', content: 'Gone', createdAt: '2026-01-01T00:00:00Z', deleted: true };
      const active = { id: 'c2', pageUuid: uuid, author: 'b', authorDisplayName: 'B', content: 'Here', createdAt: '2026-01-01T01:00:00Z' };
      fs.writeFileSync(path.join(dir, 'c1.json'), JSON.stringify(deleted));
      fs.writeFileSync(path.join(dir, 'c2.json'), JSON.stringify(active));

      const result = await cm.getComments(uuid);
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('c2');
    });

    test('skips corrupt JSON files', async () => {
      const uuid = 'page-003';
      const dir = path.join(tmpDir, uuid);
      fs.mkdirSync(dir, { recursive: true });

      fs.writeFileSync(path.join(dir, 'bad.json'), '{not valid json}');
      const good = { id: 'g1', pageUuid: uuid, author: 'a', authorDisplayName: 'A', content: 'OK', createdAt: '2026-01-01T00:00:00Z' };
      fs.writeFileSync(path.join(dir, 'g1.json'), JSON.stringify(good));

      const result = await cm.getComments(uuid);
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('g1');
    });
  });

  describe('addComment()', () => {
    test('creates a comment and returns it', async () => {
      const result = await cm.addComment('page-010', 'alice', 'Alice A', 'Hello world');
      expect(result.id).toBeTruthy();
      expect(result.author).toBe('alice');
      expect(result.authorDisplayName).toBe('Alice A');
      expect(result.content).toBe('Hello world');
      expect(result.pageUuid).toBe('page-010');
      expect(typeof result.createdAt).toBe('string');
    });

    test('persists comment to disk', async () => {
      const c = await cm.addComment('page-011', 'bob', 'Bob B', 'Persisted');
      const filePath = path.join(tmpDir, 'page-011', `${c.id}.json`);
      expect(fs.existsSync(filePath)).toBe(true);
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as { content: string };
      expect(raw.content).toBe('Persisted');
    });

    test('comment is retrievable via getComments', async () => {
      await cm.addComment('page-012', 'carol', 'Carol C', 'Retrievable');
      const comments = await cm.getComments('page-012');
      expect(comments).toHaveLength(1);
      expect(comments[0]?.content).toBe('Retrievable');
    });
  });

  describe('deleteComment()', () => {
    test('returns false for non-existent comment', async () => {
      const result = await cm.deleteComment('page-020', 'no-such-id', 'admin');
      expect(result).toBe(false);
    });

    test('marks comment as deleted and returns true', async () => {
      const c = await cm.addComment('page-021', 'dave', 'Dave D', 'To be deleted');
      const result = await cm.deleteComment('page-021', c.id, 'admin');
      expect(result).toBe(true);

      // Should no longer appear in getComments
      const comments = await cm.getComments('page-021');
      expect(comments).toHaveLength(0);
    });

    test('sets deletedBy and deletedAt fields', async () => {
      const c = await cm.addComment('page-022', 'eve', 'Eve E', 'Delete me');
      await cm.deleteComment('page-022', c.id, 'admin-user');

      const filePath = path.join(tmpDir, 'page-022', `${c.id}.json`);
      const saved = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as { deleted: boolean; deletedBy: string; deletedAt: string };
      expect(saved.deleted).toBe(true);
      expect(saved.deletedBy).toBe('admin-user');
      expect(typeof saved.deletedAt).toBe('string');
    });
  });

  describe('getComment()', () => {
    test('returns null for non-existent comment', async () => {
      const result = await cm.getComment('page-030', 'no-such-id');
      expect(result).toBeNull();
    });

    test('returns comment by id', async () => {
      const c = await cm.addComment('page-031', 'frank', 'Frank F', 'Find me');
      const found = await cm.getComment('page-031', c.id);
      expect(found).not.toBeNull();
      expect(found?.content).toBe('Find me');
    });
  });
});
