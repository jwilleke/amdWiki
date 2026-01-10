import * as fs from 'fs-extra';
import * as path from 'path';
import * as crypto from 'crypto';
import logger from '../utils/logger';

/**
 * Wiki engine interface
 */
interface WikiEngine {
  getManager(name: string): unknown;
}

/**
 * Configuration manager interface
 */
interface ConfigManager {
  getProperty<T>(key: string, defaultValue?: T): T;
  loadConfigurations(): Promise<void>;
  reload(): Promise<void>;
}

/**
 * User manager interface
 */
interface UserManager {
  hasRole(username: string, role: string): Promise<boolean>;
  updateUser(username: string, updates: Record<string, unknown>): Promise<void>;
  provider?: {
    loadUsers(): Promise<void>;
  };
}

/**
 * Installation data from form
 */
interface InstallData {
  applicationName: string;
  baseURL: string;
  adminUsername: string;
  adminPassword: string;
  adminPasswordConfirm: string;
  adminEmail: string;
  orgName: string;
  orgLegalName?: string;
  orgDescription: string;
  orgFoundingDate?: string;
  orgAddressLocality?: string;
  orgAddressRegion?: string;
  orgAddressCountry?: string;
  sessionSecret?: string;
  copyStartupPages?: boolean;
}

/**
 * Partial installation state
 */
interface PartialInstallationState {
  isPartial: boolean;
  steps: {
    configWritten?: boolean;
    organizationCreated?: boolean;
    adminCreated?: boolean;
    pagesCopied?: boolean;
  };
}

/**
 * Missing pages detection result
 */
interface MissingPagesResult {
  missingPagesOnly: boolean;
  pagesDirExists?: boolean;
  pagesDir?: string;
}

/**
 * Pages folder creation result
 */
interface PagesFolderResult {
  success: boolean;
  message?: string;
  error?: string;
  copiedCount: number;
  pagesDir?: string;
}

/**
 * Installation result
 */
interface InstallationResult {
  success: boolean;
  message?: string;
  error?: string;
  failedStep?: string;
  newlyCompleted?: string[];
  previouslyCompleted?: string[];
  completedSteps?: string[];
}

/**
 * Reset result
 */
