const logger = require('../utils/logger');

/**
 * BaseUserProvider - Abstract interface for user storage providers
 *
 * All user storage providers must extend this class and implement its methods.
 * Providers handle the actual storage and retrieval of user accounts and sessions,
 * whether from filesystem (JSON), database, LDAP, or other backends.
 *
 * @abstract
 */
class BaseUserProvider {
  /**
   * Create a new user provider
   * @param {object} engine - The WikiEngine instance
   */
  constructor(engine) {
    if (!engine) {
      throw new Error('BaseUserProvider requires an engine instance');
    }
    this.engine = engine;
    this.initialized = false;
  }

  /**
   * Initialize the provider
   *
   * IMPORTANT: Providers MUST access configuration via ConfigurationManager:
   *   const configManager = this.engine.getManager('ConfigurationManager');
   *   const value = configManager.getProperty('key', 'default');
   *
   * Do NOT read configuration files directly.
   *
   * @returns {Promise<void>}
   */
  async initialize() {
    throw new Error('initialize() must be implemented by provider');
  }

  /**
   * Get a user by username
   * @param {string} username - Username to look up
   * @returns {Promise<Object|null>} User object or null if not found
   */
  async getUser(username) {
    throw new Error('getUser() must be implemented by provider');
  }

  /**
   * Get all usernames
   * @returns {Promise<string[]>} Array of all usernames
   */
  async getAllUsernames() {
    throw new Error('getAllUsernames() must be implemented by provider');
  }

  /**
   * Get all users
   * @returns {Promise<Map<string, Object>>} Map of username to user object
   */
  async getAllUsers() {
    throw new Error('getAllUsers() must be implemented by provider');
  }

  /**
   * Create a new user
   * @param {string} username - Username
   * @param {Object} userData - User data (password should be hashed by UserManager)
   * @returns {Promise<void>}
   */
  async createUser(username, userData) {
    throw new Error('createUser() must be implemented by provider');
  }

  /**
   * Update an existing user
   * @param {string} username - Username
   * @param {Object} userData - Updated user data
   * @returns {Promise<void>}
   */
  async updateUser(username, userData) {
    throw new Error('updateUser() must be implemented by provider');
  }

  /**
   * Delete a user
   * @param {string} username - Username to delete
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deleteUser(username) {
    throw new Error('deleteUser() must be implemented by provider');
  }

  /**
   * Check if user exists
   * @param {string} username - Username to check
   * @returns {Promise<boolean>} True if user exists
   */
  async userExists(username) {
    throw new Error('userExists() must be implemented by provider');
  }

  /**
   * Create a new session
   * @param {string} sessionId - Session ID
   * @param {Object} sessionData - Session data
   * @returns {Promise<void>}
   */
  async createSession(sessionId, sessionData) {
    throw new Error('createSession() must be implemented by provider');
  }

  /**
   * Get a session by ID
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object|null>} Session object or null if not found
   */
  async getSession(sessionId) {
    throw new Error('getSession() must be implemented by provider');
  }

  /**
   * Get all sessions
   * @returns {Promise<Map<string, Object>>} Map of sessionId to session object
   */
  async getAllSessions() {
    throw new Error('getAllSessions() must be implemented by provider');
  }

  /**
   * Delete a session
   * @param {string} sessionId - Session ID to delete
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deleteSession(sessionId) {
    throw new Error('deleteSession() must be implemented by provider');
  }

  /**
   * Clean up expired sessions
   * @returns {Promise<number>} Number of sessions removed
   */
  async cleanExpiredSessions() {
    throw new Error('cleanExpiredSessions() must be implemented by provider');
  }

  /**
   * Backup all user and session data
   * @returns {Promise<Object>} Backup data
   */
  async backup() {
    throw new Error('backup() must be implemented by provider');
  }

  /**
   * Restore user and session data from backup
   * @param {Object} backupData - Backup data from backup() method
   * @returns {Promise<void>}
   */
  async restore(backupData) {
    throw new Error('restore() must be implemented by provider');
  }

  /**
   * Get provider information
   * @returns {object} Provider metadata
   */
  getProviderInfo() {
    return {
      name: 'BaseUserProvider',
      version: '1.0.0',
      description: 'Abstract base provider',
      features: []
    };
  }

  /**
   * Shutdown the provider (cleanup resources)
   * @returns {Promise<void>}
   */
  async shutdown() {
    this.initialized = false;
    logger.info(`${this.getProviderInfo().name} shut down`);
  }
}

module.exports = BaseUserProvider;
