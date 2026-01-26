#!/usr/bin/env node
/**
 * Seed E2E Test Data
 *
 * Prepares the data directory for E2E tests. Simple file operations only.
 * WikiEngine will create the default admin (admin/admin123) on startup.
 *
 * Usage:
 *   node scripts/seed-e2e-test-data.js
 *
 * Environment variables:
 *   INSTANCE_DATA_FOLDER - Data directory (default: ./data)
 */

const path = require('path');
const fs = require('fs-extra');

async function seedTestData() {
  const instanceDataFolder = process.env.INSTANCE_DATA_FOLDER || './data';

  console.log('🌱 Seeding E2E test data...');
  console.log(`   Data folder: ${instanceDataFolder}`);

  try {
    // Create required directories
    const dirs = ['config', 'pages', 'users', 'logs', 'sessions', 'search-index', 'attachments', 'backups'];
    for (const dir of dirs) {
      await fs.ensureDir(path.join(instanceDataFolder, dir));
    }
    console.log('✅ Directories created');

    // Copy startup pages
    const pagesDir = path.join(instanceDataFolder, 'pages');
    const requiredPagesDir = path.join(process.cwd(), 'required-pages');

    if (await fs.pathExists(requiredPagesDir)) {
      const files = await fs.readdir(requiredPagesDir);
      const mdFiles = files.filter(f => f.endsWith('.md'));

      for (const file of mdFiles) {
        await fs.copy(
          path.join(requiredPagesDir, file),
          path.join(pagesDir, file)
        );
      }
      console.log(`✅ Copied ${mdFiles.length} startup pages`);
    }

    // Create .install-complete marker
    await fs.writeFile(
      path.join(instanceDataFolder, '.install-complete'),
      new Date().toISOString()
    );
    console.log('✅ Installation marked complete');

    console.log('\n🎉 E2E test data ready!');
    console.log('   WikiEngine will create default admin (admin/admin123) on startup');

  } catch (error) {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  }
}

seedTestData();
