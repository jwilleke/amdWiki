/**
 * URL-first filename derivation for organization JSON-LD files (#617,
 * locked decision #9).
 *
 * Domain names are guaranteed unique by registry, so URL-derived slugs are
 * the strongest uniqueness anchor for the on-disk filename. Falls back to
 * the org name when no URL is available, then to a literal `organization`
 * last-ditch default.
 *
 *   filenameFromOrg({ url: 'https://fairwayscondos.org/' })
 *     → 'fairwayscondos-org.json'
 *   filenameFromOrg({ url: 'www.fairwayscondos.org' })
 *     → 'www-fairwayscondos-org.json'
 *   filenameFromOrg({ name: 'The Fairways' })
 *     → 'the-fairways.json'
 *   filenameFromOrg({})
 *     → 'organization.json'
 */
export function filenameFromOrg({ url, name }: { url?: string; name?: string }): string {
  const fromUrl = slugifyUrl(url);
  if (fromUrl) return `${fromUrl}.json`;
  const fromName = slugifyToken(name);
  if (fromName) return `${fromName}.json`;
  return 'organization.json';
}

/** Slug a URL by stripping scheme/query/fragment and slugifying host+path. */
function slugifyUrl(url: string | undefined): string {
  if (!url) return '';
  const stripped = url
    .replace(/^[a-z][a-z0-9+.-]*:\/\//i, '')
    .split(/[?#]/)[0]
    .replace(/^\/+|\/+$/g, '');
  return slugifyToken(stripped);
}

/** Lowercase, strip diacritics, dash-separate, trim, cap at 80. */
function slugifyToken(s: string | undefined): string {
  if (!s) return '';
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
