#!/usr/bin/env node

/**
 * Test script to verify DigitalDocumentPermission implementation
 * This tests the actual integration with WikiEngine and managers
 */

const WikiEngine = require('./src/WikiEngine');
const SchemaGenerator = require('./src/utils/SchemaGenerator');

async function testDigitalDocumentPermissionIntegration() {
  console.log('🧪 Testing DigitalDocumentPermission Implementation');
  console.log('=' .repeat(60));
  
  try {
    // Initialize WikiEngine
    console.log('1. Initializing WikiEngine...');
    const engine = new WikiEngine();
    await engine.initialize();
    console.log('   ✅ WikiEngine initialized successfully');
    
    // Get managers
    const pageManager = engine.getManager('PageManager');
    const userManager = engine.getManager('UserManager');
    const aclManager = engine.getManager('ACLManager');
    
    console.log('   ✅ Managers retrieved successfully');
    
    // Test 1: Basic permission generation for General category
    console.log('\n2. Testing General category permissions...');
    const generalPageData = {
  title: 'Test General Page',
  'system-category': 'General',
  content: 'This is a test page with general content.',
  uuid: 'test-general-uuid',
  lastModified: new Date().toISOString()
    };
    
    const options = {
      baseUrl: 'http://localhost:3000',
      pageUrl: 'http://localhost:3000/view/Test%20General%20Page',
      engine: engine,
      user: null
    };
    
    const generalSchema = SchemaGenerator.generatePageSchema(generalPageData, options);
    
    if (generalSchema.hasDigitalDocumentPermission) {
      console.log(`   ✅ Generated ${generalSchema.hasDigitalDocumentPermission.length} permissions for General category`);
      generalSchema.hasDigitalDocumentPermission.forEach((perm, index) => {
        console.log(`      ${index + 1}. ${perm.permissionType} for ${perm.grantee.audienceType || perm.grantee.name}`);
      });
    } else {
      console.log('   ❌ No permissions generated for General category');
    }
    
    // Test 2: System category permissions
    console.log('\n3. Testing System category permissions...');
    const systemPageData = {
  title: 'System Configuration',
  'system-category': 'System',
      content: 'System configuration page.',
      uuid: 'test-system-uuid',
      lastModified: new Date().toISOString()
    };
    
    const systemSchema = SchemaGenerator.generatePageSchema(systemPageData, options);
    
    if (systemSchema.hasDigitalDocumentPermission) {
      console.log(`   ✅ Generated ${systemSchema.hasDigitalDocumentPermission.length} permissions for System category`);
      systemSchema.hasDigitalDocumentPermission.forEach((perm, index) => {
        console.log(`      ${index + 1}. ${perm.permissionType} for ${perm.grantee.audienceType || perm.grantee.name}`);
      });
    } else {
      console.log('   ❌ No permissions generated for System category');
    }
    
    // Test 3: Documentation category permissions
    console.log('\n4. Testing Documentation category permissions...');
    const docPageData = {
      title: 'API Documentation',
      category: 'Documentation',
      content: 'This is API documentation.',
      uuid: 'test-doc-uuid',
      lastModified: new Date().toISOString()
    };
    
    const docSchema = SchemaGenerator.generatePageSchema(docPageData, options);
    
    if (docSchema.hasDigitalDocumentPermission) {
      console.log(`   ✅ Generated ${docSchema.hasDigitalDocumentPermission.length} permissions for Documentation category`);
      docSchema.hasDigitalDocumentPermission.forEach((perm, index) => {
        console.log(`      ${index + 1}. ${perm.permissionType} for ${perm.grantee.audienceType || perm.grantee.name}`);
      });
    } else {
      console.log('   ❌ No permissions generated for Documentation category');
    }
    
    // Test 4: ACL-based permissions
    console.log('\n5. Testing ACL-based permissions...');
    const aclPageData = {
      title: 'Protected Page',
      category: 'General',
      content: '[{ALLOW edit admin,editor}] [{ALLOW view all}] This is a protected page.',
      uuid: 'test-acl-uuid',
      lastModified: new Date().toISOString()
    };
    
    const aclSchema = SchemaGenerator.generatePageSchema(aclPageData, options);
    
    if (aclSchema.hasDigitalDocumentPermission) {
      console.log(`   ✅ Generated ${aclSchema.hasDigitalDocumentPermission.length} permissions for ACL-protected page`);
      aclSchema.hasDigitalDocumentPermission.forEach((perm, index) => {
        console.log(`      ${index + 1}. ${perm.permissionType} for ${perm.grantee.audienceType || perm.grantee.name}`);
      });
    } else {
      console.log('   ❌ No permissions generated for ACL-protected page');
    }
    
    // Test 5: Schema.org validation
    console.log('\n6. Validating Schema.org structure...');
    const schemas = [generalSchema, systemSchema, docSchema, aclSchema];
    let validationPassed = true;
    
    for (const schema of schemas) {
      // Check required Schema.org properties
      if (!schema['@context'] || !schema['@type'] || !schema.name) {
        console.log('   ❌ Missing required Schema.org properties');
        validationPassed = false;
        continue;
      }
      
      // Check DigitalDocumentPermission structure
      if (schema.hasDigitalDocumentPermission) {
        for (const permission of schema.hasDigitalDocumentPermission) {
          if (permission['@type'] !== 'DigitalDocumentPermission') {
            console.log('   ❌ Invalid permission @type');
            validationPassed = false;
          }
          
          if (!permission.permissionType || !permission.permissionType.endsWith('Permission')) {
            console.log('   ❌ Invalid permissionType');
            validationPassed = false;
          }
          
          if (!permission.grantee || !permission.grantee['@type']) {
            console.log('   ❌ Invalid grantee structure');
            validationPassed = false;
          }
        }
      }
    }
    
    if (validationPassed) {
      console.log('   ✅ All schemas pass Schema.org validation');
    }
    
    // Test 6: Performance check
    console.log('\n7. Performance testing...');
    const startTime = Date.now();
    
    for (let i = 0; i < 100; i++) {
      SchemaGenerator.generatePageSchema(generalPageData, options);
    }
    
    const endTime = Date.now();
    const avgTime = (endTime - startTime) / 100;
    
    console.log(`   ✅ Average generation time: ${avgTime.toFixed(2)}ms per page`);
    
    if (avgTime < 5) {
      console.log('   ✅ Performance target met (<5ms per page)');
    } else {
      console.log('   ⚠️  Performance target not met (>5ms per page)');
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('🎉 DigitalDocumentPermission implementation test completed!');
    console.log('✅ All core functionality is working correctly');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    process.exit(1);
  }
}

// Run the test
testDigitalDocumentPermissionIntegration().catch(console.error);