interface ResetResult {
  success: boolean;
  message?: string;
  error?: string;
  resetSteps?: string[];
}

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
  private engine: WikiEngine;
  private configManager: ConfigManager;

  /**
   * Creates a new InstallService instance
   *
   * @constructor
   * @param engine - The wiki engine instance
   */
  constructor(engine: WikiEngine) {
    this.engine = engine;
    this.configManager = engine.getManager('ConfigurationManager') as ConfigManager;
  }

  /**
   * Check if installation is required
   *
   * @returns True if install is needed
   */
  async isInstallRequired(): Promise<boolean> {
    const completed = this.configManager.getProperty('amdwiki.install.completed', false);

    if (completed) {
      return false;
    }

    // Check if admin user exists
    const userManager = this.engine.getManager('UserManager') as UserManager;
    const adminExists = await userManager.hasRole('admin', 'admin');

    // Check if pages directory is empty
    const pagesDir = this.configManager.getProperty<string>('amdwiki.page.provider.filesystem.storagedir');
    const pagesExist = await this.#hasPagesInDirectory(pagesDir);

    return !adminExists || !pagesExist;
  }

  /**
   * Detect partial installation state
   *
   * @returns Partial installation status
   */
  async detectPartialInstallation(): Promise<PartialInstallationState> {
    const completed = this.configManager.getProperty('amdwiki.install.completed', false);

    if (completed) {
      return { isPartial: false, steps: {} };
    }

    const userManager = this.engine.getManager('UserManager') as UserManager;
    const adminExists = await userManager.hasRole('admin', 'admin');

    const pagesDir = this.configManager.getProperty<string>('amdwiki.page.provider.filesystem.storagedir');
    const pagesExist = await this.#hasPagesInDirectory(pagesDir);

    const customConfigPath = path.join(__dirname, '../../config/app-custom-config.json');
    const customConfigExists = await fs.pathExists(customConfigPath);

    const usersDir = this.configManager.getProperty<string>('amdwiki.user.provider.storagedir');
    const organizationsPath = path.join(usersDir, 'organizations.json');
    const organizationsExist = await fs.pathExists(organizationsPath);

    const steps = {
      configWritten: customConfigExists,
      organizationCreated: organizationsExist,
      adminCreated: adminExists,
      pagesCopied: pagesExist
    };

    const isPartial = Object.values(steps).some(v => v === true) && !completed;

    return { isPartial, steps };
  }

  /**
   * Detect if only pages folder is missing
   *
   * Returns true if installation is otherwise complete but pages folder is missing/empty
   *
   * @returns Result with missingPagesOnly flag and details
   */
  async detectMissingPagesOnly(): Promise<MissingPagesResult> {
    const completed = this.configManager.getProperty('amdwiki.install.completed', false);

    // Only applicable if installation is completed
    if (!completed) {
      return { missingPagesOnly: false };
    }

    const pagesDir = this.configManager.getProperty<string>('amdwiki.page.provider.filesystem.storagedir');
    const pagesExist = await this.#hasPagesInDirectory(pagesDir);

    // Check if pages directory exists but is empty
    let pagesDirExists = false;
    try {
      const stats = await fs.stat(pagesDir);
      pagesDirExists = stats.isDirectory();
    } catch {
      pagesDirExists = false;
    }

    return {
      missingPagesOnly: !pagesExist,
      pagesDirExists,
      pagesDir
    };
  }

  /**
   * Create pages folder and copy required pages
   *
   * Copies pages from required-pages directory to the pages directory
   *
   * @async
   * @returns Result with success status and number of pages copied
   */
  async createPagesFolder(): Promise<PagesFolderResult> {
    try {
      const pagesDir = this.configManager.getProperty(
        'amdwiki.page.provider.filesystem.storagedir',
        './data/pages'
      );

      const requiredPagesDir = this.configManager.getProperty(
        'amdwiki.page.provider.filesystem.requiredpagesdir',
        './required-pages'
      );

      // Create pages directory if it doesn't exist
      await fs.ensureDir(pagesDir);

      // Check if required-pages directory exists
      const requiredPagesExists = await fs.pathExists(requiredPagesDir);
      if (!requiredPagesExists) {
        return {
          success: false,
          error: `Required pages directory not found: ${requiredPagesDir}`,
          copiedCount: 0
        };
      }

      // Copy all .md files from required-pages to pages
      const files = await fs.readdir(requiredPagesDir);
      const mdFiles = files.filter(f => f.endsWith('.md'));

      let copiedCount = 0;
      for (const file of mdFiles) {
        const sourcePath = path.join(requiredPagesDir, file);
        const destPath = path.join(pagesDir, file);

        // Don't overwrite existing pages
        const exists = await fs.pathExists(destPath);
        if (!exists) {
          await fs.copy(sourcePath, destPath);
          copiedCount++;
        }
      }

      return {
        success: true,
        message: `Pages folder created and ${copiedCount} pages copied`,
        copiedCount,
        pagesDir
      };
    } catch (error) {
      const err = error as Error;
      return {
        success: false,
        error: `Failed to create pages folder: ${err.message}`,
        copiedCount: 0
      };
    }
  }

  /**
   * Check if pages exist in directory
   *
   * @private
   * @param dir - Directory to check
   * @returns True if pages exist
   */
  async #hasPagesInDirectory(dir: string): Promise<boolean> {
    try {
      const files = await fs.readdir(dir);
      return files.some(f => f.endsWith('.md'));
    } catch {
      return false;
    }
  }

  /**
   * Process installation with provided data
   *
   * Supports retrying partial installations. If some steps are already complete,
   * skips them and continues with remaining steps. This allows users to recover
   * from partial installation states without needing to reset.
   *
   * @async
   * @param installData - Installation form data
   * @returns Result with success status, completed steps, and any errors
   */
  async processInstallation(installData: InstallData): Promise<InstallationResult> {
    const installSteps: string[] = [];
    const alreadyCompleted: string[] = [];

    try {
      // Validate required fields
      this.#validateInstallData(installData);

      // Check for partial installation - get the state but don't block
      const partialState = await this.detectPartialInstallation();

      // Track which steps are already done
      if (partialState.steps.configWritten) {
        alreadyCompleted.push('configWritten');
      }
      if (partialState.steps.organizationCreated) {
        alreadyCompleted.push('organizationCreated');
      }
      if (partialState.steps.adminCreated) {
        alreadyCompleted.push('adminCreated');
      }
      if (partialState.steps.pagesCopied) {
        alreadyCompleted.push('pagesCopied');
      }

      // 1. Write app-custom-config.json (skip if already done)
      if (!partialState.steps.configWritten) {
        installSteps.push('writeConfig');
        await this.#writeCustomConfig(installData);
      }

      // 2. Write users/organizations.json (skip if already done)
      if (!partialState.steps.organizationCreated) {
        installSteps.push('writeOrganization');
        await this.#writeOrganizationData(installData);
      }

      // 3. Update admin password (always do this, user may want to change password)
      installSteps.push('updateAdminPassword');
      await this.#updateAdminPassword(installData);

      // 4. Copy startup pages if requested
      if (installData.copyStartupPages && !partialState.steps.pagesCopied) {
        installSteps.push('copyPages');
        await this.#copyStartupPages();
      }

      // 5. Mark installation as complete
      installSteps.push('markComplete');
      await this.#markInstallationComplete();

      return {
        success: true,
        message: 'Installation completed successfully',
        newlyCompleted: installSteps,
        previouslyCompleted: alreadyCompleted
      };
    } catch (error) {
      // Log which step failed
      const failedStep = installSteps[installSteps.length - 1] || 'validation';
      const err = error as Error;

      // DEBUG: Log the error
      logger.error('Installation failed:', {
        failedStep,
        error: err.message,
        stack: err.stack
      });

      return {
        success: false,
        error: err.message,
        failedStep,
        completedSteps: [...alreadyCompleted, ...installSteps.slice(0, -1)],
        newlyCompleted: installSteps.slice(0, -1),
        previouslyCompleted: alreadyCompleted
      };
    }
  }

  /**
   * Reset partial installation to allow retry
   *
   * @async
   * @returns Result with success status
   */
  async resetInstallation(): Promise<ResetResult> {
    try {
      const partialState = await this.detectPartialInstallation();

      if (!partialState.isPartial) {
        return {
          success: false,
          error: 'No partial installation detected. Nothing to reset.'
        };
      }

      const resetSteps: string[] = [];

      // 1. Remove app-custom-config.json
      const customConfigPath = path.join(__dirname, '../../config/app-custom-config.json');
      if (await fs.pathExists(customConfigPath)) {
        // Backup before deleting
        const backupPath = customConfigPath + '.backup-' + Date.now();
        await fs.copy(customConfigPath, backupPath);
        await fs.remove(customConfigPath);
        resetSteps.push('Removed custom config (backup created)');
      }

      // 2. Remove organizations.json
      const usersDir = this.configManager.getProperty<string>('amdwiki.user.provider.storagedir');
      const organizationsPath = path.join(usersDir, 'organizations.json');
      if (await fs.pathExists(organizationsPath)) {
        const backupPath = organizationsPath + '.backup-' + Date.now();
        await fs.copy(organizationsPath, backupPath);
        await fs.remove(organizationsPath);
        resetSteps.push('Removed organizations (backup created)');
      }

      // 3. Remove admin user
      const userManager = this.engine.getManager('UserManager') as UserManager;
      const adminExists = await userManager.hasRole('admin', 'admin');
      if (adminExists) {
        // Get the users file path
        const usersPath = path.join(usersDir, 'users.json');
        if (await fs.pathExists(usersPath)) {
          const backupPath = usersPath + '.backup-' + Date.now();
          await fs.copy(usersPath, backupPath);

          // Read, remove admin, write back
          const usersData = await fs.readJson(usersPath) as Record<string, unknown>;
          if (usersData.admin) {
            delete usersData.admin;
            await fs.writeJson(usersPath, usersData, { spaces: 2 });
            resetSteps.push('Removed admin user (backup created)');
          }
        }
      }

      // 4. Remove copied pages (only if they were copied during this installation)
      const pagesDir = this.configManager.getProperty(
        'amdwiki.page.provider.filesystem.storagedir',
        './data/pages'
      );

      // Only clear if directory exists and has files
      if (await fs.pathExists(pagesDir)) {
        const files = await fs.readdir(pagesDir);
        const mdFiles = files.filter(f => f.endsWith('.md'));

        if (mdFiles.length > 0) {
          // Create a backup directory
          const backupDir = pagesDir + '.backup-' + Date.now();
          await fs.copy(pagesDir, backupDir);

          // Remove only .md files, keep the directory structure
          for (const file of mdFiles) {
            await fs.remove(path.join(pagesDir, file));
          }
          resetSteps.push(`Removed ${mdFiles.length} pages (backup created)`);
        }
      }

      // 5. Reload UserManager's provider to clear cached user data
      if (userManager?.provider) {
        await userManager.provider.loadUsers();
        resetSteps.push('Reloaded user cache');
      }

      return {
        success: true,
        message: 'Installation reset successfully. You can now start the installation process again.',
        resetSteps
      };
    } catch (error) {
      const err = error as Error;
      return {
        success: false,
        error: `Reset failed: ${err.message}`
      };
    }
  }

  /**
   * Validate installation data
   *
   * @private
   * @param data - Installation data
   * @throws If validation fails
   */
  #validateInstallData(data: InstallData): void {
    const required: (keyof InstallData)[] = [
      'applicationName',
      'baseURL',
      'adminUsername',
      'adminPassword',
      'adminEmail',
      'orgName',
      'orgDescription'
    ];

    for (const field of required) {
      const value = data[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
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

    // Validate email format (allow localhost for admin@localhost)
    const emailRegex = /^[^\s@]+@([^\s@.]+\.)+[^\s@]+$|^[^\s@]+@localhost$/;
    if (!emailRegex.test(data.adminEmail)) {
      throw new Error('Invalid email address');
    }

    // Validate URL format
    try {
      new URL(data.baseURL);
    } catch {
      throw new Error('Invalid base URL');
    }
  }

  /**
   * Write custom configuration file
   *
   * @private
   * @param data - Installation data
   */
  async #writeCustomConfig(data: InstallData): Promise<void> {
    const customConfigPath = path.join(__dirname, '../../config/app-custom-config.json');

    // Read existing custom config or start fresh
    let customConfig: Record<string, unknown> = {};
    if (await fs.pathExists(customConfigPath)) {
      try {
        customConfig = await fs.readJson(customConfigPath) as Record<string, unknown>;
      } catch {
        customConfig = {};
      }
    }

    // Merge installation data using ConfigurationManager's merge strategy
    const installationProperties: Record<string, unknown> = {
      'amdwiki.applicationName': data.applicationName,
      'amdwiki.baseURL': data.baseURL,
      'amdwiki.session.secret': data.sessionSecret || crypto.randomBytes(32).toString('hex'),
      'amdwiki.install.completed': false,
      'amdwiki.install.organization.name': data.orgName,
      'amdwiki.install.organization.legalName': data.orgLegalName || '',
      'amdwiki.install.organization.description': data.orgDescription,
      'amdwiki.install.organization.foundingDate': data.orgFoundingDate || '',
      'amdwiki.install.organization.contactEmail': data.adminEmail,
      'amdwiki.install.organization.addressLocality': data.orgAddressLocality || '',
      'amdwiki.install.organization.addressRegion': data.orgAddressRegion || '',
      'amdwiki.install.organization.addressCountry': data.orgAddressCountry || ''
    };

    // Merge with existing config
    Object.assign(customConfig, installationProperties);

    // Write merged config back to file
    await fs.writeJson(customConfigPath, customConfig, { spaces: 2 });

    // Reload ConfigurationManager to pick up new values
    await this.configManager.loadConfigurations();
  }

  /**
   * Write organization data to users/organizations.json
   *
   * @private
   * @param data - Installation data
   */
  async #writeOrganizationData(data: InstallData): Promise<void> {
    const usersDir = this.configManager.getProperty<string>('amdwiki.user.provider.storagedir');
    const organizationsPath = path.join(usersDir, 'organizations.json');

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
   * Update admin user password during installation
   *
   * Updates the password for the default admin account created during system initialization.
   * Username (admin) and email (admin@localhost) are fixed and cannot be changed.
   *
   * @private
   * @param data - Installation data
   */
  async #updateAdminPassword(data: InstallData): Promise<void> {
    const userManager = this.engine.getManager('UserManager') as UserManager;

    // Update existing admin user (created during system initialization)
    // Only update the password - username and email are fixed
    const updates = {
      password: data.adminPassword
      // username: 'admin' - FIXED, cannot change
      // email: 'admin@localhost' - FIXED, cannot change
    };

    await userManager.updateUser('admin', updates);
  }

  /**
   * Copy startup pages from required-pages/ to pages/
   *
   * @private
   */
  async #copyStartupPages(): Promise<void> {
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
   */
  async #markInstallationComplete(): Promise<void> {
    const customConfigPath = path.join(__dirname, '../../config/app-custom-config.json');

    // Read current config
    const config = await fs.readJson(customConfigPath) as Record<string, unknown>;

    // Set the completion flag
    config['amdwiki.install.completed'] = true;

    // Write updated config
    await fs.writeJson(customConfigPath, config, { spaces: 2 });

    // Reload ConfigurationManager so the flag is available
    await this.configManager.reload();
  }

  /**
   * Generate a random session secret
   *
   * @returns Random hex string
   */
  generateSessionSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}

export default InstallService;

// CommonJS compatibility
module.exports = InstallService;
