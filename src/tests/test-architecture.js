/**
 * Test script for the new JSPWiki-inspired architecture
 */
const WikiEngine = require('./src/WikiEngine');

async function testNewArchitecture() {
  console.log('🚀 Testing new amdWiki architecture...\n');

  try {
    // Create engine with custom configuration
    const engine = await WikiEngine.createDefault({
      applicationName: 'amdWiki Test',
      wiki: {
        pagesDir: './pages',
        templatesDir: './wiki.conf/templates'
      }
    });

    // Test PageManager
    console.log('📄 Testing PageManager...');
    const pageManager = engine.getPageManager();
    
    if (pageManager) {
      const pageNames = await pageManager.getPageNames();
      console.log(`   Found ${pageNames.length} pages: ${pageNames.slice(0, 3).join(', ')}${pageNames.length > 3 ? '...' : ''}`);
      
      // Test getting a page
      if (pageNames.length > 0) {
        const page = await pageManager.getPage(pageNames[0]);
        console.log(`   Loaded page '${page.name}' with ${page.content.length} characters`);
      }
    }

    // Test PluginManager
    console.log('\n🔌 Testing PluginManager...');
    const pluginManager = engine.getPluginManager();
    
    if (pluginManager) {
      const pluginNames = pluginManager.getPluginNames();
      console.log(`   Found ${pluginNames.length} plugins: ${pluginNames.join(', ')}`);
      
      // Test plugin execution
      if (pluginManager.hasPlugin('ReferringPagesPlugin')) {
        const result = pluginManager.execute('ReferringPagesPlugin', 'Test', '', { linkGraph: { 'Test': ['Page1', 'Page2'] } });
        console.log(`   ReferringPagesPlugin output: ${result.substring(0, 50)}...`);
      }
    }

    // Test Configuration
    console.log('\n⚙️  Testing Configuration...');
    const config = engine.getConfig();
    console.log(`   Application: ${config.get('applicationName')}`);
    console.log(`   Pages directory: ${config.get('wiki.pagesDir')}`);
    console.log(`   Managers enabled: ${Object.keys(config.get('managers', {})).filter(k => config.get(`managers.${k}.enabled`)).join(', ')}`);

    console.log('\n✅ Architecture test completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Create remaining managers (RenderingManager, SearchManager, etc.)');
    console.log('   2. Migrate existing app.js routes to use new managers');
    console.log('   3. Add comprehensive error handling and logging');
    console.log('   4. Implement configuration file loading');
    console.log('   5. Add unit tests for all components');

    await engine.shutdown();

  } catch (error) {
    console.error('❌ Architecture test failed:', error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testNewArchitecture();
}

module.exports = testNewArchitecture;
