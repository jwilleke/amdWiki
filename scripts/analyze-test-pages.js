#!/usr/bin/env node
/**
 * Test Pages Analysis Script
 *
 * Finds and analyzes pages that appear to be test pages
 * Provides recommendations for deletion or recategorization
 *
 * Usage: node scripts/analyze-test-pages.js [--delete]
 */

const fs = require('fs-extra');
const path = require('path');
const matter = require('gray-matter');

const REQUIRED_PAGES_DIR = path.join(__dirname, '../required-pages');
const DELETE_MODE = process.argv.includes('--delete');

/**
 * Determine if a page is a test page based on various criteria
 */
function isTestPage(parsed, filename) {
  const title = parsed.data.title || '';
  const category = parsed.data['system-category'] || '';
  const keywords = parsed.data['user-keywords'] || [];
  const content = parsed.content || '';

  // Criteria for test pages
  const reasons = [];

  // 1. Has "test" category
  if (category === 'test') {
    reasons.push('Has system-category: test');
  }

  // 2. Title starts with "Test"
  if (title.match(/^Test[\s-]/i)) {
    reasons.push(`Title starts with "Test": "${title}"`);
  }

  // 3. Has "test" keyword
  if (keywords.includes('test') || keywords.includes('testing')) {
    reasons.push('Has test keyword');
  }

  // 4. Content suggests it's a test
  if (content.match(/this (is|tests?|demonstrates?).*(test|example)/i)) {
    reasons.push('Content indicates test/example');
  }

  // 5. Title contains common test patterns
  if (title.match(/test.*page|example.*test|test.*plugin/i)) {
    reasons.push(`Test pattern in title: "${title}"`);
  }

  return reasons.length > 0 ? reasons : null;
}

/**
 * Determine recommended action
 */
function getRecommendation(parsed, testReasons) {
  const title = parsed.data.title || '';
  const category = parsed.data['system-category'] || '';
  const content = parsed.content || '';

  // If it demonstrates plugin functionality
  if (title.includes('Plugin') && !title.startsWith('Test-')) {
    return {
      action: 'RECATEGORIZE',
      newCategory: 'developer',
      reason: 'Plugin documentation/example - useful for developers'
    };
  }

  // If it's a link test (demonstrates JSPWiki syntax)
  if (title.match(/link.*test|pipe.*test/i)) {
    return {
      action: 'RECATEGORIZE',
      newCategory: 'developer',
      reason: 'Link syntax example - useful for developers'
    };
  }

  // If it's explicitly a test with no real content
  if (title.match(/^Test-\d+|^Test\s+Actions|^Test\s+No/i)) {
    return {
      action: 'DELETE',
      reason: 'Generic test page with no documentation value'
    };
  }

  // If content is minimal or placeholder
  if (content.length < 200 && testReasons.length > 0) {
    return {
      action: 'DELETE',
      reason: 'Minimal test content, not useful as documentation'
    };
  }

  // Default: needs manual review
  return {
    action: 'REVIEW',
    reason: 'Unclear if test or legitimate documentation'
  };
}

/**
 * Main analysis function
 */
