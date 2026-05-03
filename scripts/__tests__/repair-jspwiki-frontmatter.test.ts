/**
 * Tests for #641 — JSPWiki frontmatter repair script.
 */

import { repairFrontmatter } from '../repair-jspwiki-frontmatter';
import matter from 'gray-matter';

function fm(raw: string) {
  return matter(raw).data as Record<string, unknown>;
}

describe('repairFrontmatter (#641)', () => {
  test('clean file (proper fences, valid YAML) → unchanged', () => {
    const raw = [
      '---',
      'title: Hello',
      'uuid: u1',
      'lastModified: "2026-01-01"',
      '---',
      '# Body',
      'content'
    ].join('\n');

    const out = repairFrontmatter(raw);

    expect(out.outcome).toBe('clean');
    expect(out.content).toBe(raw);
  });

  describe('Pattern 1 — missing closing fence', () => {
    test('JSPWiki-style file with no closing fence → repaired; closing --- inserted before body', () => {
      const raw = [
        '---',
        'title: SandBox',
        'uuid: 14cbf608-4283-45ad-836c-a57528203edc',
        'slug: sandbox',
        'system-category: general',
        'user-keywords:',
        'lastModified: "2026-02-17T13:29:49.835Z"',
        'importedFrom: jspwiki',
        '',
        'Hey!',
        '',
        'I am the sandbox!'
      ].join('\n');

      const out = repairFrontmatter(raw);

      expect(out.outcome).toBe('repaired-pattern1');
      const data = fm(out.content);
      expect(data.title).toBe('SandBox');
      expect(data.uuid).toBe('14cbf608-4283-45ad-836c-a57528203edc');
      expect(data.importedFrom).toBe('jspwiki');
      expect(out.content).toContain('Hey!');
      expect(out.content).toContain('I am the sandbox!');
      // Repair must produce a valid two-fence document.
      expect(out.content.match(/^---$/gm)?.length).toBe(2);
    });

    test('preserves body content with JSPWiki markup verbatim', () => {
      const raw = [
        '---',
        'title: TestPage',
        'uuid: u1',
        'lastModified: "2026-01-01"',
        '',
        '[{$pagename}] is here.',
        'See also: [LinkedPage]'
      ].join('\n');

      const out = repairFrontmatter(raw);

      expect(out.outcome).toBe('repaired-pattern1');
      // Body is everything after the inserted closing fence
      expect(matter(out.content).content).toContain('[{$pagename}] is here.');
      expect(matter(out.content).content).toContain('See also: [LinkedPage]');
    });

    test('handles a single-line body that immediately follows the YAML', () => {
      const raw = [
        '---',
        'title: Tiny',
        'uuid: u1',
        'lastModified: "2026-01-01"',
        'Hey!'
      ].join('\n');

      const out = repairFrontmatter(raw);

      // 'Hey!' isn't valid YAML so the parser breaks at that line; the prefix
      // through `lastModified` parses cleanly. Repair should succeed.
      expect(out.outcome).toBe('repaired-pattern1');
      expect(fm(out.content).title).toBe('Tiny');
      expect(matter(out.content).content.trim()).toBe('Hey!');
    });
  });

  describe('Pattern 2 — JSPWiki ALLOW markers leaked into frontmatter', () => {
    test('strips [{ALLOW ...}] lines from inside frontmatter', () => {
      const raw = [
        '---',
        'title: Journal',
        'uuid: f94f31d7-e995-4795-806c-25d8ce9e1291',
        'author-lock: true',
        'audience:',
        '  - admin',
        '  - editor',
        '',
        '[{ALLOW view Trusted}]',
        '[{ALLOW delete jim,Admin}]',
        '',
        '---',
        '# Overview',
        'body content'
      ].join('\n');

      const out = repairFrontmatter(raw);

      expect(out.outcome).toBe('repaired-pattern2');
      const data = fm(out.content);
      expect(data.title).toBe('Journal');
      expect(data['author-lock']).toBe(true);
      expect(data.audience).toEqual(['admin', 'editor']);
      // ALLOW lines must not survive in the output (anywhere)
      expect(out.content).not.toContain('[{ALLOW');
      // Body preserved
      expect(matter(out.content).content).toContain('# Overview');
      expect(matter(out.content).content).toContain('body content');
    });

    test('strips multi-line [{If ...}] plugin block (the kind that left 4 jimstest pages unrepaired)', () => {
      const raw = [
        '---',
        'title: JSW Private',
        'uuid: 3b1e7da0-e46e-4f9b-b63d-5a12cf27f3cf',
        'slug: jsw-private',
        'system-category: general',
        'lastModified: "2026-02-10T12:17:06.176Z"',
        'importedFrom: jspwiki',
        '',
        '[{ALLOW view Trusted principal }]',
        '[{ALLOW delete jim,Admin principal }]',
        '[{ALLOW edit jim,Admin}]',
        '',
        "[{If group='Admin'",
        '',
        '  <div class="alert alert-warning" role="alert">This is Protected Page!</div>}]',
        '',
        '---',
        '# Overview',
        'body content'
      ].join('\n');

      const out = repairFrontmatter(raw);

      expect(out.outcome).toBe('repaired-pattern2');
      const data = fm(out.content);
      expect(data.title).toBe('JSW Private');
      expect(data.uuid).toBe('3b1e7da0-e46e-4f9b-b63d-5a12cf27f3cf');
      // No JSPWiki markup survives anywhere
      expect(out.content).not.toContain('[{ALLOW');
      expect(out.content).not.toContain('[{If');
      expect(out.content).not.toContain('alert-warning');
      // Body preserved
      expect(matter(out.content).content).toContain('# Overview');
      expect(matter(out.content).content).toContain('body content');
    });

    test('handles ALLOW lines without surrounding blank lines', () => {
      const raw = [
        '---',
        'title: T',
        'uuid: u1',
        'lastModified: "2026-01-01"',
        'audience:',
        '  - admin',
        '[{ALLOW view Trusted}]',
        '---',
        'body'
      ].join('\n');

      const out = repairFrontmatter(raw);

      expect(out.outcome).toBe('repaired-pattern2');
      expect(out.content).not.toContain('[{ALLOW');
      expect(fm(out.content).title).toBe('T');
    });
  });

  describe('Edge cases', () => {
    test('file with no opening --- → unrepaired', () => {
      const raw = '# Just markdown\n\nNo frontmatter at all.';
      const out = repairFrontmatter(raw);
      // gray-matter accepts this (treats whole thing as content with empty data).
      expect(out.outcome).toBe('clean');
    });

    test('file with two fences but YAML broken (non-JSPWiki reason) → falls through to pattern 1, recovers valid prefix', () => {
      // The closing fence is misleading because the YAML between fences fails for a
      // reason we don't have a structured stripper for. The repair falls through to
      // Pattern 1, which scans for the longest YAML-parseable prefix — `title: T`
      // through `uuid: u1` is valid; the badline is rejected. Result: a clean
      // two-fence file with the valid keys promoted into the frontmatter and the
      // badline + original "body" both treated as the new body.
      const raw = [
        '---',
        'title: T',
        'uuid: u1',
        'badline without colon and without indentation',
        '---',
        'body'
      ].join('\n');

      const out = repairFrontmatter(raw);

      expect(out.outcome).toBe('repaired-pattern1');
      const data = fm(out.content);
      expect(data.title).toBe('T');
      expect(data.uuid).toBe('u1');
    });

    test('file with no opening --- AND no useful structure → clean (gray-matter accepts as zero-frontmatter)', () => {
      const raw = 'just some text\nno frontmatter at all\n';
      const out = repairFrontmatter(raw);
      expect(out.outcome).toBe('clean');
    });

    test('idempotent — repaired pattern-1 output runs cleanly through repair again', () => {
      const raw = [
        '---',
        'title: SandBox',
        'uuid: u1',
        'lastModified: "2026-01-01"',
        '',
        'Body content'
      ].join('\n');

      const first = repairFrontmatter(raw);
      expect(first.outcome).toBe('repaired-pattern1');

      const second = repairFrontmatter(first.content);
      expect(second.outcome).toBe('clean');
      expect(second.content).toBe(first.content);
    });

    test('idempotent — repaired pattern-2 output runs cleanly through repair again', () => {
      const raw = [
        '---',
        'title: T',
        'uuid: u1',
        'lastModified: "2026-01-01"',
        '[{ALLOW view Trusted}]',
        '---',
        'body'
      ].join('\n');

      const first = repairFrontmatter(raw);
      expect(first.outcome).toBe('repaired-pattern2');

      const second = repairFrontmatter(first.content);
      expect(second.outcome).toBe('clean');
      expect(second.content).toBe(first.content);
    });
  });
});
