/**
 * Integration test to verify DigitalDocumentPermission generation
 * This script fetches a page and checks for the Schema.org markup
 */

const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function testDigitalDocumentPermissions() {
  console.log('🧪 Testing DigitalDocumentPermission integration...\n');
  
  try {
    // Test different page types
    const testPages = [
      { name: 'Welcome', expectedType: 'WebPage', category: 'General' },
      { name: 'Categories', expectedType: 'WebPage', category: 'System' },
      { name: 'Wiki Documentation', expectedType: 'TechArticle', category: 'Documentation' }
    ];
    
    for (const testPage of testPages) {
      console.log(`📄 Testing page: ${testPage.name}`);
      
      const response = await fetch(`http://localhost:3000/wiki/${encodeURIComponent(testPage.name)}`);
      const html = await response.text();
      
      // Parse HTML to find Schema.org JSON-LD
      const $ = cheerio.load(html);
      const schemaScript = $('script[type="application/ld+json"]').first().html();
      
      if (!schemaScript) {
        console.log(`❌ No Schema.org markup found for ${testPage.name}\n`);
        continue;
      }
      
      const schema = JSON.parse(schemaScript);
      
      console.log(`✅ Schema.org Type: ${schema['@type']}`);
      console.log(`✅ Page Name: ${schema.name}`);
      
      // Check for DigitalDocumentPermission
      if (schema.hasDigitalDocumentPermission) {
        console.log(`✅ DigitalDocumentPermission found: ${schema.hasDigitalDocumentPermission.length} permissions`);
        
        // Display permission details
        schema.hasDigitalDocumentPermission.forEach((permission, index) => {
          const granteeType = permission.grantee['@type'];
          const granteeName = permission.grantee.audienceType || permission.grantee.name;
          console.log(`   ${index + 1}. ${permission.permissionType} → ${granteeType}: ${granteeName}`);
        });
      } else {
        console.log(`❌ No DigitalDocumentPermission found for ${testPage.name}`);
      }
      
      console.log(''); // Empty line for readability
    }
    
    console.log('🎉 Integration test complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testDigitalDocumentPermissions();
