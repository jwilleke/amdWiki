const BaseManager = require('./BaseManager');
const fs = require('fs').promises;
const path = require('path');

/**
 * PolicyManager - Manages JSON-based access control policies
 * Provides flexible, configurable policy evaluation for amdWiki
 */
class PolicyManager extends BaseManager {
  constructor(engine) {
    super(engine);
    this.policies = [];
    this.policyCache = new Map();
    this.configFile = './config/policies.json';
    this.schemaFile = './config/policy-schemas.json';
    this.templatesDir = './config/policy-templates';
  }

  async initialize(config = {}) {
    await super.initialize(config);

    // Configuration from engine config
    const policyConfig = this.engine.getConfig().get('accessControl.policies', {});
    this.configFile = policyConfig.configFile || config.configFile || './config/policies.json';
    this.schemaFile = policyConfig.schemaFile || config.schemaFile || './config/policy-schemas.json';
    this.templatesDir = policyConfig.templatesDir || config.templatesDir || './config/policy-templates';

    // Create directories if they don't exist
    await this.ensureDirectories();

    // Load policies
    await this.loadPolicies();

    // Load schema for validation
    await this.loadSchema();

    console.log(`📋 PolicyManager initialized with ${this.policies.length} policies`);
  }

  /**
   * Ensure required directories exist
   */
  async ensureDirectories() {
    const dirs = [
      path.dirname(this.configFile),
      path.dirname(this.schemaFile),
      this.templatesDir
    ];

    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (err) {
        if (err.code !== 'EEXIST') {
          console.warn(`Warning: Could not create directory ${dir}:`, err.message);
        }
      }
    }
  }

  /**
   * Load policies from configuration file
   */
  async loadPolicies() {
    try {
      const policyData = await fs.readFile(this.configFile, 'utf8');
      const policyConfig = JSON.parse(policyData);

      if (policyConfig.policies && Array.isArray(policyConfig.policies)) {
        this.policies = policyConfig.policies.map(policy => ({
          ...policy,
          compiled: this.compilePolicy(policy)
        }));
      } else {
        this.policies = [];
      }

      // Clear cache when policies are reloaded
      this.policyCache.clear();

      console.log(`📋 Loaded ${this.policies.length} policies from ${this.configFile}`);
    } catch (err) {
      if (err.code === 'ENOENT') {
        // File doesn't exist, create default policies
        console.log('📋 No policy file found, creating default policies');
        await this.createDefaultPolicies();
      } else {
        console.error('Error loading policies:', err.message);
        this.policies = [];
      }
    }
  }

  /**
   * Create default policies if no policy file exists
   */
  async createDefaultPolicies() {
    const defaultPolicies = {
      policies: [
        {
          id: 'admin-full-access',
          name: 'Administrator Full Access',
          description: 'Full access for system administrators',
          priority: 100,
          effect: 'allow',
          subjects: [
            {
              type: 'role',
              value: 'admin'
            }
          ],
          resources: [
            {
              type: 'page',
              pattern: '*'
            },
            {
              type: 'attachment',
              pattern: '*'
            }
          ],
          actions: ['view', 'edit', 'delete', 'upload', 'admin'],
          conditions: [],
          metadata: {
            created: new Date().toISOString(),
            author: 'system',
            tags: ['admin', 'default']
          }
        },
        {
          id: 'authenticated-user-access',
          name: 'Authenticated User Access',
          description: 'Basic access for authenticated users',
          priority: 50,
          effect: 'allow',
          subjects: [
            {
              type: 'attribute',
              key: 'isAuthenticated',
              value: true
            }
          ],
          resources: [
            {
              type: 'page',
              pattern: '*'
            }
          ],
          actions: ['view'],
          conditions: [],
          metadata: {
            created: new Date().toISOString(),
            author: 'system',
            tags: ['user', 'default']
          }
        },
        {
          id: 'deny-anonymous',
          name: 'Deny Anonymous Access',
          description: 'Deny access to sensitive resources for anonymous users',
          priority: 10,
          effect: 'deny',
          subjects: [
            {
              type: 'attribute',
              key: 'isAuthenticated',
              value: false
            }
          ],
          resources: [
            {
              type: 'category',
              value: 'System'
            },
            {
              type: 'category',
              value: 'Admin'
            }
          ],
          actions: ['view', 'edit', 'delete'],
          conditions: [],
          metadata: {
            created: new Date().toISOString(),
            author: 'system',
            tags: ['security', 'default']
          }
        }
      ]
    };

    try {
      await fs.writeFile(this.configFile, JSON.stringify(defaultPolicies, null, 2));
      await this.loadPolicies(); // Reload after creating
      console.log('📋 Created default policies');
    } catch (err) {
      console.error('Error creating default policies:', err.message);
    }
  }

  /**
   * Load JSON schema for policy validation
   */
  async loadSchema() {
    try {
      const schemaData = await fs.readFile(this.schemaFile, 'utf8');
      this.schema = JSON.parse(schemaData);
      console.log('📋 Loaded policy validation schema');
    } catch (err) {
      console.log('📋 No schema file found, using basic validation');
      this.schema = null;
    }
  }

  /**
   * Compile a policy for efficient evaluation
   */
  compilePolicy(policy) {
    return {
      ...policy,
      compiledSubjects: policy.subjects.map(subject => this.compileSubject(subject)),
      compiledResources: policy.resources.map(resource => this.compileResource(resource)),
      compiledConditions: policy.conditions.map(condition => this.compileCondition(condition))
    };
  }

  /**
   * Compile subject matching logic
   */
  compileSubject(subject) {
    switch (subject.type) {
      case 'user':
        return (context) => context.user?.username === subject.value;
      case 'role':
        return (context) => context.user?.roles?.includes(subject.value);
      case 'group':
        return (context) => context.user?.groups?.includes(subject.value);
      case 'attribute':
        return (context) => {
          const user = context.user || {};
          return this.getNestedValue(user, subject.key) === subject.value;
        };
      default:
        return () => false;
    }
  }

  /**
   * Compile resource matching logic
   */
  compileResource(resource) {
    switch (resource.type) {
      case 'page':
        if (resource.pattern.includes('*')) {
          const regex = new RegExp(resource.pattern.replace(/\*/g, '.*'));
          return (context) => regex.test(context.resource);
        }
        return (context) => context.resource === resource.pattern;
      case 'attachment':
        if (resource.pattern.includes('*')) {
          const regex = new RegExp(resource.pattern.replace(/\*/g, '.*'));
          return (context) => regex.test(context.resource);
        }
        return (context) => context.resource === resource.pattern;
      case 'category':
        return (context) => context.category === resource.value;
      case 'tag':
        return (context) => context.tags?.includes(resource.value);
      default:
        return () => false;
    }
  }

  /**
   * Compile condition evaluation logic
   */
  compileCondition(condition) {
    switch (condition.type) {
      case 'time':
        return (context) => this.evaluateTimeCondition(condition, context);
      case 'ip-range':
        return (context) => this.evaluateIpCondition(condition, context);
      case 'user-attribute':
        return (context) => this.evaluateUserAttributeCondition(condition, context);
      case 'context':
        return (context) => this.getNestedValue(context, condition.key) === condition.value;
      default:
        return () => true;
    }
  }

  /**
   * Evaluate policies for a given access context
   */
  async evaluatePolicies(context) {
    const cacheKey = this.generateCacheKey(context);
    if (this.policyCache.has(cacheKey)) {
      return this.policyCache.get(cacheKey);
    }

    // Sort policies by priority (highest first)
    const sortedPolicies = [...this.policies].sort((a, b) => b.priority - a.priority);

    for (const policy of sortedPolicies) {
      if (this.policyMatches(policy, context)) {
        const result = {
          hasDecision: true,
          decision: {
            allowed: policy.effect === 'allow',
            reason: `policy:${policy.id}`,
            policyName: policy.name,
            priority: policy.priority
          }
        };

        // Cache result for future use
        this.policyCache.set(cacheKey, result);
        return result;
      }
    }

    const result = { hasDecision: false };
    this.policyCache.set(cacheKey, result);
    return result;
  }

  /**
   * Check if a policy matches the given context
   */
  policyMatches(policy, context) {
    // Check subjects
    const subjectMatch = policy.compiledSubjects.some(subjectFn => subjectFn(context));
    if (!subjectMatch) return false;

    // Check resources
    const resourceMatch = policy.compiledResources.some(resourceFn => resourceFn(context));
    if (!resourceMatch) return false;

    // Check actions
    const actionMatch = policy.actions.includes(context.action);
    if (!actionMatch) return false;

    // Check conditions
    const conditionMatch = policy.compiledConditions.every(conditionFn => conditionFn(context));
    if (!conditionMatch) return false;

    return true;
  }

  /**
   * Generate cache key for policy evaluation results
   */
  generateCacheKey(context) {
    const key = `${context.user?.username || 'anonymous'}:${context.resource}:${context.action}:${context.category || ''}`;
    return key;
  }

  /**
   * Get nested value from object using dot notation
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Evaluate time-based conditions
   */
  evaluateTimeCondition(condition, context) {
    // This would integrate with time-based permissions
    // For now, return true (always allow)
    return true;
  }

  /**
   * Evaluate IP range conditions
   */
  evaluateIpCondition(condition, context) {
    if (!context.ip || !condition.ranges) return false;

    // Simple IP range check (would need proper CIDR implementation)
    return condition.ranges.some(range => {
      // Basic implementation - in real world, use proper IP range library
      return context.ip.startsWith(range.split('/')[0].split('.').slice(0, 3).join('.'));
    });
  }

  /**
   * Evaluate user attribute conditions
   */
  evaluateUserAttributeCondition(condition, context) {
    if (!context.user) return false;

    const value = this.getNestedValue(context.user, condition.key);
    if (value === undefined) return false;

    switch (condition.operator) {
      case '==':
      case '===':
        return value === condition.value;
      case '!=':
      case '!==':
        return value !== condition.value;
      case '>':
        return value > condition.value;
      case '>=':
        return value >= condition.value;
      case '<':
        return value < condition.value;
      case '<=':
        return value <= condition.value;
      default:
        return false;
    }
  }

  /**
   * Get all policies
   */
  getPolicies() {
    return this.policies.map(policy => ({ ...policy, compiled: undefined })); // Remove compiled functions
  }

  /**
   * Get policy by ID
   */
  getPolicy(id) {
    return this.policies.find(policy => policy.id === id);
  }

  /**
   * Add or update a policy
   */
  async savePolicy(policy) {
    const existingIndex = this.policies.findIndex(p => p.id === policy.id);

    if (existingIndex >= 0) {
      this.policies[existingIndex] = {
        ...policy,
        compiled: this.compilePolicy(policy)
      };
    } else {
      this.policies.push({
        ...policy,
        compiled: this.compilePolicy(policy)
      });
    }

    // Clear cache and save to file
    this.policyCache.clear();
    await this.savePoliciesToFile();

    return policy;
  }

  /**
   * Delete a policy
   */
  async deletePolicy(id) {
    const index = this.policies.findIndex(policy => policy.id === id);
    if (index >= 0) {
      this.policies.splice(index, 1);
      this.policyCache.clear();
      await this.savePoliciesToFile();
      return true;
    }
    return false;
  }

  /**
   * Save policies to configuration file
   */
  async savePoliciesToFile() {
    const policyData = {
      policies: this.policies.map(policy => ({ ...policy, compiled: undefined }))
    };

    try {
      await fs.writeFile(this.configFile, JSON.stringify(policyData, null, 2));
      console.log('📋 Policies saved to file');
    } catch (err) {
      console.error('Error saving policies:', err.message);
      throw err;
    }
  }

  /**
   * Validate policy structure
   */
  validatePolicy(policy) {
    const errors = [];

    if (!policy.id) errors.push('Policy must have an id');
    if (!policy.name) errors.push('Policy must have a name');
    if (!['allow', 'deny'].includes(policy.effect)) {
      errors.push('Policy effect must be "allow" or "deny"');
    }
    if (!Array.isArray(policy.subjects)) errors.push('Policy must have subjects array');
    if (!Array.isArray(policy.resources)) errors.push('Policy must have resources array');
    if (!Array.isArray(policy.actions)) errors.push('Policy must have actions array');
    if (!Array.isArray(policy.conditions)) errors.push('Policy must have conditions array');

    return errors;
  }

  /**
   * Get policy statistics
   */
  getStatistics() {
    const stats = {
      totalPolicies: this.policies.length,
      allowPolicies: this.policies.filter(p => p.effect === 'allow').length,
      denyPolicies: this.policies.filter(p => p.effect === 'deny').length,
      averagePriority: this.policies.reduce((sum, p) => sum + p.priority, 0) / this.policies.length,
      cacheSize: this.policyCache.size
    };

    return stats;
  }
}

module.exports = PolicyManager;