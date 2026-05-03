/**
 * Tests for #639 Slice D — Private field migration script.
 *
 * Tests the pure transformFrontmatter() function so we don't need to touch the
 * filesystem. Each case asserts both the outcome label and (where relevant) the
 * shape of the resulting frontmatter.
 */

import { transformFrontmatter } from '../migrate-private-field';
import matter from 'gray-matter';

function fm(raw: string) {
  return matter(raw).data as Record<string, unknown>;
}

describe('transformFrontmatter (#639 Slice D)', () => {
  test('legacy keyword-only → migrated; private:true set, keyword stripped, body preserved', () => {
    const raw = [
      '---',
      'title: Secret',
      'uuid: u1',
      'lastModified: "2026-01-01"',
      'author: alice',
      'user-keywords:',
      '  - private',
      '  - draft',
      '---',
      '',
      '# Hello',
      'body content'
    ].join('\n');

    const out = transformFrontmatter(raw);

    expect(out.outcome).toBe('migrated');
    const data = fm(out.content);
    expect(data.private).toBe(true);
    expect(data['user-keywords']).toEqual(['draft']);
    expect(out.content).toContain('# Hello');
    expect(out.content).toContain('body content');
  });

  test('keyword-only with no other keywords → user-keywords field is dropped entirely', () => {
    const raw = [
      '---',
      'title: Secret',
      'uuid: u1',
      'lastModified: "2026-01-01"',
      'author: alice',
      'user-keywords:',
      '  - private',
      '---',
      'body'
    ].join('\n');

    const out = transformFrontmatter(raw);

    expect(out.outcome).toBe('migrated');
    const data = fm(out.content);
    expect(data.private).toBe(true);
    expect(data['user-keywords']).toBeUndefined();
  });

  test('already migrated (top-level private:true, no keyword) → already; content unchanged', () => {
    const raw = [
      '---',
      'title: Secret',
      'uuid: u1',
      'lastModified: "2026-01-01"',
      'author: alice',
      'private: true',
      'user-keywords:',
      '  - draft',
      '---',
      'body'
    ].join('\n');

    const out = transformFrontmatter(raw);

    expect(out.outcome).toBe('already');
    expect(out.content).toBe(raw); // unchanged
  });

  test('non-private (no signals) → non-private; content unchanged', () => {
    const raw = [
      '---',
      'title: Public',
      'uuid: u1',
      'lastModified: "2026-01-01"',
      'author: alice',
      'user-keywords:',
      '  - draft',
      '---',
      'body'
    ].join('\n');

    const out = transformFrontmatter(raw);

    expect(out.outcome).toBe('non-private');
    expect(out.content).toBe(raw);
  });

  test('both signals present (transitional state from manual edit) → migrated; keyword stripped', () => {
    const raw = [
      '---',
      'title: Secret',
      'uuid: u1',
      'lastModified: "2026-01-01"',
      'author: alice',
      'private: true',
      'user-keywords:',
      '  - private',
      '  - wip',
      '---',
      'body'
    ].join('\n');

    const out = transformFrontmatter(raw);

    expect(out.outcome).toBe('migrated');
    const data = fm(out.content);
    expect(data.private).toBe(true);
    expect(data['user-keywords']).toEqual(['wip']);
  });

  test('case-insensitive keyword match (Private, PRIVATE)', () => {
    const raw = [
      '---',
      'title: Secret',
      'uuid: u1',
      'lastModified: "2026-01-01"',
      'author: alice',
      'user-keywords:',
      '  - Private',
      '  - PRIVATE',
      '  - draft',
      '---',
      'body'
    ].join('\n');

    const out = transformFrontmatter(raw);

    expect(out.outcome).toBe('migrated');
    const data = fm(out.content);
    expect(data.private).toBe(true);
    expect(data['user-keywords']).toEqual(['draft']);
  });

  test('no user-keywords field at all → non-private (idempotent on bare pages)', () => {
    const raw = [
      '---',
      'title: Bare',
      'uuid: u1',
      'lastModified: "2026-01-01"',
      '---',
      'body'
    ].join('\n');

    const out = transformFrontmatter(raw);

    expect(out.outcome).toBe('non-private');
    expect(out.content).toBe(raw);
  });

  test('idempotent — running twice on a migrated file is a no-op the second time', () => {
    const raw = [
      '---',
      'title: Secret',
      'uuid: u1',
      'lastModified: "2026-01-01"',
      'author: alice',
      'user-keywords:',
      '  - private',
      '---',
      'body'
    ].join('\n');

    const first = transformFrontmatter(raw);
    expect(first.outcome).toBe('migrated');

    const second = transformFrontmatter(first.content);
    expect(second.outcome).toBe('already');
    expect(second.content).toBe(first.content);
  });
});
