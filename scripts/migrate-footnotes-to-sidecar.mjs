#!/usr/bin/env node
/**
 * migrate-footnotes-to-sidecar.mjs
 *
 * Extracts footnote bullet lines from page bodies and writes them to
 * ${SLOW_STORAGE}/footnotes/{uuid}.json sidecar files.
 *
 * Recognised formats:
 *   * [^N] - [Display|url] optional note
 *   * [#N] - [Display|url] optional note   (legacy JSPWiki)
 *
 * Usage:
 *   node scripts/migrate-footnotes-to-sidecar.mjs            # live run
 *   node scripts/migrate-footnotes-to-sidecar.mjs --dry-run  # print counts only
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.argv.includes('--dry-run');

// ── Resolve paths from env (mirrors ConfigurationManager.getResolvedDataPath) ──
const SLOW_STORAGE = process.env.SLOW_STORAGE || path.join(__dirname, '..', 'data');
const PAGES_DIR    = path.join(SLOW_STORAGE, 'pages');
const FOOTNOTES_DIR = path.join(SLOW_STORAGE, 'footnotes');
const PAGE_INDEX   = path.join(SLOW_STORAGE, 'page-index.json');

console.log(`SLOW_STORAGE : ${SLOW_STORAGE}`);
console.log(`Pages dir    : ${PAGES_DIR}`);
console.log(`Footnotes dir: ${FOOTNOTES_DIR}`);
console.log(`Dry run      : ${DRY_RUN}`);
console.log('');

if (!fs.existsSync(PAGES_DIR)) {
  console.error(`Pages directory not found: ${PAGES_DIR}`);
  process.exit(1);
}

// ── Footnote bullet regex ─────────────────────────────────────────────────────
// Matches: * [^N] - rest  OR  * [#N] - rest
const BULLET_RE = /^\* \[[\^#](\d+)\] - (.+)$/;

/**
 * Parse a bullet line's content field into { display, url, note }.
 * Handles:
 *   [Display|https://url] note
 *   [Display](https://url) note
 *   https://url note
 */
function parseContent(content) {
  content = content.trim();

  // [Display|url] optional note
  const wikiLinkMatch = content.match(/^\[([^\]|]+)\|([^\]]+)\](.*)$/);
  if (wikiLinkMatch) {
    return {
      display: wikiLinkMatch[1].trim(),
      url: wikiLinkMatch[2].trim(),
      note: wikiLinkMatch[3].trim()
    };
  }

  // [Display](url) optional note
  const mdLinkMatch = content.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)(.*)$/);
  if (mdLinkMatch) {
    return {
      display: mdLinkMatch[1].trim(),
      url: mdLinkMatch[2].trim(),
      note: mdLinkMatch[3].trim()
    };
  }

  // bare URL optional note
  const bareUrlMatch = content.match(/^(https?:\/\/\S+)(.*)$/);
  if (bareUrlMatch) {
    return {
      display: bareUrlMatch[1].trim(),
      url: bareUrlMatch[1].trim(),
      note: bareUrlMatch[2].trim()
    };
  }

  // plain text — treat as display only
  return { display: content, url: '', note: '' };
}

// ── Load page index ───────────────────────────────────────────────────────────
let pageIndex = null;
if (fs.existsSync(PAGE_INDEX)) {
  try {
    pageIndex = JSON.parse(fs.readFileSync(PAGE_INDEX, 'utf-8'));
  } catch {
    console.warn('Could not parse page-index.json — index will not be updated');
  }
}

// ── Walk all .md files ────────────────────────────────────────────────────────
function walkMd(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walkMd(full));
    else if (entry.isFile() && entry.name.endsWith('.md')) results.push(full);
  }
  return results;
}

const files = walkMd(PAGES_DIR);
let totalPages = 0, totalFootnotes = 0, skipped = 0;

for (const filePath of files) {
  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf-8');
  } catch {
    skipped++;
    continue;
  }

  let parsed;
  try {
    parsed = matter(raw);
  } catch {
    skipped++;
    continue;
  }

  const uuid = parsed.data?.uuid;
  if (!uuid) { skipped++; continue; }

  const bodyLines = parsed.content.split('\n');
  const bulletLines = [];
  const keptLines = [];

  for (const line of bodyLines) {
    const m = line.match(BULLET_RE);
    if (m) {
      bulletLines.push({ id: m[1], content: m[2] });
    } else {
      keptLines.push(line);
    }
  }

  if (bulletLines.length === 0) continue;

  totalPages++;
  totalFootnotes += bulletLines.length;
  console.log(`${path.basename(filePath)} (${uuid}): ${bulletLines.length} footnote(s)`);

  if (DRY_RUN) continue;

  // Build sidecar JSON
  if (!fs.existsSync(FOOTNOTES_DIR)) fs.mkdirSync(FOOTNOTES_DIR, { recursive: true });
  const sidecarPath = path.join(FOOTNOTES_DIR, `${uuid}.json`);

  // Merge with any existing sidecar (don't overwrite already-migrated data)
  let existing = {};
  if (fs.existsSync(sidecarPath)) {
    try { existing = JSON.parse(fs.readFileSync(sidecarPath, 'utf-8')); } catch {}
  }

  for (const { id, content } of bulletLines) {
    if (existing[id]) continue; // already present
    const { display, url, note } = parseContent(content);
    existing[id] = {
      id,
      display,
      url,
      note,
      createdBy: parsed.data?.author || 'migrated',
      createdAt: new Date().toISOString()
    };
  }

  fs.writeFileSync(sidecarPath, JSON.stringify(existing, null, 2), 'utf-8');

  // Strip footnote bullets from body and re-save page
  const newBody = keptLines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
  const newMetadata = { ...parsed.data, lastModified: new Date().toISOString() };
  const newFile = matter.stringify(newBody, newMetadata);
  fs.writeFileSync(filePath, newFile, 'utf-8');

  // Update page-index entry
  if (pageIndex?.pages?.[uuid]) {
    pageIndex.pages[uuid].hasFootnotes = true;
  }
}

// Write updated page index
if (!DRY_RUN && pageIndex) {
  fs.writeFileSync(PAGE_INDEX, JSON.stringify(pageIndex, null, 2), 'utf-8');
}

console.log('');
console.log(`Pages with footnote bullets : ${totalPages}`);
console.log(`Total footnotes extracted   : ${totalFootnotes}`);
console.log(`Skipped (unreadable/no uuid): ${skipped}`);
if (DRY_RUN) console.log('\n-- DRY RUN: no files were modified --');
else console.log('\nDone. Restart the server to pick up the updated page-index.');
