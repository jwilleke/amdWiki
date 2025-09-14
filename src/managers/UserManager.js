const BaseManager = require('./BaseManager');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

/**
 * UserManager - Handles user authentication, authorization, and roles
 * Similar to JSPWiki's UserManager with role-based permissions
 */
class UserManager extends BaseManager {
  constructor(engine) {
    super(engine);
    this.usersDirectory = './users';
    this.users = new Map(); // username -> user object
    this.sessions = new Map(); // sessionId -> session data
    this.roles = new Map(); // roleName -> role definition
    this.permissions = new Map(); // permission -> description
    
    // Initialize default permissions
    this.initializeDefaultPermissions();
    this.initializeDefaultRoles();
  }

  async initialize(config = {}) {
    await super.initialize(config);
    
    this.usersDirectory = config.usersDirectory || './users';
    
    // Create users directory
    await fs.mkdir(this.usersDirectory, { recursive: true });
    
    // Load existing users, roles, and sessions
    await this.loadUsers();
    await this.loadRoles();
    await this.loadSessions();
    
    // Create default admin user if no users exist
    if (this.users.size === 0) {
      await this.createDefaultAdmin();
    }
    
    console.log(`👤 UserManager initialized with ${this.users.size} users, ${this.roles.size} roles, and ${this.sessions.size} sessions`);
  }

  /**
   * Initialize default system permissions
   */
  initializeDefaultPermissions() {
    const defaultPermissions = {
      // Page permissions
      'page:read': 'Read pages',
      'page:edit': 'Edit pages',
      'page:create': 'Create new pages',
      'page:delete': 'Delete pages',
      'page:rename': 'Rename pages',
      
      // System permissions
      'admin:users': 'Manage users',
      'admin:roles': 'Manage roles',
      'admin:config': 'Manage system configuration',
      'admin:system': 'Full system administration',
      
      // Content permissions
      'attachment:upload': 'Upload attachments',
      'attachment:delete': 'Delete attachments',
      'export:pages': 'Export pages',
      
      // Search permissions
      'search:all': 'Search all content',
      'search:restricted': 'Search restricted content'
    };
    
    for (const [permission, description] of Object.entries(defaultPermissions)) {
      this.permissions.set(permission, description);
    }
  }

  /**
   * Initialize default roles
   */
  initializeDefaultRoles() {
    const defaultRoles = {
      'admin': {
        name: 'admin',
        displayName: 'Administrator',
        description: 'Full system access',
        permissions: Array.from(this.permissions.keys()),
        isSystem: true
      },
      'editor': {
        name: 'editor',
        displayName: 'Editor',
        description: 'Can create and edit all pages',
        permissions: [
          'page:read', 'page:edit', 'page:create', 'page:delete', 'page:rename',
          'attachment:upload', 'attachment:delete', 'export:pages', 'search:all'
        ],
        isSystem: true
      },
      'contributor': {
        name: 'contributor',
        displayName: 'Contributor',
        description: 'Can edit existing pages and create new ones',
        permissions: [
          'page:read', 'page:edit', 'page:create',
          'attachment:upload', 'export:pages', 'search:all'
        ],
        isSystem: true
      },
      'reader': {
        name: 'reader',
        displayName: 'Reader',
        description: 'Read-only access',
        permissions: ['page:read', 'search:all', 'export:pages'],
        isSystem: true
      },
      'anonymous': {
        name: 'anonymous',
        displayName: 'Anonymous User',
        description: 'Public access (no login required)',
        permissions: ['page:read'],
        isSystem: true
      }
    };
    
    for (const [roleName, role] of Object.entries(defaultRoles)) {
      this.roles.set(roleName, role);
    }
  }

  /**
   * Load users from disk
   */
  async loadUsers() {
    try {
      const usersFile = path.join(this.usersDirectory, 'users.json');
      const usersData = await fs.readFile(usersFile, 'utf8');
      const users = JSON.parse(usersData);
      
      this.users = new Map(Object.entries(users));
      console.log(`👤 Loaded ${this.users.size} users`);
    } catch (err) {
      // Users file doesn't exist yet
      this.users = new Map();
    }
  }

