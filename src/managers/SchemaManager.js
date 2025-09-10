const BaseManager = require('./BaseManager');
const fs = require('fs-extra');
const path = require('path');

/**
 * SchemaManager - Manages Schema.org compliant data structures
 * Handles persons.json and organizations.json with Schema.org validation
 */
class SchemaManager extends BaseManager {
  constructor(engine) {
    super(engine);
    this.dataDirectory = './users';
    this.persons = new Map();
    this.organizations = new Map();
  }

  async initialize(config = {}) {
    await super.initialize(config);
    
    this.dataDirectory = config.dataDirectory || './users';
    await fs.mkdir(this.dataDirectory, { recursive: true });
    
    await this.loadPersons();
    await this.loadOrganizations();
    
    console.log(`📋 SchemaManager initialized with ${this.persons.size} persons and ${this.organizations.size} organizations`);
  }

  /**
   * Load Schema.org Person data
   */
  async loadPersons() {
    try {
      const personsFile = path.join(this.dataDirectory, 'persons.json');
      if (await fs.pathExists(personsFile)) {
        const personsData = await fs.readFile(personsFile, 'utf8');
        const persons = JSON.parse(personsData);
        this.persons = new Map(Object.entries(persons));
        console.log(`👤 Loaded ${this.persons.size} persons`);
      } else {
        this.persons = new Map();
        console.log('👤 No persons file found, starting with empty persons');
      }
    } catch (err) {
      console.error('Error loading persons:', err);
      this.persons = new Map();
    }
  }

  /**
   * Load Schema.org Organization data
   */
  async loadOrganizations() {
    try {
      const organizationsFile = path.join(this.dataDirectory, 'organizations.json');
      if (await fs.pathExists(organizationsFile)) {
        const organizationsData = await fs.readFile(organizationsFile, 'utf8');
        const organizations = JSON.parse(organizationsData);
        this.organizations = new Map(Object.entries(organizations));
        console.log(`🏢 Loaded ${this.organizations.size} organizations`);
      } else {
        this.organizations = new Map();
        console.log('🏢 No organizations file found, starting with empty organizations');
      }
    } catch (err) {
      console.error('Error loading organizations:', err);
      this.organizations = new Map();
    }
  }

  /**
   * Save Schema.org Person data
   */
  async savePersons() {
    try {
      const personsFile = path.join(this.dataDirectory, 'persons.json');
      const persons = Object.fromEntries(this.persons);
      await fs.writeFile(personsFile, JSON.stringify(persons, null, 2), 'utf8');
    } catch (err) {
      console.error('Error saving persons:', err);
      throw err;
    }
  }

  /**
   * Save Schema.org Organization data
   */
  async saveOrganizations() {
    try {
      const organizationsFile = path.join(this.dataDirectory, 'organizations.json');
      const organizations = Object.fromEntries(this.organizations);
      await fs.writeFile(organizationsFile, JSON.stringify(organizations, null, 2), 'utf8');
    } catch (err) {
      console.error('Error saving organizations:', err);
      throw err;
    }
  }

  /**
   * Get all persons (returns array without authentication data for security)
   */
  getPersons() {
    return Array.from(this.persons.values()).map(person => {
      const { authentication, ...personWithoutAuth } = person;
      return personWithoutAuth;
    });
  }

  /**
   * Get all organizations
   */
  getOrganizations() {
    return Array.from(this.organizations.values());
  }

  /**
   * Get comprehensive site data for Schema.org generation
   */
  async getComprehensiveSiteData() {
    const config = this.engine.getConfig();
    
    return {
      persons: this.getPersons(), // Returns persons without auth data
      organizations: this.getOrganizations(),
      config: {
        application: {
          name: config.get('application.name') || config.get('applicationName', 'amdWiki'),
          version: config.get('application.version') || config.get('version', '1.0.0'),
          applicationCategory: config.get('application.applicationCategory', 'Wiki Software'),
          url: config.get('application.url') || `http://localhost:${config.get('server.port', 3000)}`
        },
        server: {
          port: config.get('server.port', 3000),
          host: config.get('server.host', 'localhost')
        },
        features: {
          export: config.get('features.export', { html: true }),
          attachments: config.get('features.attachments', { enabled: true }),
          llm: config.get('features.llm', { enabled: false })
        }
      }
    };
  }

