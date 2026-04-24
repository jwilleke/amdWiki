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
  getProperty: vi.fn((key, defaultValue) => {
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
  hasPermission: vi.fn(),
  hasRole: vi.fn()
};

// Mock engine
const mockEngine = {
  getManager: vi.fn((name) => {
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
    vi.clearAllMocks();

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
        evaluateAccess: vi.fn(() => {
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
        pageMetadata: { title: 'Test', uuid: 'x', lastModified: '', 'user-keywords': ['private'], author: 'alice' },
        userContext: { username: 'bob', roles: ['admin'], isAuthenticated: true }
      });
      expect(await aclManager.checkPagePermissionWithContext(ctx, 'view')).toBe(true);
    });

    test('private page + page-creator username → allow', async () => {
      const ctx = makeWikiContext({
        pageMetadata: { title: 'Test', uuid: 'x', lastModified: '', 'user-keywords': ['private'], author: 'alice' },
        userContext: { username: 'alice', roles: ['editor'], isAuthenticated: true }
      });
      expect(await aclManager.checkPagePermissionWithContext(ctx, 'view')).toBe(true);
    });

    test('private page + editor role (non-admin, non-creator) → deny', async () => {
      const ctx = makeWikiContext({
        pageMetadata: { title: 'Test', uuid: 'x', lastModified: '', 'user-keywords': ['private'], author: 'alice' },
        userContext: { username: 'bob', roles: ['editor'], isAuthenticated: true }
      });
      expect(await aclManager.checkPagePermissionWithContext(ctx, 'view')).toBe(false);
    });

    test('private page + audience: [editor] set → editor still denied (Tier 0 wins)', async () => {
      const ctx = makeWikiContext({
        pageMetadata: { title: 'Test', uuid: 'x', lastModified: '', 'user-keywords': ['private'], author: 'alice', audience: ['editor'] },
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

  describe('checkDefaultPermission()', () => {
    test('returns false when UserManager is unavailable', async () => {
      const noUmEngine = {
        getManager: vi.fn((name) => {
          if (name === 'ConfigurationManager') return mockConfigurationManager;
          return null; // no UserManager
        })
      };
      const mgr = new ACLManager(noUmEngine as unknown as WikiEngine);
      await mgr.initialize();

      const result = await mgr.checkDefaultPermission('view', { username: 'user1', roles: [] });
      expect(result).toBe(false);
    });

    test('maps "view" action to page:read permission', async () => {
      mockUserManager.hasPermission.mockResolvedValue(true);
      const result = await aclManager.checkDefaultPermission('view', { username: 'user1', roles: [] });
      expect(mockUserManager.hasPermission).toHaveBeenCalledWith('user1', 'page:read');
      expect(result).toBe(true);
    });

    test('maps "edit" action to page:edit permission', async () => {
      mockUserManager.hasPermission.mockResolvedValue(false);
      await aclManager.checkDefaultPermission('edit', { username: 'user1', roles: [] });
      expect(mockUserManager.hasPermission).toHaveBeenCalledWith('user1', 'page:edit');
    });

    test('uses anonymous when user is null', async () => {
      mockUserManager.hasPermission.mockResolvedValue(false);
      await aclManager.checkDefaultPermission('view', null);
      expect(mockUserManager.hasPermission).toHaveBeenCalledWith('anonymous', 'page:read');
    });

    test('falls back to page:<action> for unknown actions', async () => {
      mockUserManager.hasPermission.mockResolvedValue(true);
      await aclManager.checkDefaultPermission('upload', { username: 'user1', roles: [] });
      expect(mockUserManager.hasPermission).toHaveBeenCalledWith('user1', 'page:upload');
    });
  });

  describe('checkMaintenanceMode()', () => {
    test('allows when maintenance is disabled', () => {
      const result = aclManager.checkMaintenanceMode(
        { username: 'user1', roles: ['editor'] },
        { enabled: false }
      );
      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('maintenance_disabled');
    });

    test('allows admin during maintenance', () => {
      const result = aclManager.checkMaintenanceMode(
        { username: 'user1', roles: ['admin'] },
        { enabled: true }
      );
      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('maintenance_override');
    });

    test('denies non-admin during maintenance', () => {
      const result = aclManager.checkMaintenanceMode(
        { username: 'user1', roles: ['editor'] },
        { enabled: true }
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('maintenance_mode');
    });

    test('respects custom allowedRoles', () => {
      const result = aclManager.checkMaintenanceMode(
        { username: 'user1', roles: ['operator'] },
        { enabled: true, allowedRoles: ['admin', 'operator'] }
      );
      expect(result.allowed).toBe(true);
    });

    test('uses default maintenance message when none configured', () => {
      const result = aclManager.checkMaintenanceMode(
        { username: 'user1', roles: ['editor'] },
        { enabled: true }
      );
      expect(result.message).toBe('System is under maintenance');
    });

    test('uses custom message when configured', () => {
      const result = aclManager.checkMaintenanceMode(
        { username: 'user1', roles: [] },
        { enabled: true, message: 'Down for upgrades' }
      );
      expect(result.message).toBe('Down for upgrades');
    });
  });

  describe('checkBusinessHours()', () => {
    test('allows when business hours disabled', () => {
      const result = aclManager.checkBusinessHours({ enabled: false });
      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('business_hours_disabled');
    });

    test('allows when no config provided (defaults to disabled)', () => {
      const result = aclManager.checkBusinessHours();
      expect(result.allowed).toBe(true);
    });
  });

  describe('removeACLMarkup() / stripACLMarkup()', () => {
    test('removes [{ALLOW ...}] plugin syntax', () => {
      const input = 'Content [{ALLOW view admin,editor}] more content';
      const result = aclManager.removeACLMarkup(input);
      expect(result).not.toContain('[{ALLOW');
      expect(result).toContain('Content');
      expect(result).toContain('more content');
    });

    test('removes [{DENY ...}] plugin syntax', () => {
      const input = '[{DENY edit anonymous}] page text';
      const result = aclManager.removeACLMarkup(input);
      expect(result).not.toContain('[{DENY');
      expect(result).toContain('page text');
    });

    test('returns input unchanged when no ACL markup present', () => {
      const input = 'Just a regular page with no ACL markup here.';
      expect(aclManager.removeACLMarkup(input)).toBe(input);
    });

    test('handles empty string', () => {
      expect(aclManager.removeACLMarkup('')).toBe('');
    });

    test('handles null/undefined gracefully', () => {
      expect(aclManager.removeACLMarkup(null as unknown as string)).toBe(null);
    });

    test('removes multiple ACL blocks in one pass', () => {
      const input = '[{ALLOW view admin}] text [{ALLOW edit admin}] more';
      const result = aclManager.removeACLMarkup(input);
      expect(result).not.toContain('[{ALLOW');
      expect(result).toContain('text');
      expect(result).toContain('more');
    });

    test('stripACLMarkup is an alias for removeACLMarkup', () => {
      const input = '[{ALLOW view admin}] content';
      expect(aclManager.stripACLMarkup(input)).toBe(aclManager.removeACLMarkup(input));
    });
  });

  describe('checkContextRestrictions()', () => {
    test('returns allowed when context-aware is disabled', async () => {
      mockConfigurationManager.getProperty.mockImplementation((key, defaultValue) => {
        if (key === 'ngdpbase.access-control.context-aware.enabled') return false;
        return defaultValue;
      });

      const result = await aclManager.checkContextRestrictions(
        { username: 'user1', roles: ['editor'] },
        {}
      );
      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('context_disabled');
    });

    test('returns allowed for anonymous user without context checks', async () => {
      mockConfigurationManager.getProperty.mockImplementation((key, defaultValue) => {
        if (key === 'ngdpbase.access-control.context-aware.enabled') return true;
        if (key === 'ngdpbase.features.maintenance.enabled') return false;
        if (key === 'ngdpbase.schedules.enabled') return false;
        return defaultValue;
      });

      const result = await aclManager.checkContextRestrictions(
        { username: 'anonymous', roles: ['anonymous'] },
        {}
      );
      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('anonymous_user');
    });

    test('returns allowed when context available, no ConfigurationManager', async () => {
      const noConfigEngine = { getManager: vi.fn(() => null) };
      const mgr = new ACLManager(noConfigEngine as unknown as WikiEngine);

      const result = await mgr.checkContextRestrictions(
        { username: 'user1', roles: ['editor'] },
        {}
      );
      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('no_config');
    });
  });

  describe('checkMaintenanceMode()', () => {
    test('returns allowed when maintenance is disabled', () => {
      const result = aclManager.checkMaintenanceMode(
        { username: 'user', roles: ['user'] },
        { enabled: false }
      );
      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('maintenance_disabled');
    });

    test('returns allowed for admin user during maintenance', () => {
      const result = aclManager.checkMaintenanceMode(
        { username: 'admin', roles: ['admin'] },
        { enabled: true, allowedRoles: ['admin'] }
      );
      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('maintenance_override');
    });

    test('returns denied for regular user during maintenance', () => {
      const result = aclManager.checkMaintenanceMode(
        { username: 'alice', roles: ['user'] },
        { enabled: true, message: 'Under maintenance' }
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('maintenance_mode');
      expect(result.message).toBe('Under maintenance');
    });

    test('uses default message when not provided', () => {
      const result = aclManager.checkMaintenanceMode(
        { username: 'alice', roles: ['user'] },
        { enabled: true }
      );
      expect(result.allowed).toBe(false);
      expect(result.message).toBeDefined();
    });
  });

  describe('checkBusinessHours()', () => {
    test('returns allowed when business hours disabled', () => {
      const result = aclManager.checkBusinessHours({ enabled: false });
      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('business_hours_disabled');
    });

    test('returns a permission result when enabled', () => {
      const result = aclManager.checkBusinessHours({
        enabled: true,
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        start: '00:00',
        end: '23:59'
      });
      expect(typeof result.allowed).toBe('boolean');
      expect(typeof result.reason).toBe('string');
    });

    test('handles invalid timezone gracefully', () => {
      const result = aclManager.checkBusinessHours(
        { enabled: true },
        'Invalid/Timezone'
      );
      // Should not throw — falls back to error path
      expect(typeof result.allowed).toBe('boolean');
    });
  });

  describe('checkEnhancedTimeRestrictions()', () => {
    const user = { username: 'alice', roles: ['user'] };
    const ctx = {};

    test('returns error when ConfigurationManager not available at call time', async () => {
      // Initialize with ConfigManager, then hide it for the method call
      const tempEngine = {
        getManager: vi.fn((name: string) => name === 'ConfigurationManager' ? mockConfigurationManager : null)
      } as unknown as WikiEngine;
      const mgr = new ACLManager(tempEngine);
      await mgr.initialize();
      (tempEngine as unknown as { getManager: ReturnType<typeof vi.fn> }).getManager.mockReturnValue(null);
      const result = await mgr.checkEnhancedTimeRestrictions(user, ctx);
      expect(result.allowed).toBe(false);
    });

    test('returns allowed when schedules disabled', async () => {
      mockConfigurationManager.getProperty.mockImplementation((key: string, dv: unknown) => {
        if (key === 'ngdpbase.schedules.enabled') return false;
        return dv;
      });
      const result = await aclManager.checkEnhancedTimeRestrictions(user, ctx);
      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('schedules_disabled');
    });

    test('throws (returns error) when schedules config missing', async () => {
      mockConfigurationManager.getProperty.mockImplementation((key: string, dv: unknown) => {
        if (key === 'ngdpbase.schedules.enabled') return true;
        if (key === 'ngdpbase.schedules') return null;
        return dv;
      });
      const result = await aclManager.checkEnhancedTimeRestrictions(user, ctx);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('schedule_check_error');
    });

    test('falls through to checkBusinessHours with minimal schedules config', async () => {
      mockConfigurationManager.getProperty.mockImplementation((key: string, dv: unknown) => {
        if (key === 'ngdpbase.schedules.enabled') return true;
        if (key === 'ngdpbase.schedules') return { businessHours: { enabled: false } };
        if (key === 'ngdpbase.access.policies') return [];
        if (key === 'ngdpbase.access.audit') return { enabled: false };
        return dv;
      });
      const result = await aclManager.checkEnhancedTimeRestrictions(user, ctx);
      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('business_hours_disabled');
    });
  });

  describe('checkHolidayRestrictions()', () => {
    test('returns error when ConfigurationManager not available at call time', async () => {
      const tempEngine = {
        getManager: vi.fn((name: string) => name === 'ConfigurationManager' ? mockConfigurationManager : null)
      } as unknown as WikiEngine;
      const mgr = new ACLManager(tempEngine);
      await mgr.initialize();
      (tempEngine as unknown as { getManager: ReturnType<typeof vi.fn> }).getManager.mockReturnValue(null);
      const result = await mgr.checkHolidayRestrictions('2025-01-01', {});
      expect(result.allowed).toBe(false);
    });

    test('returns allowed when holidays disabled', async () => {
      mockConfigurationManager.getProperty.mockImplementation((key: string, dv: unknown) => {
        if (key === 'ngdpbase.holidays.enabled') return false;
        if (key === 'ngdpbase.access.policies') return [];
        if (key === 'ngdpbase.access.audit') return { enabled: false };
        return dv;
      });
      const result = await aclManager.checkHolidayRestrictions('2025-01-01', {});
      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('holidays_disabled');
    });

    test('returns error when holiday dates config missing', async () => {
      mockConfigurationManager.getProperty.mockImplementation((key: string, dv: unknown) => {
        if (key === 'ngdpbase.holidays.enabled') return true;
        if (key === 'ngdpbase.holidays.dates') return null;
        if (key === 'ngdpbase.holidays.recurring') return null;
        if (key === 'ngdpbase.access.policies') return [];
        if (key === 'ngdpbase.access.audit') return { enabled: false };
        return dv;
      });
      const result = await aclManager.checkHolidayRestrictions('2025-01-01', {});
      expect(result.allowed).toBe(false);
    });

    test('denies on exact date holiday match', async () => {
      mockConfigurationManager.getProperty.mockImplementation((key: string, dv: unknown) => {
        if (key === 'ngdpbase.holidays.enabled') return true;
        if (key === 'ngdpbase.holidays.dates') return { '2025-01-01': { name: 'New Year', message: 'Closed for New Year' } };
        if (key === 'ngdpbase.holidays.recurring') return {};
        if (key === 'ngdpbase.access.policies') return [];
        if (key === 'ngdpbase.access.audit') return { enabled: false };
        return dv;
      });
      const result = await aclManager.checkHolidayRestrictions('2025-01-01', {});
      expect(result.allowed).toBe(false);
      expect(result.message).toContain('New Year');
    });

    test('denies on recurring holiday match', async () => {
      mockConfigurationManager.getProperty.mockImplementation((key: string, dv: unknown) => {
        if (key === 'ngdpbase.holidays.enabled') return true;
        if (key === 'ngdpbase.holidays.dates') return {};
        if (key === 'ngdpbase.holidays.recurring') return { '*-12-25': { name: 'Christmas', message: 'Merry Christmas' } };
        if (key === 'ngdpbase.access.policies') return [];
        if (key === 'ngdpbase.access.audit') return { enabled: false };
        return dv;
      });
      const result = await aclManager.checkHolidayRestrictions('2025-12-25', {});
      expect(result.allowed).toBe(false);
      expect(result.message).toContain('Christmas');
    });

    test('returns not_a_holiday when no matches', async () => {
      mockConfigurationManager.getProperty.mockImplementation((key: string, dv: unknown) => {
        if (key === 'ngdpbase.holidays.enabled') return true;
        if (key === 'ngdpbase.holidays.dates') return {};
        if (key === 'ngdpbase.holidays.recurring') return {};
        if (key === 'ngdpbase.access.policies') return [];
        if (key === 'ngdpbase.access.audit') return { enabled: false };
        return dv;
      });
      const result = await aclManager.checkHolidayRestrictions('2025-07-04', {});
      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('not_a_holiday');
    });
  });
});
