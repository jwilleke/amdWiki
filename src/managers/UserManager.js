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
    
    // Create default admin user if no users exist
    if (this.users.size === 0) {
      await this.createDefaultAdmin();
    }
    
    console.log(`👤 UserManager initialized with ${this.users.size} users and ${this.roles.size} roles`);
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
   */
  async saveRoles() {
    try {
      const rolesFile = path.join(this.usersDirectory, 'roles.json');
      const customRoles = {};
      
      // Only save non-system roles
      for (const [roleName, role] of this.roles.entries()) {
        if (!role.isSystem) {
          customRoles[roleName] = role;
        }
      }
      
      await fs.writeFile(rolesFile, JSON.stringify(customRoles, null, 2));
    } catch (err) {
      console.error('Error saving roles:', err);
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
      createdAt: new Date().toISOString(),
      lastLogin: null,
      loginCount: 0,
      preferences: {}
    };
    
    this.users.set('admin', adminUser);
    await this.saveUsers();
    
    console.log('👤 Created default admin user (username: admin, password: admin123)');
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
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
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
      sessionId,
      username: user.username,
      user: user,
      createdAt: new Date().toISOString(),
      lastAccess: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };
    
    this.sessions.set(sessionId, session);
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
      return null;
    }
    
    // Check if session is expired
    if (new Date() > new Date(session.expiresAt)) {
      this.sessions.delete(sessionId);
      return null;
    }
    
    // Update last access
    session.lastAccess = new Date().toISOString();
    return session;
  }

  /**
   * Destroy session
   * @param {string} sessionId - Session ID
   */
  destroySession(sessionId) {
    this.sessions.delete(sessionId);
  }

  /**
   * Check if user has permission
   * @param {string} username - Username
   * @param {string} permission - Permission to check
   * @returns {boolean} True if user has permission
   */
  hasPermission(username, permission) {
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
   * @param {string} username - Username
   * @returns {Array} Array of permissions
   */
  getUserPermissions(username) {
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
    const { username, email, displayName, password, roles = ['reader'] } = userData;
    
    if (this.users.has(username)) {
      throw new Error('Username already exists');
    }
    
    const hashedPassword = await bcrypt.hash(password, this.saltRounds);
    
    const user = {
      username,
      email,
      displayName: displayName || username,
      password: hashedPassword,
      roles,
      isActive: true,
      isSystem: false,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      loginCount: 0,
      preferences: {}
    };
    
    this.users.set(username, user);
    await this.saveUsers();
    
    console.log(`👤 Created user: ${username}`);
    
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
    
    // Handle password updates
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, this.saltRounds);
    }
    
    Object.assign(user, updates);
    await this.saveUsers();
    
    console.log(`👤 Updated user: ${username}`);
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
    
    // Destroy all sessions for this user
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.username === username) {
        this.sessions.delete(sessionId);
      }
    }
    
    console.log(`👤 Deleted user: ${username}`);
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
      return null;
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
      if (user) return user;
    }
    
    // Check for session-based auth
    const sessionId = req.session?.sessionId || req.cookies?.sessionId;
    if (!sessionId) {
      return null;
    }
    
    const session = this.getSession(sessionId);
    return session ? session.user : null;
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
}

module.exports = UserManager;
