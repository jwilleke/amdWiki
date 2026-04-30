/**
 * Unit tests for the per-pattern markup-syntax rules introduced in #616.
 *
 * Each rule covers one specific malformation, has its own message, severity,
 * and reports the 1-indexed line/column of the offending position so the
 * editor can pin the cursor.
 */

import { describe, test, expect, beforeEach } from 'vitest';
import ValidationFilter from '../ValidationFilter';

async function makeFilter(): Promise<ValidationFilter> {
  const filter = new ValidationFilter();
  // Initialize with no engine — picks up the hardcoded defaults which set
  // validateMarkup: true, registering the markup-syntax rule family.
  await filter.initialize({});
  return filter;
}

describe('ValidationFilter markup-syntax rules (#616)', () => {
  let filter: ValidationFilter;

  beforeEach(async () => {
    filter = await makeFilter();
  });

  // ── unclosedPlugin (severity: error) ───────────────────────────────────────

  test('unclosedPlugin trips on `[{Plugin` with no closing `}]`', async () => {
    const errors = await filter.collectErrors('hello\n[{TotalPagesPlugin');
    const e = errors.find(x => x.rule === 'unclosedPlugin');
    expect(e).toBeDefined();
    expect(e?.severity).toBe('error');
    expect(e?.message).toMatch(/Unclosed plugin syntax/);
    expect(e?.line).toBe(2);
    expect(e?.column).toBe(1);
  });

  test('unclosedPlugin does not trip when the plugin is closed', async () => {
    const errors = await filter.collectErrors('[{TotalPagesPlugin}]');
    expect(errors.find(x => x.rule === 'unclosedPlugin')).toBeUndefined();
  });

  // ── unclosedWikiTag (severity: error) ──────────────────────────────────────

  test('unclosedWikiTag trips on `<wiki:Include page="X"` with no closing', async () => {
    const errors = await filter.collectErrors('<wiki:Include page="X"');
    const e = errors.find(x => x.rule === 'unclosedWikiTag');
    expect(e).toBeDefined();
    expect(e?.severity).toBe('error');
    expect(e?.message).toMatch(/Unclosed JSPWiki tag/);
  });

  test('unclosedWikiTag does not trip on `<wiki:Include />`', async () => {
    const errors = await filter.collectErrors('<wiki:Include page="X" />');
    expect(errors.find(x => x.rule === 'unclosedWikiTag')).toBeUndefined();
  });

  // ── unclosedMarkdownLink (severity: error) ─────────────────────────────────

  test('unclosedMarkdownLink trips on `[text](url` with no `)`', async () => {
    const errors = await filter.collectErrors('see [docs](https://example.com');
    const e = errors.find(x => x.rule === 'unclosedMarkdownLink');
    expect(e).toBeDefined();
    expect(e?.severity).toBe('error');
    expect(e?.message).toMatch(/Unclosed Markdown link/);
  });

  test('unclosedMarkdownLink does not trip on a properly closed link', async () => {
    const errors = await filter.collectErrors('see [docs](https://example.com)');
    expect(errors.find(x => x.rule === 'unclosedMarkdownLink')).toBeUndefined();
  });

  // ── unclosedCodeBlock (severity: warning, NOT in collectErrors) ────────────

  test('unclosedCodeBlock is severity:warning — not returned by collectErrors', async () => {
    const errors = await filter.collectErrors('```js\nlet x = 1;');
    expect(errors.find(x => x.rule === 'unclosedCodeBlock')).toBeUndefined();
  });

  // ── multiple rules trip independently ──────────────────────────────────────

  test('multiple distinct violations each show up with their own rule + position', async () => {
    const content = [
      '[{Plugin1',                       // line 1: unclosedPlugin
      'see [docs](https://example.com',  // line 2: unclosedMarkdownLink
      '<wiki:Include page="X"'           // line 3: unclosedWikiTag
    ].join('\n');
    const errors = await filter.collectErrors(content);
    const rules = errors.map(e => e.rule).sort();
    expect(rules).toContain('unclosedPlugin');
    expect(rules).toContain('unclosedMarkdownLink');
    expect(rules).toContain('unclosedWikiTag');
    // Check that each error has a line number
    for (const e of errors) {
      expect(typeof e.line).toBe('number');
    }
  });

  // ── clean content produces no errors ───────────────────────────────────────

  test('clean content produces zero errors', async () => {
    const content = [
      '# A page',
      '',
      'Some content with [a link](https://example.com) and [{TotalPagesPlugin}].',
      '',
      '<wiki:Include page="Header" />',
      '',
      '```js',
      'let x = 1;',
      '```'
    ].join('\n');
    const errors = await filter.collectErrors(content);
    expect(errors).toEqual([]);
  });
});
