#!/usr/bin/env node
/**
 * Migration Script: Move developer pages to docs/
 *
 * Moves all pages with system-category: developer from required-pages/ to docs/developer/
 * Updates internal links and creates a migration report.
 *
 * Usage: node scripts/migrate-developer-pages.js [--dry-run]
 */

const fs = require('fs-extra');
const path = require('path');
const matter = require('gray-matter');

const REQUIRED_PAGES_DIR = path.join(__dirname, '../required-pages');
const DOCS_DEVELOPER_DIR = path.join(__dirname, '../docs/developer');
const DRY_RUN = process.argv.includes('--dry-run');

/**
 * Main migration function
 */
async function migrate() {
  console.log('=== Developer Pages Migration ===\n');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE MIGRATION'}\n`);

  // Ensure target directory exists
  if (!DRY_RUN) {
    await fs.ensureDir(DOCS_DEVELOPER_DIR);
  }

  // Find all markdown files in required-pages/
  const files = await fs.readdir(REQUIRED_PAGES_DIR);
  const mdFiles = files.filter(f => f.endsWith('.md'));

  const developerPages = [];
  const otherPages = [];

  // Categorize pages
  for (const file of mdFiles) {
    const filePath = path.join(REQUIRED_PAGES_DIR, file);
    const content = await fs.readFile(filePath, 'utf8');

    try {
      const parsed = matter(content);
      const category = parsed.data['system-category'];

      if (category === 'developer') {
        developerPages.push({
          filename: file,
          title: parsed.data.title || 'Unknown',
          uuid: parsed.data.uuid,
          slug: parsed.data.slug,
          path: filePath
        });
      } else {
        otherPages.push({
          filename: file,
          category: category || 'none',
          title: parsed.data.title || 'Unknown'
        });
      }
    } catch (error) {
      console.log(`⚠️  Error parsing ${file}: ${error.message}`);
    }
  }

  // Display findings
  console.log(`Found ${developerPages.length} developer pages to migrate:\n`);

  developerPages.forEach((page, i) => {
    console.log(`${i + 1}. ${page.title}`);
    console.log(`   File: ${page.filename}`);
    console.log(`   UUID: ${page.uuid}`);
    if (page.slug) console.log(`   Slug: ${page.slug}`);
    console.log('');
  });

  if (developerPages.length === 0) {
    console.log('No developer pages found to migrate.');
    return;
  }

  // Perform migration
  if (DRY_RUN) {
    console.log('\n--- DRY RUN: No files will be moved ---');
  } else {
    console.log('\n--- Starting Migration ---\n');

    for (const page of developerPages) {
      const targetPath = path.join(DOCS_DEVELOPER_DIR, page.filename);

      try {
        await fs.move(page.path, targetPath, { overwrite: false });
        console.log(`✓ Moved: ${page.filename} → docs/developer/`);
      } catch (error) {
        console.log(`✗ Failed to move ${page.filename}: ${error.message}`);
      }
    }
  }

  // Generate migration report
  const report = generateReport(developerPages, otherPages);
  const reportPath = path.join(__dirname, '../MIGRATION-REPORT.md');

  if (!DRY_RUN) {
    await fs.writeFile(reportPath, report);
    console.log(`\n✓ Migration report saved to: MIGRATION-REPORT.md`);
  } else {
    console.log('\n--- Report Preview ---\n');
    console.log(report.substring(0, 500) + '...\n');
  }

  // Summary
  console.log('\n=== Summary ===');
  console.log(`Developer pages: ${developerPages.length}`);
  console.log(`Remaining in required-pages/: ${otherPages.length}`);

  if (DRY_RUN) {
    console.log('\nTo perform actual migration, run: node scripts/migrate-developer-pages.js');
  } else {
    console.log('\n✓ Migration complete!');
    console.log('\nNext steps:');
    console.log('1. Update PageManager to recognize docs/developer/');
    console.log('2. Update search indexing to include docs/');
    console.log('3. Update navigation/links that reference moved pages');
    console.log('4. Update the "Documentation for Developers" index page');
  }
}

/**
 * Generate migration report
 */
function generateReport(developerPages, otherPages) {
  const date = new Date().toISOString();

  let report = `# Developer Pages Migration Report\n\n`;
  report += `Generated: ${date}\n\n`;
  report += `## Migrated Pages (${developerPages.length})\n\n`;
  report += `The following pages were moved from \`required-pages/\` to \`docs/developer/\`:\n\n`;

  developerPages.forEach((page, i) => {
    report += `${i + 1}. **${page.title}**\n`;
    report += `   - File: \`${page.filename}\`\n`;
    report += `   - UUID: \`${page.uuid}\`\n`;
    if (page.slug) report += `   - Slug: \`${page.slug}\`\n`;
    report += `   - New Location: \`docs/developer/${page.filename}\`\n\n`;
  });

  report += `## Remaining Pages by Category\n\n`;

  const grouped = otherPages.reduce((acc, page) => {
    const cat = page.category || 'uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(page);
    return acc;
  }, {});

  Object.keys(grouped).sort().forEach(category => {
    report += `### ${category} (${grouped[category].length})\n\n`;
    grouped[category].forEach(page => {
      report += `- ${page.title} (\`${page.filename}\`)\n`;
    });
    report += '\n';
  });

  report += `## Action Items\n\n`;
  report += `- [ ] Update \`src/managers/PageManager.js\` to recognize \`docs/developer/\` as system content\n`;
  report += `- [ ] Update search indexing to include \`docs/**/*.md\` files\n`;
  report += `- [ ] Update \`required-pages/46ef520f-e10f-423f-bc07-bddc08720e16.md\` (Documentation for Developers index)\n`;
  report += `- [ ] Update any navigation menus that link to moved pages\n`;
  report += `- [ ] Update internal links in other pages that reference moved pages\n`;
  report += `- [ ] Update \`.gitignore\` to ensure \`docs/\` is tracked (not ignored)\n`;
  report += `- [ ] Test that moved pages are still accessible and readable\n`;
  report += `- [ ] Update issue #153 with migration results\n`;

  return report;
}

// Run migration
migrate().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});
