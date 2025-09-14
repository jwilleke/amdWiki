const BaseManager = require('./BaseManager');

/**
 * PolicyEvaluator - Evaluates policy rules and conditions
 * Handles complex policy evaluation logic with support for multiple conditions
 */
class PolicyEvaluator extends BaseManager {
  constructor(engine) {
    super(engine);
    this.policyManager = null;
    this.evaluationCache = new Map();
    this.maxCacheSize = 1000;
  }

  async initialize(config = {}) {
    await super.initialize(config);

    // Get reference to PolicyManager
    this.policyManager = this.engine.getManager('PolicyManager');
    if (!this.policyManager) {
      throw new Error('PolicyEvaluator requires PolicyManager to be registered');
    }

    console.log('📋 PolicyEvaluator initialized');
  }

  /**
   * Evaluate access request against policies
   */
  async evaluateAccess(context) {
    const startTime = Date.now();

    try {
      // Create evaluation context
      const evalContext = this.createEvaluationContext(context);

      // Check cache first
      const cacheKey = this.generateCacheKey(evalContext);
      if (this.evaluationCache.has(cacheKey)) {
        const cached = this.evaluationCache.get(cacheKey);
        cached.fromCache = true;

        // Log cached access decision
        await this.logAuditEvent({
          eventType: 'access_decision',
          user: evalContext.user?.username || 'anonymous',
          userId: evalContext.user?.id,
          sessionId: context.sessionId,
          ipAddress: evalContext.ip,
          userAgent: evalContext.userAgent,
          resource: evalContext.resource,
          resourceType: evalContext.resourceType,
          action: evalContext.action,
          result: cached.allowed ? 'allow' : 'deny',
          reason: cached.reason,
          policyId: cached.policyId,
          policyName: cached.policyName,
          context: {
            cached: true,
            evaluationTime: cached.evaluationTime
          },
          duration: Date.now() - startTime,
          severity: 'low'
        });

        return cached;
      }

      // Get policies from PolicyManager
      const policies = this.policyManager.getPolicies();

      // Evaluate policies in priority order
      const result = await this.evaluatePolicies(evalContext, policies);

      // Add metadata
      result.evaluationTime = Date.now() - startTime;
      result.cacheKey = cacheKey;

      // Log access decision
      await this.logAuditEvent({
        eventType: 'access_decision',
        user: evalContext.user?.username || 'anonymous',
        userId: evalContext.user?.id,
        sessionId: context.sessionId,
        ipAddress: evalContext.ip,
        userAgent: evalContext.userAgent,
        resource: evalContext.resource,
        resourceType: evalContext.resourceType,
        action: evalContext.action,
        result: result.allowed ? 'allow' : 'deny',
        reason: result.reason,
        policyId: result.policyId,
        policyName: result.policyName,
        context: {
          matchedPolicies: result.matchedPolicies?.length || 0,
          evaluationPath: result.evaluationPath
        },
        duration: result.evaluationTime,
        severity: result.allowed ? 'low' : 'medium'
      });

      // Cache result (with size limit)
      if (this.evaluationCache.size < this.maxCacheSize) {
        this.evaluationCache.set(cacheKey, { ...result });
      }

      return result;

    } catch (error) {
      console.error('Policy evaluation error:', error);

      // Log evaluation error
      await this.logAuditEvent({
        eventType: 'access_decision',
        user: context.user?.username || 'anonymous',
        resource: context.resource,
        action: context.action,
        result: 'error',
        reason: `evaluation_error: ${error.message}`,
        duration: Date.now() - startTime,
        severity: 'high'
      });

      return {
        allowed: false,
        reason: 'evaluation_error',
        error: error.message,
        evaluationTime: Date.now() - startTime
      };
    }
  }

