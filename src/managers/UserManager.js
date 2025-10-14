const BaseManager = require('./BaseManager');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const logger = require('../utils/logger'); // Add this line

/**
 * UserManager - Handles user authentication, authorization, and roles
 * Similar to JSPWiki's UserManager with role-based permissions
 *
 * Follows JSPWiki's provider pattern where the actual storage implementation
 * is abstracted behind a provider interface. This allows for different storage
 * backends (file, database, LDAP, etc.) to be swapped via configuration.
 */
class UserManager extends BaseManager {
  constructor(engine) {
    super(engine);
    this.provider = null;
    this.roles = new Map();
    this.permissions = new Map();
  }

  async initialize(config = {}) {
    await super.initialize(config);

    const configManager = this.engine.getManager('ConfigurationManager');
    if (!configManager) {
      throw new Error('UserManager requires ConfigurationManager');
    }

    // Load provider with fallback (ALL LOWERCASE)
    const defaultProvider = configManager.getProperty(
      'amdwiki.user.provider.default',
      'fileuserprovider'
    );
    const providerName = configManager.getProperty(
      'amdwiki.user.provider',
      defaultProvider
    );

    // Normalize provider name to PascalCase for class loading
    this.providerClass = this.#normalizeProviderName(providerName);

    logger.info(`👤 Loading user provider: ${providerName} (${this.providerClass})`);

    // Load and initialize provider
    try {
      const ProviderClass = require(`../providers/${this.providerClass}`);
      this.provider = new ProviderClass(this.engine);
      await this.provider.initialize();

      const info = this.provider.getProviderInfo();
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
    );
    this.defaultPassword = configManager.getProperty(
      'amdwiki.user.security.defaultpassword',
      'admin123'
    );
    this.sessionExpiration = configManager.getProperty(
      'amdwiki.user.security.sessionexpiration',
      86400000
    );
    this.defaultTimezone = configManager.getProperty(
      'amdwiki.user.defaults.timezone',
      'utc'
    );

    // Load role definitions from config
    const roleDefinitions = configManager.getProperty(
      'amdwiki.roles.definitions',
      {}
    );
    this.roles = new Map(Object.entries(roleDefinitions));

    logger.info(`👤 Loaded ${this.roles.size} role definitions from configuration`);

    // Create default admin if needed
    const allUsers = await this.provider.getAllUsers();
    if (allUsers.size === 0) {
      await this.createDefaultAdmin();
    }

    const userCount = (await this.provider.getAllUsers()).size;
    logger.info(`👤 UserManager initialized with ${userCount} users`);
  }

  /**
   * Normalize provider name from configuration (lowercase) to class name (PascalCase)
   * @param {string} providerName - Provider name from configuration (e.g., 'fileuserprovider')
   * @returns {string} Normalized class name (e.g., 'FileUserProvider')
   * @private
   */
  #normalizeProviderName(providerName) {
    if (!providerName) {
      throw new Error('Provider name cannot be empty');
    }

    const lower = providerName.toLowerCase();