  /**
   * Get person by identifier
   */
  getPerson(identifier) {
    return this.persons.get(identifier);
  }

  /**
   * Get organization by identifier  
   */
  getOrganization(identifier) {
    return this.organizations.get(identifier);
  }

  /**
   * Create new Schema.org Person
   */
  async createPerson(personData) {
    const person = this.validateAndEnhancePerson(personData);
    this.persons.set(person.identifier, person);
    await this.savePersons();
    return person;
  }

  /**
   * Update existing Schema.org Person
   */
  async updatePerson(identifier, updateData) {
    const existingPerson = this.persons.get(identifier);
    if (!existingPerson) {
      throw new Error(`Person with identifier ${identifier} not found`);
    }

    const updatedPerson = {
      ...existingPerson,
      ...updateData,
      dateModified: new Date().toISOString()
    };

    const validatedPerson = this.validateAndEnhancePerson(updatedPerson);
    this.persons.set(identifier, validatedPerson);
    await this.savePersons();
    return validatedPerson;
  }

  /**
   * Create new Schema.org Organization
   */
  async createOrganization(organizationData) {
    const organization = this.validateAndEnhanceOrganization(organizationData);
    this.organizations.set(organization.name.toLowerCase(), organization);
    await this.saveOrganizations();
    return organization;
  }

  /**
   * Update existing Schema.org Organization
   */
  async updateOrganization(identifier, updateData) {
    const existingOrg = this.organizations.get(identifier);
    if (!existingOrg) {
      throw new Error(`Organization with identifier ${identifier} not found`);
    }

    const updatedOrg = {
      ...existingOrg,
      ...updateData,
      dateModified: new Date().toISOString()
    };

    const validatedOrg = this.validateAndEnhanceOrganization(updatedOrg);
    this.organizations.set(identifier, validatedOrg);
    await this.saveOrganizations();
    return validatedOrg;
  }

  /**
   * Validate and enhance Person data with Schema.org compliance
   */
  validateAndEnhancePerson(personData) {
    const person = {
      "@context": "https://schema.org",
      "@type": "Person",
      ...personData
    };

    // Required fields validation
    if (!person.identifier) {
      throw new Error('Person identifier is required');
    }
    if (!person.name) {
      throw new Error('Person name is required');
    }

    // Handle optional personal information fields
    this.cleanOptionalFields(person, [
      'birthDate', 'nationality', 'gender', 'alumniOf'
    ]);

    // Handle optional address field
    if (person.address && typeof person.address === 'object') {
      person.address = {
        "@type": "PostalAddress",
        ...person.address
      };
      
      // Remove null/empty address fields
      Object.keys(person.address).forEach(key => {
        if (person.address[key] === null || person.address[key] === undefined || person.address[key] === '') {
          delete person.address[key];
        }
      });
      
      // If only @type remains, remove the entire address
      if (Object.keys(person.address).length === 1 && person.address['@type']) {
        delete person.address;
      }
    }

    // Handle knowsLanguage array
    if (person.knowsLanguage && Array.isArray(person.knowsLanguage)) {
      person.knowsLanguage = person.knowsLanguage.filter(lang => lang && lang.trim());
      if (person.knowsLanguage.length === 0) {
        delete person.knowsLanguage;
      }
    }

    // Enhance with Schema.org best practices
    if (!person.contactPoint && person.email) {
      person.contactPoint = {
        "@type": "ContactPoint",
        "email": person.email,
        "contactType": "personal",
        "availableLanguage": person.knowsLanguage || ["English"]
      };
    }

    if (!person.memberOf) {
      person.memberOf = {
        "@type": "Organization",
        "@id": "https://schema.org/amdWiki",
        "name": "amdWiki Platform"
      };
    }

    if (!person.dateCreated) {
      person.dateCreated = new Date().toISOString();
    }

    return person;
  }

