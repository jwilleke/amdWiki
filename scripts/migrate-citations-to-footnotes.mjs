#!/usr/bin/env node
/**
 * migrate-citations-to-footnotes.mjs
 *
 * Converts bare-URL citation lines under a "Citations:" heading into the
 * canonical footnote-bullet format that migrate-footnotes-to-sidecar.mjs
 * and FootnotesPlugin understand:
 *
 *   Before (no bullet):   [^1] https://en.wikipedia.org/wiki/Rocket_engine
 *   Before (has bullet):  * [^1] https://en.wikipedia.org/wiki/Rocket_engine
 *   After:                * [^1] - [Rocket engine|https://en.wikipedia.org/wiki/Rocket_engine]
 *
 * Display text is derived from the URL path:
 *   - Last non-empty path segment, URL-decoded
 *   - Trailing numeric IDs stripped (cell-metabolism-14026182 → cell-metabolism)
 *   - Hyphens/underscores → spaces, then title-cased
 *   - If the segment looks like a database ID (PMC6441977, NBK9957) the parent
 *     segment is used instead; if none found, the hostname domain is used
 *
 * Usage:
 *   node scripts/migrate-citations-to-footnotes.mjs [--dry-run] [dir ...]
 *
 * Default dir: /Volumes/hd2A/jimstest-wiki/data/pages
 *
 * Run migrate-footnotes-to-sidecar.mjs afterwards to move the bullet lines
 * into sidecar JSON files.
 */

import { join, resolve } from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const fs = require('fs-extra');

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DRY_RUN = process.argv.includes('--dry-run');
const args = process.argv.slice(2).filter(a => !a.startsWith('--'));

const SCAN_DIRS = args.length > 0
  ? args.map(d => resolve(d))
  : ['/Volumes/hd2A/jimstest-wiki/data/pages'];

/**
 * Matches a citation line in either form:
 *   [^N] https://...
 *   * [^N] https://...
 * Captures: (N, url)
 */
const CITATION_RE = /^(\* )?\[\^(\d+)\] (https?:\/\/\S+)$/m;
const CITATION_RE_GLOBAL = /^(\* )?\[\^(\d+)\] (https?:\/\/\S+)$/mg;

// ── Display-text derivation ───────────────────────────────────────────────────

function toTitleCase(str) {
  return str
    .replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .trim();
}

/** Generic path words that carry no useful display meaning */
const GENERIC_SEGMENTS = new Set([
  'articles', 'article', 'docs', 'doc', 'page', 'pages', 'post', 'posts',
  'full', 'view', 'content', 'news', 'blog', 'blogs', 'entry', 'read',
  'detail', 'details', 'item', 'items', 'topic', 'topics', 'section',
  'articlelanding', 'abstract', 'html', 'pdf', 'en', 'us', 'www'
]);

/**
 * True if a segment looks like a bare database / article ID with no
 * human-readable words.  Examples: PMC6441977, NBK9957, 14026182,
 * s41598-018-31707-9 (nature DOI slug), d3tb02552g (RSC DOI)
 */
function looksLikeId(seg) {
  // Pure numeric
  if (/^\d{4,}$/.test(seg)) return true;
  // Known DB prefixes: PMC, NBK, etc.
  if (/^[A-Z]{1,5}\d{4,}$/i.test(seg)) return true;
  // DOI-style slugs: lots of digits mixed with letters and dashes
  // (ratio of digits+special chars > 50% of total length)
  const wordChars = (seg.match(/[a-z]/gi) || []).length;
  const digitChars = (seg.match(/\d/g) || []).length;
  if (digitChars > 0 && digitChars >= wordChars) return true;
  return false;
}

/** Derive a human-readable domain label from the hostname */
function domainLabel(hostname) {
  // Strip www. and take first two meaningful parts: ncbi.nlm → ncbi, pmc.ncbi → pmc-ncbi
  const parts = hostname.replace(/^www\./, '').split('.');
  // Drop generic TLD (com, org, edu, gov, net, io)
  const filtered = parts.filter(p => !['com','org','edu','gov','net','io','ac','co','uk'].includes(p));
  return toTitleCase((filtered.slice(0, 2).join(' ')));
}

