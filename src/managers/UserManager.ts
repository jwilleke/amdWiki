/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */

import BaseManager, { BackupData } from './BaseManager';


import crypto from 'crypto';
import logger from '../utils/logger';
import LocaleUtils from '../utils/LocaleUtils';
import { WikiEngine } from '../types/WikiEngine';
import { UserProvider } from '../types/Provider';
import { User, Role, UserPreferences, UserSession } from '../types/User';
import type ConfigurationManager from './ConfigurationManager';
import type { Request, Response, NextFunction } from 'express';

/**
 * Provider information returned by getProviderInfo()
 */
interface ProviderInfo {
  name: string;
  version: string;
  features?: string[];
}

/**
 * Provider constructor type for dynamic loading
 */
interface UserProviderConstructor {
   
  new (engine: WikiEngine): any;
}

/**
 * User creation input data
 */
interface UserCreateInput {
  username: string;
  email: string;
  displayName?: string;
  password: string;
  roles?: string[];
  isExternal?: boolean;
  isActive?: boolean;
  acceptLanguage?: string;
}

/**
 * User update input data
 */
interface UserUpdateInput {
  email?: string;
  displayName?: string;
  password?: string;
  roles?: string[];
  isActive?: boolean;
  preferences?: Partial<UserPreferences>;
}

/**
 * External user data from OAuth/JWT
 */
interface ExternalUserData {
  username: string;
  email: string;
  displayName?: string;
  roles?: string[];
  provider: string;
}

/**
 * User context for permission evaluation
 */
interface UserContext {
  username: string;
  displayName?: string;
  roles: string[];
  isAuthenticated: boolean;
  isExternal?: boolean;
  hasSessionCookie?: boolean;
}

/**
 * Role creation data (deprecated)
 */
interface RoleCreateData {
  name: string;
  displayName?: string;
  description?: string;
}

/**
 * Session creation data
 */
interface _SessionData {
  id: string;
  username: string;
  expiresAt: string;
  [key: string]: unknown;
}

/**
 * UserManager - Handles user authentication, authorization, and roles
 *
 * Similar to JSPWiki's UserManager with role-based permissions. This manager
 * orchestrates user operations through a pluggable provider system, allowing
 * different storage backends (file, database, LDAP, etc.) to be used.
 *
 * Key responsibilities:
 * - User authentication (login/logout)
 * - Password management with hashing
 * - Role and permission management
 * - Session management
 * - User profile management
 * - Provider abstraction for storage
 *
 * Follows JSPWiki's provider pattern where the actual storage implementation
 * is abstracted behind a provider interface. This allows for different storage
 * backends (file, database, LDAP, etc.) to be swapped via configuration.
 *
 * @class UserManager
 * @extends BaseManager
 *
 * @property {UserProvider|null} provider - The active user storage provider
 * @property {string} providerClass - The class name of the loaded provider
 * @property {Map<string, Role>} roles - Role definitions
 * @property {Map<string, string>} permissions - Permission definitions
 * @property {string} passwordSalt - Salt for password hashing
 * @property {string} defaultPassword - Default password for new admin user
 * @property {number} sessionExpiration - Session expiration time in milliseconds
 * @property {string} defaultTimezone - Default timezone for users
 *
 * @see {@link BaseManager} for base functionality
 * @see {@link FileUserProvider} for default provider implementation
 *
 * @example
 * const userManager = engine.getManager('UserManager');
 * const user = await userManager.authenticateUser('admin', 'password');
 * if (user) logger.info('Logged in:', user.username);
 */
class UserManager extends BaseManager {
  private provider: UserProvider | null = null;
  private providerClass?: string;
  private roles: Map<string, Role> = new Map();
  private permissions: Map<string, string> = new Map();
  private passwordSalt?: string;
  private defaultPassword?: string;
  private sessionExpiration?: number;
  private defaultTimezone?: string;

  /**
   * Creates a new UserManager instance
   *
   * @constructor
   * @param {WikiEngine} engine - The wiki engine instance
   */
  constructor(engine: any) {
    super(engine);
  }

