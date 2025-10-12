/**
 * WikiDocument Performance Benchmark
 *
 * Tests the performance of WikiDocument DOM operations using linkedom
 *
 * Related: GitHub Issue #93 - Phase 1.1
 */

const WikiDocument = require('../src/parsers/dom/WikiDocument');

// ANSI colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function formatTime(ms) {
  if (ms < 1) {
    return `${(ms * 1000).toFixed(2)}μs`;
  } else if (ms < 1000) {
    return `${ms.toFixed(2)}ms`;
  } else {
    return `${(ms / 1000).toFixed(2)}s`;
  }
}

function formatSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

console.log(`\n${colors.blue}WikiDocument Performance Benchmark${colors.reset}`);
console.log('=' .repeat(60));

// ========================================
// Benchmark 1: Document Creation
// ========================================

console.log(`\n${colors.cyan}Benchmark 1: Document Creation${colors.reset}`);
const iterations1 = 1000;
const startMem1 = process.memoryUsage().heapUsed;
const start1 = Date.now();

for (let i = 0; i < iterations1; i++) {
  const doc = new WikiDocument('Test content', { page: 'TestPage' });
}

const end1 = Date.now();
const endMem1 = process.memoryUsage().heapUsed;
const time1 = end1 - start1;
const avgTime1 = time1 / iterations1;
const memUsed1 = endMem1 - startMem1;

console.log(`  Iterations: ${iterations1}`);
console.log(`  Total Time: ${formatTime(time1)}`);
console.log(`  Avg Time: ${formatTime(avgTime1)} per document`);
console.log(`  Memory Used: ${formatSize(memUsed1)}`);
console.log(`  Avg Memory: ${formatSize(memUsed1 / iterations1)} per document`);

// ========================================
// Benchmark 2: DOM Creation (100 elements)
// ========================================

console.log(`\n${colors.cyan}Benchmark 2: DOM Creation (100 elements each)${colors.reset}`);
const iterations2 = 100;
const elementsPerDoc = 100;
const startMem2 = process.memoryUsage().heapUsed;
const start2 = Date.now();

for (let i = 0; i < iterations2; i++) {
  const doc = new WikiDocument('Test content', { page: 'TestPage' });

  for (let j = 0; j < elementsPerDoc; j++) {
    const el = doc.createElement('p', { id: `para-${j}`, class: 'wiki-para' });
    const text = doc.createTextNode(`This is paragraph ${j} with some test content.`);
    el.appendChild(text);
    doc.appendChild(el);
  }
}

const end2 = Date.now();
const endMem2 = process.memoryUsage().heapUsed;
const time2 = end2 - start2;
const avgTime2 = time2 / iterations2;
const memUsed2 = endMem2 - startMem2;

console.log(`  Iterations: ${iterations2}`);
console.log(`  Elements per doc: ${elementsPerDoc}`);
console.log(`  Total Time: ${formatTime(time2)}`);
console.log(`  Avg Time: ${formatTime(avgTime2)} per document`);
console.log(`  Memory Used: ${formatSize(memUsed2)}`);
console.log(`  Avg Memory: ${formatSize(memUsed2 / iterations2)} per document`);

// ========================================
// Benchmark 3: Serialization
// ========================================

console.log(`\n${colors.cyan}Benchmark 3: HTML Serialization${colors.reset}`);
const iterations3 = 1000;

// Create a document with content
const doc3 = new WikiDocument('Test content', { page: 'TestPage' });
for (let j = 0; j < 50; j++) {
  const el = doc3.createElement('p', { id: `para-${j}` });
  const text = doc3.createTextNode(`Paragraph ${j}`);
  el.appendChild(text);
  doc3.appendChild(el);
}

const startMem3 = process.memoryUsage().heapUsed;
const start3 = Date.now();

for (let i = 0; i < iterations3; i++) {
  const html = doc3.toHTML();
}

const end3 = Date.now();
const endMem3 = process.memoryUsage().heapUsed;
const time3 = end3 - start3;
const avgTime3 = time3 / iterations3;
const memUsed3 = endMem3 - startMem3;
const htmlSize = doc3.toHTML().length;

console.log(`  Iterations: ${iterations3}`);
console.log(`  HTML Size: ${formatSize(htmlSize)}`);
console.log(`  Total Time: ${formatTime(time3)}`);
console.log(`  Avg Time: ${formatTime(avgTime3)} per serialization`);
console.log(`  Memory Used: ${formatSize(memUsed3)}`);

// ========================================
// Benchmark 4: DOM Query
// ========================================

console.log(`\n${colors.cyan}Benchmark 4: DOM Query (querySelector)${colors.reset}`);
const iterations4 = 10000;

// Create a document with many elements
const doc4 = new WikiDocument('Test content', { page: 'TestPage' });
for (let j = 0; j < 100; j++) {
  const el = doc4.createElement('p', { id: `para-${j}`, class: 'wiki-para' });
  const text = doc4.createTextNode(`Paragraph ${j}`);
  el.appendChild(text);
  doc4.appendChild(el);
}

const start4 = Date.now();

for (let i = 0; i < iterations4; i++) {
  const result = doc4.querySelector('#para-50');
}

const end4 = Date.now();
const time4 = end4 - start4;
const avgTime4 = time4 / iterations4;

console.log(`  Iterations: ${iterations4}`);
console.log(`  Elements: 100`);
console.log(`  Total Time: ${formatTime(time4)}`);
console.log(`  Avg Time: ${formatTime(avgTime4)} per query`);