  /**
   * Create standardized evaluation context
   */
  createEvaluationContext(context) {
    return {
      user: context.user || null,
      resource: context.resource || '',
      action: context.action || '',
      category: context.category || '',
      tags: context.tags || [],
      ip: context.ip || '',
      userAgent: context.userAgent || '',
      timestamp: context.timestamp || new Date().toISOString(),
      session: context.session || {},
      environment: context.environment || 'production',
      // Derived attributes
      isAuthenticated: !!(context.user && context.user.username),
      userRoles: context.user?.roles || [],
      userGroups: context.user?.groups || [],
      resourceType: this.determineResourceType(context.resource),
      isAdmin: context.user?.roles?.includes('admin') || false
    };
  }

  /**
   * Determine resource type from resource path
   */
  determineResourceType(resource) {
    if (!resource) return 'unknown';

    if (resource.startsWith('/pages/') || resource.endsWith('.md')) {
      return 'page';
    }
    if (resource.startsWith('/attachments/') || /\.(jpg|jpeg|png|gif|pdf|doc|docx)$/i.test(resource)) {
      return 'attachment';
    }
    if (resource.startsWith('/api/')) {
      return 'api';
    }
    if (resource.startsWith('/admin/')) {
      return 'admin';
    }

    return 'other';
  }

  /**
   * Evaluate policies against context
   */
  async evaluatePolicies(evalContext, policies) {
    // Sort policies by priority (highest first)
    const sortedPolicies = [...policies].sort((a, b) => b.priority - a.priority);

    const matchedPolicies = [];
    const deniedPolicies = [];

    for (const policy of sortedPolicies) {
      const matchResult = await this.evaluateSinglePolicy(policy, evalContext);

      if (matchResult.matches) {
        matchedPolicies.push({
          policyId: policy.id,
          policyName: policy.name,
          priority: policy.priority,
          effect: policy.effect,
          reason: matchResult.reason
        });

        // If it's a deny policy, record it
        if (policy.effect === 'deny') {
          deniedPolicies.push(policy);
        }

        // For allow policies, we can stop if no higher priority deny policies
        if (policy.effect === 'allow') {
          // Check if any higher priority deny policies would override
          const higherDenies = deniedPolicies.filter(d => d.priority > policy.priority);
          if (higherDenies.length === 0) {
            return {
              allowed: true,
              reason: `allowed_by_policy:${policy.id}`,
              policyName: policy.name,
              matchedPolicies,
              evaluationPath: 'allow_override'
            };
          }
        }
      }
    }

    // If we have deny policies that matched
    if (deniedPolicies.length > 0) {
      const highestDeny = deniedPolicies.reduce((prev, current) =>
        current.priority > prev.priority ? current : prev
      );

      return {
        allowed: false,
        reason: `denied_by_policy:${highestDeny.id}`,
        policyName: highestDeny.name,
        matchedPolicies,
        evaluationPath: 'deny_override'
      };
    }

    // No policies matched
    return {
      allowed: false,
      reason: 'no_matching_policy',
      matchedPolicies: [],
      evaluationPath: 'no_match'
    };
  }

  /**
   * Evaluate a single policy against context
   */
  async evaluateSinglePolicy(policy, evalContext) {
    try {
      // Evaluate subjects
      const subjectResult = this.evaluateSubjects(policy.subjects, evalContext);
      if (!subjectResult.matches) {
        return { matches: false, reason: `subjects_not_matched: ${subjectResult.reason}` };
      }

      // Evaluate resources
      const resourceResult = this.evaluateResources(policy.resources, evalContext);
      if (!resourceResult.matches) {
        return { matches: false, reason: `resources_not_matched: ${resourceResult.reason}` };
      }

      // Evaluate actions
      const actionResult = this.evaluateActions(policy.actions, evalContext);
      if (!actionResult.matches) {
        return { matches: false, reason: `actions_not_matched: ${actionResult.reason}` };
      }

      // Evaluate conditions
      const conditionResult = await this.evaluateConditions(policy.conditions, evalContext);
      if (!conditionResult.matches) {
        return { matches: false, reason: `conditions_not_matched: ${conditionResult.reason}` };
      }

      return {
        matches: true,
        reason: 'all_criteria_matched',
        details: {
          subjectMatch: subjectResult,
          resourceMatch: resourceResult,
          actionMatch: actionResult,
          conditionMatch: conditionResult
        }
      };

    } catch (error) {
      console.error(`Error evaluating policy ${policy.id}:`, error);
      return { matches: false, reason: `evaluation_error: ${error.message}` };
    }
  }

