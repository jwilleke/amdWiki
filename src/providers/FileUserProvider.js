const BaseUserProvider = require('./BaseUserProvider');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

/**
 * FileUserProvider - JSON file-based user and session storage
 *
 * Stores users and sessions in JSON files on the filesystem.
 * This is the default provider for UserManager.
 */
class FileUserProvider extends BaseUserProvider {
  constructor(engine) {
    super(engine);
    this.users = new Map();
    this.sessions = new Map();
    this.usersDirectory = null;
    this.usersFile = null;
    this.sessionsFile = null;
  }

  /**
   * Initialize the provider
   */
  async initialize() {
    const configManager = this.engine.getManager('ConfigurationManager');
    if (!configManager) {
      throw new Error('FileUserProvider requires ConfigurationManager');
    }

    // Load configuration
    this.usersDirectory = configManager.getProperty(
      'amdwiki.user.provider.storagedir',
      './users'
    );
    this.usersFile = configManager.getProperty(
      'amdwiki.user.provider.files.users',
      'users.json'
    );
    this.sessionsFile = configManager.getProperty(
      'amdwiki.user.provider.files.sessions',
      'sessions.json'
    );

    // Create storage directory
    await fs.mkdir(this.usersDirectory, { recursive: true });

    // Load users and sessions
    await this.loadUsers();
    await this.loadSessions();

    this.initialized = true;
    logger.info(`📁 FileUserProvider initialized with ${this.users.size} users`);
  }

  /**
   * Load users from disk
   */
  async loadUsers() {
    try {
      const usersFilePath = path.join(this.usersDirectory, this.usersFile);
      const usersData = await fs.readFile(usersFilePath, 'utf8');
      const users = JSON.parse(usersData);

      this.users = new Map(Object.entries(users));
      logger.info(`📁 Loaded ${this.users.size} users from ${usersFilePath}`);
    } catch (err) {
      if (err.code === 'ENOENT') {
        // Users file doesn't exist yet
        this.users = new Map();
        logger.info('📁 No users file found, starting with empty user store');
      } else {
        logger.error('Error loading users:', err);
        throw err;
      }
    }
  }

  /**
   * Save users to disk
   */
  async saveUsers() {
    try {
      const usersFilePath = path.join(this.usersDirectory, this.usersFile);
      const users = Object.fromEntries(this.users);
      await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
      logger.debug(`📁 Saved ${this.users.size} users to ${usersFilePath}`);
    } catch (err) {
      logger.error('Error saving users:', err);
      throw err;
    }
  }

  /**
   * Load sessions from disk and clean up expired ones
   */
  async loadSessions() {
    this.sessions.clear();
    const sessionsFilePath = path.join(this.usersDirectory, this.sessionsFile);

    try {
      const sessionsData = await fs.readFile(sessionsFilePath, 'utf8');
      const sessionsFromFile = JSON.parse(sessionsData);

      const now = new Date();
      let sessionsChanged = false;

      for (const [sessionId, session] of Object.entries(sessionsFromFile)) {
        if (new Date(session.expiresAt) > now) {
          this.sessions.set(sessionId, session);
        } else {
          sessionsChanged = true;
        }
      }

      if (sessionsChanged) {
        await this.saveSessions();
      }

      logger.info(`📁 Loaded ${this.sessions.size} active sessions from ${sessionsFilePath}`);
    } catch (err) {
      if (err.code === 'ENOENT') {
        logger.info(`📁 No sessions file found at ${sessionsFilePath}, starting fresh`);
        this.sessions = new Map();
      } else {
        logger.error(`Error loading sessions from ${sessionsFilePath}:`, err);
        this.sessions = new Map();
      }
    }
  }

  /**
   * Save sessions to disk
   */
  async saveSessions() {
    const sessionsFilePath = path.join(this.usersDirectory, this.sessionsFile);

    try {
      const sessionsObject = Object.fromEntries(this.sessions);
      await fs.mkdir(path.dirname(sessionsFilePath), { recursive: true });
      await fs.writeFile(sessionsFilePath, JSON.stringify(sessionsObject, null, 2), 'utf8');
      logger.debug(`📁 Saved ${this.sessions.size} sessions to ${sessionsFilePath}`);
    } catch (err) {
      logger.error(`Error saving sessions to ${sessionsFilePath}:`, err);
      throw err;
    }
  }

  /**
   * Get a user by username
   */
  async getUser(username) {
    return this.users.get(username) || null;
  }

  /**
   * Get all usernames
   */
  async getAllUsernames() {
    return Array.from(this.users.keys());
  }

