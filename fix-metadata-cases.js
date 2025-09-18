#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

/**
 * Batch fix script for metadata case issues
 * Fixes "General" → "general" in system-category fields
 */
class MetadataCaseFixer {
  constructor() {
    this.pagesDir = './pages';
    this.requiredPagesDir = './required-pages';
    this.fixedFiles = [];
    this.errors = [];
  }

  /**
   * Fix a single file's metadata
   */
  async fixFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');

      // Check if file has frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!frontmatterMatch) {
        return { fixed: false, reason: 'No frontmatter found' };
      }

      // Check if it needs fixing
      if (!content.includes('system-category: General')) {
        return { fixed: false, reason: 'No "General" found' };
      }

      // Replace "General" with "general" in system-category
      const fixedContent = content.replace(
        /^(\s*system-category:\s*)General(\s*)$/m,
        '$1general$2'
      );

      // Only write if content actually changed
      if (fixedContent !== content) {
        await fs.writeFile(filePath, fixedContent, 'utf8');
        return {
          fixed: true,
          reason: 'Fixed: system-category: General → general'
        };
      }

      return { fixed: false, reason: 'No changes needed' };
    } catch (error) {
      return { fixed: false, reason: `Error: ${error.message}` };
    }
  }

  /**
   * Process all files in a directory
   */
  async processDirectory(dirPath, directoryName) {
    try {
      const files = await fs.readdir(dirPath);
      const mdFiles = files.filter(file => file.endsWith('.md'));

      console.log(`\n📂 Processing ${directoryName} directory: ${mdFiles.length} files`);

      for (const file of mdFiles) {
        const filePath = path.join(dirPath, file);
        const result = await this.fixFile(filePath);

        if (result.fixed) {
          this.fixedFiles.push({
            file: path.relative(process.cwd(), filePath),
            directory: directoryName
          });
          console.log(`  ✅ Fixed: ${file}`);
        } else {
          console.log(`  ⏭️  Skipped: ${file} (${result.reason})`);
        }
      }
    } catch (error) {
      console.error(`Error processing directory ${dirPath}:`, error.message);
      this.errors.push(`Directory error: ${dirPath} - ${error.message}`);
    }
  }

  /**
   * Run the batch fix
   */
  async run() {
    console.log('🔧 Starting Metadata Case Fix...');
    console.log('Fixing: system-category: "General" → "general"');

    // Process both directories
    await this.processDirectory(this.pagesDir, 'pages');
    await this.processDirectory(this.requiredPagesDir, 'required-pages');

    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('📋 FIX SUMMARY');
    console.log('='.repeat(50));
    console.log(`Files Fixed: ${this.fixedFiles.length}`);
    console.log(`Errors: ${this.errors.length}`);

    if (this.fixedFiles.length > 0) {
      console.log('\n✅ Fixed Files:');
      this.fixedFiles.forEach(item => {
        console.log(`   ${item.file}`);
      });
    }

    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(error => {
        console.log(`   ${error}`);
      });
    }

    console.log(`\n✨ Case fix complete! Fixed ${this.fixedFiles.length} files.`);
  }
}

// Run the fixer
if (require.main === module) {
  const fixer = new MetadataCaseFixer();
  fixer.run().catch(console.error);
}

module.exports = MetadataCaseFixer;