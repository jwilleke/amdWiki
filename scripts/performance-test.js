#!/usr/bin/env node
/**
 * Performance Testing Script for amdWiki
 *
 * Gathers metrics from various components and runs performance benchmarks.
 *
 * Usage:
 *   node scripts/performance-test.js [--startup] [--api] [--file-io] [--all]
 *
 * Options:
 *   --startup   Test server startup time
 *   --api       Test API endpoint response times
 *   --file-io   Test file I/O performance
 *   --all       Run all tests (default)
 */

const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const { execSync, spawn } = require('child_process');

// Configuration
const CONFIG = {
  pagesDir: './data/pages',
  baseUrl: 'http://localhost:3000',
  testIterations: 5
};

// Results storage
const results = {
  timestamp: new Date().toISOString(),
  environment: {},
  tests: {}
};

/**
 * Gather environment information
 */
async function gatherEnvironment() {
  console.log('\n📊 Gathering Environment Info...\n');

  const pages = fs.readdirSync(CONFIG.pagesDir).filter(f => f.endsWith('.md'));
  const dataSize = execSync('du -sh data/ 2>/dev/null || echo "unknown"').toString().trim();
  const pagesSize = execSync('du -sh data/pages/ 2>/dev/null || echo "unknown"').toString().trim();

  results.environment = {
    pageCount: pages.length,
    dataSize: dataSize.split('\t')[0],
    pagesSize: pagesSize.split('\t')[0],
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch
  };

  console.log('  Pages:', results.environment.pageCount);
  console.log('  Data size:', results.environment.dataSize);
  console.log('  Pages size:', results.environment.pagesSize);
  console.log('  Node:', results.environment.nodeVersion);
}

/**
 * Test file I/O performance
 */
async function testFileIO() {
  console.log('\n📁 Testing File I/O Performance...\n');

  const files = fs.readdirSync(CONFIG.pagesDir)
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(CONFIG.pagesDir, f));

  // Test 1: Synchronous sequential reads
  let start = Date.now();
  for (const file of files) {
    fs.readFileSync(file, 'utf8');
  }
  const syncTime = Date.now() - start;
  console.log(`  Sync sequential reads: ${syncTime}ms (${(syncTime/files.length).toFixed(3)}ms/file)`);

  // Test 2: Async sequential reads
  start = Date.now();
  for (const file of files) {
    await fsp.readFile(file, 'utf8');
  }
  const asyncSeqTime = Date.now() - start;
  console.log(`  Async sequential reads: ${asyncSeqTime}ms (${(asyncSeqTime/files.length).toFixed(3)}ms/file)`);

  // Test 3: Parallel async reads
  start = Date.now();
  await Promise.all(files.map(file => fsp.readFile(file, 'utf8')));
  const parallelTime = Date.now() - start;
  console.log(`  Parallel async reads: ${parallelTime}ms (${(parallelTime/files.length).toFixed(3)}ms/file)`);

  // Test 4: With YAML parsing
  const matter = require('gray-matter');
  start = Date.now();
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    matter(content);
  }
  const yamlTime = Date.now() - start;
  console.log(`  Sync + YAML parse: ${yamlTime}ms (${(yamlTime/files.length).toFixed(3)}ms/file)`);

  results.tests.fileIO = {
    fileCount: files.length,
    syncSequential: { total: syncTime, perFile: syncTime/files.length },
    asyncSequential: { total: asyncSeqTime, perFile: asyncSeqTime/files.length },
    asyncParallel: { total: parallelTime, perFile: parallelTime/files.length },
    syncWithYaml: { total: yamlTime, perFile: yamlTime/files.length }
  };
}

/**
 * Test API endpoint performance (requires running server)
 */
async function testAPI() {
  console.log('\n🌐 Testing API Performance...\n');

  const endpoints = [
    { name: 'Home (redirect)', path: '/' },
    { name: 'Search', path: '/search?q=test' },
    { name: 'User Keywords API', path: '/api/user-keywords' }
  ];

  results.tests.api = {};

  for (const endpoint of endpoints) {
    const times = [];

    for (let i = 0; i < CONFIG.testIterations; i++) {
      const start = Date.now();
      try {
        const response = await fetch(`${CONFIG.baseUrl}${endpoint.path}`);
        times.push(Date.now() - start);
      } catch (error) {
        console.log(`  ⚠️  ${endpoint.name}: Server not responding`);
        break;
      }
    }

    if (times.length > 0) {
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const min = Math.min(...times);
      const max = Math.max(...times);

      console.log(`  ${endpoint.name}: avg=${avg.toFixed(1)}ms, min=${min}ms, max=${max}ms`);

      results.tests.api[endpoint.name] = { avg, min, max, samples: times.length };
    }
  }
}

/**
 * Test Lunr index build time
 */