  /**
   * Helper method to clean optional fields (remove null/empty values)
   */
  cleanOptionalFields(obj, fields) {
    fields.forEach(field => {
      if (obj[field] === null || obj[field] === undefined || obj[field] === '') {
        delete obj[field];
      }
    });
  }

  /**
   * Validate and enhance Organization data with Schema.org compliance
   */
  validateAndEnhanceOrganization(organizationData) {
    const organization = {
      "@context": "https://schema.org",
      "@type": "Organization",
      ...organizationData
    };

    // Required fields validation
    if (!organization.name) {
      throw new Error('Organization name is required');
    }

    // Enhance with Schema.org best practices
    if (!organization["@id"]) {
      organization["@id"] = `https://schema.org/${organization.name.replace(/\s+/g, '')}`;
    }

    // Handle optional legalName field
    if (organization.legalName === null || organization.legalName === undefined || organization.legalName === '') {
      // Remove null/empty legalName from output
      delete organization.legalName;
    }

    // Handle optional address field - enhance with proper structure
    if (organization.address) {
      if (typeof organization.address === 'object' && organization.address !== null) {
        // Ensure proper PostalAddress schema
        organization.address = {
          "@type": "PostalAddress",
          ...organization.address
        };
        
        // Remove null/empty address fields
        Object.keys(organization.address).forEach(key => {
          if (organization.address[key] === null || organization.address[key] === undefined || organization.address[key] === '') {
            delete organization.address[key];
          }
        });
        
        // If only @type remains, remove the entire address
        if (Object.keys(organization.address).length === 1 && organization.address['@type']) {
          delete organization.address;
        }
      }
    }

    if (!organization.contactPoint || organization.contactPoint.length === 0) {
      throw new Error('Organization must have at least one contactPoint');
    }

    if (!organization.foundingDate) {
      organization.foundingDate = new Date().getFullYear().toString();
    }

    return organization;
  }

  /**
   * Migration helper: Convert legacy users.json to persons.json
   */
  async migrateLegacyUsers() {
    try {
      const usersFile = path.join(this.dataDirectory, 'users.json');
      if (!(await fs.pathExists(usersFile))) {
        console.log('No legacy users.json found to migrate');
        return;
      }

      const usersData = await fs.readFile(usersFile, 'utf8');
      const users = JSON.parse(usersData);

      console.log('🔄 Migrating legacy users to Schema.org Person format...');

      for (const [username, userData] of Object.entries(users)) {
        const person = {
          identifier: username,
          name: userData.displayName || userData.username,
          email: userData.email,
          jobTitle: userData.roles?.includes('admin') ? 'Administrator' : 'Reader',
          hasCredential: userData.roles?.map(role => ({
            "@type": "EducationalOccupationalCredential",
            "credentialCategory": role
          })) || [],
          dateCreated: userData.createdAt,
          lastReviewed: userData.lastLogin,
          interactionStatistic: {
            "@type": "InteractionCounter",
            "interactionType": "https://schema.org/LoginAction",
            "userInteractionCount": userData.loginCount || 0
          },
          isActive: userData.isActive,
          isSystem: userData.isSystem,
          isExternal: userData.isExternal,
          preferences: userData.preferences || {},
          authentication: {
            password: userData.password
          }
        };

        await this.createPerson(person);
      }

      // Backup legacy file
      await fs.move(usersFile, path.join(this.dataDirectory, 'users.json.backup'));
      console.log('✅ Migration completed, legacy users.json backed up');

    } catch (err) {
      console.error('Error migrating legacy users:', err);
      throw err;
    }
  }
}

module.exports = SchemaManager;
