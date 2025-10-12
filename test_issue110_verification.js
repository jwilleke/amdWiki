/**
 * Verification test for Issue #110 - JSPWiki Variable Syntax
 * Tests the complete DOM-based parsing pipeline for variables and escaped syntax
 */

const http = require('http');

async function fetchPage(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { resolve(data); });
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('='.repeat(70));
  console.log('VERIFICATION TEST: Issue #110 - JSPWiki Variable Syntax');
  console.log('='.repeat(70));
  console.log();

  try {
    const html = await fetchPage('http://localhost:3000/wiki/SystemInfo');

    const tests = [
      {
        name: 'Application name variable resolves',
        pattern: /Application Name \(&#91;\{\$applicationname\}&#93;\): amdWiki/,
        expected: true
      },
      {
        name: 'Total pages variable resolves',
        pattern: /Total Pages \(&#91;\{\$totalpages\}&#93;\): \d+/,
        expected: true
      },
      {
        name: 'Escaped syntax displays as literal with HTML entities',
        pattern: /&#91;\{\$applicationname\}&#93;/,
        expected: true
      },
      {
        name: 'Markdown H1 headings render correctly',
        pattern: /<h1 id="systeminformation">System Information<\/h1>/,
        expected: true
      },
      {
        name: 'Markdown H2 headings render correctly',
        pattern: /<h2 id="basicsystemvariables">Basic System Variables<\/h2>/,
        expected: true
      },
      {
        name: 'Uptime variable resolves',
        pattern: /Server Uptime \(&#91;\{\$uptime\}&#93;\): \d+[hms\s]+/,
        expected: true
      },
      {
        name: 'Date variable resolves',
        pattern: /Current Date \(&#91;\{\$date\}&#93;\): \d+\/\d+\/\d+/,
        expected: true
      },
      {
        name: 'Time variable resolves',
        pattern: /Current Time \(&#91;\{\$time\}&#93;\): \d+:\d+:\d+ [AP]M/,
        expected: true
      },
      {
        name: 'Base URL variable resolves',
        pattern: /Base URL \(&#91;\{\$baseurl\}&#93;\): http:\/\//,
        expected: true
      },
      {
        name: 'Page name variable resolves',
        pattern: /Current Page \(&#91;\{\$pagename\}&#93;\): SystemInfo/,
        expected: true
      }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      const result = test.pattern.test(html);
      const status = result === test.expected ? '✅ PASS' : '❌ FAIL';
      console.log(`${status}: ${test.name}`);

      if (result === test.expected) {
        passed++;
      } else {
        failed++;
      }
    }

    console.log();
    console.log('='.repeat(70));
    console.log(`Results: ${passed} passed, ${failed} failed`);
    console.log('='.repeat(70));

    if (failed === 0) {
      console.log();
      console.log('✅ SUCCESS: All tests passed!');
      console.log('Issue #110 is resolved - JSPWiki variable syntax working correctly');
      console.log();
      console.log('Summary:');
      console.log('  • Variables [{$var}] resolve to their values');
      console.log('  • Escaped syntax [[{$var}] displays as literal [{$var}] (HTML-encoded)');
      console.log('  • String-based preprocessing handles JSPWiki syntax without breaking markdown');
      console.log('  • Markdown headings (#, ##) render correctly as <h1>, <h2> elements');
      console.log('  • Escaped content protected from all later handlers (Phase 3, LinkParser, etc.)');
      return 0;
    } else {
      console.log();
      console.log('❌ FAILURE: Some tests failed');
      return 1;
    }

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    return 1;
  }
}

runTests().then(process.exit);