  /**
   * Evaluate subject criteria
   */
  evaluateSubjects(subjects, context) {
    if (!subjects || subjects.length === 0) {
      return { matches: true, reason: 'no_subjects_defined' };
    }

    for (const subject of subjects) {
      if (this.evaluateSubject(subject, context)) {
        return { matches: true, reason: `subject_matched: ${subject.type}` };
      }
    }

    return { matches: false, reason: 'no_subjects_matched' };
  }

  /**
   * Evaluate single subject
   */
  evaluateSubject(subject, context) {
    switch (subject.type) {
      case 'user':
        return context.user?.username === subject.value;

      case 'role':
        return context.userRoles.includes(subject.value);

      case 'group':
        return context.userGroups.includes(subject.value);

      case 'attribute':
        const value = this.getNestedValue(context, subject.key);
        return value === subject.value;

      case 'authenticated':
        return context.isAuthenticated;

      case 'anonymous':
        return !context.isAuthenticated;

      case 'admin':
        return context.isAdmin;

      default:
        return false;
    }
  }

  /**
   * Evaluate resource criteria
   */
  evaluateResources(resources, context) {
    if (!resources || resources.length === 0) {
      return { matches: true, reason: 'no_resources_defined' };
    }

    for (const resource of resources) {
      if (this.evaluateResource(resource, context)) {
        return { matches: true, reason: `resource_matched: ${resource.type}` };
      }
    }

    return { matches: false, reason: 'no_resources_matched' };
  }

  /**
   * Evaluate single resource
   */
  evaluateResource(resource, context) {
    switch (resource.type) {
      case 'page':
        return this.matchPattern(context.resource, resource.pattern || resource.value);

      case 'attachment':
        return this.matchPattern(context.resource, resource.pattern || resource.value);

      case 'category':
        return context.category === resource.value;

      case 'tag':
        return context.tags?.includes(resource.value);

      case 'resource-type':
        return context.resourceType === resource.value;

      case 'path':
        return this.matchPattern(context.resource, resource.pattern);

      default:
        return false;
    }
  }

  /**
   * Evaluate action criteria
   */
  evaluateActions(actions, context) {
    if (!actions || actions.length === 0) {
      return { matches: true, reason: 'no_actions_defined' };
    }

    const actionMatched = actions.includes(context.action);
    return {
      matches: actionMatched,
      reason: actionMatched ? 'action_matched' : 'action_not_in_list'
    };
  }

  /**
   * Evaluate condition criteria
   */
  async evaluateConditions(conditions, context) {
    if (!conditions || conditions.length === 0) {
      return { matches: true, reason: 'no_conditions_defined' };
    }

    for (const condition of conditions) {
      const result = await this.evaluateCondition(condition, context);
      if (!result) {
        return { matches: false, reason: `condition_failed: ${condition.type}` };
      }
    }

    return { matches: true, reason: 'all_conditions_passed' };
  }

  /**
   * Evaluate single condition
   */
  async evaluateCondition(condition, context) {
    switch (condition.type) {
      case 'time-range':
        return this.evaluateTimeRange(condition, context);

      case 'ip-range':
        return this.evaluateIpRange(condition, context);

      case 'user-attribute':
        return this.evaluateUserAttribute(condition, context);

      case 'context-attribute':
        return this.evaluateContextAttribute(condition, context);

      case 'environment':
        return context.environment === condition.value;

      case 'session-attribute':
        return this.getNestedValue(context.session, condition.key) === condition.value;

      case 'custom':
        return await this.evaluateCustomCondition(condition, context);

      default:
        return true; // Unknown conditions default to true
    }
  }