    // Handle special cases for known provider names
    const knownProviders = {
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
   * @returns {BaseUserProvider} The active provider
   */
  getCurrentUserProvider() {
    return this.provider;
  }

  // REMOVED: initializeDefaultPermissions() - Permissions now defined in policies
  // REMOVED: initializeDefaultRoles() - Roles now loaded from config (amdwiki.roles.definitions)
  // REMOVED: loadUsers() - Now handled by provider
  // REMOVED: saveUsers() - Now handled by provider
  // REMOVED: loadRoles() - Roles now loaded from config in initialize()
  // REMOVED: saveRoles() - Roles are now in config files (app-default-config.json / app-custom-config.json)
  // REMOVED: loadSessions() - Now handled by provider
  // REMOVED: saveSessions() - Now handled by provider

  /**
   * Simple password hashing using crypto
   * @param {string} password - Plain text password
   * @returns {string} Hashed password
   */
  hashPassword(password) {
    const salt = this.passwordSalt || 'amdwiki-salt';
    return crypto.createHash('sha256').update(password + salt).digest('hex');
  }

  /**
   * Verify password against hash
   * @param {string} password - Plain text password
   * @param {string} hash - Stored hash
   * @returns {boolean} True if password matches
   */
  verifyPassword(password, hash) {
    return this.hashPassword(password) === hash;
  }

  /**
   * Create default admin user
   */
  async createDefaultAdmin() {
    const defaultPassword = this.defaultPassword || 'admin123';

    const adminUser = {
      username: 'admin',
      email: 'admin@localhost',
      displayName: 'Administrator',
      password: this.hashPassword(defaultPassword),
      roles: ['admin'],
      isActive: true,
      isSystem: true,
      isExternal: false, // Local account
      createdAt: new Date().toISOString(),
      lastLogin: null,
      loginCount: 0,
      preferences: {}
    };

    await this.provider.createUser('admin', adminUser);

    // Sync default admin to Schema.org data
    try {
      const schemaManager = this.engine.getManager('SchemaManager');
      if (schemaManager && schemaManager.isInitialized()) {
        const personData = {
          "@context": "https://schema.org",
          "@type": "Person",
          "identifier": 'admin',
          "name": 'Administrator',
          "alternateName": ['admin'],
          "email": 'admin@localhost',
          "memberOf": {
            "@type": "Organization",
            "identifier": "amdwiki-platform",
            "name": "amdWiki Platform"
          },
          "worksFor": {
            "@type": "Organization",
            "identifier": "amdwiki-platform",
            "name": "amdWiki Platform"
          },
          "hasCredential": [{
            "@type": "EducationalOccupationalCredential",
            "credentialCategory": "admin",
            "competencyRequired": ["System Administration", "User Management", "Configuration Management"],
            "issuedBy": {
              "@type": "Organization",
              "identifier": "amdwiki-platform"
            }
          }],
          "jobTitle": "Administrator",
          "memberOfStartDate": adminUser.createdAt,
          "dateCreated": adminUser.createdAt,
          "authentication": {
            "passwordHash": adminUser.password,
            "isSystem": true,
            "preferences": adminUser.preferences
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "Account",
            "availableLanguage": ["English"],
            "email": "admin@localhost"
          }
        };

        await schemaManager.createPerson(personData);
        console.log('📋 Synced default admin to Schema.org data');
      }
    } catch (error) {
      console.error('❌ Failed to sync default admin to Schema.org data:', error.message);
    }

    console.log(`👤 Created default admin user (username: admin, password: ${defaultPassword})`);
  }

  /**
   * Create or update external user from OAuth/JWT token
   * @param {Object} externalUserData - User data from external provider
   * @returns {Object} User object
   */
  async createOrUpdateExternalUser(externalUserData) {
    const { username, email, displayName, roles = ['reader'], provider } = externalUserData;

    let user = await this.provider.getUser(username);

    if (!user) {
      // Create new external user
      user = {
        username,
        email,
        displayName: displayName || username,
        password: null, // No password for external users
        roles,
        isActive: true,
        isSystem: false,
        isExternal: true,
        provider: provider, // OAuth provider (google, github, etc.)
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        loginCount: 1,
        preferences: {}
      };

      await this.provider.createUser(username, user);
      console.log(`👤 Created external user: ${username} (${provider})`);
    } else {
      // Update existing external user
      user.email = email;
      user.displayName = displayName || user.displayName;
      user.roles = roles;
      user.lastLogin = new Date().toISOString();
      user.loginCount = (user.loginCount || 0) + 1;

      await this.provider.updateUser(username, user);
      console.log(`👤 Updated external user: ${username} (${provider})`);
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Authenticate user with username/password
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Object|null} User object if authenticated, including the isAuthenticated flag.
   */
  async authenticateUser(username, password) {
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
    const { password: _, ...userWithoutPassword } = user;
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
  async hasPermission(username, action) {
    const policyEvaluator = this.engine?.getManager('PolicyEvaluator');
    if (!policyEvaluator) {
      console.warn('[UserManager] PolicyEvaluator not available, denying permission');
      return false;
    }

    // Build user context for policy evaluation
    let userContext;
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

    return result.allowed;
  }

  /**
   * Get user's effective permissions from PolicyManager
   * @param {string} username - Username (null for anonymous)
   * @returns {Promise<Array<string>>} Array of permission strings
   */
  async getUserPermissions(username) {
    // Query PolicyManager for actual permissions
    const policyManager = this.engine.getManager('PolicyManager');
    if (!policyManager) {
      logger.warn('PolicyManager not available, returning empty permissions');
      return [];
    }

    // Handle anonymous user (no session cookie)
    if (!username || username === 'anonymous') {
      const userRoles = ['anonymous', 'All'];
      return this._getPermissionsFromPolicies(policyManager, userRoles);
    }

    // Handle asserted user (has session cookie but expired/invalid)
    if (username === 'asserted') {
      const userRoles = ['reader', 'All'];
      return this._getPermissionsFromPolicies(policyManager, userRoles);
    }

    const user = await this.provider.getUser(username);
    if (!user || !user.isActive) {
      return [];
    }

    // Get all user's roles (including Authenticated, All)
    const userRoles = [...(user.roles || []), 'Authenticated', 'All'];
    return this._getPermissionsFromPolicies(policyManager, userRoles);
  }

  /**
   * Helper method to get permissions from policies for given roles
   * @private
   * @param {Object} policyManager - PolicyManager instance
   * @param {Array<string>} userRoles - Array of role names
   * @returns {Array<string>} Array of permission strings
   */
  _getPermissionsFromPolicies(policyManager, userRoles) {
    const policies = policyManager.getAllPolicies();
    const permissions = new Set();

    // Collect permissions from all matching allow policies
    for (const policy of policies) {
      if (policy.effect === 'allow') {
        const hasMatchingRole = policy.subjects.some(subject =>
          subject.type === 'role' && userRoles.includes(subject.value)
        );

        if (hasMatchingRole) {
          policy.actions.forEach(action => permissions.add(action));
        }
      }
    }

    return Array.from(permissions);
  }

  /**
   * Check if a display name conflicts with existing page names or other users
   * @param {string} displayName - Display name to check
   * @param {string} excludeUsername - Username to exclude from the check (for updates)
   * @returns {boolean} True if conflict exists
   */
  async checkDisplayNamePageConflict(displayName, excludeUsername = null) {
    try {
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
      console.error('Error checking display name page conflict:', error);
      return false; // On error, assume no conflict to avoid blocking registration
    }
  }

  /**
   * Create a user page for a new user
   * @param {Object} user - User object
   * @returns {boolean} True if user page was created successfully
   */
  async createUserPage(user) {
    try {
      const pageManager = this.engine.getManager('PageManager');
      if (!pageManager) {
        console.warn('PageManager not available, cannot create user page');
        return false;
      }

      const templateManager = this.engine.getManager('TemplateManager');
      if (!templateManager) {
        console.warn('TemplateManager not available, cannot create user page');
        return false;
      }

      // Check if user page already exists
      const existingPage = await pageManager.getPage(user.displayName);
      if (existingPage) {
        console.log(`User page already exists for ${user.displayName}`);
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
        console.log(`✅ Created user page for ${user.displayName}`);
        return true;
      } else {
        console.error(`❌ Failed to create user page for ${user.displayName}:`, result.error);
        return false;
      }
    } catch (error) {
      console.error(`❌ Error creating user page for ${user.displayName}:`, error);
      return false;
    }
  }

  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Object} Created user (without password)
   */
  async createUser(userData) {
    const { username, email, displayName, password, roles = ['reader'], isExternal = false, isActive = true, acceptLanguage } = userData;

    if (await this.provider.userExists(username)) {
      throw new Error('Username already exists');
    }

    // Check for display name conflicts with existing pages
    const finalDisplayName = displayName || username;
    const hasPageConflict = await this.checkDisplayNamePageConflict(finalDisplayName);
    if (hasPageConflict) {
      throw new Error(`Display name "${finalDisplayName}" conflicts with an existing page. Please choose a different display name.`);
    }

    const hashedPassword = isExternal ? null : this.hashPassword(password);

    // Determine user's locale and set default preferences
    const userLocale = LocaleUtils.parseAcceptLanguage(acceptLanguage);
    const defaultDateFormat = LocaleUtils.getDateFormatFromLocale(userLocale);
    const defaultTimeFormat = LocaleUtils.getTimeFormatFromLocale(userLocale);

    // Get default timezone from configuration
    const configManager = this.engine.getManager('ConfigurationManager');
    const defaultTimezone = configManager ?
      configManager.getProperty('amdwiki.default.timezone', 'UTC') : 'UTC';

    const user = {
      username,
      email,
      displayName: displayName || username,
      password: hashedPassword,
      roles,
      isActive: isActive,
      isSystem: false,
      isExternal: isExternal, // Flag to indicate OAuth/external user
      createdAt: new Date().toISOString(),
      lastLogin: null,
      loginCount: 0,
      preferences: {
        locale: userLocale,
        dateFormat: defaultDateFormat,
        timeFormat: defaultTimeFormat,
        timezone: defaultTimezone
      }
    };

    // Save user via provider
    await this.provider.createUser(username, user);

    // Automatically sync to Schema.org persons.json
    try {
      const schemaManager = this.engine.getManager('SchemaManager');
      if (schemaManager && schemaManager.isInitialized()) {
        // Transform user data to Schema.org Person format
        const personData = {
          "@context": "https://schema.org",
          "@type": "Person",
          "identifier": username,
          "name": user.displayName,
          "alternateName": [username],
          "email": user.email,
          "memberOf": {
            "@type": "Organization",
            "identifier": "amdwiki-platform",
            "name": "amdWiki Platform"
          },
          "worksFor": {
            "@type": "Organization",
            "identifier": "amdwiki-platform",
            "name": "amdWiki Platform"
          },
          "hasCredential": roles.map(role => ({
            "@type": "EducationalOccupationalCredential",
            "credentialCategory": role,
            "competencyRequired": this.getRoleCompetencies(role),
            "issuedBy": {
              "@type": "Organization",
              "identifier": "amdwiki-platform"
            }
          })),
          "jobTitle": this.getJobTitleFromRoles(roles),
          "memberOfStartDate": user.createdAt,
          "dateCreated": user.createdAt,
          "authentication": {
            "passwordHash": user.password,
            "isSystem": user.isSystem,
            "preferences": user.preferences
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "Account",
            "availableLanguage": ["English"],
            "email": user.email
          }
        };

        await schemaManager.createPerson(personData);
        console.log(`📋 Synced user ${username} to Schema.org data`);
      } else {
        console.warn(`⚠️  SchemaManager not available, user ${username} not synced to Schema.org data`);
      }
    } catch (error) {
      console.error(`❌ Failed to sync user ${username} to Schema.org data:`, error.message);
      // Don't fail the user creation, but log the issue
      // In production, you might want to implement a retry mechanism or queue
    }

    console.log(`👤 Created user: ${username} (${isExternal ? 'External' : 'Local'})`);

    // Create user page after successful user creation
    try {
      await this.createUserPage(user);
    } catch (error) {
      console.warn(`⚠️  Failed to create user page for ${username}:`, error.message);
      // Don't fail user creation if user page creation fails
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Update user
   * @param {string} username - Username
   * @param {Object} updates - Updates to apply
   */
  async updateUser(username, updates) {
    const user = await this.provider.getUser(username);
    if (!user) {
      throw new Error('User not found');
    }

    // Handle password updates - only for local users
    if (updates.password) {
      if (user.isExternal) {
        throw new Error('Cannot change password for external OAuth users');
      }
      updates.password = this.hashPassword(updates.password);
    }

    Object.assign(user, updates);
    await this.provider.updateUser(username, user);

    // Sync changes to Schema.org data
    try {
      const schemaManager = this.engine.getManager('SchemaManager');
      if (schemaManager && schemaManager.isInitialized()) {
        // Prepare update data for Schema.org Person
        const updateData = {};

        if (updates.displayName !== undefined) {
          updateData.name = updates.displayName;
        }
        if (updates.email !== undefined) {
          updateData.email = updates.email;
          if (updateData.contactPoint === undefined) updateData.contactPoint = {};
          updateData.contactPoint.email = updates.email;
        }
        if (updates.roles !== undefined) {
          updateData.hasCredential = updates.roles.map(role => ({
            "@type": "EducationalOccupationalCredential",
            "credentialCategory": role,
            "competencyRequired": this.getRoleCompetencies(role),
            "issuedBy": {
              "@type": "Organization",
              "identifier": "amdwiki-platform"
            }
          }));
          updateData.jobTitle = this.getJobTitleFromRoles(updates.roles);
        }
        if (updates.preferences !== undefined) {
          if (updateData.authentication === undefined) updateData.authentication = {};
          updateData.authentication.preferences = updates.preferences;
        }

        if (Object.keys(updateData).length > 0) {
          updateData.lastReviewed = new Date().toISOString();
          await schemaManager.updatePerson(username, updateData);
          console.log(`📋 Synced user ${username} updates to Schema.org data`);
        }
      }
    } catch (error) {
      console.error(`❌ Failed to sync user ${username} updates to Schema.org data:`, error.message);
    }

    console.log(`👤 Updated user: ${username}`);
    return user;
  }

  /**
   * Delete user
   * @param {string} username - Username
   */
  async deleteUser(username) {
    const user = await this.provider.getUser(username);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.isSystem) {
      throw new Error('Cannot delete system user');
    }

    await this.provider.deleteUser(username);
    
    // Sync deletion to Schema.org data
    try {
      const schemaManager = this.engine.getManager('SchemaManager');
      if (schemaManager && schemaManager.isInitialized()) {
        // Check if SchemaManager has a deletePerson method
        if (typeof schemaManager.deletePerson === 'function') {
          await schemaManager.deletePerson(username);
          console.log(`📋 Removed user ${username} from Schema.org data`);
        } else {
          console.warn(`⚠️  SchemaManager.deletePerson not available, user ${username} not removed from Schema.org data`);
        }
      }
    } catch (error) {
      console.error(`❌ Failed to remove user ${username} from Schema.org data:`, error.message);
    }
    
    console.log(`👤 Deleted user: ${username}`);
    return true;
  }

  /**
   * Get all users
   * @returns {Array} Array of users (without passwords)
   */
  async getUsers() {
    const allUsers = await this.provider.getAllUsers();
    return Array.from(allUsers.values()).map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  /**
   * Get user by username
   * @param {string} username - Username
   * @returns {Object|null} User object (without password)
   */
  async getUser(username) {
    const user = await this.provider.getUser(username);
    if (!user) {
      return undefined;
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Get all roles
   * @returns {Array} Array of roles
   */
  getRoles() {
    return Array.from(this.roles.values());
  }

  /**
   * Get all permissions
   * @returns {Map} Map of permissions
   */
  getPermissions() {
    return this.permissions;
  }

  /**
   * Get role by name
   * @param {string} roleName - Role name
   * @returns {Object|null} Role object
   */
  getRole(roleName) {
    return this.roles.get(roleName) || null;
  }

  /**
   * Create custom role
   * NOTE: Roles are now defined in config files (app-custom-config.json)
   * This method is deprecated and will be removed in a future version.
   * @param {Object} roleData - Role data
   * @deprecated Use config files to define roles instead
   */
  async createRole(roleData) {
    const { name, displayName, description } = roleData;

    logger.warn(`[DEPRECATED] createRole() is deprecated. Add role '${name}' to config/app-custom-config.json under 'amdwiki.roles.definitions' instead.`);
    logger.warn(`Example: { "${name}": { "name": "${name}", "displayname": "${displayName || name}", "description": "${description || ''}", "issystem": false } }`);

    throw new Error('createRole() is deprecated. Please add custom roles to config/app-custom-config.json under amdwiki.roles.definitions');
  }

  /**
   * Delete a role
   * NOTE: Roles are now defined in config files
   * This method is deprecated and will be removed in a future version.
   * @param {string} roleName - Name of the role to delete
   * @deprecated Use config files to manage roles instead
   */
  async deleteRole(roleName) {
    logger.warn(`[DEPRECATED] deleteRole() is deprecated. Remove role '${roleName}' from config/app-custom-config.json instead.`);

    throw new Error('deleteRole() is deprecated. Please remove custom roles from config/app-custom-config.json under amdwiki.roles.definitions');
  }

  /**
   * Update role permissions
   * NOTE: Role permissions are now defined via policies in config files
   * This method is deprecated and will be removed in a future version.
   * @param {string} _roleName - Role name to update (unused)
   * @param {Object} _updates - Updates to apply (unused)
   * @deprecated Use policies in config to manage permissions instead
   */
  async updateRolePermissions(_roleName, _updates) {
    logger.warn(`[DEPRECATED] updateRolePermissions() is deprecated.`);
    logger.warn(`Role metadata can be updated in config/app-custom-config.json under 'amdwiki.roles.definitions'`);
    logger.warn(`Role permissions should be managed via policies in 'amdwiki.access.policies'`);

    throw new Error('updateRolePermissions() is deprecated. Please use config files and policies to manage role permissions');
  }

  /**
   * Gets the current user context from the request session.
   * This method is the single source of truth for user context during a request.
   * It dynamically adds built-in roles (All, Authenticated, Anonymous) every time.
   * @param {object} req - The Express request object.
   * @returns {Promise<object>} The user context object.
   */
  async getCurrentUser(req) {
    // Case 1: User is authenticated and has a session.
    if (req.session && req.session.user && req.session.user.isAuthenticated) {
      // Start with the user object from the session.
      const userFromSession = req.session.user;

      // Re-fetch the user from the source of truth (provider) to ensure data is fresh.
      const freshUser = await this.provider.getUser(userFromSession.username);
      if (!freshUser || !freshUser.isActive) {
        // If user was deleted or deactivated, treat them as anonymous.
        return this.getAnonymousUser();
      }

      // Construct the full context for this request.
      const currentUserContext = {
        ...freshUser, // Use fresh user data
        isAuthenticated: true
      };

      // Dynamically add built-in roles.
      const roles = new Set(currentUserContext.roles || []);
      roles.add('All');
      roles.add('Authenticated');
      currentUserContext.roles = Array.from(roles);

      return currentUserContext;
    }

    // Case 2: User is not authenticated.
    return this.getAnonymousUser();
  }

  /**
   * Middleware to ensure user is authenticated.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   */
  ensureAuthenticated(req, res, next) {
    const user = req.user;
    if (!user || !user.isAuthenticated) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
  }

  /**
   * Middleware to ensure user has specific permissions.
   * @param {Array<string>} requiredPermissions - The permissions required.
   * @returns {Function} Middleware function.
   */
  requirePermissions(requiredPermissions = []) {
    return (req, res, next) => {
      const user = req.user;
      
      if (!user || !user.isAuthenticated) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      // Check if user has at least one of the required permissions
      const hasPermission = requiredPermissions.some(permission => this.hasPermission(user.username, permission));
      if (!hasPermission) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      next();
    };
  }

  /**
   * Anonymous user access (no login required)
   * @returns {Object} Anonymous user object with built-in roles.
   */
  getAnonymousUser() {
    return {
      username: 'Anonymous',
      displayName: 'Anonymous User',
      roles: ['Anonymous', 'All'], // Ensure 'All' role is present
      isAuthenticated: false
    };
  }

  /**
   * Asserted user with session cookie (expired or invalid session)
   * Different from anonymous - they've attempted to authenticate before
   * @returns {Object} Asserted user object
   */
  getAssertedUser() {
    return {
      username: 'asserted',
      displayName: 'Asserted User',
      roles: ['reader'], // Give reader role instead of anonymous
      isAuthenticated: false,
      hasSessionCookie: true
    };
  }

  /**
   * Check if a user has a specific role
   * @param {string} username - Username to check
   * @param {string} roleName - Role name to check for
   * @returns {boolean} True if user has the role
   */
  async hasRole(username, roleName) {
    const user = await this.provider.getUser(username);
    if (!user || !user.roles) {
      return false;
    }
    return user.roles.includes(roleName);
  }

  /**
   * Assign a role to a user
   * @param {string} username - Username
   * @param {string} roleName - Role name to assign
   * @returns {boolean} True if successful
   */
  async assignRole(username, roleName) {
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
      console.log(`👤 Assigned role '${roleName}' to user '${username}'`);
    }

    return true;
  }

  /**
   * Remove a role from a user
   * @param {string} username - Username
   * @param {string} roleName - Role name to remove
   * @returns {boolean} True if successful
   */
  async removeRole(username, roleName) {
    const user = await this.provider.getUser(username);
    if (!user) {
      throw new Error('User not found');
    }

    const roleIndex = user.roles.indexOf(roleName);
    if (roleIndex > -1) {
      user.roles.splice(roleIndex, 1);
      await this.provider.updateUser(username, user);
      console.log(`👤 Removed role '${roleName}' from user '${username}'`);
    }

    return true;
  }

  /**
   * Get competencies required for a given role (for Schema.org sync)
   * @param {string} role - Role name
   * @returns {Array} Array of competency strings
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
   * Get job title from user roles (for Schema.org sync)
   * @param {Array} roles - Array of role names
   * @returns {string} Job title string
   */
  getJobTitleFromRoles(roles) {
    if (roles.includes('admin')) {
      return 'Administrator';
    } else if (roles.includes('editor')) {
      return 'Content Editor';
    } else if (roles.includes('reader')) {
      return 'Reader';
    }
    return 'User';
  }

  /**
   * Create a new session
   * @param {string} username - The username for the session
   * @param {Object} [additionalData] - Any additional data to store in the session
   * @returns {string} The ID of the created session
   */
  async createSession(username, additionalData = {}) {
    const sessionId = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 1 day expiration

    const sessionData = {
      id: sessionId,
      username,
      expiresAt,
      ...additionalData
    };

    await this.provider.createSession(sessionId, sessionData);

    return sessionId;
  }

  /**
   * Get session data by ID
   * @param {string} sessionId - The ID of the session
   * @returns {Object|null} The session data, or null if not found
   */
  async getSession(sessionId) {
    return await this.provider.getSession(sessionId);
  }

  /**
   * Delete a session by ID
   * @param {string} sessionId - The ID of the session
   */
  async deleteSession(sessionId) {
    await this.provider.deleteSession(sessionId);
  }

  /**
   * Delete all sessions for a user
   * @param {string} username - The username of the user
   */
  async deleteUserSessions(username) {
    const allSessions = await this.provider.getAllSessions();
    for (const [sessionId, session] of allSessions.entries()) {
      if (session.username === username) {
        await this.provider.deleteSession(sessionId);
      }
    }
  }

  /**
   * Backup all user data
   *
   * Delegates to the provider's backup() method to serialize all user and session data.
   * The backup includes all user accounts, sessions, and provider-specific data.
   *
   * @returns {Promise<Object>} Backup data from provider
   */
  async backup() {
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
      const providerBackup = await this.provider.backup();

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

  /**
   * Restore user data from backup
   *
   * Delegates to the provider's restore() method to recreate all users and sessions
   * from the backup data.
   *
   * @param {Object} backupData - Backup data from backup() method
   * @returns {Promise<void>}
   */
  async restore(backupData) {
    logger.info('[UserManager] Starting restore...');

    if (!backupData) {
      throw new Error('UserManager: No backup data provided for restore');
    }

    if (!this.provider) {
      throw new Error('UserManager: No provider available for restore');
    }

    // Check for provider mismatch
    if (backupData.providerClass && backupData.providerClass !== this.providerClass) {
      logger.warn(`[UserManager] Provider mismatch: backup has ${backupData.providerClass}, current is ${this.providerClass}`);
    }

    try {
      if (backupData.providerBackup) {
        await this.provider.restore(backupData.providerBackup);
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

module.exports = UserManager;
