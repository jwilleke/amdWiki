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
 * Handles:
 *   - JSPWiki !! heading (may be inline at end of a content line)
 *   - Markdown ## / ### headings
 *   - Orphaned blocks where heading was already stripped (no heading prefix)
 *   - Trailing spaces on heading and "following:" lines
 *   - Typo variant "subjt" instead of "subject"
 */
function removeMoreInformationBlock(content) {
  // With heading prefix (!! or ##)
  const withHeading = /(?:!!|#{1,3}) ?More Information *\n{1,2}There might be more information for this subj(?:ect|t) on one of the following: *\n\[\{ReferringPagesPlugin[^\}]*\}\] *\n?/g;
  // Orphaned block — heading already stripped, only the boilerplate lines remain
  const orphaned = /\nThere might be more information for this subj(?:ect|t) on one of the following: *\n\[\{ReferringPagesPlugin[^\}]*\}\] *\n?/g;
  return content.replace(withHeading, '\n').replace(orphaned, '\n');
}

/**
 * Removes the --- HR separator before JSPWiki-style footnote bullets,
 * but KEEPS the bullet lines so FootnotesPlugin can read them from raw content.
 *
 *   ---            ← removed
 *   * [#1] - text  ← kept
 */
function removeJspwikiFootnoteSeparator(content) {
  // + (one-or-more) ensures bare --- separators (frontmatter closer) are NOT matched
  const re = /\n-{3,4}\n(?=(\* \[#\d+\] - ))/g;
  return content.replace(re, '\n');
}

/**
 * Removes the --- HR separator before markdown footnote-bullet blocks,
 * but KEEPS the bullet lines.
 *
 *   ----           ← removed
 *   * [^id] - text ← kept
 */
function removeMarkdownFootnoteSeparator(content) {
  const re = /\n-{3,4}\n(?=(\* \[\^[\d\w-]+\] - ))/g;
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
  updated = removeJspwikiFootnoteSeparator(updated);
  updated = removeMarkdownFootnoteSeparator(updated);
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
