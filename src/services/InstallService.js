const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

/**
 * InstallService - Handles first-run installation and configuration
 *
 * Manages the initial setup process including:
 * - Writing app-custom-config.json with user-provided settings
 * - Creating users/organizations.json with Schema.org organization data
 * - Copying startup pages from required-pages/ to pages/
 * - Creating the initial admin user
 *
 * @class InstallService
 */
class InstallService {
  /**
   * Creates a new InstallService instance
   *
   * @constructor
   * @param {WikiEngine} engine - The wiki engine instance
   */
  constructor(engine) {
    this.engine = engine;
    this.configManager = engine.getManager('ConfigurationManager');
  }

  /**
   * Check if installation is required
   *
   * @returns {Promise<boolean>} True if install is needed
   */
  async isInstallRequired() {
    const completed = this.configManager.getProperty('amdwiki.install.completed', false);

    if (completed) {
      return false;
    }

    // Check if admin user exists
    const userManager = this.engine.getManager('UserManager');
    const adminExists = await userManager.hasRole('admin', 'admin');

    // Check if pages directory is empty
    const pagesDir = this.configManager.getProperty('amdwiki.page.provider.filesystem.storagedir', './pages');
    const pagesExist = await this.#hasPagesInDirectory(pagesDir);

    return !adminExists || !pagesExist;
  }