  /**
   * Save users to disk
   */
  async saveUsers() {
    try {
      const usersFile = path.join(this.usersDirectory, 'users.json');
      const users = Object.fromEntries(this.users);
      await fs.writeFile(usersFile, JSON.stringify(users, null, 2));
    } catch (err) {
      console.error('Error saving users:', err);
    }
  }

  /**
   * Load roles from disk
   */
  async loadRoles() {
    try {
      const rolesFile = path.join(this.usersDirectory, 'roles.json');
      const rolesData = await fs.readFile(rolesFile, 'utf8');
      const roles = JSON.parse(rolesData);
      
      // Merge with default roles
      for (const [roleName, role] of Object.entries(roles)) {
        this.roles.set(roleName, role);
      }
      console.log(`👤 Loaded ${this.roles.size} roles`);
    } catch (err) {
      // Roles file doesn't exist yet, use defaults
    }
  }

  /**
   * Save roles to disk
   * @param {boolean} includeSystemRoles - Whether to save system roles (for security policy management)
   */
  async saveRoles(includeSystemRoles = false) {
    try {
      const rolesFile = path.join(this.usersDirectory, 'roles.json');
      const rolesToSave = {};
      
      // Save custom roles, and optionally system roles for security policy
      for (const [roleName, role] of this.roles.entries()) {
        if (!role.isSystem || includeSystemRoles) {
          rolesToSave[roleName] = {
            ...role,
            lastModified: role.lastModified || new Date().toISOString()
          };
        }
      }
      
      await fs.writeFile(rolesFile, JSON.stringify(rolesToSave, null, 2));
      console.log(`💾 Saved ${Object.keys(rolesToSave).length} roles to disk`);
    } catch (err) {
      console.error('Error saving roles:', err);
    }
  }

  /**
   * Load sessions from disk
   */
  async loadSessions() {
    try {
      const sessionsFile = path.join(this.usersDirectory, 'sessions.json');
      const sessionsData = await fs.readFile(sessionsFile, 'utf8');
      const sessions = JSON.parse(sessionsData);
      
      // Convert sessions object back to Map and filter out expired sessions
      this.sessions = new Map();
      const now = new Date();
      
      for (const [sessionId, session] of Object.entries(sessions)) {
        if (new Date(session.expiresAt) > now) {
          this.sessions.set(sessionId, session);
        }
      }
      
      console.log(`👤 Loaded ${this.sessions.size} active sessions`);
    } catch (err) {
      // Sessions file doesn't exist yet or is corrupted
      this.sessions = new Map();
      console.log('👤 No sessions file found, starting with empty sessions');
    }
  }

  /**
   * Save sessions to disk
   */
  async saveSessions() {
    try {
      const sessionsFile = path.join(this.usersDirectory, 'sessions.json');
      const sessions = Object.fromEntries(this.sessions);
      await fs.writeFile(sessionsFile, JSON.stringify(sessions, null, 2));
    } catch (err) {
      console.error('Error saving sessions:', err);
    }
  }

  /**
   * Simple password hashing using crypto
   * @param {string} password - Plain text password
   * @returns {string} Hashed password
   */
  hashPassword(password) {
    return crypto.createHash('sha256').update(password + 'amdwiki-salt').digest('hex');
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
    const adminUser = {
      username: 'admin',
      email: 'admin@localhost',
      displayName: 'Administrator',
      password: this.hashPassword('admin123'),
      roles: ['admin'],
      isActive: true,
      isSystem: true,
      isExternal: false, // Local account
      createdAt: new Date().toISOString(),
      lastLogin: null,
      loginCount: 0,
      preferences: {}
    };

    this.users.set('admin', adminUser);
    await this.saveUsers();

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

    console.log('👤 Created default admin user (username: admin, password: admin123)');
  }

  /**
   * Create or update external user from OAuth/JWT token
   * @param {Object} externalUserData - User data from external provider
   * @returns {Object} User object
   */
  async createOrUpdateExternalUser(externalUserData) {
    const { username, email, displayName, roles = ['reader'], provider } = externalUserData;
    
    let user = this.users.get(username);
    
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
      
      this.users.set(username, user);
      console.log(`👤 Created external user: ${username} (${provider})`);
    } else {
      // Update existing external user
      user.email = email;
      user.displayName = displayName || user.displayName;
      user.roles = roles;
      user.lastLogin = new Date().toISOString();
      user.loginCount = (user.loginCount || 0) + 1;
      
      console.log(`👤 Updated external user: ${username} (${provider})`);
    }
    
