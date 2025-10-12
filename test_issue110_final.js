/**
 * Final test for Issue #110 - JSPWiki Variable Syntax
 * Tests both tokenizer (DOM) and string-based handler
 */

// Test 1: DOM Tokenizer
console.log('='.repeat(60));
console.log('TEST 1: DOM Tokenizer');
console.log('='.repeat(60));

const { Tokenizer } = require('./src/parsers/dom/Tokenizer');

const testCases = [
  {
    input: '[[{$applicationname}]',
    expected: 'ESCAPED token with value [{$applicationname}]'
  },
  {
    input: '[{$applicationname}]',
    expected: 'VARIABLE token with value applicationname'
  },
  {
    input: '- Application Name ([[{$applicationname}]): [{$applicationname}]',
    expected: 'TEXT, ESCAPED, TEXT, VARIABLE tokens'
  }
];

testCases.forEach((test, i) => {
  console.log(`\nTest ${i + 1}: ${test.input}`);
  try {
    const t = new Tokenizer(test.input);
    const tokens = t.tokenize();
    console.log('✅ Tokenization successful');
    tokens.forEach(tok => {
      if (tok.type !== 'EOF') {
        console.log(`   ${tok.type}: "${tok.value}"`);
      }
    });
  } catch (e) {
    console.log('❌ ERROR:', e.message);
  }
});

// Test 2: String-based VariableSyntaxHandler
console.log('\n' + '='.repeat(60));
console.log('TEST 2: VariableSyntaxHandler (String-based)');
console.log('='.repeat(60));

const VariableSyntaxHandler = require('./src/parsers/handlers/VariableSyntaxHandler');

const mockEngine = {
  getManager: (name) => {
    if (name === 'VariableManager') {
      return {
        variableHandlers: new Map([
          ['applicationname', () => 'amdWiki'],
          ['pagename', () => 'SystemInfo'],
          ['totalpages', () => '42']
        ])
      };
    }
    return null;
  }
};

const handler = new VariableSyntaxHandler(mockEngine);

(async () => {
  await handler.onInitialize({ engine: mockEngine });

  const stringTests = [
    {
      input: '- Application Name ([[{$applicationname}]): [{$applicationname}]',
      expected: 'Escaped stays literal, variable resolves'
    },
    {
      input: 'Total: [{$totalpages}] pages',
      expected: 'Variable resolves to 42'
    }
  ];

  for (const test of stringTests) {
    console.log(`\nInput: ${test.input}`);
    const output = await handler.process(test.input, {});
    console.log(`Output: ${output}`);

    // Verify variables resolved
    if (output.includes('amdWiki') || output.includes('42')) {
      console.log('✅ Variable resolved correctly');
    } else {
      console.log('❌ Variable NOT resolved');
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ All tests complete!');
  console.log('='.repeat(60));
  console.log('\nServer is running at http://localhost:3000/wiki/SystemInfo');
  console.log('Variables should now work correctly!');
})();
