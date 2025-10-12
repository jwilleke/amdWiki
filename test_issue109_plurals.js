/**
 * Test for Issue #109 - English Plural Matching
 * Tests PageNameMatcher's plural matching functionality
 */

const PageNameMatcher = require('./src/utils/PageNameMatcher');

console.log('='.repeat(70));
console.log('TEST: Issue #109 - English Plural Matching');
console.log('='.repeat(70));
console.log();

// Create matcher with plurals enabled
const matcher = new PageNameMatcher(true);

// Simulate existing page names
const existingPages = [
  'HomePage',
  'Category',
  'Box',
  'Class',
  'Click',
  'Page',
  'Virus'
];

console.log('Existing pages:', existingPages.join(', '));
console.log();

const tests = [
  // Test 1: Plural → Singular (s)
  {
    search: 'HomePages',
    expected: 'HomePage',
    description: 'Plural "HomePages" should match singular "HomePage"'
  },
  // Test 2: Singular → Plural (s)
  {
    search: 'Clicks',
    expected: 'Click',
    description: 'Plural "Clicks" should match singular "Click"'
  },
  // Test 3: Plural → Singular (y → ies)
  {
    search: 'Categories',
    expected: 'Category',
    description: 'Plural "Categories" should match singular "Category"'
  },
  // Test 4: Plural → Singular (es)
  {
    search: 'Boxes',
    expected: 'Box',
    description: 'Plural "Boxes" should match singular "Box"'
  },
  // Test 5: Plural → Singular (es for class)
  {
    search: 'Classes',
    expected: 'Class',
    description: 'Plural "Classes" should match singular "Class"'
  },
  // Test 6: Singular → Plural (s)
  {
    search: 'Pages',
    expected: 'Page',
    description: 'Plural "Pages" should match singular "Page"'
  },
  // Test 7: Singular → Plural (es for virus)
  {
    search: 'Viruses',
    expected: 'Virus',
    description: 'Plural "Viruses" should match singular "Virus"'
  },
  // Test 8: No match
  {
    search: 'NonExistent',
    expected: null,
    description: 'Non-existent page should return null'
  }
];

let passed = 0;
let failed = 0;

for (const test of tests) {
  const result = matcher.findMatch(test.search, existingPages);
  const success = result === test.expected;

  if (success) {
    console.log(`✅ PASS: ${test.description}`);
    console.log(`   Search: "${test.search}" → Found: "${result}"`);
    passed++;
  } else {
    console.log(`❌ FAIL: ${test.description}`);
    console.log(`   Search: "${test.search}"`);
    console.log(`   Expected: "${test.expected}"`);
    console.log(`   Got: "${result}"`);
    failed++;
  }
  console.log();
}

console.log('='.repeat(70));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('='.repeat(70));

if (failed === 0) {
  console.log();
  console.log('✅ SUCCESS: All plural matching tests passed!');
  console.log('Issue #109 is resolved - English plural matching works correctly');
  console.log();
  console.log('Features:');
  console.log('  • Simple plurals: Click ↔ Clicks');
  console.log('  • Y to IES: Category ↔ Categories');
  console.log('  • ES endings: Box ↔ Boxes, Class ↔ Classes');
  console.log('  • Configuration: amdwiki.translatorReader.matchEnglishPlurals (default: true)');
  process.exit(0);
} else {
  console.log();
  console.log('❌ FAILURE: Some tests failed');
  process.exit(1);
}