  /**
   * Evaluate time range condition
   */
  evaluateTimeRange(condition, context) {
    if (!condition.startTime || !condition.endTime) return true;

    const now = new Date();
    const start = new Date(condition.startTime);
    const end = new Date(condition.endTime);

    return now >= start && now <= end;
  }

  /**
   * Evaluate IP range condition
   */
  evaluateIpRange(condition, context) {
    if (!condition.ranges || !context.ip) return false;

    // Simple IP range check - in production, use a proper IP library
    return condition.ranges.some(range => {
      if (range.includes('/')) {
        // CIDR notation - simplified check
        const [network] = range.split('/');
        return context.ip.startsWith(network.split('.').slice(0, 3).join('.'));
      } else {
        // Exact match or subnet
        return context.ip.startsWith(range);
      }
    });
  }

  /**
   * Evaluate user attribute condition
   */
  evaluateUserAttribute(condition, context) {
    if (!context.user) return false;

    const value = this.getNestedValue(context.user, condition.key);
    if (value === undefined) return false;

    return this.compareValues(value, condition.operator, condition.value);
  }

  /**
   * Evaluate context attribute condition
   */
  evaluateContextAttribute(condition, context) {
    const value = this.getNestedValue(context, condition.key);
    if (value === undefined) return false;

    return this.compareValues(value, condition.operator, condition.value);
  }

  /**
   * Evaluate custom condition (for extensibility)
   */
  async evaluateCustomCondition(condition, context) {
    // This could be extended to support custom condition evaluators
    // For now, return true
    console.log(`Custom condition evaluation not implemented: ${condition.name}`);
    return true;
  }

  /**
   * Compare values with operator
   */
  compareValues(left, operator, right) {
    switch (operator) {
      case '==':
      case '===':
        return left === right;
      case '!=':
      case '!==':
        return left !== right;
      case '>':
        return left > right;
      case '>=':
        return left >= right;
      case '<':
        return left < right;
      case '<=':
        return left <= right;
      case 'in':
        return Array.isArray(right) ? right.includes(left) : false;
      case 'contains':
        return Array.isArray(left) ? left.includes(right) : false;
      case 'regex':
        return new RegExp(right).test(left);
      default:
        return false;
    }
  }

  /**
   * Match pattern (supports wildcards)
   */
  matchPattern(value, pattern) {
    if (!pattern) return false;

    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'));
      return regex.test(value);
    }

    return value === pattern;
  }

  /**
   * Get nested value from object
   */
  getNestedValue(obj, path) {
    if (!path) return obj;

    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Generate cache key for evaluation context
   */
  generateCacheKey(context) {
    const key = [
      context.user?.username || 'anonymous',
      context.resource,
      context.action,
      context.category,
      context.ip,
      context.environment
    ].join(':');

    return key;
  }

  /**
   * Clear evaluation cache
   */
  clearCache() {
    this.evaluationCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.evaluationCache.size,
      maxSize: this.maxCacheSize,
      hitRate: this.calculateHitRate()
    };
  }

  /**
   * Calculate cache hit rate (simplified)
   */
  calculateHitRate() {
    // This would need more sophisticated tracking in production
    return this.evaluationCache.size > 0 ? 0.85 : 0; // Placeholder
  }

  /**
   * Get evaluation statistics
   */
  getStatistics() {
    return {
      cacheStats: this.getCacheStats(),
      totalEvaluations: this.evaluationCount || 0,
      averageEvaluationTime: this.averageEvalTime || 0
    };
  }

  /**
   * Log audit event using AuditManager
   */
  async logAuditEvent(auditData) {
    try {
      const auditManager = this.engine.getManager('AuditManager');
      if (auditManager && auditManager.isInitialized()) {
        await auditManager.logAuditEvent(auditData);
      }
    } catch (error) {
      // Don't let audit logging failures break policy evaluation
      console.warn('Audit logging failed:', error.message);
    }
  }
}

module.exports = PolicyEvaluator;