/**
 * migrate-page-tabs.mjs
 *
 * Removes inline "## More Information" + ReferringPagesPlugin blocks from
 * data/pages and templates now that Template:PageTabs handles them via the
 * Referring Pages tab (#553).
 *
 * Also removes trailing `----` + footnote-bullet blocks where present.
 *
 * Usage:
 *   node scripts/migrate-page-tabs.mjs [--dry-run]
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');

const SCAN_DIRS = [
  join(ROOT, 'data', 'pages'),
  join(ROOT, 'templates'),
];

/**
 * Removes the "## More Information / There might be... / [{ReferringPagesPlugin...}]"
 * block from page content.  The block may appear anywhere but is typically at the end.
 *
 * Matches:
 *   \n## More Information\n\nThere might be more information...\n[{ReferringPagesPlugin...}]\n?
 *
 * Stops at the next ## heading so we don't swallow subsequent content.
 */
function removeMoreInformationBlock(content) {
  // Match: optional leading blank lines, the heading, the boilerplate sentence,
  // then one ReferringPagesPlugin call (any params), and any trailing blank lines.
  // Use a non-greedy match that stops before the next ## heading.
  const re = /\n?## More Information\n\nThere might be more information for this subject on one of the following:\n\[\{ReferringPagesPlugin[^\}]*\}\]\n?/g;
  return content.replace(re, '\n');
}

/**
 * Removes a trailing `----` + `* [^N] - text` footnote-bullet block.
 * These are manually written footnote separators that are superseded by
 * the Footnotes tab (FootnotesPlugin reads [^id]: definitions instead).
 *
 * Pattern:
 *   \n----\n(* [^N] - text\n)+
 */
function removeFootnoteBulletBlock(content) {
  const re = /\n----\n(\* \[\^[\d\w-]+\] - .+\n)+/g;
  return content.replace(re, '\n');
}

/** Strip excess trailing newlines — keep exactly one. */
function normalizeTrailing(content) {
  return content.trimEnd() + '\n';
}

async function processFile(filePath) {
  const original = await readFile(filePath, 'utf8');
  let updated = original;

  updated = removeMoreInformationBlock(updated);
  updated = removeFootnoteBulletBlock(updated);
  updated = normalizeTrailing(updated);

  if (updated === original) return { filePath, changed: false };

  if (!DRY_RUN) {
    await writeFile(filePath, updated, 'utf8');
  }
  return { filePath, changed: true, original, updated };
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
          const rel = filePath.replace(ROOT + '/', '');
          console.log(`  [CHANGED] ${rel}`);
        } else {
          unchanged++;
        }
      } catch (err) {
        errors++;
        console.error(`  [ERROR] ${filePath}: ${err.message}`);
      }
    }
  }

  console.log(`\nDone. Changed: ${changed}  Unchanged: ${unchanged}  Errors: ${errors}`);
  if (DRY_RUN) console.log('(dry run — no files written)');
}

main().catch(err => { console.error(err); process.exit(1); });
