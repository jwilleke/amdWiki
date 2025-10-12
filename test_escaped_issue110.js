const { DOMParser } = require('./src/parsers/dom/DOMParser');
const DOMVariableHandler = require('./src/parsers/dom/handlers/DOMVariableHandler');

const parser = new DOMParser();

// Mock engine for variable resolution
const mockEngine = {
  getManager: (name) => {
    if (name === 'VariableManager') {
      return {
        variableHandlers: new Map([
          ['applicationname', () => 'amdWiki'],
          ['pagename', () => 'SystemInfo']
        ])
      };
    }
    return null;
  }
};

const handler = new DOMVariableHandler(mockEngine);

// Test case from issue #110 (using single ] closing as per user requirement)
// Variables in amdWiki use [{...}] or [{$...}] syntax
const markup = '- Application Name ([[{$applicationname}]): [{$applicationname}]';

(async () => {
  await handler.initialize();

  console.log('Input:', markup);
  console.log('');

  try {
    const wikiDoc = parser.parse(markup, {});
    console.log('After parsing:', wikiDoc.toHTML());
    console.log('');

    // Process variables
    await handler.processVariables(wikiDoc, {});
    const html = wikiDoc.toHTML();

    console.log('After variable processing:', html);
    console.log('');

    // Expected: [[{$applicationname}]] should become literal [{$applicationname}]
    if (html.includes('[{$applicationname}]')) {
      console.log('✅ Escaped content shows literal: [{$applicationname}]');
    } else {
      console.log('❌ Escaped content NOT showing correctly');
    }

    // Expected: {$applicationname} should become amdWiki
    if (html.includes('amdWiki')) {
      console.log('✅ Variable resolved to: amdWiki');
    } else {
      console.log('❌ Variable NOT resolved');
    }
  } catch (e) {
    console.log('❌ Error:', e.message);
  }
})();