  /**
   * Initialize the UserManager and load the configured provider
   *
   * Loads the user provider, role definitions, and creates a default admin
   * user if no users exist.
   *
   * @async
   * @param {Record<string, unknown>} [config={}] - Configuration object (unused, reads from ConfigurationManager)
   * @returns {Promise<void>}
   * @throws {Error} If ConfigurationManager is not available or provider fails to load
   *
   * @example
   * await userManager.initialize();
   * // Creates default admin if no users exist
   */
  async initialize(config: Record<string, unknown> = {}): Promise<void> {
    await super.initialize(config);

    const configManager = this.engine.getManager('ConfigurationManager') as ConfigurationManager | undefined;
    if (!configManager) {
      throw new Error('UserManager requires ConfigurationManager');
    }

    // Load provider with fallback (ALL LOWERCASE)
    const defaultProvider = configManager.getProperty(
      'amdwiki.user.provider.default',
      'fileuserprovider'
    ) as string;
    const providerName = configManager.getProperty(
      'amdwiki.user.provider',
      defaultProvider
    ) as string;

    // Normalize provider name to PascalCase for class loading
    this.providerClass = this.normalizeProviderName(providerName);

    logger.info(`👤 Loading user provider: ${providerName} (${this.providerClass})`);

    // Load and initialize provider
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const ProviderClass = require(`../providers/${this.providerClass}`) as UserProviderConstructor;
       
      this.provider = new ProviderClass(this.engine);
      await this.provider.initialize();

      const info = this.getProviderInfo();
      logger.info(`👤 UserManager initialized with ${info.name} v${info.version}`);
      if (info.features && info.features.length > 0) {
        logger.info(`👤 Provider features: ${info.features.join(', ')}`);
      }
    } catch (error) {
      logger.error(`👤 Failed to initialize user provider: ${this.providerClass}`, error);
      throw error;
    }

    // Load configuration settings (for business logic)
    this.passwordSalt = configManager.getProperty(
      'amdwiki.user.security.passwordsalt',
      'amdwiki-salt'
    ) as string;
    this.defaultPassword = configManager.getProperty(
      'amdwiki.user.security.defaultpassword',
      'admin123'
    ) as string;
    this.sessionExpiration = configManager.getProperty(
      'amdwiki.user.security.sessionexpiration',
      86400000
    ) as number;
    this.defaultTimezone = configManager.getProperty(
      'amdwiki.user.defaults.timezone',
      'utc'
    ) as string;

    // Load role definitions from config
    const roleDefinitions = configManager.getProperty(
      'amdwiki.roles.definitions',
      {}
    ) as Record<string, Role>;
    this.roles = new Map(Object.entries(roleDefinitions));

    logger.info(`👤 Loaded ${this.roles.size} role definitions from configuration`);

    // Initialize permissions registry
    this.initializePermissions();

    // Create default admin if needed
    const allUsers = await this.provider.getAllUsers();
    if (allUsers.size === 0) {
      await this.createDefaultAdmin();
    }

