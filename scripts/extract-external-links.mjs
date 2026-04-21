/**
 * extract-external-links.mjs
 *
 * Converts markdown external links  [text](https://url)  into footnotes:
 *   - Inline becomes:   text[^N]
 *   - Appended line:    * [^N] - [text|https://url]
 *
 * Skips:
 *   - Image links:       ![alt](url)
 *   - Code spans/blocks: `...` / ```...```
 *   - ngdpbase wiki links: [text|page] or [page]  (no markdown parens)
 *   - Non-external URLs: anything not starting with https?://
 *   - Pages with no-page-tabs: true frontmatter (opt-out)
 *
 * Deduplicates: same URL reuses same footnote number on the page.
 * Numbers sequentially after any existing [^N] footnote bullets.
 *
 * Usage:
 *   node scripts/extract-external-links.mjs [--dry-run] [dir ...]
 *
 * Default dirs: data/pages, templates
 */

import { join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const fs = require('fs-extra');

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');
const extraDirs = process.argv.slice(2).filter(a => !a.startsWith('--'));

const SCAN_DIRS = [
  join(ROOT, 'data', 'pages'),
  ...extraDirs.map(d => resolve(d)),
];

/** Match markdown links but NOT image links (no leading !) */
const MD_LINK_RE = /(?<!!)\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;

/** Match existing [^N] footnote bullets to find the highest N */
const EXISTING_FOOTNOTE_RE = /^\* \[\^(\d+)\]/mg;

/**
 * Replace fenced code blocks, inline code spans, and footnote bullet lines
 * with placeholders so we don't transform links inside them.
 * Footnote bullets (* [#N] - ... and * [^N] - ...) already contain ngdpbase
 * wiki links and must not be processed as markdown links.
 */
function maskCode(content) {
  const blocks = [];
  const masked = content
    // Fenced code blocks ```...```
    .replace(/```[\s\S]*?```/g, match => {
      const idx = blocks.push(match) - 1;
      return `\x00CODE${idx}\x00`;
    })
    // Inline code `...`
    .replace(/`[^`\n]+`/g, match => {
      const idx = blocks.push(match) - 1;
      return `\x00CODE${idx}\x00`;
    })
    // Footnote bullet lines * [#N] - ... and * [^N] - ...
    .replace(/^\* \[[\^#]\d+\] - .+$/mg, match => {
      const idx = blocks.push(match) - 1;
      return `\x00CODE${idx}\x00`;
    });
  return { masked, blocks };
}

function unmaskCode(content, blocks) {
  return content.replace(/\x00CODE(\d+)\x00/g, (_, i) => blocks[Number(i)]);
}

/**
 * Split content into YAML frontmatter and body.
 * Returns { frontmatter, body } where frontmatter includes the --- delimiters.
 */
function splitFrontmatter(content) {
  if (!content.startsWith('---')) return { frontmatter: '', body: content };
  const end = content.indexOf('\n---', 3);
  if (end === -1) return { frontmatter: '', body: content };
  return {
    frontmatter: content.slice(0, end + 4), // include closing ---
    body: content.slice(end + 4),
  };
}

function processContent(content) {
  const { frontmatter, body } = splitFrontmatter(content);

  // Find highest existing [^N] to start numbering after
  let maxN = 0;
  EXISTING_FOOTNOTE_RE.lastIndex = 0;
  let em;
  while ((em = EXISTING_FOOTNOTE_RE.exec(body)) !== null) {
    maxN = Math.max(maxN, parseInt(em[1], 10));
  }

  // Mask code so we don't touch links inside code blocks
  const { masked, blocks } = maskCode(body);

  // Collect all external links: url → { n, display }
  const urlMap = new Map(); // url → footnote number
  const newFootnotes = []; // { n, display, url } in order of first appearance
  let counter = maxN;

  // First pass: collect unique URLs and assign numbers
  MD_LINK_RE.lastIndex = 0;
  let m;
  while ((m = MD_LINK_RE.exec(masked)) !== null) {
    const [, display, url] = m;
    if (!urlMap.has(url)) {
      counter++;
      urlMap.set(url, { n: counter, display });
      newFootnotes.push({ n: counter, display, url });
    }
  }

  if (newFootnotes.length === 0) return null; // nothing to do

  // Second pass: replace [text](url) with text[^N]
  MD_LINK_RE.lastIndex = 0;
  const transformed = masked.replace(MD_LINK_RE, (_match, display, url) => {
    const { n } = urlMap.get(url);
    return `${display}[^${n}]`;
  });

  const restored = unmaskCode(transformed, blocks);

  // Append new footnote lines (after existing ones, at end of body)
  const footnoteLines = newFootnotes
    .map(({ n, display, url }) => `* [^${n}] - [${display}|${url}]`)
    .join('\n');

  const updatedBody = restored.trimEnd() + '\n' + footnoteLines + '\n';
  return frontmatter + updatedBody;
}

async function processFile(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  const content = raw.replace(/\r\n/g, '\n');

  const updated = processContent(content);
  if (!updated || updated === content) return false;

  if (!DRY_RUN) {
    await fs.writeFile(filePath, updated, 'utf8');
  }
  return true;
}

async function main() {
  console.log(`extract-external-links ${DRY_RUN ? '[DRY RUN] ' : ''}running\n`);

  let changed = 0, unchanged = 0, errors = 0;

  for (const dir of SCAN_DIRS) {
    let entries;
    try { entries = await fs.readdir(dir); }
    catch { console.warn(`  [SKIP] not found: ${dir}`); continue; }

    const mdFiles = entries.filter(e => e.endsWith('.md'));
    console.log(`Scanning ${dir} (${mdFiles.length} .md files)...`);

    for (const name of mdFiles) {
      const filePath = join(dir, name);
      try {
        const didChange = await processFile(filePath);
        if (didChange) {
          changed++;
          if (DRY_RUN) console.log(`  [WOULD CHANGE] ${name}`);
        } else {
          unchanged++;
        }
      } catch (err) {
        errors++;
        console.error(`  [ERROR] ${name}: ${err.message}`);
      }
    }
    console.log(`  → done`);
  }

  console.log(`\nDone. Changed: ${changed}  Unchanged: ${unchanged}  Errors: ${errors}`);
  if (DRY_RUN) console.log('(dry run — no files written)');
}

main().catch(err => { console.error(err); process.exit(1); });
