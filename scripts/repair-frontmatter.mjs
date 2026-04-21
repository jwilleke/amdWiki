/**
 * repair-frontmatter.mjs
 *
 * Restores missing YAML frontmatter closing delimiter (---) from pages
 * corrupted by the migrate-page-tabs.mjs script (which used * instead of +
 * in the JSPWiki footnote regex, causing it to eat bare --- separators).
 *
 * Usage:
 *   node scripts/repair-frontmatter.mjs [--dry-run] [extra/dir ...]
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
  ...extraDirs.map(d => resolve(d)),
];

/**
 * Returns true if the file is missing its frontmatter closing ---.
 * A page is corrupted when a content heading (^# ) appears before
 * the closing --- delimiter.
 */
function isCorrupted(content) {
  if (!content.startsWith('---')) return false;
  const afterOpen = content.indexOf('\n---', 3);
  const firstHeading = content.search(/\n#[ \[{]/);
  return firstHeading !== -1 && (afterOpen === -1 || firstHeading < afterOpen);
}

/**
 * Inserts --- before the first content heading line.
 * Handles pages where the frontmatter closer was eaten by the bad regex.
 */
function repairFrontmatter(content) {
  // Find the position of the first content heading after the opening ---
  const firstHeading = content.search(/\n#[ \[{]/);
  if (firstHeading === -1) return content; // nothing to fix
  // Insert ---\n before the heading (after the \n)
  return content.slice(0, firstHeading + 1) + '---\n' + content.slice(firstHeading + 1);
}

async function processFile(filePath) {
  const raw = await readFile(filePath, 'utf8');
  const content = raw.replace(/\r\n/g, '\n');

  if (!isCorrupted(content)) return { changed: false };

  const repaired = repairFrontmatter(content);

  if (!DRY_RUN) {
    await writeFile(filePath, repaired, 'utf8');
  }
  return { changed: true };
}

async function main() {
  console.log(`repair-frontmatter ${DRY_RUN ? '[DRY RUN] ' : ''}running\n`);

  let repaired = 0;
  let ok = 0;
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
        if (result.changed) repaired++; else ok++;
      } catch (err) {
        errors++;
        console.error(`  [ERROR] ${filePath}: ${err.message}`);
      }
    }
    console.log(`  → done`);
  }

  console.log(`\nDone. Repaired: ${repaired}  OK: ${ok}  Errors: ${errors}`);
  if (DRY_RUN) console.log('(dry run — no files written)');
}

main().catch(err => { console.error(err); process.exit(1); });
