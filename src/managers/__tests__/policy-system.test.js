/**
 * Policy System Integration Tests
 * Tests the integration of PolicyManager, PolicyEvaluator, and PolicyValidator
 */

const WikiEngine = require('../src/WikiEngine');

describe('Policy System Integration', () => {
  let engine;
  let policyManager;
  let policyEvaluator;
  let policyValidator;
  let aclManager;

  beforeAll(async () => {
    // Create and initialize the WikiEngine
    engine = await WikiEngine.createDefault({
      accessControl: {
        policies: {
          enabled: true
        }
      }
    });

    // Get policy managers
    policyManager = engine.getManager('PolicyManager');
    policyEvaluator = engine.getManager('PolicyEvaluator');
    policyValidator = engine.getManager('PolicyValidator');
    aclManager = engine.getManager('ACLManager');
  });

  afterAll(async () => {
    // Clean up any test policies
    try {
      await policyManager.deletePolicy('test-policy-allow-editors');
      await policyManager.deletePolicy('test-policy-deny-system-pages');
    } catch (error) {
      // Ignore errors during cleanup
    }
  });

  describe('Policy Creation and Validation', () => {
    test('should create a test policy successfully', async () => {
      const testPolicy = {
        id: 'test-policy-allow-editors',
        name: 'Test Policy - Allow Editors',
        description: 'Allows editor role to edit pages',
        priority: 100,
        effect: 'allow',
        subjects: [
          { type: 'role', value: 'editor' }
        ],
        resources: [
          { type: 'page', pattern: '*' }
        ],
        actions: ['view', 'edit'],
        conditions: [],
        metadata: {
          created: new Date().toISOString(),
          author: 'test-system',
          tags: ['test', 'editor']
        }
      };

      const savedPolicy = await policyManager.savePolicy(testPolicy);

      expect(savedPolicy).toBeDefined();
      expect(savedPolicy.id).toBe('test-policy-allow-editors');
      expect(savedPolicy.effect).toBe('allow');
    });

    test('should validate policy successfully', async () => {
      const policy = policyManager.getPolicy('test-policy-allow-editors');
      const validation = policyValidator.validatePolicy(policy);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('Policy Evaluation', () => {
    test('should allow editor to edit pages', async () => {
      const editorContext = {
        user: {
          username: 'test-editor',
          roles: ['editor'],
          isAuthenticated: true
        },
        resource: 'TestPage',
        action: 'edit',
        category: 'General',
        tags: [],
        ip: '192.168.1.100',
        userAgent: 'TestBrowser/1.0',
        timestamp: new Date().toISOString(),
        session: {},
        environment: 'test'
      };

      const result = await policyEvaluator.evaluateAccess(editorContext);

      expect(result.allowed).toBe(true);
      expect(result.reason).toBeDefined();
    });

    test('should deny anonymous user from editing', async () => {
      const anonymousContext = {
        user: null,
        resource: 'TestPage',
        action: 'edit',
        category: 'General',
        tags: [],
        ip: '192.168.1.101',
        userAgent: 'TestBrowser/1.0',
        timestamp: new Date().toISOString(),
        session: {},
        environment: 'test'
      };

      const result = await policyEvaluator.evaluateAccess(anonymousContext);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    test('should allow editor to view pages', async () => {
      const viewContext = {
        user: {
          username: 'test-editor',
          roles: ['editor'],
          isAuthenticated: true
        },
        resource: 'TestPage',
        action: 'view',
        category: 'General',
        tags: [],
        ip: '192.168.1.100',
        userAgent: 'TestBrowser/1.0',
        timestamp: new Date().toISOString(),
        session: {},
        environment: 'test'
      };

      const result = await policyEvaluator.evaluateAccess(viewContext);

      expect(result.allowed).toBe(true);
      expect(result.reason).toBeDefined();
    });
  });

  describe('ACLManager Integration', () => {
    test('should integrate with ACLManager for permission checks', async () => {
      const user = {
        username: 'test-editor',
        roles: ['editor'],
        isAuthenticated: true
      };

      const result = await aclManager.checkPagePermission(
        'TestPage',
        'edit',
        user,
        '# Test Page Content\n\nThis is a test page.',
        {
          ip: '192.168.1.100',
          userAgent: 'TestBrowser/1.0'
        }
      );

      expect(result).toBe(true);
    });
  });

  describe('Policy Priority and Conflicts', () => {
    test('should create high-priority deny policy', async () => {
      const denyPolicy = {
        id: 'test-policy-deny-system-pages',
        name: 'Test Policy - Deny System Pages',
        description: 'Denies access to system pages',
        priority: 200, // Higher priority
        effect: 'deny',
        subjects: [
          { type: 'role', value: 'editor' }
        ],
        resources: [
          { type: 'page', pattern: 'System*' }
        ],
        actions: ['edit'],
        conditions: [],
        metadata: {
          created: new Date().toISOString(),
          author: 'test-system',
          tags: ['test', 'system']
        }
      };

      const savedPolicy = await policyManager.savePolicy(denyPolicy);

      expect(savedPolicy).toBeDefined();
      expect(savedPolicy.id).toBe('test-policy-deny-system-pages');
      expect(savedPolicy.priority).toBe(200);
    });

    test('should deny editor access to system pages due to higher priority deny policy', async () => {
      const systemPageContext = {
        user: {
          username: 'test-editor',
          roles: ['editor'],
          isAuthenticated: true
        },
        resource: 'SystemConfig',
        action: 'edit',
        category: 'System',
        tags: [],
        ip: '192.168.1.100',
        userAgent: 'TestBrowser/1.0',
        timestamp: new Date().toISOString(),
        session: {},
        environment: 'test'
      };

      const result = await policyEvaluator.evaluateAccess(systemPageContext);

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('denied');
    });

    test('should validate all policies without conflicts', async () => {
      const allPolicies = policyManager.getPolicies();
      const allValidation = policyValidator.validateAllPolicies(allPolicies);

      expect(allValidation.isValid).toBe(true);
      expect(allValidation.summary.validPolicies).toBeGreaterThan(0);
      expect(Array.isArray(allValidation.summary.conflicts)).toBe(true);
    });
  });

  describe('Policy Statistics', () => {
    test('should provide policy statistics', () => {
      const stats = policyManager.getStatistics();

      expect(stats.totalPolicies).toBeGreaterThan(0);
      expect(typeof stats.allowPolicies).toBe('number');
      expect(typeof stats.denyPolicies).toBe('number');
      expect(typeof stats.averagePriority).toBe('number');
      expect(typeof stats.cacheSize).toBe('number');
    });

    test('should provide evaluation statistics', () => {
      const evalStats = policyEvaluator.getStatistics();

      expect(evalStats.cacheStats).toBeDefined();
      expect(typeof evalStats.cacheStats.size).toBe('number');
      expect(typeof evalStats.cacheStats.maxSize).toBe('number');
    });
  });
});
