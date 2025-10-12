const { DOMParser } = require('./src/parsers/dom/DOMParser');
const DOMVariableHandler = require('./src/parsers/dom/handlers/DOMVariableHandler');

const parser = new DOMParser();

// Mock engine for variable resolution
const mockEngine = {
  getManager: (name) => {
    if (name === 'VariableManager') {
      return {
        variableHandlers: new Map([
          ['applicationname', () => 'amdWiki']
        ])
      };
    }
    return null;
  }
};

const handler = new DOMVariableHandler(mockEngine);

// Test case: variable with [{$...}] syntax
// In amdWiki, variables use [{...}] or [{$...}] as the variable syntax
// The brackets are part of the syntax, not literal brackets in output
const markup = '[{$applicationname}]';

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

    // Expected: [{$applicationname}] should render as amdWiki (without brackets)
    // The [{...}] is the variable syntax, not literal brackets
    if (html.includes('amdWiki') && html.includes('wiki-variable')) {
      console.log('✅ Variable resolved to: amdWiki');
    } else {
      console.log('❌ Variable NOT resolved correctly');
    }
  } catch (e) {
    console.log('❌ Error:', e.message);
  }
})();
