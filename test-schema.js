const SchemaGenerator = require('./src/utils/SchemaGenerator');

// Test data from actual amdWiki pages
const testPages = [
  {
    title: "Welcome",
    categories: ["System", "Documentation"],
    userKeywords: ["wiki", "welcome", "getting-started"],
    lastModified: "2025-09-08T15:35:00.000Z"
  },
  {
    title: "Plugin System Documentation", 
    category: "System/Admin",
    userKeywords: ["plugins", "documentation", "jspwiki"],
    lastModified: "2025-09-07T09:42:00.000Z"
  },
  {
    title: "Project Overview and Vision",
    categories: ["System", "Documentation"],
    userKeywords: ["gemini", "vision", "roadmap", "architecture"],
    lastModified: "2025-09-08T22:35:00.000Z"
  },
  {
    title: "Categories",
    categories: ["System"],
    userKeywords: [],
    lastModified: "2025-09-08T16:40:00.000Z"
  },
  {
    title: "Search Documentation",
    category: "Documentation", 
    userKeywords: ["search", "documentation", "help", "guide"],
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
