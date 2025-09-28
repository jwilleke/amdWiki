const BaseManager = require('./BaseManager');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

class SchemaManager extends BaseManager {
  constructor(engine) {
    super(engine);
    this.usersDir = './users';
    this.personsFilePath = null;
    this.organizationsFilePath = null;

    this.persons = new Map();
    this.personsById = new Map();
    this.organizations = new Map();
    this.nextPersonId = 0;
  }

  async initialize(config = {}) {
    await super.initialize(config);

    // Prefer ConfigurationManager; fallback to legacy engine.getConfig()
    const cfgMgr = this.engine?.getManager?.('ConfigurationManager');
    const legacyCfg = typeof this.engine?.getConfig === 'function' ? this.engine.getConfig() : null;
    const getProp = (key, def) =>
      (cfgMgr && typeof cfgMgr.getProperty === 'function')
        ? cfgMgr.getProperty(key, def)
        : (legacyCfg && typeof legacyCfg.get === 'function')
          ? legacyCfg.get(key, def)
          : def;

    // Read configured locations
    const usersDirCfg = getProp('amdwiki.directories.users', './users');
    this.usersDir = path.resolve(process.cwd(), String(usersDirCfg));

    const personsCfg = getProp('amdwiki.jsonpersonsdatabase', path.join(this.usersDir, 'persons.json'));
    const orgsCfg = getProp('amdwiki.jsonorganizationsdatabase', path.join(this.usersDir, 'organizations.json'));

    this.personsFilePath = path.isAbsolute(personsCfg) ? personsCfg : path.resolve(process.cwd(), String(personsCfg));
    this.organizationsFilePath = path.isAbsolute(orgsCfg) ? orgsCfg : path.resolve(process.cwd(), String(orgsCfg));

    // Ensure parent directories exist
    await fs.mkdir(path.dirname(this.personsFilePath), { recursive: true }).catch(() => {});
    await fs.mkdir(path.dirname(this.organizationsFilePath), { recursive: true }).catch(() => {});

    await this.loadPersons();
    await this.loadOrganizations();
  }

  /**
   * Validate and normalize a person object
   * Throws if required fields are missing (as per tests).
   * @param {object} person
   * @returns {object} normalized person
   */
  validateAndEnhancePerson(person) {
    if (!person || typeof person !== 'object') {
      throw new Error('Person identifier is required');
    }
    if (!person.identifier || String(person.identifier).trim() === '') {
      throw new Error('Person identifier is required');
    }
    if (!person.name || String(person.name).trim() === '') {
      throw new Error('Person name is required');
    }

    // Basic normalization (safe defaults)
    const normalized = { ...person };
    normalized.identifier = String(person.identifier).trim();
    normalized.name = String(person.name).trim();
    if (!normalized['@type']) normalized['@type'] = 'Person';
    if (!normalized.url && typeof normalized.identifier === 'string') {
      normalized.url = normalized.url || undefined; // keep optional
    }
    return normalized;
  }

  /**
   * Load Schema.org Person data
   */
  async loadPersons() {
    try {
      if (fsSync.existsSync(this.personsFilePath)) {
        const personsData = await fs.readFile(this.personsFilePath, 'utf8');
        const persons = JSON.parse(personsData);

        this.persons = new Map();
        this.personsById = new Map();
        this.nextPersonId = 0;

        for (const [numericId, person] of Object.entries(persons)) {
          if (!person) continue;
          const idNum = Number.parseInt(numericId, 10);
          if (Number.isFinite(idNum)) this.nextPersonId = Math.max(this.nextPersonId, idNum + 1);

          if (person.identifier) this.persons.set(person.identifier, person);
          this.personsById.set(numericId, person);
        }
      } else {
        this.persons = new Map();
        this.personsById = new Map();
        this.nextPersonId = 0;
      }
    } catch (err) {
      this.engine?.logger?.error?.(`SchemaManager: failed to load persons: ${err.message}`);
      this.persons = new Map();
      this.personsById = new Map();
      this.nextPersonId = 0;
    }
  }

  /**
   * Load Schema.org Organization data
   */
  async loadOrganizations() {
    try {
      if (fsSync.existsSync(this.organizationsFilePath)) {
        const organizationsData = await fs.readFile(this.organizationsFilePath, 'utf8');
        const organizations = JSON.parse(organizationsData);
        this.organizations = new Map(Object.entries(organizations));
      } else {
        this.organizations = new Map();
      }
    } catch (err) {
      this.engine?.logger?.error?.(`SchemaManager: failed to load organizations: ${err.message}`);
      this.organizations = new Map();
    }
  }

  /**
   * Save Schema.org Person data
   */
  async savePersons() {
    try {
      const persons = Object.fromEntries(this.personsById);
      await fs.writeFile(this.personsFilePath, JSON.stringify(persons, null, 2), 'utf8');
    } catch (err) {
      this.engine?.logger?.error?.(`SchemaManager: failed to save persons: ${err.message}`);
      throw err;
    }
  }

  /**
   * Save Schema.org Organization data
   */
  async saveOrganizations() {
    try {
      const organizations = Object.fromEntries(this.organizations);
      await fs.writeFile(this.organizationsFilePath, JSON.stringify(organizations, null, 2), 'utf8');
    } catch (err) {
      this.engine?.logger?.error?.(`SchemaManager: failed to save organizations: ${err.message}`);
      throw err;
    }
  }

  /**
   * Get comprehensive site data for Schema.org generation
   * Reads only from ConfigurationManager
   */
  async getComprehensiveSiteData() {
    const cfgMgr = this.engine?.getManager?.('ConfigurationManager');

    const baseURL = cfgMgr?.getProperty?.('amdwiki.baseURL', 'http://localhost:3000');
    const version = cfgMgr?.getProperty?.('amdwiki.version', '0.0.0');
    const applicationName = cfgMgr?.getProperty?.('amdwiki.applicationName', 'amdWiki');
    const applicationCategory = cfgMgr?.getProperty?.('amdwiki.application.category', 'Digital Platform');

    const featureExportHtml = cfgMgr?.getProperty?.('amdwiki.features.export.html', true);
    const featureAttachments = cfgMgr?.getProperty?.('amdwiki.features.attachments.enabled', true);
    const featureLlm = cfgMgr?.getProperty?.('amdwiki.features.llm.enabled', false);

    return {
      persons: this.getPersons(),
      organizations: this.getOrganizations(),
      config: {
        application: {
          name: applicationName,
          version,
          applicationCategory,
          url: baseURL
        },
        features: {
          export: { html: featureExportHtml },
          attachments: { enabled: featureAttachments },
          llm: { enabled: featureLlm }
        }
      }
    };
  }

  getPersons() {
    return Object.fromEntries(this.personsById);
  }

  getOrganizations() {
    return Object.fromEntries(this.organizations);
  }
}

module.exports = SchemaManager;