/**
 * Quick test to verify the markdown heading bug is fixed
 *
 * The bug was that ## Heading was being converted to list items instead of <h2>
 * This was because the Tokenizer was parsing BOTH markdown AND JSPWiki syntax.
 *
 * The fix: Use parseWithDOMExtraction() which:
 * 1. Extracts ONLY JSPWiki syntax
 * 2. Lets Showdown handle ALL markdown
 * 3. Merges DOM nodes back into the HTML
 */

const MarkupParser = require('./src/parsers/MarkupParser');
const DOMVariableHandler = require('./src/parsers/dom/handlers/DOMVariableHandler');
const DOMPluginHandler = require('./src/parsers/dom/handlers/DOMPluginHandler');
const DOMLinkHandler = require('./src/parsers/dom/handlers/DOMLinkHandler');

// Create mock engine
const mockEngine = {
  getManager: (name) => {
    if (name === 'VariableManager') {
      const variableHandlers = new Map();
      variableHandlers.set('username', (context) => context?.userName || 'TestUser');
      variableHandlers.set('applicationname', () => 'amdWiki');
      return { variableHandlers };
    }
    if (name === 'PluginManager') {
      return {
        execute: async (pluginName) => {
          if (pluginName === 'TOC') return '<div class="toc">Table of Contents</div>';
          return '';
        }
      };
    }
    if (name === 'ConfigurationManager') {
      return { getProperty: (key, def) => def };
    }
    if (name === 'PageManager') {
      return { getAllPages: async () => ['HomePage', 'Features'] };
    }
    return null;
  }
};

async function runTest() {
  console.log('\n========================================');
  console.log('Testing Markdown Heading Bug Fix');
  console.log('========================================\n');

  // Create parser
  const parser = new MarkupParser(mockEngine);
  parser.domVariableHandler = new DOMVariableHandler(mockEngine);
  await parser.domVariableHandler.initialize();
  parser.domPluginHandler = new DOMPluginHandler(mockEngine);
  await parser.domPluginHandler.initialize();
  parser.domLinkHandler = new DOMLinkHandler(mockEngine);
  await parser.domLinkHandler.initialize();

  // Test content with markdown headings and JSPWiki syntax
  const content = `
## Welcome to amdWiki

This is a test of the new DOM extraction pipeline.

### Features

- Variables: [{$username}]
- Plugins: [{TOC}]
- Links: [HomePage]

#### Subheading

Some **bold** and *italic* text.

## Another Heading

User: [{$username}]
App: [{$applicationname}]
  `.trim();

  console.log('Input Content:');
  console.log('---');
  console.log(content);
  console.log('\n');

  // Parse using the new DOM extraction method
  const context = { userName: 'JohnDoe' };
  const result = await parser.parseWithDOMExtraction(content, context);

  console.log('Output HTML:');
  console.log('---');
  console.log(result);
  console.log('\n');

  // Verify headings are correct
  console.log('Verification:');
  console.log('---');

  const hasH2 = result.includes('<h2');
  const hasH3 = result.includes('<h3');
  const hasH4 = result.includes('<h4');
  const hasWelcome = result.includes('Welcome to amdWiki');
  const hasFeatures = result.includes('Features');
  const hasSubheading = result.includes('Subheading');
  const hasAnotherHeading = result.includes('Another Heading');

  const hasVariable = result.includes('JohnDoe');
  const hasPlugin = result.includes('toc');
  const hasLink = result.includes('HomePage');

  const hasListItems = result.includes('<li>');
  const noBug = !result.includes('## Welcome'); // Should not have literal ## in output

  console.log(`✓ H2 headings present: ${hasH2 ? 'YES ✅' : 'NO ❌'}`);
  console.log(`✓ H3 headings present: ${hasH3 ? 'YES ✅' : 'NO ❌'}`);
  console.log(`✓ H4 headings present: ${hasH4 ? 'YES ✅' : 'NO ❌'}`);
  console.log(`✓ "Welcome to amdWiki" in output: ${hasWelcome ? 'YES ✅' : 'NO ❌'}`);
  console.log(`✓ "Features" in output: ${hasFeatures ? 'YES ✅' : 'NO ❌'}`);
  console.log(`✓ "Subheading" in output: ${hasSubheading ? 'YES ✅' : 'NO ❌'}`);
  console.log(`✓ "Another Heading" in output: ${hasAnotherHeading ? 'YES ✅' : 'NO ❌'}`);
  console.log(`✓ Variable resolved (JohnDoe): ${hasVariable ? 'YES ✅' : 'NO ❌'}`);
  console.log(`✓ Plugin executed (toc): ${hasPlugin ? 'YES ✅' : 'NO ❌'}`);
  console.log(`✓ Link created (HomePage): ${hasLink ? 'YES ✅' : 'NO ❌'}`);
  console.log(`✓ List items present: ${hasListItems ? 'YES ✅' : 'NO ❌'}`);
  console.log(`✓ No literal ## in output: ${noBug ? 'YES ✅' : 'NO ❌'}`);

  console.log('\n');

  if (hasH2 && hasH3 && hasH4 && hasVariable && hasPlugin && hasLink && noBug) {
    console.log('========================================');
    console.log('🎉 ALL TESTS PASSED! Markdown heading bug is FIXED!');
    console.log('========================================\n');
    return true;
  } else {
    console.log('========================================');
    console.log('❌ SOME TESTS FAILED!');
    console.log('========================================\n');
    return false;
  }
}

// Run the test
runTest().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Error running test:', error);
  process.exit(1);
});
