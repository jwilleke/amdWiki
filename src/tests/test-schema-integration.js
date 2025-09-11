// Test Schema.org implementation by fetching page HTML
const http = require('http');

function fetchPageHTML(url, callback) {
  http.get(url, (res) => {
    let html = '';
    res.on('data', (chunk) => {
      html += chunk;
    });
    res.on('end', () => {
      callback(html);
    });
  }).on('error', (err) => {
    console.error('Error fetching page:', err);
    callback(null);
  });
}

console.log('=== Testing Schema.org Integration ===\n');

// Test Welcome page (should have both page and site schema)
fetchPageHTML('http://localhost:3000/wiki/Welcome', (html) => {
  if (!html) {
    console.log('❌ Failed to fetch Welcome page');
    return;
  }

  console.log('✅ Welcome page fetched successfully');
  console.log('📄 Page length:', html.length, 'characters');

  // Check for Schema.org JSON-LD
  const jsonLdRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  const matches = [...html.matchAll(jsonLdRegex)];

  console.log('🔍 Found', matches.length, 'JSON-LD schema blocks\n');

  matches.forEach((match, index) => {
    try {
      const jsonData = JSON.parse(match[1]);
      console.log(`Schema ${index + 1}:`);
      console.log('  Type:', jsonData['@type']);
      console.log('  Name:', jsonData.name || jsonData.headline);
      if (jsonData.keywords) console.log('  Keywords:', jsonData.keywords);
      if (jsonData.featureList) console.log('  Features:', jsonData.featureList);
      if (jsonData.about) console.log('  About:', JSON.stringify(jsonData.about, null, 2));
      console.log('  ✅ Valid JSON-LD');
    } catch (err) {
      console.log(`  ❌ Invalid JSON in schema ${index + 1}:`, err.message);
    }
    console.log('');
  });

  // Test another page without site schema
  console.log('---'.repeat(20));
  console.log('Testing Plugin System Documentation page...\n');
  
  fetchPageHTML('http://localhost:3000/wiki/Plugin%20System%20Documentation', (html2) => {
    if (!html2) {
      console.log('❌ Failed to fetch Plugin Documentation page');
      return;
    }

    console.log('✅ Plugin Documentation page fetched successfully');
    
    const matches2 = [...html2.matchAll(jsonLdRegex)];
    console.log('🔍 Found', matches2.length, 'JSON-LD schema blocks\n');

    matches2.forEach((match, index) => {
      try {
        const jsonData = JSON.parse(match[1]);
        console.log(`Schema ${index + 1}:`);
        console.log('  Type:', jsonData['@type']);
        console.log('  Name:', jsonData.name || jsonData.headline);
        if (jsonData.keywords) console.log('  Keywords:', jsonData.keywords);
        if (jsonData.articleSection) console.log('  Section:', jsonData.articleSection);
        console.log('  ✅ Valid JSON-LD');
      } catch (err) {
        console.log(`  ❌ Invalid JSON in schema ${index + 1}:`, err.message);
      }
      console.log('');
    });

    console.log('🎉 Schema.org integration test complete!');
  });
});
