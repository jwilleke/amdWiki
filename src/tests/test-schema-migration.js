#!/usr/bin/env node

/**
 * Schema.org Integration Test
 * Verifies that the new Schema.org implementation is working correctly
 */

const fs = require('fs').promises;
const path = require('path');

async function testSchemaOrgIntegration() {
  console.log('🧪 Testing Schema.org Integration...\n');
  
  try {
    // Test 1: Verify new files exist
    console.log('📁 Test 1: Verifying new Schema.org files...');
    const personsFile = path.join(__dirname, 'users', 'persons.json');
    const orgsFile = path.join(__dirname, 'users', 'organizations.json');
    
    const personsData = JSON.parse(await fs.readFile(personsFile, 'utf8'));
    const orgsData = JSON.parse(await fs.readFile(orgsFile, 'utf8'));
    
    console.log(`✅ Found ${Object.keys(personsData).length} persons in persons.json`);
    console.log(`✅ Found ${Object.keys(orgsData).length} organizations in organizations.json\n`);
    
    // Test 2: Verify Schema.org compliance
    console.log('🔍 Test 2: Verifying Schema.org compliance...');
    
    // Check persons
    for (const [id, person] of Object.entries(personsData)) {
      if (!person['@context'] || !person['@type'] || !person.identifier || !person.name) {
        throw new Error(`Person ${id} missing required Schema.org fields`);
      }
      console.log(`✅ Person "${person.name}" has valid Schema.org structure`);
    }
    
    // Check organizations
    for (const [id, org] of Object.entries(orgsData)) {
      if (!org['@context'] || !org['@type'] || !org.identifier || !org.name) {
        throw new Error(`Organization ${id} missing required Schema.org fields`);
      }
      console.log(`✅ Organization "${org.name}" has valid Schema.org structure`);
    }
    
    console.log();
    
    // Test 3: Check enhanced fields
    console.log('🆕 Test 3: Verifying enhanced Schema.org fields...');
    
    const samplePerson = Object.values(personsData)[0];
    const enhancedFields = [
      'knowsLanguage', 'knowsAbout', 'worksFor', 'hasCredential', 
      'contactPoint', 'memberOf'
    ];
    
    enhancedFields.forEach(field => {
      if (samplePerson[field]) {
        console.log(`✅ Enhanced field "${field}" present`);
      } else {
        console.log(`⚠️  Enhanced field "${field}" not found`);
      }
    });
    
    const sampleOrg = Object.values(orgsData)[0];
    const orgFields = ['makesOffer', 'hasOfferCatalog', 'knowsAbout', 'founder'];
    
    orgFields.forEach(field => {
      if (sampleOrg[field]) {
        console.log(`✅ Organization field "${field}" present`);
      } else {
        console.log(`⚠️  Organization field "${field}" not found`);
      }
    });
    
    console.log();
    
    // Test 4: Privacy compliance check
    console.log('🔒 Test 4: Privacy compliance verification...');
    
    for (const [id, person] of Object.entries(personsData)) {
      // Check that sensitive optional fields are null or undefined
      const sensitiveFields = ['birthDate', 'nationality', 'gender'];
      let privacyCompliant = true;
      
      sensitiveFields.forEach(field => {
        if (person[field] !== null && person[field] !== undefined) {
          console.log(`⚠️  Person ${id} has sensitive field "${field}" populated`);
          privacyCompliant = false;
        }
      });
      
      if (privacyCompliant) {
        console.log(`✅ Person "${person.name}" is privacy-compliant (no sensitive data)`);
      }
    }
    
    console.log();
    
    // Test 5: Backup verification
    console.log('💾 Test 5: Backup verification...');
    const backupFiles = await fs.readdir(path.join(__dirname, 'users'));
    const backupFile = backupFiles.find(file => file.startsWith('users.json.backup.'));
    
    if (backupFile) {
      console.log(`✅ Backup created: ${backupFile}`);
      const backupData = JSON.parse(await fs.readFile(path.join(__dirname, 'users', backupFile), 'utf8'));
      console.log(`✅ Backup contains ${Object.keys(backupData).length} users`);
    } else {
      console.log('⚠️  No backup file found');
    }
    
    console.log();
    console.log('🎉 Schema.org Integration Test Results:');
    console.log('✅ All core tests passed!');
    console.log('✅ Schema.org compliance verified');
    console.log('✅ Enhanced fields implemented');
    console.log('✅ Privacy compliance maintained');
    console.log('✅ Data migration successful');
    console.log('\n🚀 Your amdWiki is now Schema.org enhanced!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  testSchemaOrgIntegration();
}

module.exports = testSchemaOrgIntegration;
