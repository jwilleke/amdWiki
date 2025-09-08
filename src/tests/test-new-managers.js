const WikiEngine = require('./src/WikiEngine');

async function testNewManagers() {
  console.log('🧪 Testing new managers functionality...\n');

  try {
    const engine = new WikiEngine();
    await engine.initialize({
      name: 'amdWiki Test',
      pagesDirectory: './pages',
      managers: {
        pageManager: { enabled: true },
        pluginManager: { enabled: true },
        renderingManager: { enabled: true },
        searchManager: { enabled: true },
        templateManager: { enabled: true }
      }
    });

    // Test RenderingManager
    console.log('🎨 Testing RenderingManager...');
    const renderingManager = engine.getManager('RenderingManager');
    
    const testContent = `# Test Page
    
This is a test with a [{$pagename}] macro and a [Welcome] wiki link.

Here's a plugin macro: [{referringPagesPlugin page="Categories"}]`;

    const renderedHtml = renderingManager.renderMarkdown(testContent, 'Test Page', null);
    console.log('   Rendered HTML preview:');
    console.log('   ' + renderedHtml.substring(0, 200) + '...\n');

    // Test SearchManager
    console.log('🔍 Testing SearchManager...');
    const searchManager = engine.getManager('SearchManager');
    
    const searchResults = searchManager.search('welcome');
    console.log(`   Search for "welcome" found ${searchResults.length} results:`);
    searchResults.forEach(result => {
      console.log(`   - ${result.name} (score: ${result.score.toFixed(3)})`);
    });

    // Test search suggestions
    const suggestions = searchManager.getSuggestions('welc');
    console.log(`   Suggestions for "welc": ${suggestions.join(', ')}\n`);

    // Test link graph
    console.log('📊 Testing link graph...');
    const linkGraph = renderingManager.getLinkGraph();
    console.log(`   Link graph contains ${Object.keys(linkGraph).length} entries`);
    
    const referringPages = renderingManager.getReferringPages('Welcome');
    console.log(`   Pages referring to "Welcome": ${referringPages.join(', ')}\n`);

    console.log('✅ New manager tests completed successfully!');
    
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
}

testNewManagers();