async function testLunrIndex() {
  console.log('\n🔍 Testing Lunr Index Build...\n');

  const lunr = require('lunr');
  const matter = require('gray-matter');

  const files = fs.readdirSync(CONFIG.pagesDir)
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(CONFIG.pagesDir, f));

  // Load documents
  let start = Date.now();
  const documents = [];
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const { data, content: body } = matter(content);
    documents.push({
      id: data.title || path.basename(file),
      title: String(data.title || ''),
      content: body,
      systemCategory: String(data['system-category'] || ''),
      userKeywords: Array.isArray(data['user-keywords']) ? data['user-keywords'].join(' ') : ''
    });
  }
  const loadTime = Date.now() - start;
  console.log(`  Document loading: ${loadTime}ms`);

  // Build index
  start = Date.now();
  const idx = lunr(function() {
    this.ref('id');
    this.field('title', { boost: 10 });
    this.field('content');
    this.field('systemCategory', { boost: 5 });
    this.field('userKeywords', { boost: 5 });

    documents.forEach(doc => this.add(doc));
  });
  const indexTime = Date.now() - start;
  console.log(`  Lunr index build: ${indexTime}ms`);
  console.log(`  Total: ${loadTime + indexTime}ms`);

  results.tests.lunrIndex = {
    documentCount: documents.length,
    loadTime,
    indexBuildTime: indexTime,
    totalTime: loadTime + indexTime
  };
}

/**
 * Test PageNameMatcher performance
 */
async function testPageNameMatcher() {
  console.log('\n🔗 Testing PageNameMatcher Performance...\n');

  let PageNameMatcher;
  try {
    const mod = require('../dist/src/utils/PageNameMatcher');
    PageNameMatcher = mod.default || mod;
  } catch (e) {
    console.log('  ⚠️  PageNameMatcher not available (run npm run build first)');
    return;
  }
  const matcher = new PageNameMatcher(true);

  const files = fs.readdirSync(CONFIG.pagesDir).filter(f => f.endsWith('.md'));
  const matter = require('gray-matter');

  // Get page names
  const pageNames = files.map(f => {
    const content = fs.readFileSync(path.join(CONFIG.pagesDir, f), 'utf8');
    const { data } = matter(content);
    return String(data.title || f.replace('.md', ''));
  }).filter(n => n && typeof n === 'string');

  // Simulate link resolution (what buildLinkGraph does)
  const testLinks = pageNames.slice(0, 100); // Test with first 100 as "links"

  let start = Date.now();
  let matches = 0;
  for (const link of testLinks) {
    const match = matcher.findMatch(link, pageNames);
    if (match) matches++;
  }
  const matchTime = Date.now() - start;

  console.log(`  ${testLinks.length} lookups in ${pageNames.length} pages: ${matchTime}ms`);
  console.log(`  Per lookup: ${(matchTime/testLinks.length).toFixed(3)}ms`);
  console.log(`  Matches found: ${matches}`);

  // Estimate full link graph build time
  const estimatedLinksPerPage = 10;
  const totalLinks = pageNames.length * estimatedLinksPerPage;
  const estimatedTime = (matchTime / testLinks.length) * totalLinks;
  console.log(`  Estimated full build (~${totalLinks} links): ${(estimatedTime/1000).toFixed(1)}s`);

  results.tests.pageNameMatcher = {
    pageCount: pageNames.length,
    testLinkCount: testLinks.length,
    lookupTime: matchTime,
    perLookup: matchTime / testLinks.length,
    estimatedFullBuildTime: estimatedTime
  };
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const runAll = args.length === 0 || args.includes('--all');

  console.log('═══════════════════════════════════════════════════════════');
  console.log('           amdWiki Performance Test Suite');
  console.log('═══════════════════════════════════════════════════════════');

  await gatherEnvironment();

  if (runAll || args.includes('--file-io')) {
    await testFileIO();
  }

  if (runAll || args.includes('--api')) {
    await testAPI();
  }

  if (runAll || args.includes('--lunr')) {
    await testLunrIndex();
  }

  if (runAll || args.includes('--matcher')) {
    await testPageNameMatcher();
  }

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('                      Summary');
  console.log('═══════════════════════════════════════════════════════════\n');

  if (results.tests.fileIO) {
    console.log('File I/O:');
    console.log(`  Best pattern: Parallel async (${results.tests.fileIO.asyncParallel.total}ms)`);
    console.log(`  Current pattern: Async sequential (${results.tests.fileIO.asyncSequential.total}ms)`);
    console.log(`  Potential improvement: ${((results.tests.fileIO.asyncSequential.total - results.tests.fileIO.asyncParallel.total) / results.tests.fileIO.asyncSequential.total * 100).toFixed(1)}%`);
  }

  if (results.tests.lunrIndex) {
    console.log('\nLunr Index:');
    console.log(`  Build time: ${results.tests.lunrIndex.totalTime}ms`);
  }

  if (results.tests.pageNameMatcher) {
    console.log('\nPageNameMatcher:');
    console.log(`  Per lookup: ${results.tests.pageNameMatcher.perLookup.toFixed(3)}ms`);
    console.log(`  Estimated link graph build: ${(results.tests.pageNameMatcher.estimatedFullBuildTime/1000).toFixed(1)}s`);
  }

  // Save results
  const outputFile = `./data/logs/performance-${Date.now()}.json`;
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  console.log(`\n📄 Results saved to: ${outputFile}`);
}

main().catch(console.error);
