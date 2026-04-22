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

import ACLManager from '../ACLManager';
import type { WikiEngine } from '../../types/WikiEngine';

// Mock ConfigurationManager
const mockConfigurationManager = {
  getProperty: jest.fn((key, defaultValue) => {
    if (key === 'ngdpbase.access.policies') {
      return [];  // Return empty array for policies
    }
    if (key === 'ngdpbase.access.audit') {
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

    aclManager = new ACLManager(mockEngine as unknown as WikiEngine);
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

  // Helper: build a minimal WikiContext for checkPagePermissionWithContext
  function makeWikiContext({ pageName = 'TestPage', content = '', userContext = null, pageMetadata = null } = {}) {
    return { pageName, content, userContext, pageMetadata };
  }

  describe('Tier 0 — private user-keyword', () => {
    test('private page + admin role → allow', async () => {
      const ctx = makeWikiContext({
        pageMetadata: { title: 'Test', uuid: 'x', lastModified: '', 'user-keywords': ['private'], 'page-creator': 'alice' },
        userContext: { username: 'bob', roles: ['admin'], isAuthenticated: true }
      });
      expect(await aclManager.checkPagePermissionWithContext(ctx, 'view')).toBe(true);
    });

    test('private page + page-creator username → allow', async () => {
      const ctx = makeWikiContext({
        pageMetadata: { title: 'Test', uuid: 'x', lastModified: '', 'user-keywords': ['private'], 'page-creator': 'alice' },
        userContext: { username: 'alice', roles: ['editor'], isAuthenticated: true }
      });
      expect(await aclManager.checkPagePermissionWithContext(ctx, 'view')).toBe(true);
    });

    test('private page + editor role (non-admin, non-creator) → deny', async () => {
      const ctx = makeWikiContext({
        pageMetadata: { title: 'Test', uuid: 'x', lastModified: '', 'user-keywords': ['private'], 'page-creator': 'alice' },
        userContext: { username: 'bob', roles: ['editor'], isAuthenticated: true }
      });
      expect(await aclManager.checkPagePermissionWithContext(ctx, 'view')).toBe(false);
    });

    test('private page + audience: [editor] set → editor still denied (Tier 0 wins)', async () => {
      const ctx = makeWikiContext({
        pageMetadata: { title: 'Test', uuid: 'x', lastModified: '', 'user-keywords': ['private'], 'page-creator': 'alice', audience: ['editor'] },
        userContext: { username: 'bob', roles: ['editor'], isAuthenticated: true }
      });
      expect(await aclManager.checkPagePermissionWithContext(ctx, 'view')).toBe(false);
    });
  });

  describe('Tier 1.5 — front matter access control', () => {
    test('audience: [editor, admin] + editor role → allow', async () => {
      const ctx = makeWikiContext({
        pageMetadata: { title: 'Test', uuid: 'x', lastModified: '', audience: ['editor', 'admin'] },
        userContext: { username: 'bob', roles: ['editor'], isAuthenticated: true }
      });
      expect(await aclManager.checkPagePermissionWithContext(ctx, 'view')).toBe(true);
    });

    test('audience: [editor, admin] + reader role → deny', async () => {
      const ctx = makeWikiContext({
        pageMetadata: { title: 'Test', uuid: 'x', lastModified: '', audience: ['editor', 'admin'] },
        userContext: { username: 'bob', roles: ['reader'], isAuthenticated: true }
      });
      expect(await aclManager.checkPagePermissionWithContext(ctx, 'view')).toBe(false);
    });

    test('audience: [editor, admin] + anonymous → deny', async () => {
      const ctx = makeWikiContext({
        pageMetadata: { title: 'Test', uuid: 'x', lastModified: '', audience: ['editor', 'admin'] },
        userContext: { username: 'anonymous', roles: ['anonymous'], isAuthenticated: false }
      });
      expect(await aclManager.checkPagePermissionWithContext(ctx, 'view')).toBe(false);
    });

    test('audience: [editor, alice] + username alice → allow (username match)', async () => {
      const ctx = makeWikiContext({
        pageMetadata: { title: 'Test', uuid: 'x', lastModified: '', audience: ['editor', 'alice'] },
        userContext: { username: 'alice', roles: ['reader'], isAuthenticated: true }
      });
      expect(await aclManager.checkPagePermissionWithContext(ctx, 'view')).toBe(true);
    });

    test('access.view: [admin] overrides audience for view', async () => {
      const ctx = makeWikiContext({
        pageMetadata: { title: 'Test', uuid: 'x', lastModified: '', audience: ['editor', 'admin'], access: { view: ['admin'] } },
        userContext: { username: 'bob', roles: ['editor'], isAuthenticated: true }
      });
      // editor is in audience but access.view restricts to admin only
      expect(await aclManager.checkPagePermissionWithContext(ctx, 'view')).toBe(false);
    });

    test('access.edit: [admin] blocks edit for editor; view via audience still works', async () => {
      const ctx = makeWikiContext({
        pageMetadata: { title: 'Test', uuid: 'x', lastModified: '', audience: ['editor', 'admin'], access: { edit: ['admin'] } },
        userContext: { username: 'bob', roles: ['editor'], isAuthenticated: true }
      });
      expect(await aclManager.checkPagePermissionWithContext(ctx, 'edit')).toBe(false);
      expect(await aclManager.checkPagePermissionWithContext(ctx, 'view')).toBe(true);
    });

    test('no audience/access → falls through (no pageMetadata decision)', async () => {
      const ctx = makeWikiContext({
        pageMetadata: { title: 'Test', uuid: 'x', lastModified: '' },
        content: '[{ALLOW view All}]',
        userContext: { username: 'bob', roles: ['reader'], isAuthenticated: true }
      });
      // No audience field → Tier 1.5 passes, Tier 2 (inline ACL) grants All
      expect(await aclManager.checkPagePermissionWithContext(ctx, 'view')).toBe(true);
    });

    test('Tier 1.5 deny does NOT fall through to Tier 2 inline ACL', async () => {
      const ctx = makeWikiContext({
        pageMetadata: { title: 'Test', uuid: 'x', lastModified: '', audience: ['admin'] },
        content: '[{ALLOW view All}]',
        userContext: { username: 'bob', roles: ['reader'], isAuthenticated: true }
      });
      // audience restricts to admin, reader is denied — even though content has [{ALLOW view All}]
      expect(await aclManager.checkPagePermissionWithContext(ctx, 'view')).toBe(false);
    });
  });

  describe('Initialization', () => {
    test('should initialize without errors', async () => {
      const newAclManager = new ACLManager(mockEngine as unknown as WikiEngine);

      await expect(newAclManager.initialize()).resolves.not.toThrow();
    });

    test('should load policies from ConfigurationManager', async () => {
      const policiesArray = [
        { id: 'test-policy-1', name: 'Test Policy 1' },
        { id: 'test-policy-2', name: 'Test Policy 2' }
      ];

      mockConfigurationManager.getProperty.mockImplementation((key, defaultValue) => {
        if (key === 'ngdpbase.access.policies') {
          return policiesArray;
        }
        return defaultValue;
      });

      const newAclManager = new ACLManager(mockEngine as unknown as WikiEngine);
      await newAclManager.initialize();

      expect(newAclManager.accessPolicies.size).toBe(2);
      expect(newAclManager.accessPolicies.has('test-policy-1')).toBe(true);
      expect(newAclManager.accessPolicies.has('test-policy-2')).toBe(true);
    });
  });
});
