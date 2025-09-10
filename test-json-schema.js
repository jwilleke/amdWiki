const SchemaGenerator = require('./src/utils/SchemaGenerator');

// Test data from actual JSON files
const testUserData = {
  "jim": {
    "username": "jim",
    "email": "jim@willeke.com",
    "displayName": "-jim",
    "roles": ["reader"],
    "isActive": true,
    "isSystem": false,
    "createdAt": "2025-09-07T20:29:58.428Z",
    "lastLogin": "2025-09-09T18:58:14.489Z",
    "loginCount": 16
  },
  "admin": {
    "username": "admin",
    "email": "admin@localhost",
    "displayName": "Administrator", 
    "roles": ["admin"],
    "isActive": true,
    "isSystem": true,
    "createdAt": "2025-09-06T21:55:16.875Z",
    "lastLogin": "2025-09-09T18:55:31.465Z"
  }
};

const testConfigData = {
  "applicationName": "amdWiki",
  "version": "1.0.0",
  "server": {
    "port": 3000,
    "host": "localhost"
  },
  "features": {
    "export": {
      "html": true,
      "pdf": false,
      "odt": false
    },
    "attachments": {
      "enabled": true,
      "maxSize": "10MB"
    },
    "llm": {
      "enabled": false
    }
  }
};

console.log('=== amdWiki JSON Schema.org Generation Test ===\n');

// Test Person schema generation
console.log('1. Person Schema Generation');
console.log('---'.repeat(20));

Object.entries(testUserData).forEach(([username, userData]) => {
  console.log(`\nUser: ${username}`);
  const personSchema = SchemaGenerator.generatePersonSchema(userData, {
    organizationName: "amdWiki Platform"
  });
  
  console.log('Schema Type:', personSchema['@type']);
  console.log('Name:', personSchema.name);
  console.log('Role:', personSchema.roleName);
  console.log('Job Title:', personSchema.jobTitle || 'None');
  console.log('\nGenerated JSON-LD:');
  console.log(JSON.stringify(personSchema, null, 2));
});

console.log('\n' + '='.repeat(60) + '\n');

// Test SoftwareApplication schema
console.log('2. Software Application Schema');
console.log('---'.repeat(20));

const softwareSchema = SchemaGenerator.generateSoftwareSchema(testConfigData, {
  organizationName: "amdWiki Platform"
});

console.log('Schema Type:', softwareSchema['@type']);
console.log('Name:', softwareSchema.name);
console.log('Version:', softwareSchema.version);
console.log('Features:', softwareSchema.featureList);
console.log('\nGenerated JSON-LD:');
console.log(JSON.stringify(softwareSchema, null, 2));

console.log('\n' + '='.repeat(60) + '\n');

// Test Organization schema
console.log('3. Organization Schema');
console.log('---'.repeat(20));

const orgSchema = SchemaGenerator.generateOrganizationSchema({
  organizationName: "amdWiki Platform",
  foundingDate: "2025",
  website: "https://github.com/jwilleke/amdWiki"
});

console.log('Schema Type:', orgSchema['@type']);
console.log('Name:', orgSchema.name);
console.log('\nGenerated JSON-LD:');
console.log(JSON.stringify(orgSchema, null, 2));

console.log('\n' + '='.repeat(60) + '\n');

// Test comprehensive schema
console.log('4. Comprehensive Site Schema');
console.log('---'.repeat(20));

const siteSchemas = SchemaGenerator.generateComprehensiveSchema({
  users: testUserData,
  config: testConfigData
}, {
  organizationName: "amdWiki Platform",
  repository: "https://github.com/jwilleke/amdWiki"
});

console.log(`Generated ${siteSchemas.length} schema objects:`);
siteSchemas.forEach((schema, index) => {
  console.log(`${index + 1}. ${schema['@type']}: ${schema.name}`);
});

console.log('\nFirst schema example:');
console.log(JSON.stringify(siteSchemas[0], null, 2));
