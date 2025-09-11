#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const matter = require('gray-matter');

/**
 * Category standardization mapping
 */
const CATEGORY_MAPPING = {
  // Standard categories (no change needed)
  'General': 'General',
  'System': 'System', 
  'Documentation': 'Documentation',
  'Developer': 'Developer',
  
  // Variations to standardize
  'Documents': 'General',
  'Documents (Any other Document)': 'General',
  '"Documentation"': 'Documentation',
  '"Developer"': 'Developer',
  'System/Admin': 'System',
  'System/Documentation': 'Documentation',
  'Testing': 'General',  // Test pages are user content
  
  // Empty or null
  '': 'General',
  null: 'General',
  undefined: 'General'
};

/**
 * Determine correct category based on file location and content
 */
function determineCorrectCategory(filePath, currentCategory, metadata, content) {
  const fileName = path.basename(filePath);
  const directory = path.dirname(filePath).split('/').pop();
  
  // Map current category if it exists
  if (currentCategory && CATEGORY_MAPPING[currentCategory]) {
    return CATEGORY_MAPPING[currentCategory];
  }
  
  // Determine by directory location
  if (directory === 'required-pages') {
    // Check if it's a system page
    const systemPages = ['Categories', 'PageIndex', 'SystemInfo', 'LeftMenu', 'Footer'];
    const isSystemPage = systemPages.some(page => 
      metadata.title && metadata.title.includes(page.replace(/([A-Z])/g, ' $1').trim())
    );
    
    if (isSystemPage) {
      return 'System';
    }
    
    // Check if it's documentation
    if (fileName.includes('doc') || fileName.includes('help') || 
        (metadata.title && (metadata.title.toLowerCase().includes('documentation') || 
                           metadata.title.toLowerCase().includes('guide')))) {
      return 'Documentation';
    }
    
    // Default for required-pages
    return 'System';
  }
  
  // For pages directory, default to General
  return 'General';
}

/**
 * Standardize categories across all pages
 */
class CategoryStandardizer {
  constructor() {
    this.pagesDir = path.join(process.cwd(), 'pages');
    this.requiredPagesDir = path.join(process.cwd(), 'required-pages');
    this.changes = [];
    this.errors = [];
  }

  /**
   * Analyze and fix categories
   */
  async standardizeCategories(dryRun = true) {
    console.log('🔍 Analyzing category inconsistencies...\n');
    
    const directories = [
      { path: this.pagesDir, name: 'pages' },
      { path: this.requiredPagesDir, name: 'required-pages' }
    ];

    for (const dir of directories) {
      await this.processDirectory(dir, dryRun);
    }

    this.generateReport(dryRun);
  }

  /**
   * Process all files in a directory
   */
  async processDirectory(dir, dryRun) {
    if (!await fs.pathExists(dir.path)) {
      console.log(`⚠️  Directory ${dir.name} does not exist, skipping...`);
      return;
    }

    const files = await fs.readdir(dir.path);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    
    console.log(`📁 ${dir.name}: ${mdFiles.length} files`);
    
    for (const file of mdFiles) {
      await this.processFile(dir.path, dir.name, file, dryRun);
    }
    
    console.log('');
  }

  /**
   * Process a single file
   */
  async processFile(dirPath, dirName, file, dryRun) {
    const filePath = path.join(dirPath, file);
    
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const { data: metadata, content } = matter(fileContent);
      
      const currentCategory = metadata.category;
      const correctCategory = determineCorrectCategory(filePath, currentCategory, metadata, content);
      
      if (currentCategory !== correctCategory) {
        const change = {
          file: file,
          path: filePath,
          directory: dirName,
          currentCategory: currentCategory || '(empty)',
          correctCategory: correctCategory,
          title: metadata.title || file.replace('.md', '')
        };
        
        this.changes.push(change);
        
        console.log(`📝 ${file}`);
        console.log(`   Title: "${change.title}"`);
        console.log(`   Category: "${change.currentCategory}" → "${change.correctCategory}"`);
        
        if (!dryRun) {
          // Update the metadata
          metadata.category = correctCategory;
          
          // Write the updated file
          const newContent = matter.stringify(content, metadata);
          await fs.writeFile(filePath, newContent);
          console.log(`   ✅ Updated`);
        }
      } else {
        console.log(`✅ ${file} - Category "${currentCategory}" is correct`);
      }
      
    } catch (err) {
      this.errors.push({ file, error: err.message });
      console.log(`❌ ${file} - Error: ${err.message}`);
    }
  }

  /**
   * Generate summary report
   */
  generateReport(dryRun) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 CATEGORY STANDARDIZATION REPORT');
    console.log('='.repeat(60));
    
    if (this.changes.length === 0) {
      console.log('✅ All categories are already standardized!');
      return;
    }
    
    console.log(`Total changes needed: ${this.changes.length}\n`);
    
    // Group by current category
    const byCurrentCategory = this.changes.reduce((acc, change) => {
      const current = change.currentCategory;
      if (!acc[current]) acc[current] = [];
      acc[current].push(change);
      return acc;
    }, {});
    
    console.log('📋 Changes by current category:');
    console.log('-'.repeat(40));
    
    for (const [current, changes] of Object.entries(byCurrentCategory)) {
      console.log(`"${current}" (${changes.length} files):`);
      const targetCategories = [...new Set(changes.map(c => c.correctCategory))];
      console.log(`   → ${targetCategories.join(', ')}`);
      
      for (const change of changes.slice(0, 3)) { // Show first 3 examples
        console.log(`     • ${change.title} (${change.directory})`);
      }
      if (changes.length > 3) {
        console.log(`     ... and ${changes.length - 3} more`);
      }
      console.log('');
    }
    
    // Summary by target category
    const byTargetCategory = this.changes.reduce((acc, change) => {
      const target = change.correctCategory;
      if (!acc[target]) acc[target] = 0;
      acc[target]++;
      return acc;
    }, {});
    
    console.log('🎯 Final category distribution:');
    console.log('-'.repeat(40));
    for (const [category, count] of Object.entries(byTargetCategory)) {
      console.log(`${category}: +${count} files`);
    }
    
    if (this.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      for (const error of this.errors) {
        console.log(`   ${error.file}: ${error.error}`);
      }
    }
    
    if (dryRun) {
      console.log('\n💡 This was a DRY RUN. No files were actually modified.');
      console.log('💡 Run with --execute to perform actual standardization.');
    } else {
      console.log('\n✅ Category standardization completed!');
    }
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const isExecute = args.includes('--execute') || args.includes('-e');
  
  const standardizer = new CategoryStandardizer();
  
  try {
    await standardizer.standardizeCategories(!isExecute);
    process.exit(standardizer.errors.length > 0 ? 1 : 0);
  } catch (err) {
    console.error('Standardization failed:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