async function analyze() {
  console.log('=== Test Pages Analysis ===\n');
  console.log(`Mode: ${DELETE_MODE ? 'DELETE MODE' : 'ANALYSIS ONLY'}\n`);

  const files = await fs.readdir(REQUIRED_PAGES_DIR);
  const mdFiles = files.filter(f => f.endsWith('.md'));

  const testPages = [];
  const toDelete = [];
  const toRecategorize = [];
  const toReview = [];

  // Analyze each file
  for (const file of mdFiles) {
    const filePath = path.join(REQUIRED_PAGES_DIR, file);
    const content = await fs.readFile(filePath, 'utf8');

    try {
      const parsed = matter(content);
      const testReasons = isTestPage(parsed, file);

      if (testReasons) {
        const recommendation = getRecommendation(parsed, testReasons);

        const pageInfo = {
          filename: file,
          title: parsed.data.title || 'Unknown',
          uuid: parsed.data.uuid,
          category: parsed.data['system-category'] || 'none',
          testReasons: testReasons,
          recommendation: recommendation,
          path: filePath,
          parsed: parsed
        };

        testPages.push(pageInfo);

        if (recommendation.action === 'DELETE') {
          toDelete.push(pageInfo);
        } else if (recommendation.action === 'RECATEGORIZE') {
          toRecategorize.push(pageInfo);
        } else {
          toReview.push(pageInfo);
        }
      }
    } catch (error) {
      console.log(`⚠️  Error parsing ${file}: ${error.message}`);
    }
  }

  // Display results
  console.log(`Found ${testPages.length} potential test pages\n`);

  if (toDelete.length > 0) {
    console.log(`\n📛 RECOMMEND DELETE (${toDelete.length}):\n`);
    toDelete.forEach((page, i) => {
      console.log(`${i + 1}. ${page.title}`);
      console.log(`   File: ${page.filename}`);
      console.log(`   Category: ${page.category}`);
      console.log(`   Reason: ${page.recommendation.reason}`);
      console.log('');
    });
  }

  if (toRecategorize.length > 0) {
    console.log(`\n🔄 RECOMMEND RECATEGORIZE to 'developer' (${toRecategorize.length}):\n`);
    toRecategorize.forEach((page, i) => {
      console.log(`${i + 1}. ${page.title}`);
      console.log(`   File: ${page.filename}`);
      console.log(`   Current: ${page.category}`);
      console.log(`   New: ${page.recommendation.newCategory}`);
      console.log(`   Reason: ${page.recommendation.reason}`);
      console.log('');
    });
  }

  if (toReview.length > 0) {
    console.log(`\n🔍 NEEDS MANUAL REVIEW (${toReview.length}):\n`);
    toReview.forEach((page, i) => {
      console.log(`${i + 1}. ${page.title}`);
      console.log(`   File: ${page.filename}`);
      console.log(`   Category: ${page.category}`);
      console.log(`   Reason: ${page.recommendation.reason}`);
      console.log('');
    });
  }

  // Perform actions if in delete mode
  if (DELETE_MODE && toDelete.length > 0) {
    console.log('\n--- Deleting Test Pages ---\n');

    for (const page of toDelete) {
      try {
        await fs.remove(page.path);
        console.log(`✓ Deleted: ${page.filename}`);
      } catch (error) {
        console.log(`✗ Failed to delete ${page.filename}: ${error.message}`);
      }
    }

    console.log('\n--- Recategorizing Pages ---\n');

    for (const page of toRecategorize) {
      try {
        // Update category in frontmatter
        page.parsed.data['system-category'] = page.recommendation.newCategory;

        // Write back to file
        const newContent = matter.stringify(page.parsed.content, page.parsed.data);
        await fs.writeFile(page.path, newContent);

        console.log(`✓ Recategorized: ${page.filename} → ${page.recommendation.newCategory}`);
      } catch (error) {
        console.log(`✗ Failed to recategorize ${page.filename}: ${error.message}`);
      }
    }
  }

  // Generate summary report
  const reportPath = path.join(__dirname, '../TEST-PAGES-REPORT.md');
  const report = generateReport(toDelete, toRecategorize, toReview);

  await fs.writeFile(reportPath, report);
  console.log(`\n✓ Report saved to: TEST-PAGES-REPORT.md`);

  // Summary
  console.log('\n=== Summary ===');
  console.log(`Total test pages found: ${testPages.length}`);
  console.log(`  Recommend delete: ${toDelete.length}`);
  console.log(`  Recommend recategorize: ${toRecategorize.length}`);
  console.log(`  Need manual review: ${toReview.length}`);

  if (!DELETE_MODE && (toDelete.length > 0 || toRecategorize.length > 0)) {
    console.log('\nTo apply changes, run: node scripts/analyze-test-pages.js --delete');
  } else if (DELETE_MODE) {
    console.log('\n✓ Changes applied!');
  }
}

/**
 * Generate report
 */
function generateReport(toDelete, toRecategorize, toReview) {
  const date = new Date().toISOString();

  let report = `# Test Pages Analysis Report\n\n`;
  report += `Generated: ${date}\n\n`;

  if (toDelete.length > 0) {
    report += `## Pages to Delete (${toDelete.length})\n\n`;
    toDelete.forEach((page, i) => {
      report += `${i + 1}. **${page.title}** (\`${page.filename}\`)\n`;
      report += `   - Current category: \`${page.category}\`\n`;
      report += `   - Reason: ${page.recommendation.reason}\n`;
      report += `   - Test indicators: ${page.testReasons.join(', ')}\n\n`;
    });
  }

  if (toRecategorize.length > 0) {
    report += `## Pages to Recategorize (${toRecategorize.length})\n\n`;
    toRecategorize.forEach((page, i) => {
      report += `${i + 1}. **${page.title}** (\`${page.filename}\`)\n`;
      report += `   - Current: \`${page.category}\` → New: \`${page.recommendation.newCategory}\`\n`;
      report += `   - Reason: ${page.recommendation.reason}\n\n`;
    });
  }

  if (toReview.length > 0) {
    report += `## Pages Needing Manual Review (${toReview.length})\n\n`;
    toReview.forEach((page, i) => {
      report += `${i + 1}. **${page.title}** (\`${page.filename}\`)\n`;
      report += `   - Category: \`${page.category}\`\n`;
      report += `   - Issue: ${page.recommendation.reason}\n`;
      report += `   - Test indicators: ${page.testReasons.join(', ')}\n\n`;
    });
  }

  return report;
}

// Run analysis
analyze().catch(error => {
  console.error('Analysis failed:', error);
  process.exit(1);
});
