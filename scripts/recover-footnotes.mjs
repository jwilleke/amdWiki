/**
 * recover-footnotes.mjs
 *
 * Recovers JSPWiki footnote lines (* [#N] - text) that were deleted from page
 * bodies by the buggy first pass of migrate-page-tabs.mjs (#553).
 *
 * Strategy:
 *   1. For each .md page that currently has NO * [#N] lines but whose version
 *      history does, reconstruct the previous version content via DeltaStorage.
 *   2. Extract the * [#N] lines from the reconstructed content.
 *   3. Append them to the current .md file (without the --- separator).
 *
 * Usage:
 *   node scripts/recover-footnotes.mjs [--dry-run] [pages-dir] [versions-dir]
 *
 * Defaults:
 *   pages-dir    /Volumes/hd2A/jimstest-wiki/data/pages
 *   versions-dir /Volumes/hd2A/jimstest-wiki/data/pages/versions
 */

import { join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const fsExtra = require('fs-extra');

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');
const args = process.argv.slice(2).filter(a => !a.startsWith('--'));

const PAGES_DIR    = args[0] ? resolve(args[0]) : '/Volumes/hd2A/jimstest-wiki/data/pages';
const VERSIONS_DIR = args[1] ? resolve(args[1]) : join(PAGES_DIR, 'versions');

/** Regex for JSPWiki footnote bullets */
const JSPWIKI_RE = /^\* \[#\d+\] - .+$/mg;

/**
 * Apply a fast-diff delta array to base content.
 * DiffTuple: [-1=delete, 0=equal, 1=insert]
 */
function applyDiff(base, diff) {
  let result = '';
  let baseIndex = 0;
  for (const [op, text] of diff) {
    if (op === -1) {       // delete — skip in base
      baseIndex += text.length;
    } else if (op === 0) { // equal — copy from base
      result += base.substring(baseIndex, baseIndex + text.length);
      baseIndex += text.length;
    } else {               // insert — add new text
      result += text;
    }
  }
  return result;
}

/** Reconstruct version N content from v1 checkpoint + diffs. */
async function reconstructVersion(uuid, targetVersion) {
  const versionDir = join(VERSIONS_DIR, uuid);

  // Find nearest checkpoint (v1 always exists as content.md)
  let startVersion = 1;
  for (let v = targetVersion; v >= 1; v--) {
    if (v === 1 || v % 10 === 0) {
      if (await fsExtra.pathExists(join(versionDir, `v${v}`, 'content.md'))) {
        startVersion = v;
        break;
      }
    }
  }

  let content = await fsExtra.readFile(join(versionDir, `v${startVersion}`, 'content.md'), 'utf8');
  for (let v = startVersion + 1; v <= targetVersion; v++) {
    const diffPath = join(versionDir, `v${v}`, 'content.diff');
    if (!await fsExtra.pathExists(diffPath)) throw new Error(`Missing diff: ${diffPath}`);
    const diff = JSON.parse(await fsExtra.readFile(diffPath, 'utf8'));
    content = applyDiff(content, diff);
  }
  return content;
}

async function main() {
  console.log(`recover-footnotes ${DRY_RUN ? '[DRY RUN] ' : ''}running\n`);
  console.log(`Pages:    ${PAGES_DIR}`);
  console.log(`Versions: ${VERSIONS_DIR}\n`);

  const files = (await fsExtra.readdir(PAGES_DIR)).filter(f => f.endsWith('.md'));
  let recovered = 0, skipped = 0, errors = 0;

  for (const name of files) {
    const uuid = name.replace('.md', '');
    const filePath = join(PAGES_DIR, name);
    const versionDir = join(VERSIONS_DIR, uuid);

    try {
      // Skip if versions directory doesn't exist
      if (!await fsExtra.pathExists(versionDir)) { skipped++; continue; }

      const current = (await fsExtra.readFile(filePath, 'utf8')).replace(/\r\n/g, '\n');

      // Skip if page already has JSPWiki footnote lines
      if (JSPWIKI_RE.test(current)) { JSPWIKI_RE.lastIndex = 0; skipped++; continue; }
      JSPWIKI_RE.lastIndex = 0;

      // Read manifest to find current version number
      const manifestPath = join(versionDir, 'manifest.json');
      if (!await fsExtra.pathExists(manifestPath)) { skipped++; continue; }
      const manifest = JSON.parse(await fsExtra.readFile(manifestPath, 'utf8'));
      const currentVersion = manifest.currentVersion ?? 1;

      // Find the most recent version that HAS footnote lines
      let footnoteLines = null;
      for (let v = currentVersion; v >= 1; v--) {
        const vContent = await reconstructVersion(uuid, v);
        const matches = vContent.match(JSPWIKI_RE);
        JSPWIKI_RE.lastIndex = 0;
        if (matches) {
          footnoteLines = matches;
          break;
        }
      }

      if (!footnoteLines) { skipped++; continue; }

      // Append recovered footnote lines (no --- separator) to current content
      const updated = current.trimEnd() + '\n' + footnoteLines.join('\n') + '\n';

      recovered++;
      if (!DRY_RUN) {
        await fsExtra.writeFile(filePath, updated, 'utf8');
      } else {
        console.log(`  [WOULD RECOVER] ${name}: ${footnoteLines.length} footnote(s)`);
        console.log(`    ${footnoteLines[0]}`);
      }
    } catch (err) {
      errors++;
      console.error(`  [ERROR] ${name}: ${err.message}`);
    }
  }

  console.log(`\nDone. Recovered: ${recovered}  Skipped: ${skipped}  Errors: ${errors}`);
  if (DRY_RUN) console.log('(dry run — no files written)');
}

main().catch(err => { console.error(err); process.exit(1); });
