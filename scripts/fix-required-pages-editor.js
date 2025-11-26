#!/usr/bin/env node
/**
 * Script to add 'editor: system' to all required pages
 * Fixes issue #150 - Required pages should show 'system' as editor
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const REQUIRED_PAGES_DIR = path.join(__dirname, '../required-pages');
const DRY_RUN = process.argv.includes('--dry-run');

console.log('🔧 Fixing required pages editor metadata...\n');
console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE (will modify files)'}\n`);

// Find all markdown files in required-pages (excluding versions folder)
const pattern = path.join(REQUIRED_PAGES_DIR, '*.md');
const files = glob.sync(pattern);

console.log(`Found ${files.length} required pages\n`);

let updatedCount = 0;
let alreadySystemCount = 0;
let errorCount = 0;

files.forEach(filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);

    // Check if file has frontmatter
    if (!content.startsWith('---')) {
      console.log(`⚠️  ${fileName}: No frontmatter found, skipping`);
      return;
    }

    // Split content into frontmatter and body
    const parts = content.split(/^---$/m);
    if (parts.length < 3) {
      console.log(`⚠️  ${fileName}: Invalid frontmatter format, skipping`);
      return;
    }

    let frontmatter = parts[1];
    const body = parts.slice(2).join('---');

    // Check if editor or author field exists
    const hasEditor = /^editor:\s*.+$/m.test(frontmatter);
    const hasAuthor = /^author:\s*.+$/m.test(frontmatter);

    if (hasEditor && /^editor:\s*system\s*$/m.test(frontmatter)) {
      console.log(`✓  ${fileName}: Already has 'editor: system'`);
      alreadySystemCount++;
      return;
    }

    // Remove any existing author or editor fields
    if (hasAuthor) {
      frontmatter = frontmatter.replace(/^author:\s*.+$/m, '');
      console.log(`   ${fileName}: Removed existing author field`);
    }

    if (hasEditor && !/^editor:\s*system\s*$/m.test(frontmatter)) {
      frontmatter = frontmatter.replace(/^editor:\s*.+$/m, '');
      console.log(`   ${fileName}: Removed existing editor field`);
    }

    // Add editor: system after lastModified if it exists, otherwise at the end
    if (/^lastModified:/m.test(frontmatter)) {
      frontmatter = frontmatter.replace(
        /^(lastModified:\s*.+)$/m,
        '$1\neditor: system'
      );
    } else {
      // Add at the end of frontmatter
      frontmatter = frontmatter.trimEnd() + '\neditor: system\n';
    }

    // Reconstruct the file
    const newContent = '---' + frontmatter + '---' + body;

    if (!DRY_RUN) {
      fs.writeFileSync(filePath, newContent, 'utf8');
    }

    console.log(`✓  ${fileName}: Added 'editor: system'`);
    updatedCount++;

  } catch (err) {
    console.error(`❌ ${path.basename(filePath)}: Error - ${err.message}`);
    errorCount++;
  }
});

console.log('\n' + '='.repeat(50));
console.log('Summary:');
console.log(`  Already system: ${alreadySystemCount}`);
console.log(`  Updated: ${updatedCount}`);
console.log(`  Errors: ${errorCount}`);
console.log(`  Total files: ${files.length}`);

if (DRY_RUN) {
  console.log('\n💡 This was a dry run. Run without --dry-run to apply changes.');
} else {
  console.log('\n✅ All required pages updated!');
}
