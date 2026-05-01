import { describe, test, expect } from 'vitest';
import { filenameFromOrg } from '../orgFilename';

describe('filenameFromOrg (#617, locked decision #9)', () => {
  test('URL with https scheme — strips scheme, slugs host', () => {
    expect(filenameFromOrg({ url: 'https://fairwayscondos.org/' }))
      .toBe('fairwayscondos-org.json');
  });

  test('URL with http scheme — strips scheme, slugs host', () => {
    expect(filenameFromOrg({ url: 'http://example.com' }))
      .toBe('example-com.json');
  });

  test('URL without scheme — slugs as-is', () => {
    expect(filenameFromOrg({ url: 'www.fairwayscondos.org' }))
      .toBe('www-fairwayscondos-org.json');
  });

  test('URL with port and path — port and path retained in slug', () => {
    expect(filenameFromOrg({ url: 'http://internal.example.com:8080/orgs/acme' }))
      .toBe('internal-example-com-8080-orgs-acme.json');
  });

  test('URL with query and fragment — query/fragment dropped before slugifying', () => {
    expect(filenameFromOrg({ url: 'https://example.com/?ref=abc#section' }))
      .toBe('example-com.json');
  });

  test('URL absent, name present — name slug', () => {
    expect(filenameFromOrg({ name: 'The Fairways' }))
      .toBe('the-fairways.json');
  });

  test('URL slugifies to empty (just punctuation), name present — falls back to name', () => {
    expect(filenameFromOrg({ url: '://', name: 'Acme Corporation' }))
      .toBe('acme-corporation.json');
  });

  test('URL and name both empty — last-ditch literal', () => {
    expect(filenameFromOrg({})).toBe('organization.json');
  });

  test('URL and name both punctuation only — last-ditch literal', () => {
    expect(filenameFromOrg({ url: '!!!', name: '...' })).toBe('organization.json');
  });

  test('Unicode diacritics in name — stripped', () => {
    expect(filenameFromOrg({ name: 'Café Société' }))
      .toBe('cafe-societe.json');
  });

  test('Slug capped at 80 characters', () => {
    const long = 'a'.repeat(120);
    const result = filenameFromOrg({ name: long });
    // 80-char slug + ".json" = 85 chars
    expect(result).toHaveLength(85);
    expect(result.endsWith('.json')).toBe(true);
  });

  test('URL with trailing slashes only — trims', () => {
    expect(filenameFromOrg({ url: 'https://example.com/////' }))
      .toBe('example-com.json');
  });

  test('URL with mixed case — lowercased', () => {
    expect(filenameFromOrg({ url: 'HTTPS://Example.COM/' }))
      .toBe('example-com.json');
  });
});
