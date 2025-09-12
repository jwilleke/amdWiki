const SchemaGenerator = require('./src/utils/SchemaGenerator');

// Test data from actual amdWiki pages
const testPages = [
  {
    title: "Welcome",
    'system-category': "System",
    'user-keywords': ["wiki", "welcome", "getting-started", "Documentation"],
    lastModified: "2025-09-08T15:35:00.000Z"
  },
  {
    title: "Plugin System Documentation", 
    'system-category': "System/Admin",
    'user-keywords': ["plugins", "documentation", "jspwiki"],
    lastModified: "2025-09-07T09:42:00.000Z"
  },
  {
    title: "Project Overview and Vision",
    'system-category': "System",
    'user-keywords': ["gemini", "vision", "roadmap", "architecture", "Documentation"],
    lastModified: "2025-09-08T22:35:00.000Z"
  },
  {
    title: "Categories",
    'system-category': "System",
    'user-keywords': [],
    lastModified: "2025-09-08T16:40:00.000Z"
  },
  {
    title: "Search Documentation",
    'system-category': "Documentation", 
    'user-keywords': ["search", "documentation", "help", "guide"],
    lastModified: "2025-09-07T00:00:00.000Z"
  }
];

console.log('=== amdWiki Schema.org Generation Test ===\n');

testPages.forEach((page, index) => {
  console.log(`${index + 1}. ${page.title}`);
  console.log('---'.repeat(20));
  
  const schema = SchemaGenerator.generatePageSchema(page, {
    baseUrl: 'http://localhost:3000',
    pageUrl: `http://localhost:3000/wiki/${encodeURIComponent(page.title)}`
  });
  
  console.log('Schema Type:', schema['@type']);
  console.log('Keywords:', schema.keywords || 'None');
  console.log('About:', JSON.stringify(schema.about, null, 2));
  
  console.log('\nGenerated JSON-LD:');
  console.log(JSON.stringify(schema, null, 2));
  console.log('\n' + '='.repeat(60) + '\n');
});

// Test script tag generation
console.log('HTML Script Tag Example:');
const welcomeSchema = SchemaGenerator.generatePageSchema(testPages[0], {
  baseUrl: 'http://localhost:3000'
});
console.log(SchemaGenerator.generateScriptTag(welcomeSchema));
