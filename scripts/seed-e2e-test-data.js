#!/usr/bin/env node
/**
 * Seed E2E Test Data
 *
 * Creates the necessary test fixtures for E2E tests using the app's
 * actual managers. This ensures compatibility with the current user
 * structure and password hashing algorithm.
 *
 * Usage:
 *   node scripts/seed-e2e-test-data.js
 *
 * Environment variables:
 *   E2E_ADMIN_USER - Admin username (default: admin)
 *   E2E_ADMIN_PASS - Admin password (default: admin123)
 *   INSTANCE_DATA_FOLDER - Data directory (default: ./data)
 */

const path = require('path');
const fs = require('fs-extra');

// Set test environment
process.env.NODE_ENV = process.env.NODE_ENV || 'test';

async function seedTestData() {
  const instanceDataFolder = process.env.INSTANCE_DATA_FOLDER || './data';
  const adminUser = process.env.E2E_ADMIN_USER || 'admin';
  const adminPass = process.env.E2E_ADMIN_PASS || 'admin123';

  console.log('🌱 Seeding E2E test data...');
  console.log(`   Instance data folder: ${instanceDataFolder}`);
  console.log(`   Admin user: ${adminUser}`);

  try {
    // Ensure directories exist
    const dirs = [
      'config',
      'pages',
      'users',
      'logs',
      'sessions',
      'search-index',
      'attachments',
      'backups'
    ];

    for (const dir of dirs) {
      const dirPath = path.join(instanceDataFolder, dir);
      await fs.ensureDir(dirPath);
    }
    console.log('✅ Directories created');

    // Initialize WikiEngine to get proper managers
    // Use compiled version from dist/ (requires npm run build first)
    const WikiEngine = require('../dist/src/WikiEngine');
    const engine = new WikiEngine();
    await engine.initialize();

    const userManager = engine.getManager('UserManager');
    if (!userManager) {
      throw new Error('UserManager not available');
    }

    // Check if admin user exists
    let user = await userManager.getUser(adminUser);

    if (user) {
      // Update existing user's password
      console.log(`   Updating existing user: ${adminUser}`);
      const hashedPassword = userManager.hashPassword(adminPass);
      await userManager.updateUser(adminUser, {
        password: hashedPassword,
        isActive: true
      });
    } else {
      // Create new admin user
      console.log(`   Creating new user: ${adminUser}`);
      await userManager.createUser({
        username: adminUser,
        email: `${adminUser}@localhost`,
        password: adminPass, // createUser should hash this
        displayName: 'Test Administrator',
        roles: ['admin'],
        isActive: true,
        isSystem: false,
        isExternal: false
      });
    }
    console.log('✅ Admin user ready');

    // Copy startup pages if pages directory is empty
    const pagesDir = path.join(instanceDataFolder, 'pages');
    const existingPages = await fs.readdir(pagesDir);
    const mdFiles = existingPages.filter(f => f.endsWith('.md'));

    if (mdFiles.length === 0) {
      const requiredPagesDir = path.join(process.cwd(), 'required-pages');
      if (await fs.pathExists(requiredPagesDir)) {
        const requiredPages = await fs.readdir(requiredPagesDir);
        const requiredMdFiles = requiredPages.filter(f => f.endsWith('.md'));

        for (const file of requiredMdFiles) {
          await fs.copy(
            path.join(requiredPagesDir, file),
            path.join(pagesDir, file)
          );
        }
        console.log(`✅ Copied ${requiredMdFiles.length} startup pages`);
      }
    } else {
      console.log(`✅ Pages already exist (${mdFiles.length} files)`);
    }

    // Create .install-complete marker
    const installCompleteFile = path.join(instanceDataFolder, '.install-complete');
    await fs.writeFile(installCompleteFile, new Date().toISOString());
    console.log('✅ Installation marked complete');

    // Shutdown engine gracefully
    if (engine.shutdown) {
      await engine.shutdown();
    }

    console.log('\n🎉 E2E test data seeded successfully!');
    console.log(`   Login with: ${adminUser} / ${adminPass}`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Failed to seed test data:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

seedTestData();