function displayTextFromUrl(rawUrl) {
  // Strip trailing fragment/query before parsing
  const url = rawUrl.replace(/[#?].*$/, '');
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return rawUrl;
  }

  const segments = parsed.pathname
    .split('/')
    .map(s => {
      try { return decodeURIComponent(s); } catch { return s; }
    })
    .map(s => s.replace(/\.[a-z]{2,5}$/i, '').trim()) // strip extension
    .filter(Boolean);

  if (segments.length === 0) {
    return domainLabel(parsed.hostname);
  }

  // Walk segments from the end, skipping IDs and generic words
  let seg = '';
  for (let i = segments.length - 1; i >= 0; i--) {
    const candidate = segments[i].replace(/-\d+$/, ''); // strip trailing CMS number
    if (!looksLikeId(candidate) && !GENERIC_SEGMENTS.has(candidate.toLowerCase()) && candidate.length >= 3) {
      seg = candidate;
      break;
    }
  }

  if (!seg) {
    return domainLabel(parsed.hostname);
  }

  // Hyphens/underscores → spaces → title case
  return toTitleCase(seg.replace(/[-_]/g, ' '));
}

// ── Content transformation ────────────────────────────────────────────────────

function processContent(content) {
  let changed = false;

  const updated = content.replace(CITATION_RE_GLOBAL, (_match, _bullet, n, url) => {
    changed = true;
    const display = displayTextFromUrl(url);
    return `* [^${n}] - [${display}|${url}]`;
  });

  return changed ? updated : null;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`migrate-citations-to-footnotes ${DRY_RUN ? '[DRY RUN] ' : ''}running\n`);

  let total = 0, changed = 0, errors = 0;

  for (const dir of SCAN_DIRS) {
    let entries;
    try { entries = await fs.readdir(dir); }
    catch { console.warn(`  [SKIP] not found: ${dir}`); continue; }

    const mdFiles = entries.filter(e => e.endsWith('.md'));
    console.log(`Scanning ${dir} (${mdFiles.length} .md files)...`);

    for (const name of mdFiles) {
      const filePath = join(dir, name);
      total++;
      try {
        const raw = await fs.readFile(filePath, 'utf8');
        const content = raw.replace(/\r\n/g, '\n');

        // Quick skip: must contain a bare [^N] url line (no dash separator)
        if (!CITATION_RE.test(content)) continue;

        const updated = processContent(content);
        if (!updated) continue;

        changed++;
        if (DRY_RUN) {
          // Show what would change
          const before = content.match(CITATION_RE_GLOBAL) ?? [];
          const after = (updated.match(/^\* \[\^\d+\] - \[.+\|https?:\/\/.+\]$/mg) ?? [])
            .slice(0, before.length);
          console.log(`  [WOULD CHANGE] ${name}`);
          before.forEach((line, i) => {
            console.log(`    - ${line.trim()}`);
            if (after[i]) console.log(`    + ${after[i].trim()}`);
          });
        } else {
          await fs.writeFile(filePath, updated, 'utf8');
          console.log(`  [CHANGED] ${name}`);
        }
      } catch (err) {
        errors++;
        console.error(`  [ERROR] ${name}: ${err.message}`);
      }
    }
    console.log('  → done');
  }

  console.log(`\nTotal files scanned : ${total}`);
  console.log(`Files changed       : ${changed}`);
  console.log(`Errors              : ${errors}`);
  if (DRY_RUN) {
    console.log('\n(dry run — no files written)');
    console.log('\nRe-run without --dry-run to apply, then run:');
    console.log('  node scripts/migrate-footnotes-to-sidecar.mjs');
  } else {
    console.log('\nDone. Run migrate-footnotes-to-sidecar.mjs to extract bullets into sidecar JSON.');
  }
}

main().catch(err => { console.error(err); process.exit(1); });
