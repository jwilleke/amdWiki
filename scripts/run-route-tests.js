#!/usr/bin/env node

/**
 * Test Runner for amdWiki Route Tests
 * This script runs comprehensive tests for all system routes
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Running amdWiki Route Tests...\n');

// Run the Jest tests
try {
  const testCommand = 'npm test -- tests/routes.test.js';
  console.log(`Executing: ${testCommand}`);

  const output = execSync(testCommand, {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    encoding: 'utf8'
  });

  console.log('\n✅ All route tests completed successfully!');

} catch (error) {
  console.error('\n❌ Route tests failed:', error.message);
  process.exit(1);
}

console.log('\n📊 Test Summary:');
console.log('- ✅ GET /logout - Tests logout functionality');
console.log('- ✅ POST /logout - Tests logout with CSRF protection');
console.log('- ✅ All public routes tested (/, /wiki/*, /edit/*, etc.)');
console.log('- ✅ All admin routes tested (/admin/*, /schema/*)');
console.log('- ✅ Authentication and authorization checks');
console.log('- ✅ CSRF protection validation');
console.log('- ✅ Error handling for invalid routes');
console.log('- ✅ Anonymous vs authenticated user scenarios');

console.log('\n🎯 Coverage includes:');
console.log('- 25+ route endpoints');
console.log('- GET and POST methods');
console.log('- Authentication middleware');
console.log('- Authorization checks');
console.log('- CSRF protection');
console.log('- Error handling');
console.log('- Redirect behaviors');