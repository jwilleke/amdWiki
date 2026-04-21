/**
 * migrate-bare-url-footnotes.mjs
 *
 * Converts bare-URL footnote bullets to the preferred [^N] bullet format:
 *
 *   Before:  * [^1] https://example.com/page
 *   After:   * [^1] - [https://example.com/page|https://example.com/page]
 *
 * These lines were imported from JSPWiki or created manually without the
 * ` - ` separator required by FootnotesPlugin. FootnotesPlugin ignores them,
 * so they never appear in the Footnotes tab.
 *
 * Usage:
 *   node scripts/migrate-bare-url-footnotes.mjs [--dry-run] [dir ...]
 *
 * Default dir: /Volumes/hd2A/jimstest-wiki/data/pages
 */

import { join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const fs = require('fs-extra');

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DRY_RUN = process.argv.includes('--dry-run');
const args = process.argv.slice(2).filter(a => !a.startsWith('--'));

const SCAN_DIRS = args.length > 0
  ? args.map(d => resolve(d))
  : ['/Volumes/hd2A/jimstest-wiki/data/pages'];

/** Matches: * [^N] https://url  (no dash separator) */
const BARE_URL_RE = /^\* \[\^(\d+)\] (https?:\/\/\S+)$/mg;

function processContent(content) {
  let changed = false;
  const updated = content.replace(BARE_URL_RE, (_match, n, url) => {
    changed = true;
    return `* [^${n}] - [${url}|${url}]`;
  });
  return changed ? updated : null;
}

async function main() {
  console.log(`migrate-bare-url-footnotes ${DRY_RUN ? '[DRY RUN] ' : ''}running\n`);

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
        const updated = processContent(content);
        if (!updated) continue;

        changed++;
        if (!DRY_RUN) {
          await fs.writeFile(filePath, updated, 'utf8');
        } else {
          console.log(`  [WOULD CHANGE] ${name}`);
        }
      } catch (err) {
        errors++;
        console.error(`  [ERROR] ${name}: ${err.message}`);
      }
    }
    console.log(`  → done`);
  }

  console.log(`\nDone. Changed: ${changed}  Unchanged: ${total - changed - errors}  Errors: ${errors}`);
  if (DRY_RUN) console.log('(dry run — no files written)');
}

main().catch(err => { console.error(err); process.exit(1); });
