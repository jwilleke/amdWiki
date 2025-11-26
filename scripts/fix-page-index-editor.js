#!/usr/bin/env node
/**
 * Script to set 'editor: system' for all required pages in page-index.json
 * Companion script to fix-required-pages-editor.js
 * Fixes issue #150 - Required pages should show 'system' as editor
 */

const fs = require('fs-extra');
const path = require('path');

const PAGE_INDEX_PATH = path.join(__dirname, '../data/page-index.json');
const DRY_RUN = process.argv.includes('--dry-run');

console.log('🔧 Fixing page-index.json editor field for required pages...\n');
console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE (will modify file)'}\n`);

async function main() {
  try {
    // Check if page-index.json exists
    if (!(await fs.pathExists(PAGE_INDEX_PATH))) {
      console.log('⚠️  page-index.json not found, skipping');
      return;
    }

    // Read page-index.json
    const pageIndex = await fs.readJson(PAGE_INDEX_PATH);

    if (!pageIndex.pages) {
      console.log('⚠️  No pages found in page-index.json');
      return;
    }

    let updatedCount = 0;
    let alreadySystemCount = 0;
    let skippedCount = 0;

    // Iterate through all pages
    for (const [uuid, pageData] of Object.entries(pageIndex.pages)) {
      // Only update pages in required-pages location
      if (pageData.location === 'required-pages') {
        if (pageData.editor === 'system') {
          console.log(`✓  ${pageData.title}: Already has 'editor: system'`);
          alreadySystemCount++;
        } else {
          const oldEditor = pageData.editor || pageData.author || 'unknown';
          pageData.editor = 'system';

          // Also update author to system for consistency
          if (pageData.author && pageData.author !== 'system') {
            pageData.author = 'system';
          }

          console.log(`✓  ${pageData.title}: Set editor to 'system' (was: ${oldEditor})`);
          updatedCount++;
        }
      } else {
        skippedCount++;
      }
    }

    // Write back to file if not dry run
    if (!DRY_RUN && updatedCount > 0) {
      pageIndex.lastUpdated = new Date().toISOString();
      await fs.writeJson(PAGE_INDEX_PATH, pageIndex, { spaces: 2 });
    }

    console.log('\n' + '='.repeat(50));
    console.log('Summary:');
    console.log(`  Already system: ${alreadySystemCount}`);
    console.log(`  Updated: ${updatedCount}`);
    console.log(`  Skipped (not required-pages): ${skippedCount}`);
    console.log(`  Total entries: ${Object.keys(pageIndex.pages).length}`);

    if (DRY_RUN) {
      console.log('\n💡 This was a dry run. Run without --dry-run to apply changes.');
    } else if (updatedCount > 0) {
      console.log('\n✅ page-index.json updated!');
    } else {
      console.log('\n✅ No changes needed!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
