#!/usr/bin/env node

/**
 * Migration Script: users.json → Schema.org Person/Organization Structure
 * 
 * This script migrates legacy users.json structure to Schema.org compliant
 * persons.json and organizations.json files.
 * 
 * Usage:
 *   node scripts/migrate-to-schema.js [--backup] [--dry-run]
 * 
 * Options:
 *   --backup    Create backup of original users.json
 *   --dry-run   Show what would be migrated without making changes
 */

const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class SchemaOrgMigration {
  constructor(options = {}) {
    this.options = {
      backup: options.backup || false,
      dryRun: options.dryRun || false,
      ...options
    };
    
    this.baseDir = path.join(__dirname, '..');
    this.usersDir = path.join(this.baseDir, 'users');
    this.legacyUsersFile = path.join(this.usersDir, 'users.json');
    this.personsFile = path.join(this.usersDir, 'persons.json');
    this.organizationsFile = path.join(this.usersDir, 'organizations.json');
  }

  /**
   * Run the migration process
   */
  async migrate() {
    console.log('🚀 Starting Schema.org Migration...');
    console.log(`📁 Working directory: ${this.baseDir}`);
    
    if (this.options.dryRun) {
      console.log('🔍 DRY RUN MODE - No files will be modified');
    }

    try {
      // Check prerequisites
      await this.checkPrerequisites();
      
      // Load legacy data
      const legacyUsers = await this.loadLegacyUsers();
      console.log(`📊 Found ${Object.keys(legacyUsers).length} users to migrate`);
      
      // Create backup if requested
      if (this.options.backup && !this.options.dryRun) {
        await this.createBackup();
      }
      
      // Transform data to Schema.org format
      const { persons, organizations } = await this.transformToSchemaOrg(legacyUsers);
      
      // Validate transformed data
      await this.validateSchemaOrgData(persons, organizations);
      
      // Write new files
      if (!this.options.dryRun) {
        await this.writeSchemaOrgFiles(persons, organizations);
        console.log('✅ Migration completed successfully!');
        console.log('📋 Next steps:');
        console.log('   1. Test the application with new Schema.org data structure');
        console.log('   2. Verify organization management admin UI functionality');
        console.log('   3. Check that Schema.org JSON-LD is correctly generated');
        console.log('   4. Consider removing legacy users.json after verification');
      } else {
        console.log('✅ Dry run completed - data structure is valid for migration');
      }
      
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  }

  /**
   * Check if migration prerequisites are met
   */
  async checkPrerequisites() {
    console.log('🔍 Checking prerequisites...');
    
    // Check if users directory exists
    try {
      await fs.access(this.usersDir);
    } catch (err) {
      throw new Error(`Users directory not found: ${this.usersDir}`);
    }
    
    // Check if legacy users.json exists
    try {
      await fs.access(this.legacyUsersFile);
    } catch (err) {
      throw new Error(`Legacy users.json not found: ${this.legacyUsersFile}`);
    }
    
    // Check if new files already exist
    const personsExists = await this.fileExists(this.personsFile);
    const orgsExists = await this.fileExists(this.organizationsFile);
    
    if (personsExists || orgsExists) {
      if (!this.options.dryRun) {
        const existingFiles = [];
        if (personsExists) existingFiles.push('persons.json');
        if (orgsExists) existingFiles.push('organizations.json');
        console.warn(`⚠️  Warning: The following files already exist and will be overwritten: ${existingFiles.join(', ')}`);
      }
    }
    
    console.log('✅ Prerequisites check passed');
  }

  /**
   * Load legacy users.json data
   */
  async loadLegacyUsers() {
    console.log('📖 Loading legacy users.json...');
    
    try {
      const data = await fs.readFile(this.legacyUsersFile, 'utf8');
      const users = JSON.parse(data);
      
      if (typeof users !== 'object' || users === null) {
        throw new Error('Invalid users.json format - expected object');
      }
      
      return users;
    } catch (error) {
      throw new Error(`Failed to load legacy users.json: ${error.message}`);
    }
  }

  /**
   * Transform legacy user data to Schema.org Person format
   */
  async transformToSchemaOrg(legacyUsers) {
    console.log('🔄 Transforming data to Schema.org format...');
    
    const persons = [];
    const organizations = [];
    
    // Create primary organization from config or default
    const primaryOrg = await this.createPrimaryOrganization();
    organizations.push(primaryOrg);
    
    // Transform each user to Schema.org Person
    for (const [username, userData] of Object.entries(legacyUsers)) {
      const person = await this.transformUserToPerson(username, userData, primaryOrg.identifier);
      persons.push(person);
    }
    
    console.log(`✅ Transformed ${persons.length} persons and ${organizations.length} organizations`);
    
    return { persons, organizations };
  }

  /**
   * Create primary organization based on wiki configuration
   */
  async createPrimaryOrganization() {
    // Try to load wiki configuration
    let wikiConfig = {};
    try {
      const configPath = path.join(this.baseDir, 'config', 'wiki.json');
      const configData = await fs.readFile(configPath, 'utf8');
      wikiConfig = JSON.parse(configData);
    } catch (err) {
      console.warn('⚠️  Could not load wiki.json, using default organization data');
    }
    
    const organization = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "identifier": "amdwiki-platform",
      "name": wikiConfig.application?.name || wikiConfig.applicationName || "amdWiki Platform",
      "legalName": wikiConfig.organization?.legalName || null,
      "alternateName": ["amdWiki", "AMD Wiki"],
      "url": wikiConfig.application?.url || "http://localhost:3000",
      "description": wikiConfig.application?.description || "Digital platform for wiki, document management, and modular content systems",
      "foundingDate": "2025",
      "applicationCategory": "Wiki Software",
      "sameAs": [
        wikiConfig.application?.repository || "https://github.com/jwilleke/amdWiki"
      ],
      "address": wikiConfig.organization?.address || {
        "@type": "PostalAddress",
        "streetAddress": null,
        "addressLocality": null,
        "addressRegion": null,
        "postalCode": null,
        "addressCountry": null
      },
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "contactType": "Technical Support",
          "availableLanguage": ["English"],
          "url": wikiConfig.application?.url || "http://localhost:3000"
        }
      ],
      "makesOffer": {
        "@type": "Offer",
        "itemOffered": {
          "@type": "SoftwareApplication",
          "name": wikiConfig.application?.name || "amdWiki Platform",
          "applicationCategory": "Wiki Software",
          "operatingSystem": "Cross-platform"
        }
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Knowledge Management Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Document Management",
              "description": "Collaborative document creation and management"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service", 
              "name": "Knowledge Base",
              "description": "Structured knowledge repository with search capabilities"
            }
          }
        ]
      },
      "knowsAbout": [
        "Document Management",
        "Knowledge Management", 
        "Wiki Software",
        "Collaborative Editing",
        "Information Architecture"
      ]
    };
    
    return organization;
  }

  /**
   * Transform legacy user data to Schema.org Person
   */
  async transformUserToPerson(username, userData, organizationId) {
    const person = {
      "@context": "https://schema.org",
      "@type": "Person",
      "identifier": username,
      "name": userData.displayName || userData.name || username,
      "alternateName": [username],
      
      // Optional personal information (privacy-safe defaults)
      "birthDate": null,
      "nationality": null,
      "gender": null,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": null,
        "addressRegion": null,
        "addressCountry": null
      },
      "knowsLanguage": ["English"],
      "alumniOf": null
    };
    
    // Add email if available and not sensitive
    if (userData.email && !userData.isSystem) {
      person.email = userData.email;
    }
    
    // Add organizational membership and work relationship
    person.memberOf = {
      "@type": "Organization",
      "identifier": organizationId,
      "name": "amdWiki Platform"
    };
    
    person.worksFor = {
      "@type": "Organization",
      "identifier": organizationId,
      "name": "amdWiki Platform"
    };
    
    // Transform roles to credentials/job titles
    if (userData.roles && userData.roles.length > 0) {
      person.hasCredential = userData.roles.map(role => ({
        "@type": "EducationalOccupationalCredential",
        "credentialCategory": role,
        "competencyRequired": this.getRoleCompetencies(role),
        "issuedBy": {
          "@type": "Organization",
          "identifier": organizationId
        }
      }));
      
      // Set primary job title
      if (userData.roles.includes('admin')) {
        person.jobTitle = 'Administrator';
      } else if (userData.roles.includes('editor')) {
        person.jobTitle = 'Content Editor';
      } else if (userData.roles.includes('reader')) {
        person.jobTitle = 'Reader';
      }
    }
    
    // Add temporal information
    if (userData.createdAt) {
      person.memberOfStartDate = userData.createdAt;
      person.dateCreated = userData.createdAt;
    }
    
    if (userData.lastLogin) {
      person.lastReviewed = userData.lastLogin;
    }
    
    // Add knowledge areas based on role
    person.knowsAbout = this.getRoleKnowledgeAreas(userData.roles || []);
    
    // Add authentication data (private, not part of Schema.org)
    person.authentication = {
      passwordHash: userData.passwordHash || userData.password, // Preserve existing hash
      isSystem: userData.isSystem || false,
      preferences: userData.preferences || {}
    };
    
    // Add contact information with enhanced structure
    person.contactPoint = {
      "@type": "ContactPoint",
      "contactType": "Account",
      "availableLanguage": person.knowsLanguage
    };
    
    if (person.email) {
      person.contactPoint.email = person.email;
    }
    
    return person;
  }

  /**
   * Get knowledge areas based on user roles
   */
  getRoleKnowledgeAreas(roles) {
    const knowledgeMap = {
      'admin': ['Wiki Administration', 'User Management', 'System Configuration', 'Content Management'],
      'editor': ['Content Creation', 'Wiki Markup', 'Content Editing', 'Documentation'],
      'reader': ['Content Consumption', 'Basic Navigation', 'Information Retrieval']
    };
    
    const knowledge = new Set();
    roles.forEach(role => {
      if (knowledgeMap[role]) {
        knowledgeMap[role].forEach(area => knowledge.add(area));
      }
    });
    
    return Array.from(knowledge);
  }

  /**
   * Get competencies required for a given role
   */
  getRoleCompetencies(role) {
    const competencies = {
      'admin': ['System Administration', 'User Management', 'Configuration Management'],
      'editor': ['Content Creation', 'Content Editing', 'Wiki Markup'],
      'reader': ['Content Consumption', 'Basic Navigation']
    };
    
    return competencies[role] || ['Basic Platform Usage'];
  }

  /**
   * Validate transformed Schema.org data
   */
  async validateSchemaOrgData(persons, organizations) {
    console.log('🔍 Validating Schema.org data structure...');
    
    // Validate organizations
    for (const org of organizations) {
      if (!org['@context'] || !org['@type'] || !org.identifier || !org.name) {
        throw new Error('Invalid organization: missing required Schema.org properties');
      }
    }
    
    // Validate persons
    for (const person of persons) {
      if (!person['@context'] || !person['@type'] || !person.identifier || !person.name) {
        throw new Error(`Invalid person: missing required Schema.org properties for ${person.identifier}`);
      }
      
      if (!person.memberOf || !person.memberOf.identifier) {
        throw new Error(`Person ${person.identifier} missing organization membership`);
      }
    }
    
    console.log('✅ Schema.org data validation passed');
  }

  /**
   * Write Schema.org files
   */
  async writeSchemaOrgFiles(persons, organizations) {
    console.log('💾 Writing Schema.org files...');
    
    // Write persons.json
    await fs.writeFile(this.personsFile, JSON.stringify(persons, null, 2), 'utf8');
    console.log(`✅ Created ${this.personsFile}`);
    
    // Write organizations.json
    await fs.writeFile(this.organizationsFile, JSON.stringify(organizations, null, 2), 'utf8');
    console.log(`✅ Created ${this.organizationsFile}`);
  }

  /**
   * Create backup of legacy users.json
   */
  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(this.usersDir, `users.json.backup.${timestamp}`);
    
    console.log(`💾 Creating backup: ${backupFile}`);
    await fs.copyFile(this.legacyUsersFile, backupFile);
    console.log('✅ Backup created');
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

// CLI handling
async function main() {
  const args = process.argv.slice(2);
  const options = {
    backup: args.includes('--backup'),
    dryRun: args.includes('--dry-run')
  };
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Schema.org Migration Tool

Migrates legacy users.json to Schema.org compliant persons.json and organizations.json

Usage:
  node scripts/migrate-to-schema.js [options]

Options:
  --backup    Create timestamped backup of users.json
  --dry-run   Show what would be migrated without making changes
  --help, -h  Show this help message

Examples:
  node scripts/migrate-to-schema.js --dry-run
  node scripts/migrate-to-schema.js --backup
  node scripts/migrate-to-schema.js --backup --dry-run
`);
    return;
  }
  
  const migration = new SchemaOrgMigration(options);
  await migration.migrate();
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });
}

module.exports = SchemaOrgMigration;
