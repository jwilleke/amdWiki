/**
 * repair-footnote-links.mjs
 *
 * Repairs pages where extract-external-links.mjs incorrectly processed
 * markdown links inside existing * [#N] footnote bullet lines.
 *
 * Bug: the script replaced [text](url) inside footnote bullets with text[^N]
 * and appended a duplicate * [^N] bullet — leaving the [#N] line with plain
 * text and a dangling [^N] reference.
 *
 * Fix strategy for each affected page:
 *   1. For each * [#N] line that contains [^M]:
 *      a. Find the corresponding * [^M] bullet that was added
 *      b. Reconstruct the original [text](url) from the [^M] bullet's [text|url]
 *      c. Restore the [#N] line
 *      d. Remove the orphaned * [^M] bullet
 *   2. Renumber remaining [^N] bullets and inline refs sequentially
 *
 * Usage:
 *   node scripts/repair-footnote-links.mjs [--dry-run] [pages-dir]
 *
 * Default pages-dir: /Volumes/hd2A/jimstest-wiki/data/pages
 */

import { join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const fs = require('fs-extra');

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');
const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
const PAGES_DIR = args[0] ? resolve(args[0]) : '/Volumes/hd2A/jimstest-wiki/data/pages';

/** Matches a corrupted [#N] line: * [#N] - ...text[^M]... */
const CORRUPT_HASH_RE = /^\* \[#(\d+)\] - (.*\[\^(\d+)\].*)/;

/** Matches an orphaned [^M] bullet: * [^M] - [text|url...] */
const ORPHAN_CARET_RE = /^\* \[\^(\d+)\] - \[([^\]|]+)\|(https?:\/\/[^\]]+)\]/;

function processContent(content) {
  const lines = content.split('\n');
  const orphanCaretMap = new Map(); // M → { lineIdx, text, url }

  // First pass: index all * [^M] - [text|url] bullets
  for (let i = 0; i < lines.length; i++) {
    const m = ORPHAN_CARET_RE.exec(lines[i]);
    if (m) orphanCaretMap.set(m[1], { lineIdx: i, text: m[2], url: m[3].replace(/\|[^|]*$/, '').trimEnd() });
  }

  // Second pass: find corrupted [#N] lines and repair them
  const toRemove = new Set(); // line indices to delete
  let changed = false;

  for (let i = 0; i < lines.length; i++) {
    const m = CORRUPT_HASH_RE.exec(lines[i]);
    if (!m) continue;

    const hashN = m[1];
    const lineBody = m[2];

    // Find all [^M] refs in this line
    const refRe = /\[\^(\d+)\]/g;
    let rm;
    let restored = lineBody;
    while ((rm = refRe.exec(lineBody)) !== null) {
      const caretM = rm[1];
      const orphan = orphanCaretMap.get(caretM);
      if (!orphan) continue;

      // Restore [text](url) in place of text[^M]
      const { text, url, lineIdx } = orphan;
      restored = restored.replace(`${text}[^${caretM}]`, `[${text}](${url})`);
      toRemove.add(lineIdx);
      changed = true;
    }

    if (restored !== lineBody) {
      lines[i] = `* [#${hashN}] - ${restored}`;
    }
  }

  if (!changed) return null;

  // Remove orphaned [^M] bullets (in reverse order to preserve indices)
  const sorted = [...toRemove].sort((a, b) => b - a);
  for (const idx of sorted) lines.splice(idx, 1);

  return lines.join('\n');
}

async function main() {
  console.log(`repair-footnote-links ${DRY_RUN ? '[DRY RUN] ' : ''}running\n`);
  console.log(`Pages: ${PAGES_DIR}\n`);

  const files = (await fs.readdir(PAGES_DIR)).filter(f => f.endsWith('.md'));
  let repaired = 0, skipped = 0, errors = 0;

  for (const name of files) {
    const filePath = join(PAGES_DIR, name);
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      const content = raw.replace(/\r\n/g, '\n');
      const updated = processContent(content);

      if (!updated || updated === content) { skipped++; continue; }

      repaired++;
      if (!DRY_RUN) {
        await fs.writeFile(filePath, updated, 'utf8');
      } else {
        console.log(`  [WOULD REPAIR] ${name}`);
      }
    } catch (err) {
      errors++;
      console.error(`  [ERROR] ${name}: ${err.message}`);
    }
  }

  console.log(`\nDone. Repaired: ${repaired}  Skipped: ${skipped}  Errors: ${errors}`);
  if (DRY_RUN) console.log('(dry run — no files written)');
}

main().catch(err => { console.error(err); process.exit(1); });