    await this.saveUsers();
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Authenticate user with username/password
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Object|null} User object if authenticated
   */
  async authenticateUser(username, password) {
    const user = this.users.get(username);
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
    await this.saveUsers();
    
    // Return user without password but with authentication flag
    const { password: _, ...userWithoutPassword } = user;
    userWithoutPassword.isAuthenticated = true;
    return userWithoutPassword;
  }

  /**
   * Create a new session for authenticated user
   * @param {Object} user - User object
   * @returns {string} Session ID
   */
  createSession(user) {
    const sessionId = crypto.randomBytes(32).toString('hex');
    const session = {
      id: sessionId,
      username: user.username,
      user: user,
      createdAt: new Date().toISOString(),
      lastAccess: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };
    
    this.sessions.set(sessionId, session);
    this.saveSessions(); // Persist session to disk
    return sessionId;
  }

  /**
   * Get session by session ID
   * @param {string} sessionId - Session ID
   * @returns {Object|null} Session object
   */
  getSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return undefined;
    }
    
    // Check if session is expired
    if (new Date() > new Date(session.expiresAt)) {
      this.sessions.delete(sessionId);
      this.saveSessions(); // Persist session deletion
      return undefined;
    }
    
    // Update last access
    session.lastAccess = new Date().toISOString();
    this.saveSessions(); // Persist updated access time
    return session;
  }

  /**
   * Destroy session
   * @param {string} sessionId - Session ID
   */
  destroySession(sessionId) {
    this.sessions.delete(sessionId);
    this.saveSessions(); // Persist session deletion to disk
    return true;
  }

  /**
   * Check if user has permission
   * @param {string} username - Username (null for anonymous)
   * @param {string} permission - Permission to check
   * @returns {boolean} True if user has permission
   */
  hasPermission(username, permission) {
    // Handle anonymous user (no session cookie)
    if (!username || username === 'anonymous') {
      const anonymousRole = this.roles.get('anonymous');
      const result = anonymousRole && anonymousRole.permissions.includes(permission);
      return result;
    }
    
    // Handle asserted user (has session cookie but expired/invalid)
    if (username === 'asserted') {
      const readerRole = this.roles.get('reader');
      const result = readerRole && readerRole.permissions.includes(permission);
      return result;
    }

    const user = this.users.get(username);
    if (!user || !user.isActive) {
      return false;
    }
    
    // Check all user's roles for the permission
    for (const roleName of user.roles) {
      const role = this.roles.get(roleName);
      if (role && role.permissions.includes(permission)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Get user's effective permissions
   * @param {string} username - Username (null for anonymous)
   * @returns {Array} Array of permissions
   */
  getUserPermissions(username) {
    // Handle anonymous user (no session cookie)
    if (!username || username === 'anonymous') {
      const anonymousRole = this.roles.get('anonymous');
      return anonymousRole ? anonymousRole.permissions : [];
    }
    
    // Handle asserted user (has session cookie but expired/invalid)
    if (username === 'asserted') {
      const readerRole = this.roles.get('reader');
      return readerRole ? readerRole.permissions : [];
    }

    const user = this.users.get(username);
    if (!user || !user.isActive) {
      return [];
    }
    
    const permissions = new Set();
    
    for (const roleName of user.roles) {
      const role = this.roles.get(roleName);
      if (role) {
        role.permissions.forEach(permission => permissions.add(permission));
      }
    }
    
    return Array.from(permissions);
  }

  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Object} Created user (without password)
   */
  async createUser(userData) {
    const { username, email, displayName, password, roles = ['reader'], isExternal = false, isActive = true } = userData;

    if (this.users.has(username)) {
      throw new Error('Username already exists');
    }

    const hashedPassword = isExternal ? null : this.hashPassword(password);

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
      preferences: {}
    };

    // Save user to users.json first
    this.users.set(username, user);
    await this.saveUsers();

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
    const user = this.users.get(username);
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
    await this.saveUsers();

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
    const user = this.users.get(username);
    if (!user) {
      throw new Error('User not found');
    }
    
    if (user.isSystem) {
      throw new Error('Cannot delete system user');
    }
    
    this.users.delete(username);
    await this.saveUsers();
    
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
    
    // Destroy all sessions for this user
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.username === username) {
        this.sessions.delete(sessionId);
      }
    }
    
    console.log(`👤 Deleted user: ${username}`);
    return true;
  }

  /**
   * Get all users
   * @returns {Array} Array of users (without passwords)
   */
  getUsers() {
    return Array.from(this.users.values()).map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  /**
   * Get user by username
   * @param {string} username - Username
   * @returns {Object|null} User object (without password)
   */
  getUser(username) {
    const user = this.users.get(username);
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
   * @param {Object} roleData - Role data
   */
  async createRole(roleData) {
    const { name, displayName, description, permissions = [] } = roleData;
    
    if (this.roles.has(name)) {
      throw new Error('Role already exists');
    }
    
    const role = {
      name,
      displayName: displayName || name,
      description,
      permissions,
      isSystem: false,
      createdAt: new Date().toISOString()
    };
    
    this.roles.set(name, role);
    await this.saveRoles();
    
    console.log(`👤 Created role: ${name}`);
    return role;
  }

  /**
   * Update role permissions (for admin security policy management)
   * @param {string} roleName - Role name to update
   * @param {Object} updates - Updates to apply
   * @returns {boolean} Success status
   */
  async updateRolePermissions(roleName, updates) {
    try {
      const role = this.roles.get(roleName);
      if (!role) {
        console.error(`Role not found: ${roleName}`);
        return false;
      }

      // Create updated role object
      const updatedRole = {
        ...role,
        permissions: updates.permissions || role.permissions,
        displayName: updates.displayName || role.displayName,
        description: updates.description || role.description,
        lastModified: new Date().toISOString()
      };

      this.roles.set(roleName, updatedRole);
      
      // Save to disk (include system roles for security policy management)
      await this.saveRoles(true);
      
      console.log(`👤 Updated role permissions: ${roleName}`);
      return updatedRole;
    } catch (err) {
      console.error('Error updating role permissions:', err);
      return false;
    }
  }

  /**
   * Get current user from request
   * @param {Object} req - Express request object
   * @returns {Object|null} Current user or null
   */
  getCurrentUser(req) {
    // Check for JWT token first (OAuth/external auth)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const user = this.validateJwtToken(token);
      if (user) {
        user.isAuthenticated = true;
        return user;
      }
    }
    
    // Check for session-based auth - prioritize cookie-based sessions over express-session
    const sessionId = req.cookies?.sessionId || req.session?.sessionId;
    
    if (!sessionId) {
      return null;
    }
    
    const session = this.getSession(sessionId);
    
    if (session && session.user) {
      session.user.isAuthenticated = true;
      return session.user;
    }
    
    // If user has a session cookie but session is invalid/expired,
    // treat as asserted user (different from anonymous)
    if (sessionId) {
      return this.getAssertedUser();
    }
    
    return null;
  }

  /**
   * Validate JWT token and extract user/role information
   * @param {string} token - JWT token
   * @returns {Object|null} User object or null
   */
  validateJwtToken(token) {
    try {
      // Simple JWT validation - in production, use proper JWT library
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      
      // Check expiration
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        return null;
      }
      
      // Map external user to internal user format
      return this.mapExternalUserToInternal(payload);
      
    } catch (err) {
      console.error('JWT validation error:', err);
      return null;
    }
  }

  /**
   * Map external OAuth/JWT user to internal user format
   * @param {Object} externalUser - External user payload
   * @returns {Object} Internal user object
   */
  mapExternalUserToInternal(externalUser) {
    const {
      sub: username,
      email,
      name: displayName,
      role,
      roles,
      preferred_username,
      given_name,
      family_name
    } = externalUser;
    
    // Determine username
    const finalUsername = preferred_username || username || email;
    
    // Map external roles to internal roles
    const userRoles = this.mapExternalRoles(role, roles);
    
    // Create internal user object
    const internalUser = {
      username: finalUsername,
      email: email,
      displayName: displayName || `${given_name || ''} ${family_name || ''}`.trim() || finalUsername,
      roles: userRoles,
      isActive: true,
      isExternal: true, // Mark as external user
      externalProvider: externalUser.iss || 'oauth',
      lastLogin: new Date().toISOString(),
      isAuthenticated: true
    };
    
    console.log(`👤 External user authenticated: ${finalUsername} with roles: ${userRoles.join(', ')}`);
    return internalUser;
  }

  /**
   * Map external roles to internal roles
   * @param {string|Array} role - Single role or array of roles
   * @param {Array} roles - Alternative roles array
   * @returns {Array} Array of internal role names
   */
  mapExternalRoles(role, roles) {
    // Get roles from either parameter
    let externalRoles = [];
    if (Array.isArray(roles)) {
      externalRoles = roles;
    } else if (Array.isArray(role)) {
      externalRoles = role;
    } else if (typeof role === 'string') {
      externalRoles = [role];
    } else if (typeof roles === 'string') {
      externalRoles = [roles];
    }
    
    // Map external roles to internal roles
    const roleMapping = {
      'admin': 'admin',
      'administrator': 'admin',
      'editor': 'editor',
      'author': 'contributor',
      'contributor': 'contributor',
      'user': 'reader',
      'reader': 'reader',
      'viewer': 'reader',
      'guest': 'anonymous'
    };
    
    const mappedRoles = [];
    for (const externalRole of externalRoles) {
      const internalRole = roleMapping[externalRole.toLowerCase()];
      if (internalRole && this.roles.has(internalRole)) {
        mappedRoles.push(internalRole);
      }
    }
    
    // Default to reader if no valid roles found
    if (mappedRoles.length === 0) {
      mappedRoles.push('reader');
    }
    
    return mappedRoles;
  }

  /**
   * Create API key for external integrations
   * @param {string} username - Username
   * @param {string} description - API key description
   * @returns {string} API key
   */
  async createApiKey(username, description = '') {
    const user = this.users.get(username);
    if (!user) {
      throw new Error('User not found');
    }
    
    const apiKey = crypto.randomBytes(32).toString('hex');
    const keyData = {
      key: apiKey,
      username: username,
      description: description,
      createdAt: new Date().toISOString(),
      lastUsed: null,
      isActive: true
    };
    
    // Store API key (in production, hash the key)
    if (!user.apiKeys) {
      user.apiKeys = [];
    }
    user.apiKeys.push(keyData);
    
    await this.saveUsers();
    
    console.log(`👤 Created API key for user: ${username}`);
    return apiKey;
  }

  /**
   * Validate API key
   * @param {string} apiKey - API key
   * @returns {Object|null} User object or null
   */
  validateApiKey(apiKey) {
    for (const user of this.users.values()) {
      if (user.apiKeys) {
        const keyData = user.apiKeys.find(k => k.key === apiKey && k.isActive);
        if (keyData) {
          keyData.lastUsed = new Date().toISOString();
          return this.getUser(user.username);
        }
      }
    }
    return null;
  }

  /**
   * Middleware for authentication
   * @param {Array} requiredPermissions - Required permissions
   * @returns {Function} Express middleware
   */
  requireAuth(requiredPermissions = []) {
    return (req, res, next) => {
      const user = this.getCurrentUser(req);
      
      if (!user) {
        return res.redirect('/login?redirect=' + encodeURIComponent(req.originalUrl));
      }
      
      // Check permissions
      for (const permission of requiredPermissions) {
        if (!this.hasPermission(user.username, permission)) {
          return res.status(403).render('error', {
            title: 'Access Denied',
            message: 'You do not have permission to access this resource',
            error: { status: 403 }
          });
        }
      }
      
      req.user = user;
      next();
    };
  }

  /**
   * Anonymous user access (no login required)
   * @param {Object} req - Express request object
   * @returns {Object} Anonymous user object
   */
  getAnonymousUser() {
    return {
      username: 'anonymous',
      displayName: 'Anonymous User',
      roles: ['anonymous'],
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
  hasRole(username, roleName) {
    const user = this.users.get(username);
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
    const user = this.users.get(username);
    if (!user) {
      throw new Error('User not found');
    }

    if (!this.roles.has(roleName)) {
      throw new Error('Role not found');
    }

    if (!user.roles.includes(roleName)) {
      user.roles.push(roleName);
      await this.saveUsers();
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
    const user = this.users.get(username);
    if (!user) {
      throw new Error('User not found');
    }

    const roleIndex = user.roles.indexOf(roleName);
    if (roleIndex > -1) {
      user.roles.splice(roleIndex, 1);
      await this.saveUsers();
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
}

module.exports = UserManager;
