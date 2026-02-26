#!/usr/bin/env node
/**
 * check-duplicate-pages.js
 *
 * Scans all wiki page files for duplicate title, slug, or UUID values.
 * Checks both the live pages directory ($SLOW_STORAGE/pages) and required-pages/.
 *
 * A required-page and its live copy share the same UUID by design — that is NOT
 * a duplicate. Only entries with the same value under a DIFFERENT UUID are flagged.
 *
 * Usage:
 *   node scripts/check-duplicate-pages.js
 *   node scripts/check-duplicate-pages.js --pages-dir /path/to/pages
 *   node scripts/check-duplicate-pages.js --required-only
 *
 * Environment variables (from $FAST_STORAGE/.env, sourced by server.sh):
 *   SLOW_STORAGE  — path to bulk-content store; pages live at $SLOW_STORAGE/pages
 *                   Default: ./data
 *
 * Exit codes:
 *   0 = no duplicates found
 *   1 = duplicates found (or error)
 */

'use strict';

const fs     = require('fs-extra');
const path   = require('path');
const matter = require('gray-matter');

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const args         = process.argv.slice(2);
const requiredOnly = args.includes('--required-only');

// Resolve live pages directory:
//   1. --pages-dir CLI arg
//   2. $SLOW_STORAGE/pages  (set by server.sh sourcing $FAST_STORAGE/.env)
//   3. ./data/pages          (default matching .env.example)
function resolvePagesDir() {
  const idx = args.indexOf('--pages-dir');
  if (idx !== -1 && args[idx + 1]) return path.resolve(args[idx + 1]);

  const slowStorage = process.env.SLOW_STORAGE;
  if (slowStorage) return path.resolve(path.join(slowStorage, 'pages'));

  return path.resolve(path.join(__dirname, '../data/pages'));
}

const LIVE_PAGES_DIR     = requiredOnly ? null : resolvePagesDir();
const REQUIRED_PAGES_DIR = path.join(__dirname, '../required-pages');

// ---------------------------------------------------------------------------
// Scan
// ---------------------------------------------------------------------------

/**
 * Read all .md files in a directory and parse their front-matter.
 * Returns an array of { file, title, slug, uuid } objects.
 */
async function scanDir(dir, label) {
  if (!dir || !(await fs.pathExists(dir))) {
    if (dir) console.warn(`  ⚠️  Directory not found: ${dir}`);
    return [];
  }

  const files   = (await fs.readdir(dir)).filter(f => f.endsWith('.md'));
  const results = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    try {
      const raw     = await fs.readFile(filePath, 'utf8');
      const { data } = matter(raw);
      results.push({
        file:  path.join(label, file),
        title: typeof data.title === 'string' ? data.title.trim() : null,
        slug:  typeof data.slug  === 'string' ? data.slug.trim()  : null,
        uuid:  typeof data.uuid  === 'string' ? data.uuid.trim()  : null
      });
    } catch (err) {
      console.warn(`  ⚠️  Could not parse ${file}: ${err.message}`);
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Duplicate detection
// ---------------------------------------------------------------------------

/**
 * Find pages where the same field value appears under more than one distinct UUID.
 * A required-page and its live copy share the same UUID — that is expected and
 * is NOT reported as a duplicate.
 *
 * Returns an array of { value, pages[] } for each real conflict.
 */
function findDuplicates(pages, field) {
  // key: normalised field value  →  Map<uuid, page[]>
  const index = new Map();

  for (const page of pages) {
    const raw = page[field];
    if (!raw) continue;
    const key = raw.toLowerCase();
    if (!index.has(key)) index.set(key, new Map());
    const byUuid = index.get(key);
    const uuid   = (page.uuid || '').toLowerCase();
    if (!byUuid.has(uuid)) byUuid.set(uuid, []);
    byUuid.get(uuid).push(page);
  }

  const dupes = [];
  for (const [, byUuid] of index) {
    if (byUuid.size > 1) {
      // Multiple distinct UUIDs share this value — real conflict
      const allPages = [];
      for (const group of byUuid.values()) allPages.push(...group);
      dupes.push({ value: allPages[0][field], pages: allPages });
    }
  }
  return dupes.sort((a, b) => a.value.localeCompare(b.value));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('🔍 Checking for duplicate page title / slug / uuid…\n');
  if (LIVE_PAGES_DIR) {
    console.log(`  Live pages : ${LIVE_PAGES_DIR}`);
  } else {
    console.log('  Live pages : (skipped — --required-only)');
  }
  console.log(`  Required   : ${REQUIRED_PAGES_DIR}\n`);

  const [livePages, requiredPages] = await Promise.all([
    LIVE_PAGES_DIR ? scanDir(LIVE_PAGES_DIR, 'pages') : Promise.resolve([]),
    scanDir(REQUIRED_PAGES_DIR, 'required-pages')
  ]);

  const all = [...livePages, ...requiredPages];
  console.log(
    `  Scanned ${livePages.length.toLocaleString('en-US')} live + ` +
    `${requiredPages.length.toLocaleString('en-US')} required = ` +
    `${all.length.toLocaleString('en-US')} total\n`
  );

  let totalDupes = 0;

  for (const field of ['title', 'slug', 'uuid']) {
    const dupes = findDuplicates(all, field);
    if (dupes.length === 0) {
      console.log(`  ✅  ${field.padEnd(6)} — no duplicates`);
      continue;
    }

    totalDupes += dupes.length;
    console.log(`\n  ❌  ${field.toUpperCase()} — ${dupes.length} conflict(s):`);
    for (const { value, pages } of dupes) {
      console.log(`\n      "${value}"`);
      for (const p of pages) {
        console.log(`        uuid=${p.uuid || '(none)'}  ${p.file}`);
      }
    }
  }

  console.log('');

  if (totalDupes === 0) {
    console.log('✅  All clear — no duplicate titles, slugs, or UUIDs found.');
    process.exit(0);
  } else {
    console.log(`❌  Found ${totalDupes} conflict(s). Fix before deploying.`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
