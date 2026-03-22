#!/bin/bash
# Smoke Tests - Quick validation before committing
# Run with: npm run smoke

set -e

echo "🚬 Running smoke tests..."
echo ""

# 1. Check critical files exist
echo "✓ Checking critical files..."
test -f "config/app-default-config.json" || (echo "❌ Missing config/app-default-config.json" && exit 1)
test -f "src/WikiEngine.js" || (echo "❌ Missing src/WikiEngine.js" && exit 1)
test -f "app.js" || (echo "❌ Missing app.js" && exit 1)
echo "  ✅ Critical files present"
echo ""

# 2. Verify critical configuration properties
echo "✓ Verifying configuration..."
node -e "
  const config = require('./config/app-default-config.json');
  const required = [
    'ngdpbase.server.port',
    'ngdpbase.applicationName',
    'ngdpbase.page.provider.filesystem.storagedir'
  ];
  required.forEach(key => {
    if (!config[key]) throw new Error('Missing config: ' + key);
  });
" || (echo "❌ Configuration validation failed" && exit 1)
echo "  ✅ Configuration validated"
echo ""

# 3. Test WikiEngine initialization (quick check)
echo "✓ Testing WikiEngine initialization..."
timeout 30 node -e "
  const WikiEngine = require('./src/WikiEngine');
  const engine = new WikiEngine();
  engine.initialize().then(() => {
    const required = ['PageManager', 'RenderingManager', 'UserManager'];
    required.forEach(name => {
      if (!engine.getManager(name)) throw new Error('Manager not loaded: ' + name);
    });
    console.log('  ✅ WikiEngine initialized successfully');
    process.exit(0);
  }).catch(err => {
    console.error('❌ WikiEngine initialization failed:', err.message);
    process.exit(1);
  });
" || exit 1
echo ""

# 4. Check for syntax errors in key files
echo "✓ Checking for syntax errors..."
node -e "
  const fs = require('fs');
  const files = [
    'src/WikiEngine.js',
    'src/managers/PageManager.js',
    'src/managers/RenderingManager.js'
  ];
  files.forEach(file => {
    try {
      require('./' + file);
    } catch(err) {
      console.error('Syntax error in', file, ':', err.message);
      process.exit(1);
    }
  });
  console.log('  ✅ No syntax errors found');
" || exit 1
echo ""

# 5. Verify package.json is valid
echo "✓ Verifying package.json..."
node -e "require('./package.json')" || (echo "❌ package.json is invalid" && exit 1)
echo "  ✅ package.json is valid"
echo ""

echo "✅ All smoke tests passed!"
echo ""
echo "Next steps:"
echo "  - Run full tests: npm test"
echo "  - Run with coverage: npm run test:coverage"
echo "  - Run integration tests: npm run test:integration"