  /**
   * Check if pages exist in directory
   *
   * @private
   * @param {string} dir - Directory to check
   * @returns {Promise<boolean>}
   */
  async #hasPagesInDirectory(dir) {
    try {
      const files = await fs.readdir(dir);
      return files.some(f => f.endsWith('.md'));
    } catch (error) {
      return false;
    }
  }

  /**
   * Process installation with provided data
   *
   * @async
   * @param {Object} installData - Installation form data
   * @returns {Promise<Object>} Result with success status and any errors
   */
  async processInstallation(installData) {
    try {
      // Validate required fields
      this.#validateInstallData(installData);

      // 1. Write app-custom-config.json
      await this.#writeCustomConfig(installData);

      // 2. Write users/organizations.json
      await this.#writeOrganizationData(installData);

      // 3. Create admin user
      await this.#createAdminUser(installData);

      // 4. Copy startup pages if requested
      if (installData.copyStartupPages) {
        await this.#copyStartupPages();
      }

      // 5. Mark installation as complete
      await this.#markInstallationComplete();

      return {
        success: true,
        message: 'Installation completed successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate installation data
   *
   * @private
   * @param {Object} data - Installation data
   * @throws {Error} If validation fails
   */
  #validateInstallData(data) {
    const required = [
      'applicationName',
      'baseURL',
      'adminUsername',
      'adminPassword',
      'adminEmail',
      'orgName',
      'orgDescription'
    ];

    for (const field of required) {
      if (!data[field] || data[field].trim() === '') {
        throw new Error(`Required field missing: ${field}`);
      }
    }

    // Validate password length
    if (data.adminPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Validate password confirmation
    if (data.adminPassword !== data.adminPasswordConfirm) {
      throw new Error('Passwords do not match');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.adminEmail)) {
      throw new Error('Invalid email address');
    }

    // Validate URL format
    try {
      new URL(data.baseURL);
    } catch (error) {
      throw new Error('Invalid base URL');
    }
  }

  /**
   * Write custom configuration file
   *
   * @private
   * @param {Object} data - Installation data
   * @returns {Promise<void>}
   */
  async #writeCustomConfig(data) {
    const customConfigPath = path.join(__dirname, '../../config/app-custom-config.json');

    const customConfig = {
      'amdwiki.applicationName': data.applicationName,
      'amdwiki.baseURL': data.baseURL,
      'amdwiki.session.secret': data.sessionSecret || crypto.randomBytes(32).toString('hex'),
      'amdwiki.install.completed': false, // Will be set to true at the end
      'amdwiki.install.organization.name': data.orgName,
      'amdwiki.install.organization.legalName': data.orgLegalName || '',
      'amdwiki.install.organization.description': data.orgDescription,
      'amdwiki.install.organization.foundingDate': data.orgFoundingDate || '',
      'amdwiki.install.organization.contactEmail': data.adminEmail,
      'amdwiki.install.organization.addressLocality': data.orgAddressLocality || '',
      'amdwiki.install.organization.addressRegion': data.orgAddressRegion || '',
      'amdwiki.install.organization.addressCountry': data.orgAddressCountry || ''
    };

    await fs.writeJson(customConfigPath, customConfig, { spaces: 2 });
  }

  /**
   * Write organization data to users/organizations.json
   *
   * @private
   * @param {Object} data - Installation data
   * @returns {Promise<void>}
   */
  async #writeOrganizationData(data) {
    const organizationsPath = path.join(__dirname, '../../users/organizations.json');

    const organization = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'identifier': 'amdwiki-platform',
      'name': data.orgName,
      'legalName': data.orgLegalName || null,
      'alternateName': [data.orgName],
      'url': data.baseURL,
      'description': data.orgDescription,
      'foundingDate': data.orgFoundingDate || new Date().getFullYear().toString(),
      'applicationCategory': 'Wiki Software',
      'sameAs': [],
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': null,
        'addressLocality': data.orgAddressLocality || null,
        'addressRegion': data.orgAddressRegion || null,
        'postalCode': null,
        'addressCountry': data.orgAddressCountry || null
      },
      'contactPoint': [
        {
          '@type': 'ContactPoint',
          'contactType': 'Technical Support',
          'email': data.adminEmail,
          'availableLanguage': ['English'],
          'url': data.baseURL
        }
      ],
      'makesOffer': {
        '@type': 'Offer',
        'itemOffered': {
          '@type': 'SoftwareApplication',
          'name': data.applicationName,
          'applicationCategory': 'Wiki Software',
          'operatingSystem': 'Cross-platform'
        }
      },
      'hasOfferCatalog': {
        '@type': 'OfferCatalog',
        'name': 'Knowledge Management Services',
        'itemListElement': [
          {
            '@type': 'Offer',
            'itemOffered': {
              '@type': 'Service',
              'name': 'Document Management',
              'description': 'Collaborative document creation and management'
            }
          },
          {
            '@type': 'Offer',
            'itemOffered': {
              '@type': 'Service',
              'name': 'Knowledge Base',
              'description': 'Structured knowledge repository with search capabilities'
            }
          }
        ]
      },
      'knowsAbout': [
        'Document Management',
        'Knowledge Management',
        'Wiki Software',
        'Collaborative Editing',
        'Information Architecture'
      ]
    };

    await fs.ensureDir(path.dirname(organizationsPath));
    await fs.writeJson(organizationsPath, [organization], { spaces: 2 });
  }

  /**
   * Create admin user account
   *
   * @private
   * @param {Object} data - Installation data
   * @returns {Promise<void>}
   */
  async #createAdminUser(data) {
    const userManager = this.engine.getManager('UserManager');

    const userData = {
      username: data.adminUsername,
      password: data.adminPassword,
      email: data.adminEmail,
      fullName: 'Administrator',
      roles: ['admin', 'Authenticated', 'All'],
      isActive: true
    };

    await userManager.createUser(userData);
  }

  /**
   * Copy startup pages from required-pages/ to pages/
   *
   * @private
   * @returns {Promise<void>}
   */
  async #copyStartupPages() {
    const requiredPagesDir = this.configManager.getProperty(
      'amdwiki.page.provider.filesystem.requiredpagesdir',
      './required-pages'
    );
    const pagesDir = this.configManager.getProperty(
      'amdwiki.page.provider.filesystem.storagedir',
      './pages'
    );

    // Ensure pages directory exists
    await fs.ensureDir(pagesDir);

    // Copy all .md files from required-pages to pages
    const files = await fs.readdir(requiredPagesDir);
    const mdFiles = files.filter(f => f.endsWith('.md'));

    for (const file of mdFiles) {
      const sourcePath = path.join(requiredPagesDir, file);
      const destPath = path.join(pagesDir, file);

      // Don't overwrite existing pages
      const exists = await fs.pathExists(destPath);
      if (!exists) {
        await fs.copy(sourcePath, destPath);
      }
    }
  }

  /**
   * Mark installation as complete in config
   *
   * @private
   * @returns {Promise<void>}
   */
  async #markInstallationComplete() {
    const customConfigPath = path.join(__dirname, '../../config/app-custom-config.json');
    const config = await fs.readJson(customConfigPath);
    config['amdwiki.install.completed'] = true;
    await fs.writeJson(customConfigPath, config, { spaces: 2 });
  }

  /**
   * Generate a random session secret
   *
   * @returns {string} Random hex string
   */
  generateSessionSecret() {
    return crypto.randomBytes(32).toString('hex');
  }
}

module.exports = InstallService;