// ========================================
// Benchmark 5: JSON Serialization/Deserialization
// ========================================

console.log(`\n${colors.cyan}Benchmark 5: JSON Caching${colors.reset}`);
const iterations5 = 100;

// Create a document
const doc5 = new WikiDocument('Original content', { page: 'TestPage' });
for (let j = 0; j < 20; j++) {
  const el = doc5.createElement('p', { id: `para-${j}` });
  const text = doc5.createTextNode(`Paragraph ${j}`);
  el.appendChild(text);
  doc5.appendChild(el);
}

// Benchmark toJSON
const start5a = Date.now();
for (let i = 0; i < iterations5; i++) {
  const json = doc5.toJSON();
}
const end5a = Date.now();
const time5a = end5a - start5a;
const avgTime5a = time5a / iterations5;

// Benchmark fromJSON
const json5 = doc5.toJSON();
const jsonSize = JSON.stringify(json5).length;

const start5b = Date.now();
for (let i = 0; i < iterations5; i++) {
  const restored = WikiDocument.fromJSON(json5);
}
const end5b = Date.now();
const time5b = end5b - start5b;
const avgTime5b = time5b / iterations5;

console.log(`  Iterations: ${iterations5}`);
console.log(`  JSON Size: ${formatSize(jsonSize)}`);
console.log(`  toJSON Time: ${formatTime(time5a)} total, ${formatTime(avgTime5a)} avg`);
console.log(`  fromJSON Time: ${formatTime(time5b)} total, ${formatTime(avgTime5b)} avg`);

// ========================================
// Benchmark 6: Complex Page Simulation
// ========================================

console.log(`\n${colors.cyan}Benchmark 6: Complex Wiki Page Simulation${colors.reset}`);
const iterations6 = 100;

const start6 = Date.now();
const startMem6 = process.memoryUsage().heapUsed;

for (let i = 0; i < iterations6; i++) {
  const doc = new WikiDocument('Complex wiki content', { page: 'ComplexPage' });

  // Add headings
  for (let h = 1; h <= 3; h++) {
    const heading = doc.createElement(`h${h}`, { id: `heading-${h}` });
    heading.textContent = `Heading Level ${h}`;
    doc.appendChild(heading);

    // Add paragraphs under each heading
    for (let p = 0; p < 5; p++) {
      const para = doc.createElement('p', { class: 'wiki-para' });
      para.textContent = `This is paragraph ${p} under heading ${h}.`;
      doc.appendChild(para);

      // Add list
      const list = doc.createElement('ul');
      for (let li = 0; li < 3; li++) {
        const item = doc.createElement('li');
        item.textContent = `List item ${li}`;
        list.appendChild(item);
      }
      doc.appendChild(list);
    }
  }

  // Serialize to HTML
  const html = doc.toHTML();
}

const end6 = Date.now();
const endMem6 = process.memoryUsage().heapUsed;
const time6 = end6 - start6;
const avgTime6 = time6 / iterations6;
const memUsed6 = endMem6 - startMem6;

console.log(`  Iterations: ${iterations6}`);
console.log(`  Total Time: ${formatTime(time6)}`);
console.log(`  Avg Time: ${formatTime(avgTime6)} per page`);
console.log(`  Memory Used: ${formatSize(memUsed6)}`);
console.log(`  Avg Memory: ${formatSize(memUsed6 / iterations6)} per page`);

// ========================================
// Summary
// ========================================

console.log(`\n${colors.green}Summary${colors.reset}`);
console.log('=' .repeat(60));
console.log(`✅ Document Creation: ${formatTime(avgTime1)}`);
console.log(`✅ DOM Building (100 elements): ${formatTime(avgTime2)}`);
console.log(`✅ HTML Serialization: ${formatTime(avgTime3)}`);
console.log(`✅ DOM Query: ${formatTime(avgTime4)}`);
console.log(`✅ JSON Caching: ${formatTime(avgTime5a)} (save) / ${formatTime(avgTime5b)} (restore)`);
console.log(`✅ Complex Page: ${formatTime(avgTime6)}`);

// Success criteria check
console.log(`\n${colors.blue}Success Criteria${colors.reset}`);
console.log('=' .repeat(60));

const criteria = [
  { name: 'Parse time < 10ms per page', pass: avgTime6 < 10, value: formatTime(avgTime6) },
  { name: 'Memory < 5MB per 100 pages', pass: (memUsed6 / iterations6) * 100 < 5 * 1024 * 1024, value: formatSize((memUsed6 / iterations6) * 100) },
  { name: 'Serialization < 2ms', pass: avgTime3 < 2, value: formatTime(avgTime3) },
  { name: 'Query time < 1ms', pass: avgTime4 < 1, value: formatTime(avgTime4) }
];

criteria.forEach(({ name, pass, value }) => {
  const status = pass ? `${colors.green}✅ PASS${colors.reset}` : `${colors.yellow}⚠️  FAIL${colors.reset}`;
  console.log(`${status} ${name}: ${value}`);
});

const allPass = criteria.every(c => c.pass);
console.log(`\n${allPass ? colors.green : colors.yellow}Overall: ${allPass ? 'ALL CRITERIA MET' : 'SOME CRITERIA NOT MET'}${colors.reset}\n`);

process.exit(allPass ? 0 : 1);
