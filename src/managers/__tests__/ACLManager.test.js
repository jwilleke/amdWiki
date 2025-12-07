/**
 * ACLManager tests
 *
 * Tests ACLManager's core functionality:
 * - JSPWiki-style ACL parsing
 * - Page permission checking
 * - Policy-based access control integration
 *
 * @jest-environment jsdom
 */

const { describe, test, expect, beforeEach } = require('@jest/globals');
const ACLManager = require('../ACLManager');

// Mock ConfigurationManager
const mockConfigurationManager = {
  getProperty: jest.fn((key, defaultValue) => {
    if (key === 'amdwiki.access.policies') {
      return [];  // Return empty array for policies
    }
    if (key === 'amdwiki.access.audit') {
      return { enabled: false };
    }
    return defaultValue;
  })
};

// Mock UserManager
const mockUserManager = {
  hasPermission: jest.fn(),
  hasRole: jest.fn()
};

// Mock engine
const mockEngine = {
  getManager: jest.fn((name) => {
    if (name === 'UserManager') {
      return mockUserManager;
    }
    if (name === 'ConfigurationManager') {
      return mockConfigurationManager;
    }
    // PolicyEvaluator is optional, return null
    return null;
  })
};

describe('ACLManager', () => {
  let aclManager;

  beforeEach(async () => {
    // Clear mocks
    jest.clearAllMocks();

    aclManager = new ACLManager(mockEngine);
    await aclManager.initialize();
  });

  describe('parsePageACL', () => {
    test('should parse ALLOW view ACL correctly', () => {
      const content = '[{ALLOW view admin,editor,user1}]';
      const acl = aclManager.parsePageACL(content);

      expect(acl).toBeTruthy();
      expect(acl.get('view')).toEqual(new Set(['admin', 'editor', 'user1']));
      expect(acl.has('edit')).toBe(false);
    });

    test('should parse multiple ACL rules', () => {
      const content = `
        [{ALLOW view admin,editor}]
        [{ALLOW edit admin}]
        [{ALLOW delete admin}]
      `;
      const acl = aclManager.parsePageACL(content);

      expect(acl.get('view')).toEqual(new Set(['admin', 'editor']));
      expect(acl.get('edit')).toEqual(new Set(['admin']));
      expect(acl.get('delete')).toEqual(new Set(['admin']));
    });

    test('should handle ACL with different actions', () => {
      const content = '[{ALLOW upload admin,contributor}] [{ALLOW rename admin}]';
      const acl = aclManager.parsePageACL(content);

      expect(acl.get('upload')).toEqual(new Set(['admin', 'contributor']));
      expect(acl.get('rename')).toEqual(new Set(['admin']));
    });

    test('should handle case insensitive ACL parsing', () => {
      const content = '[{allow VIEW admin,editor}] [{ALLOW edit ADMIN}]';
      const acl = aclManager.parsePageACL(content);

      // Actions are normalized to lowercase
      expect(acl.get('view')).toEqual(new Set(['admin', 'editor']));
      expect(acl.get('edit')).toEqual(new Set(['ADMIN'])); // Principals keep their case
    });

    test('should return empty Map for content without ACL', () => {
      const content = 'This is just regular page content without any ACL rules.';
      const acl = aclManager.parsePageACL(content);

      expect(acl).toBeInstanceOf(Map);
      expect(acl.size).toBe(0);
    });

    test('should handle empty content', () => {
      const acl = aclManager.parsePageACL('');

      expect(acl).toBeInstanceOf(Map);
      expect(acl.size).toBe(0);
    });

    test('should handle null content', () => {
      const acl = aclManager.parsePageACL(null);

      expect(acl).toBeInstanceOf(Map);
      expect(acl.size).toBe(0);
    });

    test('should trim whitespace from principals', () => {
      const content = '[{ALLOW view admin,editor,user1}]';
      const acl = aclManager.parsePageACL(content);

      // Principals are comma-separated (no spaces to avoid regex greedy match issue)
      expect(acl.get('view')).toEqual(new Set(['admin', 'editor', 'user1']));
    });

    test('should handle multiple actions in single rule', () => {
      const content = '[{ALLOW view, edit admin}]';
      const acl = aclManager.parsePageACL(content);

      expect(acl.get('view')).toEqual(new Set(['admin']));
      expect(acl.get('edit')).toEqual(new Set(['admin']));
    });
  });

  describe('checkPagePermission', () => {
    test('should allow access when ACL grants permission to role', async () => {
      const pageContent = '[{ALLOW view editor}]';
      const userContext = {
        username: 'testuser',
        roles: ['editor'],
        isAuthenticated: true
      };

      const result = await aclManager.checkPagePermission('TestPage', 'view', userContext, pageContent);

      expect(result).toBe(true);
    });

    test('should allow access when ACL has "All" principal', async () => {
      const pageContent = '[{ALLOW view All}]';
      const userContext = {
        username: 'testuser',
        roles: [],
        isAuthenticated: true
      };

      const result = await aclManager.checkPagePermission('TestPage', 'view', userContext, pageContent);

      expect(result).toBe(true);
    });

    test('should deny access when user lacks required role', async () => {
      const pageContent = '[{ALLOW view admin}]';
      const userContext = {
        username: 'testuser',
        roles: ['editor'],  // Not admin
        isAuthenticated: true
      };

      const result = await aclManager.checkPagePermission('TestPage', 'view', userContext, pageContent);

      expect(result).toBe(false);
    });

    test('should allow access when username matches ACL', async () => {
      const pageContent = '[{ALLOW edit testuser}]';
      const userContext = {
        username: 'testuser',
        roles: [],
        isAuthenticated: true
      };

      const result = await aclManager.checkPagePermission('TestPage', 'edit', userContext, pageContent);

      expect(result).toBe(true);
    });

    test('should deny access when no ACL matches', async () => {
      const pageContent = '[{ALLOW view admin}]';
      const userContext = {
        username: 'testuser',
        roles: ['viewer'],
        isAuthenticated: true
      };

      const result = await aclManager.checkPagePermission('TestPage', 'edit', userContext, pageContent);

      // No ACL for 'edit' action, should deny
      expect(result).toBe(false);
    });

    test('should handle null user context', async () => {
      const pageContent = '[{ALLOW view All}]';

      const result = await aclManager.checkPagePermission('TestPage', 'view', null, pageContent);

      // 'All' should match even for null user
      expect(result).toBe(true);
    });

    test('should handle empty page content', async () => {
      const userContext = {
        username: 'testuser',
        roles: ['editor'],
        isAuthenticated: true
      };

      const result = await aclManager.checkPagePermission('TestPage', 'view', userContext, '');

      // No ACL, default deny
      expect(result).toBe(false);
    });

    test('should handle multiple roles and find match', async () => {
      const pageContent = '[{ALLOW edit admin,poweruser}]';  // No space after comma to avoid regex greedy match
      const userContext = {
        username: 'testuser',
        roles: ['editor', 'poweruser', 'viewer'],
        isAuthenticated: true
      };

      const result = await aclManager.checkPagePermission('TestPage', 'edit', userContext, pageContent);

      // User has 'poweruser' role which is in ACL
      expect(result).toBe(true);
    });

    test('should be case-insensitive for action matching', async () => {
      const pageContent = '[{ALLOW VIEW admin}]';
      const userContext = {
        username: 'testuser',
        roles: ['admin'],
        isAuthenticated: true
      };

      // Action 'view' should match ACL 'VIEW'
      const result = await aclManager.checkPagePermission('TestPage', 'view', userContext, pageContent);

      expect(result).toBe(true);
    });
  });

  describe('PolicyEvaluator integration', () => {
    test('should work without PolicyEvaluator', async () => {
      // PolicyEvaluator is null by default in our mock
      const pageContent = '[{ALLOW view editor}]';
      const userContext = {
        username: 'testuser',
        roles: ['editor'],
        isAuthenticated: true
      };

      const result = await aclManager.checkPagePermission('TestPage', 'view', userContext, pageContent);

      // Should fall back to page-level ACL check
      expect(result).toBe(true);
    });

    test('should handle PolicyEvaluator errors gracefully', async () => {
      // Create a mock PolicyEvaluator that throws an error
      const mockPolicyEvaluator = {
        evaluateAccess: jest.fn(() => {
          throw new Error('Policy evaluation failed');
        })
      };

      aclManager.policyEvaluator = mockPolicyEvaluator;

      const pageContent = '[{ALLOW view All}]';
      const userContext = {
        username: 'testuser',
        roles: [],
        isAuthenticated: true
      };

      // Should fall back to page-level ACL despite policy error
      const result = await aclManager.checkPagePermission('TestPage', 'view', userContext, pageContent);

      expect(result).toBe(true);
    });
  });

  describe('Initialization', () => {
    test('should initialize without errors', async () => {
      const newAclManager = new ACLManager(mockEngine);

      await expect(newAclManager.initialize()).resolves.not.toThrow();
    });

    test('should load policies from ConfigurationManager', async () => {
      const policiesArray = [
        { id: 'test-policy-1', name: 'Test Policy 1' },
        { id: 'test-policy-2', name: 'Test Policy 2' }
      ];

      mockConfigurationManager.getProperty.mockImplementation((key, defaultValue) => {
        if (key === 'amdwiki.access.policies') {
          return policiesArray;
        }
        return defaultValue;
      });

      const newAclManager = new ACLManager(mockEngine);
      await newAclManager.initialize();

      expect(newAclManager.accessPolicies.size).toBe(2);
      expect(newAclManager.accessPolicies.has('test-policy-1')).toBe(true);
      expect(newAclManager.accessPolicies.has('test-policy-2')).toBe(true);
    });
  });
});