    const userCount = (await this.provider.getAllUsers()).size;
    logger.info(`👤 UserManager initialized with ${userCount} users`);
  }

  /**
   * Initialize the permissions registry with all available permissions
   * @private
   */
  private initializePermissions(): void {
    // Define all available permissions in the system
    this.permissions.set('page:read', 'View wiki pages');
    this.permissions.set('page:edit', 'Edit wiki pages');
    this.permissions.set('page:create', 'Create new wiki pages');
    this.permissions.set('page:delete', 'Delete wiki pages');
    this.permissions.set('page:rename', 'Rename wiki pages');
    this.permissions.set('attachment:read', 'View attachments');
    this.permissions.set('attachment:upload', 'Upload attachments');
    this.permissions.set('attachment:delete', 'Delete attachments');
    this.permissions.set('search:all', 'Access search functionality');
    this.permissions.set('export:pages', 'Export pages');
    this.permissions.set('admin:system', 'System administration');
    this.permissions.set('admin:users', 'User management');
    this.permissions.set('admin:roles', 'Role management');

    logger.info(`👤 Initialized ${this.permissions.size} permissions`);
  }

  /**
   * Normalize provider name from configuration (lowercase) to class name (PascalCase)
   * @param {string} providerName - Provider name from configuration (e.g., 'fileuserprovider')
   * @returns {string} Normalized class name (e.g., 'FileUserProvider')
   * @private
   */
  private normalizeProviderName(providerName: string): string {
    if (!providerName) {
      throw new Error('Provider name cannot be empty');
    }

    const lower = providerName.toLowerCase();

    // Handle special cases for known provider names
    const knownProviders: Record<string, string> = {
      'fileuserprovider': 'FileUserProvider',
      'jsonuserprovider': 'FileUserProvider', // Alias
      'databaseuserprovider': 'DatabaseUserProvider',
      'ldapuserprovider': 'LDAPUserProvider'
    };

    if (knownProviders[lower]) {
      return knownProviders[lower];
    }

    // Fallback: Split on common separators and capitalize each word
    const words = lower.split(/[-_]/);
    const pascalCase = words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    return pascalCase;
  }

  /**
   * Get the current user provider instance
   * @returns {UserProvider | null} The active provider
   */
  getCurrentUserProvider(): UserProvider | null {
    return this.provider;
  }

  /**
   * Get provider information
   * @private
   */
  private getProviderInfo(): ProviderInfo {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    // Provider classes have getProviderInfo() method
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (this.provider as any).getProviderInfo();
  }

  /**
   * Simple password hashing using crypto
   * @param {string} password - Plain text password
   * @returns {string} Hashed password
   */
  hashPassword(password: string): string {
    const salt = this.passwordSalt || 'amdwiki-salt';
    return crypto.createHash('sha256').update(password + salt).digest('hex');
  }

  /**
   * Verify password against hash
   * @param {string} password - Plain text password
   * @param {string} hash - Stored hash
   * @returns {boolean} True if password matches
   */
  verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }

  /**
   * Check if admin user still has the default password
   * @returns {Promise<boolean>} True if admin has default password
   */
  async isAdminUsingDefaultPassword(): Promise<boolean> {
    try {
      if (!this.provider) {
        return false;
      }
      const adminUser = await this.provider.getUser('admin');
      if (!adminUser) {
        return false;
      }
      const defaultPassword = this.defaultPassword || 'admin123';
      return this.verifyPassword(defaultPassword, adminUser.password);
    } catch (error) {
      logger.error('Error checking admin default password:', error);
      return false;
    }
  }

  /**
   * Create default admin user
   */
  async createDefaultAdmin(): Promise<void> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const defaultPassword = this.defaultPassword || 'admin123';

    const adminUser: User = {
      username: 'admin',
      email: 'admin@localhost',
      displayName: 'Administrator',
      password: this.hashPassword(defaultPassword),
      roles: ['admin'],
      isActive: true,
      isSystem: true,
      isExternal: false, // Local account
      createdAt: new Date().toISOString(),
      lastLogin: undefined,
      loginCount: 0,
      preferences: {}
    };

    await this.provider.createUser(adminUser);

    // Sync default admin to Schema.org data
    try {
       
      const schemaManager = this.engine.getManager('SchemaManager');
       
      if (schemaManager && schemaManager.isInitialized()) {
         
        const personData: any = {
          '@context': 'https://schema.org',
          '@type': 'Person',
          'identifier': 'admin',
          'name': 'Administrator',
          'alternateName': ['admin'],
          'email': 'admin@localhost',
          'memberOf': {
            '@type': 'Organization',
            'identifier': 'amdwiki-platform',
            'name': 'amdWiki Platform'
          },
          'worksFor': {
            '@type': 'Organization',
            'identifier': 'amdwiki-platform',
            'name': 'amdWiki Platform'
          },
          'hasCredential': [{
            '@type': 'EducationalOccupationalCredential',
            'credentialCategory': 'admin',
            'competencyRequired': ['System Administration', 'User Management', 'Configuration Management'],
            'issuedBy': {
              '@type': 'Organization',
              'identifier': 'amdwiki-platform'
            }
          }],
          'jobTitle': 'Administrator',
          'memberOfStartDate': adminUser.createdAt,
          'dateCreated': adminUser.createdAt,
          'authentication': {
            'passwordHash': adminUser.password,
            'isSystem': true,
            'preferences': adminUser.preferences
          },
          'contactPoint': {
            '@type': 'ContactPoint',
            'contactType': 'Account',
            'availableLanguage': ['English'],
            'email': 'admin@localhost'
          }
        };

         
        await schemaManager.createPerson(personData);
        logger.info('📋 Synced default admin to Schema.org data');
      }
    } catch (error) {
      logger.error('❌ Failed to sync default admin to Schema.org data:', error instanceof Error ? error.message : String(error));
    }

    logger.info(`👤 Created default admin user (username: admin, password: ${defaultPassword})`);
  }

  /**
   * Create or update external user from OAuth/JWT token
   * @param {ExternalUserData} externalUserData - User data from external provider
   * @returns {Omit<User, 'password'>} User object
   */
  async createOrUpdateExternalUser(externalUserData: ExternalUserData): Promise<Omit<User, 'password'>> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const { username, email, displayName, roles = ['reader'], provider } = externalUserData;

    let user = await this.provider.getUser(username);

    if (!user) {
      // Create new external user
      user = {
        username,
        email,
        displayName: displayName || username,
        password: '', // No password for external users
        roles,
        isActive: true,
        isSystem: false,
        isExternal: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        loginCount: 1,
        preferences: {}
      };

      await this.provider.createUser(user);
      logger.info(`👤 Created external user: ${username} (${provider})`);
    } else {
      // Update existing external user
      user.email = email;
      user.displayName = displayName || user.displayName;
      user.roles = roles;
      user.lastLogin = new Date().toISOString();
      user.loginCount = (user.loginCount || 0) + 1;

      await this.provider.updateUser(username, user);
      logger.info(`👤 Updated external user: ${username} (${provider})`);
    }

    // Return user without password
    const { password: _pwd, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Authenticate user with username/password
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise<(Omit<User, 'password'> & { isAuthenticated: boolean }) | null>} User object if authenticated
   */
  async authenticateUser(username: string, password: string): Promise<(Omit<User, 'password'> & { isAuthenticated: boolean }) | null> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const user = await this.provider.getUser(username);
    if (!user || !user.isActive) {
      return null;
    }

    const isValid = this.verifyPassword(password, user.password);
    if (!isValid) {
      return null;
    }

    // Update login stats
    user.lastLogin = new Date().toISOString();
    user.loginCount = (user.loginCount || 0) + 1;
    await this.provider.updateUser(username, user);

    // CRITICAL FIX: Return a user object that is ready to be placed in the session.
    // It must include the `isAuthenticated` flag.
    const { password: _pwd, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      isAuthenticated: true
    };
  }

  /**
   * Check if user has permission using policy-based access control
   * @param {string} username - Username (null for anonymous)
   * @param {string} action - Action/permission to check (e.g., 'page:create', 'admin:users')
   * @returns {Promise<boolean>} True if user has permission via policies
   */
  async hasPermission(username: string, action: string): Promise<boolean> {
     
    const policyEvaluator = this.engine?.getManager('PolicyEvaluator');
    if (!policyEvaluator) {
      logger.warn('[UserManager] PolicyEvaluator not available, denying permission');
      return false;
    }

    if (!this.provider) {
      return false;
    }

    // Build user context for policy evaluation
    let userContext: UserContext;
    if (!username || username === 'anonymous') {
      userContext = {
        username: 'Anonymous',
        roles: ['anonymous', 'All'],
        isAuthenticated: false
      };
    } else if (username === 'asserted') {
      userContext = {
        username: 'Asserted',
        roles: ['reader', 'All'],
        isAuthenticated: false
      };
    } else {
      const user = await this.provider.getUser(username);
      if (!user || !user.isActive) {
        return false;
      }
      userContext = {
        username: user.username,
        roles: [...(user.roles || []), 'Authenticated', 'All'],
        isAuthenticated: true
      };
    }

    // Evaluate using policies - use generic page resource for permission checks
     
    const result = await policyEvaluator.evaluateAccess({
      pageName: '*',  // Generic - checking user capability, not specific page
      action: action,
      userContext: userContext
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result.allowed;
  }

  /**
   * Get user's effective permissions from PolicyManager
   * @param {string} username - Username (null for anonymous)
   * @returns {Promise<string[]>} Array of permission strings
   */
  async getUserPermissions(username: string): Promise<string[]> {
    // Query PolicyManager for actual permissions
     
    const policyManager = this.engine.getManager('PolicyManager');
    if (!policyManager) {
      logger.warn('PolicyManager not available, returning empty permissions');
      return [];
    }

    if (!this.provider) {
      return [];
    }

    // Handle anonymous user (no session cookie)
    if (!username || username === 'anonymous') {
      const userRoles = ['anonymous', 'All'];
      return this.getPermissionsFromPolicies(policyManager, userRoles);
    }

    // Handle asserted user (has session cookie but expired/invalid)
    if (username === 'asserted') {
      const userRoles = ['reader', 'All'];
      return this.getPermissionsFromPolicies(policyManager, userRoles);
    }

    const user = await this.provider.getUser(username);
    if (!user || !user.isActive) {
      return [];
    }

    // Get all user's roles (including Authenticated, All)
    const userRoles = [...(user.roles || []), 'Authenticated', 'All'];
    return this.getPermissionsFromPolicies(policyManager, userRoles);
  }

  /**
   * Helper method to get permissions from policies for given roles
   * @private
   * @param {any} policyManager - PolicyManager instance
   * @param {string[]} userRoles - Array of role names
   * @returns {string[]} Array of permission strings
   */
   
   
  private getPermissionsFromPolicies(policyManager: any, userRoles: string[]): string[] {
     
     
    const policies = policyManager.getAllPolicies();
    const permissions = new Set<string>();

    // Collect permissions from all matching allow policies
     
     
    for (const policy of policies) {
       
       
      if (policy.effect === 'allow') {
         
         
        const hasMatchingRole = policy.subjects.some((subject: any) =>
           
          subject.type === 'role' && userRoles.includes(subject.value)
        );

        if (hasMatchingRole) {
           
           
          policy.actions.forEach((action: string) => permissions.add(action));
        }
      }
    }

    return Array.from(permissions);
  }

  /**
   * Check if a display name conflicts with existing page names or other users
   * @param {string} displayName - Display name to check
   * @param {string | null} excludeUsername - Username to exclude from the check (for updates)
   * @returns {Promise<boolean>} True if conflict exists
   */
  async checkDisplayNamePageConflict(displayName: string, excludeUsername: string | null = null): Promise<boolean> {
    try {
      if (!this.provider) {
        return false;
      }

      // Check if display name is already used by another user
      const allUsers = await this.provider.getAllUsers();
      for (const [username, user] of allUsers) {
        if (username !== excludeUsername && user.displayName === displayName) {
          return true; // Display name already in use by another user
        }
      }

       
      const pageManager = this.engine.getManager('PageManager');
      if (!pageManager) {
        return false; // If no page manager, no conflict possible
      }

      // Check if page exists with this name (as title, slug, or exact match)
       
      const existingPage = await pageManager.getPage(displayName);
      return existingPage !== null;
    } catch (error) {
      logger.error('Error checking display name page conflict:', error);
      return false; // On error, assume no conflict to avoid blocking registration
    }
  }

  /**
   * Create a user page for a new user
   * @param {User} user - User object
   * @returns {Promise<boolean>} True if user page was created successfully
   */
  async createUserPage(user: User): Promise<boolean> {
    try {
       
      const pageManager = this.engine.getManager('PageManager');
      if (!pageManager) {
        logger.warn('PageManager not available, cannot create user page');
        return false;
      }

       
      const templateManager = this.engine.getManager('TemplateManager');
      if (!templateManager) {
        logger.warn('TemplateManager not available, cannot create user page');
        return false;
      }

      // Check if user page already exists
       
      const existingPage = await pageManager.getPage(user.displayName);
      if (existingPage) {
        logger.info(`User page already exists for ${user.displayName}`);
        return true;
      }

      // Get user page template
       
      const templateContent = await templateManager.getTemplate('user-page');

      // Populate template with user data
       
      const populatedContent = await templateManager.populateTemplate(templateContent, {
        displayName: user.displayName,
        username: user.username,
        createdDate: new Date(user.createdAt).toLocaleDateString(),
        userKeywords: ['user-page', user.displayName.toLowerCase().replace(/\s+/g, '-')]
      });

      // Generate metadata for the user page
       
      const validationManager = this.engine.getManager('ValidationManager');
       
      const metadata = validationManager.generateValidMetadata(user.displayName, {
        'user-keywords': ['user-page', user.displayName.toLowerCase().replace(/\s+/g, '-')],
        'system-category': 'User Pages',
        created: user.createdAt,
        author: user.username
      });

      // Save the user page
       
      const result = await pageManager.savePage(user.displayName, populatedContent, metadata, user);

       
      if (result.success) {
        logger.info(`✅ Created user page for ${user.displayName}`);
        return true;
      } else {
         
        logger.error(`❌ Failed to create user page for ${user.displayName}:`, result.error);
        return false;
      }
    } catch (error) {
      logger.error(`❌ Error creating user page for ${user.displayName}:`, error);
      return false;
    }
  }

  /**
   * Create new user
   * @param {UserCreateInput} userData - User data
   * @returns {Promise<Omit<User, 'password'>>} Created user (without password)
   */
  async createUser(userData: UserCreateInput): Promise<Omit<User, 'password'>> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const { username, email, displayName, password, roles = ['reader'], isExternal = false, isActive = true, acceptLanguage } = userData;

    if (await this.provider.userExists(username)) {
       
      const existingUsers = await this.provider.getAllUsernames();
       
      throw new Error(`Username already exists: "${username}". Existing users: ${existingUsers.join(', ')}`);
    }

    const finalDisplayName = displayName || username;
    const hasPageConflict = await this.checkDisplayNamePageConflict(finalDisplayName);
    if (hasPageConflict) {
      throw new Error(`Display name "${finalDisplayName}" conflicts with an existing page. Please choose a different display name.`);
    }

    const hashedPassword = isExternal ? '' : this.hashPassword(password);

    const userLocale = LocaleUtils.parseAcceptLanguage(acceptLanguage);
    const defaultDateFormat = LocaleUtils.getDateFormatFromLocale(userLocale);
    const defaultTimeFormat = LocaleUtils.getTimeFormatFromLocale(userLocale);

    const configManager = this.engine.getManager('ConfigurationManager') as ConfigurationManager | undefined;
    const defaultTimezone = configManager ?
      (configManager.getProperty('amdwiki.default.timezone', 'UTC') as string) : 'UTC';

    const user: User = {
      username,
      email,
      displayName: displayName || username,
      password: hashedPassword,
      roles,
      isActive: isActive,
      isSystem: false,
      isExternal: isExternal,
      createdAt: new Date().toISOString(),
      lastLogin: undefined,
      loginCount: 0,
      preferences: {
        locale: userLocale,
        dateFormat: defaultDateFormat,
        timeFormat: defaultTimeFormat,
        timezone: defaultTimezone
      }
    };

    await this.provider.createUser(user);

    // Schema.org sync
    try {
       
      const schemaManager = this.engine.getManager('SchemaManager');
       
      if (schemaManager && schemaManager.isInitialized()) {
         
        const personData: any = {
          '@context': 'https://schema.org',
          '@type': 'Person',
          'identifier': username,
          'name': user.displayName,
          'alternateName': [username],
          'email': user.email,
          'memberOf': { '@type': 'Organization', 'identifier': 'amdwiki-platform', 'name': 'amdWiki Platform' },
          'worksFor': { '@type': 'Organization', 'identifier': 'amdwiki-platform', 'name': 'amdWiki Platform' },
          'hasCredential': roles.map(role => ({
            '@type': 'EducationalOccupationalCredential',
            'credentialCategory': role,
            'competencyRequired': this.getRoleCompetencies(role),
            'issuedBy': { '@type': 'Organization', 'identifier': 'amdwiki-platform' }
          })),
          'jobTitle': this.getJobTitleFromRoles(roles),
          'memberOfStartDate': user.createdAt,
          'dateCreated': user.createdAt,
          'authentication': { 'passwordHash': user.password, 'isSystem': user.isSystem, 'preferences': user.preferences },
          'contactPoint': { '@type': 'ContactPoint', 'contactType': 'Account', 'availableLanguage': ['English'], 'email': user.email }
        };
         
        await schemaManager.createPerson(personData);
        logger.info(`📋 Synced user ${username} to Schema.org data`);
      }
    } catch (error) {
      logger.error(`❌ Failed to sync user ${username} to Schema.org data:`, error instanceof Error ? error.message : String(error));
    }

    logger.info(`👤 Created user: ${username} (${isExternal ? 'External' : 'Local'})`);

    try {
      await this.createUserPage(user);
    } catch (error) {
      logger.warn(`⚠️  Failed to create user page for ${username}:`, error instanceof Error ? error.message : String(error));
    }

    const { password: _pwd, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Update user
   */
  async updateUser(username: string, updates: UserUpdateInput): Promise<User> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const user = await this.provider.getUser(username);
    if (!user) {
      throw new Error('User not found');
    }

    if (updates.password) {
      if (user.isExternal) {
        throw new Error('Cannot change password for external OAuth users');
      }
      updates.password = this.hashPassword(updates.password);
    }

    Object.assign(user, updates);
    await this.provider.updateUser(username, user);

    // Schema.org sync
    try {
       
      const schemaManager = this.engine.getManager('SchemaManager');
       
      if (schemaManager && schemaManager.isInitialized()) {
         
         
        const updateData: any = {};
        if (updates.displayName) updateData.name = updates.displayName;
        if (updates.email) {
          updateData.email = updates.email;
          updateData.contactPoint = { email: updates.email };
        }
        if (updates.roles) {
          updateData.hasCredential = updates.roles.map(role => ({
            '@type': 'EducationalOccupationalCredential',
            'credentialCategory': role,
            'competencyRequired': this.getRoleCompetencies(role),
            'issuedBy': { '@type': 'Organization', 'identifier': 'amdwiki-platform' }
          }));
          updateData.jobTitle = this.getJobTitleFromRoles(updates.roles);
        }
        if (updates.preferences) {
          updateData.authentication = { preferences: updates.preferences };
        }
        if (Object.keys(updateData).length > 0) {
          updateData.lastReviewed = new Date().toISOString();
           
          await schemaManager.updatePerson(username, updateData);
        }
      }
    } catch (error) {
      logger.error('❌ Failed to sync user updates:', error instanceof Error ? error.message : String(error));
    }

    logger.info(`👤 Updated user: ${username}`);
    return user;
  }

  /**
   * Delete user
   */
  async deleteUser(username: string): Promise<boolean> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const user = await this.provider.getUser(username);
    if (!user) {
      throw new Error('User not found');
    }
    if (user.isSystem) {
      throw new Error('Cannot delete system user');
    }

    await this.provider.deleteUser(username);

    try {
       
      const schemaManager = this.engine.getManager('SchemaManager');
       
      if (schemaManager && schemaManager.isInitialized() && typeof schemaManager.deletePerson === 'function') {
         
        await schemaManager.deletePerson(username);
      }
    } catch (error) {
      logger.error('❌ Failed to remove user from Schema.org:', error instanceof Error ? error.message : String(error));
    }

    logger.info(`👤 Deleted user: ${username}`);
    return true;
  }

  async getUsers(): Promise<Omit<User, 'password'>[]> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    const allUsers = await this.provider.getAllUsers();
    return Array.from(allUsers.values()).map(user => {
      const { password: _pwd, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  async getUser(username: string): Promise<Omit<User, 'password'> | undefined> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    const user = await this.provider.getUser(username);
    if (!user) {
      return undefined;
    }
    const { password: _pwd, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  getRoles(): Role[] {
    return Array.from(this.roles.values());
  }

  getPermissions(): Map<string, string> {
    return this.permissions;
  }

  getRole(roleName: string): Role | null {
    return this.roles.get(roleName) || null;
  }

  createRole(roleData: RoleCreateData): never {
    const { name, displayName: _displayName, description: _description } = roleData;
    logger.warn(`[DEPRECATED] createRole() is deprecated. Add role '${name}' to config/app-custom-config.json`);
    throw new Error('createRole() is deprecated. Please add custom roles to config/app-custom-config.json');
  }

  deleteRole(roleName: string): never {
    logger.warn(`[DEPRECATED] deleteRole() is deprecated. Remove role '${roleName}' from config`);
    throw new Error('deleteRole() is deprecated. Please remove custom roles from config');
  }

  updateRolePermissions(_roleName: string, _updates: unknown): never {
    logger.warn('[DEPRECATED] updateRolePermissions() is deprecated.');
    throw new Error('updateRolePermissions() is deprecated. Use config files and policies');
  }

  async getCurrentUser(req: Request): Promise<UserContext> {
    if (!this.provider) {
      return this.getAnonymousUser();
    }

     
    if ((req as any).session && (req as any).session.user && (req as any).session.user.isAuthenticated) {
       
      const userFromSession = (req as any).session.user;
      const freshUser = await this.provider.getUser(userFromSession.username);
      if (!freshUser || !freshUser.isActive) {
        return this.getAnonymousUser();
      }

      const currentUserContext: UserContext = {
        ...freshUser,
        isAuthenticated: true
      } as UserContext;

      const roles = new Set(currentUserContext.roles || []);
      roles.add('All');
      roles.add('Authenticated');
      currentUserContext.roles = Array.from(roles);

      return currentUserContext;
    }

    return this.getAnonymousUser();
  }

  ensureAuthenticated(req: Request, res: Response, next: NextFunction): void {
     
     
    const user = (req as any).user;
     
    if (!user || !user.isAuthenticated) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    next();
  }

  requirePermissions(requiredPermissions: string[] = []) {
    return (req: Request, res: Response, next: NextFunction): void => {
       
      const user = (req as any).user;
      if (!user || !user.isAuthenticated) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const hasPermission = requiredPermissions.some(permission => this.hasPermission(user.username, permission));
      if (!hasPermission) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }
      next();
    };
  }

  getAnonymousUser(): UserContext {
    return {
      username: 'Anonymous',
      displayName: 'Anonymous User',
      roles: ['Anonymous', 'All'],
      isAuthenticated: false
    };
  }

  getAssertedUser(): UserContext {
    return {
      username: 'asserted',
      displayName: 'Asserted User',
      roles: ['reader'],
      isAuthenticated: false,
      hasSessionCookie: true
    };
  }

  async hasRole(username: string, roleName: string): Promise<boolean> {
    if (!this.provider) {
      return false;
    }
    const user = await this.provider.getUser(username);
    if (!user || !user.roles) {
      return false;
    }
    return user.roles.includes(roleName);
  }

  async assignRole(username: string, roleName: string): Promise<boolean> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    const user = await this.provider.getUser(username);
    if (!user) {
      throw new Error('User not found');
    }
    if (!this.roles.has(roleName)) {
      throw new Error('Role not found');
    }
    if (!user.roles.includes(roleName)) {
      user.roles.push(roleName);
      await this.provider.updateUser(username, user);
      logger.info(`👤 Assigned role '${roleName}' to user '${username}'`);
    }
    return true;
  }

  async removeRole(username: string, roleName: string): Promise<boolean> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    const user = await this.provider.getUser(username);
    if (!user) {
      throw new Error('User not found');
    }
    const roleIndex = user.roles.indexOf(roleName);
    if (roleIndex > -1) {
      user.roles.splice(roleIndex, 1);
      await this.provider.updateUser(username, user);
      logger.info(`👤 Removed role '${roleName}' from user '${username}'`);
    }
    return true;
  }

  getRoleCompetencies(role: string): string[] {
    const competencies: Record<string, string[]> = {
      'admin': ['System Administration', 'User Management', 'Configuration Management'],
      'editor': ['Content Creation', 'Content Editing', 'Wiki Markup'],
      'reader': ['Content Consumption', 'Basic Navigation']
    };
    return competencies[role] || ['Basic Platform Usage'];
  }

  getJobTitleFromRoles(roles: string[]): string {
    if (roles.includes('admin')) return 'Administrator';
    if (roles.includes('editor')) return 'Content Editor';
    if (roles.includes('reader')) return 'Reader';
    return 'User';
  }

  async createSession(username: string, additionalData: Record<string, unknown> = {}): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    const sessionId = crypto.randomBytes(16).toString('hex');
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const sessionData: UserSession = {
      sessionId,
      username,
      userId: username,
      createdAt: now,
      expiresAt,
      lastActivity: now,
      data: additionalData as Record<string, any>
    };
    await this.provider.createSession(sessionId, sessionData);
    return sessionId;
  }

  async getSession(sessionId: string): Promise<UserSession | null> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    return await this.provider.getSession(sessionId);
  }

  async deleteSession(sessionId: string): Promise<void> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    await this.provider.deleteSession(sessionId);
  }

  async deleteUserSessions(username: string): Promise<void> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
     
    const allSessions = await this.provider.getAllSessions();
     
    for (const [sessionId, session] of allSessions.entries()) {
       
      if (session.username === username) {
        await this.provider.deleteSession(sessionId);
      }
    }
  }

  async backup(): Promise<BackupData> {
    logger.info('[UserManager] Starting backup...');
    if (!this.provider) {
      logger.warn('[UserManager] No provider available for backup');
      return {
        managerName: 'UserManager',
        timestamp: new Date().toISOString(),
        providerClass: null,
        data: null,
        note: 'No provider initialized'
      };
    }

    try {
       
      const providerBackup = await (this.provider as any).backup();
      return {
        managerName: 'UserManager',
        timestamp: new Date().toISOString(),
        providerClass: this.providerClass,
        providerBackup: providerBackup
      };
    } catch (error) {
      logger.error('[UserManager] Backup failed:', error);
      throw error;
    }
  }

  async restore(backupData: BackupData): Promise<void> {
    logger.info('[UserManager] Starting restore...');
    if (!backupData) {
      throw new Error('UserManager: No backup data provided for restore');
    }
    if (!this.provider) {
      throw new Error('UserManager: No provider available for restore');
    }

    if (backupData.providerClass && typeof backupData.providerClass === 'string' && backupData.providerClass !== this.providerClass) {
      logger.warn(`[UserManager] Provider mismatch: backup has ${backupData.providerClass}, current is ${this.providerClass}`);
    }

    try {
      if (backupData.providerBackup) {
         
        await (this.provider as any).restore(backupData.providerBackup);
        logger.info('[UserManager] Restore completed successfully');
      } else {
        logger.warn('[UserManager] No provider backup data found in backup');
      }
    } catch (error) {
      logger.error('[UserManager] Restore failed:', error);
      throw error;
    }
  }
}

export = UserManager;
