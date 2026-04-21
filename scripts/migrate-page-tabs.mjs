/**
 * migrate-page-tabs.mjs
 *
 * Removes inline "More Information" + ReferringPagesPlugin blocks and
 * JSPWiki-style footnote separator blocks (--- / * [#N] - text) from
 * data/pages and templates now that Template:PageTabs handles them via the
 * Referring Pages and Footnotes tabs (#553).
 *
 * Also normalises CRLF → LF line endings.
 *
 * Usage:
 *   node scripts/migrate-page-tabs.mjs [--dry-run] [extra/dir ...]
 *
 * Extra directories are scanned in addition to the defaults.
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');
const extraDirs = process.argv.slice(2).filter(a => !a.startsWith('--'));

const SCAN_DIRS = [
  join(ROOT, 'data', 'pages'),
  join(ROOT, 'templates'),
  ...extraDirs.map(d => resolve(d)),
];

/**
 * Removes "More Information / There might be... / [{ReferringPagesPlugin...}]"
 * Handles: ## / ### / ###(no space) headings, 1 or 2 blank lines after heading.
 */
function removeMoreInformationBlock(content) {
  const re = /\n?#{1,3} ?More Information\n{1,2}There might be more information for this subject on one of the following:\n\[\{ReferringPagesPlugin[^\}]*\}\]\n?/g;
  return content.replace(re, '\n');
}

/**
 * Removes JSPWiki-style footnote separator blocks:
 *   ---
 *   * [#1] - some text
 *   * [#2] - another line
 */
function removeJspwikiFootnoteBlock(content) {
  const re = /\n-{3,4}\n(\* \[#\d+\] - .+\n)*/g;
  return content.replace(re, '\n');
}

/**
 * Removes standard markdown footnote-bullet blocks:
 *   ----
 *   * [^id] - text
 */
function removeMarkdownFootnoteBulletBlock(content) {
  const re = /\n-{3,4}\n(\* \[\^[\d\w-]+\] - .+\n)+/g;
  return content.replace(re, '\n');
}

/** Strip excess trailing newlines — keep exactly one. */
function normalizeTrailing(content) {
  return content.trimEnd() + '\n';
}

async function processFile(filePath) {
  const raw = await readFile(filePath, 'utf8');
  // Normalise CRLF → LF so all regexes work uniformly
  const original = raw.replace(/\r\n/g, '\n');
  let updated = original;

  updated = removeMoreInformationBlock(updated);
  updated = removeJspwikiFootnoteBlock(updated);
  updated = removeMarkdownFootnoteBulletBlock(updated);
  updated = normalizeTrailing(updated);

  // Count as changed if content differs OR if CRLF was normalised
  if (updated === original && !raw.includes('\r\n')) return { filePath, changed: false };

  if (!DRY_RUN) {
    await writeFile(filePath, updated, 'utf8');
  }
  return { filePath, changed: true };
}

async function main() {
  console.log(`migrate-page-tabs ${DRY_RUN ? '[DRY RUN] ' : ''}running from ${ROOT}\n`);

  let changed = 0;
  let unchanged = 0;
  let errors = 0;

  for (const dir of SCAN_DIRS) {
    let entries;
    try {
      entries = await readdir(dir);
    } catch {
      console.warn(`  [SKIP] directory not found: ${dir}`);
      continue;
    }

    const mdFiles = entries.filter(e => e.endsWith('.md'));
    console.log(`Scanning ${dir} (${mdFiles.length} .md files)...`);

    for (const name of mdFiles) {
      const filePath = join(dir, name);
      try {
        const result = await processFile(filePath);
        if (result.changed) {
          changed++;
        } else {
          unchanged++;
        }
      } catch (err) {
        errors++;
        console.error(`  [ERROR] ${filePath}: ${err.message}`);
      }
    }

    console.log(`  → ${dir}: done`);
  }

  console.log(`\nDone. Changed: ${changed}  Unchanged: ${unchanged}  Errors: ${errors}`);
  if (DRY_RUN) console.log('(dry run — no files written)');
}

main().catch(err => { console.error(err); process.exit(1); });
