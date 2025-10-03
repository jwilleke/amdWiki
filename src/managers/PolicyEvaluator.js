const BaseManager = require('./BaseManager');
const logger = require('../utils/logger');
const micromatch = require('micromatch');

/**
 * PolicyEvaluator - Evaluates access policies against a given context.
 * PolicyEvaluator mimics how JSPWiki uses Java's built-in security framework (java.security) to load and evaluate security policies from a policy file
 */
class PolicyEvaluator extends BaseManager {
  constructor(engine) {
    super(engine);
    this.policyManager = null;
  }

  async initialize() {
    this.policyManager = this.engine.getManager('PolicyManager');
    if (!this.policyManager) {
      throw new Error('PolicyEvaluator requires PolicyManager to be initialized.');
    }
    logger.info('📋 PolicyEvaluator initialized');
  }

  /**
   * Evaluates all relevant policies to make an access decision.
   * @param {object} context - The context of the access request.
   * @param {string} context.pageName - The name of the page being accessed.
   * @param {string} context.action - The action being performed (e.g., 'view').
   * @param {object} context.userContext - The user's context, including roles.
   * @returns {Promise<{hasDecision: boolean, allowed: boolean, reason: string, policyName: string|null}>}
   */
  async evaluateAccess(context) {
    const { pageName, action, userContext } = context || {};
    const roles = (userContext?.roles || []).join('|');
    logger.info(`[POLICY] Evaluate page=${pageName} action=${action} user=${userContext?.username} roles=${roles}`);

    const policies = this.policyManager.getAllPolicies();
    for (const policy of policies) {
      const match = this.matches(policy, context);
      logger.info(`[POLICY] Check policy=${policy.id} effect=${policy.effect} match=${match}`);
      if (match) {
        return { hasDecision: true, allowed: policy.effect === 'allow', reason: `Policy match: ${policy.id}`, policyName: policy.id };
      }
    }
    logger.info('[POLICY] No matching policy');
    return { hasDecision: false, allowed: false, reason: 'No matching policy', policyName: null };
  }

  /**
   * Checks if a single policy matches the given context.
   * @param {object} policy - The policy to check.
   * @param {object} context - The access request context.
   * @returns {boolean} True if the policy matches, false otherwise.
   */
  matches(policy, context) {
    const subjectMatch = this.matchesSubject(policy.subjects, context.userContext);
    const resourceMatch = this.matchesResource(policy.resources, context.pageName);
    const actionMatch = this.matchesAction(policy.actions, context.action);

    return subjectMatch && resourceMatch && actionMatch;
  }

  /**
   * Check if the user context's roles match the policy's subject requirements.
   * @param {Array<Object>} policySubjects - The subjects array from the policy.
   * @param {Object} userContext - The user's context.
   * @returns {boolean} True if the user matches the policy subjects.
   */
  matchesSubject(policySubjects, userContext) {
    if (!policySubjects || policySubjects.length === 0) {
      return true; // A policy with no subjects applies to everyone.
    }

    const userRoles = new Set(userContext?.roles || []);

    // Check if policy requires "All" role - this matches everyone including anonymous
    for (const subject of policySubjects) {
      if (subject.type === 'role' && subject.value === 'All') {
        return true; // "All" matches any user
      }
    }

    // If user has no roles, they cannot match policies requiring specific roles
    if (userRoles.size === 0) {
      return false;
    }

    // The user is a match if they have AT LEAST ONE of the roles specified in the policy's subjects
    for (const subject of policySubjects) {
      if (subject.type === 'role' && userRoles.has(subject.value)) {
        return true; // Match found!
      }
    }

    return false; // No matching role was found in the user's context.
  }

  /**
   * Checks if the resource matches the policy's resources.
   * @param {Array<object>} resources - The resources array from the policy.
   * @param {string} pageName - The name of the page being accessed.
   * @returns {boolean} True if a resource matches the page.
   */
  matchesResource(resources, pageName) {
    if (!resources || resources.length === 0) {
      return true; // No resources specified means it applies to all.
    }
    for (const resource of resources) {
      if (resource.type === 'page' && micromatch.isMatch(pageName, resource.pattern)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Checks if the action matches the policy's actions.
   * @param {Array<string>} actions - The actions array from the policy.
   * @param {string} action - The action being performed.
   * @returns {boolean} True if the action is in the policy's list.
   */
  matchesAction(actions, action) {
    if (!actions || actions.length === 0) {
      return true; // No actions specified means it applies to all.
    }
    return actions.includes(action) || actions.includes('*');
  }
}

module.exports = PolicyEvaluator;