const BaseManager = require('./BaseManager');
const Ajv = require('ajv');
const addFormats = require('ajv-formats'); // NEW

/**
 * PolicyValidator - Validates policy schemas and detects conflicts
 * Ensures policy integrity and prevents conflicting rules
 */
class PolicyValidator extends BaseManager {
  constructor(engine) {
    super(engine);
    this.policyManager = null;
    this.schemaValidator = null;
    this.policySchema = null;
    this.validationCache = new Map();
  }

  async initialize(config = {}) {
    await super.initialize(config);

    // Get reference to PolicyManager
    this.policyManager = this.engine.getManager('PolicyManager');
    if (!this.policyManager) {
      throw new Error('PolicyValidator requires PolicyManager to be registered');
    }

    // Initialize JSON schema validator
    this.schemaValidator = new Ajv({
      allErrors: true,
      verbose: true,
      strict: false
    });
    addFormats(this.schemaValidator); // NEW

    // Load policy schema
    await this.loadPolicySchema();

    console.log('📋 PolicyValidator initialized');
  }

  /**
   * Load JSON schema for policy validation
   */
  async loadPolicySchema() {
    try {
      // Define comprehensive policy schema
      this.policySchema = {
        type: 'object',
        required: ['id', 'name', 'effect', 'subjects', 'resources', 'actions'],
        properties: {
          id: {
            type: 'string',
            pattern: '^[a-zA-Z0-9_-]+$',
            minLength: 1,
            maxLength: 100
          },
          name: {
            type: 'string',
            minLength: 1,
            maxLength: 200
          },
          description: {
            type: 'string',
            maxLength: 1000
          },
          priority: {
            type: 'number',
            minimum: 0,
            maximum: 1000,
            default: 50
          },
          effect: {
            type: 'string',
            enum: ['allow', 'deny']
          },
          subjects: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              required: ['type'],
              properties: {
                type: {
                  type: 'string',
                  enum: ['user', 'role', 'group', 'attribute', 'authenticated', 'anonymous', 'admin']
                },
                value: {
                  type: ['string', 'number', 'boolean']
                },
                key: {
                  type: 'string'
                }
              },
              oneOf: [
                { required: ['type', 'value'] },
                { required: ['type', 'key', 'value'] }
              ]
            }
          },
          resources: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              required: ['type'],
              properties: {
                type: {
                  type: 'string',
                  enum: ['page', 'attachment', 'category', 'tag', 'resource-type', 'path']
                },
                value: {
                  type: ['string', 'number']
                },
                pattern: {
                  type: 'string'
                }
              },
              oneOf: [
                { required: ['type', 'value'] },
                { required: ['type', 'pattern'] }
              ]
            }
          },
          actions: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'string',
              enum: ['view', 'edit', 'delete', 'upload', 'download', 'admin', 'create', 'update']
            }
          },
          conditions: {
            type: 'array',
            items: {
              type: 'object',
              required: ['type'],
              properties: {
                type: {
                  type: 'string',
                  enum: ['time-range', 'ip-range', 'user-attribute', 'context-attribute', 'environment', 'session-attribute', 'custom']
                },
                key: { type: 'string' },
                value: { type: ['string', 'number', 'boolean', 'array'] },
                operator: {
                  type: 'string',
                  enum: ['==', '===', '!=', '!==', '>', '>=', '<', '<=', 'in', 'contains', 'regex']
                },
                // Accept RFC 3339 date-time, RFC 3339 time (HH:MM:SS), or HH:MM[(:SS)][TZ]
                startTime: {
                  type: 'string',
                  anyOf: [
                    { format: 'date-time' },
                    { format: 'time' },
                    { pattern: '^([01]\\d|2[0-3]):[0-5]\\d(:[0-5]\\d)?(Z|[+-][0-2]\\d:[0-5]\\d)?$' }
                  ]
                },
                endTime: {
                  type: 'string',
                  anyOf: [
                    { format: 'date-time' },
                    { format: 'time' },
                    { pattern: '^([01]\\d|2[0-3]):[0-5]\\d(:[0-5]\\d)?(Z|[+-][0-2]\\d:[0-5]\\d)?$' }
                  ]
                },
                ranges: {
                  type: 'array',
                  items: { type: 'string' }
                }
              }
            }
          },
          metadata: {
            type: 'object',
            properties: {
              created: { type: 'string', format: 'date-time' },
              modified: { type: 'string', format: 'date-time' },
              author: { type: 'string' },
              tags: { type: 'array', items: { type: 'string' } },
              version: { type: 'string' }
            }
          }
        }
      };

      // Compile the schema
      this.schemaValidatorCompiled = this.schemaValidator.compile(this.policySchema);

      console.log('📋 Policy schema loaded and compiled');
    } catch (error) {
      console.error('Error loading policy schema:', error);
      this.policySchema = null;
    }
  }

  /**
   * Validate a single policy
   */
  validatePolicy(policy) {
    const errors = [];
    const cacheKey = `policy_${policy.id}`;

    // Check cache first
    if (this.validationCache.has(cacheKey)) {
      return this.validationCache.get(cacheKey);
    }

    // Schema validation
    if (this.schemaValidatorCompiled && !this.schemaValidatorCompiled(policy)) {
      errors.push(...this.formatSchemaErrors(this.schemaValidatorCompiled.errors));
    }

    // Business logic validation
    errors.push(...this.validateBusinessLogic(policy));

    // Semantic validation
    errors.push(...this.validateSemantics(policy));

    const result = {
      isValid: errors.length === 0,
      errors,
      warnings: this.generateWarnings(policy)
    };

    // Cache result
    this.validationCache.set(cacheKey, result);

    return result;
  }

  /**
   * Format JSON schema validation errors
   */
  formatSchemaErrors(schemaErrors) {
    return schemaErrors.map(error => ({
      type: 'schema',
      field: error.instancePath || error.dataPath || 'root',
      message: error.message,
      details: error
    }));
  }

  /**
   * Validate business logic rules
   */
  validateBusinessLogic(policy) {
    const errors = [];

    // Check for duplicate subjects
    const subjectKeys = new Set();
    policy.subjects.forEach((subject, index) => {
      const key = `${subject.type}:${subject.value || subject.key}`;
      if (subjectKeys.has(key)) {
        errors.push({
          type: 'business',
          field: `subjects[${index}]`,
          message: 'Duplicate subject criteria found'
        });
      }
      subjectKeys.add(key);
    });

    // Check for duplicate resources
    const resourceKeys = new Set();
    policy.resources.forEach((resource, index) => {
      const key = `${resource.type}:${resource.value || resource.pattern}`;
      if (resourceKeys.has(key)) {
        errors.push({
          type: 'business',
          field: `resources[${index}]`,
          message: 'Duplicate resource criteria found'
        });
      }
      resourceKeys.add(key);
    });

    // Check for duplicate actions
    const actionSet = new Set(policy.actions);
    if (actionSet.size !== policy.actions.length) {
      errors.push({
        type: 'business',
        field: 'actions',
        message: 'Duplicate actions found'
      });
    }

    // Validate priority range
    if (policy.priority < 0 || policy.priority > 1000) {
      errors.push({
        type: 'business',
        field: 'priority',
        message: 'Priority must be between 0 and 1000'
      });
    }

    return errors;
  }

  /**
   * Validate semantic correctness
   */
  validateSemantics(policy) {
    const errors = [];

    // Check for potentially conflicting conditions
    policy.conditions.forEach((condition, index) => {
      if (condition.type === 'time-range' && (!condition.startTime || !condition.endTime)) {
        errors.push({
          type: 'semantic',
          field: `conditions[${index}]`,
          message: 'Time range condition must have both startTime and endTime'
        });
      }

      if (condition.type === 'ip-range' && (!condition.ranges || condition.ranges.length === 0)) {
        errors.push({
          type: 'semantic',
          field: `conditions[${index}]`,
          message: 'IP range condition must have ranges defined'
        });
      }

      if ((condition.type === 'user-attribute' || condition.type === 'context-attribute') &&
          (!condition.key || condition.operator === undefined || condition.value === undefined)) {
        errors.push({
          type: 'semantic',
          field: `conditions[${index}]`,
          message: 'Attribute condition must have key, operator, and value'
        });
      }
    });

    // Check for logical inconsistencies
    if (policy.effect === 'deny' && policy.actions.includes('admin')) {
      errors.push({
        type: 'semantic',
        field: 'effect',
        message: 'Deny policies should not include admin actions'
      });
    }

    return errors;
  }

  /**
   * Generate warnings for potential issues
   */
  generateWarnings(policy) {
    const warnings = [];

    // Warn about very high or low priorities
    if (policy.priority > 900) {
      warnings.push({
        type: 'priority',
        message: 'Very high priority may override important security policies'
      });
    }

    if (policy.priority < 10) {
      warnings.push({
        type: 'priority',
        message: 'Very low priority may be overridden by other policies'
      });
    }

    // Warn about overly broad patterns
    policy.resources.forEach((resource, index) => {
      if (resource.pattern === '*' || resource.pattern === '**') {
        warnings.push({
          type: 'scope',
          field: `resources[${index}]`,
          message: 'Very broad resource pattern may grant excessive permissions'
        });
      }
    });

    // Warn about policies without conditions
    if (policy.conditions.length === 0) {
      warnings.push({
        type: 'conditions',
        message: 'Policy has no conditions - consider adding time or context restrictions'
      });
    }

    return warnings;
  }

  /**
   * Validate all policies for conflicts
   */
  validateAllPolicies(policies = null) {
    if (!policies) {
      policies = this.policyManager.getPolicies();
    }

    const errors = [];
    const warnings = [];

    // Check for duplicate IDs
    const ids = new Set();
    policies.forEach(policy => {
      if (ids.has(policy.id)) {
        errors.push({
          type: 'conflict',
          field: 'id',
          message: `Duplicate policy ID: ${policy.id}`
        });
      }
      ids.add(policy.id);
    });

    // Check for conflicting policies
    const conflicts = this.detectPolicyConflicts(policies);
    errors.push(...conflicts.errors);
    warnings.push(...conflicts.warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary: {
        totalPolicies: policies.length,
        validPolicies: policies.length - errors.length,
        conflicts: conflicts.errors.length
      }
    };
  }

  /**
   * Detect conflicting policies
   */
  detectPolicyConflicts(policies) {
    const errors = [];
    const warnings = [];

    // Group policies by overlapping criteria
    const policyGroups = this.groupPoliciesByOverlap(policies);

    policyGroups.forEach(group => {
      if (group.length < 2) return;

      // Check for same subjects and resources but different effects
      const allowPolicies = group.filter(p => p.effect === 'allow');
      const denyPolicies = group.filter(p => p.effect === 'deny');

      if (allowPolicies.length > 0 && denyPolicies.length > 0) {
        // Find highest priority policy
        const highestPriority = Math.max(...group.map(p => p.priority));
        const highestPolicies = group.filter(p => p.priority === highestPriority);

        if (highestPolicies.length === 1) {
          const winner = highestPolicies[0];
          const losers = group.filter(p => p.id !== winner.id);

          warnings.push({
            type: 'conflict',
            message: `Policy ${winner.id} (${winner.effect}) overrides ${losers.map(p => p.id).join(', ')} due to higher priority`,
            details: {
              winner: winner.id,
              losers: losers.map(p => p.id),
              priority: winner.priority
            }
          });
        } else {
          errors.push({
            type: 'conflict',
            message: `Multiple policies with same highest priority: ${highestPolicies.map(p => p.id).join(', ')}`,
            details: {
              policies: highestPolicies.map(p => p.id),
              priority: highestPriority
            }
          });
        }
      }
    });

    return { errors, warnings };
  }

  /**
   * Group policies by overlapping criteria
   */
  groupPoliciesByOverlap(policies) {
    const groups = [];

    policies.forEach(policy => {
      let foundGroup = false;

      for (const group of groups) {
        if (this.policiesOverlap(policy, group[0])) {
          group.push(policy);
          foundGroup = true;
          break;
        }
      }

      if (!foundGroup) {
        groups.push([policy]);
      }
    });

    return groups;
  }

  /**
   * Check if two policies have overlapping criteria
   */
  policiesOverlap(policy1, policy2) {
    // Check subject overlap
    const subjectOverlap = this.hasSubjectOverlap(policy1.subjects, policy2.subjects);
    if (!subjectOverlap) return false;

    // Check resource overlap
    const resourceOverlap = this.hasResourceOverlap(policy1.resources, policy2.resources);
    if (!resourceOverlap) return false;

    // Check action overlap
    const actionOverlap = this.hasActionOverlap(policy1.actions, policy2.actions);
    if (!actionOverlap) return false;

    return true;
  }

  /**
   * Check if subject criteria overlap
   */
  hasSubjectOverlap(subjects1, subjects2) {
    for (const s1 of subjects1) {
      for (const s2 of subjects2) {
        if (this.subjectsMatch(s1, s2)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Check if resource criteria overlap
   */
  hasResourceOverlap(resources1, resources2) {
    for (const r1 of resources1) {
      for (const r2 of resources2) {
        if (this.resourcesMatch(r1, r2)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Check if action criteria overlap
   */
  hasActionOverlap(actions1, actions2) {
    return actions1.some(action => actions2.includes(action));
  }

  /**
   * Check if two subjects match
   */
  subjectsMatch(s1, s2) {
    if (s1.type !== s2.type) return false;

    switch (s1.type) {
      case 'user':
      case 'role':
      case 'group':
        return s1.value === s2.value;
      case 'attribute':
        return s1.key === s2.key && s1.value === s2.value;
      case 'authenticated':
      case 'anonymous':
      case 'admin':
        return true; // These are global
      default:
        return false;
    }
  }

  /**
   * Check if two resources match
   */
  resourcesMatch(r1, r2) {
    if (r1.type !== r2.type) return false;

    switch (r1.type) {
      case 'category':
      case 'tag':
      case 'resource-type':
        return r1.value === r2.value;
      case 'page':
      case 'attachment':
      case 'path':
        return this.patternsOverlap(r1.pattern || r1.value, r2.pattern || r2.value);
      default:
        return false;
    }
  }

  /**
   * Check if two patterns overlap
   */
  patternsOverlap(pattern1, pattern2) {
    if (pattern1 === pattern2) return true;
    if (pattern1 === '*' || pattern2 === '*') return true;

    // Simple overlap detection - could be more sophisticated
    return pattern1.includes('*') || pattern2.includes('*') ||
           pattern1.startsWith(pattern2.split('*')[0]) ||
           pattern2.startsWith(pattern1.split('*')[0]);
  }

  /**
   * Validate policy before saving
   */
  async validateAndSavePolicy(policy) {
    const validation = this.validatePolicy(policy);

    if (!validation.isValid) {
      throw new Error(`Policy validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Check for conflicts with existing policies
    const allPolicies = this.policyManager.getPolicies();
    const conflictCheck = this.detectPolicyConflicts([...allPolicies, policy]);

    if (conflictCheck.errors.length > 0) {
      throw new Error(`Policy conflicts detected: ${conflictCheck.errors.map(e => e.message).join(', ')}`);
    }

    // Save the policy
    await this.policyManager.savePolicy(policy);

    // Clear validation cache
    this.clearCache();

    return {
      success: true,
      policy,
      validation,
      conflicts: conflictCheck.warnings
    };
  }

  /**
   * Clear validation cache
   */
  clearCache() {
    this.validationCache.clear();
  }

  /**
   * Get validation statistics
   */
  getStatistics() {
    return {
      cacheSize: this.validationCache.size,
      schemaLoaded: !!this.policySchema,
      validatorReady: !!this.schemaValidatorCompiled
    };
  }
}

module.exports = PolicyValidator;