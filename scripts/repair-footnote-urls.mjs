#!/usr/bin/env node
/**
 * repair-footnote-urls.mjs
 *
 * Repairs footnote sidecar files where the url (and display) fields were
 * stored with JSPWiki 3-part link attribute suffixes like |target='_blank'
 * and with unresolved interwiki prefixes like Wikipedia:Article.
 *
 * Run after migrate-footnotes-to-sidecar.mjs if sidecars already exist.
 *
 * Usage:
 *   SLOW_STORAGE=/path/to/data node scripts/repair-footnote-urls.mjs
 *   SLOW_STORAGE=/path/to/data node scripts/repair-footnote-urls.mjs --dry-run
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.argv.includes('--dry-run');

const SLOW_STORAGE = process.env.SLOW_STORAGE
  ?? path.join(__dirname, '..', 'data');

const FOOTNOTES_DIR = path.join(SLOW_STORAGE, 'footnotes');

const INTERWIKI_SITES = {
  Wikipedia: 'https://en.wikipedia.org/wiki/%s',
  JSPWiki: 'https://jspwiki-wiki.apache.org/Wiki.jsp?page=%s',
  MeatBall: 'http://www.usemod.com/cgi-bin/mb.pl?%s',
  GVP: 'https://volcano.si.edu/volcano.cfm?vn=%s',
  'GVP-COUNTRY': 'https://volcano.si.edu/volcanolist_countries.cfm?country=%s',
  C2: 'http://wiki.c2.com/?%s',
};

function resolveInterwiki(raw) {
  const m = raw.match(/^([A-Za-z0-9-]+):(.+)$/);
  if (!m) return raw;
  const template = INTERWIKI_SITES[m[1]];
  if (!template) return raw;
  return template.replace(/%s/g, encodeURIComponent(m[2]));
}

function cleanField(raw) {
  if (!raw) return raw;
  // Take first |-delimited segment only
  const first = raw.split('|')[0].trim();
  if (/^https?:\/\//.test(first)) return first;
  return resolveInterwiki(first);
}

function needsRepair(value) {
  if (!value) return false;
  // Has a pipe char (attribute suffix or duplicate URL), or is an unresolved interwiki ref
  return value.includes('|') || /^[A-Za-z0-9-]+:[^/]/.test(value);
}

if (!fs.existsSync(FOOTNOTES_DIR)) {
  console.error(`Footnotes directory not found: ${FOOTNOTES_DIR}`);
  process.exit(1);
}

let filesScanned = 0;
let filesRepaired = 0;
let fieldsFixed = 0;

for (const file of fs.readdirSync(FOOTNOTES_DIR)) {
  if (!file.endsWith('.json')) continue;
  const filePath = path.join(FOOTNOTES_DIR, file);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    console.warn(`  SKIP (parse error): ${file}`);
    continue;
  }

  filesScanned++;
  let dirty = false;

  for (const [id, fn] of Object.entries(data)) {
    if (needsRepair(fn.url)) {
      const fixed = cleanField(fn.url);
      if (fixed !== fn.url) {
        if (DRY_RUN) {
          console.log(`  [${file}] #${id} url: ${fn.url} → ${fixed}`);
        }
        fn.url = fixed;
        dirty = true;
        fieldsFixed++;
      }
    }
    if (needsRepair(fn.display)) {
      const fixed = cleanField(fn.display);
      if (fixed !== fn.display) {
        if (DRY_RUN) {
          console.log(`  [${file}] #${id} display: ${fn.display} → ${fixed}`);
        }
        fn.display = fixed;
        dirty = true;
        fieldsFixed++;
      }
    }
  }

  if (dirty) {
    filesRepaired++;
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
    }
  }
}

console.log(`\nScanned: ${filesScanned} files`);
console.log(`Repaired: ${filesRepaired} files, ${fieldsFixed} fields fixed`);
if (DRY_RUN) console.log('(dry-run — nothing written)');