  /**
   * Get all users
   */
  async getAllUsers() {
    return new Map(this.users);
  }

  /**
   * Create a new user
   */
  async createUser(username, userData) {
    if (this.users.has(username)) {
      throw new Error(`User already exists: ${username}`);
    }

    this.users.set(username, userData);
    await this.saveUsers();
    logger.info(`📁 Created user: ${username}`);
  }

  /**
   * Update an existing user
   */
  async updateUser(username, userData) {
    if (!this.users.has(username)) {
      throw new Error(`User not found: ${username}`);
    }

    this.users.set(username, userData);
    await this.saveUsers();
    logger.info(`📁 Updated user: ${username}`);
  }

  /**
   * Delete a user
   */
  async deleteUser(username) {
    const deleted = this.users.delete(username);

    if (deleted) {
      await this.saveUsers();
      logger.info(`📁 Deleted user: ${username}`);
    }

    return deleted;
  }

  /**
   * Check if user exists
   */
  async userExists(username) {
    return this.users.has(username);
  }

  /**
   * Create a new session
   */
  async createSession(sessionId, sessionData) {
    this.sessions.set(sessionId, sessionData);
    await this.saveSessions();
    logger.debug(`📁 Created session: ${sessionId}`);
  }

  /**
   * Get a session by ID
   */
  async getSession(sessionId) {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Get all sessions
   */
  async getAllSessions() {
    return new Map(this.sessions);
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId) {
    const deleted = this.sessions.delete(sessionId);

    if (deleted) {
      await this.saveSessions();
      logger.debug(`📁 Deleted session: ${sessionId}`);
    }

    return deleted;
  }

  /**
   * Clean up expired sessions
   */
  async cleanExpiredSessions() {
    const now = new Date();
    let removedCount = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (new Date(session.expiresAt) <= now) {
        this.sessions.delete(sessionId);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      await this.saveSessions();
      logger.info(`📁 Cleaned up ${removedCount} expired sessions`);
    }

    return removedCount;
  }

  /**
   * Backup all user and session data
   */
  async backup() {
    logger.info('[FileUserProvider] Starting backup...');

    try {
      const backupData = {
        providerName: 'FileUserProvider',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        config: {
          usersDirectory: this.usersDirectory,
          usersFile: this.usersFile,
          sessionsFile: this.sessionsFile
        },
        users: Object.fromEntries(this.users),
        sessions: Object.fromEntries(this.sessions),
        statistics: {
          totalUsers: this.users.size,
          activeSessions: this.sessions.size,
          usernames: Array.from(this.users.keys())
        }
      };

      logger.info(`[FileUserProvider] Backup complete: ${this.users.size} users, ${this.sessions.size} sessions`);

      return backupData;
    } catch (error) {
      logger.error('[FileUserProvider] Backup failed:', error);
      throw error;
    }
  }

  /**
   * Restore user and session data from backup
   */
  async restore(backupData) {
    logger.info('[FileUserProvider] Starting restore...');

    if (!backupData) {
      throw new Error('FileUserProvider: No backup data provided for restore');
    }

    try {
      // Restore users
      if (backupData.users && typeof backupData.users === 'object') {
        this.users = new Map(Object.entries(backupData.users));
        await this.saveUsers();
        logger.info(`[FileUserProvider] Restored ${this.users.size} users`);
      }

      // Restore sessions
      if (backupData.sessions && typeof backupData.sessions === 'object') {
        // Filter out expired sessions during restore
        const now = new Date();
        const validSessions = Object.entries(backupData.sessions).filter(
          ([, session]) => new Date(session.expiresAt) > now
        );

        this.sessions = new Map(validSessions);
        await this.saveSessions();
        logger.info(`[FileUserProvider] Restored ${this.sessions.size} active sessions (expired sessions filtered out)`);
      }

      logger.info('[FileUserProvider] Restore completed successfully');
    } catch (error) {
      logger.error('[FileUserProvider] Restore failed:', error);
      throw error;
    }
  }

  /**
   * Get provider information
   */
  getProviderInfo() {
    return {
      name: 'FileUserProvider',
      version: '1.0.0',
      description: 'JSON file-based user and session storage',
      features: ['users', 'sessions', 'backup', 'restore', 'expiration-cleanup']
    };
  }

  /**
   * Shutdown the provider
   */
  async shutdown() {
    // Clean up expired sessions before shutdown
    await this.cleanExpiredSessions();

    await super.shutdown();
    logger.info('FileUserProvider shut down');
  }
}

module.exports = FileUserProvider;
