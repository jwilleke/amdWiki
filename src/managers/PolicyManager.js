const BaseManager = require('./BaseManager');
const logger = require('../utils/logger');

/**
 * PolicyManager - Manages the lifecycle of access control policies.
 * It loads, stores, and provides access to all defined policies.
 */
class PolicyManager extends BaseManager {
  constructor(engine) {
    super(engine);
    this.policies = new Map();
  }

  /**
   * Initializes the PolicyManager by loading policies from the ConfigurationManager.
   */
  async initialize() {
    const configManager = this.engine.getManager('ConfigurationManager');
    if (!configManager) {
      throw new Error('PolicyManager requires ConfigurationManager to be initialized.');
    }

    const policiesEnabled = configManager.getProperty('amdwiki.access.policies.enabled', false);
    if (!policiesEnabled) {
      logger.info('PolicyManager is disabled via configuration.');
      return;
    }

    // Read policies directly from the config object, not a file
    const policies = configManager.getProperty('amdwiki.access.policies', []);
    if (!Array.isArray(policies)) {
      logger.error('Policies configuration (amdwiki.access.policies) is invalid or not an array.');
      return;
    }

    this.policies.clear();
    for (const policy of policies) {
      if (policy && policy.id) {
        this.policies.set(policy.id, policy);
      }
    }
    logger.info(`📋 Loaded ${this.policies.size} policies from ConfigurationManager.`);
  }

  /**
   * Retrieves a policy by its unique ID.
   * @param {string} id The ID of the policy.
   * @returns {object|undefined} The policy object, or undefined if not found.
   */
  getPolicy(id) {
    return this.policies.get(id);
  }

  /**
   * Returns all loaded policies, sorted by priority (descending).
   * @returns {object[]} An array of all policy objects.
   */
  getAllPolicies() {
    return Array.from(this.policies.values()).sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }
}

module.exports = PolicyManager;