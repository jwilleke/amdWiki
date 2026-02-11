#!/usr/bin/env node
/**
 * Migration Script: Replace <br> tags with Markdown backslash line breaks
 *
 * Converts HTML <br> tags (from JSPWiki imports) to CommonMark backslash
 * line breaks for proper Markdown rendering.
 *
 * Usage: node scripts/migrate-br-to-backslash.js [--dry-run]
 *
 * Options:
 *   --dry-run    Preview changes without modifying files
 */

const fs = require('fs-extra');
const path = require('path');

const DATA_PAGES_DIR = path.join(__dirname, '../data/pages');
const REQUIRED_PAGES_DIR = path.join(__dirname, '../required-pages');
const DRY_RUN = process.argv.includes('--dry-run');

/**
 * Replace <br> tags with backslash line breaks
 * @param {string} content - File content
 * @returns {{ content: string, count: number }} Updated content and replacement count
 */
function replaceBrTags(content) {
  let count = 0;

  // Pattern 1: <br> followed by newline (most common from JSPWiki import)
  // e.g., "Quote text" <br>\n-- Author
  let result = content.replace(/<br>\s*(\r?\n)/gi, (match, newline) => {
    count++;
    return '\\\n';
  });

  // Pattern 2: <br> with optional space, followed by newline
  // e.g., "Quote text" <br> \n-- Author
  result = result.replace(/<br>\s+(\r?\n)/gi, (match, newline) => {
    count++;
    return '\\\n';
  });

  // Pattern 3: <br> mid-line (insert line break)
  // e.g., "text <br> more text" -> "text \\nmore text"
  result = result.replace(/<br>\s*/gi, () => {
    count++;
    return '\\\n';
  });

  return { content: result, count };
}

/**
 * Process a directory of markdown files
 * @param {string} dir - Directory path
 * @param {string} label - Label for logging
 * @returns {Promise<{ processed: number, modified: number, totalReplacements: number }>}
 */
async function processDirectory(dir, label) {
  const stats = { processed: 0, modified: 0, totalReplacements: 0 };

  if (!await fs.pathExists(dir)) {
    console.log(`⚠️  Directory not found: ${dir}`);
    return stats;
  }

  const files = await fs.readdir(dir);
  const mdFiles = files.filter(f => f.endsWith('.md'));

  console.log(`\n📁 Processing ${label} (${mdFiles.length} files)...\n`);

  for (const file of mdFiles) {
    const filePath = path.join(dir, file);
    stats.processed++;

    try {
      const content = await fs.readFile(filePath, 'utf8');
      const { content: updated, count } = replaceBrTags(content);

      if (count > 0) {
        stats.modified++;
        stats.totalReplacements += count;

        if (DRY_RUN) {
          console.log(`  📝 ${file}: ${count} <br> tag(s) would be replaced`);
        } else {
          await fs.writeFile(filePath, updated, 'utf8');
          console.log(`  ✓ ${file}: ${count} <br> tag(s) replaced`);
        }
      }
    } catch (error) {
      console.log(`  ✗ Error processing ${file}: ${error.message}`);
    }
  }

  return stats;
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('=== <br> to Backslash Migration ===\n');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE MIGRATION'}`);
  console.log(`\nThis script converts HTML <br> tags to Markdown backslash line breaks.`);
  console.log(`Example: "Quote" <br>\\n-- Author  →  "Quote" \\\\\\n-- Author\n`);

  const dataPagesStats = await processDirectory(DATA_PAGES_DIR, 'data/pages');
  const requiredPagesStats = await processDirectory(REQUIRED_PAGES_DIR, 'required-pages');

  // Summary
  const totalProcessed = dataPagesStats.processed + requiredPagesStats.processed;
  const totalModified = dataPagesStats.modified + requiredPagesStats.modified;
  const totalReplacements = dataPagesStats.totalReplacements + requiredPagesStats.totalReplacements;

  console.log('\n=== Summary ===');
  console.log(`Files processed: ${totalProcessed}`);
  console.log(`Files ${DRY_RUN ? 'to be modified' : 'modified'}: ${totalModified}`);
  console.log(`Total <br> tags ${DRY_RUN ? 'to be replaced' : 'replaced'}: ${totalReplacements}`);

  if (DRY_RUN && totalModified > 0) {
    console.log(`\nTo perform actual migration, run:`);
    console.log(`  node scripts/migrate-br-to-backslash.js`);
  } else if (!DRY_RUN && totalModified > 0) {
    console.log(`\n✓ Migration complete!`);
  } else if (totalModified === 0) {
    console.log(`\nNo <br> tags found. Nothing to migrate.`);
  }
}

// Run migration
migrate().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});
