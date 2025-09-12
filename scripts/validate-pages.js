#!/usr/bin/env node

/**
 * Validation Script: Validate Page Files for UUID Naming and Directory Placement
 * 
 * This script checks all Markdown files in pages/ and required-pages/ for UUID naming compliance
 * and correct directory placement based on metadata (e.g., categories: [System] for required-pages/).
 * 
 * Usage:
 *   node scripts/validate-pages.js [--dry-run]
 * 
 * Options:
 *   --dry-run   Show issues without making changes (default: true)
 */

const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');

class PageValidator {
  constructor(options = {}) {
    this.options = {
      dryRun: options.dryRun !== false, // Default to dry-run
      ...options
    };
    
    this.baseDir = path.join(__dirname, '..');
    this.pagesDir = path.join(this.baseDir, 'pages');
    this.requiredPagesDir = path.join(this.baseDir, 'required-pages');
    this.report = {
      totalFiles: 0,
      validFiles: 0,
      invalidFiles: 0,
      misplacedFiles: 0,
      issues: [],
      suggestions: []
    };
  }

  /**
   * Run the validation process
   */
  async validate() {
    console.log('🚀 Starting Page Validation...');
    console.log(`📁 Working directory: ${this.baseDir}`);
    
    if (this.options.dryRun) {
      console.log('🔍 DRY RUN MODE - No files will be modified');
    }

    try {
      // Validate files in both directories
      await this.validateDirectory(this.pagesDir, 'user', false);
      await this.validateDirectory(this.requiredPagesDir, 'system', true);
      
      // Summarize results
      console.log('\n📊 Validation Summary:');
      console.log(`   Total Files: ${this.report.totalFiles}`);
      console.log(`   Valid Files: ${this.report.validFiles}`);
      console.log(`   Invalid Files: ${this.report.invalidFiles}`);
      console.log(`   Misplaced Files: ${this.report.misplacedFiles}`);
      
      if (this.report.issues.length > 0) {
        console.log('\n⚠️  Issues Found:');
        this.report.issues.forEach(issue => console.log(`   - ${issue}`));
      }
      
      if (this.report.suggestions.length > 0) {
        console.log('\n💡 Suggestions:');
        this.report.suggestions.forEach(suggestion => console.log(`   - ${suggestion}`));
      }
      
      console.log('✅ Validation completed');
      return this.report;
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      throw error;
    }
  }

  /**
   * Validate files in a specific directory
   * @param {string} dirPath - Directory path to validate
   * @param {string} dirType - Type of directory ('user' or 'system')
   * @param {boolean} expectSystem - Whether this directory should contain system pages
   */
  async validateDirectory(dirPath, dirType, expectSystem) {
    console.log(`🔍 Validating ${dirType} pages in ${dirPath}...`);
    try {
      const files = await fs.readdir(dirPath);
      for (const file of files) {
        if (!file.endsWith('.md')) continue;

        this.report.totalFiles++;
        const filePath = path.join(dirPath, file);

        try {
          const fileContent = await fs.readFile(filePath, 'utf-8');
          const parsed = matter(fileContent);
          const metadata = parsed.data;
          let changed = false;

          // Auto-fix legacy metadata fields
          if (typeof metadata.category === 'string') {
            metadata['system-category'] = metadata.category;
            delete metadata.category;
            changed = true;
            this.report.suggestions.push(`${file}: replaced 'category' with 'system-category'`);
          }
          if (Array.isArray(metadata.categories)) {
            metadata['user-keywords'] = metadata.categories;
            delete metadata.categories;
            changed = true;
            this.report.suggestions.push(`${file}: replaced 'categories' with 'user-keywords'`);
          }

          // Check UUID naming compliance (filename should match UUID format)
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.md$/i;
          const isUuidNamed = uuidRegex.test(file);

          // Check if file is in correct directory based on metadata
          const isSystemPage = this.isSystemPage(metadata);
          const isCorrectlyPlaced = expectSystem === isSystemPage;

          if (isUuidNamed && isCorrectlyPlaced) {
            this.report.validFiles++;
          } else {
            this.report.invalidFiles++;
            if (!isUuidNamed) {
              this.report.issues.push(`${file} in ${dirType} directory has non-UUID name`);
              this.report.suggestions.push(`Rename ${file} to a UUID-based name (e.g., ${require('uuid').v4()}.md)`);
            }
            if (!isCorrectlyPlaced) {
              this.report.misplacedFiles++;
              this.report.issues.push(`${file} is misplaced: ${isSystemPage ? 'System page in user directory' : 'User page in system directory'}`);
              this.report.suggestions.push(`Move ${file} to ${isSystemPage ? 'required-pages/' : 'pages/'}`);
            }
          }

          // Write fixed file if not dry-run and changes were made
          if (changed && !this.options.dryRun) {
            const newContent = matter.stringify(parsed.content, metadata);
            await fs.writeFile(filePath, newContent, 'utf-8');
            this.report.suggestions.push(`${file}: file updated with new metadata fields`);
          }
        } catch (err) {
          this.report.invalidFiles++;
          this.report.issues.push(`Error reading ${file}: ${err.message}`);
        }
      }
    } catch (err) {
      console.error(`Error accessing ${dirType} directory:`, err.message);
      this.report.issues.push(`Could not access ${dirPath}: ${err.message}`);
    }
  }

  /**
   * Check if a page is a system page based on metadata
   * @param {Object} metadata - Page metadata
   * @returns {boolean} True if it's a system page
   */
  isSystemPage(metadata) {
    if (metadata.category === 'System' || metadata.category === 'System/Admin') {
      return true;
    }
    if (metadata.categories && Array.isArray(metadata.categories)) {
      return metadata.categories.includes('System') || metadata.categories.includes('System/Admin');
    }
    return false;
  }
}

// CLI handling
async function main() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: !args.includes('--no-dry-run')
  };
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Page Validation Tool

Validates page files in pages/ and required-pages/ for UUID naming and directory placement.

Usage:
  node scripts/validate-pages.js [options]

Options:
  --no-dry-run  Actually apply fixes (default: dry-run mode, no changes made)
  --help, -h    Show this help message

Examples:
  node scripts/validate-pages.js
  node scripts/validate-pages.js --no-dry-run
`);
    return;
  }
  
  const validator = new PageValidator(options);
  await validator.validate();
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Validation failed:', error);
    process.exit(1);
  });
}

module.exports = PageValidator;
